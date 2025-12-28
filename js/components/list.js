const ListView = {
    render(containerId, items) {
        const container = document.getElementById(containerId);
        const canEdit = currentTrip ? currentTrip.canEdit() : true;
        const currencySymbol = currentTrip?.currencySymbol || '¥';
        
        // Fonction pour render un seul item
        const renderItem = (item) => {
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
                             loading="lazy"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="timeline-card-photo-placeholder" style="display: none; background: linear-gradient(135deg, ${getCategoryIcon(item.type, item.category).color}22 0%, ${getCategoryIcon(item.type, item.category).color}11 100%);">
                            <i data-lucide="${getCategoryIcon(item.type, item.category).icon}" style="color: ${getCategoryIcon(item.type, item.category).color};"></i>
                        </div>
                    ` : `
                        <div class="timeline-card-photo-placeholder" style="background: linear-gradient(135deg, ${getCategoryIcon(item.type, item.category).color}22 0%, ${getCategoryIcon(item.type, item.category).color}11 100%);">
                            <i data-lucide="${getCategoryIcon(item.type, item.category).icon}" style="color: ${getCategoryIcon(item.type, item.category).color};"></i>
                        </div>
                    `}
                    
                    <div class="timeline-card-content">
                        <div class="timeline-card-title">${item.name}</div>
                        <div class="timeline-card-city">${item.city}</div>
                        ${item.notes ? `
                            <div class="timeline-card-notes">${item.notes}</div>
                        ` : ''}
                        ${price ? `
                            <div class="timeline-card-price">${price.toLocaleString()}${currencySymbol}</div>
                        ` : ''}
                    </div>
                    ${actionButtons}
                </div>
            `;
        };
        
        // NOUVEAU : Utiliser le batch renderer
        BatchRenderer.renderInBatches(container, items, renderItem, () => {
            // Callback appelé quand tout est rendu
            console.log('🎨 ListView: Rendering Lucide icons...');
            if (typeof lucide !== 'undefined' && container) {
                const icons = container.querySelectorAll('[data-lucide]');
                if (icons.length > 0) {
                    lucide.createIcons({ 
                        attrs: { 'stroke-width': 2 },
                        icons: icons
                    });
                    console.log(`✅ ListView: ${icons.length} icons rendered`);
                }
            }
        });
    }
};