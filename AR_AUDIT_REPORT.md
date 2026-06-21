# AR Measurement Audit Report

## Device Under Test
- Target: iPhone 16 Pro
- Expected capability: LiDAR-enhanced world-space AR (ARKit)

## Current Implementation

### Detection logic
File: `assets/js/ar-measure.js`

The AR availability check is limited to:

```javascript
if ('xr' in navigator) {
    const supported = await navigator.xr.isSessionSupported('immersive-ar');
    diagnostics.webxr = supported ? 'Available' : 'Not available';
}
```

### Why AR mode is disabled on iPhone 16 Pro

- iOS Safari does **not** expose the WebXR `immersive-ar` session type.
- Chrome on iOS is also required to use WebKit, so it also does not support WebXR immersive AR.
- The existing code only checks `navigator.xr.isSessionSupported('immersive-ar')` and immediately falls back to camera or manual mode when this returns false.
- Result: `AR Mode Not Available` is shown, even though the device has ARKit and LiDAR hardware.

### Current fallback behaviour

- If WebXR is unavailable and camera is supported, the app silently switches to Camera Measurement Mode.
- If the camera is unavailable, it switches to Manual Measurement Mode.
- The user is not told why AR was disabled.

## Audit checklist

| Check | Current status | Notes |
|-------|----------------|-------|
| Browser detected | Partial | User agent string only, no parsed browser/version |
| Device detected | Partial | Detects iPhone/iPad/Android, no model detection |
| iOS version | Missing | Not parsed from user agent |
| HTTPS status | Yes | `window.isSecureContext` |
| Camera permission status | No | Checks `enumerateDevices` only, not permission state |
| WebXR support status | Yes | `navigator.xr.isSessionSupported` |
| AR support status | Missing | No ARKit/ARCore detection |
| Exact reason for disabled AR | Missing | Only generic "Not Available" message |

## Recommendations

1. Parse browser, device model, and iOS version from the user agent.
2. Detect iOS Safari / Chrome / Android / Android WebView precisely.
3. Detect iPhone Pro / iPad Pro models with LiDAR by matching known model identifiers in the user agent.
4. Keep WebXR as the primary AR API on Android Chrome and browsers that support it.
5. On iOS Safari, where WebXR immersive AR is unavailable, explicitly fall back to Camera Measurement Mode and tell the user: "AR tracking unavailable. Camera Measurement Mode activated."
6. Use WebXR anchors (`session.createAnchor`) when available so placed points stay locked in world space.
7. Support unlimited points (multi-segment measurement) and a dedicated height mode.
8. Add a tracking quality indicator (good/limited/lost) and block measurements when tracking is poor.
9. Redesign the UI to keep the camera feed visible, with a collapsible instruction panel and a thumb-friendly bottom dock.

## Implementation plan

1. Rewrite `assets/js/ar-measure.js` to:
   - Provide detailed diagnostics (browser, device, iOS version, HTTPS, camera permission, WebXR status, AR reason).
   - Use WebXR + anchors for world-space AR.
   - Support multi-point measurement and height mode.
   - Fall back to Camera Measurement Mode on iOS/non-WebXR devices.
   - Show a tracking indicator and disable measurement when tracking is lost.
   - Detect LiDAR-capable devices and show "LiDAR Enhanced Tracking Enabled".
2. Rewrite `assets/css/ar-measure.css` for a minimal mobile-first UI.
3. Update `ar-measure.html` to use the new UI.
4. Integrate measurements with `assets/js/pricing.js` / `quote.html` for area and brick quantity calculations.

## Compatibility notes

- True world-space AR on the web is only available through WebXR.
- iOS Safari and Chrome on iOS do not support WebXR immersive AR as of iOS 18.
- The fallback camera mode uses the device camera and motion sensors; accuracy depends on user calibration.
- Android Chrome with ARCore supports WebXR immersive AR.
- For the best iOS experience, a native wrapper (e.g., WebView with ARKit permissions) or a custom domain with PWA installation would be needed, but that is out of scope for a static web deployment.
