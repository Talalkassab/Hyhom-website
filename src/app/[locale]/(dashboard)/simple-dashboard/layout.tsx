'use client';

import { SimpleAuthProvider } from '@/contexts/SimpleAuthContext';

export default function SimpleDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SimpleAuthProvider>
      {children}
    </SimpleAuthProvider>
  );
}