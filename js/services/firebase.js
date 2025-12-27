const FirebaseService = {
    app: null,
    db: null,
    auth: null,
    currentUser: null,
    
    config: {
        apiKey: "AIzaSyD0Y8R7qsmZ28R-RL-9AdW9s3so2GCGbSc",
        authDomain: "vacayo-77ad3.firebaseapp.com",
        projectId: "vacayo-77ad3",
        storageBucket: "vacayo-77ad3.firebasestorage.app",
        messagingSenderId: "266213572596",
        appId: "1:266213572596:web:4aa45d14fb1eb94c4fc3a1"
    },

    async initialize() {
        try {
            this.app = firebase.initializeApp(this.config);
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            console.log('✅ Firebase initialisé');
            
            this.auth.onAuthStateChanged(async user => {
                if (user) {
                    this.currentUser = user;
                    await this.ensureUserDocument(user);
                    console.log('👤 Utilisateur connecté:', user.email);
                    this.onUserLoggedIn(user);
                } else {
                    this.currentUser = null;
                    console.log('👤 Utilisateur déconnecté');
                    this.onUserLoggedOut();
                }
            });
        } catch (error) {
            console.error('❌ Erreur initialisation Firebase:', error);
        }
    },

    // ===== AUTHENTIFICATION =====

    async signUp(email, password) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.code };
        }
    },

    async signIn(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.code };
        }
    },

    async signOut() {
        try {
            await this.auth.signOut();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.code };
        }
    },

    async ensureUserDocument(user) {
        const userRef = this.db.collection('users').doc(user.uid);
        const doc = await userRef.get();
        
        if (!doc.exists) {
            await userRef.set({
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                photoURL: user.photoURL || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    },

    // ===== TRIPS =====

    async createTrip(tripData) {
        try {
            const userId = this.auth.currentUser.uid;
            
            const members = {};
            members[userId] = 'owner';
            
            const tripRef = await this.db.collection('trips').add({
                ...tripData,
                createdBy: userId,
                members: members,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true, id: tripRef.id };
        } catch (error) {
            console.error('❌ Erreur création trip:', error);
            return { success: false, error: error.message };
        }
    },

    async getUserTrips() {
        try {
            const userId = this.auth.currentUser.uid;
            
            const snapshot = await this.db.collection('trips')
                .where(`members.${userId}`, '!=', null)
                .orderBy(`members.${userId}`)
                .get();
            
            const trips = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                trips.push({
                    id: doc.id,
                    ...data,
                    myRole: data.members[userId]
                });
            });

            // Trier par date de mise à jour
            trips.sort((a, b) => {
                const dateA = a.updatedAt?.toDate() || new Date(0);
                const dateB = b.updatedAt?.toDate() || new Date(0);
                return dateB - dateA;
            });

            return { success: true, trips };
        } catch (error) {
            console.error('❌ Erreur récupération trips:', error);
            return { success: false, error: error.message };
        }
    },

    async getTrip(tripId) {
        try {
            const tripDoc = await this.db.collection('trips').doc(tripId).get();
            
            if (!tripDoc.exists) {
                return { success: false, error: 'Trip not found' };
            }

            const userId = this.auth.currentUser.uid;
            const data = tripDoc.data();
            
            if (!data.members || !data.members[userId]) {
                return { success: false, error: 'Access denied' };
            }

            return {
                success: true,
                trip: {
                    id: tripDoc.id,
                    ...data,
                    myRole: data.members[userId]
                }
            };
        } catch (error) {
            console.error('❌ Erreur récupération trip:', error);
            return { success: false, error: error.message };
        }
    },

    async updateTrip(tripId, tripData) {
        try {
            const canManage = await this.canManageTrip(tripId);
            if (!canManage) {
                return { success: false, error: 'Permission denied' };
            }

            await this.db.collection('trips').doc(tripId).update({
                ...tripData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true };
        } catch (error) {
            console.error('❌ Erreur update trip:', error);
            return { success: false, error: error.message };
        }
    },

    async deleteTrip(tripId) {
        try {
            const canManage = await this.canManageTrip(tripId);
            if (!canManage) {
                return { success: false, error: 'Permission denied' };
            }

            const batch = this.db.batch();

            // Supprimer toutes les activités
            const activitiesSnapshot = await this.db.collection('activities')
                .where('tripId', '==', tripId)
                .get();
            
            activitiesSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            // Supprimer le trip
            batch.delete(this.db.collection('trips').doc(tripId));
            
            await batch.commit();
            
            return { success: true };
        } catch (error) {
            console.error('❌ Erreur suppression trip:', error);
            return { success: false, error: error.message };
        }
    },

    // ===== PARTICIPANTS =====

    async getTripParticipants(tripId) {
        try {
            const tripDoc = await this.db.collection('trips').doc(tripId).get();
            
            if (!tripDoc.exists) {
                return { success: false, error: 'Trip not found' };
            }

            const members = tripDoc.data().members || {};
            const participants = [];

            for (const userId in members) {
                const userDoc = await this.db.collection('users').doc(userId).get();
                if (userDoc.exists) {
                    participants.push({
                        userId,
                        role: members[userId],
                        ...userDoc.data()
                    });
                }
            }

            return { success: true, participants };
        } catch (error) {
            console.error('❌ Erreur récupération participants:', error);
            return { success: false, error: error.message };
        }
    },

    async inviteParticipant(tripId, email, role = 'viewer') {
        try {
            const canManage = await this.canManageTrip(tripId);
            if (!canManage) {
                return { success: false, error: 'Permission denied' };
            }

            const userId = this.auth.currentUser.uid;
            const tripDoc = await this.db.collection('trips').doc(tripId).get();
            
            if (!tripDoc.exists) {
                return { success: false, error: 'Trip not found' };
            }

            const token = this.generateInviteToken();
            const invitationRef = await this.db.collection('invitations').add({
                tripId,
                tripName: tripDoc.data().name,
                email,
                role,
                invitedBy: userId,
                status: 'pending',
                token,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            const inviteLink = `${window.location.origin}/invite.html?token=${token}`;
            console.log('📧 Lien d\'invitation:', inviteLink);

            return { 
                success: true, 
                invitationId: invitationRef.id,
                inviteLink 
            };
        } catch (error) {
            console.error('❌ Erreur invitation:', error);
            return { success: false, error: error.message };
        }
    },

    async acceptInvitation(token) {
        try {
            const snapshot = await this.db.collection('invitations')
                .where('token', '==', token)
                .where('status', '==', 'pending')
                .limit(1)
                .get();

            if (snapshot.empty) {
                return { success: false, error: 'Invitation non trouvée ou expirée' };
            }

            const invitationDoc = snapshot.docs[0];
            const invitation = invitationDoc.data();

            if (invitation.expiresAt.toDate() < new Date()) {
                return { success: false, error: 'Invitation expirée' };
            }

            const userId = this.auth.currentUser.uid;

            // Utiliser une transaction pour garantir l'atomicité
            const tripRef = this.db.collection('trips').doc(invitation.tripId);
            
            await this.db.runTransaction(async (transaction) => {
                const tripDoc = await transaction.get(tripRef);
                
                if (!tripDoc.exists) {
                    throw new Error('Voyage non trouvé');
                }

                const currentMembers = tripDoc.data().members || {};
                
                // Ajouter le nouvel utilisateur
                currentMembers[userId] = invitation.role;
                
                // Mettre à jour le trip
                transaction.update(tripRef, {
                    members: currentMembers,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Marquer l'invitation comme acceptée
                transaction.update(invitationDoc.ref, {
                    status: 'accepted',
                    acceptedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    acceptedBy: userId
                });
            });

            return { success: true, tripId: invitation.tripId };
        } catch (error) {
            console.error('❌ Erreur acceptation invitation:', error);
            return { success: false, error: error.message };
        }
    },

    async updateParticipantRole(tripId, participantUserId, newRole) {
        try {
            const canManage = await this.canManageTrip(tripId);
            if (!canManage) {
                return { success: false, error: 'Permission denied' };
            }

            const tripDoc = await this.db.collection('trips').doc(tripId).get();
            const members = tripDoc.data().members;

            if (members[participantUserId] === 'owner') {
                return { success: false, error: 'Cannot change owner role' };
            }

            const updateData = {};
            updateData[`members.${participantUserId}`] = newRole;

            await this.db.collection('trips').doc(tripId).update(updateData);

            return { success: true };
        } catch (error) {
            console.error('❌ Erreur update role:', error);
            return { success: false, error: error.message };
        }
    },

    async removeParticipant(tripId, participantUserId) {
        try {
            const canManage = await this.canManageTrip(tripId);
            if (!canManage) {
                return { success: false, error: 'Permission denied' };
            }

            const tripDoc = await this.db.collection('trips').doc(tripId).get();
            const members = tripDoc.data().members;

            if (members[participantUserId] === 'owner') {
                return { success: false, error: 'Cannot remove owner' };
            }

            const updateData = {};
            updateData[`members.${participantUserId}`] = firebase.firestore.FieldValue.delete();

            await this.db.collection('trips').doc(tripId).update(updateData);

            return { success: true };
        } catch (error) {
            console.error('❌ Erreur suppression participant:', error);
            return { success: false, error: error.message };
        }
    },

    // ===== ACTIVITIES =====

    async addActivity(tripId, activityData) {
        try {
            const canEdit = await this.canEditTrip(tripId);
            if (!canEdit) {
                return { success: false, error: 'Permission denied' };
            }

            const userId = this.auth.currentUser.uid;
            const docRef = await this.db.collection('activities').add({
                ...activityData,
                tripId,
                createdBy: userId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            await this.db.collection('trips').doc(tripId).update({
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('❌ Erreur ajout activity:', error);
            return { success: false, error: error.message };
        }
    },

    async getTripActivities(tripId) {
        try {
            const snapshot = await this.db.collection('activities')
                .where('tripId', '==', tripId)
                .get();
            
            const activities = [];
            snapshot.forEach(doc => {
                activities.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return { success: true, activities };
        } catch (error) {
            console.error('❌ Erreur récupération activities:', error);
            return { success: false, error: error.message };
        }
    },

    async updateActivity(tripId, activityId, activityData) {
        try {
            const canEdit = await this.canEditTrip(tripId);
            if (!canEdit) {
                return { success: false, error: 'Permission denied' };
            }

            await this.db.collection('activities').doc(activityId).update(activityData);

            await this.db.collection('trips').doc(tripId).update({
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('❌ Erreur update activity:', error);
            return { success: false, error: error.message };
        }
    },

    async deleteActivity(tripId, activityId) {
        try {
            const canEdit = await this.canEditTrip(tripId);
            if (!canEdit) {
                return { success: false, error: 'Permission denied' };
            }

            await this.db.collection('activities').doc(activityId).delete();

            await this.db.collection('trips').doc(tripId).update({
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('❌ Erreur suppression activity:', error);
            return { success: false, error: error.message };
        }
    },

    // ===== PERMISSIONS =====

    async getUserRole(tripId) {
        try {
            const userId = this.auth.currentUser.uid;
            const tripDoc = await this.db.collection('trips').doc(tripId).get();
            
            if (!tripDoc.exists) {
                return null;
            }

            const members = tripDoc.data().members || {};
            return members[userId] || null;
        } catch (error) {
            console.error('❌ Erreur récupération role:', error);
            return null;
        }
    },

    async canViewTrip(tripId) {
        const role = await this.getUserRole(tripId);
        return role !== null;
    },

    async canEditTrip(tripId) {
        const role = await this.getUserRole(tripId);
        return role === 'editor' || role === 'owner';
    },

    async canManageTrip(tripId) {
        const role = await this.getUserRole(tripId);
        return role === 'owner';
    },

    // ===== SYNC TEMPS RÉEL =====

    listenToTripActivities(tripId, callback) {
        return this.db.collection('activities')
            .where('tripId', '==', tripId)
            .onSnapshot(snapshot => {
                const activities = [];
                snapshot.forEach(doc => {
                    activities.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                callback(activities);
            });
    },

    // ===== UTILS =====

    async getUserData(userId) {
        const userDoc = await this.db.collection('users').doc(userId).get();
        return userDoc.data();
    },

    generateInviteToken() {
        return Math.random().toString(36).substr(2) + Date.now().toString(36);
    },

    onUserLoggedIn(user) {
        if (window.onUserLoggedIn) {
            window.onUserLoggedIn(user);
        }
    },

    onUserLoggedOut() {
        if (window.onUserLoggedOut) {
            window.onUserLoggedOut();
        }
    }
};