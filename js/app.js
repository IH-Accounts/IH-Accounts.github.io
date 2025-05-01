/**
 * Idle Heroes Account Viewer - Main Application
 * 
 * Initializes the viewer and handles global functions
 */

// Initialize the application when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.viewer = new IdleHeroesViewer();
    
    // Set up copy button functionality
    setupCopyButton();
    
    // Set up account search form
    setupAccountSearch();
    
    // Set up share URL functionality with correct format
    setupShareURLFeature();
    
    // Set up platform detection
    detectUserPlatform();
    
    // Add keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Set up service worker for offline support (if deployed)
    setupServiceWorker();
});

/**
 * Set up copy button functionality
 */
function setupCopyButton() {
    const copyBtn = document.getElementById('copy-url-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const shareUrl = document.getElementById('share-url');
            if (shareUrl) {
                copyToClipboard(shareUrl.value);
                
                // Visual feedback
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="bi bi-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                }, 2000);
            }
        });
    }
}

/**
 * Set up keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+S or Cmd+S for export
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (window.viewer) {
                window.viewer.exportData();
            }
        }
        
        // Ctrl+C or Cmd+C when URL is selected
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.id === 'share-url') {
                // URL is already selected, just let the default copy happen
                return;
            }
        }
    });
}

/**
 * Set up account search form with smooth URL updating
 */
function setupAccountSearch() {
    const searchForm = document.getElementById('account-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const platformSelect = document.getElementById('account-platform');
            const uidInput = document.getElementById('account-uid');
            
            if (platformSelect && uidInput && window.viewer) {
                const platform = platformSelect.value;
                const uid = uidInput.value.trim();
                
                if (platform && uid) {
                    console.log(`Searching for account: ${platform}=${uid}`);
                    
                    // Construct account identifier
                    const accountId = `${platform}=${uid}`;
                    
                    // Update URL with the new hash without page reload
                    updateUrlWithoutReload(accountId);
                    
                    // Reload the viewer with the new account
                    if (window.viewer.loadAccount) {
                        window.viewer.loadAccount(accountId);
                    }
                    
                    // Show loading state if it exists
                    const loadingEl = document.getElementById('loading');
                    if (loadingEl) {
                        loadingEl.classList.remove('d-none');
                    }
                    
                    // Update the share URL
                    updateShareUrl(platform, uid);
                } else {
                    alert('Please select a platform and enter a valid UID');
                }
            }
        });
    }
}

/**
 * Detect user platform (iOS or Android) and pre-select in dropdown
 */
function detectUserPlatform() {
    const platformSelect = document.getElementById('account-platform');
    if (platformSelect) {
        // Detect platform based on user agent
        const userAgent = navigator.userAgent.toLowerCase();
        let detectedPlatform = 'Android'; // Default to Android
        
        if (/iphone|ipad|ipod/.test(userAgent)) {
            detectedPlatform = 'iOS';
        }
        
        // Set the detected platform in the dropdown
        platformSelect.value = detectedPlatform;
        
        // Add profile download option
        const getStartedBtn = document.querySelector('.btn-hero');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', (e) => {
                const downloadUrl = detectedPlatform === 'iOS' 
                    ? 'profiles/ios-mitm-profile.mobileconfig'
                    : 'profiles/android-mitm-profile.conf';
                
                if (detectedPlatform === 'iOS' && /iphone|ipad|ipod/.test(userAgent) && !(/safari/.test(userAgent))) {
                    alert('You need to open this page in Safari to install iOS profiles.');
                }
                
                // Don't redirect if on landing page - handle in the link
                if (!window.location.pathname.includes('landing')) {
                    e.preventDefault();
                    window.location.href = downloadUrl;
                }
            });
        }
    }
}

/**
 * Set up service worker for offline support
 */
function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered: ', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed: ', error);
                });
        });
    }
}

/**
 * Utility function to copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {boolean} Success status
 */
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        // Use modern Clipboard API if available
        navigator.clipboard.writeText(text)
            .then(() => console.log('Text copied to clipboard'))
            .catch(err => console.error('Failed to copy text: ', err));
        return true;
    } else {
        // Fallback to older method
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'absolute';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        } catch (err) {
            console.error('Failed to copy text: ', err);
            return false;
        }
    }
}

/**
 * Utility function to format timestamps
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted date string
 */
function formatTimestamp(timestamp) {
    try {
        return new Date(timestamp).toLocaleString();
    } catch (e) {
        return 'Unknown';
    }
}

/**
 * Check if browser supports all required features
 * @returns {boolean} True if browser is compatible
 */
function checkBrowserCompatibility() {
    // Check for required features
    const requirements = [
        !!window.indexedDB,
        !!window.localStorage,
        !!window.JSON,
        !!window.Promise,
        typeof Blob !== 'undefined',
        typeof FileReader !== 'undefined'
    ];
    
    // Return true if all requirements are met
    return requirements.every(req => req === true);
}

// Additional initialization for demo mode and search functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check if we need to force demo mode
    const forceDemoMode = true;
    
    if (forceDemoMode && window.viewer) {
        // Wait a bit to ensure viewer is initialized
        setTimeout(() => {
            if (!window.viewer.data) {
                console.log('Forcing demo mode for testing');
                window.viewer.loadDemoData();
            }
        }, 1000);
    }
    
    // Display demo banner if showing demo data
    const demoBanner = document.getElementById('demo-data-banner');
    if (demoBanner && window.viewer && window.viewer.isDemoMode) {
        demoBanner.classList.remove('d-none');
    }
});

/**
 * Updates URL hash without page reload and with correct format
 * @param {string} accountId - The account ID in Platform=UID format 
 */
function updateUrlWithoutReload(accountId) {
    // Use history API to update URL without reload
    const newUrl = window.location.pathname.replace('viewer.html', '') + '#' + accountId;
    history.pushState(null, '', newUrl);
}

/**
 * Set up the share URL functionality
 */
function setupShareURLFeature() {
    // Handle copying modified URL format
    const shareUrlInput = document.getElementById('share-url');
    if (shareUrlInput) {
        // Listen for focus to update the URL format
        shareUrlInput.addEventListener('focus', function() {
            const currentUrl = window.location.href;
            
            // Transform URL to proper format (removing viewer.html)
            const baseUrl = window.location.origin + window.location.pathname.replace('viewer.html', '');
            const hash = window.location.hash;
            
            if (hash && hash.length > 1) {
                // Set the correct share URL format
                const cleanedHash = hash.replace('#', '');
                shareUrlInput.value = baseUrl + cleanedHash;
            }
        });
    }
}

/**
 * Updates the share URL input with correct format
 * @param {string} platform - The selected platform
 * @param {string} uid - The user ID
 */
function updateShareUrl(platform, uid) {
    const shareUrlInput = document.getElementById('share-url');
    if (shareUrlInput) {
        const baseUrl = window.location.origin + window.location.pathname.replace('viewer.html', '');
        shareUrlInput.value = baseUrl + platform + '=' + uid;
    }
}