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
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },
    
    bottomNavSwitch(view) {
        // Mettre à jour la bottom nav
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Trouver et activer le bon item
        const items = document.querySelectorAll('.bottom-nav-item');
        items.forEach((item, index) => {
            const views = ['all', 'restaurants', 'activities', 'calendar'];
            if (views[index] === view) {
                item.classList.add('active');
            }
        });
        
        // Changer de contenu
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        
        const contentMap = {
            'all': 'allContent',
            'restaurants': 'restaurantsContent',
            'activities': 'activitiesContent',
            'calendar': 'calendarContent'
        };
        
        const contentId = contentMap[view];
        if (contentId) {
            document.getElementById(contentId).classList.add('active');
        }
        
        // Scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },
    
    toggleFabMenu() {
        const menu = document.getElementById('fabMenu');
        if (menu) {
            menu.classList.toggle('active');
            this.fabMenuActive = !this.fabMenuActive;
        }
    },
    
    closeFabMenu() {
        const menu = document.getElementById('fabMenu');
        if (menu) {
            menu.classList.remove('active');
            this.fabMenuActive = false;
        }
    },
    
    initialize() {
        // Fermer le FAB menu si on clique ailleurs
        document.addEventListener('click', (e) => {
            const fab = document.querySelector('.fab');
            const fabMenu = document.getElementById('fabMenu');
            
            if (fab && fabMenu && !fab.contains(e.target) && !fabMenu.contains(e.target)) {
                this.closeFabMenu();
            }
        });
    }
};

// Fonctions globales (déjà définies dans trip.js, mais on les garde pour compatibilité)
if (typeof switchTab === 'undefined') {
    function switchTab(tab) {
        NavigationManager.switchTab(tab);
    }
}

if (typeof bottomNavSwitch === 'undefined') {
    function bottomNavSwitch(view) {
        NavigationManager.bottomNavSwitch(view);
    }
}

if (typeof toggleFabMenu === 'undefined') {
    function toggleFabMenu() {
        NavigationManager.toggleFabMenu();
    }
}

if (typeof closeFabMenu === 'undefined') {
    function closeFabMenu() {
        NavigationManager.closeFabMenu();
    }
}