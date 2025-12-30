const Dashboard = {
    update(hotels, restaurants, activities, flights) {
        document.getElementById('totalHotels').textContent = hotels.length;
        document.getElementById('totalRestaurants').textContent = restaurants.length;
        document.getElementById('totalActivities').textContent = activities.length;
        document.getElementById('totalFlights').textContent = flights.length;
        
        // Budget uniquement pour les items avec une date
        const itemsWithDate = [...hotels, ...restaurants, ...activities, ...flights].filter(item => item.date);
        const totalBudget = itemsWithDate.reduce((sum, item) => sum + (item.price || 0), 0);

        // Budget estimé total
        const totalEstimatedBudget = [...restaurants, ...activities, ...hotels, ...flights].reduce((sum, item) => sum + (item.price || 0), 0);
        
        const currencySymbol = currentTrip?.currencySymbol || '¥';
        document.getElementById('totalBudget').textContent = totalBudget.toLocaleString() + currencySymbol;
        document.getElementById('totalEstimatedBudget').textContent = `Estimé : ${totalEstimatedBudget.toLocaleString()}${currencySymbol}`;
        
        // Réservés = items avec date (ceux au calendrier)
        const totalReservations = itemsWithDate.length;
        //document.getElementById('totalReserved').textContent = totalReservations;
    }
};