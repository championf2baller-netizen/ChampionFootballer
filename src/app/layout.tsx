import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import "./bones/registry";
import { Providers } from "@/lib/providers";
import LayoutContent from './LayoutContent';
import Footer from "@/Components/footer/_components";
import ClientAppServices from "@/Components/ClientAppServices";

// Woodford Bourne Pro loaded via next/font/local so it is bundled into
// /_next/static/ and works correctly in standalone/production deployments
const woodfordBournePro = localFont({
  src: [
    { path: '../../public/assets/fonts/WoodfordBournePro-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/assets/fonts/WoodfordBournePro-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-woodford-bourne-pro',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "Champion Footballer",
  description: "Your ultimate football management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  let apiHostname: string | null = null;
  try { apiHostname = new URL(apiUrl).hostname; } catch { }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Inter:wght@400;600;700&family=League+Spartan:wght@400;700&family=Oswald:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link rel="preload" href="/assets/images/hero_top_bg.webp" as="image" type="image/webp" fetchPriority="high" />
        <link rel="preload" href="/assets/images/logonavbar.webp" as="image" type="image/webp" fetchPriority="high" />
        {apiHostname && (
          <>
            <link rel="dns-prefetch" href={`//${apiHostname}`} />
            <link rel="preconnect" href={apiUrl} crossOrigin="use-credentials" />
          </>
        )}
        <style>{`
          :root {
            --font-league-spartan: 'League Spartan', sans-serif;
            --font-bebas-neue: 'Bebas Neue', sans-serif;
            --font-geist-anton: 'Anton', sans-serif;
            --font-oswald: 'Oswald', sans-serif;
            --font-inter: 'Inter', sans-serif;
            --font-geist-sans: 'Inter', sans-serif;
            --font-geist-mono: monospace;
          }
        `}</style>
      </head>
      <body
        className={`${woodfordBournePro.variable} antialiased`}
        style={{ fontFamily: "var(--font-woodford-bourne-pro), Arial, Helvetica, sans-serif" }}
      >
        <Providers>
          <ClientAppServices />
          <LayoutContent>
            {children}
            <Footer />
          </LayoutContent>
        </Providers>
      </body>
    </html>
  );
}
