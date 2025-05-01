/**
 * Mock Data Provider for Testing
 * 
 * This file provides sample data for testing the Idle Heroes Account Viewer
 * when no actual data is available from the server.
 */

class MockDataProvider {
    /**
     * Get mock data for a given platform and UID
     * @param {string} platform - Platform (iOS or Android)
     * @param {string} uid - User ID
     * @returns {string} Compressed mock data
     */
    static getMockData(platform, uid) {
        // Create a realistic demo account based on latest meta
        const mockAccount = {
            version: "2.0",
            timestamp: new Date().toISOString(),
            user: {
                uid: uid,
                platform: platform,
                level: 350,
                name: "DEMO_ACCOUNT",
                server: `S${Math.floor(Math.random() * 1000) + 1}`,
                guild: "Celestial Order",
                avatar: "Fairy Queen Vesa"
            },
            heroes: [
                {
                    id: "1",
                    name: "Fairy Queen Vesa",
                    faction: "Transcendence",
                    stars: 15,  // Transcendence hero
                    level: 350,
                    power: 2750000,
                    isTranscendence: true,
                    isEvolved: true,
                    evolutionLevel: 2,
                    skills: ["Nature's Wrath", "Verdant Blessing", "Eternal Bloom", "Forest Guardian"],
                    artifact: "Ruyi Scepter",
                    stone: "Speed, HP",
                    enable: [1, 1, 3, 3, 2],
                    resonanceGear: true,
                    skin: "Spring Fairy"
                },
                {
                    id: "2",
                    name: "Scarlet Queen Halora",
                    faction: "Transcendence",
                    stars: 15,
                    level: 350,
                    power: 2650000,
                    isTranscendence: true,
                    isEvolved: true,
                    evolutionLevel: 1,
                    skills: ["Scarlet Blade", "Bloodthirst", "Crimson Shield", "Royal Execution"],
                    artifact: "Antlers Cane",
                    stone: "Crit, Crit Damage, Attack",
                    enable: [2, 2, 3, 2, 2],
                    resonanceGear: true,
                    skin: "Crimson Empress"
                },
                {
                    id: "3",
                    name: "Sword Flash Xia",
                    faction: "Transcendence",
                    stars: 15,
                    level: 350,
                    power: 2680000,
                    isTranscendence: true,
                    isEvolved: true,
                    evolutionLevel: 1,
                    skills: ["Flash Strike", "Sword Domain", "Lethal Flaw", "Transcendent Eye"],
                    artifact: "Dildo Staff",
                    stone: "Holy Damage, Attack, Attack",
                    enable: [2, 2, 2, 2, 2],
                    resonanceGear: true,
                    skin: "Lustrous Blade"
                },
                {
                    id: "4",
                    name: "Star Wing Jahra",
                    faction: "Transcendence",
                    stars: 15,
                    level: 350,
                    power: 2600000,
                    isTranscendence: true,
                    skills: ["Cosmic Judgment", "Stellar Vortex", "Galactic Wisdom", "Astral Force"],
                    artifact: "Demon Bell",
                    stone: "Speed, Attack",
                    enable: [2, 1, 3, 1, 2],
                    resonanceGear: true
                },
                {
                    id: "5",
                    name: "Star Swordsman Mockman",
                    faction: "Transcendence",
                    stars: 15,
                    level: 350,
                    power: 2620000,
                    isTranscendence: true,
                    skills: ["Star Slash", "Meteor Strike", "Cosmic Shield", "Universal Power"],
                    artifact: "Splendid Melodic Strings",
                    stone: "Attack, Attack",
                    enable: [2, 2, 1, 2, 2],
                    resonanceGear: true
                },
                {
                    id: "6",
                    name: "Lord of Fear Aspen",
                    faction: "Transcendence",
                    stars: 15,
                    level: 350,
                    power: 2590000,
                    isTranscendence: true,
                    skills: ["Shadow Strike", "Dark Harvest", "Soul Reap", "Abyssal Horror"],
                    artifact: "Crown of Signets",
                    stone: "Crit, Crit Damage, Attack",
                    enable: [1, 3, 1, 3, 2],
                    resonanceGear: true
                },
                {
                    id: "7",
                    name: "Eloise",
                    faction: "Shadow",
                    stars: 10,
                    level: 350,
                    power: 1250000,
                    evolved: false,
                    skills: ["Shadow Guard", "Counterattack", "Ghost Possession", "Soul Contract"],
                    artifact: "Withered Armor",
                    stone: "Block, HP",
                    enable: [1, 1, 3, 1, 2],
                    resonanceGear: true,
                    skin: "Lady of Shadows"
                },
                {
                    id: "8",
                    name: "Drake",
                    faction: "Dark",
                    stars: 10,
                    level: 350,
                    power: 1150000,
                    evolved: false,
                    skills: ["Black Hole Mark", "Shadow Lurk", "Deadly Strike", "Dark Eclipse"],
                    artifact: "Demon Bell",
                    stone: "Speed, HP",
                    enable: [2, 2, 3, 2, 2],
                    resonanceGear: true
                },
                {
                    id: "9",
                    name: "Rogan",
                    faction: "Forest",
                    stars: 10,
                    level: 350,
                    power: 1180000,
                    evolved: false,
                    skills: ["Bloodthirsty", "Death Gaze", "Pack Leader", "Spiritual Blessing"],
                    artifact: "Demon Bell",
                    stone: "Speed, HP",
                    enable: [2, 2, 3, 2, 1],
                    resonanceGear: true
                }
            ],
            inventory: [
                {
                    id: "1",
                    name: "Heroic Summon Scroll",
                    type: "scroll",
                    count: 1837
                },
                {
                    id: "2",
                    name: "Prophet Orb",
                    type: "orb",
                    count: 580
                },
                {
                    id: "3",
                    name: "5-Star Hero Shard",
                    type: "shard",
                    count: 12500
                },
                {
                    id: "4",
                    name: "Universal Crystal",
                    type: "currency",
                    count: 1250000
                },
                {
                    id: "5",
                    name: "Stellar Shard",
                    type: "material",
                    count: 4500000
                },
                {
                    id: "6",
                    name: "Core of Transcendence",
                    type: "material",
                    count: 254
                },
                {
                    id: "7",
                    name: "Soul Symbol",
                    type: "material",
                    count: 350000
                },
                {
                    id: "8",
                    name: "Splendid Antlers Cane",
                    type: "artifact",
                    count: 1
                },
                {
                    id: "9",
                    name: "Glittery Crown",
                    type: "artifact",
                    count: 1
                },
                {
                    id: "10",
                    name: "Magic Source",
                    type: "artifact",
                    count: 4
                },
                {
                    id: "11",
                    name: "Splendid Punisher of Immortal",
                    type: "artifact",
                    count: 1
                },
                {
                    id: "12",
                    name: "Glittery Kiss of Ghost",
                    type: "artifact",
                    count: 1
                }
            ],
            resources: {
                gold: 10000000000,
                gems: 75000,
                spirit: 2000000000,
                promotion_stones: 1500000000,
                celestial_island_stones: 750000,
                dust: 1200000,
                void_material: 650000,
                transcendence_material: 150000
            }
        };

        // Compress the data like the server would
        return DataCompressor.compressForUrl(mockAccount);
    }
}

// If DataCompressor is not available, create a simple implementation
if (typeof DataCompressor === 'undefined') {
    class DataCompressor {
        static compressForUrl(data) {
            // Simple compression - in real version this would do proper compression
            return btoa(JSON.stringify(data));
        }
        
        static decompressFromUrl(compressed) {
            try {
                return JSON.parse(atob(compressed));
            } catch (e) {
                return null;
            }
        }
    }
    window.DataCompressor = DataCompressor;
}

// Make MockDataProvider available globally
window.MockDataProvider = MockDataProvider;
