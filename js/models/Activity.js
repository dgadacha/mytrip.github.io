class Activity {
    constructor({
        name,
        city,
        category,
        price = null,
        date = null,
        endDate = null, // pour les hôtels
        priority = 'normal',
        googleMapsUrl = null,
        photoUrl = null,
        notes = null,
        isBooked = false,
        bookingUrl = null,
        isDone = false,
        id = null,
        type = 'activity'
    }) {
        this.id = id || this.generateId();
        this.name = name;
        this.city = city;
        this.category = category;
        this.price = price;
        this.date = date;
        this.endDate = endDate; // pour les hôtels
        this.priority = priority;
        this.googleMapsUrl = googleMapsUrl;
        this.photoUrl = photoUrl;
        this.notes = notes;
        this.isBooked = isBooked;
        this.bookingUrl = bookingUrl;
        this.isDone = isDone;
        this.type = type;
    }

    generateId() {
        return `${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}