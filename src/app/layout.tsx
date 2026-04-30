import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Guitta Monatega',
  description: 'Portfolio — Guitta Monatega',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,100;0,300;0,400;0,500;0,600;0,700;1,100;1,300;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
