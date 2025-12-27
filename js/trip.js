let currentTripId = null;
let currentTrip = null;
let restaurants = [];
let activities = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Initialiser Firebase
    await FirebaseService.initialize();
    
    // Vérifier auth
    FirebaseService.auth.onAuthStateChanged(async user => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        
        // Récupérer l'ID du trip depuis l'URL
        const urlParams = new URLSearchParams(window.location.search);
        currentTripId = urlParams.get('id');
        
        if (!currentTripId) {
            // Pas d'ID de trip → redirection vers trips
            window.location.href = 'trips.html';
            return;
        }
        
        // Charger le trip
        await loadTrip();
        
        // Initialiser l'app
        await app.initialize();
    });
});

async function loadTrip() {
    const result = await FirebaseService.getTrip(currentTripId);
    
    if (!result.success) {
        alert('Erreur: ' + result.error);
        window.location.href = 'trips.html';
        return;
    }
    
    // Convertir en instance de Trip pour avoir accès aux méthodes
    currentTrip = new Trip(result.trip);
    
    // Mettre à jour le titre de la page et le header
    document.title = currentTrip.name + ' - Vacayo';
    document.getElementById('tripName').textContent = currentTrip.name;
    
    // Afficher le bouton inviter si owner
    if (currentTrip.myRole === 'owner') {
        document.getElementById('inviteBtn').style.display = 'flex';
    }
    
    // Charger les activités
    const activitiesResult = await FirebaseService.getTripActivities(currentTripId);
    
    if (activitiesResult.success) {
        const allActivities = activitiesResult.activities;
        
        // Séparer restaurants et activités
        restaurants = allActivities.filter(a => a.type === 'restaurant');
        activities = allActivities.filter(a => a.type === 'activity');
    }
    
    // Appliquer les permissions UI
    updateUIPermissions();
    
    // Afficher l'app
    document.getElementById('initialLoader').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
}

function updateUIPermissions() {
    const canEdit = currentTrip.canEdit();
    const isOwner = currentTrip.isOwner();
    
    // Désactiver/cacher le FAB si pas de permissions d'édition
    const fab = document.querySelector('.fab');
    const fabMenu = document.getElementById('fabMenu');
    
    if (!canEdit) {
        if (fab) fab.style.display = 'none';
        if (fabMenu) fabMenu.style.display = 'none';
    }
    
    // Afficher un message en mode lecture seule
    if (!canEdit) {
        showReadOnlyBanner();
    }
}

function showReadOnlyBanner() {
    const dashboard = document.getElementById('dashboard');
    
    const banner = document.createElement('div');
    banner.style.cssText = `
        background: rgba(142, 142, 147, 0.1);
        color: var(--text-secondary);
        padding: 12px 20px;
        text-align: center;
        font-size: 0.875rem;
        border-bottom: 1px solid var(--border-color);
    `;
    banner.innerHTML = `
        <i data-lucide="eye" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 6px;"></i>
        Mode lecture seule - Vous pouvez consulter ce voyage mais pas le modifier
    `;
    
    dashboard.parentNode.insertBefore(banner, dashboard);
    lucide.createIcons();
}

