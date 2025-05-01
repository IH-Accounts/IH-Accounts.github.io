/**
 * Database Manager for Idle Heroes Account Viewer
 * Handles local data storage using IndexedDB
 */

class DBManager {
    // Database constants
    static DB_NAME = 'idle-heroes-data';
    static DB_VERSION = 1;
    static ACCOUNTS_STORE = 'accounts';
    
    /**
     * Open the IndexedDB database
     * @returns {Promise<IDBDatabase>} Promise resolving to database object
     */
    static async openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.ACCOUNTS_STORE)) {
                    // Create account store with UID+ServerID as key
                    const store = db.createObjectStore(this.ACCOUNTS_STORE, { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Save account data to the database
     * @param {string} accountId - Account ID (UID-ServerID)
     * @param {Object} data - Account data to save
     * @returns {Promise<boolean>} Promise resolving to success status
     */
    static async saveAccountData(accountId, data) {
        try {
            const db = await this.openDatabase();
            const transaction = db.transaction([this.ACCOUNTS_STORE], 'readwrite');
            const store = transaction.objectStore(this.ACCOUNTS_STORE);
            
            // Create the record with current timestamp
            const record = {
                id: accountId,
                data: data,
                timestamp: new Date().toISOString()
            };
            
            // Save to database
            return new Promise((resolve, reject) => {
                const request = store.put(record);
                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error saving account data:', error);
            return false;
        }
    }
    
    /**
     * Load account data from the database
     * @param {string} accountId - Account ID (UID-ServerID) to load
     * @returns {Promise<Object|null>} Promise resolving to account data or null if not found
     */
    static async loadAccountData(accountId) {
        try {
            const db = await this.openDatabase();
            const transaction = db.transaction([this.ACCOUNTS_STORE], 'readonly');
            const store = transaction.objectStore(this.ACCOUNTS_STORE);
            
            return new Promise((resolve, reject) => {
                const request = store.get(accountId);
                request.onsuccess = () => resolve(request.result ? request.result.data : null);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error loading account data:', error);
            return null;
        }
    }
    
    /**
     * Delete account data from the database
     * @param {string} accountId - Account ID (UID-ServerID) to delete
     * @returns {Promise<boolean>} Promise resolving to success status
     */
    static async deleteAccountData(accountId) {
        try {
            const db = await this.openDatabase();
            const transaction = db.transaction([this.ACCOUNTS_STORE], 'readwrite');
            const store = transaction.objectStore(this.ACCOUNTS_STORE);
            
            return new Promise((resolve, reject) => {
                const request = store.delete(accountId);
                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error deleting account data:', error);
            return false;
        }
    }
    
    /**
     * List all stored accounts
     * @returns {Promise<Array>} Promise resolving to array of account IDs and timestamps
     */
    static async listAccounts() {
        try {
            const db = await this.openDatabase();
            const transaction = db.transaction([this.ACCOUNTS_STORE], 'readonly');
            const store = transaction.objectStore(this.ACCOUNTS_STORE);
            
            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => {
                    const accounts = request.result.map(item => ({
                        id: item.id,
                        timestamp: item.timestamp
                    }));
                    resolve(accounts);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error listing accounts:', error);
            return [];
        }
    }
    
    /**
     * Clear all data from the database
     * @returns {Promise<boolean>} Promise resolving to success status
     */
    static async clearAllData() {
        try {
            const db = await this.openDatabase();
            const transaction = db.transaction([this.ACCOUNTS_STORE], 'readwrite');
            const store = transaction.objectStore(this.ACCOUNTS_STORE);
            
            return new Promise((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error clearing database:', error);
            return false;
        }
    }
}

// Make available globally
window.DBManager = DBManager;
