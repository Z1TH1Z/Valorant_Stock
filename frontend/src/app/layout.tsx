import type { Metadata } from 'next';
import { Inter, Teko } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const teko = Teko({
  variable: '--font-tungsten',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'VCT Performance Tracker',
  description: 'Bloomberg Terminal for Valorant Esports',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${teko.variable} antialiased font-sans flex h-screen overflow-hidden bg-background text-foreground`}>
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-8 bg-background">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
