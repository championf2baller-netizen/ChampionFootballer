import type { Metadata } from "next";
import { Anton, Inter, Geist, Geist_Mono, Bebas_Neue, Oswald, League_Spartan } from "next/font/google";
import localFont from 'next/font/local';
import dynamic from 'next/dynamic';
import "./globals.css";
import "./bones/registry";
import { Providers } from "@/lib/providers";
import LayoutContent from './LayoutContent';
import Footer from "@/Components/footer/_components";

// Dynamically load non-critical client utilities to minimize layout.js bundle size (saves >29 KiB JS)
const AuthCheck = dynamic(() => import('@/Components/AuthCheck'), { ssr: false });
const ToasterProvider = dynamic(() => import('@/Components/ToasterProvider'), { ssr: false });
const AuthBootstrap = dynamic(() => import('@/Components/AuthBootstrap'), { ssr: false });
const ProductionOptimizer = dynamic(() => import('@/Components/ProductionOptimizer'), { ssr: false });
const FetchAuthMonitor = dynamic(() => import('@/Components/FetchAuthMonitor'), { ssr: false });
const RealtimeClient = dynamic(() => import('@/Components/RealtimeClient'), { ssr: false });
const GlobalCacheSync = dynamic(() => import('@/Components/GlobalCacheSync'), { ssr: false });

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
          <ProductionOptimizer /> {/* Initialize production optimizations */}
          <FetchAuthMonitor /> {/* Global fetch auth injection & debug */}
          <RealtimeClient /> {/* Start SSE connection for realtime updates */}
          <GlobalCacheSync /> {/* Keep caches aligned across all routes on data mutations */}
          <AuthBootstrap />
          <AuthCheck />
          <LayoutContent>
            {children}
            <Footer />
          </LayoutContent>
          <ToasterProvider /> {/* mount once */}
        </Providers>
      </body>
    </html>
  );
}
