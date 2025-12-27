const CalendarView = {
    render(hotels, restaurants, activities) {
        const container = document.getElementById('calendarView');
        const currencySymbol = currentTrip?.currencySymbol || '¥';
        
        // Fonction pour générer les dates d'un hôtel
        const expandHotelDates = (hotel) => {
            if (!hotel.endDate || hotel.date === hotel.endDate) {
                return [hotel]; // Une seule nuit
            }
            
            const items = [];
            const startDate = new Date(hotel.date);
            const endDate = new Date(hotel.endDate);
            
            // Générer une entrée par jour (du check-in au check-out - 1)
            let currentDate = new Date(startDate);
            while (currentDate < endDate) {
                items.push({
                    ...hotel,
                    date: currentDate.toISOString(),
                    endDate: hotel.endDate,  // Conserver endDate pour le check-out
                    _isHotelNight: true,
                    _nightNumber: items.length + 1,
                    _totalNights: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
            
            return items;
        };
        
        // Éclater les hôtels et combiner avec restos/activités
        const expandedHotels = hotels.flatMap(hotel => 
            hotel.date ? expandHotelDates(hotel) : []
        );
        
        const allItems = [
            ...expandedHotels,
            ...restaurants.filter(item => item.date),
            ...activities.filter(item => item.date)
        ];
        
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
                <div class="timeline-day" data-date="${dateKey}">
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
                const price = item.price;
                const itemDate = new Date(item.date);
                
                // Gestion de l'heure pour l'affichage
                let timeString = itemDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                
                // Pour les hôtels : afficher l'heure différemment selon la nuit
                if (item._isHotelNight) {
                    if (item._nightNumber === 1) {
                        // Première nuit : afficher heure de check-in
                        timeString = `Check-in ${timeString}`;
                    } else if (item._nightNumber === item._totalNights) {
                        // Dernière nuit : afficher heure de check-out (= endDate)
                        if (item.endDate) {
                            const checkoutDate = new Date(item.endDate);
                            timeString = `Check-out ${checkoutDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
                        } else {
                            timeString = 'Toute la journée';
                        }
                    } else {
                        // Nuits intermédiaires
                        timeString = 'Toute la journée';
                    }
                }
                
                // Nom de l'item (avec nuit X/Y pour les hôtels)
                let itemName = item.name;
                if (item._isHotelNight && item._totalNights > 1) {
                    itemName = `${item.name} (Nuit ${item._nightNumber}/${item._totalNights})`;
                }
                
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
                            <div class="timeline-card-title">${itemName}</div>
                            <div class="timeline-card-city">${item.city}</div>
                            ${item.notes ? `
                                <div class="timeline-card-notes">${item.notes}</div>
                            ` : ''}
                            ${price && !item._isHotelNight ? `
                                <div class="timeline-card-price">${item.price.toLocaleString()}${currencySymbol}</div>
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
        
        container.innerHTML = html;
        
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

        // Scroller vers aujourd'hui si le jour existe
        this.scrollToToday();
    },

    scrollToToday() {
        const today = new Date();
        const todayKey = today.toISOString().split('T')[0];
        
        const timelineDays = document.querySelectorAll('.timeline-day');
        if (timelineDays.length === 0) return;
        
        let todayIndex = -1;
        timelineDays.forEach((dayElement, index) => {
            if (dayElement.dataset.date === todayKey) {
                todayIndex = index;
            }
        });
        
        if (todayIndex !== -1) {
            setTimeout(() => {
                scrollToDay(todayIndex);
            }, 150);
        }
    }
};

function scrollToDay(index) {
    const timelineContainer = document.querySelector('.timeline-container');
    if (!timelineContainer) return;

    const dayWidth = timelineContainer.scrollWidth / document.querySelectorAll('.timeline-day').length;
    
    timelineContainer.scrollTo({
        left: dayWidth * index,
        behavior: 'smooth'
    });
}