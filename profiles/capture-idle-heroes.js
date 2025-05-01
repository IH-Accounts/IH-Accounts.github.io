/**
 * Idle Heroes Traffic Capture Script
 * 
 * This script captures and processes Idle Heroes game traffic for both iOS and Android
 * to extract account data, hero information, and resources for the Idle Heroes Account Viewer.
 * 
 * Compatible with both QX and Surge proxy tools
 */

// Configuration
const CONFIG = {
  enableDebugLog: false,
  apiEndpoint: "https://ih-accounts.github.io/api/update-account",
  requiredApiPatterns: [
    "/apis/account/",
    "/apis/hero/",
    "/apis/profile/",
    "/apis/resources/",
    "/apis/guild/",
    "/apis/pvp/",
    "/apis/inventory/"
  ],
  maxCacheSize: 50 * 1024 * 1024, // 50MB max cache size
  compressionLevel: 9,             // Max compression for efficiency
  githubApiKey: "$GITHUB_API_KEY"  // Will be replaced by CI/CD pipeline
};

// Local storage helpers (compatible with both iOS and Android)
const LocalStorage = {
  get: (key) => {
    try {
      const platform = typeof $task !== 'undefined' ? 'Quantumult X' : 
                      typeof $httpClient !== 'undefined' ? 'Surge' : 'Unknown';
      
      if (platform === 'Quantumult X') {
        return $prefs.valueForKey(key);
      } else if (platform === 'Surge') {
        return $persistentStore.read(key);
      } else {
        console.log('Unsupported platform for storage');
        return null;
      }
    } catch (err) {
      console.log(`Error reading from storage: ${err}`);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      const platform = typeof $task !== 'undefined' ? 'Quantumult X' : 
                      typeof $httpClient !== 'undefined' ? 'Surge' : 'Unknown';
      
      if (platform === 'Quantumult X') {
        return $prefs.setValueForKey(value, key);
      } else if (platform === 'Surge') {
        return $persistentStore.write(value, key);
      } else {
        console.log('Unsupported platform for storage');
        return false;
      }
    } catch (err) {
      console.log(`Error writing to storage: ${err}`);
      return false;
    }
  }
};

// Data compression utility
const Compression = {
  compress: (data) => {
    try {
      const jsonStr = JSON.stringify(data);
      const compressedData = pako.deflate(jsonStr, { level: CONFIG.compressionLevel });
      return btoa(String.fromCharCode.apply(null, compressedData));
    } catch (err) {
      console.log(`Compression error: ${err}`);
      return null;
    }
  },
  
  decompress: (base64Data) => {
    try {
      const compressedData = atob(base64Data).split('').map(c => c.charCodeAt(0));
      const decompressedStr = pako.inflate(new Uint8Array(compressedData), { to: 'string' });
      return JSON.parse(decompressedStr);
    } catch (err) {
      console.log(`Decompression error: ${err}`);
      return null;
    }
  }
};

