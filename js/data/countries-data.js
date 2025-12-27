const COUNTRIES_DATA = {
    countries: [
        {
            name: "Afghanistan",
            code: "AF",
            currency: "AFN",
            currencySymbol: "؋",
            cities: ["Kabul", "Kandahar", "Herat", "Mazar-i-Sharif"]
        },
        {
            name: "Albania",
            code: "AL",
            currency: "ALL",
            currencySymbol: "Lek",
            cities: ["Tirana", "Durrës", "Vlorë", "Shkodër"]
        },
        {
            name: "Algeria",
            code: "DZ",
            currency: "DZD",
            currencySymbol: "د.ج",
            cities: ["Algiers", "Oran", "Constantine", "Annaba"]
        },
        {
            name: "Argentina",
            code: "AR",
            currency: "ARS",
            currencySymbol: "$",
            cities: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "Mar del Plata"]
        },
        {
            name: "Australia",
            code: "AU",
            currency: "AUD",
            currencySymbol: "$",
            cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra"]
        },
        {
            name: "Austria",
            code: "AT",
            currency: "EUR",
            currencySymbol: "€",
            cities: ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck"]
        },
        {
            name: "Belgium",
            code: "BE",
            currency: "EUR",
            currencySymbol: "€",
            cities: ["Brussels", "Antwerp", "Ghent", "Bruges", "Liège", "Leuven"]
        },
        {
            name: "Brazil",
            code: "BR",
            currency: "BRL",
            currencySymbol: "R$",
            cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba"]
        },
        {
            name: "Canada",
            code: "CA",
            currency: "CAD",
            currencySymbol: "$",
            cities: ["Toronto", "Montreal", "Vancouver", "Calgary", "Ottawa", "Edmonton", "Quebec City", "Winnipeg"]
        },
        {
            name: "China",
            code: "CN",
            currency: "CNY",
            currencySymbol: "¥",
            cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Hangzhou", "Xi'an", "Chongqing", "Suzhou", "Nanjing"]
        },
        {
            name: "Czech Republic",
            code: "CZ",
            currency: "CZK",
            currencySymbol: "Kč",
            cities: ["Prague", "Brno", "Ostrava", "Plzeň", "Liberec"]
        },
        {
            name: "Denmark",
            code: "DK",
            currency: "DKK",
            currencySymbol: "kr",
            cities: ["Copenhagen", "Aarhus", "Odense", "Aalborg"]
        },
        {
            name: "Egypt",
            code: "EG",
            currency: "EGP",
            currencySymbol: "£",
            cities: ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan", "Hurghada", "Sharm El Sheikh"]
        },
        {
            name: "Finland",
            code: "FI",
            currency: "EUR",
            currencySymbol: "€",
            cities: ["Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku"]
        },
        {
            name: "France",
            code: "FR",
            currency: "EUR",
            currencySymbol: "€",
            cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims"]
        },
        {
            name: "Germany",
            code: "DE",
            currency: "EUR",
            currencySymbol: "€",
            cities: ["Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Dortmund", "Dresden", "Leipzig"]
        },
        {
            name: "Greece",
            code: "GR",
            currency: "EUR",
            currencySymbol: "€",
            cities: ["Athens", "Thessaloniki", "Patras", "Heraklion", "Santorini", "Mykonos", "Rhodes"]
        },
        {
            name: "Hong Kong",
            code: "HK",
            currency: "HKD",
            currencySymbol: "$",
            cities: ["Hong Kong", "Kowloon", "Tsim Sha Tsui", "Causeway Bay", "Mong Kok"]
        },
        {
            name: "Hungary",
            code: "HU",
            currency: "HUF",
            currencySymbol: "Ft",
            cities: ["Budapest", "Debrecen", "Szeged", "Miskolc"]
        },
        {
            name: "Iceland",
            code: "IS",
            currency: "ISK",
            currencySymbol: "kr",
            cities: ["Reykjavik", "Akureyri", "Keflavik", "Hafnarfjörður"]
        },
        {
            name: "India",
            code: "IN",
            currency: "INR",
            currencySymbol: "₹",
            cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Goa"]
        },
        {
            name: "Indonesia",
            code: "ID",
            currency: "IDR",
            currencySymbol: "Rp",
            cities: ["Jakarta", "Bali", "Surabaya", "Bandung", "Yogyakarta", "Medan"]
        },
        {
            name: "Ireland",
            code: "IE",
            currency: "EUR",
            currencySymbol: "€",
            cities: ["Dublin", "Cork", "Galway", "Limerick", "Killarney"]
        },
        {
            name: "Israel",
            code: "IL",
            currency: "ILS",
            currencySymbol: "₪",
            cities: ["Jerusalem", "Tel Aviv", "Haifa", "Eilat", "Be'er Sheva"]
        },
        {
            name: "Italy",
            code: "IT",
            currency: "EUR",
            currencySymbol: "€",
            cities: ["Rome", "Milan", "Naples", "Turin", "Florence", "Venice", "Bologna", "Palermo", "Genoa", "Verona"]
        },
        {
            name: "Japan",
            code: "JP",
            currency: "JPY",
            currencySymbol: "¥",
            cities: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Hiroshima", "Nara", "Kamakura"]
        },
        {
            name: "Malaysia",
            code: "MY",
            currency: "MYR",
            currencySymbol: "RM",
            cities: ["Kuala Lumpur", "George Town", "Johor Bahru", "Malacca", "Ipoh"]
        },
        {
            name: "Mexico",
            code: "MX",
            currency: "MXN",
            currencySymbol: "$",
            cities: ["Mexico City", "Cancun", "Guadalajara", "Monterrey", "Playa del Carmen", "Tulum", "Puerto Vallarta"]
        },
        {
            name: "Morocco",
            code: "MA",
            currency: "MAD",
            currencySymbol: "د.م.",
            cities: ["Marrakech", "Casablanca", "Fez", "Rabat", "Tangier", "Agadir", "Chefchaouen"]
        },
        {
            name: "Netherlands",
            code: "NL",
            currency: "EUR",
            currencySymbol: "€",
            cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen"]
        },
        {
            name: "New Zealand",
            code: "NZ",
            currency: "NZD",
            currencySymbol: "$",
            cities: ["Auckland", "Wellington", "Christchurch", "Queenstown", "Rotorua"]
        },
        {
            name: "Norway",
            code: "NO",
            currency: "NOK",
            currencySymbol: "kr",
            cities: ["Oslo", "Bergen", "Trondheim", "Stavanger", "Tromsø"]
        },
        {
            name: "Peru",
            code: "PE",
            currency: "PEN",
            currencySymbol: "S/",
            cities: ["Lima", "Cusco", "Arequipa", "Trujillo", "Machu Picchu"]
        },
        {
            name: "Philippines",
            code: "PH",
            currency: "PHP",
            currencySymbol: "₱",
            cities: ["Manila", "Cebu", "Davao", "Boracay", "Palawan", "Baguio"]
        },
        {
            name: "Poland",
            code: "PL",
            currency: "PLN",
            currencySymbol: "zł",
            cities: ["Warsaw", "Krakow", "Wroclaw", "Gdansk", "Poznan"]
        },
        {
            name: "Portugal",
            code: "PT",
            currency: "EUR",
            currencySymbol: "€",
            cities: ["Lisbon", "Porto", "Faro", "Coimbra", "Sintra", "Lagos"]
        },
        {
            name: "Russia",
            code: "RU",
            currency: "RUB",
            currencySymbol: "₽",
            cities: ["Moscow", "Saint Petersburg", "Kazan", "Sochi", "Vladivostok"]
        },
        {
            name: "Singapore",
            code: "SG",
            currency: "SGD",
            currencySymbol: "$",
            cities: ["Singapore", "Marina Bay", "Sentosa", "Orchard Road"]
        },
        {
            name: "South Africa",
            code: "ZA",
            currency: "ZAR",
            currencySymbol: "R",
            cities: ["Cape Town", "Johannesburg", "Durban", "Pretoria", "Port Elizabeth"]
        },
        {
            name: "South Korea",
            code: "KR",
            currency: "KRW",
            currencySymbol: "₩",
            cities: ["Seoul", "Busan", "Incheon", "Jeju", "Daegu", "Gyeongju"]
        },
        {
            name: "Spain",
            code: "ES",
            currency: "EUR",
            currencySymbol: "€",
            cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Bilbao", "Malaga", "Granada", "Ibiza", "San Sebastian"]
        },
        {
            name: "Sweden",
            code: "SE",
            currency: "SEK",
            currencySymbol: "kr",
            cities: ["Stockholm", "Gothenburg", "Malmö", "Uppsala"]
        },
        {
            name: "Switzerland",
            code: "CH",
            currency: "CHF",
            currencySymbol: "CHF",
            cities: ["Zurich", "Geneva", "Basel", "Bern", "Lausanne", "Lucerne", "Interlaken"]
        },
        {
            name: "Taiwan",
            code: "TW",
            currency: "TWD",
            currencySymbol: "NT$",
            cities: ["Taipei", "Kaohsiung", "Taichung", "Tainan"]
        },
        {
            name: "Thailand",
            code: "TH",
            currency: "THB",
            currencySymbol: "฿",
            cities: ["Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Krabi", "Koh Samui", "Ayutthaya"]
        },
        {
            name: "Turkey",
            code: "TR",
            currency: "TRY",
            currencySymbol: "₺",
            cities: ["Istanbul", "Ankara", "Izmir", "Antalya", "Cappadocia", "Bodrum"]
        },
        {
            name: "United Arab Emirates",
            code: "AE",
            currency: "AED",
            currencySymbol: "د.إ",
            cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah"]
        },
        {
            name: "United Kingdom",
            code: "GB",
            currency: "GBP",
            currencySymbol: "£",
            cities: ["London", "Manchester", "Birmingham", "Edinburgh", "Glasgow", "Liverpool", "Bristol", "Oxford", "Cambridge"]
        },
        {
            name: "United States",
            code: "US",
            currency: "USD",
            currencySymbol: "$",
            cities: ["New York", "Los Angeles", "Chicago", "San Francisco", "Las Vegas", "Miami", "Seattle", "Boston", "Washington DC", "San Diego", "Orlando", "New Orleans"]
        },
        {
            name: "Vietnam",
            code: "VN",
            currency: "VND",
            currencySymbol: "₫",
            cities: ["Ho Chi Minh City", "Hanoi", "Da Nang", "Hoi An", "Nha Trang", "Hue"]
        }
    ],
    
    // Méthodes utilitaires
    getCountryByCode(code) {
        return this.countries.find(c => c.code === code);
    },
    
    getCountryByName(name) {
        return this.countries.find(c => c.name === name);
    },
    
    getCitiesForCountry(countryName) {
        const country = this.getCountryByName(countryName);
        return country ? country.cities : [];
    },
    
    getCurrencyInfo(countryName) {
        const country = this.getCountryByName(countryName);
        return country ? {
            code: country.currency,
            symbol: country.currencySymbol
        } : { code: 'USD', symbol: '$' };
    },
    
    getAllCountries() {
        return this.countries.map(c => ({ name: c.name, code: c.code }));
    }
};