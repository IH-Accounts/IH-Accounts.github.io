/**
 * Account Redirector System
 * 
 * This script handles permanent account URLs and redirects them to the latest data.
 * It allows users to share a constant URL that always shows the latest account data.
 */

class AccountRedirector {
    constructor() {
        this.baseUrl = "https://ih-accounts.github.io";
        this.dataPath = "/data/accounts/";
        this.init();
    }

    init() {
        // Check if we're on a page with a hash-based account identifier
        const hash = window.location.hash.substring(1);
        
        // Check if this is a Platform=UID format (e.g., iOS=123456)
        if (hash && (hash.includes('iOS=') || hash.includes('Android='))) {
            this.handleAccountRedirect(hash);
        }
    }
    
    /**
     * Handle account redirection to the latest data
     * @param {string} accountIdentifier - The platform=uid identifier (e.g., iOS=123456)
     */
    handleAccountRedirect(accountIdentifier) {
        console.log(`Loading latest data for account: ${accountIdentifier}`);
        
        // First, check if there's cached data in IndexedDB
        this.checkLocalCache(accountIdentifier)
            .then(cachedData => {
                if (cachedData) {
                    // Use cached data if available
                    console.log("Using cached account data from IndexedDB");
                    // No need to redirect, just update the current view
                    this.loadDataIntoViewer(accountIdentifier, cachedData);
                } else {
                    // Otherwise fetch from the data repository
                    this.fetchLatestData(accountIdentifier)
                        .then(data => {
                            if (data) {
                                // No need to redirect, just update the current view
                                this.loadDataIntoViewer(accountIdentifier, data);
                            } else {
                                this.showError(`No data found for account: ${accountIdentifier}`);
                            }
                        })
                        .catch(error => {
                            console.error("Error fetching latest data:", error);
                            this.showError("Could not load account data. Please try again later.");
                        });
                }
            });
    }
    
    /**
     * Check local cache for account data
     * @param {string} accountIdentifier - The platform=uid identifier
     * @returns {Promise<string|null>} Cached data if available
     */
    async checkLocalCache(accountIdentifier) {
        // Check for data in local storage
        try {
            const storage = window.localStorage;
            const cacheKey = `account_${accountIdentifier}`;
            
            if (storage && storage.getItem(cacheKey)) {
                const cacheData = JSON.parse(storage.getItem(cacheKey));
                
                // Check if cache is fresh (less than 1 hour old)
                const cacheTime = cacheData.timestamp;
                const now = Date.now();
                const cacheAgeMs = now - cacheTime;
                
                // One hour cache validity
                if (cacheAgeMs < 3600000) {
                    console.log('Using cached account data from localStorage');
                    return cacheData.data;
                } else {
                    console.log('Cache expired, fetching new data');
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error checking cache:', error);
            return null;
        }
    }
    
    /**
     * Fetch latest data for an account from the data repository
     * @param {string} accountIdentifier - The platform=uid identifier
     * @returns {Promise<string>} Compressed account data
     */
    async fetchLatestData(accountIdentifier) {
        try {
            // Parse account identifier
            const [platform, uid] = accountIdentifier.split('=');
            
            if (!platform || !uid) {
                console.error('Invalid account identifier format');
                return null;
            }
            
            // Form URL to the data file in the repository
            // Use hash format consistently - /data/accounts/ios/12345.json
            const dataUrl = `${this.baseUrl}${this.dataPath}${platform.toLowerCase()}/${uid}.json`;
            console.log(`Fetching account data from: ${dataUrl}`);
            
            // Fetch the data file
            const response = await fetch(dataUrl);
            
            if (!response.ok) {
                console.error(`Failed to fetch data: ${response.status} ${response.statusText}`);
                // Try to use mock data for testing if available
                const mockData = await this.getMockData(platform, uid);
                if (mockData) {
                    return mockData;
                }
                return null;
            }
            
            // Parse the data file
            const data = await response.json();
            
            if (!data || !data.compressed) {
                console.error('Invalid data format');
                return null;
            }
            
            // Cache the data locally
            await this.cacheDataLocally(accountIdentifier, data.compressed);
            
            // Return the compressed data
            return data.compressed;
        } catch (error) {
            console.error('Error fetching latest data:', error);
            return null;
        }
    }
    
    /**
     * Get mock data for testing
     * @param {string} platform - Platform (iOS, Android)
     * @param {string} uid - User ID
     * @returns {Promise<string|null>} Mock data if available
     */
    async getMockData(platform, uid) {
        try {
            // Check if MockDataProvider is available
            if (window.MockDataProvider) {
                console.log('Using mock data for testing');
                return window.MockDataProvider.getMockData(platform, uid);
            }
            return null;
        } catch (error) {
            console.error('Error getting mock data:', error);
            return null;
        }
    }

    /**
     * Cache data locally for faster access
     * @param {string} accountIdentifier - The platform=uid identifier
     * @param {string} data - Compressed account data
     */
    async cacheDataLocally(accountIdentifier, data) {
        try {
            // Store in localStorage for quick access
            const storage = window.localStorage;
            if (storage) {
                const cacheKey = `account_${accountIdentifier}`;
                const cacheData = {
                    timestamp: Date.now(),
                    data: data
                };
                storage.setItem(cacheKey, JSON.stringify(cacheData));
                console.log('Account data cached in localStorage');
            }
        } catch (error) {
            console.error('Error caching data locally:', error);
        }
    }
    
    /**
     * Load data directly into the viewer without redirection
     * @param {string} accountIdentifier - The platform=uid identifier
     * @param {string} data - The compressed account data
     */
    loadDataIntoViewer(accountIdentifier, data) {
        // If we're already on the viewer page, just update the content
        if (window.location.pathname.endsWith('viewer.html')) {
            // Check if we have the IdleHeroesViewer instance available
            if (window.viewer) {
                window.viewer.loadAccountData(accountIdentifier, data);
                // Update the URL without reloading the page (for shareable links)
                const newUrl = `${window.location.origin}${window.location.pathname}#${accountIdentifier}`;
                window.history.replaceState({}, document.title, newUrl);
                return;
            }
        }
        
        // Otherwise, redirect to the viewer with data
        const viewerUrl = `${this.baseUrl}/viewer.html#${accountIdentifier}`;
        window.location.href = viewerUrl;
    }
    
    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        console.error(message);
        // Check if we're on the viewer page
        if (window.location.pathname.endsWith('viewer.html')) {
            // Show error in the viewer
            const errorElement = document.getElementById('error');
            const errorMessageElement = document.getElementById('error-message');
            
            if (errorElement && errorMessageElement) {
                errorMessageElement.textContent = message;
                errorElement.classList.remove('d-none');
                document.getElementById('loading').classList.add('d-none');
            }
        } else {
            // Otherwise redirect to viewer with error param
            const viewerUrl = `${this.baseUrl}/viewer.html?error=${encodeURIComponent(message)}`;
            window.location.href = viewerUrl;
        }
    }
}

// Initialize the redirector
document.addEventListener('DOMContentLoaded', () => {
    window.accountRedirector = new AccountRedirector();
});