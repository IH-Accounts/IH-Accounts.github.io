/**
 * Idle Heroes Viewer - Main Application Class
 * 
 * Core functionality for viewing, filtering and displaying Idle Heroes account data
 * with persistent URL support and local database storage.
 */

class IdleHeroesViewer {
    /**
     * Create a new Idle Heroes Viewer instance
     */
    constructor() {
        // Initialize properties
        this.data = null;
        this.activeTab = 'summary';
        this.accountId = null;
        this.persistentUrl = null;
        
        // Initialize UI elements
        this.loadingElement = document.getElementById('loading');
        this.errorElement = document.getElementById('error');
        this.errorMessageElement = document.getElementById('error-message');
        this.contentElement = document.getElementById('content');
        
        // Initialize the viewer
        this.initialize();
    }
    
    /**
     * Initialize the viewer and load data from URL or IndexedDB
     */
    async initialize() {
        try {
            // Show loading indicator
            this.showLoading(true);
            
            // Get hash from URL (excluding the # character)
            const hash = window.location.hash.substring(1);
            console.log('Initializing with hash:', hash);
            
            // Make content visible first
            this.showContent();
            
            // If hash is empty, load demo data
            if (!hash || hash.trim() === '') {
                console.log('No hash provided, loading demo data');
                this.loadDemoData();
                return;
            }
            
            // Validate URL hash
            const validation = UrlUtility.validateUrlHash(hash);
            if (!validation.valid) {
                console.warn('Invalid hash format, loading demo data instead');
                this.loadDemoData();
                return;
            }
            
            // Check if this is an account URL format or data URL
            if (validation.type === 'account') {
                // This is a persistent account URL
                this.accountId = UrlUtility.getAccountIdFromUrl();
                console.log(`Loading data for account: ${this.accountId}`);
                
                // Try to load from local database
                const accountData = await DBManager.loadAccountData(this.accountId);
                
                if (accountData) {
                    // Data found in local storage
                    this.data = accountData;
                    window.currentData = accountData; // Store globally for sharing
                    this.setupShareSection();
                    this.renderData();
                    // Generate QR code for sharing
                    this.generateAccountQRCode();
                } else {
                    this.showError(`No data found for account ID: ${this.accountId}. It may not exist or has expired.`);
                }
            } else {
                // This is a direct data URL with compressed data
                console.log('Loading data from URL hash...');
                
                // Small delay to allow UI to update
                setTimeout(async () => {
                    try {
                        // Decompress the data
                        this.data = DataCompressor.decompressFromUrl(hash);
                        
                        if (!this.data) {
                            throw new Error('Failed to decompress data from URL');
                        }
                        
                        // Expand optimized data if needed
                        if (this.data.u || this.data.h || this.data.i) {
                            this.data = DataCompressor.expandOptimized(this.data);
                        }
                        
                        // Store globally for sharing
                        window.currentData = this.data;
                        
                        // Extract account ID if possible
                        const user = this.data.user || {};
                        const uid = user.uid || '';
                        const serverId = user.server_id || '';
                        
                        if (uid && serverId) {
                            this.accountId = `${uid}-${serverId}`;
                            console.log(`Extracted account ID: ${this.accountId}`);
                            
                            // Save to local database for future persistence
                            await DBManager.saveAccountData(this.accountId, this.data);
                            
                            // Create a persistent URL
                            this.persistentUrl = UrlUtility.generateAccountUrl(this.accountId, false);
                        }
                        
                        // Setup sharing section and render the data
                        this.setupShareSection();
                        this.renderData();
                        
                        // Generate QR code if we have an account ID
                        if (this.accountId) {
                            this.generateAccountQRCode();
                        }
                    } catch (error) {
                        console.error('Error decompressing data:', error);
                        this.showError(`Error decompressing data: ${error.message}`);
                    } finally {
                        this.showLoading(false);
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Error processing data:', error);
            this.showError(`Error processing data: ${error.message}`);
            this.showLoading(false);
        }
    }
    
    /**
     * Show or hide loading indicator
     * @param {boolean} show - Whether to show loading indicator
     * @param {string} message - Optional message to display while loading
     */
    showLoading(show = true, message = 'Loading account data...') {
        if (this.loadingElement) {
            if (show) {
                // Reset progress bar to initial state when showing
                const progressBar = document.getElementById('download-bar');
                const statusText = document.getElementById('download-status');
                
                if (progressBar) {
                    progressBar.style.width = '0%';
                }
                
                if (statusText) {
                    statusText.textContent = 'Initializing...';
                }
                
                // Set loading message
                const loadingText = document.querySelector('.loading-text');
                if (loadingText && message) {
                    loadingText.textContent = message;
                }
                
                this.loadingElement.classList.remove('d-none');
            } else {
                this.loadingElement.classList.add('d-none');
            }
        }
        
        if (show) {
            if (this.errorElement) this.errorElement.style.display = 'none';
            if (this.contentElement) this.contentElement.style.display = 'none';
        }
    }
    
    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.showLoading(false);
        
        if (this.errorElement) {
            this.errorElement.style.display = 'block';
        }
        
        if (this.errorMessageElement) {
            this.errorMessageElement.textContent = message;
        }
        
        if (this.contentElement) {
            this.contentElement.style.display = 'none';
        }
    }
    
    /**
     * Show content section
     */
    showContent() {
        if (this.contentElement) {
            this.contentElement.classList.remove('d-none');
            this.errorElement.classList.add('d-none');
        }
    }
    
    /**
     * Setup the share section with persistent URL and QR code
     */
    setupShareSection() {
        // Create the share section if it doesn't exist
        if (!document.getElementById('share-section')) {
            const shareSection = document.createElement('div');
            shareSection.id = 'share-section';
            shareSection.className = 'mb-4';
            
            // Create share UI
            shareSection.innerHTML = `
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Share Your Idle Heroes Account</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="form-group mb-3">
                                    <label for="share-url">Permanent Account URL:</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="share-url" readonly>
                                        <button class="btn btn-outline-secondary" type="button" onclick="window.app.copyShareUrl()">
                                            <i class="bi bi-clipboard"></i> Copy
                                        </button>
                                    </div>
                                    <small class="text-muted">This URL will always show the latest data for this account.</small>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="include-data-checkbox" onchange="window.app.updateShareUrl()">
                                    <label class="form-check-label" for="include-data-checkbox">
                                        Include current data in URL (makes URL very long but works offline)
                                    </label>
                                </div>
                                <div class="d-grid gap-2 d-md-flex mb-3">
                                    <button class="btn btn-outline-primary" type="button" onclick="window.app.exportData()">
                                        <i class="bi bi-download"></i> Export Data (JSON)
                                    </button>
                                    <button class="btn btn-outline-danger" type="button" onclick="window.app.clearLocalData()">
                                        <i class="bi bi-trash"></i> Clear Local Data
                                    </button>
                                </div>
                                <div class="mb-3">
                                    <span class="badge bg-success" id="last-updated-badge">
                                        Last updated: <span id="last-updated-time">Unknown</span>
                                    </span>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <label>QR Code:</label>
                                <div id="qrcode-container" class="text-center">
                                    <canvas id="share-qrcode"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add to the document (before the tabs)
            this.contentElement.appendChild(shareSection);
        }
        
        // Update last updated time
        this.updateLastUpdatedTime();
        
        // Update the share URL
        this.updateShareUrl();
    }
    
    /**
     * Update the last updated timestamp display
     */
    updateLastUpdatedTime() {
        const lastUpdatedElement = document.getElementById('last-updated-time');
        if (!lastUpdatedElement) return;
        
        let timestamp = new Date().toISOString();
        
        // Try to get timestamp from data
        if (this.data) {
            if (this.data.metadata && this.data.metadata.timestamp) {
                timestamp = this.data.metadata.timestamp;
            } else if (this.data.m && this.data.m.t) {
                timestamp = this.data.m.t;
            }
        }
        
        // Format the timestamp
        const formattedDate = new Date(timestamp).toLocaleString();
        lastUpdatedElement.textContent = formattedDate;
    }
    
    /**
     * Update the share URL based on current account and settings
     */
    updateShareUrl() {
        const shareUrlInput = document.getElementById('share-url');
        if (!shareUrlInput) return;
        
        const includeDataCheckbox = document.getElementById('include-data-checkbox');
        const includeData = includeDataCheckbox && includeDataCheckbox.checked;
        
        let shareUrl;
        if (this.accountId) {
            // Generate URL with or without data
            shareUrl = UrlUtility.generateAccountUrl(this.accountId, includeData);
        } else if (this.data) {
            // Fallback to direct data URL if no account ID available
            const baseUrl = window.location.href.split('#')[0];
            const compressed = DataCompressor.compressForUrl(this.data);
            shareUrl = `${baseUrl}#${compressed}`;
        } else {
            shareUrl = window.location.href.split('#')[0];
        }
        
        shareUrlInput.value = shareUrl;
        
        // Update QR code
        this.generateAccountQRCode(shareUrl);
    }
    
    /**
     * Generate QR code for account sharing
     * @param {string} url - Optional URL to use for QR code. If not provided, generates from accountId
     */
    generateAccountQRCode(url = null) {
        if (!url && this.accountId) {
            url = UrlUtility.generateAccountUrl(this.accountId, false);
        } else if (!url && this.data) {
            const baseUrl = window.location.href.split('#')[0];
            const compressed = DataCompressor.compressForUrl(this.data);
            url = `${baseUrl}#${compressed}`;
        }
        
        if (url) {
            UrlUtility.generateQRCode(url, 'share-qrcode');
        }
    }
    
    /**
     * Copy share URL to clipboard
     */
    copyShareUrl() {
        const shareUrlInput = document.getElementById('share-url');
        if (!shareUrlInput) return;
        
        const success = UrlUtility.copyToClipboard(shareUrlInput.value);
        
        if (success) {
            // Show temporary success message
            const button = shareUrlInput.nextElementSibling;
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="bi bi-check"></i> Copied!';
                button.classList.add('btn-success');
                button.classList.remove('btn-outline-secondary');
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('btn-success');
                    button.classList.add('btn-outline-secondary');
                }, 2000);
            }
        }
    }
    
