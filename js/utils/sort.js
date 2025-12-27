const SortManager = {
    currentSort: 'none',

    applySorting(items) {
        const sorted = [...items];
        
        const notDone = sorted.filter(item => !item.isDone);
        const done = sorted.filter(item => item.isDone);
        
        let sortedNotDone = notDone;
        switch(this.currentSort) {
            case 'priority':
                const priorityOrder = { 'must-do': 1, 'high': 2, 'normal': 3, 'low': 4, 'optional': 5 };
                sortedNotDone = notDone.sort((a, b) => {
                    const priorityA = priorityOrder[a.priority || 'normal'];
                    const priorityB = priorityOrder[b.priority || 'normal'];
                    return priorityA - priorityB;
                });
                break;
            case 'price-asc':
                sortedNotDone = notDone.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'price-desc':
                sortedNotDone = notDone.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'name':
                sortedNotDone = notDone.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
        
        return [...sortedNotDone, ...done];
    },

    setSort(sortType) {
        this.currentSort = sortType;
    },

    getCurrentSort() {
        return this.currentSort;
    }
};