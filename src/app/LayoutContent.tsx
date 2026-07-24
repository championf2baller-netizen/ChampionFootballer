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

  return (
    <>
      <main
        id="main-content"
        role="main"
        style={{
          backgroundImage: isMainPage ? 'none' : `url(${Mainbg.src})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
          backgroundColor: 'black',
        }}
      >
        {!isMainPage && <Navbar />}
        {children}
        {/* {!isMainPage && <Footer />} */}
      </main>
    </>
  );
}

export default LayoutContent; 
