import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useLanguage } from '@/lib/i18n';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { direction } = useLanguage();
  
  return (
    <div dir={direction} className={direction === 'rtl' ? 'font-tajawal' : 'font-poppins'}>
      <Header />
      <main className="min-h-screen pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}
