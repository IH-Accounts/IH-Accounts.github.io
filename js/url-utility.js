/**
 * URL Utility for Idle Heroes Account Viewer
 * Handles URL manipulation and QR code generation
 */

class UrlUtility {
    /**
     * Extract account ID from URL hash
     * @returns {Object|null} Object with accountId and platform if found, null otherwise
     */
    static getAccountIdFromUrl() {
        const hash = window.location.hash;
        if (!hash || hash.length <= 1) return null;
        
        // Remove the # character
        const hashContent = hash.substring(1);
        
        // Check for new format: Platform=UID
        if (hashContent.includes('=')) {
            const parts = hashContent.split('=');
            if (parts.length === 2) {
                const platform = parts[0]; // iOS or Android
                const uid = parts[1];
                
                // Validate platform
                if (platform === 'iOS' || platform === 'Android' || platform === 'account') {
                    return {
                        accountId: uid,
                        platform: platform === 'account' ? null : platform
                    };
                }
            }
        }
        
        // Backward compatibility with old format
        if (hashContent.startsWith('account=')) {
            return {
                accountId: hashContent.substring('account='.length),
                platform: null
            };
        }
        
        // If data is embedded directly (not in account=X format)
        if (hashContent.length > 20 && !hashContent.includes('=')) {
            return {
                accountId: null,
                platform: null,
                embeddedData: hashContent
            };
        }
        
        return null;
    }
    
    /**
     * Generate a share URL for an account
     * @param {string} accountId - Account ID
     * @param {string} platform - Platform (iOS or Android)
     * @param {string} [baseUrl] - Base URL (defaults to current URL without hash)
     * @returns {string} Full share URL
     */
    static generateShareUrl(accountId, platform = null, baseUrl = null) {
        if (!baseUrl) {
            baseUrl = window.location.href.split('#')[0];
        }
        
        // Use the new Platform=UID format if platform is provided
        if (platform && (platform === 'iOS' || platform === 'Android')) {
            return `${baseUrl}#${platform}=${accountId}`;
        }
        
        // Fallback to old format for backward compatibility
        return `${baseUrl}#account=${accountId}`;
    }
    
    /**
     * Generate QR code for a URL
     * @param {string} url - URL to encode in QR
     * @param {string} elementId - ID of canvas element to render QR code to
     */
    static generateQRCode(url, elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Clear previous QR code
        element.innerHTML = '';
        
        // Generate new QR code
        QRCode.toCanvas(element, url, { width: 200 }, function (error) {
            if (error) console.error('Error generating QR code:', error);
        });
    }
    
    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {boolean} Success status
     */
    static copyToClipboard(text) {
        // Create temporary input element
        const input = document.createElement('input');
        input.style.position = 'fixed';
        input.style.opacity = 0;
        input.value = text;
        document.body.appendChild(input);
        
        // Select and copy
        input.select();
        input.setSelectionRange(0, 99999);
        const success = document.execCommand('copy');
        
        // Remove temporary element
        document.body.removeChild(input);
        
        return success;
    }
    
    /**
     * Share URL via navigator.share if available
     * @param {string} url - URL to share
     * @param {string} title - Title for share
     * @returns {Promise<boolean>} Promise resolving to success status
     */
    static async shareUrl(url, title = 'Idle Heroes Account Data') {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: 'Check out my Idle Heroes account data!',
                    url: url,
                });
                return true;
            } catch (error) {
                console.error('Error sharing URL:', error);
                return false;
            }
        } else {
            // Fallback to copy
            const success = this.copyToClipboard(url);
            return success;
        }
    }
    
    /**
     * Validate URL hash to check if it contains valid data
     * @param {string} hash - URL hash to validate
     * @returns {Object} Validation result with status and message
     */
    static validateUrlHash(hash) {
        if (!hash) {
            return { valid: false, message: 'No data provided in URL.' };
        }
        
        // Check for Platform=UID format (iOS=12345678 or Android=12345678)
        if (/^(iOS|Android)=([\w\d-]+)$/.test(hash)) {
            const platform = hash.split('=')[0];
            return { valid: true, type: 'platform', platform: platform, message: `Valid ${platform} account URL` };
        }
        
        // Check if it's an account URL (old format)
        if (/account=([^&]+)/.test(hash)) {
            return { valid: true, type: 'account', message: 'Valid account URL' };
        }
        
        // Try to decompress data
        try {
            const data = DataCompressor.decompressFromUrl(hash);
            if (!data) {
                return { valid: false, message: 'Failed to decompress data from URL.' };
            }
            
            // Check for required fields
            if (!data.user && !data.u) {
                return { valid: false, message: 'Missing user data in the URL.' };
            }
            
            return { valid: true, type: 'data', message: 'Valid data URL' };
        } catch (error) {
            return { valid: false, message: `Invalid URL data: ${error.message}` };
        }
    }
}

// Make available globally
window.UrlUtility = UrlUtility;
