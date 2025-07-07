from flask import render_template, request, redirect, url_for, flash, abort, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash
from urllib.parse import urlparse
import logging

from app import app, db
from models import User, Website, Review, Complaint, Advice, Vote
from forms import (LoginForm, RegisterForm, ReviewForm, ComplaintForm, 
                  AdviceForm, SearchForm, WebsiteForm)
from utils import normalize_domain, is_valid_domain, fetch_website_info, detect_bot_content

@app.route('/')
def index():
    search_form = SearchForm()
    recent_reviews = Review.query.filter_by(is_bot=False).order_by(Review.created_at.desc()).limit(5).all()
    recent_complaints = Complaint.query.filter_by(is_bot=False).order_by(Complaint.created_at.desc()).limit(3).all()
    recent_advice = Advice.query.filter_by(is_bot=False).order_by(Advice.created_at.desc()).limit(3).all()
    
    return render_template('index.html', 
                         search_form=search_form,
                         recent_reviews=recent_reviews,
                         recent_complaints=recent_complaints,
                         recent_advice=recent_advice)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and user.check_password(form.password.data):
            login_user(user)
            next_page = request.args.get('next')
            flash('Logged in successfully!', 'success')
            return redirect(next_page) if next_page else redirect(url_for('index'))
        flash('Invalid username or password', 'error')
    
    return render_template('auth/login.html', form=form)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    form = RegisterForm()
    if form.validate_on_submit():
        # Check if username or email already exists
        if User.query.filter_by(username=form.username.data).first():
            flash('Username already exists', 'error')
            return render_template('auth/register.html', form=form)
        
        if User.query.filter_by(email=form.email.data).first():
            flash('Email already registered', 'error')
            return render_template('auth/register.html', form=form)
        
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful! You can now log in.', 'success')
        return redirect(url_for('login'))
    
    return render_template('auth/register.html', form=form)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))

@app.route('/back/<path:domain>')
def website_back(domain):
    # Normalize the domain
    normalized_domain = normalize_domain(domain)
    if not normalized_domain or not is_valid_domain(normalized_domain):
        flash('Invalid domain name', 'error')
        return redirect(url_for('index'))
    
    # Get or create website
    website = Website.query.filter_by(domain=normalized_domain).first()
    if not website:
        # Fetch website info
        website_info = fetch_website_info(normalized_domain)
        website = Website(
            domain=normalized_domain,
            title=website_info['title'] if website_info else normalized_domain,
            description=website_info['description'] if website_info else ''
        )
        db.session.add(website)
        db.session.commit()
    
    # Get content for this website
    reviews = Review.query.filter_by(website_id=website.id, is_bot=False).order_by(Review.created_at.desc()).all()
    complaints = Complaint.query.filter_by(website_id=website.id, is_bot=False).order_by(Complaint.created_at.desc()).all()
    advice = Advice.query.filter_by(website_id=website.id, is_bot=False).order_by(Advice.created_at.desc()).all()
    
    return render_template('website/back.html', 
                         website=website,
                         reviews=reviews,
                         complaints=complaints,
                         advice=advice)

@app.route('/search')
def search():
    form = SearchForm()
    results = []
    
    if request.args.get('query'):
        query = request.args.get('query').strip()
        if query:
            # Search websites by domain or title
            results = Website.query.filter(
                db.or_(
                    Website.domain.contains(query),
                    Website.title.contains(query)
                )
            ).limit(20).all()
    
    return render_template('website/search.html', form=form, results=results, query=request.args.get('query', ''))

@app.route('/add_review/<int:website_id>', methods=['GET', 'POST'])
@login_required
def add_review(website_id):
    website = Website.query.get_or_404(website_id)
    form = ReviewForm()
    form.website_id.data = website_id
    
    if form.validate_on_submit():
        # Bot detection
        is_bot = detect_bot_content(form.content.data)
        
        review = Review(
            user_id=current_user.id,
            website_id=website_id,
            title=form.title.data,
            content=form.content.data,
            rating=int(form.rating.data),
            is_bot=is_bot
        )
        db.session.add(review)
        db.session.commit()
        
        # Update user credibility
        current_user.calculate_credibility()
        
        flash('Review added successfully!', 'success')
        return redirect(url_for('website_back', domain=website.domain))
    
    return render_template('content/add_review.html', form=form, website=website)

