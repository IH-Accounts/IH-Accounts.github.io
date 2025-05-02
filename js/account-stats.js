class AccountStats {
    static async updateCount(platform, uid) {
        try {
            // Kun opdater hvis det er en gyldig platform
            if (!['iOS', 'Android'].includes(platform)) {
                console.error('Invalid platform:', platform);
                return;
            }
            
            const response = await fetch('/stats/account-stats.json');
            const stats = await response.json();
            
            // Kun opdater totalt antal
            stats.totalAccounts++;
            
            // Opdater platform-specifikke tal
            if (platform === 'iOS') {
                stats.totalIOS++;
            } else {
                stats.totalAndroid++;
            }
            
            stats.lastUpdated = new Date().toISOString();
            
            await fetch('/stats/account-stats.json', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(stats)
            });
            
            console.log('Account stats updated:', stats);
        } catch (error) {
            console.error('Error updating account stats:', error);
        }
    }
}