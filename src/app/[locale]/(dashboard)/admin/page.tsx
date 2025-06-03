'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { useChannels } from '@/hooks/useChannels';
import { usePresence } from '@/hooks/usePresence';
import { createClient } from '@/lib/supabase/client';
import { 
  Users, 
  Shield, 
  Hash, 
  Settings, 
  Activity,
  UserPlus,
  Crown,
  Eye,
  EyeOff,
  Search,
  MessageCircle
} from 'lucide-react';

// Static translations
const t = {
  'admin.title': 'Admin Panel',
  'admin.subtitle': 'Manage users, channels, and system settings',
  'admin.users': 'Users',
  'admin.channels': 'Channels',
  'admin.analytics': 'Analytics',
  'admin.settings': 'Settings',
  'admin.totalUsers': 'Total Users',
  'admin.onlineUsers': 'Online Users',
  'admin.totalChannels': 'Total Channels',
  'admin.totalMessages': 'Total Messages',
  'admin.searchUsers': 'Search users...',
  'admin.role': 'Role',
  'admin.department': 'Department',
  'admin.status': 'Status',
  'admin.actions': 'Actions',
  'admin.active': 'Active',
  'admin.inactive': 'Inactive',
  'admin.admin': 'Admin',
  'admin.supervisor': 'Supervisor',
  'admin.employee': 'Employee',
  'admin.makeAdmin': 'Make Admin',
  'admin.makeSupervisor': 'Make Supervisor',
  'admin.makeEmployee': 'Make Employee',
  'admin.deactivate': 'Deactivate',
  'admin.activate': 'Activate',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
};

interface UserData {
  id: string;
  email: string;
  full_name: string;
  full_name_ar: string;
  avatar_url: string | null;
  department: string | null;
  position: string | null;
  is_active: boolean;
  created_at: string;
  user_roles?: {
    role: 'admin' | 'supervisor' | 'employee';
  }[];
}

export default function AdminPage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { channels } = useChannels();
  const { onlineUsers, getOnlineCount } = usePresence();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    totalChannels: 0,
    totalMessages: 0,
  });
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
    fetchAnalytics();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: t['common.error'],
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Get total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total channels
      const { count: channelCount } = await supabase
        .from('channels')
        .select('*', { count: 'exact', head: true });

      // Get total messages
      const { count: messageCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      setAnalytics({
        totalUsers: userCount || 0,
        onlineUsers: getOnlineCount(),
        totalChannels: channelCount || 0,
        totalMessages: messageCount || 0,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'supervisor' | 'employee') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: newRole,
          assigned_by: user?.id,
        });

      if (error) {
        throw error;
      }

      toast({
        title: t['common.success'],
        description: `User role updated to ${newRole}`,
      });

      fetchUsers(); // Refresh users list
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: t['common.error'],
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: t['common.success'],
        description: `User ${!currentStatus ? 'activated' : 'deactivated'}`,
      });

      fetchUsers(); // Refresh users list
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: t['common.error'],
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.department && user.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getUserRole = (user: UserData): string => {
    return user.user_roles?.[0]?.role || 'employee';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'supervisor': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {t['admin.title']}
        </h2>
        <p className="text-gray-600">
          {t['admin.subtitle']}
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t['admin.totalUsers']}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t['admin.onlineUsers']}</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.onlineUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t['admin.totalChannels']}</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalChannels}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t['admin.totalMessages']}</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalMessages}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>{t['admin.users']}</span>
              </CardTitle>
              <CardDescription>
                Manage user roles and permissions
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t['admin.searchUsers']}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-pulse" />
              <p className="text-gray-600">{t['common.loading']}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((userData) => {
                const role = getUserRole(userData);
                
                return (
                  <div key={userData.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={userData.avatar_url || ''} />
                        <AvatarFallback>
                          {userData.full_name?.[0] || userData.full_name_ar?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">
                            {userData.full_name || userData.full_name_ar}
                          </h3>
                          <Badge 
                            variant="secondary"
                            className={`${getRoleBadgeColor(role)} text-white`}
                          >
                            {role}
                          </Badge>
                          {!userData.is_active && (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{userData.email}</span>
                          {userData.department && (
                            <Badge variant="outline">{userData.department}</Badge>
                          )}
                          {userData.position && (
                            <span>{userData.position}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Select 
                        value={role} 
                        onValueChange={(newRole: any) => updateUserRole(userData.id, newRole)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant={userData.is_active ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleUserStatus(userData.id, userData.is_active)}
                      >
                        {userData.is_active ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No users found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}