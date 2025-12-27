const ModalManager = {
    currentEditId: null,
    currentDetailItem: null,

    openForm(type, item = null) {
        // Vérifier les permissions
        if (currentTrip && !currentTrip.canEdit()) {
            alert('Vous n\'avez pas la permission de modifier ce voyage');
            return;
        }
        
        const modal = document.getElementById('formModal');
        const form = document.getElementById('itemForm');
        const modalTitle = document.getElementById('modalTitle');
        const categoryLabel = document.getElementById('categoryLabel');
        const reservationDateLabel = document.getElementById('reservationDateLabel');
        const bookedLabel = document.getElementById('bookedLabel');
        const endDateGroup = document.getElementById('endDateGroup');
        
        form.reset();
        this.currentEditId = null;

        if (type === 'hotel') {
            modalTitle.textContent = item ? 'Modifier Hôtel' : 'Ajouter un Hôtel';
            categoryLabel.textContent = 'Nom de l\'hôtel';
            reservationDateLabel.textContent = 'Date de début (Check-in)';
            bookedLabel.textContent = 'Réservé';
            document.getElementById('itemType').value = 'hotel';
            document.getElementById('category').placeholder = 'Ex: Hyatt, APA Hotel...';
            
            // Afficher la date de fin pour les hôtels
            endDateGroup.style.display = 'block';
            
        } else if (type === 'restaurant') {
            modalTitle.textContent = item ? 'Modifier Restaurant' : 'Ajouter un Restaurant';
            categoryLabel.textContent = 'Type de cuisine';
            reservationDateLabel.textContent = 'Date de réservation';
            bookedLabel.textContent = 'Réservé';
            document.getElementById('itemType').value = 'restaurant';
            document.getElementById('category').placeholder = 'Ex: Omakase, Ramen, BBQ...';
            
            // Masquer la date de fin
            endDateGroup.style.display = 'none';
            
        } else {
            modalTitle.textContent = item ? 'Modifier Activité' : 'Ajouter une Activité';
            categoryLabel.textContent = 'Catégorie';
            reservationDateLabel.textContent = 'Date';
            bookedLabel.textContent = 'Réservé';
            document.getElementById('itemType').value = 'activity';
            document.getElementById('category').placeholder = 'Ex: Temple, Shopping, Observation...';
            
            // Masquer la date de fin
            endDateGroup.style.display = 'none';
        }

        if (item) {
            this.currentEditId = item.id;
            this.fillFormWithItem(item);
        }

        modal.classList.add('active');
        lucide.createIcons();
    },

    fillFormWithItem(item) {
        document.getElementById('itemId').value = item.id;
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemCity').value = item.city;
        document.getElementById('category').value = item.category || '';
        document.getElementById('price').value = item.price || '';
        document.getElementById('googleMapsUrl').value = item.googleMapsUrl || '';
        document.getElementById('bookingUrl').value = item.bookingUrl || '';
        document.getElementById('photoUrl').value = item.photoUrl || '';
        document.getElementById('priority').value = item.priority || 'normal';
        document.getElementById('notes').value = item.notes || '';
        document.getElementById('isBooked').checked = item.isBooked;
        document.getElementById('reservationDate').value = item.date || '';
        document.getElementById('endDate').value = item.endDate || '';
        
        // Afficher endDate si c'est un hôtel
        if (item.type === 'hotel') {
            document.getElementById('endDateGroup').style.display = 'block';
        }
    },

    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
        this.currentEditId = null;
        this.currentDetailItem = null;
    },

    openDetail(item) {
        this.currentDetailItem = item;
        const modal = document.getElementById('detailModal');
        const title = document.getElementById('detailTitle');
        const body = document.getElementById('detailContent');

        title.textContent = item.name;
        body.innerHTML = this.generateDetailHTML(item);
        
        // Stocker l'ID et le type pour les boutons
        body.dataset.itemId = item.id;
        body.dataset.itemType = item.type;
        
        // Gérer les permissions pour les boutons d'action
        const canEdit = currentTrip ? currentTrip.canEdit() : true;
        const formActions = modal.querySelector('.form-actions');
        
        if (!canEdit && formActions) {
            formActions.innerHTML = `
                <button type="button" class="btn btn-primary" onclick="closeModal('detailModal')" style="flex: 1;">
                    Fermer
                </button>
            `;
        } else if (formActions) {
            formActions.innerHTML = `
                <button type="button" class="btn btn-primary" onclick="editFromDetail()">Modifier</button>
                <button type="button" class="btn" onclick="deleteFromDetail()" style="background: var(--error); color: white;">Supprimer</button>
            `;
        }
        
        modal.classList.add('active');

        if (item.tiktokLink && this.extractTikTokVideoId(item.tiktokLink)) {
            this.loadTikTokEmbed();
        }
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    generateDetailHTML(item) {
        let html = `
            <div class="detail-section">
                <label>Ville</label>
                <div class="value">${item.city}</div>
            </div>
        `;

        if (item.category) {
            html += `
                <div class="detail-section">
                    <label>${item.type === 'restaurant' ? 'Type de cuisine' : item.type === 'hotel' ? 'Nom de l\'hôtel' : 'Catégorie'}</label>
                    <div class="value">${item.category}</div>
                </div>
            `;
        }

        if (item.price) {
            const currencySymbol = currentTrip?.currencySymbol || '¥';
            html += `
                <div class="detail-section">
                    <label>${item.type === 'restaurant' ? 'Budget' : 'Prix'}</label>
                    <div class="value">${item.price.toLocaleString()}${currencySymbol}</div>
                </div>
            `;
        }

        if (item.date) {
            // Si c'est un hôtel avec date de fin, afficher check-in et check-out
            if (item.type === 'hotel' && item.endDate) {
                html += `
                    <div class="detail-section">
                        <label>Check-in</label>
                        <div class="value">${new Date(item.date).toLocaleString('fr-FR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</div>
                    </div>
                    <div class="detail-section">
                        <label>Check-out</label>
                        <div class="value">${new Date(item.endDate).toLocaleString('fr-FR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</div>
                    </div>
                `;
            } else {
                // Pour les restaurants/activités ou hôtels sans date de fin
                html += `
                    <div class="detail-section">
                        <label>Date</label>
                        <div class="value">${new Date(item.date).toLocaleString('fr-FR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</div>
                    </div>
                `;
            }
        }

        if (item.googleMapsUrl) {
            html += `
                <div class="detail-section">
                    <label>Localisation</label>
                    <div class="value">
                        <a href="${item.googleMapsUrl}" target="_blank" class="address-link">
                            📍 Ouvrir dans Google Maps
                        </a>
                    </div>
                </div>
            `;
        }

        if (item.bookingUrl) {
            html += `
                <div class="detail-section">
                    <label>Réservation</label>
                    <div class="value">
                        <a href="${item.bookingUrl}" target="_blank" class="address-link">
                            🔗 Lien de réservation
                        </a>
                    </div>
                </div>
            `;
        }

        html += `
            <div class="detail-section">
                <label>Statut</label>
                <div class="value">${item.isBooked ? '✓ Réservé' : 'À réserver'}</div>
            </div>
        `;

        if (item.priority && item.priority !== 'normal') {
            const priorityLabels = {
                'must-do': 'Must-Do',
                'high': 'Haute',
                'low': 'Basse',
                'optional': 'Optionnel'
            };
            html += `
                <div class="detail-section">
                    <label>Priorité</label>
                    <div class="value">${priorityLabels[item.priority]}</div>
                </div>
            `;
        }

        if (item.notes) {
            html += `
                <div class="detail-section">
                    <label>Notes</label>
                    <div class="value" style="white-space: pre-line;">${item.notes}</div>
                </div>
            `;
        }

        return html;
    },

    extractTikTokVideoId(url) {
        const match = url.match(/\/video\/(\d+)/);
        return match ? match[1] : null;
    },

    loadTikTokEmbed() {
        setTimeout(() => {
            if (!document.querySelector('script[src*="tiktok.com/embed.js"]')) {
                const script = document.createElement('script');
                script.src = 'https://www.tiktok.com/embed.js';
                script.async = true;
                document.body.appendChild(script);
            }
        }, 100);
    },

    openSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.add('active');
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }
};

// Fonctions globales pour être appelées depuis le HTML (déjà définies dans trip.js)
if (typeof openModal === 'undefined') {
    function openModal(type, item = null) {
        ModalManager.openForm(type, item);
    }
}

if (typeof closeModal === 'undefined') {
    function closeModal(modalId) {
        ModalManager.close(modalId);
    }
}

if (typeof showDetail === 'undefined') {
    function showDetail(item) {
        ModalManager.openDetail(item);
    }
}

if (typeof editFromDetail === 'undefined') {
    function editFromDetail() {
        const itemToEdit = ModalManager.currentDetailItem;
        ModalManager.close('detailModal');
        setTimeout(() => {
            ModalManager.openForm(itemToEdit.type, itemToEdit);
        }, 100);
    }
}

if (typeof openSettings === 'undefined') {
    function openSettings() {
        ModalManager.openSettings();
    }
}