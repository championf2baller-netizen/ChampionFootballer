import type { Metadata } from "next";
import { Anton, Inter, Geist, Geist_Mono, Bebas_Neue, Oswald, League_Spartan } from "next/font/google";
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

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas-neue',
  display: 'swap',
  preload: false,
});

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-geist-anton',
  display: 'swap',
});

const oswald = Oswald({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
  preload: false,
});

const leagueSpartan = League_Spartan({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-league-spartan',
  display: 'swap',
  preload: false,
});

const inter = Inter({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: 'swap',
  preload: false,
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: 'swap',
  preload: false,
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
        <link rel="preload" href="/assets/images/hero_top_bg.webp" as="image" type="image/webp" fetchPriority="high" />
        <link rel="preload" href="/assets/images/logonavbar.webp" as="image" type="image/webp" fetchPriority="high" />
        {apiHostname && (
          <>
            <link rel="dns-prefetch" href={`//${apiHostname}`} />
            <link rel="preconnect" href={apiUrl} crossOrigin="use-credentials" />
          </>
        )}
      </head>
      <body
        className={`${woodfordBournePro.variable} ${geistSans.variable} ${geistMono.variable} ${anton.variable} ${inter.variable} ${bebasNeue.variable} ${oswald.variable} ${leagueSpartan.variable} antialiased`}
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
