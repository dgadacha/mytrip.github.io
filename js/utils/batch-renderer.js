// Render incrémental pour améliorer les performances avec beaucoup d'items
const BatchRenderer = {
    BATCH_SIZE: 20, // Nombre d'items par batch
    
    // Render par batch avec requestAnimationFrame
    renderInBatches(container, items, renderFunction, onComplete) {
        console.log(`🎨 BatchRenderer: Starting render for ${items?.length || 0} items`);
        const startTime = performance.now();
        
        if (!container) {
            console.warn('⚠️ BatchRenderer: No container found');
            return;
        }
        
        // Vider le container
        container.innerHTML = '';
        
        if (!items || items.length === 0) {
            console.log('📭 BatchRenderer: No items to render (empty state)');
            container.innerHTML = `
                <div class="empty-state">
                    <p style="color: var(--text-secondary);">Aucun élément pour le moment</p>
                </div>
            `;
            if (onComplete) onComplete();
            return;
        }
        
        let index = 0;
        let batchCount = 0;
        const fragment = document.createDocumentFragment();
        
        const renderBatch = () => {
            const endIndex = Math.min(index + this.BATCH_SIZE, items.length);
            batchCount++;
            
            console.log(`📦 Batch ${batchCount}: Rendering items ${index} to ${endIndex - 1}`);
            
            // Render un batch
            for (let i = index; i < endIndex; i++) {
                const html = renderFunction(items[i]);
                const temp = document.createElement('div');
                temp.innerHTML = html;
                fragment.appendChild(temp.firstElementChild);
            }
            
            // Ajouter au DOM
            container.appendChild(fragment.cloneNode(true));
            
            // Nettoyer le fragment pour le prochain batch
            while (fragment.firstChild) {
                fragment.removeChild(fragment.firstChild);
            }
            
            index = endIndex;
            
            // S'il reste des items, continuer
            if (index < items.length) {
                requestAnimationFrame(renderBatch);
            } else {
                // Terminé
                const endTime = performance.now();
                const duration = (endTime - startTime).toFixed(2);
                console.log(`✅ BatchRenderer: Complete! ${items.length} items in ${batchCount} batches (${duration}ms)`);
                
                if (onComplete) onComplete();
            }
        };
        
        // Démarrer le premier batch
        renderBatch();
    }
};