// Main data processor
const IdleHeroesProcessor = {
  capturedData: {
    user: {},
    heroes: [],
    inventory: [],
    resources: {},
    timestamp: null,
    version: "1.0"
  },
  
  processResponse: function(url, method, headers, body) {
    // Skip if not a target API
    if (!CONFIG.requiredApiPatterns.some(pattern => url.includes(pattern))) {
      return null;
    }
    
    try {
      const responseData = typeof body === 'string' ? JSON.parse(body) : body;
      
      // Extract relevant data based on API endpoint
      if (url.includes('/apis/account/') || url.includes('/apis/profile/')) {
        this.processUserData(responseData);
      } else if (url.includes('/apis/hero/')) {
        this.processHeroData(responseData);
      } else if (url.includes('/apis/inventory/') || url.includes('/apis/resources/')) {
        this.processInventoryData(responseData);
      } else if (url.includes('/apis/guild/')) {
        this.processGuildData(responseData);
      } else if (url.includes('/apis/pvp/')) {
        this.processPVPData(responseData);
      }
      
      // Update timestamp
      this.capturedData.timestamp = new Date().toISOString();
      
      // Save captured data
      this.saveData();
      
      // Only upload if we have sufficient data
      if (this.hasMinimumRequiredData()) {
        this.uploadData();
      }
      
      return this.capturedData;
    } catch (err) {
      console.log(`Error processing response: ${err}`);
      return null;
    }
  },
  
  processUserData: function(data) {
    if (!data) return;
    
    // Extract user information, handling various API response formats
    if (data.player) {
      this.capturedData.user = {
        uid: data.player.uid || data.player.userId || data.player.id,
        platform: this.detectPlatform(),
        level: data.player.level,
        name: data.player.name || data.player.nickname,
        server: data.player.server || data.player.regionId || `S${data.player.serverId}`,
        guild: data.player.guildName,
        avatar: data.player.avatar
      };
    } else if (data.account) {
      // Alternative format
      this.capturedData.user = {
        uid: data.account.uid || data.account.id,
        platform: this.detectPlatform(),
        level: data.account.level,
        name: data.account.name || data.account.nickname,
        server: data.account.server || `S${data.account.serverId}`,
        guild: data.account.guildName,
        avatar: data.account.avatar
      };
    }
  },
  
  processHeroData: function(data) {
    if (!data || !data.heroes) return;
    
    // Process hero information
    const heroes = Array.isArray(data.heroes) ? data.heroes : Object.values(data.heroes);
    
    this.capturedData.heroes = heroes.map(hero => ({
      id: hero.id || hero.heroId,
      name: hero.name,
      faction: hero.faction,
      stars: hero.stars || hero.quality,
      level: hero.level,
      power: hero.power || hero.combatPower,
      isTranscendence: !!hero.isTranscendence,
      isEvolved: !!hero.isEvolved,
      evolutionLevel: hero.evolutionLevel || 0,
      skills: hero.skills || [],
      artifact: hero.artifact || hero.equippedArtifact,
      stone: hero.stone,
      enable: hero.enable || hero.enablement || [0, 0, 0, 0, 0],
      resonanceGear: !!hero.resonanceGear,
      skin: hero.skin || hero.activeSkin
    }));
  },
  
  processInventoryData: function(data) {
    // Process inventory items and resources
    if (data.items) {
      this.capturedData.inventory = Object.values(data.items).map(item => ({
        id: item.id || item.itemId,
        name: item.name,
        type: item.type || item.category,
        count: item.count || item.quantity
      }));
    }
    
    if (data.resources) {
      this.capturedData.resources = {
        gold: data.resources.gold || 0,
        gems: data.resources.gems || 0,
        spirit: data.resources.spirit || data.resources.heroExperience || 0,
        promotion_stones: data.resources.promotionStones || data.resources.stones || 0,
        celestial_island_stones: data.resources.celestialIslandStones || 0,
        dust: data.resources.dust || data.resources.magicDust || 0,
        void_material: data.resources.voidMaterial || 0,
        transcendence_material: data.resources.transcendenceMaterial || 0
      };
    }
  },
  
  processGuildData: function(data) {
    if (!data || !data.guild) return;
    
    // Update user's guild information if present
    if (this.capturedData.user) {
      this.capturedData.user.guild = data.guild.name;
      this.capturedData.user.guildRank = data.guild.rank;
    }
  },
  
  processPVPData: function(data) {
    if (!data || !data.pvp) return;
    
    // Store PVP rank information if needed
    if (this.capturedData.user) {
      this.capturedData.user.pvpRank = data.pvp.rank;
    }
  },
  
  detectPlatform: function() {
    const userAgent = typeof $request !== 'undefined' ? $request.headers['User-Agent'] : '';
    return userAgent.includes('iPhone') || userAgent.includes('iPad') ? 'iOS' : 'Android';
  },
  
  hasMinimumRequiredData: function() {
    // Check if we have the minimum required data to consider this a valid capture
    return (
      this.capturedData.user && 
      this.capturedData.user.uid &&
      this.capturedData.heroes && 
      this.capturedData.heroes.length > 0
    );
  },
  
  saveData: function() {
    try {
      // Save to local storage
      const compressedData = Compression.compress(this.capturedData);
      if (compressedData) {
        const key = `ih_data_${this.capturedData.user.uid}`;
        LocalStorage.set(key, compressedData);
        
        if (CONFIG.enableDebugLog) {
          console.log(`Data saved for UID: ${this.capturedData.user.uid}`);
        }
      }
    } catch (err) {
      console.log(`Error saving data: ${err}`);
    }
  },
  
  uploadData: function() {
    // Only upload if we have user data
    if (!this.capturedData.user || !this.capturedData.user.uid) {
      return;
    }
    
    const platform = typeof $task !== 'undefined' ? 'Quantumult X' : 
                    typeof $httpClient !== 'undefined' ? 'Surge' : 'Unknown';
    
    // Prepare request options
    const requestOptions = {
      url: CONFIG.apiEndpoint,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': CONFIG.githubApiKey,
        'User-Agent': 'IdleHeroesCapture/1.0'
      },
      body: JSON.stringify({
        data: Compression.compress(this.capturedData),
        platform: this.capturedData.user.platform,
        uid: this.capturedData.user.uid,
        timestamp: this.capturedData.timestamp
      })
    };
    
    // Make the request based on platform
    if (platform === 'Quantumult X') {
      $task.fetch(requestOptions).then(
        response => {
          if (CONFIG.enableDebugLog) {
            console.log(`Upload successful: ${response.statusCode}`);
          }
        },
        reason => {
          console.log(`Upload failed: ${reason}`);
        }
      );
    } else if (platform === 'Surge') {
      $httpClient.post(requestOptions, (error, response, data) => {
        if (error) {
          console.log(`Upload failed: ${error}`);
        } else if (CONFIG.enableDebugLog) {
          console.log(`Upload successful: ${response.status}`);
        }
      });
    }
  }
};

// Main function
function main() {
  const method = $request.method;
  const url = $request.url;
  
  if (CONFIG.enableDebugLog) {
    console.log(`Processing request: ${method} ${url}`);
  }
  
  // Handle response body (if available)
  if (typeof $response !== 'undefined' && $response.body) {
    const processor = IdleHeroesProcessor;
    processor.processResponse(url, method, $request.headers, $response.body);
    
    // Pass through the original response
    $done({});
  } else {
    // For request headers, just pass through
    $done({});
  }
}

// Run the main function
main();
