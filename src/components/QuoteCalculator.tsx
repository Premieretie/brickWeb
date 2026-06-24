'use client';

import { useState, useCallback } from 'react';
import { BRICKQUOTE_CONFIG, calculateQuote, suggestColumns, type QuoteState } from '@/lib/pricing';
import { saveQuote } from '@/app/quote/actions';
import LeadCaptureForm from '@/components/LeadCaptureForm';

const DEFAULT_STATE: QuoteState = {
  materialType: 'brick',
  projectType: 'brick-fence',
  layout: 'straight',
  lengths: [10],
  height: 1.8,
  brick: 'single-face-standard',
  columnSize: '230',
  columnCount: 2,
  mailboxType: 'none',
  estimateLevel: 'typical',
};

export default function QuoteCalculator() {
  const [state, setState] = useState<QuoteState>(DEFAULT_STATE);
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const update = useCallback((patch: Partial<QuoteState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const quote = calculateQuote(state);

  const handleLengthChange = (idx: number, val: string) => {
    const lengths = [...state.lengths];
    lengths[idx] = parseFloat(val) || 0;
    setState((prev) => ({ ...prev, lengths }));
  };

  const handleLayoutChange = (layout: string) => {
    const cfg = BRICKQUOTE_CONFIG.layouts[layout as keyof typeof BRICKQUOTE_CONFIG.layouts];
    setState((prev) => ({ ...prev, layout, lengths: [...cfg.defaultLengths] }));
  };

  const handleColumnSizeChange = (columnSize: string) => {
    const totalLength = state.lengths.reduce((a, b) => a + b, 0);
    const columnCount = columnSize === 'none' ? 0 : suggestColumns(totalLength, columnSize);
    setState((prev) => ({ ...prev, columnSize, columnCount }));
  };

  const copyLink = () => {
    const params = new URLSearchParams({
      mt: state.materialType,
      pt: state.projectType,
      lay: state.layout,
      len: state.lengths.join(','),
      h: String(state.height),
      b: state.brick,
      cs: state.columnSize,
      cc: String(state.columnCount),
      mb: state.mailboxType,
      el: state.estimateLevel,
    });
    navigator.clipboard.writeText(`${window.location.origin}/quote?${params}`).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const generatePDF = () => {
    const content = `
<!DOCTYPE html><html><head><title>BrickQuote Pro — Estimate</title>
<style>
  body{font-family:Arial,sans-serif;padding:40px;color:#333}
  h1{color:#C75B39;border-bottom:3px solid #C75B39;padding-bottom:10px}
  .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}
  .total{font-size:22px;font-weight:700;color:#C75B39;margin-top:20px}
  .disc{font-size:10px;color:#666;margin-top:40px;padding:16px;background:#f5f5f5;border-radius:8px}
</style></head><body>
<div style="text-align:right;color:#999;font-size:12px">Generated: ${new Date().toLocaleDateString('en-AU')}</div>
<h1>BrickQuote Pro — Estimate</h1>
${quote.breakdown.map((r) => `<div class="row"><span>${r.label}</span><span>${r.value}</span></div>`).join('')}
<div class="total">Total Estimate: $${quote.totalAvg.toLocaleString()}</div>
<div class="disc">${BRICKQUOTE_CONFIG.disclaimer}</div>
</body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(content); w.document.close(); setTimeout(() => w.print(), 400); }
  };

  const handleSaveQuote = async () => {
    setSaveLoading(true);
    setSaveMessage('');
    const result = await saveQuote(state, {
      totalAvg: quote.totalAvg,
      materialName: quote.materialName,
    });
    setSaveLoading(false);
    if (result.success) {
      setSaveMessage('Quote saved to your dashboard.');
    } else {
      setSaveMessage(result.error || 'Failed to save quote.');
    }
  };

  const brickOptions = state.materialType === 'brick' ? BRICKQUOTE_CONFIG.bricks : BRICKQUOTE_CONFIG.blocks;

  return (
    <div className="calculator-page">
      <div className="calculator-layout">
        {/* Left: Controls */}
        <div className="calc-controls">
          <h1 className="calc-title">Brick Fence Calculator</h1>

          {/* Material Type */}
          <div className="calc-section">
            <h2>Material Type</h2>
            <div className="radio-group">
              {(['brick', 'block'] as const).map((m) => (
                <label key={m} className={`radio-card ${state.materialType === m ? 'active' : ''}`}>
                  <input type="radio" name="materialType" value={m} checked={state.materialType === m}
                    onChange={() => {
                      const defaultBrick = m === 'brick' ? 'single-face-standard' : 'smooth-190-grey';
                      update({ materialType: m, brick: defaultBrick });
                    }} />
                  {m === 'brick' ? 'Clay Brick' : 'Concrete Block'}
                </label>
              ))}
            </div>
          </div>

          {/* Project Type */}
          <div className="calc-section">
            <h2>Project Type</h2>
            <div className="radio-group">
              {Object.entries(BRICKQUOTE_CONFIG.projectTypes).map(([id, cfg]) => (
                <label key={id} className={`radio-card ${state.projectType === id ? 'active' : ''}`}>
                  <input type="radio" name="projectType" value={id} checked={state.projectType === id}
                    onChange={() => update({ projectType: id })} />
                  {cfg.name}
                </label>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div className="calc-section">
            <h2>Layout</h2>
            <div className="radio-group">
              {Object.entries(BRICKQUOTE_CONFIG.layouts).map(([id, cfg]) => (
                <label key={id} className={`radio-card ${state.layout === id ? 'active' : ''}`}>
                  <input type="radio" name="layout" value={id} checked={state.layout === id}
                    onChange={() => handleLayoutChange(id)} />
                  {cfg.name}
                </label>
              ))}
            </div>
          </div>

          {/* Lengths */}
          <div className="calc-section">
            <h2>Wall Lengths (metres)</h2>
            {state.lengths.map((len, i) => (
              <div key={i} className="length-input">
                <label>Section {i + 1}</label>
                <input type="number" min="0.5" max="200" step="0.5" value={len}
                  onChange={(e) => handleLengthChange(i, e.target.value)} />
                <span>m</span>
              </div>
            ))}
          </div>

          {/* Height */}
          <div className="calc-section">
            <h2>Height: <strong>{state.height}m</strong></h2>
            <input type="range" min="0.6" max="3.0" step="0.1" value={state.height}
              onChange={(e) => update({ height: parseFloat(e.target.value) })}
              className="range-slider" />
            <div className="preset-btns">
              {[0.9, 1.2, 1.5, 1.8, 2.1].map((h) => (
                <button key={h} className={`preset-btn ${state.height === h ? 'active' : ''}`}
                  onClick={() => update({ height: h })}>{h}m</button>
              ))}
            </div>
          </div>

          {/* Brick Style */}
          <div className="calc-section">
            <h2>Brick / Block Style</h2>
            <div className="radio-group">
              {brickOptions.map((b) => (
                <label key={b.id} className={`radio-card ${state.brick === b.id ? 'active' : ''}`}>
                  <input type="radio" name="brick" value={b.id} checked={state.brick === b.id}
                    onChange={() => update({ brick: b.id })} />
                  <span className="brick-swatch" style={{ background: b.color }} />
                  {b.name}
                </label>
              ))}
            </div>
          </div>

          {/* Piers */}
          <div className="calc-section">
            <h2>Pier Size</h2>
            <div className="radio-group">
              {Object.entries(BRICKQUOTE_CONFIG.columns).map(([id, cfg]) => (
                <label key={id} className={`radio-card ${state.columnSize === id ? 'active' : ''}`}>
                  <input type="radio" name="columnSize" value={id} checked={state.columnSize === id}
                    onChange={() => handleColumnSizeChange(id)} />
                  {cfg.name}
                </label>
              ))}
            </div>
            {state.columnSize !== 'none' && (
              <div className="length-input" style={{ marginTop: 12 }}>
                <label>Number of piers</label>
                <input type="number" min="0" max="50" value={state.columnCount}
                  onChange={(e) => update({ columnCount: parseInt(e.target.value) || 0 })} />
              </div>
            )}
          </div>

          {/* Mailbox */}
          <div className="calc-section">
            <h2>Mailbox</h2>
            <div className="radio-group">
              {Object.entries(BRICKQUOTE_CONFIG.mailboxes).map(([id, cfg]) => (
                <label key={id} className={`radio-card ${state.mailboxType === id ? 'active' : ''}`}>
                  <input type="radio" name="mailboxType" value={id} checked={state.mailboxType === id}
                    onChange={() => update({ mailboxType: id })} />
                  {cfg.name}
                </label>
              ))}
            </div>
          </div>

          {/* Estimate Level */}
          <div className="calc-section">
            <h2>Estimate Quality</h2>
            <div className="radio-group">
              {Object.entries(BRICKQUOTE_CONFIG.estimateLevels).map(([id, cfg]) => (
                <label key={id} className={`radio-card ${state.estimateLevel === id ? 'active' : ''}`}>
                  <input type="radio" name="estimateLevel" value={id}
                    checked={state.estimateLevel === (id as QuoteState['estimateLevel'])}
                    onChange={() => update({ estimateLevel: id as QuoteState['estimateLevel'] })} />
                  <strong>{cfg.name}</strong> — {cfg.description}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="calc-results">
          <div className="results-sticky">
            <div className="results-card">
              <div className="results-header">
                <h2>Your Estimate</h2>
                <span className="estimate-badge">{BRICKQUOTE_CONFIG.estimateLevels[state.estimateLevel].name}</span>
              </div>

              <div className="results-summary">
                <div className="summary-row">
                  <span>Wall Area</span>
                  <strong>{quote.wallArea} m²</strong>
                </div>
                <div className="summary-row">
                  <span>Piers</span>
                  <strong>{quote.columnCount}</strong>
                </div>
              </div>

              <div className="price-display">
                <div className="price-main">${quote.totalAvg.toLocaleString()}</div>
                <div className="price-range">${quote.totalMin.toLocaleString()} – ${quote.totalMax.toLocaleString()}</div>
              </div>

              <div className="breakdown-list">
                {quote.breakdown.map((item, i) => (
                  <div key={i} className={`breakdown-row ${item.highlight ? 'highlight' : ''}`}>
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>

              <p className="disclaimer-text">{BRICKQUOTE_CONFIG.disclaimer}</p>

              {saveMessage && <p className="save-message">{saveMessage}</p>}

              <div className="results-actions">
                <button className="btn-primary btn-block" onClick={generatePDF}>Download PDF</button>
                <button className="btn-secondary btn-block" onClick={copyLink}>
                  {saved ? '✓ Copied!' : 'Copy Share Link'}
                </button>
                <button className="btn-secondary btn-block" onClick={handleSaveQuote} disabled={saveLoading}>
                  {saveLoading ? 'Saving…' : 'Save Quote'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lead-capture-section">
        <div className="container">
          <div className="lead-capture-layout">
            <div className="lead-capture-info">
              <h2>Get quotes from licensed bricklayers</h2>
              <p>
                Stop guessing. Submit your estimate and a qualified contractor will contact you with a real quote for your project.
              </p>
              <ul>
                <li>✓ Free, no obligation</li>
                <li>✓ Licensed and insured contractors</li>
                <li>✓ Compare multiple quotes</li>
              </ul>
            </div>
            <LeadCaptureForm quoteState={state} quoteResult={quote} />
          </div>
        </div>
      </div>

      <style>{`
        .calculator-page { padding: 40px 0 80px; }
        .calculator-layout { display: grid; grid-template-columns: 1fr 380px; gap: 40px; max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .calc-title { font-size: 2rem; margin-bottom: 32px; }
        .calc-section { margin-bottom: 28px; }
        .calc-section h2 { font-size: 1rem; font-weight: 600; margin-bottom: 12px; color: var(--text); }
        .radio-group { display: flex; flex-wrap: wrap; gap: 8px; }
        .radio-card { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border: 2px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 0.9rem; transition: all 0.15s; background: white; }
        .radio-card input { display: none; }
        .radio-card.active { border-color: var(--primary); background: #fff8f5; color: var(--primary); font-weight: 600; }
        .radio-card:hover { border-color: var(--primary); }
        .brick-swatch { width: 14px; height: 14px; border-radius: 3px; flex-shrink: 0; }
        .length-input { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .length-input label { min-width: 80px; font-size: 0.9rem; color: var(--text-light); }
        .length-input input { width: 100px; padding: 8px 12px; border: 2px solid var(--border); border-radius: 6px; font-size: 1rem; }
        .length-input input:focus { outline: none; border-color: var(--primary); }
        .range-slider { width: 100%; accent-color: var(--primary); margin: 8px 0; }
        .preset-btns { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
        .preset-btn { padding: 6px 12px; border: 2px solid var(--border); border-radius: 6px; background: white; cursor: pointer; font-size: 0.85rem; transition: all 0.15s; }
        .preset-btn.active { border-color: var(--primary); color: var(--primary); font-weight: 600; }
        .results-sticky { position: sticky; top: 100px; }
        .results-card { background: white; border-radius: 20px; padding: 28px; box-shadow: var(--shadow-lg); border: 2px solid var(--border); }
        .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .results-header h2 { font-size: 1.2rem; }
        .estimate-badge { background: var(--primary); color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .results-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .summary-row { background: var(--bg); border-radius: 8px; padding: 12px; text-align: center; }
        .summary-row span { display: block; font-size: 0.8rem; color: var(--text-light); margin-bottom: 4px; }
        .summary-row strong { font-size: 1.2rem; font-weight: 700; }
        .price-display { text-align: center; padding: 20px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin-bottom: 20px; }
        .price-main { font-size: 3rem; font-weight: 800; color: var(--primary); line-height: 1; }
        .price-range { font-size: 0.9rem; color: var(--text-light); margin-top: 6px; }
        .breakdown-list { margin-bottom: 16px; }
        .breakdown-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.9rem; border-bottom: 1px solid var(--bg); }
        .breakdown-row.highlight { font-weight: 700; color: var(--primary); border-bottom: none; padding-top: 10px; }
        .disclaimer-text { font-size: 0.75rem; color: var(--text-light); line-height: 1.4; margin-bottom: 20px; }
        .results-actions { display: flex; flex-direction: column; gap: 10px; }
        .save-message { font-size: 0.85rem; color: var(--primary); text-align: center; margin-bottom: 8px; }
        .lead-capture-section { padding: 80px 0; background: var(--secondary); color: white; }
        .lead-capture-layout { display: grid; grid-template-columns: 1fr 460px; gap: 60px; align-items: start; max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .lead-capture-info h2 { font-size: 2.2rem; margin-bottom: 20px; }
        .lead-capture-info p { font-size: 1.1rem; opacity: 0.85; margin-bottom: 24px; }
        .lead-capture-info ul { list-style: none; }
        .lead-capture-info li { margin-bottom: 12px; font-size: 1rem; opacity: 0.9; }
        @media (max-width: 900px) {
          .calculator-layout { grid-template-columns: 1fr; }
          .results-sticky { position: static; }
          .lead-capture-layout { grid-template-columns: 1fr; gap: 32px; }
        }
      `}</style>
    </div>
  );
}
