'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function ARMeasureClient() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/css/ar-measure.css';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <>
      <Script src="/assets/js/ar-measure.js" strategy="afterInteractive" />
      <div id="ar-measure-root">
        <section className="mode-selector" id="mode-selector">
          <div className="mode-selector-content">
            <h1>Smart Measurement</h1>
            <p className="mode-subtitle">Choose how you want to measure.</p>
            <div className="mode-cards" id="mode-cards">
              <button className="mode-card" data-mode="ar" id="mode-ar">
                <span className="mode-icon">✨</span>
                <span className="mode-title">AR Mode</span>
                <span className="mode-desc">World-space point placement</span>
                <span className="mode-status" id="status-ar">Checking…</span>
              </button>
              <button className="mode-card" data-mode="camera" id="mode-camera">
                <span className="mode-icon">📷</span>
                <span className="mode-title">Camera Mode</span>
                <span className="mode-desc">Measure with your camera</span>
                <span className="mode-status" id="status-camera">Checking…</span>
              </button>
              <button className="mode-card" data-mode="manual" id="mode-manual">
                <span className="mode-icon">📏</span>
                <span className="mode-title">Manual Mode</span>
                <span className="mode-desc">Enter measurements directly</span>
                <span className="mode-status" id="status-manual">Always available</span>
              </button>
            </div>
            <button className="btn-diagnostics" id="btn-diagnostics">Show Diagnostics</button>
          </div>
        </section>
      </div>
    </>
  );
}
