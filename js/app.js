/**
 * Idle Heroes Account Viewer - Application Logic
 * 
 * Primary application functionality and UI interaction
 */

// Initialize the application when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.accountViewer = new IdleHeroesViewer();
    
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
    
    // Check if we have a hash in the URL and process it
    processUrlHash();
});

/**
 * Process the URL hash to load account if needed
 */
function processUrlHash() {
    const hash = window.location.hash.substring(1);
    
    if (hash && hash.includes('=')) {
        const [platform, uid] = hash.split('=');
        
        if ((platform === 'iOS' || platform === 'Android') && uid) {
            console.log(`Loading account from URL hash: ${platform}=${uid}`);
            
            // Update form fields
            const platformSelect = document.getElementById('platform-select');
            const uidInput = document.getElementById('uid-input');
            
            if (platformSelect) platformSelect.value = platform;
            if (uidInput) uidInput.value = uid;
            
            // Use download simulator if available
            if (window.accountDownloader && window.accountViewer) {
                // Update UI indicators
                document.getElementById('platform-indicator').textContent = `Platform: ${platform}`;
                document.getElementById('uid-indicator').textContent = `Account ID: ${uid}`;
                
                // Show loading with progress indication
                const loadingElement = document.getElementById('loading');
                if (loadingElement) loadingElement.classList.remove('d-none');
                
                // Hide content
                const contentElement = document.getElementById('content');
                if (contentElement) contentElement.classList.add('d-none');
                
                // Simulate download
                setTimeout(async () => {
                    try {
                        const accountData = await window.accountDownloader.downloadAccountData(platform, uid);
                        window.accountViewer.processAccountData(accountData, true);
                    } catch (error) {
                        console.error('Error processing account from URL:', error);
                        
                        // Show error
                        const errorElement = document.getElementById('error');
                        const errorMessageElement = document.getElementById('error-message');
                        
                        if (errorMessageElement) {
                            errorMessageElement.textContent = `Error loading account: ${error.message}`;
                        }
                        
                        if (errorElement) {
                            errorElement.classList.remove('d-none');
                        }
                        
                        // Hide loading
                        if (loadingElement) {
                            loadingElement.classList.add('d-none');
                        }
                    }
                }, 200); // Short delay to ensure UI is ready
            } else if (window.accountViewer) {
                // Fallback to standard loading
                window.accountViewer.loadAccount(`${platform}=${uid}`);
            }
        }
    } else {
        console.log('No valid account hash found in URL');
    }
}

/**
 * Sets up account search functionality with download simulator
 */
function setupAccountSearch() {
    const accountForm = document.getElementById('account-form');
    const platformSelect = document.getElementById('platform-select');
    const uidInput = document.getElementById('uid-input');
    
    if (!accountForm || !platformSelect || !uidInput) {
        console.warn('Account search elements not found');
        return;
    }
    
    // Check if we have localStorage available for preferences
    if (window.localStorage) {
        const lastPlatform = localStorage.getItem('lastSelectedPlatform');
        if (lastPlatform && (lastPlatform === 'iOS' || lastPlatform === 'Android')) {
            platformSelect.value = lastPlatform;
        }
    }
    
    // Handle form submission
    accountForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const platform = platformSelect.value;
        const uid = uidInput.value.trim();
        
        if (!platform || !uid) {
            alert('Please select a platform and enter an account ID');
            return;
        }
        
        // Basic validation of UID
        if (uid.length < 3) {
            alert('Account ID must be at least 3 characters long');
            return;
        }
        
        // Remember platform selection
        if (window.localStorage) {
            localStorage.setItem('lastSelectedPlatform', platform);
        }
        
        // Form account ID (Platform=UID format)
        const accountId = `${platform}=${uid}`;
        
        // Update URL without page reload
        updateUrlWithoutReload(accountId);
        
        // Update platform/UID indicators in the loading screen
        document.getElementById('platform-indicator').textContent = `Platform: ${platform}`;
        document.getElementById('uid-indicator').textContent = `Account ID: ${uid}`;
        
        // Show loading screen
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.classList.remove('d-none');
        }
        
        // Hide any previous errors
        const errorElement = document.getElementById('error');
        if (errorElement) {
            errorElement.classList.add('d-none');
        }
        
        // Hide content while loading
        const contentElement = document.getElementById('content');
        if (contentElement) {
            contentElement.classList.add('d-none');
        }
        
        try {
            // Use our download simulator to simulate account data download
            if (window.accountDownloader) {
                // This will show a realistic download simulation with progress bar
                const accountData = await window.accountDownloader.downloadAccountData(platform, uid);
                
                // Process the data and show account info
                if (accountData && window.accountViewer) {
                    window.accountViewer.processAccountData(accountData, true);
                    console.log('Account data processed successfully');
                }
            } else if (window.accountViewer) {
                // Fallback if simulator is not available
                accountViewer.loadAccount(accountId);
            }
        } catch (error) {
            console.error('Error loading account:', error);
            // Show error
            const errorMessageElement = document.getElementById('error-message');
            if (errorMessageElement) {
                errorMessageElement.textContent = `Error loading account: ${error.message}`;
            }
            if (errorElement) {
                errorElement.classList.remove('d-none');
            }
            
            // Hide loading
            if (loadingElement) {
                loadingElement.classList.add('d-none');
            }
        }
    });
}

