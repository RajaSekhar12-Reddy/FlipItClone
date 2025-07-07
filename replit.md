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

## Chrome Extension

A Chrome extension has been implemented to provide seamless integration with the BackPages platform. The extension allows users to:

### Features
- **Popup Interface**: Compact overlay showing website statistics, recent reviews, complaints, and advice
- **Floating Button**: Unobtrusive button on every website for quick access to back pages
- **Context Menu Integration**: Right-click options to check BackPages or contribute content
- **Badge Notifications**: Shows content count for the current website
- **API Integration**: Real-time data fetching from BackPages backend

### Technical Implementation
- **Manifest V3**: Modern Chrome extension architecture
- **Content Scripts**: Inject floating button and handle page interactions
- **Background Service Worker**: Manages extension lifecycle and browser events
- **API Endpoints**: Flask routes at `/api/website/<domain>` provide JSON data
- **Responsive Design**: Custom CSS with dark theme matching the main application

### Files Structure
```
chrome-extension/
├── manifest.json       # Extension configuration
├── popup.html         # Extension popup interface
├── popup.css          # Popup styling
├── popup.js           # Popup functionality
├── content.js         # Content script for website integration
├── content.css        # Content script styling
├── background.js      # Service worker
└── icons/            # Extension icons (16px, 32px, 48px, 128px)
```

### Installation
Users can load the extension in Chrome by enabling Developer Mode and selecting "Load unpacked" with the chrome-extension folder.

## Recent Architecture Changes

### July 07, 2025 - Chrome Extension Integration
- Added API endpoint `/api/website/<domain>` returning JSON data for extension consumption
- Implemented Chrome extension with popup interface similar to Flipit but with custom design
- Created floating button injection system for seamless website integration
- Added context menu integration for quick access to BackPages features
- Established real-time badge notification system showing content counts

## Changelog
- July 07, 2025. Initial setup and Chrome extension implementation

## User Preferences

Preferred communication style: Simple, everyday language.
Request: Create exact clone of Flipit functionality with different design using Flask, JavaScript, and PostgreSQL.