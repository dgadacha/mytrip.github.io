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
        // Vider les escales à chaque ouverture
        this.clearLayovers();

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
            
        } else if (type === 'flight') {
            modalTitle.textContent = item ? 'Modifier Vol' : 'Ajouter un Vol';
            document.getElementById('itemType').value = 'flight';
            
            // Masquer les champs standards, afficher champs flight
            this.toggleFlightFields(true);
            endDateGroup.style.display = 'none';
            
        } else {
            modalTitle.textContent = item ? 'Modifier Activité' : 'Ajouter une Activité';
            categoryLabel.textContent = 'Catégorie';
            reservationDateLabel.textContent = 'Date';
            bookedLabel.textContent = 'Réservé';
            document.getElementById('itemType').value = 'activity';
            document.getElementById('category').placeholder = 'Ex: Temple, Shopping, Observation...';
            
            // Masquer la date de fin et les champs flight
            endDateGroup.style.display = 'none';
            this.toggleFlightFields(false);
        }

        if (item) {
            this.currentEditId = item.id;
            this.fillFormWithItem(item);
        }

        const currencySymbol = currentTrip?.currencySymbol || '¥';
        const priceLabel = document.getElementById('priceLabel');
        if (priceLabel) {
            priceLabel.textContent = `Prix (${currencySymbol})`;
        }
    
        modal.classList.add('active');
        lucide.createIcons();
    },


    toggleFlightFields(show) {
        const flightFields = document.getElementById('flightFields');
        const standardFields = ['category', 'priority', 'notes', 'reservationDate', 'googleMapsUrl', 'photoUrl'];
        
        if (flightFields) {
            flightFields.style.display = show ? 'block' : 'none';
        }
        
        // Masquer/afficher les champs standards
        standardFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && field.closest('.form-group')) {
                field.closest('.form-group').style.display = show ? 'none' : 'block';
            }
        });
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

        // Gérer les champs spécifiques aux vols
        if (item.type === 'flight') {
            this.toggleFlightFields(true);
            document.getElementById('flightNumber').value = item.flightNumber || '';
            document.getElementById('airline').value = item.airline || '';
            document.getElementById('departureAirport').value = item.departureAirport || '';
            document.getElementById('departureTerminal').value = item.departureTerminal || '';
            document.getElementById('departureCity').value = item.departureCity || '';
            document.getElementById('departureDate').value = item.departureDate || '';
            document.getElementById('arrivalAirport').value = item.arrivalAirport || '';
            document.getElementById('arrivalTerminal').value = item.arrivalTerminal || '';
            document.getElementById('arrivalCity').value = item.arrivalCity || '';
            document.getElementById('arrivalDate').value = item.arrivalDate || '';
            document.getElementById('bookingRef').value = item.bookingRef || '';
            
            // Charger les escales
            if (item.layovers && item.layovers.length > 0) {
                item.layovers.forEach(layover => {
                    this.addLayover(layover);
                });
            }
        } else {
            this.toggleFlightFields(false);
        }
    },

    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
        this.currentEditId = null;
        this.currentDetailItem = null;
        // Vider les escales quand on ferme le modal de formulaire
        if (modalId === 'formModal') {
            this.clearLayovers();
        }
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
        if (item.type === 'flight') {
            return this.generateFlightDetailHTML(item);
        }

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

    generateFlightDetailHTML(item) {
        const currencySymbol = currentTrip?.currencySymbol || '¥';
        
        // Formater date complète
        const formatFullDate = (dateStr) => {
            if (!dateStr) return '';
            return new Date(dateStr).toLocaleString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };
        
        let html = `
            <!-- Numéro de vol -->
            ${item.flightNumber || item.airline ? `
                <div class="detail-section">
                    <label>Vol</label>
                    <div class="value" style="font-size: 1.125rem; font-weight: 600;">
                        ${item.airline || ''} ${item.flightNumber || ''}
                    </div>
                </div>
            ` : ''}
            
            <!-- Timeline du vol -->
            <div class="flight-timeline">
                <!-- Départ -->
                <div class="timeline-step">
                    <div class="timeline-dot departure"></div>
                    <div class="timeline-content">
                        <div class="timeline-label">Départ</div>
                        <div class="timeline-location">
                            ${item.departureAirport ? `<strong>${item.departureAirport}</strong>` : ''}
                            ${item.departureTerminal ? ` Terminal ${item.departureTerminal}` : ''}
                            ${item.departureCity ? ` - ${item.departureCity}` : ''}
                        </div>
                        ${item.departureDate ? `
                            <div class="timeline-time">${formatFullDate(item.departureDate)}</div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Escales -->
                ${item.layovers && item.layovers.length > 0 ? item.layovers.map((layover, index) => `
                    <div class="timeline-step layover">
                        <div class="timeline-dot layover"></div>
                        <div class="timeline-content">
                            <div class="timeline-label">Escale ${index + 1}</div>
                            ${layover.flightNumber ? `
                                <div class="timeline-flight-number">Vol ${layover.flightNumber}</div>
                            ` : ''}
                            <div class="timeline-location">
                                ${layover.airport ? `<strong>${layover.airport}</strong>` : ''}
                                ${layover.terminal ? ` Terminal ${layover.terminal}` : ''}
                                ${layover.city ? ` - ${layover.city}` : ''}
                            </div>
                            ${layover.arrivalTime ? `
                                <div class="timeline-time">Arrivée : ${formatFullDate(layover.arrivalTime)}</div>
                            ` : ''}
                            ${layover.departureTime ? `
                                <div class="timeline-time">Départ : ${formatFullDate(layover.departureTime)}</div>
                            ` : ''}
                            ${layover.duration ? `
                                <div class="timeline-duration">Durée d'escale : ${Math.floor(layover.duration / 60)}h${layover.duration % 60 > 0 ? (layover.duration % 60).toString().padStart(2, '0') : ''}</div>
                            ` : ''}
                        </div>
                    </div>
                `).join('') : ''}
                
                <!-- Arrivée -->
                <div class="timeline-step">
                    <div class="timeline-dot arrival"></div>
                    <div class="timeline-content">
                        <div class="timeline-label">Arrivée</div>
                        <div class="timeline-location">
                            ${item.arrivalAirport ? `<strong>${item.arrivalAirport}</strong>` : ''}
                            ${item.arrivalTerminal ? ` Terminal ${item.arrivalTerminal}` : ''}
                            ${item.arrivalCity ? ` - ${item.arrivalCity}` : ''}
                        </div>
                        ${item.arrivalDate ? `
                            <div class="timeline-time">${formatFullDate(item.arrivalDate)}</div>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <!-- Autres infos -->
            ${item.price ? `
                <div class="detail-section">
                    <label>Prix</label>
                    <div class="value">${item.price.toLocaleString()}${currencySymbol}</div>
                </div>
            ` : ''}
            
            ${item.bookingRef ? `
                <div class="detail-section">
                    <label>Référence de réservation</label>
                    <div class="value" style="font-family: 'SF Mono', monospace; letter-spacing: 0.5px;">${item.bookingRef}</div>
                </div>
            ` : ''}
            
            ${item.bookingUrl ? `
                <div class="detail-section">
                    <label>Réservation</label>
                    <div class="value">
                        <a href="${item.bookingUrl}" target="_blank" class="address-link">
                            🔗 Lien de réservation
                        </a>
                    </div>
                </div>
            ` : ''}
            
            ${item.notes ? `
                <div class="detail-section">
                    <label>Notes</label>
                    <div class="value" style="white-space: pre-line;">${item.notes}</div>
                </div>
            ` : ''}
        `;
        
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
    },

    // Gestion des escales
    layoverCounter: 0,

    addLayover(layoverData = null) {
        this.layoverCounter++;
        const container = document.getElementById('layoversContainer');
        if (!container) return;
        
        const layoverId = this.layoverCounter;
        
        const layoverHTML = `
            <div class="layover-item" id="layover-${layoverId}" style="border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h5 style="margin: 0;">Escale ${layoverId}</h5>
                    <button type="button" class="btn" onclick="ModalManager.removeLayover(${layoverId})" style="padding: 4px 8px; background: var(--error); color: white;">
                        <i data-lucide="x" style="width: 16px; height: 16px;"></i>
                    </button>
                </div>
                
                <div class="form-group">
                    <label>Numéro de vol</label>
                    <input type="text" id="layover-flight-${layoverId}" placeholder="Ex: AF456" value="${layoverData?.flightNumber || ''}">
                </div>

                <div class="form-group">
                    <label>Aéroport</label>
                    <input type="text" id="layover-airport-${layoverId}" placeholder="Ex: DXB" value="${layoverData?.airport || ''}">
                </div>

                <div class="form-group">
                    <label>Terminal (optionnel)</label>
                    <input type="text" id="layover-terminal-${layoverId}" placeholder="Ex: 2E" value="${layoverData?.terminal || ''}">
                </div>
                
                <div class="form-group">
                    <label>Ville</label>
                    <input type="text" id="layover-city-${layoverId}" placeholder="Ex: Dubai" value="${layoverData?.city || ''}">
                </div>
                
                <div class="form-group">
                    <label>Arrivée</label>
                    <input type="datetime-local" id="layover-arrival-${layoverId}" value="${layoverData?.arrivalTime || ''}">
                </div>
                
                <div class="form-group">
                    <label>Départ</label>
                    <input type="datetime-local" id="layover-departure-${layoverId}" value="${layoverData?.departureTime || ''}">
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', layoverHTML);
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    removeLayover(layoverId) {
        const layover = document.getElementById(`layover-${layoverId}`);
        if (layover) {
            layover.remove();
        }
    },

    getLayovers() {
        const layovers = [];
        const container = document.getElementById('layoversContainer');
        if (!container) return layovers;
        
        const layoverItems = container.querySelectorAll('.layover-item');
        layoverItems.forEach((item) => {
            const id = item.id.replace('layover-', '');
            const flightNumber = document.getElementById(`layover-flight-${id}`)?.value;
            const airport = document.getElementById(`layover-airport-${id}`)?.value;
            const terminal = document.getElementById(`layover-terminal-${id}`)?.value;
            const city = document.getElementById(`layover-city-${id}`)?.value;
            const arrivalTime = document.getElementById(`layover-arrival-${id}`)?.value;
            const departureTime = document.getElementById(`layover-departure-${id}`)?.value;
            
            if (airport || city) {
                // Calculer la durée en minutes
                let duration = 0;
                if (arrivalTime && departureTime) {
                    const arrival = new Date(arrivalTime);
                    const departure = new Date(departureTime);
                    duration = Math.round((departure - arrival) / 1000 / 60);
                }
                
                layovers.push({
                    flightNumber,
                    airport,
                    terminal,
                    city,
                    arrivalTime,
                    departureTime,
                    duration
                });
            }
        });
        
        return layovers;
    },

    clearLayovers() {
        const container = document.getElementById('layoversContainer');
        if (container) {
            container.innerHTML = '';
        }
        this.layoverCounter = 0;
    },
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