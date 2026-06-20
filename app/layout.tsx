import type { Metadata } from 'next';
import './globals.css';
import { SITE_URL } from '../lib/config';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'STNDOUT',
  description: 'Play. Post. Get Discovered. The sports recruiting platform.',
  openGraph: {
    siteName: 'STNDOUT',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
