import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo">
              <svg width="28" height="28" viewBox="0 0 40 40" aria-hidden="true">
                <rect x="4" y="4" width="14" height="14" fill="#C75B39" />
                <rect x="22" y="4" width="14" height="14" fill="#A0442A" />
                <rect x="4" y="22" width="14" height="14" fill="#A0442A" />
                <rect x="22" y="22" width="14" height="14" fill="#C75B39" />
              </svg>
              <span>BrickQuote<span className="pro">Pro</span></span>
            </Link>
            <p>Free brick fence and wall cost estimator for Brisbane homeowners and contractors.</p>
          </div>
          <div className="footer-links">
            <h4>Services</h4>
            <ul>
              <li><Link href="/services/brick-fences">Brick Fences</Link></li>
              <li><Link href="/services/block-fences">Block Fences</Link></li>
              <li><Link href="/services/retaining-walls">Retaining Walls</Link></li>
              <li><Link href="/services/brick-mailboxes">Brick Mailboxes</Link></li>
              <li><Link href="/services/brick-piers">Brick Piers</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Locations</h4>
            <ul>
              <li><Link href="/locations/brisbane">Brisbane</Link></li>
              <li><Link href="/locations/gold-coast">Gold Coast</Link></li>
              <li><Link href="/locations/ipswich">Ipswich</Link></li>
              <li><Link href="/locations/logan">Logan</Link></li>
              <li><Link href="/locations/sunshine-coast">Sunshine Coast</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Marketplace</h4>
            <ul>
              <li><Link href="/contractors">Find a Contractor</Link></li>
              <li><Link href="/join">Join as a Pro</Link></li>
              <li><Link href="/quote">Calculator</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Legal</h4>
            <ul>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/contractor-agreement">Contractor Agreement</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} BrickQuote Pro. All rights reserved.</p>
          <p className="disclaimer">
            Prices are estimates only. Always obtain a formal quote from a licensed contractor before committing to any work.
          </p>
        </div>
      </div>
    </footer>
  );
}
