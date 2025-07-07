from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    credibility_score = db.Column(db.Float, default=0.0)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    reviews = db.relationship('Review', backref='author', lazy='dynamic')
    complaints = db.relationship('Complaint', backref='author', lazy='dynamic')
    advice = db.relationship('Advice', backref='author', lazy='dynamic')
    votes = db.relationship('Vote', backref='user', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def calculate_credibility(self):
        """Calculate user credibility based on various factors"""
        base_score = 0
        
        # Points for verified content
        verified_content = (self.reviews.filter_by(is_verified=True).count() * 5 +
                          self.complaints.filter_by(is_verified=True).count() * 3 +
                          self.advice.filter_by(is_verified=True).count() * 2)
        
        # Points for upvotes received
        upvotes = sum(vote.value for vote in self.votes if vote.value > 0)
        
        # Points for account age (max 50 points)
        account_age_days = (datetime.utcnow() - self.created_at).days
        age_points = min(account_age_days * 0.1, 50)
        
        # Verification bonus
        verification_bonus = 100 if self.is_verified else 0
        
        self.credibility_score = base_score + verified_content + upvotes + age_points + verification_bonus
        db.session.commit()
        return self.credibility_score

class Website(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    domain = db.Column(db.String(255), unique=True, nullable=False, index=True)
    title = db.Column(db.String(500))
    description = db.Column(db.Text)
    category = db.Column(db.String(100))
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    reviews = db.relationship('Review', backref='website', lazy='dynamic')
    complaints = db.relationship('Complaint', backref='website', lazy='dynamic')
    advice = db.relationship('Advice', backref='website', lazy='dynamic')
    
    @property
    def average_rating(self):
        ratings = [review.rating for review in self.reviews if review.rating]
        return sum(ratings) / len(ratings) if ratings else 0
    
    @property
    def total_content(self):
        return self.reviews.count() + self.complaints.count() + self.advice.count()

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    website_id = db.Column(db.Integer, db.ForeignKey('website.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer)  # 1-5 stars
    is_verified = db.Column(db.Boolean, default=False)
    is_bot = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    votes = db.relationship('Vote', backref='review', lazy='dynamic', 
                           foreign_keys='Vote.review_id')
    
    @property
    def vote_score(self):
        return sum(vote.value for vote in self.votes)

class Complaint(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    website_id = db.Column(db.Integer, db.ForeignKey('website.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100))  # scam, poor_service, billing, etc.
    is_verified = db.Column(db.Boolean, default=False)
    is_bot = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    votes = db.relationship('Vote', backref='complaint', lazy='dynamic',
                           foreign_keys='Vote.complaint_id')
    
    @property
    def vote_score(self):
        return sum(vote.value for vote in self.votes)

class Advice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    website_id = db.Column(db.Integer, db.ForeignKey('website.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100))  # tips, alternatives, warnings, etc.
    is_verified = db.Column(db.Boolean, default=False)
    is_bot = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    votes = db.relationship('Vote', backref='advice', lazy='dynamic',
                           foreign_keys='Vote.advice_id')
    
    @property
    def vote_score(self):
        return sum(vote.value for vote in self.votes)

class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    review_id = db.Column(db.Integer, db.ForeignKey('review.id'), nullable=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaint.id'), nullable=True)
    advice_id = db.Column(db.Integer, db.ForeignKey('advice.id'), nullable=True)
    value = db.Column(db.Integer, nullable=False)  # 1 for upvote, -1 for downvote
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('user_id', 'review_id', name='unique_user_review_vote'),
        db.UniqueConstraint('user_id', 'complaint_id', name='unique_user_complaint_vote'),
        db.UniqueConstraint('user_id', 'advice_id', name='unique_user_advice_vote'),
    )
