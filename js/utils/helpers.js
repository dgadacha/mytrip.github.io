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