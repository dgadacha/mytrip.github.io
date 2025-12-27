let trips = [];
let pendingInvitations = [];

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
        
        // Charger les invitations en attente
        await loadPendingInvitations();
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

    // Remplir le dropdown des pays
    populateCountriesDropdown();

    lucide.createIcons();
}

function closeCreateTripModal() {
    document.getElementById('createTripModal').classList.remove('active');
    document.getElementById('createTripForm').reset();
}

async function createTrip(event) {
    event.preventDefault();
    
    const name = document.getElementById('tripName').value;
    const destination = document.getElementById('tripDestination').value;
    const country = document.getElementById('tripCountry').value;
    const startDate = document.getElementById('tripStartDate').value;
    const endDate = document.getElementById('tripEndDate').value;
    const currency = document.getElementById('tripCurrency').value;
    const currencySymbol = document.getElementById('tripCurrencySymbol').value;
    const budget = parseInt(document.getElementById('tripBudget').value) || 0;
    const coverImage = document.getElementById('tripCoverImage').value;
    
    if (!country) {
        alert('Veuillez sélectionner un pays');
        return;
    }
    
    const tripData = {
        name,
        destination,
        country,
        startDate,
        endDate,
        currency: currency || 'EUR',
        currencySymbol: currencySymbol || '€',
        budget,
        coverImage
    };
    
    const result = await FirebaseService.createTrip(tripData);
    
    if (result.success) {
        closeCreateTripModal();
        loadTrips();
    } else {
        alert('Erreur lors de la création du voyage : ' + result.error);
    }
}

// ===== GESTION DES INVITATIONS =====

async function loadPendingInvitations() {
    const userId = FirebaseService.auth.currentUser.uid;
    const userEmail = FirebaseService.auth.currentUser.email;

    try {
        const snapshot = await FirebaseService.db.collection('invitations')
            .where('email', '==', userEmail)
            .where('status', '==', 'pending')
            .get();

        pendingInvitations = [];
        snapshot.forEach(doc => {
            pendingInvitations.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Afficher le badge si invitations
        if (pendingInvitations.length > 0) {
            document.getElementById('invitationsBtn').style.display = 'flex';
            const badge = document.getElementById('invitationsBadge');
            badge.textContent = pendingInvitations.length;
            badge.style.display = 'flex';
        } else {
            document.getElementById('invitationsBtn').style.display = 'none';
        }
    } catch (error) {
        console.error('Erreur chargement invitations:', error);
    }
}

function openInvitationsModal() {
    document.getElementById('invitationsModal').classList.add('active');
    renderInvitations();
    lucide.createIcons();
}

function closeInvitationsModal() {
    document.getElementById('invitationsModal').classList.remove('active');
}

function renderInvitations() {
    const container = document.getElementById('invitationsContent');

    if (pendingInvitations.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <i data-lucide="mail" style="width: 64px; height: 64px; margin: 0 auto 16px; opacity: 0.3;"></i>
                <p>Aucune invitation en attente</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    container.innerHTML = pendingInvitations.map(invite => `
        <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 12px;">
            <h3 style="font-size: 1.125rem; margin-bottom: 8px; color: var(--text-primary);">
                ${invite.tripName}
            </h3>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 0.875rem; color: var(--text-secondary);">
                    Rôle : <strong>${invite.role === 'editor' ? 'Éditeur' : 'Lecteur'}</strong>
                </span>
                <span style="font-size: 0.75rem; color: var(--text-secondary);">
                    Expire le ${new Date(invite.expiresAt.toDate()).toLocaleDateString('fr-FR')}
                </span>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="btn btn-primary" onclick="acceptInvitation('${invite.id}')" style="flex: 1;">
                    Accepter
                </button>
                <button class="btn" onclick="declineInvitation('${invite.id}')" style="flex: 1;">
                    Refuser
                </button>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

async function acceptInvitation(invitationId) {
    const invite = pendingInvitations.find(i => i.id === invitationId);
    if (!invite) return;

    const result = await FirebaseService.acceptInvitation(invite.token);

    if (result.success) {
        // Recharger les trips et invitations
        await loadTrips();
        await loadPendingInvitations();
        closeInvitationsModal();
        alert(`Vous avez rejoint le voyage "${invite.tripName}" !`);
    } else {
        alert('Erreur: ' + result.error);
    }
}

async function declineInvitation(invitationId) {
    if (!confirm('Voulez-vous vraiment refuser cette invitation ?')) return;

    try {
        await FirebaseService.db.collection('invitations').doc(invitationId).update({
            status: 'declined',
            declinedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Recharger les invitations
        await loadPendingInvitations();
        renderInvitations();
    } catch (error) {
        alert('Erreur: ' + error.message);
    }
}

// ===== AUTRES FONCTIONS =====

async function signOut() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        await FirebaseService.signOut();
        window.location.href = 'login.html';
    }
}

function toggleTheme() {
    ThemeManager.toggleTheme();
}

// ===== GESTION DES PAYS ET DEVISES =====

function populateCountriesDropdown() {
    const select = document.getElementById('tripCountry');
    if (!select) return;
    
    select.innerHTML = '<option value="">Sélectionnez un pays</option>';
    
    COUNTRIES_DATA.countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.name;
        option.textContent = country.name;
        option.dataset.currency = country.currency;
        option.dataset.currencySymbol = country.currencySymbol;
        select.appendChild(option);
    });
}

function updateCurrencyFromCountry() {
    const countrySelect = document.getElementById('tripCountry');
    const selectedOption = countrySelect.options[countrySelect.selectedIndex];
    
    if (!selectedOption || !selectedOption.value) {
        document.getElementById('tripCurrencyDisplay').value = '';
        document.getElementById('tripCurrency').value = '';
        document.getElementById('tripCurrencySymbol').value = '';
        return;
    }
    
    const currency = selectedOption.dataset.currency;
    const currencySymbol = selectedOption.dataset.currencySymbol;
    
    document.getElementById('tripCurrencyDisplay').value = `${currency} (${currencySymbol})`;
    document.getElementById('tripCurrency').value = currency;
    document.getElementById('tripCurrencySymbol').value = currencySymbol;
}