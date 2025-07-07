from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, PasswordField, SelectField, IntegerField, HiddenField
from wtforms.validators import DataRequired, Length, Email, EqualTo, NumberRange, URL, Optional

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])

class RegisterForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=20)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    password2 = PasswordField('Confirm Password', 
                             validators=[DataRequired(), EqualTo('password')])

class ReviewForm(FlaskForm):
    title = StringField('Review Title', validators=[DataRequired(), Length(max=200)])
    content = TextAreaField('Your Review', validators=[DataRequired(), Length(max=2000)])
    rating = SelectField('Rating', choices=[
        ('5', '5 Stars - Excellent'),
        ('4', '4 Stars - Good'),
        ('3', '3 Stars - Average'),
        ('2', '2 Stars - Poor'),
        ('1', '1 Star - Terrible')
    ], validators=[DataRequired()])
    website_id = HiddenField()

class ComplaintForm(FlaskForm):
    title = StringField('Complaint Title', validators=[DataRequired(), Length(max=200)])
    content = TextAreaField('Describe Your Issue', validators=[DataRequired(), Length(max=2000)])
    category = SelectField('Category', choices=[
        ('scam', 'Scam/Fraud'),
        ('poor_service', 'Poor Customer Service'),
        ('billing', 'Billing Issues'),
        ('technical', 'Technical Problems'),
        ('delivery', 'Delivery/Shipping'),
        ('quality', 'Product Quality'),
        ('other', 'Other')
    ], validators=[DataRequired()])
    website_id = HiddenField()

class AdviceForm(FlaskForm):
    title = StringField('Advice Title', validators=[DataRequired(), Length(max=200)])
    content = TextAreaField('Your Advice', validators=[DataRequired(), Length(max=2000)])
    category = SelectField('Category', choices=[
        ('tips', 'Tips & Tricks'),
        ('alternatives', 'Better Alternatives'),
        ('warnings', 'Warnings'),
        ('how_to', 'How To Guide'),
        ('general', 'General Advice')
    ], validators=[DataRequired()])
    website_id = HiddenField()

class SearchForm(FlaskForm):
    query = StringField('Search websites...', validators=[DataRequired()])

class WebsiteForm(FlaskForm):
    domain = StringField('Website Domain', validators=[DataRequired(), Length(max=255)])
    title = StringField('Website Title', validators=[Optional(), Length(max=500)])
    description = TextAreaField('Description', validators=[Optional(), Length(max=1000)])
    category = SelectField('Category', choices=[
        ('ecommerce', 'E-commerce'),
        ('news', 'News & Media'),
        ('social', 'Social Media'),
        ('finance', 'Finance'),
        ('education', 'Education'),
        ('entertainment', 'Entertainment'),
        ('technology', 'Technology'),
        ('health', 'Health & Medical'),
        ('travel', 'Travel'),
        ('other', 'Other')
    ], validators=[Optional()])
