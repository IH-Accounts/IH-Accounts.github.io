/**
 * Data Compressor for Idle Heroes Account Viewer
 * Handles compression/decompression of data for URL sharing
 */

class DataCompressor {
    /**
     * Compress data for URL sharing
     * @param {Object} data - The data object to compress
     * @returns {string} Compressed data as URL-safe base64 string
     */
    static compressForUrl(data) {
        try {
            // Convert to JSON string
            const jsonString = JSON.stringify(data);
            
            // Compress with zlib
            const compressed = pako.deflate(jsonString, { to: 'string' });
            
            // Convert to URL-safe base64
            let base64 = btoa(compressed);
            base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            
            return base64;
        } catch (error) {
            console.error('Error compressing data:', error);
            throw error;
        }
    }
    
    /**
     * Decompress data from URL
     * @param {string} urlData - URL-safe base64 compressed data
     * @returns {Object|null} Decompressed data object or null if failed
     */
    static decompressFromUrl(urlData) {
        try {
            // Convert URL-safe base64 to regular base64 if needed
            const base64 = this.urlSafeBase64ToBase64(urlData);
            
            // Decode base64 to binary
            const binary = atob(base64);
            
            // Convert binary string to byte array
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            
            // Decompress with pako (zlib)
            const decompressed = pako.inflate(bytes, { to: 'string' });
            
            // Parse JSON
            return JSON.parse(decompressed);
        } catch (error) {
            console.error('Error decompressing data:', error);
            return null;
        }
    }
    
    /**
     * Convert URL-safe base64 to regular base64
     * @param {string} urlSafeBase64 - URL-safe base64 string
     * @returns {string} Regular base64 string
     */
    static urlSafeBase64ToBase64(urlSafeBase64) {
        // Convert URL-safe base64 characters to regular base64
        let base64 = urlSafeBase64.replace(/-/g, '+').replace(/_/g, '/');
        
        // Add padding if needed
        while (base64.length % 4) {
            base64 += '=';
        }
        
        return base64;
    }
    
    /**
     * Optimize data for compression by reducing key lengths and removing unnecessary fields
     * @param {Object} data - Original data to optimize
     * @returns {Object} Optimized data
     */
    static optimizeForCompression(data) {
        try {
            const optimized = { ...data };
            
            // Optimize user data
            if (optimized.user) {
                optimized.u = {
                    n: optimized.user.name || '',
                    i: optimized.user.uid || '',
                    s: optimized.user.server_id || '',
                    l: optimized.user.level || 0,
                    g: optimized.user.guild_name || ''
                };
                delete optimized.user;
            }
            
            // Optimize heroes array
            if (optimized.heroes && Array.isArray(optimized.heroes)) {
                optimized.h = optimized.heroes.map(hero => ({
                    n: hero.name || '',
                    i: hero.id || '',
                    s: hero.stars || 0,
                    l: hero.level || 0,
                    f: hero.faction || '',
                    e: hero.enabled || 0
                }));
                delete optimized.heroes;
            }
            
            // Optimize inventory array
            if (optimized.inventory && Array.isArray(optimized.inventory)) {
                optimized.i = optimized.inventory.map(item => ({
                    n: item.name || '',
                    i: item.id || '',
                    c: item.count || 0,
                    t: item.type || ''
                }));
                delete optimized.inventory;
            }
            
            // Add metadata
            optimized.m = {
                v: '1.0.0', // Version
                t: new Date().toISOString() // Timestamp
            };
            
            return optimized;
        } catch (error) {
            console.error('Error optimizing data:', error);
            return data; // Return original data if optimization fails
        }
    }
    
    /**
     * Expand optimized data back to full format
     * @param {Object} optimized - Optimized data
     * @returns {Object} Expanded data
     */
    static expandOptimized(optimized) {
        try {
            const expanded = { ...optimized };
            
            // Expand user data
            if (expanded.u) {
                expanded.user = {
                    name: expanded.u.n || '',
                    uid: expanded.u.i || '',
                    server_id: expanded.u.s || '',
                    level: expanded.u.l || 0,
                    guild_name: expanded.u.g || ''
                };
                delete expanded.u;
            }
            
            // Expand heroes array
            if (expanded.h && Array.isArray(expanded.h)) {
                expanded.heroes = expanded.h.map(hero => ({
                    name: hero.n || '',
                    id: hero.i || '',
                    stars: hero.s || 0,
                    level: hero.l || 0,
                    faction: hero.f || '',
                    enabled: hero.e || 0
                }));
                delete expanded.h;
            }
            
            // Expand inventory array
            if (expanded.i && Array.isArray(expanded.i)) {
                expanded.inventory = expanded.i.map(item => ({
                    name: item.n || '',
                    id: item.i || '',
                    count: item.c || 0,
                    type: item.t || ''
                }));
                delete expanded.i;
            }
            
            // Extract metadata
            if (expanded.m) {
                expanded.metadata = {
                    version: expanded.m.v || '1.0.0',
                    timestamp: expanded.m.t || new Date().toISOString()
                };
                delete expanded.m;
            }
            
            return expanded;
        } catch (error) {
            console.error('Error expanding data:', error);
            return optimized; // Return original optimized data if expansion fails
        }
    }
}

// Make available globally
window.DataCompressor = DataCompressor;
