class PricingEngine {
    constructor(config) {
        this.config = config;
    }

    calculateQuote(options) {
        const { projectType, layout, lengths, height, brickId, columnSize, columnCount, mailboxType, estimateLevel = 'typical' } = options;
        
        // Get selected material (brick or block)
        const materialType = options.materialType || 'brick';
        const materials = materialType === 'block' ? this.config.blocks : this.config.bricks;
        const material = materials.find(m => m.id === brickId) || materials[0];
        
        // Get column and mailbox pricing
        const column = this.config.columns[columnSize] || this.config.columns['230'];
        const mailbox = this.config.mailboxes[mailboxType] || this.config.mailboxes.none;
        
        // Get estimate level multiplier
        const estimateMultiplier = this.config.estimateLevels[estimateLevel]?.multiplier || 1.0;
        
        // Calculate wall area
        let totalLength = lengths.reduce((sum, len) => sum + len, 0);
        let wallArea = totalLength * height;
        
        // Calculate wall cost using material rate
        const wallRate = material.price;
        let wallCostBase = wallArea * wallRate;
        let wallCost = wallCostBase * estimateMultiplier;
        
        // Calculate column cost using typical price
        let columnCostBase = columnCount * column.priceTypical;
        let columnCost = columnCostBase * estimateMultiplier;
        
        // Mailbox cost (not affected by estimate level)
        let mailboxCost = mailbox.price;
        
        // Subtotal
        let subtotal = wallCost + columnCost + mailboxCost;
        
        // Range calculations (min/max based on material pricing tiers)
        const minRate = materialType === 'block' ? 140 : 140;
        const maxRate = materialType === 'block' ? 280 : 420;
        let wallCostMin = wallArea * minRate * estimateMultiplier;
        let wallCostMax = wallArea * maxRate * estimateMultiplier;
        
        let columnCostMin = columnCount * column.priceMin * estimateMultiplier;
        let columnCostMax = columnCount * column.priceMax * estimateMultiplier;
        
        let totalMin = wallCostMin + columnCostMin + mailboxCost;
        let totalMax = wallCostMax + columnCostMax + mailboxCost;
        let totalAvg = subtotal;
        
        // Build detailed breakdown
        const estimateName = this.config.estimateLevels[estimateLevel]?.name || 'Typical';
        const categoryName = material.category === 'singleFaceBrick' ? 'Single Face Brick' :
                            material.category === 'doubleFaceBrick' ? 'Double Face Brick' : 'Concrete Blocks';
        
        return {
            wallArea: Math.round(wallArea * 10) / 10,
            totalLength: Math.round(totalLength * 10) / 10,
            materialName: material.name,
            materialCategory: categoryName,
            materialRate: wallRate,
            wallCostBase: Math.round(wallCostBase),
            wallCost: Math.round(wallCost),
            wallCostMin: Math.round(wallCostMin),
            wallCostMax: Math.round(wallCostMax),
            columnCount,
            columnSize: column.name,
            columnCostBase: Math.round(columnCostBase),
            columnCost: Math.round(columnCost),
            columnCostMin: Math.round(columnCostMin),
            columnCostMax: Math.round(columnCostMax),
            mailboxType: mailbox.name,
            mailboxCost,
            estimateLevel,
            estimateName,
            estimateMultiplier,
            subtotal: Math.round(subtotal),
            totalMin: Math.round(totalMin),
            totalMax: Math.round(totalMax),
            totalAvg: Math.round(totalAvg),
            breakdown: [
                { label: 'Wall Area', value: `${wallArea.toFixed(1)} m²`, type: 'area' },
                { label: 'Material', value: material.name, type: 'material' },
                { label: 'Rate', value: `$${wallRate}/m²`, type: 'rate' },
                { label: 'Wall Cost', value: `$${Math.round(wallCost).toLocaleString()}`, type: 'cost' },
                { label: 'Piers', value: `${columnCount} × ${column.name}`, type: 'piers' },
                { label: 'Pier Cost', value: `$${Math.round(columnCost).toLocaleString()}`, type: 'cost' },
                { label: 'Mailbox', value: mailbox.name, type: 'mailbox' },
                { label: 'Mailbox Cost', value: `$${mailboxCost.toLocaleString()}`, type: 'cost' },
                { label: 'Subtotal', value: `$${Math.round(subtotal).toLocaleString()}`, type: 'subtotal' },
                { label: 'Estimate Type', value: `${estimateName} (${Math.round(estimateMultiplier * 100)}%)`, type: 'estimate' },
                { label: 'Final Estimate', value: `$${Math.round(totalAvg).toLocaleString()}`, highlight: true, type: 'total' }
            ]
        };
    }

    suggestColumns(totalLength, columnSize) {
        if (columnSize === 'none') return 0;
        const spacing = columnSize === '450' ? 3 : columnSize === '350' ? 4 : 6;
        return Math.max(2, Math.ceil(totalLength / spacing) + 1);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PricingEngine;
}