/**
 * Sets up keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    // Track key combinations (for debug mode)
    const keySequence = [];
    const debugSequence = ['Control', 'Shift', 'd'];
    let debugModeEnabled = false;
    
    document.addEventListener('keydown', (event) => {
        // Add key to sequence
        keySequence.push(event.key.toLowerCase());
        
        // Only keep last 3 keys
        if (keySequence.length > 3) {
            keySequence.shift();
        }
        
        // Check for debug sequence (Ctrl+Shift+D pressed 3 times)
        if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd') {
            const now = Date.now();
            
            if (!window.lastDebugPress || now - window.lastDebugPress < 2000) {
                window.debugPressCount = (window.debugPressCount || 0) + 1;
                
                if (window.debugPressCount >= 3) {
                    debugModeEnabled = !debugModeEnabled;
                    console.log(`Debug mode ${debugModeEnabled ? 'enabled' : 'disabled'}`);
                    
                    // Flash background to indicate toggle
                    document.body.style.transition = 'background-color 0.2s';
                    document.body.style.backgroundColor = debugModeEnabled ? '#2d0030' : '#000';
                    
                    setTimeout(() => {
                        document.body.style.backgroundColor = '';
                    }, 200);
                    
                    window.debugPressCount = 0;
                }
            } else {
                window.debugPressCount = 1;
            }
            
            window.lastDebugPress = now;
        }
    });
}

/**
 * Sets up share URL functionality
 */
function setupShareURLFeature() {
    const shareBtn = document.getElementById('share-btn');
    const shareUrlField = document.getElementById('share-url');
    
    if (shareBtn && shareUrlField) {
        shareBtn.addEventListener('click', () => {
            shareUrlField.select();
            document.execCommand('copy');
            
            // Show feedback
            const originalText = shareBtn.textContent;
            shareBtn.textContent = 'Copied!';
            
            setTimeout(() => {
                shareBtn.textContent = originalText;
            }, 2000);
        });
    }
}

/**
 * Updates URL hash without page reload and with correct format
 * @param {string} accountId - The account ID in Platform=UID format 
 */
function updateUrlWithoutReload(accountId) {
    // Use history API to update URL without reload
    // Create a proper URL without 'viewer.html' in the path
    const baseUrl = window.location.origin + '/';
    const newUrl = baseUrl + '#' + accountId;
    
    // Update browser URL without refresh
    history.pushState(null, '', newUrl);
    
    // Update document title to reflect the current account
    if (accountId && accountId.includes('=')) {
        const [platform, uid] = accountId.split('=');
        document.title = `${platform} Account ${uid} - Idle Heroes Account Viewer`;
    }
    
    console.log('URL updated to:', newUrl);
}

/**
 * Sets up copy button functionality
 */
function setupCopyButton() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const textToCopy = button.getAttribute('data-copy-text') || '';
            const textField = document.createElement('textarea');
            textField.value = textToCopy;
            document.body.appendChild(textField);
            textField.select();
            document.execCommand('copy');
            document.body.removeChild(textField);
            
            // Show feedback
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        });
    });
}

/**
 * Auto-detects user's platform based on user agent
 */
