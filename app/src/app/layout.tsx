import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  style: ['normal', 'italic'],
  weight: ['700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CompSim Pro - Total Rewards Simulation',
  description:
    "MBA-level compensation and benefits strategy simulation. Play as Compensation Lead at BharatQuick - India's fastest-growing quick-commerce platform - and navigate 6 high-stakes quarters toward an IPO listing.",
  keywords: ['MBA', 'HR simulation', 'compensation', 'benefits', 'BharatQuick', 'HES'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeScript = `
    (function() {
      try {
        var saved = localStorage.getItem('compsim-theme');
        if (saved === 'light') {
          document.documentElement.setAttribute('data-theme', 'light');
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
        }
      } catch(e) {}
    })();
  `;

  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