const app = {
    restaurants: [],
    activities: [],
    
    async initialize() {
        this.restaurants = restaurants;
        this.activities = activities;
        
        // Initialiser les composants
        ThemeManager.initialize();
        NavigationManager.initialize();
        
        // Render initial
        this.renderAll();
        Dashboard.update(this.restaurants, this.activities);
        
        // Icons
        lucide.createIcons();
        
        // Event listeners
        document.getElementById('searchInput').addEventListener('input', () => this.filterItems());
        document.getElementById('cityFilter').addEventListener('change', () => this.filterItems());
        document.getElementById('sortSelect').addEventListener('change', (e) => this.sortItems(e.target.value));
        
        // Event listener pour isBooked checkbox
        const isBookedCheckbox = document.getElementById('isBooked');
        if (isBookedCheckbox) {
            isBookedCheckbox.addEventListener('change', function() {
                const dateGroup = document.getElementById('reservationDateGroup');
                dateGroup.style.display = this.checked ? 'block' : 'none';
            });
        }
        
        console.log('✅ App initialisée avec Firebase');
    },

    renderAll() {
        const allItems = SortManager.applySorting([...this.restaurants, ...this.activities]);
        const sortedRestaurants = SortManager.applySorting(this.restaurants);
        const sortedActivities = SortManager.applySorting(this.activities);
        
        ListView.render('allItems', allItems);
        ListView.render('restaurantItems', sortedRestaurants);
        ListView.render('activityItems', sortedActivities);
        CalendarView.render(this.restaurants, this.activities);
        
        // Mettre à jour le filtre ville
        this.updateCityFilter();
        
        lucide.createIcons();
    },

    updateCityFilter() {
        const cities = new Set();
        [...this.restaurants, ...this.activities].forEach(item => {
            if (item.city) cities.add(item.city);
        });

        const cityFilter = document.getElementById('cityFilter');
        const currentValue = cityFilter.value;
        
        cityFilter.innerHTML = '<option value="">Toutes les villes</option>';
        Array.from(cities).sort().forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            cityFilter.appendChild(option);
        });
        
        cityFilter.value = currentValue;
    },

    filterItems() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const cityFilter = document.getElementById('cityFilter').value;

        const filterItem = (item) => {
            const matchesSearch = !searchTerm || 
                item.name.toLowerCase().includes(searchTerm) ||
                item.city.toLowerCase().includes(searchTerm) ||
                (item.notes && item.notes.toLowerCase().includes(searchTerm));
            
            const matchesCity = !cityFilter || item.city === cityFilter || item.city.startsWith(cityFilter + ' - ');
            
            return matchesSearch && matchesCity;
        };

        const filteredAll = [...this.restaurants, ...this.activities].filter(filterItem);
        const filteredRestaurants = this.restaurants.filter(filterItem);
        const filteredActivities = this.activities.filter(filterItem);

        ListView.render('allItems', SortManager.applySorting(filteredAll));
        ListView.render('restaurantItems', SortManager.applySorting(filteredRestaurants));
        ListView.render('activityItems', SortManager.applySorting(filteredActivities));
        
        lucide.createIcons();
    },

    sortItems(sortType) {
        SortManager.setSort(sortType);
        this.renderAll();
    },

    async saveItem(e) {
        e.preventDefault();
        
        // Vérifier les permissions
        if (!currentTrip.canEdit()) {
            alert('Vous n\'avez pas la permission de modifier ce voyage');
            return;
        }
        
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
            // Update
            const result = await FirebaseService.updateActivity(currentTripId, ModalManager.currentEditId, activityData);
            
            if (result.success) {
                // Mettre à jour localement
                const index = type === 'restaurant' 
                    ? this.restaurants.findIndex(r => r.id === ModalManager.currentEditId)
                    : this.activities.findIndex(a => a.id === ModalManager.currentEditId);
                
                const items = type === 'restaurant' ? this.restaurants : this.activities;
                activityData.id = ModalManager.currentEditId;
                activityData.isDone = items[index].isDone || false;
                items[index] = new Activity(activityData);
            } else {
                alert('Erreur: ' + result.error);
            }
        } else {
            // Create
            const result = await FirebaseService.addActivity(currentTripId, activityData);
            
            if (result.success) {
                activityData.id = result.id;
                activityData.isDone = false;
                
                if (type === 'restaurant') {
                    this.restaurants.push(new Activity(activityData));
                } else {
                    this.activities.push(new Activity(activityData));
                }
            } else {
                alert('Erreur: ' + result.error);
            }
        }

        this.renderAll();
        Dashboard.update(this.restaurants, this.activities);
        ModalManager.close('formModal');
    },

    async toggleDone(id, type, event) {
        event.stopPropagation();
        
        // Vérifier les permissions
        if (!currentTrip.canEdit()) {
            return;
        }
        
        const items = type === 'restaurant' ? this.restaurants : this.activities;
        const item = items.find(i => i.id === id);
        
        if (item) {
            item.isDone = !item.isDone;
            
            // Update Firestore
            await FirebaseService.updateActivity(currentTripId, id, { isDone: item.isDone });
            
            this.renderAll();
            Dashboard.update(this.restaurants, this.activities);
        }
    },

    showDetailById(id, type) {
        const items = type === 'restaurant' ? this.restaurants : this.activities;
        const item = items.find(i => i.id === id);
        if (item) {
            ModalManager.openDetail(item);
        }
    },

    async deleteFromDetail() {
        // Vérifier les permissions
        if (!currentTrip.canEdit()) {
            alert('Vous n\'avez pas la permission de supprimer des éléments');
            return;
        }
        
        const detailContent = document.getElementById('detailContent');
        const itemId = detailContent.dataset.itemId;
        const itemType = detailContent.dataset.itemType;
        
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
        
        const result = await FirebaseService.deleteActivity(currentTripId, itemId);
        
        if (result.success) {
            if (itemType === 'restaurant') {
                this.restaurants = this.restaurants.filter(r => r.id !== itemId);
            } else {
                this.activities = this.activities.filter(a => a.id !== itemId);
            }
            
            this.renderAll();
            Dashboard.update(this.restaurants, this.activities);
            ModalManager.close('detailModal');
        } else {
            alert('Erreur: ' + result.error);
        }
    },

    editFromDetail() {
        // Vérifier les permissions
        if (!currentTrip.canEdit()) {
            alert('Vous n\'avez pas la permission de modifier des éléments');
            return;
        }
        
        const detailContent = document.getElementById('detailContent');
        const itemId = detailContent.dataset.itemId;
        const itemType = detailContent.dataset.itemType;
        
        const items = itemType === 'restaurant' ? this.restaurants : this.activities;
        const item = items.find(i => i.id === itemId);
        
        if (item) {
            ModalManager.close('detailModal');
            ModalManager.openForm(itemType, item);
        }
    },

    async deleteItem(id, type) {
        // Vérifier les permissions
        if (!currentTrip.canEdit()) {
            alert('Vous n\'avez pas la permission de supprimer des éléments');
            return;
        }
        
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
        
        const result = await FirebaseService.deleteActivity(currentTripId, id);
        
        if (result.success) {
            if (type === 'restaurant') {
                this.restaurants = this.restaurants.filter(r => r.id !== id);
            } else {
                this.activities = this.activities.filter(a => a.id !== id);
            }
            
            this.renderAll();
            Dashboard.update(this.restaurants, this.activities);
        } else {
            alert('Erreur: ' + result.error);
        }
    },

    exportData() {
        const data = {
            tripName: currentTrip.name,
            tripId: currentTripId,
            restaurants: this.restaurants,
            activities: this.activities,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vacayo-${currentTrip.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        ModalManager.close('settingsModal');
    },

    async importData(event) {
        // Vérifier les permissions
        if (!currentTrip.canEdit()) {
            alert('Vous n\'avez pas la permission d\'importer des données');
            return;
        }
        
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!confirm(`Importer ${data.restaurants?.length || 0} restaurants et ${data.activities?.length || 0} activités ? Cela ajoutera ces éléments au voyage actuel.`)) {
                    return;
                }

                // Importer les données
                const importedRestaurants = data.restaurants || [];
                const importedActivities = data.activities || [];

                // Ajouter à Firestore
                for (const resto of importedRestaurants) {
                    delete resto.id; // Supprimer l'ancien ID
                    await FirebaseService.addActivity(currentTripId, resto);
                }

                for (const activity of importedActivities) {
                    delete activity.id; // Supprimer l'ancien ID
                    await FirebaseService.addActivity(currentTripId, activity);
                }

                // Recharger
                await loadTrip();
                this.restaurants = restaurants;
                this.activities = activities;
                this.renderAll();
                Dashboard.update(this.restaurants, this.activities);

                ModalManager.close('settingsModal');
                alert('Import réussi !');
            } catch (error) {
                alert('Erreur lors de l\'import : ' + error.message);
            }
        };
        reader.readAsText(file);
        
        event.target.value = '';
    },

    async clearAllData() {
        // Vérifier les permissions
        if (!currentTrip.canEdit()) {
            alert('Vous n\'avez pas la permission de supprimer des données');
            return;
        }
        
        if (!confirm('⚠️ ATTENTION : Voulez-vous vraiment supprimer TOUTES les activités de ce voyage ? Cette action est irréversible !')) {
            return;
        }

        if (!confirm('Êtes-vous VRAIMENT sûr ? Toutes les données seront perdues définitivement.')) {
            return;
        }

        // Supprimer toutes les activités
        const allActivities = [...this.restaurants, ...this.activities];
        for (const activity of allActivities) {
            await FirebaseService.deleteActivity(currentTripId, activity.id);
        }

        this.restaurants = [];
        this.activities = [];
        this.renderAll();
        Dashboard.update(this.restaurants, this.activities);
        
        ModalManager.close('settingsModal');
        alert('Toutes les données ont été supprimées.');
    }
};

