const ListView = {
    render(containerId, items) {
        const container = document.getElementById(containerId);
        
        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Aucun élément</h3>
                    <p>Commencez par ajouter des restaurants ou des activités</p>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="timeline-card ${item.type} ${item.priority && item.priority !== 'normal' ? 'priority-' + item.priority : ''} ${item.isDone ? 'done' : ''}" data-item-id="${item.id}" onclick="app.showDetailById('${item.id}', '${item.type}')">
                ${item.photoUrl ? `<img src="${item.photoUrl}" alt="${item.name}" class="timeline-card-photo" onerror="this.style.display='none'">` : ''}
                <div class="timeline-card-content">
                    ${getPriorityBadge(item.priority)}
                    <div class="timeline-card-title">${item.name}</div>
                    <div class="timeline-card-city">${item.city}</div>
                    ${item.notes ? `<div class="timeline-card-notes">${item.notes}</div>` : ''}
                    ${item.price ? `<div class="timeline-card-price">${item.price.toLocaleString()}¥</div>` : ''}
                </div>
                <div class="timeline-card-actions">
                    ${this.renderActions(item)}
                </div>
            </div>
        `).join('');
    },

    renderActions(item) {
        if (item.isDone) {
            return `
                <button class="timeline-btn done-btn undone" onclick="app.toggleDone('${item.id}', '${item.type}', event)" title="Marquer comme pas fait" style="width: 100%;">
                    <i data-lucide="rotate-ccw" style="width: 16px; height: 16px;"></i>
                </button>
            `;
        }

        let actions = `
            <button class="timeline-btn done-btn" onclick="app.toggleDone('${item.id}', '${item.type}', event)" title="Marquer comme fait">
                <i data-lucide="check" style="width: 16px; height: 16px;"></i>
            </button>
        `;

        if (item.googleMapsUrl) {
            actions += `
                <a href="${item.googleMapsUrl}" target="_blank" class="timeline-btn maps-btn" title="Ouvrir dans Google Maps" onclick="event.stopPropagation()">
                    <i data-lucide="map-pin" style="width: 16px; height: 16px;"></i>
                </a>
            `;
        }

        if (item.bookingUrl) {
            actions += `
                <a href="${item.bookingUrl}" target="_blank" class="timeline-btn booking-btn" title="Réserver" onclick="event.stopPropagation()">
                    <i data-lucide="calendar-check" style="width: 16px; height: 16px;"></i>
                </a>
            `;
        }

        return actions;
    }
};