import re
import requests
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
import logging

def normalize_domain(url):
    """Normalize a URL to extract just the domain"""
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        # Remove www. prefix
        if domain.startswith('www.'):
            domain = domain[4:]
        return domain
    except Exception:
        return None

def is_valid_domain(domain):
    """Check if a domain is valid"""
    domain_pattern = re.compile(
        r'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$'
    )
    return bool(domain_pattern.match(domain))

def fetch_website_info(domain):
    """Fetch basic information about a website"""
    if not is_valid_domain(domain):
        return None
    
    url = f'https://{domain}'
    try:
        response = requests.get(url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract title
        title_tag = soup.find('title')
        title = title_tag.get_text().strip() if title_tag else domain
        
        # Extract description
        desc_tag = soup.find('meta', attrs={'name': 'description'})
        description = desc_tag.get('content', '').strip() if desc_tag else ''
        
        return {
            'title': title[:500],  # Limit title length
            'description': description[:1000]  # Limit description length
        }
    except Exception as e:
        logging.warning(f"Could not fetch info for {domain}: {e}")
        return {'title': domain, 'description': ''}

def detect_bot_content(content):
    """Simple bot detection based on content patterns"""
    bot_patterns = [
        r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+',  # Multiple URLs
        r'(.)\1{4,}',  # Repeated characters
        r'^.{0,10}$',  # Too short
        r'^.{2000,}$',  # Too long
    ]
    
    for pattern in bot_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            return True
    
    return False

def calculate_content_score(content_type, votes, user_credibility, is_verified=False):
    """Calculate a score for content based on various factors"""
    base_score = 0
    
    # Base points by content type
    type_points = {
        'review': 10,
        'complaint': 8,
        'advice': 6
    }
    base_score += type_points.get(content_type, 5)
    
    # Vote score
    vote_score = sum(votes) if votes else 0
    
    # User credibility factor (0.1 to 2.0 multiplier)
    credibility_factor = min(max(user_credibility / 100, 0.1), 2.0)
    
    # Verification bonus
    verification_bonus = 20 if is_verified else 0
    
    final_score = (base_score + vote_score) * credibility_factor + verification_bonus
    return round(final_score, 2)
