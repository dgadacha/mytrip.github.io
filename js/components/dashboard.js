const Dashboard = {
    update(restaurants, activities) {
        document.getElementById('totalRestaurants').textContent = restaurants.length;
        document.getElementById('totalActivities').textContent = activities.length;

        const totalBudget = [...restaurants, ...activities].reduce((sum, item) => sum + (item.price || 0), 0);
        document.getElementById('totalBudget').textContent = totalBudget.toLocaleString() + '¥';

        const totalReservations = [...restaurants, ...activities].filter(item => item.isBooked).length;
        document.getElementById('totalReservations').textContent = totalReservations;
    }
};