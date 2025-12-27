class Trip {
    constructor({
        id = null,
        name,
        destination = '',
        country = '',
        startDate = '',
        endDate = '',
        currency = '€',
        currencySymbol = '€',
        budget = 0,
        coverImage = '',
        members = {},
        createdBy = null,
        createdAt = null,
        updatedAt = null,
        myRole = null
    }) {
        this.id = id || this.generateId();
        this.name = name;
        this.destination = destination;
        this.country = country;
        this.startDate = startDate;
        this.endDate = endDate;
        this.currency = currency;
        this.currencySymbol = currencySymbol;
        this.budget = budget;
        this.coverImage = coverImage;
        this.members = members;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.myRole = myRole;
    }

    generateId() {
        return `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Calculer la durée du voyage
    getDuration() {
        if (!this.startDate || !this.endDate) return null;
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 pour inclure le dernier jour
        return diffDays;
    }

    // Formater les dates
    getFormattedDates() {
        if (!this.startDate || !this.endDate) return '';
        
        const options = { day: 'numeric', month: 'short' };
        const start = new Date(this.startDate).toLocaleDateString('fr-FR', options);
        const endOptions = { day: 'numeric', month: 'short', year: 'numeric' };
        const end = new Date(this.endDate).toLocaleDateString('fr-FR', endOptions);
        
        return `${start} - ${end}`;
    }

    // Obtenir le nombre de participants
    getParticipantsCount() {
        return Object.keys(this.members).length;
    }

    // Vérifier si l'utilisateur actuel est owner
    isOwner() {
        return this.myRole === 'owner';
    }

    // Vérifier si l'utilisateur actuel peut éditer
    canEdit() {
        return this.myRole === 'owner' || this.myRole === 'editor';
    }

    // Vérifier si l'utilisateur actuel peut gérer (inviter, etc.)
    canManage() {
        return this.myRole === 'owner';
    }

    // LEGACY: Vérifier si un userId spécifique est owner (pour compatibilité)
    isOwnerById(userId) {
        return this.members[userId] === 'owner';
    }

    // LEGACY: Vérifier si un userId spécifique peut éditer
    canEditById(userId) {
        const role = this.members[userId];
        return role === 'owner' || role === 'editor';
    }

    // Obtenir le badge de rôle
    getRoleBadge() {
        const badges = {
            'owner': { text: 'Propriétaire', color: '#007AFF' },
            'editor': { text: 'Éditeur', color: '#34C759' },
            'viewer': { text: 'Lecteur', color: '#8E8E93' }
        };
        return badges[this.myRole] || badges['viewer'];
    }

    // Convertir pour Firestore (création)
    toFirestore() {
        return {
            name: this.name,
            destination: this.destination,
            country: this.country,
            startDate: this.startDate,
            endDate: this.endDate,
            currency: this.currency,
            currencySymbol: this.currencySymbol,
            budget: this.budget,
            coverImage: this.coverImage,
            members: this.members,
            createdBy: this.createdBy
        };
    }

    // Créer depuis Firestore
    static fromFirestore(doc) {
        const data = doc.data();
        return new Trip({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
        });
    }

    // Validation
    validate() {
        const errors = [];
        
        if (!this.name || this.name.trim() === '') {
            errors.push('Le nom du voyage est requis');
        }
        
        if (this.startDate && this.endDate) {
            const start = new Date(this.startDate);
            const end = new Date(this.endDate);
            if (end < start) {
                errors.push('La date de fin doit être après la date de début');
            }
        }
        
        if (this.budget < 0) {
            errors.push('Le budget ne peut pas être négatif');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}