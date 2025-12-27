const Dashboard = {
    update(hotels, restaurants, activities) {
        document.getElementById('totalHotels').textContent = hotels.length;
        document.getElementById('totalRestaurants').textContent = restaurants.length;
        document.getElementById('totalActivities').textContent = activities.length;
        
        // Budget uniquement pour les items avec une date
        const itemsWithDate = [...hotels, ...restaurants, ...activities].filter(item => item.date);
        const totalBudget = itemsWithDate.reduce((sum, item) => sum + (item.price || 0), 0);
        
        const currencySymbol = currentTrip?.currencySymbol || '¥';
        document.getElementById('totalBudget').textContent = totalBudget.toLocaleString() + currencySymbol;
        
        // Réservés = items avec date (ceux au calendrier)
        const totalReservations = itemsWithDate.length;
        //document.getElementById('totalReserved').textContent = totalReservations;
    }
};