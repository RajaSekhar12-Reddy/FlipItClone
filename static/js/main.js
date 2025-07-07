// BackPages - Main JavaScript File

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Voting system
    setupVoting();
    
    // Search enhancements
    setupSearch();
    
    // Form enhancements
    setupForms();
    
    // Animation on scroll
    setupScrollAnimations();
});

// Voting System
function setupVoting() {
    const voteButtons = document.querySelectorAll('.vote-btn');
    
    voteButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const contentType = this.dataset.contentType;
            const contentId = this.dataset.contentId;
            const voteValue = parseInt(this.dataset.vote);
            
            try {
                const response = await fetch('/vote', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        'content_type': contentType,
                        'content_id': contentId,
                        'vote_value': voteValue
                    })
                });
                
                if (response.ok) {
                    // Toggle button state
                    this.classList.toggle('active');
                    
                    // Update vote count (simplified - in production you'd want to fetch the new count)
                    const currentCount = parseInt(this.textContent.match(/\d+/)?.[0] || 0);
                    const icon = this.querySelector('i');
                    
                    if (this.classList.contains('active')) {
                        this.innerHTML = icon.outerHTML + ' ' + (currentCount + 1);
                    } else {
                        this.innerHTML = icon.outerHTML + ' ' + Math.max(0, currentCount - 1);
                    }
                    
                    // Remove active state from opposite vote button
                    const oppositeVote = voteValue === 1 ? -1 : 1;
                    const oppositeButton = document.querySelector(
                        `.vote-btn[data-content-type="${contentType}"][data-content-id="${contentId}"][data-vote="${oppositeVote}"]`
                    );
                    if (oppositeButton && oppositeButton.classList.contains('active')) {
                        oppositeButton.classList.remove('active');
                        const oppositeCount = parseInt(oppositeButton.textContent.match(/\d+/)?.[0] || 0);
                        const oppositeIcon = oppositeButton.querySelector('i');
                        oppositeButton.innerHTML = oppositeIcon.outerHTML + ' ' + Math.max(0, oppositeCount - 1);
                    }
                } else {
                    console.error('Vote failed');
                    showAlert('Failed to register vote. Please try again.', 'danger');
                }
            } catch (error) {
                console.error('Vote error:', error);
                showAlert('Network error. Please check your connection.', 'danger');
            }
        });
    });
}

// Search Enhancements
function setupSearch() {
    const searchInputs = document.querySelectorAll('input[name="domain"], input[name="query"]');
    
    searchInputs.forEach(input => {
        // Auto-format domain input
        if (input.name === 'domain') {
            input.addEventListener('input', function() {
                let value = this.value;
                // Remove protocol if present
                value = value.replace(/^https?:\/\//, '');
                // Remove www. if present
                value = value.replace(/^www\./, '');
                // Remove trailing slash
                value = value.replace(/\/$/, '');
                this.value = value;
            });
        }
        
        // Add loading state to search buttons
        const form = input.closest('form');
        if (form) {
            form.addEventListener('submit', function() {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Searching...';
                }
            });
        }
    });
}

// Form Enhancements
function setupForms() {
    // Character counter for textareas
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        const maxLength = textarea.getAttribute('maxlength') || 2000;
        const counter = document.createElement('div');
        counter.className = 'form-text text-end';
        counter.innerHTML = `<span class="char-count">0</span>/${maxLength} characters`;
        textarea.parentNode.appendChild(counter);
        
        textarea.addEventListener('input', function() {
            const charCount = this.value.length;
            const charCountEl = counter.querySelector('.char-count');
            charCountEl.textContent = charCount;
            
            // Color coding
            if (charCount > maxLength * 0.9) {
                charCountEl.style.color = '#e17055';
            } else if (charCount > maxLength * 0.7) {
                charCountEl.style.color = '#fdcb6e';
            } else {
                charCountEl.style.color = '#00b894';
            }
        });
    });
    
    // Form validation feedback
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('is-invalid');
                    isValid = false;
                } else {
                    field.classList.remove('is-invalid');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showAlert('Please fill in all required fields.', 'warning');
            }
        });
    });
}

// Scroll Animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe cards for animation
    const cards = document.querySelectorAll('.feature-card, .content-card, .activity-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Utility Functions
function showAlert(message, type = 'info') {
    const alertContainer = document.querySelector('.container');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.insertBefore(alert, alertContainer.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// Rating Stars Enhancement
function setupRatingStars() {
    const ratingSelects = document.querySelectorAll('select[name="rating"]');
    
    ratingSelects.forEach(select => {
        const starsContainer = document.createElement('div');
        starsContainer.className = 'rating-stars mb-2';
        
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('i');
            star.className = 'fas fa-star';
            star.style.color = '#ddd';
            star.style.cursor = 'pointer';
            star.style.fontSize = '1.5rem';
            star.style.marginRight = '5px';
            star.dataset.rating = i;
            
            star.addEventListener('click', function() {
                const rating = parseInt(this.dataset.rating);
                select.value = rating;
                updateStarDisplay(starsContainer, rating);
            });
            
            star.addEventListener('mouseenter', function() {
                const rating = parseInt(this.dataset.rating);
                updateStarDisplay(starsContainer, rating, true);
            });
            
            starsContainer.appendChild(star);
        }
        
        starsContainer.addEventListener('mouseleave', function() {
            const currentRating = parseInt(select.value) || 0;
            updateStarDisplay(starsContainer, currentRating);
        });
        
        select.parentNode.insertBefore(starsContainer, select);
        select.style.display = 'none';
    });
}

function updateStarDisplay(container, rating, isHover = false) {
    const stars = container.querySelectorAll('.fa-star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.style.color = isHover ? '#fdcb6e' : '#f39c12';
        } else {
            star.style.color = '#ddd';
        }
    });
}

// Initialize rating stars when DOM is ready
document.addEventListener('DOMContentLoaded', setupRatingStars);

// Credibility Score Animation
function animateCredibilityScore() {
    const scoreElements = document.querySelectorAll('.badge:contains("credibility"), .credibility-score');
    
    scoreElements.forEach(element => {
        const finalScore = parseInt(element.textContent);
        if (finalScore && finalScore > 0) {
            let currentScore = 0;
            const increment = Math.ceil(finalScore / 50);
            const timer = setInterval(() => {
                currentScore += increment;
                if (currentScore >= finalScore) {
                    currentScore = finalScore;
                    clearInterval(timer);
                }
                element.textContent = currentScore;
            }, 20);
        }
    });
}

// Auto-expand textareas
function setupAutoExpandTextareas() {
    const textareas = document.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for quick search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[name="domain"], input[name="query"]');
        if (searchInput) {
            searchInput.focus();
        }
    }
});

// Initialize additional features
document.addEventListener('DOMContentLoaded', function() {
    setupAutoExpandTextareas();
    
    // Delay credibility animation slightly
    setTimeout(animateCredibilityScore, 500);
});