@app.route('/add_complaint/<int:website_id>', methods=['GET', 'POST'])
@login_required
def add_complaint(website_id):
    website = Website.query.get_or_404(website_id)
    form = ComplaintForm()
    form.website_id.data = website_id
    
    if form.validate_on_submit():
        # Bot detection
        is_bot = detect_bot_content(form.content.data)
        
        complaint = Complaint(
            user_id=current_user.id,
            website_id=website_id,
            title=form.title.data,
            content=form.content.data,
            category=form.category.data,
            is_bot=is_bot
        )
        db.session.add(complaint)
        db.session.commit()
        
        # Update user credibility
        current_user.calculate_credibility()
        
        flash('Complaint submitted successfully!', 'success')
        return redirect(url_for('website_back', domain=website.domain))
    
    return render_template('content/add_complaint.html', form=form, website=website)

@app.route('/add_advice/<int:website_id>', methods=['GET', 'POST'])
@login_required
def add_advice(website_id):
    website = Website.query.get_or_404(website_id)
    form = AdviceForm()
    form.website_id.data = website_id
    
    if form.validate_on_submit():
        # Bot detection
        is_bot = detect_bot_content(form.content.data)
        
        advice = Advice(
            user_id=current_user.id,
            website_id=website_id,
            title=form.title.data,
            content=form.content.data,
            category=form.category.data,
            is_bot=is_bot
        )
        db.session.add(advice)
        db.session.commit()
        
        # Update user credibility
        current_user.calculate_credibility()
        
        flash('Advice shared successfully!', 'success')
        return redirect(url_for('website_back', domain=website.domain))
    
    return render_template('content/add_advice.html', form=form, website=website)

@app.route('/vote', methods=['POST'])
@login_required
def vote():
    content_type = request.form.get('content_type')
    content_id = request.form.get('content_id')
    vote_value = int(request.form.get('vote_value'))
    
    if content_type not in ['review', 'complaint', 'advice'] or vote_value not in [1, -1]:
        return jsonify({'error': 'Invalid vote'}), 400
    
    # Check if user already voted
    existing_vote = None
    if content_type == 'review':
        existing_vote = Vote.query.filter_by(user_id=current_user.id, review_id=content_id).first()
    elif content_type == 'complaint':
        existing_vote = Vote.query.filter_by(user_id=current_user.id, complaint_id=content_id).first()
    elif content_type == 'advice':
        existing_vote = Vote.query.filter_by(user_id=current_user.id, advice_id=content_id).first()
    
    if existing_vote:
        if existing_vote.value == vote_value:
            # Remove vote if clicking same button
            db.session.delete(existing_vote)
        else:
            # Change vote
            existing_vote.value = vote_value
    else:
        # Create new vote
        vote_data = {'user_id': current_user.id, 'value': vote_value}
        if content_type == 'review':
            vote_data['review_id'] = content_id
        elif content_type == 'complaint':
            vote_data['complaint_id'] = content_id
        elif content_type == 'advice':
            vote_data['advice_id'] = content_id
        
        new_vote = Vote(**vote_data)
        db.session.add(new_vote)
    
    db.session.commit()
    return jsonify({'success': True})

@app.route('/profile/<username>')
def profile(username):
    user = User.query.filter_by(username=username).first_or_404()
    user.calculate_credibility()  # Update credibility score
    
    reviews = user.reviews.filter_by(is_bot=False).order_by(Review.created_at.desc()).limit(10).all()
    complaints = user.complaints.filter_by(is_bot=False).order_by(Complaint.created_at.desc()).limit(10).all()
    advice = user.advice.filter_by(is_bot=False).order_by(Advice.created_at.desc()).limit(10).all()
    
    return render_template('profile/profile.html', 
                         user=user, 
                         reviews=reviews, 
                         complaints=complaints, 
                         advice=advice)

@app.route('/settings')
@login_required
def settings():
    return render_template('profile/settings.html')

@app.route('/go', methods=['POST'])
def go_to_back():
    """Handle the main search form submission"""
    domain = request.form.get('domain', '').strip()
    if domain:
        normalized_domain = normalize_domain(domain)
        if normalized_domain and is_valid_domain(normalized_domain):
            return redirect(url_for('website_back', domain=normalized_domain))
        else:
            flash('Please enter a valid domain name', 'error')
    return redirect(url_for('index'))

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return render_template('errors/404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('errors/500.html'), 500
