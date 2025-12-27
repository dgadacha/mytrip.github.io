const StorageService = {
    KEYS: {
        RESTAURANTS: 'japanTripRestaurants',
        ACTIVITIES: 'japanTripActivities',
        SORT: 'currentSort'
    },

    saveData(restaurants, activities) {
        localStorage.setItem(this.KEYS.RESTAURANTS, JSON.stringify(restaurants));
        localStorage.setItem(this.KEYS.ACTIVITIES, JSON.stringify(activities));
    },

    async loadData() {
        const savedRestaurants = localStorage.getItem(this.KEYS.RESTAURANTS);
        const savedActivities = localStorage.getItem(this.KEYS.ACTIVITIES);

        if (savedRestaurants && savedActivities) {
            return {
                restaurants: JSON.parse(savedRestaurants).map(r => new Activity({ ...r, type: 'restaurant' })),
                activities: JSON.parse(savedActivities).map(a => new Activity({ ...a, type: 'activity' }))
            };
        }

        try {
            const response = await fetch('data.json');
            const data = await response.json();
            
            const restaurants = data.restaurants?.map(r => new Activity({ ...r, type: 'restaurant' })) || [];
            const activities = data.activities?.map(a => new Activity({ ...a, type: 'activity' })) || [];
            
            this.saveData(restaurants, activities);
            console.log('✅ Données chargées depuis data.json');
            
            return { restaurants, activities };
        } catch (error) {
            console.error('❌ Erreur chargement data.json:', error);
            return { restaurants: [], activities: [] };
        }
    },

    exportData(restaurants, activities) {
        const data = {
            restaurants,
            activities,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `japan-trip-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    importData(callback) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    const restaurants = data.restaurants?.map(r => new Activity({ ...r, type: 'restaurant' })) || [];
                    const activities = data.activities?.map(a => new Activity({ ...a, type: 'activity' })) || [];
                    
                    callback(restaurants, activities);
                    alert('Données importées avec succès !');
                } catch (error) {
                    alert('Erreur lors de l\'import du fichier');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    },

    clearAllData() {
        if (!confirm('⚠️ ATTENTION : Cette action va supprimer TOUTES vos données de manière irréversible. Êtes-vous absolument sûr ?')) {
            return false;
        }

        if (!confirm('Dernière confirmation : voulez-vous vraiment vider toutes les données ?')) {
            return false;
        }

        localStorage.removeItem(this.KEYS.RESTAURANTS);
        localStorage.removeItem(this.KEYS.ACTIVITIES);
        
        alert('✓ Toutes les données ont été supprimées');
        return true;
    },

    saveSortPreference(sortType) {
        localStorage.setItem(this.KEYS.SORT, sortType);
    },

    getSortPreference() {
        return localStorage.getItem(this.KEYS.SORT) || 'none';
    }
};