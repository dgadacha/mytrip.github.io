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
        type = 'activity',
        flightNumber = null,
        airline = null,
        departureAirport = null,
        departureTerminal = null,
        departureCity = null,
        departureDate = null,
        arrivalAirport = null,
        arrivalTerminal = null,
        arrivalCity = null,
        arrivalDate = null,
        layovers = [],
        bookingRef = null
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
        this.flightNumber = flightNumber;
        this.airline = airline;
        this.departureAirport = departureAirport;
        this.departureTerminal = departureTerminal;
        this.departureCity = departureCity;
        this.departureDate = departureDate;
        this.arrivalAirport = arrivalAirport;
        this.arrivalTerminal = arrivalTerminal;
        this.arrivalCity = arrivalCity;
        this.arrivalDate = arrivalDate;
        this.layovers = layovers || [];
        this.bookingRef = bookingRef;
    }

    generateId() {
        return `${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}