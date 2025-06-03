'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthDebugPage() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const checkAuth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        setError(`Session error: ${sessionError.message}`);
      }
      
      // Get user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        setError(prev => `${prev}\nUser error: ${userError.message}`);
      }
      
      setSessionData({
        session,
        user,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      setError(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      checkAuth();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const clearSession = async () => {
    await supabase.auth.signOut();
    checkAuth();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={checkAuth} disabled={loading}>
                Refresh Auth State
              </Button>
              <Button onClick={clearSession} variant="destructive">
                Clear Session
              </Button>
              <Link href="/en/login">
                <Button variant="outline">Go to Login</Button>
              </Link>
              <Link href="/en/dashboard">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            </div>
            
            {loading && <p>Checking authentication...</p>}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <pre className="text-sm text-red-600">{error}</pre>
              </div>
            )}
            
            {sessionData && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Session Status:</h3>
                  <p className={sessionData.session ? "text-green-600" : "text-red-600"}>
                    {sessionData.session ? "✓ Active Session" : "✗ No Session"}
                  </p>
                </div>
                
                {sessionData.user && (
                  <div>
                    <h3 className="font-semibold mb-2">User Info:</h3>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify({
                        id: sessionData.user.id,
                        email: sessionData.user.email,
                        role: sessionData.user.role,
                        created_at: sessionData.user.created_at,
                      }, null, 2)}
                    </pre>
                  </div>
                )}
                
                {sessionData.session && (
                  <div>
                    <h3 className="font-semibold mb-2">Session Details:</h3>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify({
                        access_token: sessionData.session.access_token ? '***' + sessionData.session.access_token.slice(-10) : null,
                        refresh_token: sessionData.session.refresh_token ? '***' + sessionData.session.refresh_token.slice(-10) : null,
                        expires_at: sessionData.session.expires_at,
                        expires_in: sessionData.session.expires_in,
                      }, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold mb-2">Environment:</h3>
                  <pre className="bg-gray-100 p-4 rounded text-sm">
                    Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}
                    Timestamp: {sessionData.timestamp}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}