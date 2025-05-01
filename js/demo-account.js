/**
 * Demo account for Idle Heroes Account Viewer
 * Shows a perfect example of how heroes are displayed in-game
 */

// Demo account data structure matches the game's format
const DEMO_ACCOUNT = {
    user: {
        name: "Demo Account",
        level: 250,
        uid: "12345678",
        server: "S942 iOS"
    },
    resources: {
        gold: 1000000000,
        gems: 15000,
        spirit: 500000000,
        magic_dust: 60000000
    },
    heroes: [
        {
            id: "10597",
            name: "Garuda",
            faction: "Forest",
            stars: 10,
            level: 330,
            power: 1237890,
            artifact: "Magic Stone Sword",
            image: "https://ih.dhgames.com/upload/heroes/10597.png"
        },
        {
            id: "10596",
            name: "Carrie",
            faction: "Dark",
            stars: 10,
            level: 330,
            power: 1356742,
            artifact: "Demon Bell",
            image: "https://ih.dhgames.com/upload/heroes/10596.png"
        },
        {
            id: "10595",
            name: "Tix",
            faction: "Shadow",
            stars: 10,
            level: 330,
            power: 1198560,
            artifact: "Staff: Punisher of Immortal",
            image: "https://ih.dhgames.com/upload/heroes/10595.png"
        },
        {
            id: "10594",
            name: "Ithaqua",
            faction: "Shadow",
            stars: 10,
            level: 330,
            power: 1187320,
            artifact: "Antlers Cane",
            image: "https://ih.dhgames.com/upload/heroes/10594.png"
        },
        {
            id: "10593",
            name: "Russell",
            faction: "Light",
            stars: 10,
            level: 330,
            power: 1345670,
            artifact: "Augustus Magic Ball",
            image: "https://ih.dhgames.com/upload/heroes/10593.png"
        },
        {
            id: "10592",
            name: "Drake",
            faction: "Dark",
            stars: 10,
            level: 330,
            power: 1276540,
            artifact: "Lucky Candy Bar",
            image: "https://ih.dhgames.com/upload/heroes/10592.png"
        }
    ]
};

/**
 * Load demo account data into the viewer
 */
function loadDemoAccount() {
    console.log("Loading demo account data...");
    
    // Update user info
    document.getElementById('player-name').textContent = DEMO_ACCOUNT.user.name;
    document.getElementById('player-level').textContent = DEMO_ACCOUNT.user.level;
    document.getElementById('player-uid').textContent = DEMO_ACCOUNT.user.uid;
    document.getElementById('player-server').textContent = DEMO_ACCOUNT.user.server;
    
    // Update resources
    document.getElementById('player-gold').textContent = formatNumber(DEMO_ACCOUNT.resources.gold);
    document.getElementById('player-gems').textContent = formatNumber(DEMO_ACCOUNT.resources.gems);
    document.getElementById('player-spirit').textContent = formatNumber(DEMO_ACCOUNT.resources.spirit);
    document.getElementById('player-dust').textContent = formatNumber(DEMO_ACCOUNT.resources.magic_dust);
    
    // Generate hero cards
    const heroContainer = document.getElementById('heroes-container');
    if (heroContainer) {
        heroContainer.innerHTML = ''; // Clear existing content
        
        DEMO_ACCOUNT.heroes.forEach(hero => {
            const heroCard = createHeroCard(hero);
            heroContainer.appendChild(heroCard);
        });
    }
    
    // Show success message
    document.getElementById('status-message').textContent = 'Demo account loaded successfully!';
    document.getElementById('loading-indicator').style.display = 'none';
    document.getElementById('system-status').className = 'badge bg-success';
    document.getElementById('system-status').textContent = 'Demo Loaded';
    
    // Show demo banner
    const demoBanner = document.createElement('div');
    demoBanner.className = 'alert alert-info text-center mb-4';
    demoBanner.innerHTML = '<strong>Demo Account</strong> - This is a demonstration of how hero cards look in the game';
    document.querySelector('.main-content .container').insertBefore(demoBanner, document.querySelector('.main-content .container').firstChild);
}

/**
 * Create a hero card element that exactly matches the game's style
 * @param {Object} hero - Hero data
 * @returns {HTMLElement} - Hero card element
 */
