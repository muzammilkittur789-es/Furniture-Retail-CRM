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
  title: 'Alishan Furnitures | Showroom Management Operating System',
  description:
    'Operating System for Alishan Furnitures Showroom: Luxury furniture catalog, instant WhatsApp quotations, 24-hour stock holds, and staff attribution.',
  metadataBase: new URL('https://alishanfurnitures.com'),
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
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Alishan Furnitures | Showroom Management Operating System',
    description: 'Luxury furniture catalog and digital quotation system.',
    url: 'https://alishanfurnitures.com',
    siteName: 'Alishan Furnitures',
    locale: 'en_IN',
    type: 'website',
  },
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
