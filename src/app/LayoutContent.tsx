'use client';

import Navbar from "@/Components/Navbar/navbar";
// import Footer from "@/Components/footer/footer";
// import Mainbg from '@/Components/images/mainbg.webp'
// import Mainbg from '@/Components/images/newbg.png'
import Mainbg from '@/Components/images/bgall.png'
import { usePathname } from 'next/navigation';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const resolvedPathname = pathname ?? '';
  const isMainPage = resolvedPathname === '/';
  const isAdminPage = resolvedPathname.startsWith('/admin');

  return (
    <>
      <main
        id="main-content"
        className="mobile-hide-bg-img"
        role="main"
        style={{
          backgroundImage: (isMainPage || isAdminPage) ? 'none' : `url(${Mainbg.src})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
          backgroundColor: '#0E0E0E',
        }}
      >
        {!isMainPage && !isAdminPage && <Navbar />}
        {children}
        {/* {!isMainPage && <Footer />} */}
      </main>
    </>
  );
}

export default LayoutContent; 
