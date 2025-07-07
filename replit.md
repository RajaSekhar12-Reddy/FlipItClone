# BackPages - Website Review Platform

## Overview

BackPages is a Flask-based web application that allows users to share reviews, complaints, and advice about websites. The platform creates a "back page" for every website where users can contribute authentic feedback and experiences. The application features a dark-themed interface with a credibility scoring system to ensure quality content.

## System Architecture

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Database**: SQLAlchemy ORM with configurable database backend
- **Authentication**: Flask-Login for user session management
- **Form Handling**: WTForms with Flask-WTF for secure form processing
- **Security**: CSRF protection, password hashing with Werkzeug

### Frontend Architecture
- **Template Engine**: Jinja2 (Flask's default)
- **CSS Framework**: Bootstrap 5.3.2 with dark theme
- **Icons**: Font Awesome 6.4.0
- **JavaScript**: Vanilla JavaScript for interactive features

### Application Structure
```
app.py              # Main application factory and configuration
main.py             # Application entry point
routes.py           # URL routing and view functions
models.py           # Database models and relationships
forms.py            # WTForms form definitions
utils.py            # Utility functions for domain validation and web scraping
templates/          # Jinja2 HTML templates
static/             # CSS, JavaScript, and static assets
```

## Key Components

### User Management System
- User registration and authentication with Flask-Login
- Credibility scoring system based on user contributions and verification status
- User profiles displaying statistics and contribution history
- Account verification system for trusted users

### Content Management System
- **Reviews**: Star-rated reviews with detailed feedback
- **Complaints**: Categorized issue reporting system
- **Advice**: Community-driven tips and recommendations
- Voting system for content quality assessment
- Bot content detection and filtering

### Website Information System
- Automatic domain normalization and validation
- Web scraping for website metadata (title, description)
- Website verification system
- Aggregated statistics and ratings per website

### Search and Discovery
- Website search functionality
- Recent content feeds on homepage
- Category-based content organization

## Data Flow

1. **User Registration/Login**: Users create accounts or authenticate through Flask-Login
2. **Website Lookup**: When users search for a website, the system normalizes the domain and creates/retrieves website records
3. **Content Creation**: Authenticated users can create reviews, complaints, or advice for any website
4. **Content Validation**: System checks for bot content and applies credibility scoring
5. **Voting**: Users can vote on content quality, affecting author credibility
6. **Display**: Content is aggregated and displayed on website "back pages"

## External Dependencies

### Python Packages
- **Flask**: Web framework
- **Flask-SQLAlchemy**: Database ORM
- **Flask-Login**: User authentication
- **Flask-WTF**: Form handling and CSRF protection
- **WTForms**: Form validation
- **Werkzeug**: Password hashing and utilities
- **Requests**: HTTP client for web scraping
- **BeautifulSoup4**: HTML parsing for metadata extraction

### Frontend Libraries
- **Bootstrap 5.3.2**: UI framework
- **Font Awesome 6.4.0**: Icon library

### Environment Variables
- `SESSION_SECRET`: Flask session encryption key
- `DATABASE_URL`: Database connection string

## Deployment Strategy

The application is configured for cloud deployment with:
- Environment-based configuration management
- Database connection pooling with automatic reconnection
- ProxyFix middleware for reverse proxy compatibility
- Configurable host and port settings
- Debug mode for development environments

The application creates database tables automatically on startup and includes comprehensive logging for debugging and monitoring.

## Changelog
- July 07, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.