    /**
     * Export data as JSON download
     */
    exportData() {
        if (!this.data) return;
        
        try {
            // Create a well-formatted JSON string
            const dataStr = JSON.stringify(this.data, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            // Generate filename based on account ID or timestamp
            let filename = 'idle-heroes-data';
            if (this.accountId) {
                filename += `-${this.accountId}`;
            } else if (this.data.user && this.data.user.uid) {
                filename += `-${this.data.user.uid}`;
            }
            filename += `.json`;
            
            // Create and trigger download link
            const downloadLink = document.createElement('a');
            downloadLink.setAttribute('href', dataUri);
            downloadLink.setAttribute('download', filename);
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Error exporting data: ' + error.message);
        }
    }
    
    /**
     * Clear local data for this account
     */
    async clearLocalData() {
        if (!this.accountId) return;
        
        if (confirm(`Are you sure you want to clear all local data for account ${this.accountId}? You will need to generate new data from the game.`)) {
            try {
                await DBManager.deleteAccountData(this.accountId);
                alert('Local data has been cleared successfully.');
                // Redirect to clean page
                window.location.href = window.location.href.split('#')[0];
            } catch (error) {
                console.error('Error clearing data:', error);
                alert('Error clearing data: ' + error.message);
            }
        }
    }
    
    /**
     * Render data to the UI
     */
    renderData() {
        if (!this.data) {
            this.showError('No data available to render');
            return;
        }
        
        // Show content section
        this.showContent();
        
        // Create basic structure
        const tabsContainer = document.createElement('div');
        tabsContainer.innerHTML = `
            <ul class="nav nav-tabs" id="dataTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="summary-tab" data-bs-toggle="tab" data-bs-target="#summary" type="button" role="tab" aria-controls="summary" aria-selected="true">Summary</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="heroes-tab" data-bs-toggle="tab" data-bs-target="#heroes" type="button" role="tab" aria-controls="heroes" aria-selected="false">Heroes</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="inventory-tab" data-bs-toggle="tab" data-bs-target="#inventory" type="button" role="tab" aria-controls="inventory" aria-selected="false">Inventory</button>
                </li>
            </ul>
            <div class="tab-content" id="dataTabsContent">
                <div class="tab-pane fade show active" id="summary" role="tabpanel" aria-labelledby="summary-tab">
                    <!-- Summary content will be loaded here -->
                </div>
                <div class="tab-pane fade" id="heroes" role="tabpanel" aria-labelledby="heroes-tab">
                    <!-- Heroes content will be loaded here -->
                </div>
                <div class="tab-pane fade" id="inventory" role="tabpanel" aria-labelledby="inventory-tab">
                    <!-- Inventory content will be loaded here -->
                </div>
            </div>
        `;
        
        // Add to content area
        this.contentElement.appendChild(tabsContainer);
        
        // Render each section
        this.renderSummary();
        const metadata = this.data.metadata || {};
        const timestamp = metadata.timestamp || new Date().toISOString();
        const version = metadata.version || '1.0.0';
        
        // Create summary UI
        let summaryContent = `
            <div class="card mt-4">
                <div class="card-header bg-primary text-white">
                    <h4>Account Information</h4>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h5 class="mb-3">Player Details</h5>
                            <table class="table">
                                <tbody>
                                    <tr>
                                        <th>Player Name:</th>
                                        <td>${user.name || 'Unknown'}</td>
                                    </tr>
                                    <tr>
                                        <th>UID:</th>
                                        <td>${user.uid || 'Unknown'}</td>
                                    </tr>
                                    <tr>
                                        <th>Server:</th>
                                        <td>${user.server_id || 'Unknown'}</td>
                                    </tr>
                                    <tr>
                                        <th>Level:</th>
                                        <td>${user.level || 'Unknown'}</td>
                                    </tr>
                                    <tr>
                                        <th>Guild:</th>
                                        <td>${user.guild_name || 'None'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h5 class="mb-3">Account Stats</h5>
                            <div class="list-group">
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    Total Heroes
                                    <span class="badge bg-primary rounded-pill">${heroCount}</span>
                                </div>
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    Inventory Items
                                    <span class="badge bg-primary rounded-pill">${inventoryCount}</span>
                                </div>
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    Last Updated
                                    <span class="badge bg-info text-dark">${new Date(timestamp).toLocaleString()}</span>
                                </div>
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    Data Version
                                    <span class="badge bg-secondary">${version}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add permanent account link if available
        if (this.accountId) {
            summaryContent += `
                <div class="alert alert-info mt-3">
                    <h5><i class="bi bi-info-circle"></i> Permanent Account URL</h5>
                    <p>This account has a permanent URL that will always show the latest data:</p>
                    <code>${window.location.href.split('#')[0]}#account=${this.accountId}</code>
                    <p class="mt-2 mb-0">Bookmark this URL to easily access your account data in the future.</p>
                </div>
            `;
        }
        
        // Set the content
        summaryElement.innerHTML = summaryContent;
    }
    
    /**
     * Render heroes section
     */
    renderHeroes() {
        const heroesElement = document.getElementById('heroes');
        if (!heroesElement) return;
        
        // Get heroes data (handle both compressed and full format)
        const heroes = this.data.heroes || this.data.h || [];
        
        if (heroes.length === 0) {
            heroesElement.innerHTML = '<div class="alert alert-info">No heroes data available</div>';
            return;
        }
        
        // Create controls
        const controlsEl = document.createElement('div');
        controlsEl.className = 'row mb-3 mt-3';
        controlsEl.innerHTML = `
            <div class="col-md-6 mb-2">
                <input type="text" class="form-control" id="hero-search" placeholder="Search heroes...">
            </div>
            <div class="col-md-3 mb-2">
                <select class="form-select" id="hero-sort">
                    <option value="stars">Sort by Stars</option>
                    <option value="level">Sort by Level</option>
                    <option value="name">Sort by Name</option>
                </select>
            </div>
            <div class="col-md-3 mb-2">
                <select class="form-select" id="hero-filter">
                    <option value="all">All Heroes</option>
                    <option value="5+">5★ and above</option>
                    <option value="6+">6★ and above</option>
                    <option value="10">10★</option>
                    <option value="e1+">Enabled</option>
                </select>
            </div>
        `;
        
        // Create heroes container
        const heroesContainer = document.createElement('div');
        heroesContainer.className = 'row';
        heroesContainer.id = 'heroes-cards';
        
        // Add to heroes element
        heroesElement.innerHTML = '';
        heroesElement.appendChild(controlsEl);
        heroesElement.appendChild(heroesContainer);
        
        // Render hero cards
        this.renderHeroCards(heroes);
        
        // Add event listeners for controls
        document.getElementById('hero-search').addEventListener('input', () => this.filterHeroes());
        document.getElementById('hero-sort').addEventListener('change', () => this.filterHeroes());
        document.getElementById('hero-filter').addEventListener('change', () => this.filterHeroes());
    }
    
    /**
     * Render inventory section
     */
    renderInventory() {
        const inventoryElement = document.getElementById('inventory');
        if (!inventoryElement) return;
        
        // Get inventory data (handle both compressed and full format)
        const inventory = this.data.inventory || this.data.i || [];
        
        if (inventory.length === 0) {
            inventoryElement.innerHTML = '<div class="alert alert-info">No inventory data available</div>';
            return;
        }
        
        // Create controls
        const controlsEl = document.createElement('div');
        controlsEl.className = 'row mb-3 mt-3';
        controlsEl.innerHTML = `
            <div class="col-md-6 mb-2">
                <input type="text" class="form-control" id="item-search" placeholder="Search items...">
            </div>
            <div class="col-md-3 mb-2">
                <select class="form-select" id="item-sort">
                    <option value="count">Sort by Count</option>
                    <option value="name">Sort by Name</option>
                </select>
            </div>
            <div class="col-md-3 mb-2">
                <select class="form-select" id="item-filter">
                    <option value="all">All Items</option>
                    <option value="shards">Hero Shards</option>
                    <option value="resources">Resources</option>
                </select>
            </div>
        `;
        
        // Create items container
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'row';
        itemsContainer.id = 'items-cards';
        
        // Add to inventory element
        inventoryElement.innerHTML = '';
        inventoryElement.appendChild(controlsEl);
        inventoryElement.appendChild(itemsContainer);
        
        // Render item cards
        this.renderItemCards(inventory);
        
        // Add event listeners for controls
        document.getElementById('item-search').addEventListener('input', () => this.filterItems());
        document.getElementById('item-sort').addEventListener('change', () => this.filterItems());
        document.getElementById('item-filter').addEventListener('change', () => this.filterItems());
    }
    
    /**
     * Render hero cards
     * @param {Array} heroes - Array of hero objects
     */
    renderHeroCards(heroes) {
        const container = document.getElementById('heroes-cards');
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Sort heroes by stars (highest first)
        const sortedHeroes = [...heroes].sort((a, b) => {
            const aStars = a.stars || a.s || 0;
            const bStars = b.stars || b.s || 0;
            const aEnabled = a.enabled || a.e || 0;
            const bEnabled = b.enabled || b.e || 0;
            
            // First by enabled level (highest first)
            if (aEnabled !== bEnabled) {
                return bEnabled - aEnabled;
            }
            
            // Then by stars
            return bStars - aStars;
        });
        
        // Render each hero card
        sortedHeroes.forEach(hero => {
            const heroName = hero.name || hero.n || 'Unknown Hero';
            const heroStars = hero.stars || hero.s || 0;
            const heroLevel = hero.level || hero.l || 0;
            const heroFaction = hero.faction || hero.f || 'Unknown';
            const heroEnabled = hero.enabled || hero.e || 0;
            
            // Create hero card element
            const heroCard = document.createElement('div');
            heroCard.className = 'col-md-4 col-lg-3 mb-3';
            heroCard.innerHTML = `
                <div class="card hero-card">
                    <div class="card-header bg-${this.getFactionColor(heroFaction)} text-white">
                        ${heroName}
                    </div>
                    <div class="card-body">
                        <p class="card-text">
                            <strong>Stars:</strong> ${'★'.repeat(Math.min(heroStars, 10))}
                            ${heroEnabled > 0 ? `<span class="badge bg-danger">E${heroEnabled}</span>` : ''}
                        </p>
                        <p class="card-text"><strong>Level:</strong> ${heroLevel}</p>
                        <p class="card-text"><strong>Faction:</strong> ${heroFaction}</p>
                    </div>
                </div>
            `;
            
            container.appendChild(heroCard);
        });
    }
    
    /**
     * Render item cards
     * @param {Array} items - Array of inventory item objects
     */
    renderItemCards(items) {
        const container = document.getElementById('items-cards');
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Sort items by count (highest first)
        const sortedItems = [...items].sort((a, b) => {
            const aCount = a.count || a.c || 0;
            const bCount = b.count || b.c || 0;
            return bCount - aCount;
        });
        
        // Render each item card
        sortedItems.forEach(item => {
            const itemName = item.name || item.n || 'Unknown Item';
            const itemCount = item.count || item.c || 0;
            const itemType = item.type || item.t || 'Unknown';
            
            // Create item card element
            const itemCard = document.createElement('div');
            itemCard.className = 'col-md-4 col-lg-3 mb-3';
            itemCard.innerHTML = `
                <div class="card">
                    <div class="card-header ${this.getItemColor(itemName, itemType)}">
                        ${itemName}
                    </div>
                    <div class="card-body">
                        <p class="card-text"><strong>Count:</strong> ${itemCount.toLocaleString()}</p>
                        <p class="card-text"><strong>Type:</strong> ${this.getItemTypeName(itemName, itemType)}</p>
                    </div>
                </div>
            `;
            
            container.appendChild(itemCard);
        });
    }
    
    /**
     * Filter heroes based on controls
     */
    filterHeroes() {
        const searchInput = document.getElementById('hero-search');
        const sortSelect = document.getElementById('hero-sort');
        const filterSelect = document.getElementById('hero-filter');
        
        if (!searchInput || !sortSelect || !filterSelect) return;
        
        const searchValue = searchInput.value.toLowerCase();
        const sortValue = sortSelect.value;
        const filterValue = filterSelect.value;
        
        // Get all heroes
        let heroes = this.data.heroes || this.data.h || [];
        
        // Apply search filter
        if (searchValue) {
            heroes = heroes.filter(hero => {
                const heroName = (hero.name || hero.n || '').toLowerCase();
                return heroName.includes(searchValue);
            });
        }
        
        // Apply star/enable filter
        if (filterValue !== 'all') {
            heroes = heroes.filter(hero => {
                const stars = hero.stars || hero.s || 0;
                const enabled = hero.enabled || hero.e || 0;
                
                switch (filterValue) {
                    case '5+': return stars >= 5;
                    case '6+': return stars >= 6;
                    case '10': return stars >= 10;
                    case 'e1+': return enabled >= 1;
                    default: return true;
                }
            });
        }
        
        // Apply sorting
        heroes = [...heroes].sort((a, b) => {
            const aName = (a.name || a.n || '').toLowerCase();
            const bName = (b.name || b.n || '').toLowerCase();
            const aStars = a.stars || a.s || 0;
            const bStars = b.stars || b.s || 0;
            const aLevel = a.level || a.l || 0;
            const bLevel = b.level || b.l || 0;
            const aEnabled = a.enabled || a.e || 0;
            const bEnabled = b.enabled || b.e || 0;
            
            switch (sortValue) {
                case 'stars':
                    // Sort by enabled first, then stars
                    if (aEnabled !== bEnabled) {
                        return bEnabled - aEnabled;
                    }
                    return bStars - aStars;
                
                case 'level':
                    return bLevel - aLevel;
                
                case 'name':
                    return aName.localeCompare(bName);
                
                default:
                    return 0;
            }
        });
        
        // Render filtered heroes
        this.renderHeroCards(heroes);
    }
    
    /**
     * Filter items based on controls
     */
    filterItems() {
        const searchInput = document.getElementById('item-search');
        const sortSelect = document.getElementById('item-sort');
        const filterSelect = document.getElementById('item-filter');
        
        if (!searchInput || !sortSelect || !filterSelect) return;
        
        const searchValue = searchInput.value.toLowerCase();
        const sortValue = sortSelect.value;
        const filterValue = filterSelect.value;
        
        // Get all items
        let items = this.data.inventory || this.data.i || [];
        
        // Apply search filter
        if (searchValue) {
            items = items.filter(item => {
                const itemName = (item.name || item.n || '').toLowerCase();
                return itemName.includes(searchValue);
            });
        }
        
        // Apply type filter
        if (filterValue !== 'all') {
            items = items.filter(item => {
                const itemName = (item.name || item.n || '').toLowerCase();
                const itemType = (item.type || item.t || '').toLowerCase();
                
                switch (filterValue) {
                    case 'shards': return itemName.includes('shard');
                    case 'resources': return !itemName.includes('shard') && (
                        itemType.includes('resource') || 
                        itemName.includes('gold') || 
                        itemName.includes('gem') ||
                        itemName.includes('dust')
                    );
                    default: return true;
                }
            });
        }
        
        // Apply sorting
        items = [...items].sort((a, b) => {
            const aName = (a.name || a.n || '').toLowerCase();
            const bName = (b.name || b.n || '').toLowerCase();
            const aCount = a.count || a.c || 0;
            const bCount = b.count || b.c || 0;
            
            switch (sortValue) {
                case 'count':
                    return bCount - aCount;
                
                case 'name':
                    return aName.localeCompare(bName);
                
                default:
                    return 0;
            }
        });
        
        // Render filtered items
        this.renderItemCards(items);
    }
    
    /**
     * Get faction color for hero card
     * @param {string} faction - Hero faction
     * @returns {string} Bootstrap color class
     */
    getFactionColor(faction) {
        const factionLower = (faction || '').toLowerCase();
        switch (factionLower) {
            case 'fortress': return 'primary';
            case 'forest': return 'success';
            case 'abyss': return 'danger';
            case 'shadow': return 'dark';
            case 'dark': return 'dark';
            case 'light': return 'warning';
            case 'transcendence': return 'info';
            case 'void': return 'secondary';
            default: return 'secondary';
        }
    }
    
    /**
     * Get item color for card
     * @param {string} name - Item name
     * @param {string} type - Item type
     * @returns {string} Bootstrap color classes
     */
    getItemColor(name, type) {
        const nameLower = (name || '').toLowerCase();
        
        if (nameLower.includes('5-star') && nameLower.includes('shard')) {
            return 'bg-warning text-dark';
        } else if (nameLower.includes('shard')) {
            return 'bg-info text-dark';
        } else if (nameLower.includes('scroll')) {
            return 'bg-danger text-white';
        } else if (nameLower.includes('gold')) {
            return 'bg-warning text-dark';
        } else if (nameLower.includes('gem')) {
            return 'bg-success text-white';
        } else {
            return 'bg-secondary text-white';
        }
    }
    
    /**
     * Get item type name
     * @param {string} name - Item name
     * @param {string} type - Item type
     * @returns {string} Friendly type name
     */
    getItemTypeName(name, type) {
        const nameLower = (name || '').toLowerCase();
        
        if (nameLower.includes('shard')) {
            return 'Hero Shard';
        } else if (nameLower.includes('scroll')) {
            return 'Summon Scroll';
        } else if (nameLower.includes('gold')) {
            return 'Currency';
        } else if (nameLower.includes('gem')) {
            return 'Premium Currency';
        } else {
            return type || 'Item';

    if (!searchInput || !sortSelect || !filterSelect) return;

    const searchValue = searchInput.value.toLowerCase();
    const sortValue = sortSelect.value;
    const filterValue = filterSelect.value;

    // Get all heroes
    let heroes = this.data.heroes || this.data.h || [];

    // Apply search filter
    if (searchValue) {
        heroes = heroes.filter(hero => {
            const heroName = (hero.name || hero.n || '').toLowerCase();
            return heroName.includes(searchValue);
        });
    }

    // Apply star/enable filter
    if (filterValue !== 'all') {
        heroes = heroes.filter(hero => {
            const stars = hero.stars || hero.s || 0;
            const enabled = hero.enabled || hero.e || 0;

            switch (filterValue) {
                case '5+': return stars >= 5;
                case '6+': return stars >= 6;
                case '10': return stars >= 10;
                case 'e1+': return enabled >= 1;
                default: return true;
            }
        });
    }

    // Apply sorting
    heroes = [...heroes].sort((a, b) => {
        const aName = (a.name || a.n || '').toLowerCase();
        const bName = (b.name || b.n || '').toLowerCase();
        const aStars = a.stars || a.s || 0;
        const bStars = b.stars || b.s || 0;
        const aLevel = a.level || a.l || 0;
        const bLevel = b.level || b.l || 0;
        const aEnabled = a.enabled || a.e || 0;
        const bEnabled = b.enabled || b.e || 0;

        switch (sortValue) {
            case 'stars':
                // Sort by enabled first, then stars
                if (aEnabled !== bEnabled) {
                    return bEnabled - aEnabled;
                }
                return bStars - aStars;

            case 'level':
                return bLevel - aLevel;

            case 'name':
                return aName.localeCompare(bName);

            default:
                return 0;
        }
    });

    // Render filtered heroes
    this.renderHeroCards(heroes);
}

/**
 * Filter items based on controls
 */
filterItems() {
    const searchInput = document.getElementById('item-search');
    const sortSelect = document.getElementById('item-sort');
    const filterSelect = document.getElementById('item-filter');

    if (!searchInput || !sortSelect || !filterSelect) return;

    const searchValue = searchInput.value.toLowerCase();
    const sortValue = sortSelect.value;
    const filterValue = filterSelect.value;

    // Get all items
    let items = this.data.inventory || this.data.i || [];

    // Apply search filter
    if (searchValue) {
        items = items.filter(item => {
            const itemName = (item.name || item.n || '').toLowerCase();
            return itemName.includes(searchValue);
        });
    }

    // Apply type filter
    if (filterValue !== 'all') {
        items = items.filter(item => {
            const itemName = (item.name || item.n || '').toLowerCase();
            const itemType = (item.type || item.t || '').toLowerCase();

            switch (filterValue) {
                case 'shards': return itemName.includes('shard');
                case 'resources': return !itemName.includes('shard') && (
                    itemType.includes('resource') || 
                    itemName.includes('gold') || 
                    itemName.includes('gem') ||
                    itemName.includes('dust')
                );
                default: return true;
            }
        });
    }

    // Apply sorting
    items = [...items].sort((a, b) => {
        const aName = (a.name || a.n || '').toLowerCase();
        const bName = (b.name || b.n || '').toLowerCase();
        const aCount = a.count || a.c || 0;
        const bCount = b.count || b.c || 0;

        switch (sortValue) {
            case 'count':
                return bCount - aCount;

            case 'name':
                return aName.localeCompare(bName);

            default:
                return 0;
        }
    });

    // Render filtered items
    this.renderItemCards(items);
}

/**
 * Load demo data for testing
 */
loadDemoData() {
    try {
        console.log('Loading demo data');

        // Create a demo account ID
        const platform = 'Android';
        const uid = '123456789';
        const accountId = `${platform}=${uid}`;

        this.accountId = accountId;
        this.isDemoMode = true;

        // Get demo data from MockDataProvider
        if (typeof MockDataProvider !== 'undefined') {
            const mockData = MockDataProvider.getMockData(platform, uid);

            if (mockData) {
                // Parse and display the data
                const decompressedData = DataCompressor.decompressFromUrl(mockData);

                if (decompressedData) {
                    this.data = decompressedData;

                    // Show content section
                    const contentSection = document.getElementById('content');
                    if (contentSection) {
                        contentSection.classList.remove('d-none');
                    }

                    // Hide loader
                    const loadingSection = document.getElementById('loading');
                    if (loadingSection) {
                        loadingSection.classList.add('d-none');
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error loading account:', error);
        // Show error message to user and reset UI
        this.showError('Der opstod en fejl ved indlæsning af kontoen. Prøv igen senere.');

        // Hide loader
        const loadingSection = document.getElementById('loading');
        if (loadingSection) {
            loadingSection.classList.add('d-none');
        }

        // Show content
        const contentSection = document.getElementById('content');
        if (contentSection) {
            contentSection.classList.remove('d-none');
        }
    }
}

/**
 * Shows demo mode banner in the UI
 */
showDemoMode() {
    // Create a demo mode banner
    const demoBanner = document.createElement('div');
    demoBanner.className = 'alert alert-warning mx-3 mt-3';
    demoBanner.innerHTML = '<strong>Demo Mode</strong> - You are viewing sample data. Use a valid account URL or profile to see actual account data.';

    // Insert at the top of the content
    const contentElement = document.getElementById('content');
    if (contentElement && contentElement.firstChild) {
        contentElement.insertBefore(demoBanner, contentElement.firstChild);
    }
}

/**
 * Load account data by account identifier
 * @param {string} accountId - The account identifier (Platform=UID)
 */
loadAccount(accountId) {
    if (!accountId || typeof accountId !== 'string') {
        console.error('Invalid account ID');
        return;
    }

    console.log('Loading account with ID:', accountId);

    // Set account ID property
    this.accountId = accountId;

    // Show loading
    this.showLoading(true, 'Loading account data...');

    // Hide any previous error
    if (this.errorElement) {
        this.errorElement.classList.add('d-none');
    }

    // Check if we have cached data
    this.checkLocalCache(accountId)
        .then(cachedData => {
            if (cachedData) {
                // Use cached data
                console.log('Using cached data for account');
                this.processAccountData(cachedData);
            } else {
                // Try to fetch from server
                this.fetchAccountData(accountId)
                    .then(data => {
                        if (data) {
                            this.processAccountData(data);
                        } else {
                            console.log('No data found for account, using mock data');
                            // Use mock data as fallback
                            this.fetchMockData(accountId)
                                .then(mockData => {
                                    if (mockData) {
                                        this.processAccountData(mockData, true);
                                    } else {
                                        this.showError(`No data found for account: ${accountId}`);
                                    }
                                })
                                .catch(error => {
                                    console.error('Error fetching mock data:', error);
                                    this.showError(`Error loading account data: ${error.message}`);
                                });
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching account data:', error);
                        this.showError(`Error loading account data: ${error.message}`);
                    });
            }
        })
        .catch(error => {
            console.error('Error checking cache:', error);
            // Fallback to localStorage
            this.checkLocalStorageCache(accountId);
        });
}

/**
 * Fetch account data with visual download simulation
 * @param {string} accountId - The account identifier (Platform=UID)
 * @returns {Promise<string|null>} Account data if available
 */
async fetchAccountData(accountId) {
    try {
        const [platform, uid] = accountId.split('=');

        if (!platform || !uid) {
            console.error('Invalid account identifier format');
            return null;
        }

        console.log(`Fetching account data for ${platform}=${uid}`);

        // Check if we have data from a mobile app upload first
        const mobileData = this.checkMobileUpload(platform, uid);
        if (mobileData) {
            console.log('Found data from mobile upload');
            return mobileData;
        }

        // Then check localStorage/IndexedDB
        const cachedData = await this.checkLocalStorageCache(accountId);
        if (cachedData) {
            console.log('Found cached data');
            return cachedData;
        }

        // If no cached data, use mock data
        console.log('No cached data found, using mock data');
        return this.fetchMockData(accountId);
    } catch (error) {
        console.error('Error in fetchAccountData:', error);
        return null;
    }
}

/**
 * Fetch mock data for an account
 * @param {string} accountId - The account identifier
 * @returns {Promise<string|null>} Mock data
 */
async fetchMockData(accountId) {
    try {
        const [platform, uid] = accountId.split('=');

        if (!platform || !uid) {
            console.error('Invalid account identifier format');
            return null;
        }

        // Check if we have the MockDataProvider
        if (window.MockDataProvider) {
            return window.MockDataProvider.getMockData(platform, uid);
        }

        return null;
    } catch (error) {
        console.error('Error fetching mock data:', error);
        return null;
    }
}

/**
 * Process account data
 * @param {string} data - Compressed account data
 * @param {boolean} [isMock=false] - Whether this is mock data
 */
processAccountData(data, isMock = false) {
    try {
        // Decompress data
        const decompressedData = DataCompressor.decompressFromUrl(data);

        if (!decompressedData) {
            throw new Error('Failed to decompress data');
        }

        // Set data and render
        this.data = decompressedData;
        this.renderData();

        // Setup sharing
        const shareUrl = window.location.origin + window.location.pathname + '#' + this.accountId;
        this.setupSharing(shareUrl);

        // Show demo banner if mock data
        if (isMock) {
            this.showDemoMode();
        }

        // Cache data locally if not mock
        if (!isMock) {
            this.cacheDataLocally(this.accountId, data);
        }

        // Hide loading
        this.showLoading(false);
    } catch (error) {
        console.error('Error processing account data:', error);
        this.showError(`Error processing account data: ${error.message}`);
    }
}

/**
 * Cache data locally
 * @param {string} accountId - The account identifier
 * @param {string} data - Compressed account data
 */
cacheDataLocally(accountId, data) {
    try {
        // Try IndexedDB first
        if (window.DBManager) {
            DBManager.saveAccountData(accountId, data)
                .then(() => console.log('Account data saved to IndexedDB'))
                .catch(error => console.warn('Failed to save to IndexedDB:', error));
        }

        // Also save to localStorage as backup
        const storage = window.localStorage;
        if (storage) {
            const cacheData = {
                timestamp: Date.now(),
                data: data
            };
            const cacheKey = `account_${accountId}`;
            storage.setItem(cacheKey, JSON.stringify(cacheData));
            console.log('Account data cached in localStorage');
        }
    } catch (error) {
        console.warn('Error caching data locally:', error);
    }
}

/**
 * Helper method to check localStorage cache
 * @param {string} accountId - The account ID to check
 * @returns {Promise<string|null>} - Cached data if found, null otherwise
 */
async checkLocalStorageCache(accountId) {
    try {
        // First try with IndexedDB if available
        if (window.DBManager) {
            try {
                const dbData = await DBManager.loadAccountData(accountId);
                if (dbData) {
                    console.log('Found account data in IndexedDB');
                    return dbData;
                }
            } catch (dbError) {
                console.warn('Error accessing IndexedDB:', dbError);
            }
        }

        // Fallback to localStorage
        const storage = window.localStorage;
        if (!storage) return null;

        const cacheKey = `account_${accountId}`;
        const cacheData = storage.getItem(cacheKey);

        if (cacheData) {
            try {
                const parsedData = JSON.parse(cacheData);
                if (parsedData && parsedData.data) {
                    console.log('Found account data in localStorage');
                    return parsedData.data;
                }
            } catch (e) {
                console.warn('Failed to parse cached data from localStorage');
            }
        }

        // No cached data found
        return null;
    } catch (error) {
        console.warn('Error getting cached account data:', error);
        return null;
    }
}

/**
 * Check for data uploaded from mobile app
 * @param {string} platform - The platform (iOS/Android)
 * @param {string} uid - The user ID
 * @returns {string|null} - Mobile data if found, null otherwise
 */
checkMobileUpload(platform, uid) {
    try {
        console.log(`Checking for mobile upload data: ${platform}=${uid}`);
        
        // First check if we have the mobile data handler available
        if (window.mobileDataHandler && typeof window.mobileDataHandler.getData === 'function') {
            const mobileData = window.mobileDataHandler.getData(platform, uid);
            if (mobileData) {
                console.log(`Found mobile upload data via handler for ${platform} user ${uid}`);
                return mobileData;
            }
        }
        
        // Fallback to direct storage access
        const storage = window.localStorage;
        if (!storage) return null;

        // Check for mobile uploads with this format: mobile_upload_{platform}_{uid}
        const mobileKey = `mobile_upload_${platform}_${uid}`;
        const mobileData = storage.getItem(mobileKey);
        
        if (mobileData) {
            console.log(`Found mobile upload data for ${platform} user ${uid}`);
            // Once we've used it, remove it to avoid duplicate data
            // storage.removeItem(mobileKey);
            return mobileData;
        }
        
        // Also check sessionStorage as fallback
        if (window.sessionStorage) {
            const sessionData = window.sessionStorage.getItem(mobileKey);
            if (sessionData) {
                console.log(`Found mobile upload data in session storage for ${platform} user ${uid}`);
                return sessionData;
            }
        }
        
        return null;
    } catch (error) {
        console.warn('Error checking for mobile upload data:', error);
        return null;
    }
}

    /**
     * Initialize mobile data integration
     */
    initializeMobileIntegration() {
        try {
            // Listen for mobile data events
            window.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'idleHeroesData') {
                    console.log('Received mobile data via postMessage');
                    
                    if (event.data.platform && event.data.uid && event.data.data) {
                        // Save to localStorage
                        const mobileKey = `mobile_upload_${event.data.platform}_${event.data.uid}`;
                        localStorage.setItem(mobileKey, event.data.data);
                        
                        // Redirect to load this account
                        this.loadAccount(`${event.data.platform}=${event.data.uid}`);
                    }
                }
            });
            
            console.log('Mobile data integration initialized');
        } catch (error) {
            console.error('Error initializing mobile integration:', error);
        }
    }
}

// Initialize viewer when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Create global instance
    window.viewer = new IdleHeroesViewer();
    
    // Initialize mobile integration
    if (window.viewer && typeof window.viewer.initializeMobileIntegration === 'function') {
        window.viewer.initializeMobileIntegration();
    }
});
