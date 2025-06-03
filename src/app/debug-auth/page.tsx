'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DebugAuthPage() {
  const [email, setEmail] = useState('admin@admin.com');
  const [password, setPassword] = useState('password123');
  const [authState, setAuthState] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  const supabase = createClient();
  
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(`DEBUG: ${message}`);
  };

  useEffect(() => {
    addLog('Debug page loaded, checking initial auth state...');
    
    // Check initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      addLog(`Initial session check: ${session ? 'Session found' : 'No session'}, Error: ${error?.message || 'None'}`);
      setSession(session);
      setUser(session?.user || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`Auth state change: ${event}, User: ${session?.user?.email || 'None'}`);
      setAuthState(event);
      setSession(session);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const testLogin = async () => {
    addLog(`Attempting login with ${email}...`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      addLog(`Login result: ${data.user ? 'Success' : 'Failed'}, Error: ${error?.message || 'None'}`);
      
      if (data.session) {
        addLog(`Session created: ${data.session.access_token ? 'Yes' : 'No'}`);
        setSession(data.session);
        setUser(data.user);
      }
    } catch (err) {
      addLog(`Login exception: ${err}`);
    }
  };

  const testProfile = async () => {
    if (!user) {
      addLog('No user found, cannot test profile');
      return;
    }
    
    addLog(`Testing profile fetch for user: ${user.id}`);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      addLog(`Profile result: ${data ? 'Found' : 'Not found'}, Error: ${error?.message || 'None'}`);
      
      if (error && error.code === 'PGRST116') {
        addLog('Creating profile...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.email.split('@')[0],
            full_name_ar: user.email.split('@')[0],
            is_active: true,
          })
          .select()
          .single();
          
        addLog(`Profile creation: ${newProfile ? 'Success' : 'Failed'}, Error: ${createError?.message || 'None'}`);
      }
    } catch (err) {
      addLog(`Profile exception: ${err}`);
    }
  };

  const clearLogs = () => setLogs([]);

  const goToDashboard = () => {
    addLog('Navigating to dashboard...');
    window.location.href = '/ar/dashboard';
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Test Controls</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          
          <div className="space-y-2">
            <Button onClick={testLogin} className="w-full">Test Login</Button>
            <Button onClick={testProfile} className="w-full" variant="outline">Test Profile</Button>
            <Button onClick={goToDashboard} className="w-full" variant="secondary">Go to Dashboard</Button>
            <Button onClick={clearLogs} className="w-full" variant="destructive">Clear Logs</Button>
          </div>
          
          <div className="mt-6 space-y-2">
            <h3 className="font-medium">Current State</h3>
            <p><strong>Auth Event:</strong> {authState || 'None'}</p>
            <p><strong>User:</strong> {user?.email || 'None'}</p>
            <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Debug Logs</h2>
          <div className="bg-gray-100 p-4 rounded-lg h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-xs font-mono mb-1">{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}