/**
 * Fix for landing page redirect issues
 * This script prevents unwanted redirects from viewer.html
 */

// Execute when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Landing fix initialized');
    
    // Stop automatic redirects to landing page
    if (window.location.pathname.includes('viewer.html')) {
        console.log('Viewer page detected - preventing redirects');
        
        // Intercept and stop redirects
        const originalReplace = window.location.replace;
        const originalAssign = window.location.assign;
        
        // Override redirect methods if on viewer page
        if (window.preventRedirects) {
            window.location.replace = function(url) {
                console.log('Prevented redirect to:', url);
                
                // Only allow specific redirects
                if (url.includes('viewer.html') || url.includes('#')) {
                    console.log('Allowing viewer-related redirect');
                    return originalReplace.call(window.location, url);
                }
                
                // Block other redirects
                console.log('Blocked redirect to:', url);
                return false;
            };
            
            window.location.assign = function(url) {
                console.log('Prevented assign to:', url);
                
                // Only allow specific redirects
                if (url.includes('viewer.html') || url.includes('#')) {
                    console.log('Allowing viewer-related navigation');
                    return originalAssign.call(window.location, url);
                }
                
                // Block other redirects
                console.log('Blocked navigation to:', url);
                return false;
            };
            
            console.log('Redirect prevention active');
        }
    }
    
    // Fix hash links to work properly
    if (window.location.hash && window.location.pathname.includes('viewer.html')) {
        console.log('Found hash in URL:', window.location.hash);
        
        // Force viewer to use this hash
        const hashValue = window.location.hash.substring(1);
        
        // Store in sessionStorage to prevent loss during page transitions
        if (hashValue && hashValue.includes('=')) {
            sessionStorage.setItem('currentAccountId', hashValue);
            console.log('Saved account ID to session:', hashValue);
        }
    }
    
    // Recover from sessionStorage if needed
    if (window.location.pathname.includes('viewer.html') && !window.location.hash) {
        const savedAccount = sessionStorage.getItem('currentAccountId');
        if (savedAccount) {
            console.log('Recovering account ID from session:', savedAccount);
            window.location.hash = savedAccount;
        }
    }
});
