/**
 * Account Downloader
 * Provides account data download functionality for Idle Heroes accounts
 */

class AccountDownloader {
    /**
     * Create a new simulator instance
     */
    constructor() {
        this.progressBar = document.getElementById('download-bar');
        this.statusText = document.getElementById('download-status');
    }

    /**
     * Update download progress UI
     * @param {number} percent - Progress percentage (0-100)
     * @param {string} status - Status message to display
     */
    updateProgress(percent, status) {
        if (this.progressBar) {
            this.progressBar.style.width = `${percent}%`;
        }
        
        if (this.statusText) {
            this.statusText.textContent = status;
        }
        
        console.log(`Download progress: ${percent}% - ${status}`);
    }

    /**
     * Create a delay
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Download account data with progress indicators
     * @param {string} platform - iOS or Android
     * @param {string} uid - User ID
     * @returns {Promise<Object>} Account data
     */
    async downloadAccountData(platform, uid) {
        // Reset progress
        this.updateProgress(0, 'Initializing...');
        await this.delay(800);
        
        // Connection phase
        this.updateProgress(10, `Connecting to ${platform} servers...`);
        await this.delay(1500);
        
        // Authentication phase
        this.updateProgress(20, 'Authentication in progress...');
        await this.delay(1200);
        
        // Request phase
        this.updateProgress(30, `Requesting account #${uid} data...`);
        await this.delay(1800);
        
        // Random chance to simulate data not found (10% chance)
        if (Math.random() < 0.10) {
            this.updateProgress(40, 'Unable to locate account data...');
            await this.delay(1500);
            
            // Safari redirect simulation
            if (platform === 'iOS') {
                this.updateProgress(50, 'Redirecting to Safari for authentication...');
                await this.delay(2000);
                
                // Show Safari redirection dialog
                this.showSafariRedirectDialog(uid);
                
                // Abort download process
                throw new Error('Account not found. Redirecting to Safari...');
            } else {
                this.updateProgress(50, 'Redirecting to Google Play Services...');
                await this.delay(2000);
                
                // Show Play Store redirection dialog
                this.showPlayStoreRedirectDialog(uid);
                
                // Abort download process
                throw new Error('Account not found. Redirecting to Google Play...');
            }
        }
        
        // Secure connection phase
        this.updateProgress(45, 'Establishing secure connection...');
        await this.delay(1000);
        
        // Download phases
        this.updateProgress(60, 'Downloading profile data...');
        await this.delay(1500);
        
        // Simulate server delay variation (feels more realistic)
        if (Math.random() > 0.5) {
            this.updateProgress(65, 'Waiting for server response...');
            await this.delay(Math.random() * 1000 + 500);
        }
        
        this.updateProgress(75, 'Downloading hero collection...');
        await this.delay(1200);
        
        this.updateProgress(85, 'Downloading inventory data...');
        await this.delay(1000);
        
        // Random chance for additional processing
        if (Math.random() > 0.7) {
            this.updateProgress(90, 'Downloading resource files...');
            await this.delay(800);
        }
        
        // Processing phase
        this.updateProgress(95, 'Processing account data...');
        await this.delay(1300);
        
        // Complete
        this.updateProgress(100, 'Download complete!');
        await this.delay(800);
        
        // Generate demo data customized to the platform and UID
        return this.generateCustomDemoData(platform, uid);
    }
    
    /**
     * Display Safari redirection dialog for iOS users
     * @param {string} uid - User ID that couldn't be found
     */
    showSafariRedirectDialog(uid) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'safari-redirect-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        overlay.style.zIndex = '10000';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        
        // Create modal content
        const modal = document.createElement('div');
        modal.className = 'safari-redirect-modal';
        modal.style.backgroundColor = '#171722';
        modal.style.borderRadius = '10px';
        modal.style.padding = '20px';
        modal.style.maxWidth = '500px';
        modal.style.width = '80%';
        modal.style.boxShadow = '0 0 20px rgba(255, 187, 0, 0.5)';
        modal.style.border = '1px solid #ffd700';
        
        // Apple logo (emoji as placeholder)
        const logo = document.createElement('div');
        logo.innerHTML = '🍎';
        logo.style.fontSize = '48px';
        logo.style.textAlign = 'center';
        logo.style.margin = '10px 0';
        
        // Modal header
        const header = document.createElement('h3');
        header.textContent = 'Apple ID Authentication Required';
        header.style.color = 'white';
        header.style.textAlign = 'center';
        header.style.marginBottom = '15px';
        
        // Modal message
        const message = document.createElement('p');
        message.innerHTML = `We need to verify your Apple ID to access account <strong>${uid}</strong>. You will be redirected to Safari browser to complete this process.`;
        message.style.color = '#ddd';
        message.style.marginBottom = '20px';
        message.style.textAlign = 'center';
        message.style.lineHeight = '1.5';
        
        // Redirect button
        const redirectButton = document.createElement('button');
        redirectButton.textContent = 'Open in Safari';
        redirectButton.style.backgroundColor = '#007aff';
        redirectButton.style.color = 'white';
        redirectButton.style.border = 'none';
        redirectButton.style.borderRadius = '5px';
        redirectButton.style.padding = '10px 20px';
        redirectButton.style.width = '100%';
        redirectButton.style.cursor = 'pointer';
        redirectButton.style.fontSize = '16px';
        redirectButton.style.fontWeight = 'bold';
        
        // Cancel link
        const cancelLink = document.createElement('a');
        cancelLink.textContent = 'Cancel';
        cancelLink.href = '#';
        cancelLink.style.color = '#007aff';
        cancelLink.style.textAlign = 'center';
        cancelLink.style.display = 'block';
        cancelLink.style.marginTop = '15px';
        cancelLink.style.textDecoration = 'none';
        
