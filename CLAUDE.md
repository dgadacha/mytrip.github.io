# 🚀 VACAYO - Documentation Projet

## 📋 Vue d'ensemble

**Vacayo** est une application web collaborative de planification de voyages avec Firebase, adoptant un design minimaliste Apple en mode clair.

**Tagline :** "Your trips, on a timeline"

---

## 🎯 Concept & Vision

### Objectif principal
Créer un **trip planner multi-voyages collaboratif** avec partage en temps réel et gestion des permissions.

### Positionnement
- Alternative moderne à TripIt, Wanderlog
- **Collaboration temps réel** avec système de permissions
- Focus mobile-first avec interface épurée
- Multi-utilisateurs avec invitations par email
- Cible : voyageurs francophones

### Modèle économique envisagé
**Freemium :**
- ✅ Gratuit : Voyages illimités, collaboration basique
- 💎 Pro ($7-9/mois) : Export PDF, analytics, priorité support
- 🚀 Unlimited ($15/mois) : Features premium + API access

---

## 🏗️ Architecture Technique

### Stack actuel
- **Frontend :** HTML5 + CSS3 + JavaScript vanilla (architecture modulaire)
- **Backend :** Firebase (Firestore + Authentication)
- **Auth :** Email/Password (style Apple login)
- **Database :** Firestore (structure multi-voyages)
- **Icons :** Lucide Icons (open-source, style Apple)
- **Hosting :** GitHub Pages (https://dgadacha.github.io/mytrip.github.io/)

### Structure Firebase

#### **Collections Firestore**
```javascript
// Collection: users
{
  "userId": {
    email: "user@example.com",
    displayName: "John Doe",
    createdAt: Timestamp,
    lastLogin: Timestamp
  }
}

// Collection: trips
{
  "tripId": {
    name: "Japon 2026",
    ownerId: "userId",
    participants: {
      "userId1": "owner",
      "userId2": "editor",
      "userId3": "viewer"
    },
    createdAt: Timestamp,
    updatedAt: Timestamp
  }
}

// Collection: activities
{
  "activityId": {
    tripId: "tripId",
    name: "Sushi Tokami",
    city: "Tokyo - Ginza",
    category: "Omakase",
    price: 20000,
    date: "2026-01-10T19:00",
    endDate: "2026-01-10T21:00",  // Pour les hôtels
    priority: "high",
    googleMapsUrl: "...",
    photoUrl: "...",
    notes: "...",
    isBooked: true,
    bookingUrl: "...",
    isDone: false,
    type: "hotel|restaurant|activity",
    createdBy: "userId",
    createdAt: Timestamp,
    updatedAt: Timestamp
  }
}

// Collection: invitations
{
  "invitationId": {
    tripId: "tripId",
    email: "invitee@example.com",
    role: "editor|viewer",
    invitedBy: "userId",
    status: "pending|accepted|declined",
    createdAt: Timestamp
  }
}
```

#### **Règles de sécurité Firestore**
```javascript
// Actuellement : Rules permissives pour développement
// Production : Validation stricte selon rôles
match /trips/{tripId} {
  allow read: if request.auth != null && 
              request.auth.uid in resource.data.participants.keys();
  allow write: if request.auth != null && 
               resource.data.participants[request.auth.uid] in ['owner', 'editor'];
}
```

### Architecture modulaire (sans modules ES6)
```
/
├── login.html                  # Page de connexion
├── trips.html                  # Liste des voyages
├── trip.html                   # Détail d'un voyage
├── styles.css                  # Styles globaux
├── js/
│   ├── models/
│   │   ├── Activity.js         # Classe Activity (hotel/restaurant/activity)
│   │   └── Trip.js             # Classe Trip avec méthodes permissions
│   ├── services/
│   │   └── firebase.js         # Service Firebase (auth + Firestore)
│   ├── ui/
│   │   ├── theme.js            # Gestion du thème
│   │   ├── modal.js            # Gestion des modals
│   │   └── navigation.js       # Tabs, bottom nav, FAB
│   ├── components/
│   │   ├── dashboard.js        # Stats dashboard
│   │   ├── list.js             # Rendu listes
│   │   └── calendar.js         # Calendrier avec hôtels multi-nuits
│   ├── utils/
│   │   ├── helpers.js          # Fonctions utilitaires
│   │   └── sort.js             # Tri et filtrage
│   ├── login.js                # Logique page login
│   ├── trips.js                # Logique liste voyages
│   └── trip.js                 # Logique détail voyage
└── CLAUDE.md                   # Cette documentation
```

### Classe principale (v3.0 Firebase)

#### **Activity.js** (3 types : hotel/restaurant/activity)
```javascript
class Activity {
  constructor({
    id,
    name,
    city,
    category,
    price,
    date,           // Date de début (check-in pour hôtels)
    endDate,        // Date de fin (check-out pour hôtels)
    priority,
    googleMapsUrl,
    photoUrl,
    notes,
    isBooked,
    bookingUrl,
    isDone,
    type,           // 'hotel' | 'restaurant' | 'activity'
    tripId,
    createdBy,
    createdAt,
    updatedAt
  })
}
```

#### **Trip.js** (avec gestion permissions)
```javascript
class Trip {
  constructor({
    id,
    name,
    ownerId,
    participants,   // { userId: 'owner|editor|viewer' }
    createdAt,
    updatedAt
  })
  
  // Méthodes utilitaires
  isOwner()           // Vérifie si user courant est owner
  canEdit()           // Vérifie si user peut éditer (owner ou editor)
  canView()           // Vérifie si user peut voir (tous roles)
  myRole              // Getter du rôle de l'utilisateur courant
}
```

### Système de permissions

#### **Rôles disponibles**
- **Owner** : Créateur du voyage, tous les droits + invitations
- **Editor** : Peut ajouter/modifier/supprimer des activités
- **Viewer** : Lecture seule (consultation uniquement)

#### **Matrice des permissions**
| Action | Owner | Editor | Viewer |
|--------|-------|--------|--------|
| Voir le voyage | ✅ | ✅ | ✅ |
| Ajouter activité | ✅ | ✅ | ❌ |
| Modifier activité | ✅ | ✅ | ❌ |
| Supprimer activité | ✅ | ✅ | ❌ |
| Inviter participants | ✅ | ❌ | ❌ |
| Supprimer voyage | ✅ | ❌ | ❌ |
| Export/Import | ✅ | ✅ | ❌ |

#### **UI adaptative selon rôle**
- **Viewers** : FAB caché, banner "Mode lecture seule", boutons d'action masqués
- **Editors** : CRUD complet sur activités
- **Owners** : Bouton "Inviter" visible + toutes permissions

### Modules Firebase

#### **FirebaseService** (js/services/firebase.js)
```javascript
// Authentification
- initialize()
- login(email, password)
- logout()
- getCurrentUser()

// Trips
- createTrip(name)
- getMyTrips()
- getTrip(tripId)
- deleteTrip(tripId)

// Activities
- addActivity(tripId, activityData)
- getTripActivities(tripId)
- updateActivity(tripId, activityId, data)
- deleteActivity(tripId, activityId)

// Invitations
- inviteParticipant(tripId, email, role)
- getMyInvitations()
- acceptInvitation(invitationId)
- declineInvitation(invitationId)
```

### Navigation entre pages
```
login.html
  ↓ (auth réussie)
trips.html (liste voyages + invitations)
  ↓ (clic sur voyage)
trip.html?id=xxx (détail voyage)
```

### Ordre de chargement des scripts (CRITIQUE)

#### **login.html**
```html
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="js/services/firebase.js"></script>
<script src="js/ui/theme.js"></script>
<script src="js/login.js"></script>
```

#### **trips.html**
```html
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
<script src="js/models/Trip.js"></script>
<script src="js/services/firebase.js"></script>
<script src="js/ui/theme.js"></script>
<script src="js/trips.js"></script>
```

#### **trip.html**
```html
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
<script src="js/utils/helpers.js"></script>
<script src="js/models/Activity.js"></script>
<script src="js/models/Trip.js"></script>
<script src="js/services/firebase.js"></script>
<script src="js/utils/sort.js"></script>
<script src="js/ui/theme.js"></script>
<script src="js/ui/modal.js"></script>
<script src="js/ui/navigation.js"></script>
<script src="js/components/dashboard.js"></script>
<script src="js/components/list.js"></script>
<script src="js/components/calendar.js"></script>
<script src="js/trip.js"></script>
```

---

## 🎨 Design System Vacayo v3.0 (Apple Minimaliste + Firebase)

### Palette de couleurs (Apple Style)

**Bleus Apple :**
- Primary Blue (Light): `#007AFF` (iOS blue)
- Primary Blue (Dark): `#0A84FF` (iOS dark blue)
- Accent Blue: `#5AC8FA` (Cyan)

**Neutres :**
- BG Primary (Light): `#FFFFFF` (True white)
- BG Primary (Dark): `#000000` (True black)
- BG Secondary (Light): `#F5F5F7` (Off-white)
- BG Secondary (Dark): `#1C1C1E` (Dark gray)

**Textes :**
- Text Primary: Dynamique selon theme
- Text Secondary: `#8E8E93` (Gray)
- Border Color: `rgba(0,0,0,0.06)` light

**Accents :**
- Success: `#34C759` (iOS green)
- Warning: `#FF9F0A` (iOS orange)
- Error: `#FF3B30` (iOS red)

### Typographie
- **Police :** `-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif`
- **Logo :** Inter 700 avec gradient bleu
- **Titres :** SF Pro Display 600

### Principes de design
✅ **Minimalisme Apple** - Design épuré
✅ **Mode clair par défaut** - Dark mode disponible
✅ **Mobile-first** - Optimisé pour mobile
✅ **Icons Lucide** - Icônes flat modernes
✅ **Login Apple-style** - Email/Password épuré

---

## ✨ Features Implémentées (v3.0 Firebase)

### 1. Authentification & Multi-utilisateurs
- ✅ **Login Apple-style** : Email + Password avec design épuré
- ✅ **Création de compte** automatique
- ✅ **Logout** fonctionnel
- ✅ **Protection des routes** : Redirection si non authentifié
- ✅ **Persistence** : Session maintenue entre rechargements

### 2. Gestion Multi-voyages
- ✅ **Page trips.html** : Liste de tous les voyages de l'utilisateur
- ✅ **Création de voyage** : Modal + formulaire simple
- ✅ **Suppression de voyage** : Confirmation double
- ✅ **Filtres** : Mes voyages / Partagés avec moi
- ✅ **Accès direct** : Clic sur card → trip.html?id=xxx

### 3. Système de collaboration

#### **Invitations**
- ✅ **Inviter par email** : Bouton visible uniquement pour owners
- ✅ **Choix du rôle** : Editor ou Viewer
- ✅ **Notifications** : Badge rouge sur trips.html si invitations
- ✅ **Accepter/Refuser** : Modal dédiée pour gérer les invitations
- ✅ **Feedback utilisateur** : Messages de succès/erreur

#### **Permissions en temps réel**
- ✅ **UI adaptative** : FAB/boutons masqués selon rôle
- ✅ **Banner lecture seule** : Message pour viewers
- ✅ **Vérifications côté client** : Empêche actions non autorisées
- ✅ **Classe Trip** : Méthodes `isOwner()`, `canEdit()`, `canView()`

### 4. Types d'activités (3 types)

#### **Hôtels** 🏨
- ✅ **Plage de dates** : Date début (check-in) + date fin (check-out)
- ✅ **Calendrier intelligent** : Génération automatique d'une entrée par nuit
- ✅ **Affichage** : "Nuit 1/5", "Nuit 2/5", etc.
- ✅ **Horaires** : 
  - Nuit 1 : "Check-in 14:00"
  - Nuits intermédiaires : "Toute la journée"
  - Dernière nuit : "Check-out 11:00"
- ✅ **Budget** : Prix compté une seule fois (pas multiplié par nuits)
- ✅ **Modal détail** : Affiche Check-in et Check-out séparément

#### **Restaurants** 🍽️
- ✅ **Date unique** : Réservation avec heure
- ✅ **Catégorie** : Type de cuisine
- ✅ **Prix** : Budget en ¥
- ✅ **Réservation** : Checkbox + lien booking

#### **Activités** 🎯
- ✅ **Date unique** : Planification avec heure
- ✅ **Catégorie** : Type d'activité
- ✅ **Prix** : Coût en ¥
- ✅ **Réservation** : Checkbox + lien booking

### 5. Organisation des vues

#### **Onglets principaux**
- **Hôtels** : Liste des hébergements
- **Restaurants** : Liste des restaurants
- **Activités** : Liste des activités
- **Calendrier** : Timeline horizontale par jour

#### **Dashboard (4 stats)**
- **Hôtels** : Nombre d'hôtels
- **Restaurants** : Nombre de restaurants
- **Activités** : Nombre d'activités
- **Budget** : Somme des prix (items avec date uniquement)

#### **Filtres & Recherche**
- ✅ **Recherche** : Dans nom, ville, notes
- ✅ **Filtre ville** : Dropdown avec hiérarchie (Tokyo → Tokyo - Shibuya)
  - "Tokyo" filtre "Tokyo", "Tokyo - Shibuya", "Tokyo - Ginza"
  - "Tokyo - Shibuya" filtre uniquement "Tokyo - Shibuya"
- ✅ **Tri** : Par défaut, priorité, prix, nom A-Z
- ✅ **Items done** : Affichés en dernier avec opacité réduite
- ✅ **Persistence des filtres** : Les filtres restent actifs après ajout/modification/suppression

### 6. Calendrier Timeline (Instagram-style)

#### **Fonctionnalités**
- ✅ **Scroll horizontal** : Swipe entre jours
- ✅ **Auto-scroll vers aujourd'hui** : Au chargement et retour sur onglet
- ✅ **Header de jour** : Jour de semaine + Numéro + Mois
- ✅ **Cards empilées** verticalement par jour
- ✅ **Hôtels multi-nuits** : Une card par nuit avec indication
- ✅ **Pas d'indicateurs** : Interface épurée sans points

#### **Affichage des horaires**
- Restaurants/Activités : "19:00"
- Hôtel nuit 1 : "Check-in 14:00"
- Hôtel nuits intermédiaires : "Toute la journée"
- Hôtel dernière nuit : "Check-out 11:00"

### 7. Modals & Formulaires

#### **Formulaire d'ajout/édition**
- ✅ **Un seul formulaire** pour les 3 types
- ✅ **Champs adaptatifs** : Labels changent selon type
- ✅ **Date de fin** : Visible uniquement pour hôtels
- ✅ **Checkbox "Réservé"** : Toujours visible (n'affecte plus l'affichage des dates)
- ✅ **Validation** : Date de fin après date de début pour hôtels

#### **Quick Date Modal** 📅
- ✅ **Bouton rapide** : Icône calendrier sur chaque card (bleu si date définie)
- ✅ **Modal dédiée** : Définir date rapidement sans ouvrir formulaire complet
- ✅ **Adaptatif** : 
  - Hôtels : Date début + Date fin
  - Restaurants/Activités : Date unique
- ✅ **Validation** : Date fin après date début
- ✅ **Actions** : ✓ Enregistrer / 🗑️ Supprimer / ✕ Annuler

#### **Modal détail**
- ✅ **Affichage adaptatif** : Check-in/Check-out pour hôtels, Date pour restaurants/activités
- ✅ **Retours à la ligne** : `white-space: pre-line` pour afficher les notes avec retours à la ligne
- ✅ **Labels adaptés** : "Type de cuisine" pour restaurants, "Nom de l'hôtel" pour hôtels, "Catégorie" pour activités
- ✅ **Permissions** : Boutons Modifier/Supprimer masqués pour viewers

#### **Modal invitations**
- ✅ **Champ email** : Input email avec validation
- ✅ **Choix rôle** : Editor / Viewer
- ✅ **Feedback** : Messages succès/erreur inline
- ✅ **Envoi** : Bouton avec loader pendant requête

### 8. Cards Design (Uniforme)
- ✅ **Photo full-width** en haut (140px)
- ✅ **Badge priorité** : Position absolute top-left
- ✅ **Structure** : Titre / Ville / Notes (ellipsis 2 lignes) / Prix
- ✅ **Boutons toujours en bas** : Même sans notes grâce à flexbox
- ✅ **Séparateur visuel** : Ligne au-dessus des boutons
- ✅ **Retours à la ligne** : Notes affichées avec `white-space: pre-line`
- ✅ **Boutons actions** :
  - Items non faits : ✓ Fait + 📅 Date + 📍 Maps + 🔗 Réservation
  - Items faits : ↩ Annuler (pleine largeur)
- ✅ **Quick Date** : Bouton 📅 (gris ou bleu selon présence date)

### 9. Bottom Navigation (Mobile)
- ✅ **4 onglets** : Hôtels / Restaurants / Activités / Calendrier
- ✅ **Icons Lucide** avec labels
- ✅ **Fixed bottom** avec backdrop blur
- ✅ **Active state** : Highlight bleu

### 10. FAB Menu
- ✅ **Bouton rond** : Icône "+" en bas à droite
- ✅ **Menu déroulant** : 3 options (Hôtel / Restaurant / Activité)
- ✅ **Fermeture auto** : Clic extérieur ou sélection option
- ✅ **Masqué** : Pour viewers (lecture seule)

### 11. Export/Import
- ✅ **Export JSON** : Téléchargement avec nom du voyage
- ✅ **Import JSON** : Upload fichier + merge avec données existantes
- ✅ **Structure** : Inclut hotels, restaurants, activities
- ✅ **Permissions** : Réservé aux owners et editors

### 12. Settings Modal
- ✅ **Export** : Bouton avec icône download
- ✅ **Import** : Bouton avec icône upload
- ✅ **Clear all** : Suppression toutes activités (confirmation double)
- ✅ **Permissions** : Vérifie rôle avant actions

### 13. Dark Mode
- ✅ **Toggle** : Icône soleil/lune dans header
- ✅ **True black** : #000000 en dark mode
- ✅ **Persistence** : Sauvegarde dans localStorage
- ✅ **Mode clair par défaut**

---

## 🔧 Fonctionnalités Techniques Avancées

### Auto-scroll calendrier
- ✅ **Au chargement** : Scroll vers aujourd'hui si date existe
- ✅ **Au retour sur onglet** : Re-scroll vers aujourd'hui
- ✅ **Smooth scroll** : Animation fluide
- ✅ **Détection** : Compare date du jour avec data-date des cards

### Gestion des hôtels multi-nuits
```javascript
// Logique d'éclatement
const expandHotelDates = (hotel) => {
  if (!hotel.endDate) return [hotel];
  
  const items = [];
  let currentDate = new Date(hotel.date);
  const endDate = new Date(hotel.endDate);
  
  while (currentDate < endDate) {
    items.push({
      ...hotel,
      date: currentDate.toISOString(),
      _isHotelNight: true,
      _nightNumber: items.length + 1,
      _totalNights: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return items;
};
```

### Filtre ville amélioré
```javascript
// Tokyo → Tokyo, Tokyo - Shibuya, Tokyo - Ginza
// Tokyo - Shibuya → Tokyo - Shibuya uniquement
const matchesCity = !cityFilter || 
  item.city === cityFilter || 
  item.city.startsWith(cityFilter + ' - ');
```

### Budget intelligent
```javascript
// Budget = somme uniquement des items avec date (au calendrier)
const itemsWithDate = [...hotels, ...restaurants, ...activities]
  .filter(item => item.date);
const totalBudget = itemsWithDate.reduce((sum, item) => sum + (item.price || 0), 0);
```

### Vérification permissions
```javascript
// Avant chaque action sensible
if (!currentTrip.canEdit()) {
  alert('Vous n\'avez pas la permission');
  return;
}
```

### Gestion intelligente des filtres
```javascript
// renderAll() appelle toujours filterItems() pour préserver les filtres actifs
renderAll() {
    this.updateCityFilter();  // Met à jour les villes disponibles
    this.filterItems();       // Réapplique les filtres actifs
    Dashboard.update(this.hotels, this.restaurants, this.activities);
}
```

### Cards avec boutons toujours en bas
```css
/* Timeline cards dans les listes */
.items-list .timeline-card {
    min-height: 320px;
    display: flex;
    flex-direction: column;
}

.items-list .timeline-card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.items-list .timeline-card-actions {
    margin-top: auto;
    padding: 12px;
    border-top: 1px solid var(--border-color);
}
```

---

## 📂 Structure de données (v3.0 Firebase)

### Trip
```json
{
  "id": "trip_abc123",
  "name": "Japon 2026",
  "ownerId": "user_xyz789",
  "participants": {
    "user_xyz789": "owner",
    "user_def456": "editor",
    "user_ghi012": "viewer"
  },
  "createdAt": "2025-12-27T10:00:00Z",
  "updatedAt": "2025-12-27T15:30:00Z"
}
```

### Activity (Hotel)
```json
{
  "id": "activity_hotel123",
  "tripId": "trip_abc123",
  "name": "Hyatt Regency Tokyo",
  "city": "Tokyo - Shinjuku",
  "category": "Business Hotel",
  "price": 150000,
  "date": "2026-01-10T14:00",
  "endDate": "2026-01-15T11:00",
  "priority": "normal",
  "googleMapsUrl": "https://...",
  "photoUrl": "https://...",
  "notes": "Proche de la gare\nVue sur le parc",
  "isBooked": true,
  "bookingUrl": "https://...",
  "isDone": false,
  "type": "hotel",
  "createdBy": "user_xyz789",
  "createdAt": "2025-12-27T10:00:00Z",
  "updatedAt": "2025-12-27T15:30:00Z"
}
```

### Activity (Restaurant)
```json
{
  "id": "activity_resto123",
  "tripId": "trip_abc123",
  "name": "Sushi Tokami",
  "city": "Tokyo - Ginza",
  "category": "Omakase",
  "price": 20000,
  "date": "2026-01-10T19:00",
  "endDate": "",
  "priority": "high",
  "googleMapsUrl": "https://...",
  "photoUrl": "https://...",
  "notes": "Réservation 1 mois avant\nComptoir uniquement",
  "isBooked": false,
  "bookingUrl": "https://...",
  "isDone": false,
  "type": "restaurant",
  "createdBy": "user_xyz789",
  "createdAt": "2025-12-27T10:00:00Z",
  "updatedAt": "2025-12-27T15:30:00Z"
}
```

### Invitation
```json
{
  "id": "invite_abc123",
  "tripId": "trip_abc123",
  "email": "friend@example.com",
  "role": "editor",
  "invitedBy": "user_xyz789",
  "status": "pending",
  "createdAt": "2025-12-27T10:00:00Z"
}
```

---

## 🚀 Roadmap - Prochaines étapes

### 🎯 Optimisations Firebase (PRIORITÉ #1)

**Problèmes identifiés :**
- ❌ Firestore persistence activée → Cache invitations périmées
- ❌ Pas de règles de sécurité strictes
- ❌ Pas d'indexes pour queries complexes

**Actions à faire :**
1. ✅ Désactiver persistence : `firebase.firestore().settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED })`
2. ⏳ Implémenter règles de sécurité strictes
3. ⏳ Créer indexes Firestore pour queries
4. ⏳ Optimiser queries (pagination, limits)
5. ⏳ Implémenter listeners temps réel (onSnapshot)

### 📊 TOP 5 Next Features

#### 1. Listeners temps réel ⭐
```javascript
// Mise à jour automatique quand un participant modifie
firebase.firestore()
  .collection('activities')
  .where('tripId', '==', tripId)
  .onSnapshot(snapshot => {
    // Refresh UI automatique
  });
```

#### 2. Budget Tracker 💰
```
Budget utilisé : 125,000¥ / 500,000¥
[████████░░░░░░░░] 25%
```
- Progress bar visuelle
- Alerte si dépassement
- Budget par catégorie (hôtels/restos/activités)

#### 3. Notifications 🔔
- Badge sur trips.html pour nouvelles invitations
- Notifications Firebase Cloud Messaging
- Alertes conflits horaires
- Reminders avant réservations

#### 4. Itinéraire optimisé 🗺️
- Calculer meilleur ordre de visite
- Google Maps API integration
- Temps de trajet entre lieux
- Détection conflits horaires

#### 5. PWA & Offline Mode 📱
- Service Worker
- Manifest.json
- Cache des données
- Sync quand retour online

---

### 🎨 Améliorations UX (Nice to have)

**Micro-interactions :**
- ⏳ Pull to refresh
- ⏳ Skeleton loaders
- ⏳ Swipe pour marquer comme fait
- ⏳ Animations d'entrée des cards

**Features collaboration :**
- ⏳ Voir qui est en ligne
- ⏳ Avatar des participants
- ⏳ Historique des modifications
- ⏳ Commentaires sur activités

**Export amélioré :**
- ⏳ Export PDF avec itinéraire
- ⏳ Export iCalendar (.ics)
- ⏳ Partage lien public read-only

---

## 📱 Deployment

### GitHub Pages (Actuel)
- **URL :** https://dgadacha.github.io/mytrip.github.io/
- **Domaine Firebase autorisé :** dgadacha.github.io
- **Config :** Firebase SDK chargé depuis CDN

### Firebase Hosting (Recommandé)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

**Avantages :**
- Domaine custom gratuit
- SSL automatique
- CDN mondial
- Rollback facile

---

## 🎁 Features Premium (Future)

Pour version payante :
- 💰 **Budget avancé** : Catégories, analytiques, prévisions
- 🗺️ **Map view** : Carte interactive avec tous les points
- 📸 **Upload photos** : Stockage Firebase Storage
- 🤖 **AI suggestions** : Recommendations intelligentes
- 📊 **Analytics** : Stats détaillées du voyage
- 🎒 **Packing list** : Checklist automatique
- 💸 **Split costs** : Partage frais entre participants
- 📄 **Export PDF Pro** : Itinéraire complet avec map

---

## 🐛 Bugs connus & Limitations

### Limitations actuelles
- ⚠️ **Persistence Firestore activée** : Cache peut être obsolète
- ⚠️ **Pas de listeners temps réel** : Refresh manuel nécessaire
- ⚠️ **Règles Firestore permissives** : Sécurité à renforcer
- ⚠️ **Pas de pagination** : Problème si beaucoup d'items
- ⚠️ **Pas de gestion conflits** : Si 2 users modifient en même temps

### Points d'attention
- Firebase quotas gratuits : 50k reads/day, 20k writes/day
- Authentification email uniquement (pas Google/Apple OAuth)
- Pas de backup automatique des données
- Pas de logs d'audit des modifications

---

## 💡 Décisions de design importantes

### Pourquoi Firebase ?
- Backend temps réel sans serveur
- Authentification incluse
- Scalabilité automatique
- Free tier généreux
- Hosting inclus

### Pourquoi Email/Password ?
- Plus simple à implémenter
- Pas de dépendance externe (Google/Apple)
- Contrôle total sur l'auth
- OAuth ajoutables plus tard

### Pourquoi système de permissions ?
- Collaboration sécurisée
- Flexibilité des rôles
- Protection des données
- UX adaptative selon droits

### Pourquoi 3 types d'items ?
- **Hôtels** : Besoin spécifique plage de dates
- **Restaurants** : Catégorie cuisine spécifique
- **Activités** : Catégorie générique
- Séparation logique dans les onglets

### Pourquoi Quick Date Modal ?
- **Rapidité** : Pas besoin d'ouvrir formulaire complet
- **UX fluide** : Action directe depuis la card
- **Visuel** : Bouton 📅 indique présence de date
- **Mobile-friendly** : Moins de champs = plus simple

### Pourquoi pas de points indicateurs ?
- **Interface épurée** : Moins de clutter visuel
- **Scroll naturel** : Geste mobile habituel
- **Focus contenu** : Pas de distraction

### Pourquoi auto-scroll aujourd'hui ?
- **Contexte immédiat** : Voir ce qui est prévu aujourd'hui
- **Navigation rapide** : Pas besoin de scroller manuellement
- **UX familière** : Comme Google Calendar

### Pourquoi renderAll() appelle filterItems() ?
- **Persistence des filtres** : Les filtres restent actifs après modifications
- **UX cohérente** : Pas de surprise pour l'utilisateur
- **Code centralisé** : Un seul endroit pour gérer le rendu
- **Moins de bugs** : Pas besoin de se rappeler d'appeler filterItems() partout

---

## 🔧 Comment continuer le projet

### Si tu reprends le projet dans une nouvelle conversation :

1. **Lire ce fichier CLAUDE.md** pour comprendre le contexte
2. **Charger les fichiers principaux** :
   - Structure Firebase (collections, règles)
   - `trip.html` + `trip.js` (cœur de l'app)
   - `js/services/firebase.js`
   - `js/models/Activity.js` et `Trip.js`
3. **Tester l'app** sur GitHub Pages
4. **Vérifier Firebase Console** : Données Firestore, Auth, Rules

### Prochaines tâches suggérées (par ordre de priorité) :

**Phase 1 - Optimisations Firebase (Critique)**
1. ✅ Désactiver persistence Firestore
2. Implémenter listeners temps réel (onSnapshot)
3. Règles de sécurité strictes
4. Indexes Firestore
5. Pagination des listes

**Phase 2 - Features Collaboration**
1. Voir participants en ligne
2. Avatar des users
3. Historique modifications
4. Commentaires sur activités
5. Notifications push

**Phase 3 - Smart Features**
1. Budget tracker avancé
2. Itinéraire optimisé
3. Météo intégrée
4. Conflits horaires
5. Reminders automatiques

**Phase 4 - PWA**
1. Service Worker
2. Manifest.json
3. Offline mode
4. Install prompt
5. Background sync

---

## 📚 Ressources & Références

### Design
- **Inspiration** : Apple iOS, Instagram, Notion
- **Icons** : Lucide Icons (https://lucide.dev)
- **Fonts** : SF Pro Display (Apple system fonts)

### Technique
- **Firebase** : Firestore + Authentication + Hosting
- **Vanilla JS** : Pas de framework
- **Mobile-first** : CSS Grid + Flexbox
- **GitHub Pages** : Hosting actuel

### Concurrents
- TripIt ($49/an) - Complexe
- Wanderlog (gratuit) - UI datée
- Google Trips (mort) - Opportunité

---

## 📞 Contact & Maintenance

**Créateur :** Dylan  
**Date de création :** Décembre 2025  
**Dernière mise à jour :** 27 décembre 2025  
**Version actuelle :** v3.1 (Optimisations UX + Filtres persistants)

---

## 🎯 Philosophie du projet

> "Simple, collaboratif, intelligent. Un trip planner qui connecte les voyageurs."

**Principes :**
- Mobile-first toujours
- Design Apple minimaliste
- Collaboration fluide
- Performance avant tout
- UX intuitive
- Privacy-first
- Code maintenable

**Non-négociables :**
- Pas de tracking utilisateur (hors analytics basiques)
- Pas de pub
- Open source potentiel
- Design cohérent
- Architecture modulaire
- Sécurité des données

---

## ✅ Checklist MVP v3.1

### Core Features
- [x] Authentification Firebase
- [x] Multi-voyages
- [x] 3 types d'items (hotel/restaurant/activity)
- [x] Système de permissions (owner/editor/viewer)
- [x] Invitations par email
- [x] Hôtels multi-nuits
- [x] Quick Date Modal
- [x] Calendrier auto-scroll
- [x] Export/Import JSON
- [x] Dark mode
- [x] Mobile-first design
- [x] Filtres persistants
- [x] Boutons cards toujours en bas
- [x] Retours à la ligne dans notes

### À faire
- [ ] Listeners temps réel
- [ ] Règles Firestore strictes
- [ ] Budget tracker
- [ ] PWA
- [ ] OAuth (Google/Apple)
- [ ] Notifications
- [ ] Export PDF

---

## 🎨 Design Changelog

### v3.1 (27 décembre 2025) - Optimisations UX + Filtres persistants
- ✅ **Filtres persistants** : Les filtres restent actifs après ajout/modification/suppression
- ✅ **Boutons cards toujours en bas** : Flexbox pour forcer les boutons en bas même sans notes
- ✅ **Retours à la ligne notes** : `white-space: pre-line` pour afficher les sauts de ligne
- ✅ **Modal détail hôtels** : Affichage séparé Check-in et Check-out
- ✅ **Architecture centralisée** : `renderAll()` appelle toujours `filterItems()` pour cohérence
- ✅ **Fix filtre ville** : Mise à jour automatique de la liste des villes disponibles
- ✅ **Séparateur visuel** : Ligne au-dessus des boutons d'action dans les cards

### v3.0 (27 décembre 2025) - Firebase Multi-voyages + Collaboration
- ✅ Migration complète vers Firebase (Firestore + Auth)
- ✅ Architecture multi-voyages avec trips.html
- ✅ Système de permissions (owner/editor/viewer)
- ✅ Invitations par email avec acceptation/refus
- ✅ 3 types d'items : hotel/restaurant/activity
- ✅ Hôtels avec plage de dates (check-in/check-out)
- ✅ Calendrier intelligent (hôtels multi-nuits)
- ✅ Quick Date Modal (ajout date rapide)
- ✅ Auto-scroll calendrier vers aujourd'hui
- ✅ Filtre ville hiérarchique (Tokyo → Tokyo - Shibuya)
- ✅ Budget intelligent (items datés uniquement)
- ✅ UI adaptative selon permissions
- ✅ Banner lecture seule pour viewers
- ✅ Checkbox "Réservé" toujours visible

### v2.1 (26 décembre 2025) - Refacto Architecture
- ✅ Architecture modulaire sans ES6
- ✅ Classe unique Activity
- ✅ LocalStorage uniquement

### v2.0 (25 décembre 2025) - Apple Redesign
- ✅ Design Apple minimaliste
- ✅ Timeline Instagram
- ✅ Cards photo en haut

### v1.0 (Décembre 2025) - MVP Initial
- ✅ Flat Design
- ✅ FAB menu
- ✅ Dashboard stats

---

**FIN DU DOCUMENT**

*Ce fichier doit être lu en entier avant de continuer le développement du projet.*