'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, refreshAuth } = useAuthContext();
  const router = useRouter();
  const [showTimeout, setShowTimeout] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Track when component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Dashboard layout state:', { 
      user: user?.email, 
      loading, 
      mounted,
      pathname: window.location.pathname 
    });
  }, [user, loading, mounted]);

  useEffect(() => {
    // Only redirect after component is mounted and we're sure there's no user
    if (mounted && !loading && !user) {
      console.log('No user found, redirecting to login');
      router.push('/en/login');
    }
  }, [user, loading, router, mounted]);

  // Show timeout message after 3 seconds
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowTimeout(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowTimeout(false);
    }
  }, [loading]);

  if (loading) {
    console.log('Dashboard layout showing loading spinner...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-hyhom-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
          <p className="text-xs text-gray-400 mt-2">
            Debug: loading={loading.toString()}, user={user?.email || 'null'}
          </p>
          
          {showTimeout && (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-orange-600">
                Loading is taking longer than expected...
              </p>
              <div className="flex gap-2 justify-center">
                <Link href="/test-auth">
                  <Button size="sm" variant="outline">
                    Test Auth
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => refreshAuth()}
                >
                  Refresh Auth
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}