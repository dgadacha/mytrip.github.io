const NavigationManager = {
    fabMenuActive: false,

    switchTab(tab) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        event.target.classList.add('active');

        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));

        const contentMap = {
            'all': 'allContent',
            'restaurants': 'restaurantsContent',
            'activities': 'activitiesContent',
            'calendar': 'calendarContent'
        };

        const contentId = contentMap[tab];
        if (contentId) {
            document.getElementById(contentId).classList.add('active');
        }
        
        refreshIcons();
    },

    bottomNavSwitch(view) {
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-nav="${view}"]`).classList.add('active');

        this.switchTab(view);
        
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        refreshIcons();
    },

    toggleFabMenu() {
        const menu = document.getElementById('fabMenu');
        menu.classList.toggle('active');
        this.fabMenuActive = !this.fabMenuActive;
    },

    closeFabMenu() {
        const menu = document.getElementById('fabMenu');
        menu.classList.remove('active');
        this.fabMenuActive = false;
    },

    initialize() {
        document.addEventListener('click', (e) => {
            const fab = document.getElementById('fab');
            const fabMenu = document.getElementById('fabMenu');
            
            if (!fab.contains(e.target) && !fabMenu.contains(e.target)) {
                this.closeFabMenu();
            }
        });

        document.getElementById('isBooked').addEventListener('change', function() {
            const dateGroup = document.getElementById('reservationDateGroup');
            dateGroup.style.display = this.checked ? 'block' : 'none';
        });
    }
};

// Fonctions globales
function switchTab(tab) {
    NavigationManager.switchTab(tab);
}

function bottomNavSwitch(view) {
    NavigationManager.bottomNavSwitch(view);
}

function toggleFabMenu() {
    NavigationManager.toggleFabMenu();
}

function closeFabMenu() {
    NavigationManager.closeFabMenu();
}