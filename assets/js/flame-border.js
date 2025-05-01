/**
 * Perfect flame border effect for Idle Heroes icon
 * Exactly matching the game's visual style
 */

document.addEventListener('DOMContentLoaded', function() {
    // Find all icon containers
    const iconContainers = document.querySelectorAll('.idle-icon-container');
    
    iconContainers.forEach(container => {
        // Create flame border elements
        createFlameBorder(container);
        
        // Create flame particles
        createFlameParticles(container);
    });
});

/**
 * Creates the flame border elements for an icon container
 * @param {HTMLElement} container - The icon container
 */
function createFlameBorder(container) {
    // Create inner flame border with random animation delay
    const flameBorder = document.createElement('div');
    flameBorder.className = 'flame-border';
    
    // Add random animation delay to make it look more natural
    const randomDelay = Math.random() * 2; // Random delay between 0-2s
    flameBorder.style.animationDelay = `-${randomDelay}s`;
    container.appendChild(flameBorder);
    
    // Create outer flame glow with different random delay for async effect
    const flameOuter = document.createElement('div');
    flameOuter.className = 'flame-outer';
    // Different delay for outer glow to create more organic look
    const outerRandomDelay = Math.random() * 3;
    flameOuter.style.animationDelay = `-${outerRandomDelay}s`;
    container.appendChild(flameOuter);
}

/**
 * Creates advanced animated flame particles around the icon
 * @param {HTMLElement} container - The icon container
 */
function createFlameParticles(container) {
    // Create initial particles with photoshop-style effects
    for (let i = 0; i < 15; i++) {
        createParticle(container);
    }
    
    // Add initial ember effects
    for (let i = 0; i < 8; i++) {
        createEmber(container);
    }
    
    // Create particles at interval - professional animation timing
    setInterval(() => {
        const count = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < count; i++) {
            createParticle(container);
        }
        
        // Add occasional embers for realistic fire effect
        if (Math.random() > 0.7) {
            createEmber(container);
        }
    }, 200); // Faster refresh for smoother animation
}

/**
 * Creates a single flame particle with random properties
 * @param {HTMLElement} container - The container for the particle
 */
function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'flame-particle';
    
    // Get container dimensions
    const containerRect = container.getBoundingClientRect();
    const containerSize = Math.min(containerRect.width, containerRect.height);
    
    // Perfect flame positioning - more controlled dispersion
    const angle = Math.random() * Math.PI * 2;
    const distance = containerSize * 0.42; // Exactly at the edge of the icon
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    
    // Smaller particles for a more refined look
    const size = 3 + Math.random() * 5;
    
    // Shorter but more frequent animations
    const duration = 1.2 + Math.random() * 1.5;
    
    // Set particle colors to match the exact Idle Heroes flame colors
    const colors = [
        'rgba(255, 69, 0, 0.8)',  // Red-orange
        'rgba(255, 140, 0, 0.8)',  // Orange
        'rgba(255, 165, 0, 0.8)',  // Gold
        'rgba(255, 215, 0, 0.8)'   // Yellow
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Apply precise styles
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `calc(50% + ${x}px)`;
    particle.style.top = `calc(50% + ${y}px)`;
    particle.style.background = color;
    particle.style.setProperty('--x', `${(Math.random() - 0.5) * 30}px`); // More controlled movement
    particle.style.animationDuration = `${duration}s`;
    
    // Add to container
    container.appendChild(particle);
    
    // Remove after animation
    setTimeout(() => {
        particle.remove();
    }, duration * 1000);
}

/**
 * Creates a flame ember effect - small golden spark that floats upward
 * @param {HTMLElement} container - The container for the ember
 */
function createEmber(container) {
    const ember = document.createElement('div');
    ember.className = 'flame-ember';
    
    // Get container dimensions
    const containerRect = container.getBoundingClientRect();
    const containerSize = Math.min(containerRect.width, containerRect.height);
    
    // Position ember precisely at the flame edge - higher concentration at top
    const angleOffset = (Math.random() * 0.5) - 0.25; // Slight variation around top
    const angle = (Math.PI * 1.5) + angleOffset; // Top of the circle with small variation
    const distance = containerSize * 0.45; // Just outside the icon edge
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    
    // Tiny embers for realistic fire effect
    const size = 1 + Math.random() * 2;
    
    // Longer animation for floating embers
    const duration = 1.8 + Math.random() * 1.5;
    
    // Apply styles - bright golden color for embers
    ember.style.width = `${size}px`;
    ember.style.height = `${size}px`;
    ember.style.left = `calc(50% + ${x}px)`;
    ember.style.top = `calc(50% + ${y}px)`;
    ember.style.setProperty('--x', `${(Math.random() - 0.5) * 15}px`); // Slight lateral movement
    ember.style.animationDuration = `${duration}s`;
    
    // Add to container
    container.appendChild(ember);
    
    // Remove after animation
    setTimeout(() => {
        ember.remove();
    }, duration * 1000);
}
