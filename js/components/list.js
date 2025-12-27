const ListView = {
    render(containerId, items) {
        const container = document.getElementById(containerId);
        
        if (!items || items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p style="color: var(--text-secondary);">Aucun élément pour le moment</p>
                </div>
            `;
            return;
        }

        const canEdit = currentTrip ? currentTrip.canEdit() : true;
        
        container.innerHTML = items.map(item => {
            const priorityClass = item.priority && item.priority !== 'normal' ? `priority-${item.priority}` : '';
            const doneClass = item.isDone ? 'done' : '';
            const price = item.type === 'restaurant' ? item.price : item.price;
            
            // Badges de priorité
            let priorityBadge = '';
            if (item.priority && item.priority !== 'normal') {
                const badges = {
                    'must-do': 'Must-Do',
                    'high': 'Haute',
                    'low': 'Basse',
                    'optional': 'Optionnel'
                };
                priorityBadge = `<span class="priority-badge priority-${item.priority}">${badges[item.priority]}</span>`;
            }
            
            // Boutons d'action selon permissions
            const actionButtons = canEdit ? `
                <div class="timeline-card-actions">
                    <button class="timeline-btn done-btn ${item.isDone ? 'undone' : ''}" 
                            onclick="toggleDone('${item.id}', '${item.type}', event)" 
                            title="${item.isDone ? 'Marquer comme pas fait' : 'Marquer comme fait'}">
                        <i data-lucide="${item.isDone ? 'rotate-ccw' : 'check'}" style="width: 16px; height: 16px;"></i>
                    </button>
                    <button class="timeline-btn calendar-btn ${item.date ? 'has-date' : ''}" 
                            onclick="openQuickDateModal('${item.id}', '${item.type}', event)" 
                            title="${item.date ? 'Modifier la date' : 'Ajouter une date'}">
                        <i data-lucide="calendar" style="width: 16px; height: 16px;"></i>
                    </button>
                    ${item.googleMapsUrl ? `
                        <a href="${item.googleMapsUrl}" 
                           target="_blank" 
                           class="timeline-btn maps-btn"
                           title="Ouvrir dans Google Maps"
                           onclick="event.stopPropagation()">
                            <i data-lucide="map-pin" style="width: 16px; height: 16px;"></i>
                        </a>
                    ` : ''}
                    ${item.bookingUrl ? `
                        <a href="${item.bookingUrl}" 
                           target="_blank" 
                           class="timeline-btn booking-btn"
                           title="Lien de réservation"
                           onclick="event.stopPropagation()">
                            <i data-lucide="external-link" style="width: 16px; height: 16px;"></i>
                        </a>
                    ` : ''}
                </div>
            ` : `
                <div class="timeline-card-actions">
                    ${item.googleMapsUrl ? `
                        <a href="${item.googleMapsUrl}" 
                           target="_blank" 
                           class="timeline-btn maps-btn"
                           title="Ouvrir dans Google Maps"
                           onclick="event.stopPropagation()"
                           style="flex: 1;">
                            <i data-lucide="map-pin" style="width: 16px; height: 16px;"></i>
                        </a>
                    ` : ''}
                    ${item.bookingUrl ? `
                        <a href="${item.bookingUrl}" 
                           target="_blank" 
                           class="timeline-btn booking-btn"
                           title="Lien de réservation"
                           onclick="event.stopPropagation()"
                           style="flex: 1;">
                            <i data-lucide="external-link" style="width: 16px; height: 16px;"></i>
                        </a>
                    ` : ''}
                </div>
            `;
            
            return `
                <div class="timeline-card ${item.type} ${priorityClass} ${doneClass}" 
                     onclick="showDetailById('${item.id}', '${item.type}')">
                    
                    ${priorityBadge}
                    
                    ${item.photoUrl ? `
                        <img src="${item.photoUrl}" 
                             alt="${item.name}" 
                             class="timeline-card-photo" 
                             onerror="this.style.display='none'">
                    ` : ''}
                    
                    <div class="timeline-card-content">
                        <div class="timeline-card-title">${item.name}</div>
                        <div class="timeline-card-city">${item.city}</div>
                        ${item.notes ? `
                            <div class="timeline-card-notes">${item.notes}</div>
                        ` : ''}
                        ${price ? `
                            <div class="timeline-card-price">${price.toLocaleString()}¥</div>
                        ` : ''}
                    </div>
                    ${actionButtons}
                </div>
            `;
        }).join('');
        
        // Forcer le rendu des icônes Lucide après un micro-délai
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons({ 
                    attrs: { 
                        'stroke-width': 2 
                    } 
                });
            }
        }, 10);
    }
};