function createHeroCard(hero) {
    const colDiv = document.createElement('div');
    colDiv.className = 'col';
    
    const cardDiv = document.createElement('div');
    cardDiv.className = 'hero-card';
    
    // Create header with hero name, faction and stars
    const cardHeader = document.createElement('div');
    cardHeader.className = 'hero-card-header';
    
    const headerLeft = document.createElement('div');
    
    const heroName = document.createElement('h5');
    heroName.className = 'hero-name';
    heroName.textContent = hero.name;
    
    const heroFaction = document.createElement('div');
    heroFaction.className = 'hero-faction';
    heroFaction.textContent = hero.faction;
    
    headerLeft.appendChild(heroName);
    headerLeft.appendChild(heroFaction);
    
    const heroStars = document.createElement('div');
    heroStars.className = 'hero-stars';
    heroStars.textContent = '★'.repeat(hero.stars);
    
    cardHeader.appendChild(headerLeft);
    cardHeader.appendChild(heroStars);
    
    // Create body with hero image and stats
    const cardBody = document.createElement('div');
    cardBody.className = 'hero-card-body';
    
    const rowDiv = document.createElement('div');
    rowDiv.className = 'row align-items-center mb-3';
    
    const imgCol = document.createElement('div');
    imgCol.className = 'col-4';
    
    const heroImg = document.createElement('img');
    heroImg.src = hero.image;
    heroImg.alt = hero.name;
    heroImg.className = 'img-fluid';
    
    imgCol.appendChild(heroImg);
    
    const statsCol = document.createElement('div');
    statsCol.className = 'col-8';
    
    const heroStats = document.createElement('div');
    heroStats.className = 'hero-stats';
    
    // Create level stat
    const levelItem = document.createElement('div');
    levelItem.className = 'hero-stats-item';
    
    const levelLabel = document.createElement('span');
    levelLabel.className = 'hero-stats-label';
    levelLabel.textContent = 'Level:';
    
    const levelValue = document.createElement('span');
    levelValue.textContent = hero.level;
    
    levelItem.appendChild(levelLabel);
    levelItem.appendChild(levelValue);
    
    // Create power stat
    const powerItem = document.createElement('div');
    powerItem.className = 'hero-stats-item';
    
    const powerLabel = document.createElement('span');
    powerLabel.className = 'hero-stats-label';
    powerLabel.textContent = 'Power:';
    
    const powerValue = document.createElement('span');
    powerValue.textContent = formatNumber(hero.power);
    
    powerItem.appendChild(powerLabel);
    powerItem.appendChild(powerValue);
    
    // Create artifact stat
    const artifactItem = document.createElement('div');
    artifactItem.className = 'hero-stats-item';
    
    const artifactLabel = document.createElement('span');
    artifactLabel.className = 'hero-stats-label';
    artifactLabel.textContent = 'Artifact:';
    
    const artifactValue = document.createElement('span');
    artifactValue.textContent = hero.artifact;
    
    artifactItem.appendChild(artifactLabel);
    artifactItem.appendChild(artifactValue);
    
    // Add all stats
    heroStats.appendChild(levelItem);
    heroStats.appendChild(powerItem);
    heroStats.appendChild(artifactItem);
    
    statsCol.appendChild(heroStats);
    
    rowDiv.appendChild(imgCol);
    rowDiv.appendChild(statsCol);
    
    cardBody.appendChild(rowDiv);
    
    // Assemble the card
    cardDiv.appendChild(cardHeader);
    cardDiv.appendChild(cardBody);
    
    colDiv.appendChild(cardDiv);
    
    return colDiv;
}

/**
 * Format number with commas for better readability
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Add load demo button to the page
document.addEventListener('DOMContentLoaded', function() {
    // Create demo button
    const demoButton = document.createElement('button');
    demoButton.className = 'btn btn-warning';
    demoButton.innerHTML = '<i class="bi bi-display"></i> Load Demo Account';
    demoButton.onclick = loadDemoAccount;
    
    // Find appropriate place to insert the button
    const uploadBtn = document.getElementById('upload-btn');
    if (uploadBtn && uploadBtn.parentNode) {
        uploadBtn.parentNode.appendChild(demoButton);
    } else {
        // Alternative placement if upload button doesn't exist
        const extractionStats = document.getElementById('extraction-stats');
        if (extractionStats) {
            extractionStats.parentNode.insertBefore(demoButton, extractionStats.nextSibling);
        }
    }
    
    // Initialize player info elements if they don't exist
    const elementsToInit = ['player-name', 'player-level', 'player-uid', 'player-server', 
                           'player-gold', 'player-gems', 'player-spirit', 'player-dust'];
    
    elementsToInit.forEach(id => {
        if (!document.getElementById(id)) {
            const elem = document.createElement('span');
            elem.id = id;
            // Hide it until we have the container ready
            elem.style.display = 'none';
            document.body.appendChild(elem);
        }
    });
});
