const app = {
    restaurants: [],
    activities: [],

    async initialize() {
        ThemeManager.initialize();
        
        const data = await StorageService.loadData();
        this.restaurants = data.restaurants;
        this.activities = data.activities;
        
        // Restaurer le tri sauvegardé
        const savedSort = StorageService.getSortPreference();
        SortManager.setSort(savedSort);
        document.getElementById('sortBy').value = savedSort;
        
        this.renderAll();
        Dashboard.update(this.restaurants, this.activities);
        
        lucide.createIcons();
        NavigationManager.initialize();
    },

    saveItem(e) {
        e.preventDefault();
        
        const type = document.getElementById('itemType').value;
        const activityData = {
            name: document.getElementById('itemName').value,
            city: document.getElementById('itemCity').value,
            category: document.getElementById('category').value,
            price: parseInt(document.getElementById('price').value) || 0,
            date: document.getElementById('reservationDate').value,
            priority: document.getElementById('priority').value,
            googleMapsUrl: document.getElementById('googleMapsUrl').value,
            photoUrl: document.getElementById('photoUrl').value,
            notes: document.getElementById('notes').value,
            isBooked: document.getElementById('isBooked').checked,
            bookingUrl: document.getElementById('bookingUrl').value,
            type: type
        };

        if (ModalManager.currentEditId) {
            const index = type === 'restaurant' 
                ? this.restaurants.findIndex(r => r.id === ModalManager.currentEditId)
                : this.activities.findIndex(a => a.id === ModalManager.currentEditId);
            
            const items = type === 'restaurant' ? this.restaurants : this.activities;
            activityData.isDone = items[index].isDone || false;
            activityData.id = ModalManager.currentEditId;
            items[index] = new Activity(activityData);
        } else {
            if (type === 'restaurant') {
                this.restaurants.push(new Activity(activityData));
            } else {
                this.activities.push(new Activity(activityData));
            }
        }

        StorageService.saveData(this.restaurants, this.activities);
        this.renderAll();
        Dashboard.update(this.restaurants, this.activities);
        ModalManager.close('formModal');
    },

    toggleDone(id, type, event) {
        event.stopPropagation();
        
        if (type === 'restaurant') {
            const item = this.restaurants.find(r => r.id === id);
            if (item) {
                item.isDone = !item.isDone;
            }
        } else {
            const item = this.activities.find(a => a.id === id);
            if (item) {
                item.isDone = !item.isDone;
            }
        }
        
        StorageService.saveData(this.restaurants, this.activities);
        this.filterItems();
        CalendarView.render(this.restaurants, this.activities);
        
        refreshIcons();
    },

    showDetailById(id, type) {
        const item = type === 'restaurant' 
            ? this.restaurants.find(r => r.id === id)
            : this.activities.find(a => a.id === id);
        
        if (item) {
            ModalManager.openDetail(item);
        }
    },

    deleteFromDetail() {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
        
        if (ModalManager.currentDetailItem.type === 'restaurant') {
            this.restaurants = this.restaurants.filter(r => r.id !== ModalManager.currentDetailItem.id);
        } else {
            this.activities = this.activities.filter(a => a.id !== ModalManager.currentDetailItem.id);
        }

        StorageService.saveData(this.restaurants, this.activities);
        this.renderAll();
        Dashboard.update(this.restaurants, this.activities);
        ModalManager.close('detailModal');
    },

    deleteItem(id, type) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

        if (type === 'restaurant') {
            this.restaurants = this.restaurants.filter(r => r.id !== id);
        } else {
            this.activities = this.activities.filter(a => a.id !== id);
        }

        StorageService.saveData(this.restaurants, this.activities);
        this.renderAll();
        Dashboard.update(this.restaurants, this.activities);
    },

    renderAll() {
        const allItems = SortManager.applySorting([...this.restaurants, ...this.activities]);
        const sortedRestaurants = SortManager.applySorting(this.restaurants);
        const sortedActivities = SortManager.applySorting(this.activities);
        
        ListView.render('allItems', allItems);
        ListView.render('restaurantItems', sortedRestaurants);
        ListView.render('activityItems', sortedActivities);
        CalendarView.render(this.restaurants, this.activities);
        
        lucide.createIcons();
    },

    filterItems() {
        const cityFilter = document.getElementById('cityFilter').value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();

        let filteredRestaurants = this.restaurants;
        let filteredActivities = this.activities;

        if (cityFilter) {
            const isMainCity = !cityFilter.includes(' - ');
            
            filteredRestaurants = filteredRestaurants.filter(r => {
                if (isMainCity) {
                    return r.city.startsWith(cityFilter);
                } else {
                    return r.city === cityFilter;
                }
            });
            
            filteredActivities = filteredActivities.filter(a => {
                if (isMainCity) {
                    return a.city.startsWith(cityFilter);
                } else {
                    return a.city === cityFilter;
                }
            });
        }

        if (searchTerm) {
            filteredRestaurants = filteredRestaurants.filter(r => 
                r.name.toLowerCase().includes(searchTerm) ||
                (r.category && r.category.toLowerCase().includes(searchTerm)) ||
                (r.googleMapsUrl && r.googleMapsUrl.toLowerCase().includes(searchTerm)) ||
                (r.city && r.city.toLowerCase().includes(searchTerm))
            );
            filteredActivities = filteredActivities.filter(a => 
                a.name.toLowerCase().includes(searchTerm) ||
                (a.category && a.category.toLowerCase().includes(searchTerm)) ||
                (a.googleMapsUrl && a.googleMapsUrl.toLowerCase().includes(searchTerm)) ||
                (a.city && a.city.toLowerCase().includes(searchTerm))
            );
        }

        const allFiltered = [...filteredRestaurants, ...filteredActivities];
        ListView.render('allItems', SortManager.applySorting(allFiltered));
        ListView.render('restaurantItems', SortManager.applySorting(filteredRestaurants));
        ListView.render('activityItems', SortManager.applySorting(filteredActivities));
        
        refreshIcons();
    },

    sortItems() {
        const sortType = document.getElementById('sortBy').value;
        SortManager.setSort(sortType);
        StorageService.saveSortPreference(sortType);
        this.filterItems();
    },

    exportData() {
        StorageService.exportData(this.restaurants, this.activities);
    },

    importData() {
        StorageService.importData((restaurants, activities) => {
            this.restaurants = restaurants;
            this.activities = activities;
            StorageService.saveData(this.restaurants, this.activities);
            this.renderAll();
            Dashboard.update(this.restaurants, this.activities);
        });
    },

    clearAllData() {
        if (StorageService.clearAllData()) {
            this.restaurants = [];
            this.activities = [];
            this.renderAll();
            Dashboard.update(this.restaurants, this.activities);
        }
    }
};

// Fonctions globales pour être appelées depuis le HTML
function saveItem(e) {
    app.saveItem(e);
}

function filterItems() {
    app.filterItems();
}

function sortItems() {
    app.sortItems();
}

function exportData() {
    app.exportData();
}

function importData() {
    app.importData();
}

function clearAllData() {
    app.clearAllData();
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    app.initialize();
});