document.addEventListener('DOMContentLoaded', () => {
    console.log('Calculator loading...');
    
    const state = {
        materialType: 'brick',
        projectType: 'brick-fence',
        layout: 'straight',
        lengths: [10],
        height: 1.8,
        brick: 'single-face-standard',
        columnSize: '230',
        columnCount: 2,
        mailboxType: 'none',
        estimateLevel: 'typical'
    };

    console.log('Config:', BRICKQUOTE_CONFIG);
    const pricing = new PricingEngine(BRICKQUOTE_CONFIG);
    console.log('Pricing engine created');
    const renderer = new FenceRenderer('fence-visualizer');
    console.log('Renderer created, container:', document.getElementById('fence-visualizer'));

    function init() {
        console.log('Init started');
        loadFromURL();
        loadFromMeasurements();
        renderMaterialSelector();
        updateProjectTypeLabels();
        renderEstimateLevelSelector();
        renderBrickSelector();
        renderMeasurements();
        bindEvents();
        update();
        console.log('Init complete');
    }

    function renderEstimateLevelSelector() {
        const container = document.getElementById('estimate-level-selector');
        if (!container) return;
        
        const levels = BRICKQUOTE_CONFIG.estimateLevels;
        container.innerHTML = Object.entries(levels).map(([key, level]) => `
            <label class="estimate-option ${state.estimateLevel === key ? 'active' : ''}">
                <input type="radio" name="estimateLevel" value="${key}" ${key === state.estimateLevel ? 'checked' : ''}>
                <div class="option-content">
                    <span class="estimate-name">${level.name}</span>
                    <span class="estimate-desc">${level.description}</span>
                    <span class="estimate-multiplier">${Math.round(level.multiplier * 100)}%</span>
                </div>
            </label>
        `).join('');
        
        container.querySelectorAll('input[name="estimateLevel"]').forEach(input => {
            input.addEventListener('change', (e) => {
                state.estimateLevel = e.target.value;
                renderEstimateLevelSelector();
                update();
            });
        });
    }

    function renderMaterialSelector() {
        const container = document.getElementById('material-selector');
        if (!container) {
            console.error('Material selector container not found!');
            return;
        }
        
        console.log('Rendering material selector, config:', BRICKQUOTE_CONFIG.materialTypes);
        
        const materials = BRICKQUOTE_CONFIG.materialTypes;
        const materialImages = {
            brick: 'assets/images/bricks/brick-material.jpg',
            block: 'assets/images/blocks/block-material.jpg'
        };
        
        container.innerHTML = Object.entries(materials).map(([key, mat]) => `
            <label class="material-option ${state.materialType === key ? 'active' : ''}">
                <input type="radio" name="materialType" value="${key}" ${key === state.materialType ? 'checked' : ''}>
                <div class="option-content">
                    <div class="material-image" data-material="${key}">
                        <img src="${materialImages[key]}" alt="${mat.name}" loading="lazy" onerror="this.style.display='none'">
                    </div>
                    <span class="material-name">${mat.name}</span>
                    <span class="material-desc">${mat.length * 1000}mm × ${mat.width * 1000}mm × ${mat.height * 1000}mm</span>
                </div>
            </label>
        `).join('');
        
        container.querySelectorAll('input[name="materialType"]').forEach(input => {
            input.addEventListener('change', (e) => {
                state.materialType = e.target.value;
                
                // Update default brick/block selection with 2026 pricing IDs
                if (state.materialType === 'brick') {
                    state.brick = 'single-face-standard';
                    if (state.columnSize === '190') state.columnSize = '230';
                } else {
                    state.brick = 'smooth-190-grey';
                    if (state.columnSize === '230') state.columnSize = '190';
                }
                
                // Update project type labels
                updateProjectTypeLabels();
                
                renderBrickSelector();
                renderColumnOptions();
                update();
            });
        });
    }

    function updateProjectTypeLabels() {
        const materialLabel = state.materialType === 'block' ? 'Block' : 'Brick';
        const container = document.getElementById('project-type-selector');
        if (!container) return;
        
        const labelMap = {
            'fence': `${materialLabel} Fence`,
            'wall': `${materialLabel} Wall`,
            'front': 'Front Fence',
            'retaining': 'Retaining Wall',
            'mailbox': 'Mailbox',
            'combo': `Mailbox + ${materialLabel}`
        };
        
        container.querySelectorAll('.type-option').forEach(option => {
            const type = option.dataset.type;
            const span = option.querySelector('.type-label');
            if (type && span && labelMap[type]) {
                span.textContent = labelMap[type];
            }
        });
    }

    function renderColumnOptions() {
        // Re-render column selector to show/hide 190mm option for blocks
        const container = document.getElementById('column-selector');
        if (!container) return;
        
        // Just trigger a re-render by triggering change event
        const currentSelection = document.querySelector('input[name="columnSize"]:checked');
        if (currentSelection) {
            currentSelection.dispatchEvent(new Event('change'));
        }
    }

    function loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('type')) state.projectType = params.get('type');
        if (params.get('layout')) state.layout = params.get('layout');
        if (params.get('height')) state.height = parseFloat(params.get('height'));
        if (params.get('brick')) state.brick = params.get('brick');
        if (params.get('columns')) state.columnCount = parseInt(params.get('columns'));
        if (params.get('colSize')) state.columnSize = params.get('colSize');
        if (params.get('mailbox')) state.mailboxType = params.get('mailbox');
        if (params.get('lengths')) state.lengths = params.get('lengths').split(',').map(Number);
        if (params.get('material')) state.materialType = params.get('material');
        if (params.get('estimate')) state.estimateLevel = params.get('estimate');
        
        document.querySelector(`input[name="projectType"][value="${state.projectType}"]`)?.click();
        document.querySelector(`input[name="layout"][value="${state.layout}"]`)?.click();
        document.querySelector(`input[name="brick"][value="${state.brick}"]`)?.click();
        document.querySelector(`input[name="columnSize"][value="${state.columnSize}"]`)?.click();
        document.querySelector(`input[name="mailboxType"][value="${state.mailboxType}"]`)?.click();
        document.getElementById('height-slider').value = state.height;
        document.getElementById('height-input').value = state.height;
        document.getElementById('columns-slider').value = state.columnCount;
        document.getElementById('columns-input').value = state.columnCount;
    }

    function loadFromMeasurements() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('lengths') || params.get('height')) return;

        try {
            const raw = localStorage.getItem('brickquote_measurements');
            if (!raw) return;
            const measurements = JSON.parse(raw);
            const lengths = measurements.filter(m => m.type.includes('length') || m.type === 'fence-length');
            const heights = measurements.filter(m => m.type.includes('height'));
            const totalLength = lengths.reduce((sum, m) => sum + m.value, 0);
            const maxHeight = heights.length ? Math.max(...heights.map(m => m.value)) : 0;
            if (totalLength > 0) {
                state.layout = 'straight';
                state.lengths = [totalLength];
            }
            if (maxHeight > 0) {
                state.height = maxHeight;
            }
            document.querySelector(`input[name="layout"][value="${state.layout}"]`)?.click();
            document.getElementById('height-slider').value = state.height;
            document.getElementById('height-input').value = state.height;
        } catch (e) {
            console.error('Failed to load measurements', e);
        }
    }

    function renderBrickSelector() {
        const container = document.getElementById('brick-selector');
        const materials = state.materialType === 'block' ? BRICKQUOTE_CONFIG.blocks : BRICKQUOTE_CONFIG.bricks;
        
        container.innerHTML = materials.map(brick => `
            <label class="brick-option">
                <input type="radio" name="brick" value="${brick.id}" ${brick.id === state.brick ? 'checked' : ''}>
                <div class="option-content">
                    <div class="brick-preview" style="background: linear-gradient(135deg, ${brick.color} 25%, ${darken(brick.color, 20)} 25%, ${darken(brick.color, 20)} 50%, ${brick.color} 50%, ${brick.color} 75%, ${darken(brick.color, 20)} 75%);"></div>
                    <div class="brick-info">
                        <span class="brick-name">${brick.name}</span>
                        <span class="brick-price">$${brick.priceMin}-${brick.priceMax}/m²</span>
                    </div>
                </div>
            </label>
        `).join('');
    }

    function darken(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    function renderMeasurements() {
        const container = document.getElementById('measurements-container');
        const layout = BRICKQUOTE_CONFIG.layouts[state.layout];
        
        while (state.lengths.length < layout.sections) state.lengths.push(5);
        while (state.lengths.length > layout.sections) state.lengths.pop();
        
        container.innerHTML = state.lengths.map((len, i) => `
            <div class="measurement-section" data-section="${i + 1}">
                <h4>Section ${i + 1}</h4>
                <div class="input-group">
                    <label>Length (meters)</label>
                    <div class="slider-input">
                        <input type="range" min="1" max="50" value="${len}" step="0.1" class="length-slider" data-index="${i}">
                        <input type="number" min="1" max="50" value="${len}" step="0.1" class="length-input" data-index="${i}">
                    </div>
                </div>
            </div>
        `).join('');
        
        container.querySelectorAll('.length-slider, .length-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index);
                const val = parseFloat(e.target.value);
                state.lengths[idx] = val;
                container.querySelector(`.length-slider[data-index="${idx}"]`).value = val;
                container.querySelector(`.length-input[data-index="${idx}"]`).value = val;
                update();
            });
        });
    }

    function bindEvents() {
        document.querySelectorAll('input[name="projectType"]').forEach(el => {
            el.addEventListener('change', (e) => { state.projectType = e.target.value; update(); });
        });
        
        document.querySelectorAll('input[name="layout"]').forEach(el => {
            el.addEventListener('change', (e) => { 
                state.layout = e.target.value; 
                state.lengths = [...BRICKQUOTE_CONFIG.layouts[state.layout].defaultLengths];
                renderMeasurements();
                update();
            });
        });
        
        document.querySelectorAll('input[name="brick"]').forEach(el => {
            el.addEventListener('change', (e) => { state.brick = e.target.value; update(); });
        });
        
        document.querySelectorAll('input[name="columnSize"]').forEach(el => {
            el.addEventListener('change', (e) => { 
                state.columnSize = e.target.value; 
                if (e.target.value === 'none') state.columnCount = 0;
                else state.columnCount = pricing.suggestColumns(state.lengths.reduce((a, b) => a + b, 0), e.target.value);
                document.getElementById('columns-slider').value = state.columnCount;
                document.getElementById('columns-input').value = state.columnCount;
                update();
            });
        });
        
        document.querySelectorAll('input[name="mailboxType"]').forEach(el => {
            el.addEventListener('change', (e) => { state.mailboxType = e.target.value; update(); });
        });
        
        const heightSlider = document.getElementById('height-slider');
        const heightInput = document.getElementById('height-input');
        console.log('Height elements:', { slider: heightSlider, input: heightInput });
        
        if (heightSlider) {
            heightSlider.addEventListener('input', (e) => { 
                console.log('Height slider changed:', e.target.value);
                state.height = parseFloat(e.target.value); 
                heightInput.value = state.height; 
                update(); 
            });
        } else {
            console.error('Height slider not found!');
        }
        
        if (heightInput) {
            heightInput.addEventListener('input', (e) => { 
                console.log('Height input changed:', e.target.value);
                state.height = parseFloat(e.target.value); 
                heightSlider.value = state.height; 
                update(); 
            });
        } else {
            console.error('Height input not found!');
        }
        
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.height = parseFloat(btn.dataset.height);
                heightSlider.value = state.height;
                heightInput.value = state.height;
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                update();
            });
        });
        
        const colSlider = document.getElementById('columns-slider');
        const colInput = document.getElementById('columns-input');
        colSlider.addEventListener('input', (e) => { state.columnCount = parseInt(e.target.value); colInput.value = state.columnCount; update(); });
        colInput.addEventListener('input', (e) => { state.columnCount = parseInt(e.target.value); colSlider.value = state.columnCount; update(); });
        
        const saveQuoteBtn = document.getElementById('save-quote-btn');
        const saveModal = document.getElementById('save-modal');
        if (saveQuoteBtn && saveModal) {
            saveQuoteBtn.addEventListener('click', () => {
                const shareUrlInput = document.getElementById('share-url');
                if (shareUrlInput) shareUrlInput.value = generateShareableURL();
                saveModal.classList.add('active');
            });
        }
        
        saveModal?.querySelector('.modal-close')?.addEventListener('click', () => {
            saveModal.classList.remove('active');
        });
        
        document.getElementById('copy-link').addEventListener('click', () => {
            const url = generateShareableURL();
            navigator.clipboard.writeText(url).then(() => {
                const msg = document.getElementById('link-copied');
                msg.classList.add('show');
                setTimeout(() => msg.classList.remove('show'), 2000);
            });
        });

        document.getElementById('contact-form').addEventListener('submit', (e) => {
            document.getElementById('quote-form-data').value = JSON.stringify({ ...state, quote: pricing.calculateQuote(state) });
        });
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderer.setCameraView(btn.dataset.view);
            });
        });
    }

    function update() {
        console.log('Update called with state:', state);
        const quote = pricing.calculateQuote(state);
        console.log('Quote calculated:', quote);
        
        document.getElementById('sticky-area').textContent = `${quote.wallArea} m²`;
        document.getElementById('sticky-columns').textContent = state.columnCount;
        document.getElementById('sticky-price').textContent = `$${quote.totalAvg.toLocaleString()}`;
        document.getElementById('sticky-range').textContent = `$${quote.totalMin.toLocaleString()} - $${quote.totalMax.toLocaleString()}`;
        
        document.getElementById('quote-breakdown').innerHTML = quote.breakdown.map(item => `
            <div class="breakdown-item ${item.highlight ? 'total' : ''}">
                <span>${item.label}</span>
                <span>${item.value}</span>
            </div>
        `).join('');
        
        // Add disclaimer
        const disclaimerEl = document.getElementById('quote-disclaimer');
        if (disclaimerEl && BRICKQUOTE_CONFIG.disclaimer) {
            disclaimerEl.textContent = BRICKQUOTE_CONFIG.disclaimer;
        }
        
        console.log('Calling renderer with:', { layout: state.layout, lengths: state.lengths, height: state.height, brickId: state.brick });
        renderer.render({
            layout: state.layout,
            lengths: state.lengths,
            height: state.height,
            brickId: state.brick,
            columnSize: state.columnSize,
            columnCount: state.columnCount,
            mailboxType: state.mailboxType
        });
        console.log('Renderer complete');
    }

    function generateShareableURL() {
        const params = new URLSearchParams({
            material: state.materialType,
            type: state.projectType,
            layout: state.layout,
            lengths: state.lengths.join(','),
            height: state.height,
            brick: state.brick,
            columns: state.columnCount,
            colSize: state.columnSize,
            mailbox: state.mailboxType,
            estimate: state.estimateLevel
        });
        return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    }

    // Book Now Modal
    function initBookNow() {
        const bookModal = document.getElementById('book-modal');
        const bookForm = document.getElementById('book-form');
        const bookNowBtn = document.getElementById('book-now-btn');
        
        // Book Now button opens booking modal
        if (bookNowBtn && bookModal) {
            bookNowBtn.addEventListener('click', () => {
                bookModal.classList.add('active');
            });
        }
        
        // Close modal buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal')?.classList.remove('active');
            });
        });
        
        // Close modal on outside click
        bookModal?.addEventListener('click', (e) => {
            if (e.target === bookModal) bookModal.classList.remove('active');
        });
        
        // Book form submission
        bookForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await sendQuoteEmail();
        });
    }
    
    async function sendQuoteEmail() {
        const form = document.getElementById('book-form');
        const formData = new FormData(form);
        
        const quote = pricing.calculateQuote(state);
        const finalPrice = quote.totalAvg;
        
        const emailData = {
            to: 'cooper.warner1985@gmail.com',
            subject: `New Quote Request - ${formData.get('name')}`,
            body: `
NEW QUOTE REQUEST
================

Customer Details:
- Name: ${formData.get('name')}
- Email: ${formData.get('email')}
- Phone: ${formData.get('phone')}
- Message: ${formData.get('message') || 'N/A'}

Quote Details:
- Project Type: ${BRICKQUOTE_CONFIG.projectTypes[state.projectType]?.name || state.projectType}
- Material: ${BRICKQUOTE_CONFIG.materialTypes[state.materialType]?.name || state.materialType}
- Brick/Block: ${quote.materialName}
- Layout: ${BRICKQUOTE_CONFIG.layouts[state.layout]?.name || state.layout}
- Wall Area: ${quote.wallArea} m²
- Height: ${state.height}m
- Piers: ${quote.columnCount} x ${quote.columnSize}
- Mailbox: ${quote.mailboxType}

Pricing:
- Estimate: $${quote.totalAvg.toLocaleString()}
- Final Price: $${finalPrice.toLocaleString()}

Share URL: ${generateShareableURL()}

Sent from BrickQuote Pro
            `.trim()
        };
        
        // Send via mailto link (client-side email)
        const mailtoLink = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
        window.location.href = mailtoLink;
        
        // Show success message
        alert('Thank you! Your email client should open with the quote details. If not, please email cooper.warner1985@gmail.com directly.');
        
        // Close modal
        document.getElementById('book-modal')?.classList.remove('active');
    }
    
    // PDF Download
    function initPDFDownload() {
        const pdfBtn = document.getElementById('pdf-btn');
        if (!pdfBtn) return;
        
        pdfBtn.addEventListener('click', generatePDF);
    }
    
    function generatePDF() {
        const btn = document.getElementById('pdf-btn');
        btn.classList.add('generating');
        btn.textContent = 'Generating...';
        
        const quote = pricing.calculateQuote(state);
        const finalPrice = quote.totalAvg;
        
        // Create PDF content
        const pdfContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Quote - BrickQuote Pro</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        h1 { color: #C75B39; border-bottom: 3px solid #C75B39; padding-bottom: 10px; }
        .section { margin: 20px 0; }
        .section h2 { color: #666; font-size: 14px; text-transform: uppercase; margin-bottom: 10px; }
        .detail { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 24px; font-weight: bold; color: #C75B39; margin-top: 20px; padding-top: 20px; border-top: 3px solid #C75B39; }
        .disclaimer { font-size: 10px; color: #666; margin-top: 40px; padding: 20px; background: #f5f5f5; border-radius: 8px; }
        .date { text-align: right; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="date">Quote generated: ${new Date().toLocaleDateString()}</div>
    <h1>BrickQuote Pro - Estimate</h1>
    
    <div class="section">
        <h2>Project Details</h2>
        <div class="detail"><span>Type:</span><span>${BRICKQUOTE_CONFIG.projectTypes[state.projectType]?.name || state.projectType}</span></div>
        <div class="detail"><span>Material:</span><span>${BRICKQUOTE_CONFIG.materialTypes[state.materialType]?.name || state.materialType}</span></div>
        <div class="detail"><span>Style:</span><span>${quote.materialName}</span></div>
        <div class="detail"><span>Layout:</span><span>${BRICKQUOTE_CONFIG.layouts[state.layout]?.name || state.layout}</span></div>
        <div class="detail"><span>Wall Area:</span><span>${quote.wallArea} m²</span></div>
        <div class="detail"><span>Height:</span><span>${state.height}m</span></div>
        <div class="detail"><span>Piers:</span><span>${quote.columnCount} x ${quote.columnSize}</span></div>
        <div class="detail"><span>Mailbox:</span><span>${quote.mailboxType}</span></div>
        <div class="detail"><span>Estimate Level:</span><span>${quote.estimateName}</span></div>
    </div>
    
    <div class="section">
        <h2>Pricing Breakdown</h2>
        ${quote.breakdown.filter(i => !i.highlight).map(item => `
        <div class="detail"><span>${item.label}:</span><span>${item.value}</span></div>
        `).join('')}
    </div>
    
    <div class="section">
        <div class="detail"><span>Estimate:</span><span>$${quote.totalAvg.toLocaleString()}</span></div>
        <div class="total">Final Estimate: $${finalPrice.toLocaleString()}</div>
    </div>
    
    <div class="disclaimer">
        ${BRICKQUOTE_CONFIG.disclaimer.replace(/\n/g, '<br>')}
    </div>
    
    <p style="text-align: center; margin-top: 40px; color: #999;">
        Generated by BrickQuote Pro<br>
        ${window.location.origin}
    </p>
</body>
</html>
        `;
        
        // Open print dialog for PDF generation
        const printWindow = window.open('', '_blank');
        printWindow.document.write(pdfContent);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
            btn.classList.remove('generating');
            btn.textContent = 'Download PDF';
        }, 500);
    }

    init();
    initBookNow();
    initPDFDownload();

    window.BrickQuote = {
        getState: () => ({ ...state }),
        getQuote: () => pricing.calculateQuote(state),
        getShareableURL: generateShareableURL
    };
});