// ===== FONCTIONS D'INVITATION =====

function openInviteModal() {
    document.getElementById('inviteModal').classList.add('active');
    document.getElementById('inviteEmail').focus();
    document.getElementById('inviteSuccess').style.display = 'none';
    document.getElementById('inviteError').style.display = 'none';
}

async function sendInvite() {
    const email = document.getElementById('inviteEmail').value.trim();
    const role = document.getElementById('inviteRole').value;
    const sendBtn = document.getElementById('sendInviteBtn');
    const successDiv = document.getElementById('inviteSuccess');
    const errorDiv = document.getElementById('inviteError');

    if (!email) {
        showInviteError('Veuillez entrer un email');
        return;
    }

    sendBtn.disabled = true;
    sendBtn.textContent = 'Envoi en cours...';
    successDiv.style.display = 'none';
    errorDiv.style.display = 'none';

    const result = await FirebaseService.inviteParticipant(currentTripId, email, role);

    if (result.success) {
        document.getElementById('inviteSuccessMessage').innerHTML = 
            `✅ Invitation envoyée à <strong>${email}</strong> !<br>` +
            `Cette personne verra l'invitation à sa prochaine connexion.`;
        successDiv.style.display = 'block';
        document.getElementById('inviteEmail').value = '';
        lucide.createIcons();
    } else {
        showInviteError(result.error);
    }

    sendBtn.disabled = false;
    sendBtn.textContent = 'Envoyer l\'invitation';
}

