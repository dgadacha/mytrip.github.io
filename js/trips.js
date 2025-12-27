let trips = [];

document.addEventListener('DOMContentLoaded', async () => {
    await FirebaseService.initialize();
    
    // Vérifier auth
    FirebaseService.auth.onAuthStateChanged(async user => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        
        // Afficher email utilisateur
        document.getElementById('userEmail').textContent = user.email;
        
        // Charger les voyages
        await loadTrips();
    });
    
    // Initialiser le thème
    ThemeManager.initialize();
    lucide.createIcons();
});

async function loadTrips() {
    const loader = document.getElementById('loader');
    const emptyState = document.getElementById('emptyState');
    const tripsGrid = document.getElementById('tripsGrid');
    
    loader.style.display = 'block';
    emptyState.style.display = 'none';
    tripsGrid.style.display = 'none';
    
    const result = await FirebaseService.getUserTrips();
    
    loader.style.display = 'none';
    
    if (result.success) {
        trips = result.trips;
        
        if (trips.length === 0) {
            emptyState.style.display = 'block';
        } else {
            tripsGrid.style.display = 'grid';
            renderTrips();
        }
    } else {
        alert('Erreur lors du chargement des voyages');
    }
}

function renderTrips() {
    const tripsGrid = document.getElementById('tripsGrid');
    
    tripsGrid.innerHTML = trips.map(trip => {
        const tripObj = new Trip(trip);
        const duration = tripObj.getDuration();
        const dates = tripObj.getFormattedDates();
        const roleBadge = tripObj.getRoleBadge();
        
        return `
            <div class="trip-card" onclick="openTrip('${trip.id}')">
                <div class="trip-cover ${trip.coverImage ? '' : 'empty'}">
                    ${trip.coverImage 
                        ? `<img src="${trip.coverImage}" alt="${trip.name}">`
                        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                             <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
                           </svg>`
                    }
                    <div class="trip-role-badge" style="background: ${roleBadge.color}">
                        ${roleBadge.text}
                    </div>
                </div>
                <div class="trip-content">
                    <h3 class="trip-name">${trip.name}</h3>
                    ${trip.destination 
                        ? `<div class="trip-destination">
                             <i data-lucide="map-pin" style="width: 16px; height: 16px;"></i>
                             ${trip.destination}
                           </div>`
                        : ''
                    }
                    <div class="trip-meta">
                        ${dates 
                            ? `<div class="trip-meta-item">
                                 <i data-lucide="calendar" style="width: 16px; height: 16px;"></i>
                                 ${dates}
                               </div>`
                            : ''
                        }
                        ${duration 
                            ? `<div class="trip-meta-item">
                                 <i data-lucide="clock" style="width: 16px; height: 16px;"></i>
                                 ${duration} jour${duration > 1 ? 's' : ''}
                               </div>`
                            : ''
                        }
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    lucide.createIcons();
}

function openTrip(tripId) {
    window.location.href = `trip.html?id=${tripId}`;
}

function openCreateTripModal() {
    document.getElementById('createTripModal').classList.add('active');
    document.getElementById('tripName').focus();
}

function closeCreateTripModal() {
    document.getElementById('createTripModal').classList.remove('active');
    document.getElementById('createTripForm').reset();
}

async function createTrip(e) {
    e.preventDefault();
    
    const name = document.getElementById('tripName').value.trim();
    const destination = document.getElementById('tripDestination').value.trim();
    const startDate = document.getElementById('tripStartDate').value;
    const endDate = document.getElementById('tripEndDate').value;
    const currency = document.getElementById('tripCurrency').value;
    const budget = parseInt(document.getElementById('tripBudget').value) || 0;
    const coverImage = document.getElementById('tripCoverImage').value.trim();
    
    if (!name) {
        alert('Le nom du voyage est requis');
        return;
    }
    
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        alert('La date de fin doit être après la date de début');
        return;
    }
    
    const tripData = {
        name,
        destination,
        startDate,
        endDate,
        currency,
        budget,
        coverImage
    };
    
    const result = await FirebaseService.createTrip(tripData);
    
    if (result.success) {
        closeCreateTripModal();
        await loadTrips();
    } else {
        alert('Erreur lors de la création du voyage: ' + result.error);
    }
}

async function signOut() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        await FirebaseService.signOut();
        window.location.href = 'login.html';
    }
}

function toggleTheme() {
    ThemeManager.toggleTheme();
}