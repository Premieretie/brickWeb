'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: '/quote', label: 'Calculator', active: pathname === '/quote' },
    { href: '/contractors', label: 'Contractors', active: pathname.startsWith('/contractors') },
    { href: '/join', label: 'Join as Pro', active: pathname === '/join' },
    { href: '/faq', label: 'FAQ', active: pathname === '/faq' },
  ];

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
        <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={link.active ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/quote" className="btn-primary quote-btn" onClick={() => setMenuOpen(false)}>Get Quote</Link>
        </nav>
        <button
          className="mobile-menu-toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
