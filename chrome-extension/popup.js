// BackPages Chrome Extension Popup Script

class BackPagesExtension {
    constructor() {
        this.baseUrl = 'http://localhost:5000'; // Change to production URL
        this.currentDomain = '';
        this.websiteData = null;
        
        this.init();
    }

    async init() {
        await this.getCurrentDomain();
        this.setupEventListeners();
        this.setupTabs();
        await this.loadWebsiteData();
    }

    async getCurrentDomain() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url) {
                const url = new URL(tab.url);
                this.currentDomain = url.hostname.replace(/^www\./, '');
                document.getElementById('currentSite').textContent = this.currentDomain;
            }
        } catch (error) {
            console.error('Error getting current domain:', error);
            document.getElementById('currentSite').textContent = 'Unknown site';
        }
    }

    setupEventListeners() {
        // Quick action buttons
        document.getElementById('quickReview').addEventListener('click', () => {
            this.openAddContent('review');
        });

        document.getElementById('quickComplaint').addEventListener('click', () => {
            this.openAddContent('complaint');
        });

        // Add content buttons
        document.getElementById('addReview').addEventListener('click', () => {
            this.openAddContent('review');
        });

        document.getElementById('addComplaint').addEventListener('click', () => {
            this.openAddContent('complaint');
        });

        document.getElementById('addAdvice').addEventListener('click', () => {
            this.openAddContent('advice');
        });

        // Open full back page
        document.getElementById('openBackPage').addEventListener('click', () => {
            this.openBackPage();
        });
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;

                // Remove active class from all tabs and panels
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));

                // Add active class to clicked tab and corresponding panel
                button.classList.add('active');
                document.getElementById(`${targetTab}Panel`).classList.add('active');

                // Load content for the selected tab
                this.loadTabContent(targetTab);
            });
        });
    }

    async loadWebsiteData() {
        if (!this.currentDomain) return;

        try {
            // Show loading state
            document.getElementById('feedLoading').textContent = 'Loading website data...';
            
            const response = await fetch(`${this.baseUrl}/api/website/${encodeURIComponent(this.currentDomain)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                this.websiteData = await response.json();
                this.updateStats();
                this.loadTabContent('feed');
            } else {
                // Website doesn't exist in database yet
                this.showEmptyState();
            }
        } catch (error) {
            console.error('Error loading website data:', error);
            this.showErrorState();
            
            // Show more detailed error message
            if (error.message.includes('Failed to fetch')) {
                document.getElementById('feedLoading').textContent = 
                    'Cannot connect to BackPages. Make sure the app is running on localhost:5000';
            } else {
                document.getElementById('feedLoading').textContent = 
                    `Error: ${error.message}`;
            }
        }
    }

    updateStats() {
        if (!this.websiteData) return;

        const { website, reviews, complaints, advice } = this.websiteData;

        // Update stats
        document.getElementById('avgRating').textContent = 
            website.average_rating ? website.average_rating.toFixed(1) : '-';
        document.getElementById('totalContent').textContent = 
            reviews.length + complaints.length + advice.length;
        document.getElementById('credibilityScore').textContent = 
            website.credibility_score || '-';

        // Update counts in tabs
        document.getElementById('reviewCount').textContent = reviews.length;
        document.getElementById('complaintCount').textContent = complaints.length;
        document.getElementById('adviceCount').textContent = advice.length;
    }

    async loadTabContent(tabName) {
        const contentContainer = document.getElementById(`${tabName}sList`) || 
                                document.getElementById(`${tabName}Panel`);

        if (tabName === 'feed') {
            this.loadFeedContent();
            return;
        }

        if (!this.websiteData) {
            this.showEmptyContent(contentContainer, tabName);
            return;
        }

        const data = this.websiteData[tabName] || [];
        
        if (data.length === 0) {
            this.showEmptyContent(contentContainer, tabName);
            return;
        }

        contentContainer.innerHTML = '';
        data.slice(0, 5).forEach(item => { // Show only first 5 items
            const element = this.createContentItem(item, tabName);
            contentContainer.appendChild(element);
        });
    }

    loadFeedContent() {
        const activityContainer = document.getElementById('recentActivity');
        const loadingElement = document.getElementById('feedLoading');

        if (!this.websiteData) {
            loadingElement.textContent = 'No data available for this website yet.';
            return;
        }

        loadingElement.style.display = 'none';

        // Combine all content types and sort by date
        const allContent = [
            ...this.websiteData.reviews.map(item => ({ ...item, type: 'review' })),
            ...this.websiteData.complaints.map(item => ({ ...item, type: 'complaint' })),
            ...this.websiteData.advice.map(item => ({ ...item, type: 'advice' }))
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3);

        if (allContent.length === 0) {
            activityContainer.innerHTML = `
                <div class="activity-header">Recent Activity</div>
                <div class="empty-state">
                    <div>No activity yet for this website</div>
                </div>
            `;
            return;
        }

        const activityHTML = allContent.map(item => `
            <div class="activity-item">
                <div class="activity-icon ${item.type}">
                    ${this.getActivityIcon(item.type)}
                </div>
                <div class="activity-text">
                    <strong>${item.title}</strong><br>
                    ${this.formatDate(item.created_at)}
                </div>
            </div>
        `).join('');

        activityContainer.innerHTML = `
            <div class="activity-header">Recent Activity</div>
            ${activityHTML}
        `;
    }

    createContentItem(item, type) {
        const div = document.createElement('div');
        div.className = 'content-item';
        
        const ratingHTML = type === 'reviews' && item.rating ? 
            `<div class="content-rating">${this.createStars(item.rating)}</div>` : '';
        
        const categoryHTML = item.category ? 
            `<span class="content-category ${type}">${item.category.replace('_', ' ')}</span>` : '';

        div.innerHTML = `
            <div class="content-title">${item.title}</div>
            <div class="content-meta">
                <div>
                    ${ratingHTML}
                    ${categoryHTML}
                </div>
                <div>${this.formatDate(item.created_at)}</div>
            </div>
        `;

        div.addEventListener('click', () => {
            this.openBackPage(`#${type}`);
        });

        return div;
    }

    createStars(rating) {
        return Array.from({ length: 5 }, (_, i) => 
            `<span class="star ${i < rating ? '' : 'empty'}">★</span>`
        ).join('');
    }

    getActivityIcon(type) {
        const icons = {
            review: '★',
            complaint: '⚠',
            advice: '💡'
        };
        return icons[type] || '•';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    }

    showEmptyContent(container, type) {
        const messages = {
            reviews: 'No reviews yet',
            complaints: 'No complaints yet', 
            advice: 'No advice yet'
        };

        container.innerHTML = `
            <div class="empty-state">
                <div>${messages[type] || 'No content yet'}</div>
                <div>Be the first to contribute!</div>
            </div>
        `;
    }

    showEmptyState() {
        document.getElementById('avgRating').textContent = '-';
        document.getElementById('totalContent').textContent = '0';
        document.getElementById('credibilityScore').textContent = '-';
        
        document.getElementById('feedLoading').textContent = 'No data available for this website yet.';
    }

    showErrorState() {
        document.getElementById('feedLoading').textContent = 'Connection error. Check if BackPages is running on localhost:5000';
    }

    openAddContent(type) {
        if (!this.currentDomain) return;
        
        const url = `${this.baseUrl}/back/${encodeURIComponent(this.currentDomain)}#add-${type}`;
        chrome.tabs.create({ url });
    }

    openBackPage(hash = '') {
        if (!this.currentDomain) return;
        
        const url = `${this.baseUrl}/back/${encodeURIComponent(this.currentDomain)}${hash}`;
        chrome.tabs.create({ url });
    }
}

