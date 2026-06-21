class FenceRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.fenceGroup = null;
        this.init();
    }

    init() {
        if (!this.container) {
            console.error('Container not found:', containerId);
            return;
        }

        const width = this.container.clientWidth || 400;
        const height = this.container.clientHeight || 300;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 20, 100);

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(10, 8, 15);
        this.camera.lookAt(0, 2, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Controls
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.minDistance = 5;
            this.controls.maxDistance = 50;
            this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent going below ground
            this.controls.target.set(0, 2, 0);
        }

        // Lighting
        this.setupLighting();

        // Ground
        this.createGround();

        // Animation loop
        this.animate();

        // Handle resize
        window.addEventListener('resize', () => this.onResize());
    }

    setupLighting() {
        // Ambient
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional (sun)
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 50;
        dirLight.shadow.camera.left = -20;
        dirLight.shadow.camera.right = 20;
        dirLight.shadow.camera.top = 20;
        dirLight.shadow.camera.bottom = -20;
        this.scene.add(dirLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-10, 10, -10);
        this.scene.add(fillLight);
    }

    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x90EE90,
            roughness: 0.8,
            metalness: 0.1
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    getBrickMaterial(brickId, texture = 'standard') {
        // 2026 Australian masonry materials with visual differentiation
        const materialData = {
            // Single Face Brick - Rougher texture, traditional
            'single-face-economy': { color: 0xC75B39, roughness: 0.9, metalness: 0.0 },
            'single-face-standard': { color: 0xB85C38, roughness: 0.85, metalness: 0.0 },
            'single-face-premium': { color: 0xA0522D, roughness: 0.8, metalness: 0.0 },
            'single-face-deluxe': { color: 0x8B4513, roughness: 0.75, metalness: 0.0 },
            'single-face-luxury': { color: 0xD2691E, roughness: 0.7, metalness: 0.0 },
            // Double Face Brick - Smoother both sides
            'double-face-economy': { color: 0xCD853F, roughness: 0.75, metalness: 0.0 },
            'double-face-standard': { color: 0xDEB887, roughness: 0.7, metalness: 0.0 },
            'double-face-premium': { color: 0xF4A460, roughness: 0.65, metalness: 0.0 },
            'double-face-deluxe': { color: 0xD2691E, roughness: 0.6, metalness: 0.0 },
            'double-face-luxury': { color: 0xBC8F8F, roughness: 0.55, metalness: 0.0 },
            // Blocks - Grey tones, modern
            'split-face-90': { color: 0x9CA3AF, roughness: 0.95, metalness: 0.0 },
            'smooth-90-grey': { color: 0x6B7280, roughness: 0.5, metalness: 0.05 },
            'smooth-140-grey': { color: 0x4B5563, roughness: 0.45, metalness: 0.05 },
            'smooth-190-grey': { color: 0x374151, roughness: 0.4, metalness: 0.05 },
            'smooth-190-colour': { color: 0xD1D5DB, roughness: 0.4, metalness: 0.05 },
            'split-face-190': { color: 0x1F2937, roughness: 0.9, metalness: 0.0 },
            // Legacy fallbacks
            'standard-red': { color: 0xC75B39, roughness: 0.9, metalness: 0.0 },
            'face-brick': { color: 0xB85C38, roughness: 0.85, metalness: 0.0 },
            'smooth-face': { color: 0xD4A574, roughness: 0.6, metalness: 0.0 },
            'rendered': { color: 0xF5F5F0, roughness: 0.3, metalness: 0.0 },
            'feature-brick': { color: 0x8B4513, roughness: 0.85, metalness: 0.0 },
            'custom-brick': { color: 0xA0522D, roughness: 0.8, metalness: 0.0 },
            'standard-block': { color: 0x9CA3AF, roughness: 0.9, metalness: 0.0 },
            'smooth-block': { color: 0x6B7280, roughness: 0.5, metalness: 0.05 },
            'split-face-block': { color: 0x4B5563, roughness: 0.95, metalness: 0.0 },
            'polished-block': { color: 0x374151, roughness: 0.2, metalness: 0.1 },
            'honed-block': { color: 0xD1D5DB, roughness: 0.4, metalness: 0.05 },
            'architectural-block': { color: 0x1F2937, roughness: 0.3, metalness: 0.05 }
        };
        
        const mat = materialData[brickId] || materialData['single-face-standard'];
        
        // Add texture variation based on material type
        let bumpScale = 0.02;
        if (texture === 'rough' || brickId.includes('split') || brickId.includes('single-face')) {
            bumpScale = 0.05;
        } else if (texture === 'smooth' || brickId.includes('smooth') || brickId.includes('double-face')) {
            bumpScale = 0.01;
        } else if (texture === 'polished' || brickId.includes('polished')) {
            bumpScale = 0.005;
        }
        
        return new THREE.MeshStandardMaterial({
            color: mat.color,
            roughness: mat.roughness,
            metalness: mat.metalness,
            bumpScale: bumpScale
        });
    }

    createBrickTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Brick pattern
        ctx.fillStyle = '#8B3A22';
        ctx.fillRect(0, 0, 512, 256);
        
        const brickW = 64;
        const brickH = 32;
        
        for (let y = 0; y < 256; y += brickH) {
            const offset = (y / brickH) % 2 === 0 ? 0 : brickW / 2;
            for (let x = -brickW; x < 512; x += brickW) {
                ctx.fillStyle = '#C75B39';
                ctx.fillRect(x + offset + 2, y + 2, brickW - 4, brickH - 4);
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    createColumn(width, height, depth, material, x, y, z) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const column = new THREE.Mesh(geometry, material);
        column.position.set(x, y + height / 2, z);
        column.castShadow = true;
        column.receiveShadow = true;
        return column;
    }

    createWall(width, height, depth, material, x, y, z) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const wall = new THREE.Mesh(geometry, material);
        wall.position.set(x, y + height / 2, z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        return wall;
    }

    createMailbox(type, material, x, y, z) {
        const group = new THREE.Group();
        
        let width, height, depth;
        
        switch(type) {
            case 'parcel':
                width = 0.5; height = 0.5; depth = 0.4;
                break;
            case 'pillar':
                width = 0.4; height = 0.6; depth = 0.4;
                break;
            default: // standard
                width = 0.25; height = 0.35; depth = 0.18;
        }
        
        // Main box
        const boxGeo = new THREE.BoxGeometry(width, height, depth);
        const box = new THREE.Mesh(boxGeo, material);
        box.position.set(0, height / 2, 0);
        box.castShadow = true;
        group.add(box);
        
        // Slot
        const slotGeo = new THREE.BoxGeometry(width * 0.6, height * 0.15, depth * 0.1);
        const slotMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const slot = new THREE.Mesh(slotGeo, slotMat);
        slot.position.set(0, height * 0.7, depth / 2);
        group.add(slot);
        
        group.position.set(x, y, z);
        return group;
    }

    render(options) {
        const { layout, lengths, height, brickId, columnSize, columnCount, mailboxType } = options;
        
        if (!this.scene) {
            console.error('Scene not initialized');
            return;
        }

        // Remove old fence
        if (this.fenceGroup) {
            this.scene.remove(this.fenceGroup);
        }
        
        this.fenceGroup = new THREE.Group();
        
        // Determine texture type from brickId
        let texture = 'standard';
        if (brickId.includes('split')) texture = 'rough';
        else if (brickId.includes('smooth')) texture = 'smooth';
        else if (brickId.includes('polished')) texture = 'polished';
        else if (brickId.includes('single-face')) texture = 'rough';
        else if (brickId.includes('double-face')) texture = 'smooth';
        
        const material = this.getBrickMaterial(brickId, texture);
        const wallHeight = parseFloat(height) || 1.8;
        // Correct brick dimensions: 230mm × 110mm × 76mm
        // Single face wall thickness = 110mm (brick width)
        // Double face wall thickness = 230mm (brick length)
        const wallThickness = brickId.includes('double-face') ? 0.23 : 0.11;
        
        // Column dimensions based on size
        const colSizes = {
            'none': 0,
            '230': 0.23,
            '350': 0.35,
            '450': 0.45
        };
        const colWidth = colSizes[columnSize] || 0.23;
        
        switch(layout) {
            case 'straight':
                this.renderStraight3D(lengths[0], wallHeight, wallThickness, colWidth, parseInt(columnCount) || 0, mailboxType, material);
                break;
            case 'l-shape':
                this.renderLShape3D(lengths, wallHeight, wallThickness, colWidth, parseInt(columnCount) || 0, mailboxType, material);
                break;
            case 'u-shape':
                this.renderUShape3D(lengths, wallHeight, wallThickness, colWidth, parseInt(columnCount) || 0, mailboxType, material);
                break;
            case 'front-returns':
                this.renderFrontReturns3D(lengths, wallHeight, wallThickness, colWidth, parseInt(columnCount) || 0, mailboxType, material);
                break;
            default:
                this.renderStraight3D(lengths[0], wallHeight, wallThickness, colWidth, parseInt(columnCount) || 0, mailboxType, material);
        }
        
        this.scene.add(this.fenceGroup);
        
        // Reset camera target
        if (this.controls) {
            this.controls.target.set(0, wallHeight / 2, 0);
            this.controls.update();
        }
    }

    renderStraight3D(length, height, thickness, colWidth, colCount, mailboxType, material) {
        const wallLength = parseFloat(length) || 10;
        const wallWidth = wallLength * 0.3; // Scale down for 3D view
        const wallH = height * 0.5;
        const thick = thickness * 0.5;
        
        // Main wall
        const wall = this.createWall(wallWidth, wallH, thick, material, 0, 0, 0);
        this.fenceGroup.add(wall);
        
        // Columns
        if (colCount > 0 && colWidth > 0) {
            const colW = colWidth * 0.5;
            for (let i = 0; i < colCount; i++) {
                const x = -wallWidth / 2 + (wallWidth * i / (colCount - 1 || 1));
                const col = this.createColumn(colW, wallH + 0.1, colW, material, x, 0, thick / 2 + colW / 2);
                this.fenceGroup.add(col);
            }
        }
        
        // Mailbox
        if (mailboxType && mailboxType !== 'none') {
            const mb = this.createMailbox(mailboxType, material, 0, 0, thick / 2 + 0.3);
            this.fenceGroup.add(mb);
        }
    }

    renderLShape3D(lengths, height, thickness, colWidth, colCount, mailboxType, material) {
        const len1 = parseFloat(lengths[0]) || 10;
        const len2 = parseFloat(lengths[1]) || 5;
        const wallH = height * 0.5;
        const thick = thickness * 0.5;
        
        // First wall
        const wall1 = this.createWall(len1 * 0.3, wallH, thick, material, 0, 0, 0);
        this.fenceGroup.add(wall1);
        
        // Second wall (perpendicular)
        const wall2 = this.createWall(len2 * 0.3, wallH, thick, material, len1 * 0.15, 0, len2 * 0.15);
        wall2.rotation.y = Math.PI / 2;
        this.fenceGroup.add(wall2);
        
        // Columns at corners
        if (colWidth > 0) {
            const colW = colWidth * 0.5;
            const col1 = this.createColumn(colW, wallH + 0.1, colW, material, -len1 * 0.15, 0, 0);
            this.fenceGroup.add(col1);
            
            const col2 = this.createColumn(colW, wallH + 0.1, colW, material, len1 * 0.15, 0, 0);
            this.fenceGroup.add(col2);
            
            const col3 = this.createColumn(colW, wallH + 0.1, colW, material, len1 * 0.15, 0, len2 * 0.3);
            this.fenceGroup.add(col3);
        }
    }

    renderUShape3D(lengths, height, thickness, colWidth, colCount, mailboxType, material) {
        const sideLen = parseFloat(lengths[0]) || 8;
        const backLen = parseFloat(lengths[1]) || 5;
        const wallH = height * 0.5;
        const thick = thickness * 0.5;
        
        const sideW = sideLen * 0.3;
        const backW = backLen * 0.3;
        
        // Back wall
        const backWall = this.createWall(backW, wallH, thick, material, 0, 0, -sideW / 2);
        this.fenceGroup.add(backWall);
        
        // Left side
        const leftWall = this.createWall(sideW, wallH, thick, material, -backW / 2, 0, 0);
        leftWall.rotation.y = Math.PI / 2;
        this.fenceGroup.add(leftWall);
        
        // Right side
        const rightWall = this.createWall(sideW, wallH, thick, material, backW / 2, 0, 0);
        rightWall.rotation.y = Math.PI / 2;
        this.fenceGroup.add(rightWall);
        
        // Columns at corners
        if (colWidth > 0) {
            const colW = colWidth * 0.5;
            const positions = [
                [-backW / 2, 0, -sideW / 2],
                [backW / 2, 0, -sideW / 2],
                [-backW / 2, 0, sideW / 2],
                [backW / 2, 0, sideW / 2]
            ];
            
            positions.forEach(pos => {
                const col = this.createColumn(colW, wallH + 0.1, colW, material, pos[0], pos[1], pos[2]);
                this.fenceGroup.add(col);
            });
        }
    }

    renderFrontReturns3D(lengths, height, thickness, colWidth, colCount, mailboxType, material) {
        const returnLen = parseFloat(lengths[0]) || 6;
        const frontLen = parseFloat(lengths[1]) || 10;
        const wallH = height * 0.5;
        const thick = thickness * 0.5;
        
        const returnW = returnLen * 0.3;
        const frontW = frontLen * 0.3;
        
        // Front wall
        const frontWall = this.createWall(frontW, wallH, thick, material, 0, 0, 0);
        this.fenceGroup.add(frontWall);
        
        // Left return
        const leftReturn = this.createWall(returnW, wallH, thick, material, -frontW / 2, 0, -returnW / 2);
        leftReturn.rotation.y = Math.PI / 2;
        this.fenceGroup.add(leftReturn);
        
        // Right return
        const rightReturn = this.createWall(returnW, wallH, thick, material, frontW / 2, 0, -returnW / 2);
        rightReturn.rotation.y = Math.PI / 2;
        this.fenceGroup.add(rightReturn);
        
        // Columns
        if (colWidth > 0) {
            const colW = colWidth * 0.5;
            const positions = [
                [-frontW / 2, 0, 0],
                [frontW / 2, 0, 0],
                [-frontW / 2, 0, -returnW],
                [frontW / 2, 0, -returnW]
            ];
            
            positions.forEach(pos => {
                const col = this.createColumn(colW, wallH + 0.1, colW, material, pos[0], pos[1], pos[2]);
                this.fenceGroup.add(col);
            });
        }
        
        // Mailbox in center
        if (mailboxType && mailboxType !== 'none') {
            const mb = this.createMailbox(mailboxType, material, 0, 0, thick / 2 + 0.3);
            this.fenceGroup.add(mb);
        }
    }

    setCameraView(view) {
        if (!this.camera || !this.controls) return;
        
        switch(view) {
            case 'front':
                this.camera.position.set(0, 3, 15);
                break;
            case 'side':
                this.camera.position.set(15, 3, 0);
                break;
            case 'iso':
                this.camera.position.set(12, 10, 12);
                break;
            default:
                this.camera.position.set(10, 8, 15);
        }
        
        this.camera.lookAt(this.controls.target);
        this.controls.update();
    }

    onResize() {
        if (!this.container || !this.camera || !this.renderer) return;
        
        const width = this.container.clientWidth || 400;
        const height = this.container.clientHeight || 300;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.controls) {
            this.controls.update();
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FenceRenderer;
}
