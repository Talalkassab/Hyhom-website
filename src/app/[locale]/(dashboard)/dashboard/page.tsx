'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Static translations object
const t = {
  'common.welcome': 'Welcome',
  'navigation.channels': 'Channels',
  'navigation.directMessages': 'Direct Messages',
  'navigation.profile': 'Profile'
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuthContext();
  const { profile, loading: profileLoading, error: profileError } = useProfile();
  
  // Add debug logging
  console.log('Dashboard - user:', user?.email, 'profile:', profile, 'authLoading:', authLoading, 'profileLoading:', profileLoading);
  
  // Show loading only if auth is still loading
  if (authLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hyhom-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Don't block the UI if only profile is loading
  const displayName = profile?.full_name || user?.email || 'User';
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {t['common.welcome']}, {displayName}!
        </h2>
        <p className="text-gray-600">
          Welcome to HYHOM Connect. Start communicating with your team.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Link href="/en/channels">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <MessageCircle className="h-6 w-6 text-hyhom-primary" />
                <span>{t['navigation.channels']}</span>
              </CardTitle>
              <CardDescription>
                Join channels and start conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-hyhom-primary hover:bg-hyhom-dark">
                Browse Channels
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/en/messages">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <Users className="h-6 w-6 text-hyhom-secondary" />
                <span>{t['navigation.directMessages']}</span>
              </CardTitle>
              <CardDescription>
                Send private messages to colleagues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/en/profile">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <Settings className="h-6 w-6 text-gray-600" />
                <span>{t['navigation.profile']}</span>
              </CardTitle>
              <CardDescription>
                Update your profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest messages and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity. Start a conversation!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}