'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useChannels } from '@/hooks/useChannels';
import { Hash, Plus, Users, Lock, Megaphone, Building } from 'lucide-react';

// Static translations
const t = {
  'channels.title': 'Channels',
  'channels.subtitle': 'Join channels to collaborate with your team',
  'channels.create': 'Create Channel',
  'channels.join': 'Join',
  'channels.leave': 'Leave',
  'channels.members': 'members',
  'channels.member': 'member',
  'channels.joined': 'Joined',
  'channels.createDialog.title': 'Create New Channel',
  'channels.createDialog.description': 'Create a new channel for your team to collaborate',
  'channels.form.name': 'Channel Name',
  'channels.form.nameAr': 'Channel Name (Arabic)',
  'channels.form.description': 'Description',
  'channels.form.descriptionAr': 'Description (Arabic)',
  'channels.form.type': 'Channel Type',
  'channels.form.department': 'Department',
  'channels.type.public': 'Public',
  'channels.type.private': 'Private',
  'channels.type.department': 'Department',
  'channels.type.announcement': 'Announcement',
  'common.create': 'Create',
  'common.cancel': 'Cancel',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
};

const channelTypes = [
  { value: 'public', label: 'Public - Anyone can join', icon: Hash },
  { value: 'private', label: 'Private - Invite only', icon: Lock },
  { value: 'department', label: 'Department - For specific departments', icon: Building },
  { value: 'announcement', label: 'Announcement - Admin only posting', icon: Megaphone },
];

const departments = [
  { value: 'management', label: 'Management' },
  { value: 'operations', label: 'Operations' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'service', label: 'Service' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'finance', label: 'Finance' },
  { value: 'marketing', label: 'Marketing' },
];

export default function ChannelsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { channels, loading, joinChannel, leaveChannel, createChannel, getChannelMembers } = useChannels();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [channelMembers, setChannelMembers] = useState<Record<string, number>>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    type: 'public' as 'public' | 'private' | 'department' | 'announcement',
    department: '',
    icon: 'hash',
    color: '#2a577e',
  });

  const handleJoinChannel = async (channelId: string) => {
    const { error } = await joinChannel(channelId);
    if (error) {
      toast({
        title: t['common.error'],
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t['common.success'],
        description: 'Joined channel successfully',
      });
    }
  };

  const handleLeaveChannel = async (channelId: string) => {
    const { error } = await leaveChannel(channelId);
    if (error) {
      toast({
        title: t['common.error'],
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t['common.success'],
        description: 'Left channel successfully',
      });
    }
  };

  const handleCreateChannel = async () => {
    if (!formData.name || !formData.name_ar) {
      toast({
        title: t['common.error'],
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    const { error } = await createChannel(formData);
    
    if (error) {
      toast({
        title: t['common.error'],
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t['common.success'],
        description: 'Channel created successfully',
      });
      setIsCreateDialogOpen(false);
      setFormData({
        name: '',
        name_ar: '',
        description: '',
        description_ar: '',
        type: 'public',
        department: '',
        icon: 'hash',
        color: '#2a577e',
      });
    }
    setCreating(false);
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'private': return Lock;
      case 'announcement': return Megaphone;
      case 'department': return Building;
      default: return Hash;
    }
  };

  const getChannelBadge = (type: string) => {
    switch (type) {
      case 'private': return <Badge variant="secondary">Private</Badge>;
      case 'announcement': return <Badge variant="default" className="bg-yellow-500">Announcement</Badge>;
      case 'department': return <Badge variant="outline">Department</Badge>;
      default: return null;
    }
  };

  const navigateToChannel = (channelId: string) => {
    router.push(`/en/channels/${channelId}`);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <Hash className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">{t['common.loading']}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t['channels.title']}
          </h2>
          <p className="text-gray-600">
            {t['channels.subtitle']}
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-hyhom-primary hover:bg-hyhom-dark">
              <Plus className="h-4 w-4 mr-2" />
              {t['channels.create']}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t['channels.createDialog.title']}</DialogTitle>
              <DialogDescription>
                {t['channels.createDialog.description']}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t['channels.form.name']}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="general"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_ar">{t['channels.form.nameAr']}</Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                    placeholder="عام"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">{t['channels.form.description']}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Channel description..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description_ar">{t['channels.form.descriptionAr']}</Label>
                  <Textarea
                    id="description_ar"
                    value={formData.description_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                    placeholder="وصف القناة..."
                    dir="rtl"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">{t['channels.form.type']}</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {channelTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.type === 'department' && (
                <div className="space-y-2">
                  <Label htmlFor="department">{t['channels.form.department']}</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  {t['common.cancel']}
                </Button>
                <Button onClick={handleCreateChannel} disabled={creating}>
                  {creating ? t['common.loading'] : t['common.create']}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {channels.map((channel) => {
          const Icon = getChannelIcon(channel.type);
          const isJoined = channel.member_role !== undefined;
          
          return (
            <Card 
              key={channel.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => isJoined && navigateToChannel(channel.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Icon className="h-5 w-5" style={{ color: channel.color }} />
                    <span>{channel.name}</span>
                    {getChannelBadge(channel.type)}
                    {isJoined && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {t['channels.joined']}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {!isJoined ? (
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinChannel(channel.id);
                        }}
                        className="bg-hyhom-primary hover:bg-hyhom-dark"
                      >
                        {t['channels.join']}
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeaveChannel(channel.id);
                        }}
                      >
                        {t['channels.leave']}
                      </Button>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {channel.description || channel.description_ar}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{channelMembers[channel.id] || 0} {t['channels.members']}</span>
                  </div>
                  {channel.department && (
                    <Badge variant="outline">{channel.department}</Badge>
                  )}
                  {channel.is_default && (
                    <Badge variant="default" className="bg-blue-500">Default</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {channels.length === 0 && (
          <div className="text-center py-12">
            <Hash className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No channels available</h3>
            <p className="text-gray-500 mb-4">Create your first channel to get started</p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-hyhom-primary hover:bg-hyhom-dark"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t['channels.create']}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}