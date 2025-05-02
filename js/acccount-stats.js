class AccountStats {
    static async updateCount() {
        try {
            const response = await fetch('/stats/account-stats.json');
            const stats = await response.json();
            
            stats.totalAccounts++;
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