import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'The Pet Point — Find Trusted Pet Services Near You',
  description: 'Discover local pet groomers, trainers, boarding, vets, and more in Toronto. Book trusted pet service providers on The Pet Point.',
  keywords: 'pet services Toronto, dog grooming Toronto, pet boarding, cat sitter, dog trainer',
  openGraph: {
    title: 'The Pet Point',
    description: 'Connect with trusted local pet service providers.',
    url: 'https://thepetpoint.ca',
    siteName: 'The Pet Point',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
