const CalendarView = {
    render(restaurants, activities) {
        const container = document.getElementById('calendarView');
        // Filtrer uniquement les items avec une date
        const allItems = [...restaurants, ...activities].filter(item => item.date);
        
        if (allItems.length === 0) {
            container.innerHTML = `
                <div class="calendar-empty">
                    <p style="color: var(--text-secondary); text-align: center; padding: 40px 20px;">
                        Aucune activité avec date pour le moment
                    </p>
                </div>
            `;
            return;
        }

        // Grouper par date
        const itemsByDate = {};
        allItems.forEach(item => {
            const dateKey = item.date.split('T')[0];
            if (!itemsByDate[dateKey]) {
                itemsByDate[dateKey] = [];
            }
            itemsByDate[dateKey].push(item);
        });

        // Trier les dates
        const sortedDates = Object.keys(itemsByDate).sort();

        const canEdit = currentTrip ? currentTrip.canEdit() : true;

        // Générer le HTML
        let html = '<div class="timeline-container">';
        
        sortedDates.forEach(dateKey => {
            const date = new Date(dateKey + 'T00:00:00');
            const dayItems = SortManager.applySorting(itemsByDate[dateKey]);
            
            const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });
            const dayNumber = date.getDate();
            const monthName = date.toLocaleDateString('fr-FR', { month: 'long' });
            
            html += `
                <div class="timeline-day">
                    <div class="timeline-date-header">
                        <div class="timeline-day-name">${dayName}</div>
                        <div class="timeline-day-number">${dayNumber}</div>
                        <div class="timeline-month-name">${monthName}</div>
                    </div>
                    <div class="timeline-items">
            `;
            
            dayItems.forEach(item => {
                const priorityClass = item.priority && item.priority !== 'normal' ? `priority-${item.priority}` : '';
                const doneClass = item.isDone ? 'done' : '';
                const price = item.type === 'restaurant' ? item.price : item.price;
                const itemDate = new Date(item.date);
                const timeString = itemDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                
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
                
                html += `
                    <div class="timeline-card ${item.type} ${doneClass}" 
                         onclick="showDetailById('${item.id}', '${item.type}')">
                        
                        ${priorityBadge}
                        
                        ${item.photoUrl ? `
                            <img src="${item.photoUrl}" 
                                 alt="${item.name}" 
                                 class="timeline-card-photo" 
                                 onerror="this.style.display='none'">
                        ` : ''}
                        
                        <div class="timeline-card-content">
                            <div class="timeline-time">${timeString}</div>
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
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // Ajouter les indicateurs
        if (sortedDates.length > 1) {
            html += '<div class="timeline-indicators">';
            sortedDates.forEach((dateKey, index) => {
                html += `<div class="timeline-indicator ${index === 0 ? 'active' : ''}" onclick="scrollToDay(${index})"></div>`;
            });
            html += '</div>';
        }
        
        container.innerHTML = html;
        
        // Setup scroll listener pour les indicateurs
        if (sortedDates.length > 1) {
            this.setupScrollListener();
        }
        
        // Forcer le rendu des icônes Lucide
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons({ 
                    attrs: { 
                        'stroke-width': 2 
                    } 
                });
            }
        }, 10);
    },

    setupScrollListener() {
        const timelineContainer = document.querySelector('.timeline-container');
        const indicators = document.querySelectorAll('.timeline-indicator');
        
        if (!timelineContainer || indicators.length === 0) return;
        
        timelineContainer.addEventListener('scroll', () => {
            const scrollLeft = timelineContainer.scrollLeft;
            const dayWidth = timelineContainer.scrollWidth / indicators.length;
            const currentIndex = Math.round(scrollLeft / dayWidth);
            
            indicators.forEach((indicator, index) => {
                if (index === currentIndex) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });
        });
    }
};

// Fonction globale pour scroller vers un jour spécifique
function scrollToDay(index) {
    const timelineContainer = document.querySelector('.timeline-container');
    if (!timelineContainer) return;

    const dayWidth = timelineContainer.scrollWidth / document.querySelectorAll('.timeline-day').length;
    
    timelineContainer.scrollTo({
        left: dayWidth * index,
        behavior: 'smooth'
    });
}