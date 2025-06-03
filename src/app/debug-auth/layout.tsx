'use client';

import { SimpleAuthProvider } from '@/contexts/SimpleAuthContext';

export default function DebugAuthLayout({
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