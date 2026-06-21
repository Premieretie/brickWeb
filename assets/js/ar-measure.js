(function() {
    'use strict';

    const STORAGE_KEY = 'brickquote_measurements';

    // ============================
    // Diagnostics
    // ============================
    const diagnostics = {
        browser: 'unknown',
        browserVersion: 'unknown',
        device: 'unknown',
        os: 'unknown',
        osVersion: 'unknown',
        https: false,
        camera: 'checking',
        cameraPermission: 'unknown',
        motion: 'unknown',
        orientation: 'unknown',
        webxr: 'unknown',
        arReason: 'unknown',
        lidar: false
    };

    function detectBrowser() {
        const ua = navigator.userAgent;
        let browser = 'unknown';
        let version = 'unknown';
        if (ua.indexOf('Chrome') !== -1 && ua.indexOf('Edg') === -1 && ua.indexOf('OPR') === -1) {
            browser = 'Chrome';
            const m = ua.match(/Chrome\/(\d+\.?\d*)/);
            if (m) version = m[1];
        } else if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1) {
            browser = 'Safari';
            const m = ua.match(/Version\/(\d+\.?\d*)/);
            if (m) version = m[1];
        } else if (ua.indexOf('Firefox') !== -1) {
            browser = 'Firefox';
            const m = ua.match(/Firefox\/(\d+\.?\d*)/);
            if (m) version = m[1];
        } else if (ua.indexOf('Edg') !== -1) {
            browser = 'Edge';
            const m = ua.match(/Edg\/(\d+\.?\d*)/);
            if (m) version = m[1];
        }
        diagnostics.browser = browser;
        diagnostics.browserVersion = version;
    }

    function detectOS() {
        const ua = navigator.userAgent;
        let os = 'Other';
        let version = 'unknown';
        if (/iPhone|iPad|iPod/.test(ua)) {
            os = 'iOS';
            const m = ua.match(/OS (\d+_?\d*)/);
            if (m) version = m[1].replace(/_/g, '.');
        } else if (/Android/.test(ua)) {
            os = 'Android';
            const m = ua.match(/Android (\d+\.?\d*)/);
            if (m) version = m[1];
        } else if (/Windows/.test(ua)) {
            os = 'Windows';
        } else if (/Mac/.test(ua)) {
            os = 'macOS';
        }
        diagnostics.os = os;
        diagnostics.osVersion = version;
    }

    function detectDevice() {
        const ua = navigator.userAgent;
        let device = 'Desktop/Other';
        if (/iPhone/.test(ua)) device = 'iPhone';
        else if (/iPad/.test(ua)) device = 'iPad';
        else if (/Android/.test(ua)) device = 'Android';
        diagnostics.device = device;

        // LiDAR-capable iPhone Pro detection (user-agent heuristic)
        const lidarModels = [
            'iPhone12,3', 'iPhone12,5', 'iPhone13,3', 'iPhone13,5', 'iPhone13,6', 'iPhone13,7',
            'iPhone14,2', 'iPhone14,3', 'iPhone14,7', 'iPhone14,8', 'iPhone15,2', 'iPhone15,3',
            'iPhone16,1', 'iPhone16,2', 'iPhone16,3', 'iPhone16,4', 'iPhone17,1', 'iPhone17,2',
            'iPhone17,3', 'iPhone17,4'
        ];
        const proModel = /iPhone\s*(\d+\s*Pro(?:\s*Max)?)/i.test(ua);
        const modelId = lidarModels.some(m => ua.indexOf(m) !== -1);
        diagnostics.lidar = proModel || modelId || /iPhone 1[2-9] Pro/.test(ua);
    }

    async function checkCameraPermission() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            diagnostics.cameraPermission = 'not supported';
            diagnostics.camera = 'not supported';
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(t => t.stop());
            diagnostics.cameraPermission = 'granted';
            diagnostics.camera = 'available';
        } catch (e) {
            if (e.name === 'NotAllowedError') diagnostics.cameraPermission = 'denied';
            else if (e.name === 'NotFoundError') diagnostics.cameraPermission = 'no camera';
            else diagnostics.cameraPermission = 'error: ' + e.message;
            diagnostics.camera = diagnostics.cameraPermission;
        }
    }

    async function checkCapabilities() {
        detectBrowser();
        detectOS();
        detectDevice();
        diagnostics.https = (typeof window.isSecureContext !== 'undefined') ? window.isSecureContext : (location.protocol === 'https:');

        diagnostics.motion = 'DeviceMotionEvent' in window ? 'available' : 'not available';
        diagnostics.orientation = 'DeviceOrientationEvent' in window ? 'available' : 'not available';

        await checkCameraPermission();

        // WebXR / AR detection
        if ('xr' in navigator && navigator.xr) {
            try {
                const supported = await navigator.xr.isSessionSupported('immersive-ar');
                diagnostics.webxr = supported ? 'available' : 'not available';
                diagnostics.arReason = supported
                    ? 'WebXR immersive-ar supported'
                    : 'WebXR immersive-ar not supported by this browser/device';
            } catch (e) {
                diagnostics.webxr = 'error';
                diagnostics.arReason = 'WebXR check error: ' + e.message;
            }
        } else {
            diagnostics.webxr = 'not supported';
            diagnostics.arReason = 'navigator.xr not present (' + diagnostics.browser + ' ' + diagnostics.browserVersion + ' on ' + diagnostics.os + ' ' + diagnostics.osVersion + ')';
        }

        if (diagnostics.device === 'iPhone' && diagnostics.webxr !== 'available') {
            diagnostics.arReason += ' — iOS Safari does not expose WebXR immersive AR; a native wrapper or camera fallback is required.';
        }

        updateDiagnostics();
        updateModeCards();
    }

    function updateDiagnostics() {
        const d = diagnostics;
        const grid = document.getElementById('diagnostics-grid');
        if (!grid) return;
        grid.innerHTML = `
            <div class="diagnostic-item"><span>Browser</span><span>${d.browser} ${d.browserVersion}</span></div>
            <div class="diagnostic-item"><span>Device</span><span>${d.device}</span></div>
            <div class="diagnostic-item"><span>OS</span><span>${d.os} ${d.osVersion}</span></div>
            <div class="diagnostic-item"><span>HTTPS</span><span>${d.https ? 'Yes' : 'No'}</span></div>
            <div class="diagnostic-item"><span>Camera</span><span>${d.camera}</span></div>
            <div class="diagnostic-item"><span>Camera Permission</span><span>${d.cameraPermission}</span></div>
            <div class="diagnostic-item"><span>Motion</span><span>${d.motion}</span></div>
            <div class="diagnostic-item"><span>Orientation</span><span>${d.orientation}</span></div>
            <div class="diagnostic-item"><span>WebXR</span><span>${d.webxr}</span></div>
            <div class="diagnostic-item"><span>LiDAR</span><span>${d.lidar ? 'Detected' : 'Not detected'}</span></div>
            <div class="diagnostic-item full"><span>AR Reason</span><span>${d.arReason}</span></div>
        `;
    }

    function updateModeCards() {
        const arStatus = document.getElementById('status-ar');
        const arCard = document.getElementById('mode-ar');
        const camStatus = document.getElementById('status-camera');
        const camCard = document.getElementById('mode-camera');

        if (diagnostics.webxr === 'available') {
            arStatus.textContent = 'AR Mode Available';
            arCard.classList.add('available');
        } else {
            arStatus.textContent = 'AR Mode Not Available';
            arCard.classList.remove('available');
        }

        if (diagnostics.camera === 'available') {
            camStatus.textContent = 'Camera Mode Available';
            camCard.classList.add('available');
        } else {
            camStatus.textContent = 'Camera Mode Not Available';
            camCard.classList.remove('available');
        }
    }

    // ============================
    // State
    // ============================
    const state = {
        mode: null,
        subMode: 'length',
        points: [],
        measurements: [],
        currentDistance: 0,
        currentHeight: 0,
        ar: {
            session: null,
            renderer: null,
            scene: null,
            camera: null,
            reticle: null,
            referenceSpace: null,
            hitTestSource: null,
            anchors: [],
            tracking: 'unknown'
        },
        camera: {
            stream: null,
            video: null,
            canvas: null,
            ctx: null,
            points: [],
            scale: null,
            calibrating: false,
            calibrationMethod: null,
            calPoints: []
        }
    };

    // ============================
    // Persistence
    // ============================
    function loadMeasurements() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) state.measurements = JSON.parse(raw);
        } catch (e) {
            console.error('Failed to load measurements', e);
            state.measurements = [];
        }
    }

    function saveMeasurements() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.measurements));
        } catch (e) {
            console.error('Failed to save measurements', e);
        }
    }

    function addMeasurement(type, value) {
        const label = type === 'length' ? 'Total Length' : type === 'height' ? 'Wall Height' : type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const measurement = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            type,
            label,
            value: parseFloat(value.toFixed(3)),
            timestamp: new Date().toISOString()
        };
        state.measurements.push(measurement);
        saveMeasurements();
        renderMeasurements();
    }

    function deleteMeasurement(id) {
        state.measurements = state.measurements.filter(m => m.id !== id);
        saveMeasurements();
        renderMeasurements();
    }

    function clearMeasurements() {
        state.measurements = [];
        saveMeasurements();
        renderMeasurements();
    }

    function getMeasurementsSummary() {
        const lengths = state.measurements.filter(m => m.type === 'length');
        const heights = state.measurements.filter(m => m.type === 'height');
        const totalLength = lengths.reduce((sum, m) => sum + m.value, 0);
        const maxHeight = heights.length ? Math.max(...heights.map(m => m.value)) : 0;
        return { totalLength, maxHeight, area: totalLength * maxHeight };
    }

    function generateQuoteURL() {
        const { totalLength, maxHeight } = getMeasurementsSummary();
        const params = new URLSearchParams();
        params.set('layout', 'straight');
        if (totalLength > 0) params.set('lengths', totalLength.toFixed(2));
        if (maxHeight > 0) params.set('height', maxHeight.toFixed(2));
        return '/quote/?' + params.toString();
    }

    function renderMeasurements() {
        const list = document.getElementById('measurements-list');
        const summary = document.getElementById('measurements-summary');
        const quoteLink = document.getElementById('quote-link');
        if (!list) return;

        if (state.measurements.length === 0) {
            list.innerHTML = '<li class="no-measurements">No measurements yet</li>';
            summary.style.display = 'none';
            return;
        }

        list.innerHTML = state.measurements.map(m => `
            <li class="measurement-item">
                <div class="measurement-info">
                    <span class="measurement-type-label">${m.label}</span>
                    <span class="measurement-value">${m.value.toFixed(2)} m</span>
                </div>
                <button class="delete-measurement" data-id="${m.id}" aria-label="Delete">×</button>
            </li>
        `).join('');

        const { area } = getMeasurementsSummary();
        summary.style.display = 'block';
        summary.innerHTML = `
            <div class="area-row total"><span>Estimated Area</span><span>${area.toFixed(2)} m²</span></div>
            <a href="${generateQuoteURL()}" class="btn-primary">Continue to Quote</a>
        `;

        list.querySelectorAll('.delete-measurement').forEach(btn => {
            btn.addEventListener('click', () => deleteMeasurement(btn.dataset.id));
        });

        if (quoteLink) quoteLink.href = generateQuoteURL();
    }

    function renderManualHistory() {
        renderMeasurements();
    }

    // ============================
    // Mode Selection
    // ============================
    function selectMode(mode) {
        let fallbackText = null;
        if (mode === 'ar' && diagnostics.webxr !== 'available') {
            if (diagnostics.camera === 'available') {
                fallbackText = 'AR tracking unavailable. Camera Measurement Mode activated.';
                mode = 'camera';
            } else {
                fallbackText = 'AR tracking unavailable. Manual Measurement Mode activated.';
                mode = 'manual';
            }
        } else if (mode === 'camera' && diagnostics.camera !== 'available') {
            fallbackText = 'Camera not available. Manual Measurement Mode activated.';
            mode = 'manual';
        }

        state.mode = mode;
        document.getElementById('mode-selector').style.display = 'none';
        document.getElementById('diagnostics-panel').style.display = 'none';

        document.getElementById('ar-container').style.display = 'none';
        document.getElementById('camera-container').style.display = 'none';
        document.getElementById('manual-container').style.display = 'none';

        resetCurrentMeasurement();

        if (mode === 'ar') {
            document.getElementById('ar-container').style.display = 'flex';
            startAR();
        } else if (mode === 'camera') {
            document.getElementById('camera-container').style.display = 'flex';
            startCamera();
        } else if (mode === 'manual') {
            document.getElementById('manual-container').style.display = 'flex';
            renderMeasurements();
        }

        if (fallbackText) {
            showFallbackNotice(fallbackText);
        }
    }

    function showModeSelector() {
        document.getElementById('mode-selector').style.display = 'flex';
        document.getElementById('ar-container').style.display = 'none';
        document.getElementById('camera-container').style.display = 'none';
        document.getElementById('manual-container').style.display = 'none';
        document.getElementById('diagnostics-panel').style.display = 'none';
        document.getElementById('ar-fallback-notice').style.display = 'none';
        document.getElementById('cam-fallback-notice').style.display = 'none';
        if (state.ar.session) {
            try { state.ar.session.end(); } catch (e) {}
        }
        if (state.camera.stream) {
            state.camera.stream.getTracks().forEach(t => t.stop());
        }
        const oldMode = state.mode;
        state.mode = null;
        if (oldMode === 'ar') resetARPoints();
        if (oldMode === 'camera') resetCameraPoints();
        state.points = [];
        state.camera.points = [];
        state.currentDistance = 0;
        state.currentHeight = 0;
    }

    function showFallbackNotice(text) {
        const el = ui('fallback-notice');
        if (el) {
            el.textContent = text;
            el.style.display = 'flex';
        }
    }

    // ============================
    // Common UI Controls
    // ============================
    function ui(id) {
        const prefix = state.mode === 'ar' ? 'ar-' : state.mode === 'camera' ? 'cam-' : '';
        return document.getElementById(prefix + id);
    }

    function setSubMode(subMode) {
        state.subMode = subMode;
        resetCurrentMeasurement();
        ['ar-', 'cam-'].forEach(p => {
            const lengthBtn = document.getElementById(p + 'btn-length');
            const heightBtn = document.getElementById(p + 'btn-height');
            if (lengthBtn && heightBtn) {
                lengthBtn.classList.toggle('active', subMode === 'length');
                heightBtn.classList.toggle('active', subMode === 'height');
            }
        });
        updateHint();
    }

    function resetCurrentMeasurement() {
        state.points = [];
        state.currentDistance = 0;
        state.currentHeight = 0;
        if (state.mode === 'ar') resetARPoints();
        if (state.mode === 'camera') resetCameraPoints();
        updateMeasurements();
        updateHint();
        updateTrackingIndicator();
    }

    function undoPoint() {
        if (state.mode === 'ar') undoARPoint();
        else if (state.mode === 'camera') undoCameraPoint();
    }

    function placePoint() {
        if (state.mode === 'ar') placeARPoint();
        else if (state.mode === 'camera') placeCameraPoint();
    }

    function finish() {
        if (state.mode === 'ar') finishAR();
        else if (state.mode === 'camera') finishCamera();
    }

    function calculateTotalLength() {
        if (state.points.length < 2) return 0;
        let total = 0;
        for (let i = 1; i < state.points.length; i++) {
            total += distanceBetween(state.points[i - 1], state.points[i]);
        }
        return total;
    }

    function calculateHeight() {
        if (state.points.length < 2) return 0;
        const a = state.points[0];
        const b = state.points[1];
        return Math.abs(b.y - a.y);
    }

    function distanceBetween(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dz = (b.z || 0) - (a.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    function updateHint() {
        const hint = ui('active-hint');
        if (!hint) return;
        if (state.subMode === 'height') {
            if (state.points.length === 0) hint.textContent = 'Align crosshair with bottom of wall and tap Place Point';
            else if (state.points.length === 1) hint.textContent = 'Align crosshair with top of wall and tap Place Point';
            else hint.textContent = 'Tap Finish to save height, or Reset to start over';
        } else {
            if (state.points.length === 0) hint.textContent = 'Align crosshair with start point and tap Place Point';
            else hint.textContent = 'Move to next point and tap Place Point. Tap Finish to save total length.';
        }
    }

    function updateTrackingIndicator() {
        const el = ui('tracking-indicator');
        if (!el) return;
        const status = state.mode === 'ar' ? state.ar.tracking : 'camera';
        let text = '⚪ Tracking unknown';
        if (status === 'good') text = '🟢 Tracking good';
        else if (status === 'limited') text = '🟡 Tracking limited';
        else if (status === 'lost') text = '🔴 Tracking lost';
        else if (status === 'camera') text = '📷 Camera mode';
        el.textContent = text;
    }

    function toggleInstructions() {
        const el = ui('instructions-panel');
        const btn = ui('btn-instructions');
        if (!el || !btn) return;
        const showing = el.classList.toggle('open');
        btn.textContent = showing ? 'Hide Help' : 'Show Help';
    }

    // ============================
    // AR Mode (WebXR + Anchors)
    // ============================
    async function startAR() {
        if (!navigator.xr) {
            showFallbackNotice('AR tracking unavailable. Camera Measurement Mode activated.');
            selectMode('camera');
            return;
        }
        try {
            const supported = await navigator.xr.isSessionSupported('immersive-ar');
            if (!supported) {
                showFallbackNotice('AR tracking unavailable. Camera Measurement Mode activated.');
                selectMode('camera');
                return;
            }
        } catch (e) {
            showFallbackNotice('AR tracking unavailable. Camera Measurement Mode activated.');
            selectMode('camera');
            return;
        }

        const canvas = document.getElementById('ar-canvas');
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera();
        camera.matrixAutoUpdate = false;
        scene.add(camera);

        const reticle = new THREE.Mesh(
            new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0xC75B39 })
        );
        reticle.visible = false;
        scene.add(reticle);

        state.ar.renderer = renderer;
        state.ar.scene = scene;
        state.ar.camera = camera;
        state.ar.reticle = reticle;
        state.ar.anchors = [];
        state.points = [];
        state.ar.tracking = 'limited';
        updateTrackingIndicator();

        try {
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['hit-test'],
                optionalFeatures: ['anchors', 'dom-overlay'],
                domOverlay: { root: document.getElementById('ar-overlay') }
            });
            state.ar.session = session;

            renderer.xr.setReferenceSpaceType('local-floor');
            renderer.xr.setSession(session);

            renderer.xr.addEventListener('sessionstart', async () => {
                const space = renderer.xr.getReferenceSpace();
                state.ar.referenceSpace = space;
                const viewerSpace = await session.requestReferenceSpace('viewer');
                state.ar.hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
                state.ar.tracking = 'good';
                updateTrackingIndicator();
                if (diagnostics.lidar) {
                    showFallbackNotice('LiDAR Enhanced Tracking Enabled');
                    setTimeout(() => ui('fallback-notice').style.display = 'none', 3000);
                }
            });

            renderer.setAnimationLoop(onXRFrame);
            renderMeasurements();

            session.addEventListener('end', () => {
                renderer.setAnimationLoop(null);
                state.ar.session = null;
                showModeSelector();
            });

            session.addEventListener('visibilitychange', () => {
                state.ar.tracking = session.visibilityState === 'visible' ? 'good' : 'limited';
                updateTrackingIndicator();
            });
        } catch (err) {
            console.error('AR session failed', err);
            showFallbackNotice('AR session failed. Camera Measurement Mode activated.');
            selectMode('camera');
        }
    }

    function onXRFrame(time, frame) {
        const session = frame.session;
        const renderer = state.ar.renderer;
        const referenceSpace = state.ar.referenceSpace;
        const scene = state.ar.scene;
        const camera = state.ar.camera;

        if (referenceSpace) {
            // Update anchors
            state.ar.anchors.forEach(anchor => {
                const pose = frame.getPose(anchor.anchorSpace, referenceSpace);
                if (pose) {
                    anchor.marker.position.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
                    anchor.marker.quaternion.set(pose.transform.orientation.x, pose.transform.orientation.y, pose.transform.orientation.z, pose.transform.orientation.w);
                    anchor.position = pose.transform.position;
                }
            });

            // Update reticle
            if (state.ar.hitTestSource) {
                const results = frame.getHitTestResults(state.ar.hitTestSource);
                if (results.length > 0) {
                    const hitPose = results[0].getPose(referenceSpace);
                    const reticle = state.ar.reticle;
                    reticle.visible = true;
                    reticle.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z);
                    reticle.quaternion.set(hitPose.transform.orientation.x, hitPose.transform.orientation.y, hitPose.transform.orientation.z, hitPose.transform.orientation.w);
                    state.ar.tracking = 'good';
                } else {
                    state.ar.reticle.visible = false;
                    state.ar.tracking = 'limited';
                }
                updateTrackingIndicator();
            }
        }

        renderer.render(scene, camera);
    }

    async function placeARPoint() {
        if (state.subMode === 'height' && state.points.length >= 2) return;

        const reticle = state.ar.reticle;
        if (!reticle || !reticle.visible) {
            showFallbackNotice('Tracking not ready. Move the device slowly until the crosshair appears.');
            return;
        }

        const session = state.ar.session;
        const referenceSpace = state.ar.referenceSpace;
        const position = { x: reticle.position.x, y: reticle.position.y, z: reticle.position.z };
        const quaternion = { x: reticle.quaternion.x, y: reticle.quaternion.y, z: reticle.quaternion.z, w: reticle.quaternion.w };

        const marker = createARMarker(state.points.length === 0 ? 0x22c55e : 0xef4444, position);
        state.ar.scene.add(marker);

        let anchor = null;
        if (session.createAnchor) {
            try {
                const rigidTransform = new XRRigidTransform(position, quaternion);
                anchor = await session.createAnchor(rigidTransform, referenceSpace);
            } catch (e) {
                console.warn('Anchor creation failed', e);
            }
        }

        state.points.push({ x: position.x, y: position.y, z: position.z });
        state.ar.anchors.push({ anchor, anchorSpace: anchor?.anchorSpace, marker, position });

        updateARLines();
        updateMeasurements();
        updateHint();
    }

    function undoARPoint() {
        if (state.points.length === 0) return;
        const last = state.ar.anchors.pop();
        state.points.pop();
        if (last) {
            state.ar.scene.remove(last.marker);
            if (last.anchor) {
                try { last.anchor.delete(); } catch (e) {}
            }
        }
        updateARLines();
        updateMeasurements();
        updateHint();
    }

    function resetARPoints() {
        state.ar.anchors.forEach(a => {
            state.ar.scene.remove(a.marker);
            if (a.anchor) {
                try { a.anchor.delete(); } catch (e) {}
            }
        });
        state.ar.anchors = [];
        state.points = [];
        if (state.ar.line) {
            state.ar.scene.remove(state.ar.line);
            state.ar.line = null;
        }
    }

    function updateARLines() {
        if (state.ar.line) {
            state.ar.scene.remove(state.ar.line);
            state.ar.line = null;
        }
        if (state.points.length < 2) return;
        const material = new THREE.LineBasicMaterial({ color: 0xC75B39, linewidth: 3 });
        const geometry = new THREE.BufferGeometry().setFromPoints(
            state.points.map(p => new THREE.Vector3(p.x, p.y, p.z))
        );
        state.ar.line = new THREE.Line(geometry, material);
        state.ar.scene.add(state.ar.line);
    }

    function createARMarker(color, point) {
        const geometry = new THREE.SphereGeometry(0.05, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.set(point.x, point.y, point.z);
        return marker;
    }

    function finishAR() {
        if (state.subMode === 'height') {
            if (state.points.length < 2) return;
            const h = calculateHeight();
            if (h > 0) {
                addMeasurement('height', h);
                resetARPoints();
            }
        } else {
            const total = calculateTotalLength();
            if (total > 0) {
                addMeasurement('length', total);
                resetARPoints();
            }
        }
        updateMeasurements();
        updateHint();
    }

    // ============================
    // Camera Mode
    // ============================
    async function startCamera() {
        const video = document.getElementById('camera-video');
        const canvas = document.getElementById('camera-canvas');
        const ctx = canvas.getContext('2d');

        state.camera.video = video;
        state.camera.canvas = canvas;
        state.camera.ctx = ctx;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
            state.camera.stream = stream;
            video.srcObject = stream;
            await video.play();

            resizeCameraCanvas();
            updateHint();
            updateTrackingIndicator();
            renderCameraFrame();
            renderMeasurements();
        } catch (e) {
            console.error('Camera error', e);
            showFallbackNotice('Camera access failed. Manual Measurement Mode activated.');
            selectMode('manual');
        }
    }

    function resizeCameraCanvas() {
        const video = state.camera.video;
        const canvas = state.camera.canvas;
        if (!video || !canvas) return;
        canvas.width = video.videoWidth || window.innerWidth;
        canvas.height = video.videoHeight || window.innerHeight;
    }

    function renderCameraFrame() {
        if (state.mode !== 'camera') return;
        const video = state.camera.video;
        const canvas = state.camera.canvas;
        const ctx = state.camera.ctx;
        if (!video || !canvas || !ctx) return;

        if (video.readyState >= video.HAVE_CURRENT_DATA) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawCameraMarkers();
        }

        requestAnimationFrame(renderCameraFrame);
    }

    function drawCameraMarkers() {
        const ctx = state.camera.ctx;
        const canvas = state.camera.canvas;
        const points = state.camera.points;

        points.forEach((p, index) => {
            const color = index === 0 ? '#22c55e' : '#ef4444';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.fillText(String.fromCharCode(65 + index), p.x - 4, p.y + 5);
        });

        if (points.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.strokeStyle = '#C75B39';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        if (state.camera.calibrating && state.camera.calPoints.length) {
            state.camera.calPoints.forEach((p, index) => {
                const color = index === 0 ? '#22c55e' : '#ef4444';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 3;
                ctx.stroke();
            });
            if (state.camera.calPoints.length === 2) {
                ctx.beginPath();
                ctx.moveTo(state.camera.calPoints[0].x, state.camera.calPoints[0].y);
                ctx.lineTo(state.camera.calPoints[1].x, state.camera.calPoints[1].y);
                ctx.strokeStyle = '#C75B39';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }
    }

    function getCameraCenter() {
        const canvas = state.camera.canvas;
        return { x: canvas.width / 2, y: canvas.height / 2 };
    }

    function placeCameraPoint() {
        if (state.subMode === 'height' && state.camera.points.length >= 2) return;

        const p = getCameraCenter();
        state.camera.points.push(p);
        updateMeasurements();
        updateHint();
    }

    function undoCameraPoint() {
        state.camera.points.pop();
        updateMeasurements();
        updateHint();
    }

    function resetCameraPoints() {
        state.camera.points = [];
        state.camera.calPoints = [];
        state.camera.calibrating = false;
        updateMeasurements();
        updateHint();
    }

    function finishCamera() {
        if (!state.camera.scale && state.mode === 'camera') {
            showCalibrationPanel();
            return;
        }
        if (state.subMode === 'height') {
            if (state.camera.points.length < 2) return;
            const a = state.camera.points[0];
            const b = state.camera.points[1];
            const pixelH = Math.abs(b.y - a.y);
            const h = pixelH * (state.camera.scale || 0.002);
            if (h > 0) {
                addMeasurement('height', h);
                resetCameraPoints();
            }
        } else {
            const total = calculateCameraLength();
            if (total > 0) {
                addMeasurement('length', total);
                resetCameraPoints();
            }
        }
        updateMeasurements();
        updateHint();
    }

    function calculateCameraLength() {
        const points = state.camera.points;
        if (points.length < 2) return 0;
        const scale = state.camera.scale || 0.002;
        let total = 0;
        for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i - 1].x;
            const dy = points[i].y - points[i - 1].y;
            total += Math.sqrt(dx * dx + dy * dy) * scale;
        }
        return total;
    }

    function updateMeasurements() {
        const distanceEl = ui('distance-value');
        const heightEl = ui('height-value');
        const areaEl = ui('area-value');
        const pointsEl = ui('points-count');

        if (pointsEl) pointsEl.textContent = state.mode === 'ar' ? state.points.length : state.camera.points.length;

        if (state.subMode === 'height') {
            const h = state.mode === 'ar' ? calculateHeight() : (state.camera.points.length >= 2 ? Math.abs(state.camera.points[1].y - state.camera.points[0].y) * (state.camera.scale || 0.002) : 0);
            state.currentHeight = h;
            if (heightEl) heightEl.textContent = h.toFixed(2) + ' m';
            if (distanceEl) distanceEl.textContent = '0.00 m';
        } else {
            const total = state.mode === 'ar' ? calculateTotalLength() : calculateCameraLength();
            state.currentDistance = total;
            if (distanceEl) distanceEl.textContent = total.toFixed(2) + ' m';
            if (heightEl) heightEl.textContent = '0.00 m';
        }

        const currentArea = state.currentDistance * state.currentHeight;
        if (areaEl) areaEl.textContent = currentArea.toFixed(2) + ' m²';
    }

    // Calibration panel
    function showCalibrationPanel() {
        document.getElementById('calibration-panel').style.display = 'flex';
        document.getElementById('calibration-panel').classList.add('open');
        state.camera.calibrating = true;
        state.camera.calPoints = [];
        updateHint();
    }

    function closeCalibrationPanel() {
        document.getElementById('calibration-panel').classList.remove('open');
        setTimeout(() => {
            const panel = document.getElementById('calibration-panel');
            if (!panel.classList.contains('open')) panel.style.display = 'none';
        }, 250);
        state.camera.calibrating = false;
        state.camera.calPoints = [];
        updateHint();
    }

    function setCalibrationScale(metres) {
        const points = state.camera.calPoints;
        if (points.length < 2 || !metres) return;
        const dx = points[1].x - points[0].x;
        const dy = points[1].y - points[0].y;
        const px = Math.sqrt(dx * dx + dy * dy);
        if (px > 0) state.camera.scale = metres / px;
        closeCalibrationPanel();
        updateMeasurements();
    }

    // ============================
    // Manual mode
    // ============================
    function initManualMode() {
        const form = document.getElementById('manual-form');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const length = parseFloat(document.getElementById('manual-length').value);
            const height = parseFloat(document.getElementById('manual-height').value);
            const type = document.querySelector('input[name="manual-type"]:checked')?.value;
            if (type === 'wall-section' || type === 'wall-length' || type === 'fence-length' || type === 'retaining-length') {
                if (length > 0) addMeasurement('length', length);
            }
            if (type === 'wall-section' || type === 'wall-height' || type === 'retaining-height') {
                if (height > 0) addMeasurement('height', height);
            }
            if (type === 'custom') {
                if (length > 0) addMeasurement('length', length);
                if (height > 0) addMeasurement('height', height);
            }
            form.reset();
        });
    }

    // ============================
    // Event listeners
    // ============================
    document.addEventListener('DOMContentLoaded', () => {
        loadMeasurements();
        checkCapabilities();
        renderMeasurements();
        initManualMode();

        // Mode selector
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', () => selectMode(card.dataset.mode));
        });

        document.getElementById('btn-diagnostics')?.addEventListener('click', () => {
            document.getElementById('diagnostics-panel').style.display = 'flex';
        });
        document.getElementById('close-diagnostics')?.addEventListener('click', () => {
            document.getElementById('diagnostics-panel').style.display = 'none';
        });

        // Common controls (AR and Camera have mirrored IDs)
        const prefixes = ['ar-', 'cam-'];
        prefixes.forEach(p => {
            document.getElementById(p + 'btn-place')?.addEventListener('click', placePoint);
            document.getElementById(p + 'btn-undo')?.addEventListener('click', undoPoint);
            document.getElementById(p + 'btn-reset')?.addEventListener('click', resetCurrentMeasurement);
            document.getElementById(p + 'btn-finish')?.addEventListener('click', finish);
            document.getElementById(p + 'btn-height')?.addEventListener('click', () => setSubMode('height'));
            document.getElementById(p + 'btn-length')?.addEventListener('click', () => setSubMode('length'));
            document.getElementById(p + 'btn-instructions')?.addEventListener('click', toggleInstructions);
            document.getElementById(p + 'btn-back')?.addEventListener('click', showModeSelector);
        });
        document.getElementById('cam-btn-calibrate')?.addEventListener('click', showCalibrationPanel);
        document.getElementById('manual-btn-back')?.addEventListener('click', showModeSelector);

        // Calibration
        document.getElementById('btn-close-calibration')?.addEventListener('click', closeCalibrationPanel);
        document.getElementById('btn-calibrate-brick')?.addEventListener('click', () => setCalibrationReference('brick'));
        document.getElementById('btn-calibrate-a4')?.addEventListener('click', () => setCalibrationReference('a4'));
        document.getElementById('btn-calibrate-custom')?.addEventListener('click', () => setCalibrationReference('custom'));
        document.getElementById('btn-apply-calibration')?.addEventListener('click', () => {
            const input = document.getElementById('calibration-distance');
            setCalibrationScale(parseFloat(input?.value));
        });

        function setCalibrationReference(type) {
            const panel = document.getElementById('calibration-detail');
            const input = document.getElementById('calibration-distance-input');
            const label = document.getElementById('calibration-label');
            panel.style.display = 'block';
            input.style.display = 'block';
            if (type === 'brick') {
                label.textContent = 'Standard brick width 230 mm';
                document.getElementById('calibration-distance').value = '0.230';
            } else if (type === 'a4') {
                label.textContent = 'A4 sheet width 297 mm';
                document.getElementById('calibration-distance').value = '0.297';
            } else {
                label.textContent = 'Enter known distance in metres';
                document.getElementById('calibration-distance').value = '';
            }
        }

        // Camera calibration taps
        const camCanvas = document.getElementById('camera-canvas');
        if (camCanvas) {
            camCanvas.addEventListener('pointerdown', (e) => {
                if (!state.camera.calibrating) return;
                const rect = camCanvas.getBoundingClientRect();
                const p = {
                    x: (e.clientX - rect.left) * (camCanvas.width / rect.width),
                    y: (e.clientY - rect.top) * (camCanvas.height / rect.height)
                };
                state.camera.calPoints.push(p);
                if (state.camera.calPoints.length === 2) {
                    document.getElementById('calibration-distance-input').style.display = 'block';
                }
                updateHint();
            });
        }
    });
})();