// Initialize extension when popup opens
document.addEventListener('DOMContentLoaded', () => {
    new BackPagesExtension();
});

// Add API endpoints to Flask app for extension
// This would need to be added to routes.py:
/*
@app.route('/api/website/<domain>')
def api_website_data(domain):
    normalized_domain = normalize_domain(domain)
    if not normalized_domain or not is_valid_domain(normalized_domain):
        return jsonify({'error': 'Invalid domain'}), 400
    
    website = Website.query.filter_by(domain=normalized_domain).first()
    if not website:
        return jsonify({'error': 'Website not found'}), 404
    
    reviews = Review.query.filter_by(website_id=website.id, is_bot=False).order_by(Review.created_at.desc()).limit(10).all()
    complaints = Complaint.query.filter_by(website_id=website.id, is_bot=False).order_by(Complaint.created_at.desc()).limit(10).all()
    advice = Advice.query.filter_by(website_id=website.id, is_bot=False).order_by(Advice.created_at.desc()).limit(10).all()
    
    return jsonify({
        'website': {
            'id': website.id,
            'domain': website.domain,
            'title': website.title,
            'description': website.description,
            'average_rating': website.average_rating,
            'total_content': website.total_content,
            'credibility_score': 85  # Placeholder
        },
        'reviews': [{'id': r.id, 'title': r.title, 'rating': r.rating, 'created_at': r.created_at.isoformat()} for r in reviews],
        'complaints': [{'id': c.id, 'title': c.title, 'category': c.category, 'created_at': c.created_at.isoformat()} for c in complaints],
        'advice': [{'id': a.id, 'title': a.title, 'category': a.category, 'created_at': a.created_at.isoformat()} for a in advice]
    })
*/