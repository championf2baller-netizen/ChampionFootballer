'use client';

import dynamic from 'next/dynamic';

// Dynamic client component imports with ssr: false to prevent SSR hydration bloat and split client code
const AuthCheck = dynamic(() => import('@/Components/AuthCheck'), { ssr: false });
const ToasterProvider = dynamic(() => import('@/Components/ToasterProvider'), { ssr: false });
const AuthBootstrap = dynamic(() => import('@/Components/AuthBootstrap'), { ssr: false });
const ProductionOptimizer = dynamic(() => import('@/Components/ProductionOptimizer'), { ssr: false });
const FetchAuthMonitor = dynamic(() => import('@/Components/FetchAuthMonitor'), { ssr: false });
const RealtimeClient = dynamic(() => import('@/Components/RealtimeClient'), { ssr: false });
const GlobalCacheSync = dynamic(() => import('@/Components/GlobalCacheSync'), { ssr: false });

export default function ClientAppServices() {
  return (
    <>
      <ProductionOptimizer />
      <FetchAuthMonitor />
      <RealtimeClient />
      <GlobalCacheSync />
      <AuthBootstrap />
      <AuthCheck />
      <ToasterProvider />
    </>
  );
}
