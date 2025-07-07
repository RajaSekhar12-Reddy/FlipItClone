// BackPages Chrome Extension Background Script

class BackPagesBackground {
    constructor() {
        this.baseUrl = 'http://localhost:5000';
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Handle extension icon click
        chrome.action.onClicked.addListener((tab) => {
            this.handleIconClick(tab);
        });

        // Handle context menu
        chrome.runtime.onInstalled.addListener(() => {
            this.createContextMenus();
        });

        // Handle context menu clicks
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            this.handleContextMenuClick(info, tab);
        });

        // Handle tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                this.handleTabUpdate(tab);
            }
        });

        // Handle messages from content script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
        });
    }

    createContextMenus() {
        chrome.contextMenus.create({
            id: 'backpages-check',
            title: 'Check on BackPages',
            contexts: ['page']
        });

        chrome.contextMenus.create({
            id: 'backpages-review',
            title: 'Write a Review',
            contexts: ['page']
        });

        chrome.contextMenus.create({
            id: 'backpages-complaint',
            title: 'Report an Issue',
            contexts: ['page']
        });
    }

    handleIconClick(tab) {
        // Open popup (this is handled automatically by manifest)
    }

    handleContextMenuClick(info, tab) {
        const domain = this.extractDomain(tab.url);
        if (!domain) return;

        switch (info.menuItemId) {
            case 'backpages-check':
                this.openBackPage(domain);
                break;
            case 'backpages-review':
                this.openAddContent(domain, 'review');
                break;
            case 'backpages-complaint':
                this.openAddContent(domain, 'complaint');
                break;
        }
    }

    handleTabUpdate(tab) {
        const domain = this.extractDomain(tab.url);
        if (!domain) return;

        // Update badge with content count (optional)
        this.updateBadge(domain, tab.id);
    }

    handleMessage(request, sender, sendResponse) {
        switch (request.action) {
            case 'getDomain':
                const domain = this.extractDomain(sender.tab.url);
                sendResponse({ domain });
                break;
            case 'openBackPage':
                this.openBackPage(request.domain);
                break;
            case 'showNotification':
                this.showNotification(request.message, request.type);
                break;
        }
    }

    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace(/^www\./, '');
        } catch (error) {
            return null;
        }
    }

    openBackPage(domain) {
        const url = `${this.baseUrl}/back/${encodeURIComponent(domain)}`;
        chrome.tabs.create({ url });
    }

    openAddContent(domain, type) {
        const url = `${this.baseUrl}/back/${encodeURIComponent(domain)}#add-${type}`;
        chrome.tabs.create({ url });
    }

    async updateBadge(domain, tabId) {
        try {
            const response = await fetch(`${this.baseUrl}/api/website/${encodeURIComponent(domain)}`);
            
            if (response.ok) {
                const data = await response.json();
                const totalContent = data.reviews.length + data.complaints.length + data.advice.length;
                
                if (totalContent > 0) {
                    chrome.action.setBadgeText({
                        text: totalContent.toString(),
                        tabId: tabId
                    });
                    chrome.action.setBadgeBackgroundColor({
                        color: '#667eea',
                        tabId: tabId
                    });
                } else {
                    chrome.action.setBadgeText({
                        text: '',
                        tabId: tabId
                    });
                }
            } else {
                chrome.action.setBadgeText({
                    text: '',
                    tabId: tabId
                });
            }
        } catch (error) {
            console.error('Error updating badge:', error);
        }
    }

    showNotification(message, type = 'info') {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon-48.png',
            title: 'BackPages',
            message: message
        });
    }
}

// Initialize background script
new BackPagesBackground();