'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function LayoutContent({ children }) {
  const pathname = usePathname();
  const isAdminPanel = pathname?.startsWith('/dashboard');

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPanel && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAdminPanel && <Footer />}
    </div>
  );
}
