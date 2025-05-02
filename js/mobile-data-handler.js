/**
 * Mobile Data Handler for Idle Heroes Account Viewer
 * 
 * This script captures data from the Idle Heroes mobile app via iOS profiles
 * and stores it for display in the viewer.
 */

class MobileDataHandler {
    constructor() {
        // Initialize handler
        this.initialize();
    }
    
    /**
     * Initialize the mobile data handler
     */
    initialize() {
        console.log('Initializing mobile data handler...');
        
        // Check for data in URL parameters (from iOS profiles)
        this.checkUrlParameters();
        
        // Listen for storage events (for cross-tab communication)
        window.addEventListener('storage', (event) => {
            if (event.key && event.key.startsWith('mobile_upload_')) {
                console.log('Detected mobile data upload in another tab');
                // Reload page to display new data if on viewer page
                if (window.location.pathname.includes('viewer.html')) {
                    window.location.reload();
                }
            }
        });
    }
    
    checkUrlForData() {
        // Get query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const data = urlParams.get('data');
        
        if (data) {
            this.processData(data);
        }
    }
    
    handlePostMessage(event) {
        // Handle post messages from iOS WebKit views
        if (!event.data) return;
        
        try {
            const message = typeof event.data === 'string' 
                ? JSON.parse(event.data) 
                : event.data;
            
            if (message.type === 'accountData' && message.data) {
                this.processData(message.data);
            }
        } catch (error) {
            console.error('Error processing post message:', error);
        }
    }
    
    processData(data) {
        try {
            // If data is a string, try to parse it
            const dataObj = typeof data === 'string' 
                ? JSON.parse(data) 
                : data;
            
            if (!dataObj || !dataObj.platform || !dataObj.uid) {
                throw new Error('Invalid data format: missing platform or uid');
            }
            
            // Store the data in localStorage
            this.storeData(dataObj.platform, dataObj.uid, data);
            
            // Redirect to viewer
            this.redirectToViewer(dataObj.platform, dataObj.uid);
        } catch (error) {
            console.error('Error processing data:', error);
            alert('Error processing account data: ' + error.message);
        }
    }
    
    storeData(platform, uid, data) {
        try {
            // Key format: mobile_upload_iOS_12345678
            const key = `mobile_upload_${platform}_${uid}`;
            localStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
            console.log(`Data stored successfully for ${platform} user ${uid}`);
            
            // Also store in sessionStorage as backup
            if (window.sessionStorage) {
                sessionStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
            }
            
            return true;
        } catch (error) {
            console.error('Error storing data:', error);
            return false;
        }
    }
    
    redirectToViewer(platform, uid) {
        // Get base URL to handle both local and GitHub Pages deployment
        const baseUrl = window.location.pathname.includes('github.io') ? 
            window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/') + '/' :
            window.location.origin + '/';
        
        console.log(`Redirecting to viewer with base URL: ${baseUrl}`);
        window.location.href = `${baseUrl}viewer.html#${platform}=${uid}`;
    }
    
    /**
     * Check if we have data for a specific account
     * @param {string} platform - Platform (iOS/Android)
     * @param {string} uid - User ID
     * @returns {boolean} True if data exists
     */
    hasData(platform, uid) {
        const key = `mobile_upload_${platform}_${uid}`;
        return localStorage.getItem(key) !== null || 
               (window.sessionStorage && sessionStorage.getItem(key) !== null);
    }
    
    /**
     * Get stored data for an account
     * @param {string} platform - Platform (iOS/Android)
     * @param {string} uid - User ID
     * @returns {string|null} Stored data or null
     */
    getData(platform, uid) {
        const key = `mobile_upload_${platform}_${uid}`;
        
        // Try localStorage first
        let data = localStorage.getItem(key);
        
        // If not in localStorage, try sessionStorage
        if (!data && window.sessionStorage) {
            data = sessionStorage.getItem(key);
        }
        
        return data;
    }
}

// Initialize the handler
document.addEventListener('DOMContentLoaded', () => {
    window.mobileDataHandler = new MobileDataHandler();
});

// Export for use in other files
if (typeof module !== 'undefined') {
    module.exports = { MobileDataHandler };
}
