/**
 * Mobile Data Receiver for Idle Heroes Account Viewer
 * 
 * Handles data sent from mobile devices (iOS/Android) to the account viewer.
 * Supports both URL parameters and postMessage events.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Mobile receiver initialized');

    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('data');
    
    if (data) {
        try {
            console.log('Found data in URL parameters');
            processData(data);
        } catch (error) {
            console.error('Error processing URL data:', error);
        }
    }
    
    // Listen for postMessage events
    window.addEventListener('message', function(event) {
        console.log('Received message event:', event);
        
        if (!event.data) return;
        
        try {
            const message = typeof event.data === 'string' 
                ? JSON.parse(event.data) 
                : event.data;
            
            if (message.type === 'idleHeroesData' && message.data) {
                console.log('Received Idle Heroes data via postMessage');
                processData(message.data);
            }
        } catch (error) {
            console.error('Error processing postMessage:', error);
        }
    });
    
    // Process and store data
    function processData(data) {
        try {
            // If data is a string, try to parse it
            const dataObj = typeof data === 'string' && data.startsWith('{') 
                ? JSON.parse(data) 
                : data;
            
            if (typeof dataObj === 'object' && dataObj !== null) {
                if (!dataObj.platform || !dataObj.uid) {
                    throw new Error('Invalid data format: missing platform or uid');
                }
                
                // Store the data
                storeData(dataObj.platform, dataObj.uid, data);
                
                // Redirect to viewer
                redirectToViewer(dataObj.platform, dataObj.uid);
            } else {
                // Handle compressed data format
                const platform = 'iOS'; // Default to iOS for legacy integration
                const uid = `mobile_${Date.now()}`; // Generate unique ID
                
                storeData(platform, uid, data);
                redirectToViewer(platform, uid);
            }
        } catch (error) {
            console.error('Error processing data:', error);
            alert('Error processing account data: ' + error.message);
        }
    }
    
    // Store data in localStorage
    function storeData(platform, uid, data) {
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
    
    // Redirect to viewer with account hash
    function redirectToViewer(platform, uid) {
        // Get base URL to handle both local and GitHub Pages deployment
        const baseUrl = window.location.pathname.includes('github.io') ? 
            window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/') + '/' :
            window.location.origin + '/';
        
        console.log(`Redirecting to viewer with base URL: ${baseUrl}`);
        window.location.href = `${baseUrl}viewer.html#${platform}=${uid}`;
    }
});
