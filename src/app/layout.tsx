import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://brickquotepro.com'),
  title: {
    default: 'BrickQuote Pro | Brick Fence & Wall Calculator Brisbane',
    template: '%s | BrickQuote Pro',
  },
  description:
    'Free brick fence and wall calculator for Brisbane. Get instant quotes for brick fences, retaining walls, mailboxes and piers. No signup required.',
  keywords: [
    'brick fence calculator',
    'brick wall cost Brisbane',
    'retaining wall quote',
    'brick fence cost',
    'bricklayer Brisbane',
  ],
  authors: [{ name: 'BrickQuote Pro' }],
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: 'https://brickquotepro.com',
    siteName: 'BrickQuote Pro',
    title: 'BrickQuote Pro | Brick Fence & Wall Calculator Brisbane',
    description:
      'Free brick fence and wall calculator for Brisbane. Get instant quotes. No signup required.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BrickQuote Pro',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BrickQuote Pro | Brick Fence & Wall Calculator Brisbane',
    description: 'Free brick fence and wall calculator for Brisbane.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
