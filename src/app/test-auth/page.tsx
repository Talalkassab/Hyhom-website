'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestAuthPage() {
  const [status, setStatus] = useState('Checking...');
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      
      // Direct session check
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setStatus(`Error: ${error.message}`);
      } else if (session) {
        setStatus('Authenticated');
        setUser(session.user);
      } else {
        setStatus('Not authenticated');
      }
    };
    
    checkAuth();
  }, []);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Direct Auth Test</h1>
      <p className="mb-2">Status: <strong>{status}</strong></p>
      {user && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>Email: {user.email}</p>
          <p>ID: {user.id}</p>
        </div>
      )}
      <div className="mt-4 space-x-4">
        <a href="/en/login" className="text-blue-500 underline">Go to Login</a>
        <a href="/en/dashboard" className="text-blue-500 underline">Go to Dashboard</a>
      </div>
    </div>
  );
}