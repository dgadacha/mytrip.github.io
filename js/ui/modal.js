const ModalManager = {
    currentEditId: null,
    currentDetailItem: null,

    openForm(type, item = null) {
        const modal = document.getElementById('formModal');
        const form = document.getElementById('itemForm');
        const modalTitle = document.getElementById('modalTitle');
        const categoryLabel = document.getElementById('categoryLabel');
        const bookedLabel = document.getElementById('bookedLabel');
        
        form.reset();
        this.currentEditId = null;

        if (type === 'restaurant') {
            modalTitle.textContent = item ? 'Modifier Restaurant' : 'Ajouter un Restaurant';
            categoryLabel.textContent = 'Type de cuisine';
            bookedLabel.textContent = 'Réservé';
            document.getElementById('itemType').value = 'restaurant';
            document.getElementById('category').placeholder = 'Ex: Omakase, Ramen, BBQ...';
        } else {
            modalTitle.textContent = item ? 'Modifier Activité' : 'Ajouter une Activité';
            categoryLabel.textContent = 'Catégorie';
            bookedLabel.textContent = 'Réservé';
            document.getElementById('itemType').value = 'activity';
            document.getElementById('category').placeholder = 'Ex: Temple, Shopping, Observation...';
        }

        if (item) {
            this.currentEditId = item.id;
            this.fillFormWithItem(item);
        }

        modal.classList.add('active');
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
        document.getElementById('reservationDateGroup').style.display = item.isBooked ? 'block' : 'none';
    },

    close(modalId) {
        document.getElementById(modalId).classList.remove('active');
        this.currentEditId = null;
        this.currentDetailItem = null;
    },

    openDetail(item) {
        this.currentDetailItem = item;
        const modal = document.getElementById('detailModal');
        const title = document.getElementById('detailTitle');
        const body = document.getElementById('detailBody');

        title.textContent = item.name;
        body.innerHTML = this.generateDetailHTML(item);
        
        modal.classList.add('active');

        if (item.tiktokLink && this.extractTikTokVideoId(item.tiktokLink)) {
            this.loadTikTokEmbed();
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
                    <label>${item.type === 'restaurant' ? 'Type de cuisine' : 'Catégorie'}</label>
                    <div class="value">${item.category}</div>
                </div>
            `;
        }

        if (item.price) {
            html += `
                <div class="detail-section">
                    <label>${item.type === 'restaurant' ? 'Budget' : 'Prix'}</label>
                    <div class="value">${item.price.toLocaleString()}¥</div>
                </div>
            `;
        }

        if (item.date) {
            html += `
                <div class="detail-section">
                    <label>Date</label>
                    <div class="value">${new Date(item.date).toLocaleDateString('fr-FR')}</div>
                </div>
            `;
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
                    <div class="value">${item.notes}</div>
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
        modal.classList.add('active');
        lucide.createIcons();
    }
};

// Fonctions globales pour être appelées depuis le HTML
function openModal(type, item = null) {
    ModalManager.openForm(type, item);
}

function closeModal(modalId) {
    ModalManager.close(modalId);
}

function showDetail(item) {
    ModalManager.openDetail(item);
}

function editFromDetail() {
    const itemToEdit = ModalManager.currentDetailItem;
    ModalManager.close('detailModal');
    setTimeout(() => {
        ModalManager.openForm(itemToEdit.type, itemToEdit);
    }, 100);
}

function deleteFromDetail() {
    if (app) {
        app.deleteFromDetail();
    }
}

function openSettings() {
    ModalManager.openSettings();
}