function showInviteError(message) {
    const errorDiv = document.getElementById('inviteError');
    document.getElementById('inviteErrorMessage').textContent = message;
    errorDiv.style.display = 'block';
}

// ===== FONCTIONS GLOBALES =====

function saveItem(e) {
    app.saveItem(e);
}

function toggleDone(id, type, event) {
    app.toggleDone(id, type, event);
}

function showDetailById(id, type) {
    app.showDetailById(id, type);
}

function deleteFromDetail() {
    app.deleteFromDetail();
}

function editFromDetail() {
    app.editFromDetail();
}

function exportData() {
    app.exportData();
}

function importData(event) {
    app.importData(event);
}

function clearAllData() {
    app.clearAllData();
}

function goToTrips() {
    window.location.href = 'trips.html';
}

function openSettings() {
    ModalManager.openSettings();
}

function toggleTheme() {
    ThemeManager.toggleTheme();
}

function openForm(type, item = null) {
    ModalManager.openForm(type, item);
}

function closeModal(modalId) {
    ModalManager.close(modalId);
}

function switchTab(tab) {
    NavigationManager.switchTab(tab);
}

function bottomNavSwitch(view) {
    NavigationManager.bottomNavSwitch(view);
}

function toggleFabMenu() {
    NavigationManager.toggleFabMenu();
}

// ===== QUICK DATE MODAL =====

let currentQuickDateItem = null;

function openQuickDateModal(id, type, event) {
    event.stopPropagation();
    
    const items = type === 'restaurant' ? app.restaurants : app.activities;
    const item = items.find(i => i.id === id);
    
    if (!item) return;
    
    currentQuickDateItem = { id, type, item };
    
    // Pré-remplir avec la date existante si disponible
    const quickDateInput = document.getElementById('quickDate');
    const removeBtn = document.getElementById('removeQuickDateBtn');
    
    if (item.date) {
        quickDateInput.value = item.date;
        removeBtn.style.display = 'block'; // Afficher le bouton supprimer
    } else {
        quickDateInput.value = '';
        removeBtn.style.display = 'none'; // Cacher le bouton supprimer
    }
    
    document.getElementById('quickDateModal').classList.add('active');
    quickDateInput.focus();
}

async function saveQuickDate() {
    if (!currentQuickDateItem) return;
    
    const newDate = document.getElementById('quickDate').value;
    
    if (!newDate) {
        alert('Veuillez sélectionner une date');
        return;
    }
    
    const { id, type } = currentQuickDateItem;
    
    // Mettre à jour dans Firebase
    const result = await FirebaseService.updateActivity(currentTripId, id, { date: newDate });
    
    if (result.success) {
        // Mettre à jour localement
        const items = type === 'restaurant' ? app.restaurants : app.activities;
        const item = items.find(i => i.id === id);
        if (item) {
            item.date = newDate;
        }
        
        // Re-render
        app.renderAll();
        Dashboard.update(app.restaurants, app.activities);
        
        // Fermer la modal
        closeModal('quickDateModal');
        currentQuickDateItem = null;
    } else {
        alert('Erreur: ' + result.error);
    }
}

async function removeQuickDate() {
    if (!currentQuickDateItem) return;
    
    if (!confirm('Voulez-vous vraiment supprimer cette date ?')) return;
    
    const { id, type } = currentQuickDateItem;
    
    // Mettre à jour dans Firebase (date vide = suppression)
    const result = await FirebaseService.updateActivity(currentTripId, id, { date: '' });
    
    if (result.success) {
        // Mettre à jour localement
        const items = type === 'restaurant' ? app.restaurants : app.activities;
        const item = items.find(i => i.id === id);
        if (item) {
            item.date = '';
        }
        
        // Re-render
        app.renderAll();
        Dashboard.update(app.restaurants, app.activities);
        
        // Fermer la modal
        closeModal('quickDateModal');
        currentQuickDateItem = null;
    } else {
        alert('Erreur: ' + result.error);
    }
}