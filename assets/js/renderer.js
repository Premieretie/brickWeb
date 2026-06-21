class FenceRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.svgNS = 'http://www.w3.org/2000/svg';
    }

    render(options) {
        console.log('Renderer.render called with:', options);
        const { layout, lengths, height, brickId, columnSize, columnCount, mailboxType } = options;
        
        if (!this.container) {
            console.error('Renderer container not found!');
            return;
        }
        
        this.container.innerHTML = '';
        const svg = document.createElementNS(this.svgNS, 'svg');
        svg.setAttribute('viewBox', '0 0 400 300');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        
        this.addBackground(svg);
        
        const brick = this.getBrickStyle(brickId);
        console.log('Brick style:', brick);
        const maxLen = Math.max(...lengths);
        const scale = 320 / (maxLen * 1.5);
        console.log('Scale:', scale, 'maxLen:', maxLen);
        
        switch(layout) {
            case 'straight':
                this.renderStraight(svg, lengths[0], height, scale, brick, columnSize, columnCount, mailboxType);
                break;
            case 'l-shape':
                this.renderLShape(svg, lengths, height, scale, brick, columnSize, columnCount, mailboxType);
                break;
            case 'u-shape':
                this.renderUShape(svg, lengths, height, scale, brick, columnSize, columnCount, mailboxType);
                break;
            case 'front-returns':
                this.renderFrontReturns(svg, lengths, height, scale, brick, columnSize, columnCount, mailboxType);
                break;
            default:
                this.renderStraight(svg, lengths[0], height, scale, brick, columnSize, columnCount, mailboxType);
        }
        
        this.container.appendChild(svg);
    }

    getBrickStyle(brickId) {
        const styles = {
            'standard-red': { color: '#C75B39', dark: '#A0442A', pattern: 'standard' },
            'face-brick': { color: '#B85C38', dark: '#8B3A22', pattern: 'standard' },
            'smooth-face': { color: '#D4A574', dark: '#B8956A', pattern: 'smooth' },
            'rendered': { color: '#F5F5F0', dark: '#E8E8E0', pattern: 'smooth' },
            'feature-brick': { color: '#8B4513', dark: '#654321', pattern: 'feature' },
            'custom-brick': { color: '#A0522D', dark: '#804020', pattern: 'standard' }
        };
        return styles[brickId] || styles['standard-red'];
    }

    addBackground(svg) {
        const defs = document.createElementNS(this.svgNS, 'defs');
        const skyGrad = document.createElementNS(this.svgNS, 'linearGradient');
        skyGrad.setAttribute('id', 'sky');
        skyGrad.innerHTML = '<stop offset="0%" stop-color="#87CEEB"/><stop offset="100%" stop-color="#E0F6FF"/>';
        defs.appendChild(skyGrad);
        
        const grassGrad = document.createElementNS(this.svgNS, 'linearGradient');
        grassGrad.setAttribute('id', 'grass');
        grassGrad.innerHTML = '<stop offset="0%" stop-color="#90EE90"/><stop offset="100%" stop-color="#228B22"/>';
        defs.appendChild(grassGrad);
        svg.appendChild(defs);
        
        const sky = document.createElementNS(this.svgNS, 'rect');
        sky.setAttribute('x', '0'); sky.setAttribute('y', '0');
        sky.setAttribute('width', '400'); sky.setAttribute('height', '200');
        sky.setAttribute('fill', 'url(#sky)');
        svg.appendChild(sky);
        
        const ground = document.createElementNS(this.svgNS, 'rect');
        ground.setAttribute('x', '0'); ground.setAttribute('y', '200');
        ground.setAttribute('width', '400'); ground.setAttribute('height', '100');
        ground.setAttribute('fill', 'url(#grass)');
        svg.appendChild(ground);
    }

    createBrickPattern(id, brick, svg) {
        const defs = svg.querySelector('defs') || document.createElementNS(this.svgNS, 'defs');
        
        // Check if pattern already exists to avoid duplicates
        let existingPattern = defs.querySelector(`#${id}`);
        if (existingPattern) {
            return `url(#${id})`;
        }
        
        const pattern = document.createElementNS(this.svgNS, 'pattern');
        pattern.setAttribute('id', id);
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');
        pattern.setAttribute('width', '20');
        pattern.setAttribute('height', '10');
        
        const rect = document.createElementNS(this.svgNS, 'rect');
        rect.setAttribute('width', '19');
        rect.setAttribute('height', '9');
        rect.setAttribute('fill', brick.color);
        rect.setAttribute('stroke', brick.dark);
        rect.setAttribute('stroke-width', '0.5');
        pattern.appendChild(rect);
        
        defs.appendChild(pattern);
        if (!svg.querySelector('defs')) {
            svg.appendChild(defs);
        }
        return `url(#${id})`;
    }

    renderColumn(svg, x, y, w, h, brick) {
        const colW = Math.max(w * 0.15, 15);
        const col = document.createElementNS(this.svgNS, 'rect');
        col.setAttribute('x', x - colW/2);
        col.setAttribute('y', y - h);
        col.setAttribute('width', colW);
        col.setAttribute('height', h);
        col.setAttribute('fill', brick.dark);
        col.setAttribute('stroke', '#333');
        col.setAttribute('stroke-width', '1');
        svg.appendChild(col);
        
        const cap = document.createElementNS(this.svgNS, 'rect');
        cap.setAttribute('x', x - colW/2 - 3);
        cap.setAttribute('y', y - h - 8);
        cap.setAttribute('width', colW + 6);
        cap.setAttribute('height', 8);
        cap.setAttribute('fill', brick.color);
        cap.setAttribute('rx', '2');
        svg.appendChild(cap);
    }

    renderWall(svg, x, y, w, h, brick, patternId) {
        const wall = document.createElementNS(this.svgNS, 'rect');
        wall.setAttribute('x', x);
        wall.setAttribute('y', y - h);
        wall.setAttribute('width', w);
        wall.setAttribute('height', h);
        wall.setAttribute('fill', this.createBrickPattern(patternId, brick, svg));
        wall.setAttribute('stroke', '#333');
        wall.setAttribute('stroke-width', '1');
        svg.appendChild(wall);
        
        const coping = document.createElementNS(this.svgNS, 'rect');
        coping.setAttribute('x', x);
        coping.setAttribute('y', y - h - 5);
        coping.setAttribute('width', w);
        coping.setAttribute('height', 5);
        coping.setAttribute('fill', brick.dark);
        svg.appendChild(coping);
    }

    renderMailbox(svg, x, y, type, brick) {
        const mbW = type === 'parcel' ? 35 : type === 'pillar' ? 28 : 20;
        const mbH = type === 'parcel' ? 45 : type === 'pillar' ? 50 : 35;
        const mbD = type === 'parcel' ? 25 : type === 'pillar' ? 20 : 15;
        
        const mb = document.createElementNS(this.svgNS, 'rect');
        mb.setAttribute('x', x - mbW/2);
        mb.setAttribute('y', y - mbH);
        mb.setAttribute('width', mbW);
        mb.setAttribute('height', mbH);
        mb.setAttribute('fill', brick.color);
        mb.setAttribute('stroke', '#333');
        svg.appendChild(mb);
        
        const slot = document.createElementNS(this.svgNS, 'rect');
        slot.setAttribute('x', x - mbW/4);
        slot.setAttribute('y', y - mbH + (type === 'parcel' ? 15 : 10));
        slot.setAttribute('width', mbW/2);
        slot.setAttribute('height', type === 'parcel' ? 20 : 12);
        slot.setAttribute('fill', '#444');
        slot.setAttribute('rx', '2');
        svg.appendChild(slot);
    }

    renderStraight(svg, length, height, scale, brick, columnSize, columnCount, mailboxType) {
        const wallW = Math.min(length * scale * 20, 340);
        const wallH = Math.min(height * scale * 20, 100);
        const startX = (400 - wallW) / 2;
        const groundY = 220;
        
        this.renderWall(svg, startX, groundY, wallW, wallH, brick, 'wallPattern');
        
        const colW = columnSize === '450' ? 22 : columnSize === '350' ? 18 : 12;
        if (columnCount > 0 && columnSize !== 'none') {
            for (let i = 0; i < columnCount; i++) {
                const x = startX + (wallW * i / (columnCount - 1 || 1));
                this.renderColumn(svg, x, groundY, wallW, wallH, brick);
            }
        }
        
        if (mailboxType !== 'none') {
            const mbX = startX + wallW / 2;
            this.renderMailbox(svg, mbX, groundY, mailboxType, brick);
        }
    }

    renderLShape(svg, lengths, height, scale, brick, columnSize, columnCount, mailboxType) {
        const seg1 = Math.min(lengths[0] * scale * 18, 200);
        const seg2 = Math.min(lengths[1] * scale * 12, 100);
        const wallH = Math.min(height * scale * 20, 90);
        const startX = 80;
        const startY = 180;
        
        this.renderWall(svg, startX, startY, seg1, wallH, brick, 'wall1');
        this.renderWall(svg, startX + seg1 - wallH * 0.1, startY + seg1 * 0.3, seg2, wallH, brick, 'wall2');
        
        if (columnSize !== 'none') {
            this.renderColumn(svg, startX, startY, seg1, wallH, brick);
            this.renderColumn(svg, startX + seg1, startY, seg1, wallH, brick);
            this.renderColumn(svg, startX + seg1 + seg2 * 0.8, startY + seg2 * 0.3, seg2, wallH, brick);
        }
    }

    renderUShape(svg, lengths, height, scale, brick, columnSize, columnCount, mailboxType) {
        const sideW = Math.min(lengths[0] * scale * 1.2, 100);
        const backW = Math.min(lengths[1] * scale * 1.5, 180);
        const wallH = Math.min(height * scale * 20, 90);
        const startX = (400 - backW) / 2;
        const startY = 180;
        const depth = sideW * 0.5;
        
        this.renderWall(svg, startX, startY, backW, wallH, brick, 'back');
        this.renderWall(svg, startX, startY, wallH, depth, brick, 'left');
        this.renderWall(svg, startX + backW - wallH, startY, wallH, depth, brick, 'right');
        
        if (columnSize !== 'none') {
            this.renderColumn(svg, startX + wallH/2, startY + depth, sideW, wallH, brick);
            this.renderColumn(svg, startX + backW - wallH/2, startY + depth, sideW, wallH, brick);
        }
    }

    renderFrontReturns(svg, lengths, height, scale, brick, columnSize, columnCount, mailboxType) {
        const returnW = Math.min(lengths[0] * scale * 12, 80);
        const frontW = Math.min(lengths[1] * scale * 18, 240);
        const wallH = Math.min(height * scale * 20, 90);
        const startX = (400 - frontW) / 2;
        const startY = 190;
        
        this.renderWall(svg, startX, startY, frontW, wallH, brick, 'front');
        this.renderWall(svg, startX, startY - returnW * 0.5, returnW, wallH, brick, 'left');
        this.renderWall(svg, startX + frontW - returnW * 0.2, startY - returnW * 0.5, returnW, wallH, brick, 'right');
        
        if (columnSize !== 'none') {
            this.renderColumn(svg, startX, startY, frontW, wallH, brick);
            this.renderColumn(svg, startX + frontW, startY, frontW, wallH, brick);
        }
        
        if (mailboxType !== 'none') {
            this.renderMailbox(svg, startX + frontW/2, startY, mailboxType, brick);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FenceRenderer;
}
