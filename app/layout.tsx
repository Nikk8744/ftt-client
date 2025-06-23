import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display, DM_Sans } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900']
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
  // Include the full range of weights
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900', '1000'],
  // Include italic styles
  style: ['normal', 'italic']
});

export const metadata: Metadata = {
  title: 'Freelance Time Tracker',
  description: 'Track your time spent on freelance projects',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${dmSans.variable}`}>
      <body className={`${inter.className} antialiased m-0 p-0`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
