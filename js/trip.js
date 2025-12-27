let currentTripId = null;
let currentTrip = null;
let hotels = [];
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

    // Charger les villes du pays du voyage
    if (currentTrip.country) {
        loadCitiesForCountry(currentTrip.country);
    }
    
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
        
        // Séparer hotels, restaurants et activités
        hotels = allActivities.filter(a => a.type === 'hotel');
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
    hotels: [],
    restaurants: [],
    activities: [],
    
    async initialize() {
        this.hotels = hotels;
        this.restaurants = restaurants;
        this.activities = activities;
        
        // Initialiser les composants
        ThemeManager.initialize();
        NavigationManager.initialize();
        
        // Render initial
        this.renderAll();
        Dashboard.update(this.hotels, this.restaurants, this.activities);
        
        // Icons
        lucide.createIcons();
        
        // Event listeners
        document.getElementById('searchInput').addEventListener('input', () => this.filterItems());
        document.getElementById('cityFilter').addEventListener('change', () => this.filterItems());
        document.getElementById('sortSelect').addEventListener('change', (e) => this.sortItems(e.target.value));
        
        console.log('✅ App initialisée avec Firebase');
    },

    renderAll() {
        // Mettre à jour le filtre ville
        this.updateCityFilter();
        
        // Réappliquer les filtres actifs
        this.filterItems();
        
        // Mettre à jour le dashboard
        Dashboard.update(this.hotels, this.restaurants, this.activities);
    },

    updateCityFilter() {
        const cityFilter = document.getElementById('cityFilter');
        if (!cityFilter) return;
        
        // Sauvegarder la valeur actuelle
        const currentValue = cityFilter.value;
        
        // Récupérer les villes du pays du voyage
        const countryCities = currentTrip?.country ? COUNTRIES_DATA.getCitiesForCountry(currentTrip.country) : [];
        
        // Collecter toutes les villes UTILISÉES dans les activités
        const usedCities = new Set();
        [...this.hotels, ...this.restaurants, ...this.activities].forEach(item => {
            if (item.city) usedCities.add(item.city);
        });
        
        // Combiner les villes du pays + villes utilisées (pour garder les anciennes)
        const allCities = new Set([...countryCities, ...usedCities]);
        
        // Trier les villes
        const sortedCities = Array.from(allCities).sort();
        
        // Vider complètement le select
        cityFilter.innerHTML = '<option value="">Toutes les villes</option>';
        
        // Ajouter les options
        sortedCities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            cityFilter.appendChild(option);
        });
        
        // Restaurer la valeur si elle existe encore, sinon reset
        if (currentValue && sortedCities.includes(currentValue)) {
            cityFilter.value = currentValue;
        } else {
            cityFilter.value = '';
            // Si on a reset le filtre, il faut réappliquer les filtres
            if (currentValue) {
                this.filterItems();
            }
        }
    },

    filterItems() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const cityFilter = document.getElementById('cityFilter')?.value || '';

        const filterItem = (item) => {
            const matchesSearch = !searchTerm || 
                item.name.toLowerCase().includes(searchTerm) ||
                item.city.toLowerCase().includes(searchTerm) ||
                (item.notes && item.notes.toLowerCase().includes(searchTerm));
            
            const matchesCity = !cityFilter || item.city === cityFilter || item.city.startsWith(cityFilter + ' - ');
            
            return matchesSearch && matchesCity;
        };

        const filteredHotels = this.hotels.filter(filterItem);
        const filteredRestaurants = this.restaurants.filter(filterItem);
        const filteredActivities = this.activities.filter(filterItem);

        ListView.render('hotelItems', SortManager.applySorting(filteredHotels));
        ListView.render('restaurantItems', SortManager.applySorting(filteredRestaurants));
        ListView.render('activityItems', SortManager.applySorting(filteredActivities));
        CalendarView.render(filteredHotels, filteredRestaurants, filteredActivities);
        
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
            endDate: type === 'hotel' ? document.getElementById('endDate').value : '',
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
                // Déterminer le bon tableau selon le type
                let items, index;
                if (type === 'hotel') {
                    index = this.hotels.findIndex(h => h.id === ModalManager.currentEditId);
                    items = this.hotels;
                } else if (type === 'restaurant') {
                    index = this.restaurants.findIndex(r => r.id === ModalManager.currentEditId);
                    items = this.restaurants;
                } else {
                    index = this.activities.findIndex(a => a.id === ModalManager.currentEditId);
                    items = this.activities;
                }
                
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
                
                if (type === 'hotel') {
                    this.hotels.push(new Activity(activityData));
                } else if (type === 'restaurant') {
                    this.restaurants.push(new Activity(activityData));
                } else {
                    this.activities.push(new Activity(activityData));
                }
            } else {
                alert('Erreur: ' + result.error);
            }
        }

        this.renderAll();
        Dashboard.update(this.hotels, this.restaurants, this.activities);
        ModalManager.close('formModal');
    },

    async toggleDone(id, type, event) {
        event.stopPropagation();
        
        // Vérifier les permissions
        if (!currentTrip.canEdit()) {
            return;
        }

        let items;
        if (type === 'hotel') {
            items = this.hotels;
        } else if (type === 'restaurant') {
            items = this.restaurants;
        } else {
            items = this.activities;
        }

        const item = items.find(i => i.id === id);
        
        if (item) {
            item.isDone = !item.isDone;
            
            // Update Firestore
            await FirebaseService.updateActivity(currentTripId, id, { isDone: item.isDone });
            
            this.renderAll();
            Dashboard.update(this.hotels, this.restaurants, this.activities);
        }
    },

    showDetailById(id, type) {
        let items;
        if (type === 'hotel') {
            items = this.hotels;
        } else if (type === 'restaurant') {
            items = this.restaurants;
        } else {
            items = this.activities;
        }

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
            if (itemType === 'hotel') {
                this.hotels = this.hotels.filter(h => h.id !== itemId);
            } else if (itemType === 'restaurant') {
                this.restaurants = this.restaurants.filter(r => r.id !== itemId);
            } else {
                this.activities = this.activities.filter(a => a.id !== itemId);
            }
            
            this.renderAll();
            Dashboard.update(this.hotels, this.restaurants, this.activities);
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
        
        let items;
        if (itemType === 'hotel') {
            items = this.hotels;
        } else if (itemType === 'restaurant') {
            items = this.restaurants;
        } else {
            items = this.activities;
        }

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
            if (type === 'hotel') {
                this.hotels = this.hotels.filter(h => h.id !== id);
            } else if (type === 'restaurant') {
                this.restaurants = this.restaurants.filter(r => r.id !== id);
            } else {
                this.activities = this.activities.filter(a => a.id !== id);
            }
            
            this.renderAll();
            Dashboard.update(this.hotels, this.restaurants, this.activities);
        } else {
            alert('Erreur: ' + result.error);
        }
    },

    exportData() {
        const data = {
            tripName: currentTrip.name,
            tripId: currentTripId,
            hotels: this.hotels,
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
                
                if (!confirm(`Importer ${data.hotels?.length || 0} hôtels, ${data.restaurants?.length || 0} restaurants et ${data.activities?.length || 0} activités ? Cela ajoutera ces éléments au voyage actuel.`)) {
                    return;
                }

                // Importer les données
                const importedHotels = data.hotels || [];
                const importedRestaurants = data.restaurants || [];
                const importedActivities = data.activities || [];

                // Ajouter à Firestore
                for (const hotel of importedHotels) {
                    delete hotel.id;
                    await FirebaseService.addActivity(currentTripId, hotel);
                }

                for (const resto of importedRestaurants) {
                    delete resto.id;
                    await FirebaseService.addActivity(currentTripId, resto);
                }

                for (const activity of importedActivities) {
                    delete activity.id;
                    await FirebaseService.addActivity(currentTripId, activity);
                }

                // Recharger
                await loadTrip();
                this.hotels = hotels;
                this.restaurants = restaurants;
                this.activities = activities;
                this.renderAll();
                Dashboard.update(this.hotels, this.restaurants, this.activities);

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
        const allActivities = [...this.hotels, ...this.restaurants, ...this.activities];
        for (const activity of allActivities) {
            await FirebaseService.deleteActivity(currentTripId, activity.id);
        }

        this.hotels = [];
        this.restaurants = [];
        this.activities = [];
        this.renderAll();
        Dashboard.update(this.hotels, this.restaurants, this.activities);
        
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

// ===== QUICK DATE MODAL =====

let currentQuickDateItem = null;

function openQuickDateModal(id, type, event) {
    event.stopPropagation();

    let items;
    if (type === 'hotel') {
        items = app.hotels;
    } else if (type === 'restaurant') {
        items = app.restaurants;
    } else {
        items = app.activities;
    }

    const item = items.find(i => i.id === id);
    
    if (!item) return;
    
    currentQuickDateItem = { id, type, item };
    
    // Adapter le titre et les labels selon le type
    const modalTitle = document.getElementById('quickDateModalTitle');
    const quickDateLabel = document.getElementById('quickDateLabel');
    const quickEndDateGroup = document.getElementById('quickEndDateGroup');
    
    if (type === 'hotel') {
        modalTitle.textContent = 'Définir les dates de séjour';
        quickDateLabel.textContent = 'Date de début (Check-in)';
        quickEndDateGroup.style.display = 'block';
    } else {
        modalTitle.textContent = 'Définir une date';
        quickDateLabel.textContent = 'Date et heure';
        quickEndDateGroup.style.display = 'none';
    }
    
    // Pré-remplir avec les dates existantes si disponibles
    const quickDateInput = document.getElementById('quickDate');
    const quickEndDateInput = document.getElementById('quickEndDate');
    const removeBtn = document.getElementById('removeQuickDateBtn');
    
    if (item.date) {
        quickDateInput.value = item.date;
        removeBtn.style.display = 'block';
    } else {
        quickDateInput.value = '';
        removeBtn.style.display = 'none';
    }
    
    if (type === 'hotel' && item.endDate) {
        quickEndDateInput.value = item.endDate;
    } else {
        quickEndDateInput.value = '';
    }
    
    document.getElementById('quickDateModal').classList.add('active');
    quickDateInput.focus();
    lucide.createIcons();
}

async function saveQuickDate() {
    if (!currentQuickDateItem) return;
    
    const newDate = document.getElementById('quickDate').value;
    
    if (!newDate) {
        alert('Veuillez sélectionner une date');
        return;
    }
    
    const { id, type } = currentQuickDateItem;
    
    // Préparer les données à mettre à jour
    const updates = { date: newDate };
    
    // Si c'est un hôtel, inclure la date de fin
    if (type === 'hotel') {
        const newEndDate = document.getElementById('quickEndDate').value;
        
        // Validation : date de fin doit être après date de début
        if (newEndDate && new Date(newEndDate) <= new Date(newDate)) {
            alert('La date de fin doit être après la date de début');
            return;
        }
        
        updates.endDate = newEndDate || '';
    }
    
    // Mettre à jour dans Firebase
    const result = await FirebaseService.updateActivity(currentTripId, id, updates);
    
    if (result.success) {
        // Mettre à jour localement
        let items;
        if (type === 'hotel') {
            items = app.hotels;
        } else if (type === 'restaurant') {
            items = app.restaurants;
        } else {
            items = app.activities;
        }

        const item = items.find(i => i.id === id);
        if (item) {
            item.date = newDate;
            if (type === 'hotel') {
                item.endDate = updates.endDate;
            }
        }
        
        // Re-render
        app.renderAll();
        Dashboard.update(app.hotels, app.restaurants, app.activities);
        
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
    
    // Préparer les données à supprimer
    const updates = { date: '' };
    if (type === 'hotel') {
        updates.endDate = '';
    }
    
    // Mettre à jour dans Firebase
    const result = await FirebaseService.updateActivity(currentTripId, id, updates);
    
    if (result.success) {
        // Mettre à jour localement
        let items;
        if (type === 'hotel') {
            items = app.hotels;
        } else if (type === 'restaurant') {
            items = app.restaurants;
        } else {
            items = app.activities;
        }

        const item = items.find(i => i.id === id);
        if (item) {
            item.date = '';
            if (type === 'hotel') {
                item.endDate = '';
            }
        }
        
        // Re-render
        app.renderAll();
        Dashboard.update(app.hotels, app.restaurants, app.activities);
        
        // Fermer la modal
        closeModal('quickDateModal');
        currentQuickDateItem = null;
    } else {
        alert('Erreur: ' + result.error);
    }
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

function closeFabMenu() {
    NavigationManager.closeFabMenu();
}

async function signOut() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        await FirebaseService.signOut();
        window.location.href = 'login.html';
    }
}

// ===== GESTION DES VILLES =====

function loadCitiesForCountry(countryName) {
    const cities = COUNTRIES_DATA.getCitiesForCountry(countryName);
    
    const datalist = document.getElementById('citiesList');
    if (!datalist) return;
    
    datalist.innerHTML = '';
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        datalist.appendChild(option);
    });
    
    console.log(`✅ ${cities.length} villes chargées pour ${countryName}`);
}