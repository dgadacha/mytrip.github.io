const CalendarView = {
    render(restaurants, activities) {
        const calendarView = document.getElementById('calendarView');
        const allItems = [...restaurants, ...activities].filter(item => !item.isDone);

        const itemsByDate = {};

        allItems.forEach(item => {
            const rawDate = item.date;
            if (!rawDate) return;

            const [datePart, timePart] = rawDate.split('T');
            const time = timePart ? timePart.slice(0, 5) : null;

            if (!itemsByDate[datePart]) {
                itemsByDate[datePart] = [];
            }

            itemsByDate[datePart].push({
                ...item,
                time
            });
        });

        const dates = Object.keys(itemsByDate).sort();

        if (dates.length === 0) {
            calendarView.innerHTML = `
                <div class="calendar-empty">
                    <h3>Aucune date programmée</h3>
                    <p>Ajoutez des dates pour voir votre calendrier</p>
                </div>
            `;
            return;
        }

        let html = '<div class="timeline-container" id="timelineContainer">';

        dates.forEach((date, dayIndex) => {
            const items = itemsByDate[date];
            items.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

            const dateObj = new Date(date + 'T00:00:00');
            const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });
            const dayNumber = dateObj.getDate();
            const monthName = dateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

            html += `
                <div class="timeline-day" data-day-index="${dayIndex}">
                    <div class="timeline-date-header">
                        <div class="timeline-day-name">${dayName.charAt(0).toUpperCase() + dayName.slice(1)}</div>
                        <div class="timeline-day-number">${dayNumber}</div>
                        <div class="timeline-month-name">${monthName}</div>
                    </div>
                    <div class="timeline-items">
            `;

            items.forEach(item => {
                html += `
                    <div class="timeline-card ${item.type}" onclick="app.showDetailById('${item.id}', '${item.type}')">
                        ${item.photoUrl ? `<img src="${item.photoUrl}" alt="${item.name}" class="timeline-card-photo" onerror="this.style.display='none'">` : ''}
                        <div class="timeline-card-content">
                            ${item.time ? `<div class="timeline-time">${item.time}</div>` : ''}
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
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        html += '</div>';

        if (dates.length > 1) {
            html += '<div class="timeline-indicators">';
            for (let i = 0; i < dates.length; i++) {
                html += `<div class="timeline-indicator ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="scrollToDay(${i})"></div>`;
            }
            html += '</div>';
        }

        calendarView.innerHTML = html;

        if (dates.length > 1) {
            setTimeout(() => {
                const container = document.getElementById('timelineContainer');
                if (container) {
                    container.addEventListener('scroll', this.updateIndicators);
                }
            }, 100);
        }
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
    },

    updateIndicators() {
        const container = document.getElementById('timelineContainer');
        if (!container) return;

        const scrollLeft = container.scrollLeft;
        const containerWidth = container.offsetWidth;
        const currentIndex = Math.round(scrollLeft / containerWidth);

        document.querySelectorAll('.timeline-indicator').forEach((indicator, index) => {
            if (index === currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
};

// Fonction globale
function scrollToDay(index) {
    const container = document.getElementById('timelineContainer');
    if (!container) return;

    const containerWidth = container.offsetWidth;
    container.scrollTo({
        left: index * containerWidth,
        behavior: 'smooth'
    });
}