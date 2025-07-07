// BackPages Chrome Extension Content Script

class BackPagesContent {
    constructor() {
        this.baseUrl = 'http://localhost:5000';
        this.currentDomain = '';
        this.floatingButton = null;
        
        this.init();
    }

    init() {
        this.getCurrentDomain();
        this.createFloatingButton();
        this.setupMessageListener();
    }

    getCurrentDomain() {
        this.currentDomain = window.location.hostname.replace(/^www\./, '');
    }

    createFloatingButton() {
        // Create floating button for quick access
        this.floatingButton = document.createElement('div');
        this.floatingButton.id = 'backpages-floating-btn';
        this.floatingButton.innerHTML = `
            <div class="bp-btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
            </div>
            <div class="bp-btn-text">BackPages</div>
        `;

        this.floatingButton.addEventListener('click', () => {
            this.openBackPage();
        });

        document.body.appendChild(this.floatingButton);

        // Add hover effects
        this.floatingButton.addEventListener('mouseenter', () => {
            this.floatingButton.classList.add('expanded');
        });

        this.floatingButton.addEventListener('mouseleave', () => {
            this.floatingButton.classList.remove('expanded');
        });
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'getDomain') {
                sendResponse({ domain: this.currentDomain });
            }
        });
    }

    openBackPage() {
        const url = `${this.baseUrl}/back/${encodeURIComponent(this.currentDomain)}`;
        window.open(url, '_blank');
    }

    // Method to inject notification about BackPages
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.id = 'backpages-notification';
        notification.className = `bp-notification bp-${type}`;
        notification.innerHTML = `
            <div class="bp-notification-content">
                <div class="bp-notification-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                    </svg>
                </div>
                <div class="bp-notification-text">${message}</div>
                <button class="bp-notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize content script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new BackPagesContent();
    });
} else {
    new BackPagesContent();
}