        // Build modal
        modal.appendChild(logo);
        modal.appendChild(header);
        modal.appendChild(message);
        modal.appendChild(redirectButton);
        modal.appendChild(cancelLink);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Handle button click
        redirectButton.addEventListener('click', () => {
            window.location.href = `https://appleid.apple.com/auth/authorize?uid=${uid}&game=idleheroes`;
        });
        
        // Handle cancel
        cancelLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.removeChild(overlay);
            // Reset UI
            const loadingElement = document.getElementById('loading');
            if (loadingElement) loadingElement.classList.add('d-none');
            
            const contentElement = document.getElementById('content');
            if (contentElement) contentElement.classList.remove('d-none');
        });
    }

    /**
     * Display Play Store redirection dialog for Android users
     * @param {string} uid - User ID that couldn't be found
     */
    showPlayStoreRedirectDialog(uid) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'playstore-redirect-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        overlay.style.zIndex = '10000';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        
        // Create modal content
        const modal = document.createElement('div');
        modal.className = 'playstore-redirect-modal';
        modal.style.backgroundColor = '#202124';
        modal.style.borderRadius = '10px';
        modal.style.padding = '20px';
        modal.style.maxWidth = '500px';
        modal.style.width = '80%';
        modal.style.boxShadow = '0 0 20px rgba(76, 175, 80, 0.5)';
        modal.style.border = '1px solid #4CAF50';
        
        // Google Play logo (emoji as placeholder)
        const logo = document.createElement('div');
        logo.innerHTML = '▶️';
        logo.style.fontSize = '48px';
        logo.style.textAlign = 'center';
        logo.style.margin = '10px 0';
        
        // Modal header
        const header = document.createElement('h3');
        header.textContent = 'Google Play Authentication Required';
        header.style.color = 'white';
        header.style.textAlign = 'center';
        header.style.marginBottom = '15px';
        
        // Modal message
        const message = document.createElement('p');
        message.innerHTML = `We need to verify your Google Play account to access profile <strong>${uid}</strong>. You will be redirected to Google Play Services to complete this process.`;
        message.style.color = '#ddd';
        message.style.marginBottom = '20px';
        message.style.textAlign = 'center';
        message.style.lineHeight = '1.5';
        
        // Redirect button
        const redirectButton = document.createElement('button');
        redirectButton.textContent = 'Open Google Play';
        redirectButton.style.backgroundColor = '#4CAF50';
        redirectButton.style.color = 'white';
        redirectButton.style.border = 'none';
        redirectButton.style.borderRadius = '5px';
        redirectButton.style.padding = '10px 20px';
        redirectButton.style.width = '100%';
        redirectButton.style.cursor = 'pointer';
        redirectButton.style.fontSize = '16px';
        redirectButton.style.fontWeight = 'bold';
        
        // Cancel link
        const cancelLink = document.createElement('a');
        cancelLink.textContent = 'Cancel';
        cancelLink.href = '#';
        cancelLink.style.color = '#4CAF50';
        cancelLink.style.textAlign = 'center';
        cancelLink.style.display = 'block';
        cancelLink.style.marginTop = '15px';
        cancelLink.style.textDecoration = 'none';
        
        // Build modal
        modal.appendChild(logo);
        modal.appendChild(header);
        modal.appendChild(message);
        modal.appendChild(redirectButton);
        modal.appendChild(cancelLink);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Handle button click
        redirectButton.addEventListener('click', () => {
            window.location.href = `https://play.google.com/games/auth?uid=${uid}&game=idleheroes`;
        });
        
        // Handle cancel
        cancelLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.removeChild(overlay);
            // Reset UI
            const loadingElement = document.getElementById('loading');
            if (loadingElement) loadingElement.classList.add('d-none');
            
            const contentElement = document.getElementById('content');
            if (contentElement) contentElement.classList.remove('d-none');
        });
    }

    /**
     * Generate customized demo data based on platform and UID
     * @param {string} platform - iOS or Android
     * @param {string} uid - User ID
     * @returns {Object} Customized demo data
     */
    generateCustomDemoData(platform, uid) {
        // Basic structure that would normally come from the server
        const demoData = {
            user: {
                uid: uid,
                level: 125 + (parseInt(uid) % 100),
                vip: Math.min(12, (parseInt(uid) % 15)),
                name: platform === 'iOS' ? `iPlayer${uid}` : `droidUser${uid}`,
                server: platform === 'iOS' ? `iOS-S${Math.floor(parseInt(uid) / 1000)}` : `Android-${Math.floor(parseInt(uid) / 1000)}`,
                power: 10000000 + (parseInt(uid) * 1000),
                guild: platform === 'iOS' ? "Apple Knights" : "Droid Warriors",
                created: new Date().toISOString(),
                platform: platform
            },
            heroes: [
                // Generate some heroes based on UID
                { id: 1, name: "Garuda", stars: 10, level: 250, power: 150000 },
                { id: 2, name: "Tix", stars: 9, level: 220, power: 120000 },
                { id: 3, name: "Penny", stars: 10, level: 250, power: 140000 }
            ],
            inventory: {
                gold: 1000000000 + (parseInt(uid) * 10000),
                gems: 50000 + (parseInt(uid) % 10000),
                items: [
                    { id: 1, name: "Hero Scroll", count: 500 + (parseInt(uid) % 500) },
                    { id: 2, name: "Prophet Orb", count: 200 + (parseInt(uid) % 300) }
                ]
            }
        };
        
        return demoData;
    }
}

// Create global instance
window.accountDownloader = new AccountDownloader();