function detectUserPlatform() {
    const platformSelect = document.getElementById('platform-select');
    
    if (platformSelect && !localStorage.getItem('lastSelectedPlatform')) {
        // Detect based on user agent
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
            
        const isAndroid = /Android/.test(navigator.userAgent);
        
        if (isIOS) {
            platformSelect.value = 'iOS';
            localStorage.setItem('lastSelectedPlatform', 'iOS');
        } else if (isAndroid) {
            platformSelect.value = 'Android';
            localStorage.setItem('lastSelectedPlatform', 'Android');
        }
    }
}

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
 * Handles both iOS and Android platforms perfectly
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
                    
                    // Validate UID format based on platform
                    let isValidUid = true;
                    let errorMessage = '';
                    
                    // Basic validation for iOS/Android UIDs
                    if (uid.length < 4) {
                        isValidUid = false;
                        errorMessage = 'UID must be at least 4 characters long';
                    }
                    
                    if (!isValidUid) {
                        alert(errorMessage);
                        return;
                    }
                    
                    // Construct account identifier
                    const accountId = `${platform}=${uid}`;
                    
                    // Hide any previous content and show loading indicator
                    const contentEl = document.getElementById('content');
                    const errorEl = document.getElementById('error');
                    const loadingEl = document.getElementById('loading');
                    
                    if (errorEl) errorEl.classList.add('d-none');
                    if (loadingEl) loadingEl.classList.remove('d-none');
                    
                    // Update URL with the new hash without page reload
                    updateUrlWithoutReload(accountId);
                    
                    // Reload the viewer with the new account
                    if (window.viewer && window.viewer.loadAccount) {
                        window.viewer.loadAccount(accountId);
                    }
                    
                    // Update the share URL
                    updateShareUrl(platform, uid);
                    
                    // Update the document title to include account info
                    document.title = `${platform} Account ${uid} - Idle Heroes Account Viewer`;
                }
            }
        });
    }
}

/**
 * Setup account search functionality with download simulation
 */
function setupAccountSearch() {
    const accountForm = document.getElementById('account-form');
    const platformSelect = document.getElementById('platform-select');
    const uidInput = document.getElementById('uid-input');
    
    if (!accountForm || !platformSelect || !uidInput) {
        console.warn('Account search elements not found');
        return;
    }
    
    // Check if we have localStorage available for preferences
    if (window.localStorage) {
        const lastPlatform = localStorage.getItem('lastSelectedPlatform');
        if (lastPlatform && (lastPlatform === 'iOS' || lastPlatform === 'Android')) {
            platformSelect.value = lastPlatform;
        }
    }
    
    // Handle form submission
    accountForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const platform = platformSelect.value;
        const uid = uidInput.value.trim();
        
        if (!platform || !uid) {
            alert('Please select a platform and enter an account ID');
            return;
        }
        
        // Basic validation of UID
        if (uid.length < 3) {
            alert('Account ID must be at least 3 characters long');
            return;
        }
        
        // Remember platform selection
        if (window.localStorage) {
            localStorage.setItem('lastSelectedPlatform', platform);
        }
        
        // Form account ID (Platform=UID format)
        const accountId = `${platform}=${uid}`;
        
        // Update URL without page reload
        updateUrlWithoutReload(accountId);
        
        // Update platform/UID indicators in the loading screen
        document.getElementById('platform-indicator').textContent = `Platform: ${platform}`;
        document.getElementById('uid-indicator').textContent = `Account ID: ${uid}`;
        
        // Show loading screen
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.classList.remove('d-none');
        }
        
        // Hide any previous errors
        const errorElement = document.getElementById('error');
        if (errorElement) {
            errorElement.classList.add('d-none');
        }
        
        // Hide content while loading
        const contentElement = document.getElementById('content');
        if (contentElement) {
            contentElement.classList.add('d-none');
        }
        
        try {
            // Use our download simulator to simulate account data download
            if (window.accountDownloader) {
                // This will show a realistic download simulation with progress bar
                const accountData = await window.accountDownloader.downloadAccountData(platform, uid);
                
                // Process the data and show account info
                if (accountData && window.accountViewer) {
                    window.accountViewer.processAccountData(accountData, true);
                    console.log('Account data processed successfully');
                }
            } else if (window.accountViewer) {
                // Fallback if simulator is not available
                accountViewer.loadAccount(accountId);
            }
        } catch (error) {
            console.error('Error loading account:', error);
            // Show error
            const errorMessageElement = document.getElementById('error-message');
            if (errorMessageElement) {
                errorMessageElement.textContent = `Error loading account: ${error.message}`;
            }
            if (errorElement) {
                errorElement.classList.remove('d-none');
            }
            
            // Hide loading
            if (loadingElement) {
                loadingElement.classList.add('d-none');
            }
        }
    });
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
    // Create a proper URL without 'viewer.html' in the path
    const baseUrl = window.location.origin + '/';
    const newUrl = baseUrl + '#' + accountId;
    
    // Update browser URL without refresh
    history.pushState(null, '', newUrl);
    
    // Update document title to reflect the current account
    if (accountId && accountId.includes('=')) {
        const [platform, uid] = accountId.split('=');
        document.title = `${platform} Account ${uid} - Idle Heroes Account Viewer`;
    }
    
    console.log('URL updated to:', newUrl);
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