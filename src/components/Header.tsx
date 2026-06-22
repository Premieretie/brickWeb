'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="main-header">
      <div className="container">
        <Link href="/" className="logo">
          <svg width="32" height="32" viewBox="0 0 40 40" aria-hidden="true">
            <rect x="4" y="4" width="14" height="14" fill="#C75B39" />
            <rect x="22" y="4" width="14" height="14" fill="#A0442A" />
            <rect x="4" y="22" width="14" height="14" fill="#A0442A" />
            <rect x="22" y="22" width="14" height="14" fill="#C75B39" />
          </svg>
          <span>BrickQuote<span className="pro">Pro</span></span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/quote" className={pathname === '/quote' ? 'active' : ''}>Calculator</Link>
          <Link href="/services/brick-fences" className={pathname.startsWith('/services') ? 'active' : ''}>Services</Link>
          <Link href="/locations/brisbane" className={pathname.startsWith('/locations') ? 'active' : ''}>Locations</Link>
          <Link href="/faq" className={pathname === '/faq' ? 'active' : ''}>FAQ</Link>
          <Link href="/quote" className="btn-primary quote-btn">Get Quote</Link>
        </nav>
      </div>
    </header>
  );
}
