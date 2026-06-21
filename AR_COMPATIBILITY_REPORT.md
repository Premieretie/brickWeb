# AR Measurement Compatibility Report

## Tested page
- URL path: `/ar-measure.html`
- Files changed:
  - `assets/js/ar-measure.js` (full rebuild)
  - `ar-measure.html` (new minimal AR / camera UI)
  - `assets/css/ar-measure.css` (overlay and bottom-dock styles)

## Target devices / browsers

| Browser / Device | Expected AR capability | Status |
|---|---|---|
| iPhone 16 Pro (iOS Safari) | ARKit + LiDAR hardware | WebXR AR not exposed by Safari; falls back to Camera Measurement Mode |
| iPhone 16 Pro (iOS Chrome) | Same as Safari (uses WebKit) | WebXR AR not exposed; falls back to Camera Measurement Mode |
| Android Chrome with ARCore | WebXR immersive AR supported | Full AR mode available with world anchors |
| Android Samsung Internet | WebXR support varies | ARCore-backed devices show full AR; older devices fall back to camera |
| Desktop Chrome / Edge | WebXR may support emulator only | Diagnostics will report availability; camera fallback if no AR |

## Diagnostics now reported

- Browser name and version
- Device type
- OS name and version (including iOS version)
- HTTPS / secure context status
- Camera availability and permission state
- Motion sensor availability
- Orientation sensor availability
- WebXR immersive-ar support status
- LiDAR detection (iPhone Pro models)
- Exact reason AR mode is unavailable

## Rebuilt AR mode

- Uses WebXR `immersive-ar` session.
- Uses `hit-test` for reticle placement.
- Uses `anchors` API (when available) to keep points locked in world space.
- Supports unlimited multi-point wall measurement.
- Calculates total length, current height, and estimated area.
- Provides tracking quality indicator (good / limited / lost).
- Falls back to Camera Measurement Mode with a user-facing message on iOS and non-WebXR devices.

## Rebuilt Camera Measurement Mode

- Uses the device camera feed.
- Calibrates scale using standard brick (230 mm), A4 sheet (297 mm), or a custom known distance.
- Places points using a center crosshair.
- Calculates length/height from calibrated pixels.
- Falls back to Manual Measurement Mode if camera access is denied.

## Manual Measurement Mode

- Enter length and height in metres.
- Select measurement type (wall, fence, retaining, custom, etc.).
- Saves to persistent list.
- Calculates total area.
- Generates a `quote.html` link with `lengths` and `height` query parameters.

## Integration with brick calculator

- Saved measurements generate a `quote.html` URL.
- Example: `/quote.html?layout=straight&lengths=5.40&height=1.80`
- The calculator page uses these values to compute bricks, mortar, and labour estimates.

## Known limitations

- iOS Safari and Chrome on iOS do not support WebXR immersive AR as of iOS 18.
- True world-space AR on iOS requires a native app (ARKit) or a WebView with ARKit permissions.
- Camera fallback accuracy depends on user calibration and camera distance.
- WebXR AR requires a secure context (HTTPS or localhost) and a compatible Android device with ARCore.

## Testing performed

- Static syntax check passed for `assets/js/ar-measure.js`.
- HTML/CSS served correctly via local server.
- Manual mode and diagnostics verified through HTML structure.
- AR / Camera modes require real hardware and were validated against the WebXR / getUserMedia API checks only.

## Recommended next steps

1. Deploy to GitHub Pages (HTTPS required for camera/WebXR).
2. Test on an Android device with ARCore to confirm WebXR AR mode.
3. Test on iPhone 16 Pro to confirm the camera fallback and diagnostics report.
4. Verify the `quote.html` integration accepts the generated parameters.
