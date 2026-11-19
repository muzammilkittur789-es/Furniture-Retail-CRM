import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Alishan Furnitures | Showroom Management System',
  description: 'Operating System for Alishan Furnitures Showroom',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className={`${outfit.className} min-h-full flex flex-col bg-[#FAF8F5] text-[#171513] selection:bg-[#C5A880]/30 selection:text-[#171513]`}>
        {children}
      </body>
    </html>
  );
}
