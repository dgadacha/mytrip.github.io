function getPriorityBadge(priority) {
    if (!priority || priority === 'normal') return '';
    
    const badges = {
        'must-do': { label: 'Must-Do' },
        'high': { label: 'Haute' },
        'low': { label: 'Basse' },
        'optional': { label: 'Optionnel' }
    };
    
    const badge = badges[priority];
    if (!badge) return '';
    
    return `<span class="priority-badge priority-${priority}-badge">${badge.label}</span>`;
}

function refreshIcons() {
    setTimeout(() => lucide.createIcons(), 50);
}

// Mapping catégorie → icône Lucide
function getCategoryIcon(type, category) {
    if (!category) return 'image-off';
    
    const categoryLower = category.toLowerCase();
    
    // Icônes pour restaurants
    if (type === 'restaurant') {
        if (categoryLower.includes('ramen')) return 'soup';
        if (categoryLower.includes('sushi') || categoryLower.includes('omakase')) return 'fish';
        if (categoryLower.includes('bbq') || categoryLower.includes('yakiniku') || categoryLower.includes('grill')) return 'flame';
        if (categoryLower.includes('tonkatsu') || categoryLower.includes('gyukatsu') || categoryLower.includes('katsu')) return 'drumstick';
        if (categoryLower.includes('teppanyaki')) return 'chef-hat';
        if (categoryLower.includes('izakaya') || categoryLower.includes('bar')) return 'beer';
        if (categoryLower.includes('café') || categoryLower.includes('coffee')) return 'coffee';
        if (categoryLower.includes('marché') || categoryLower.includes('market')) return 'shopping-basket';
        if (categoryLower.includes('street food')) return 'shopping-cart';
        if (categoryLower.includes('fruits de mer') || categoryLower.includes('seafood')) return 'fish';
        if (categoryLower.includes('poulet') || categoryLower.includes('chicken')) return 'drumstick';
        if (categoryLower.includes('coréen') || categoryLower.includes('korean')) return 'flame';
        if (categoryLower.includes('gastronomie') || categoryLower.includes('michelin')) return 'star';
        return 'utensils';
    }
    
    // Icônes pour activités
    if (type === 'activity') {
        if (categoryLower.includes('temple') || categoryLower.includes('sanctuaire') || categoryLower.includes('shrine')) return 'church';
        if (categoryLower.includes('observation') || categoryLower.includes('tower') || categoryLower.includes('tour')) return 'binoculars';
        if (categoryLower.includes('musée') || categoryLower.includes('museum') || categoryLower.includes('digital')) return 'gallery-horizontal';
        if (categoryLower.includes('shopping') || categoryLower.includes('quartier moderne')) return 'shopping-bag';
        if (categoryLower.includes('parc') || categoryLower.includes('park') || categoryLower.includes('jardin')) return 'trees';
        if (categoryLower.includes('palais') || categoryLower.includes('palace') || categoryLower.includes('château')) return 'castle';
        if (categoryLower.includes('quartier') || categoryLower.includes('district') || categoryLower.includes('village')) return 'map-pin';
        if (categoryLower.includes('onsen') || categoryLower.includes('spa')) return 'waves';
        if (categoryLower.includes('montagne') || categoryLower.includes('mountain')) return 'mountain';
        if (categoryLower.includes('plage') || categoryLower.includes('beach')) return 'waves';
        if (categoryLower.includes('point d\'intérêt')) return 'camera';
        if (categoryLower.includes('promenade') || categoryLower.includes('walk')) return 'footprints';
        if (categoryLower.includes('artistique') || categoryLower.includes('art')) return 'palette';
        return 'map-pin';
    }
    
    // Icônes pour hôtels
    if (type === 'hotel') {
        return 'bed';
    }
    
    return 'image-off';
}