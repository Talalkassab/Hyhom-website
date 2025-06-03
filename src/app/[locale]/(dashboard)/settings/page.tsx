'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { createClient } from '@/lib/supabase/client';
import { Settings as SettingsIcon, ArrowLeft, Globe, Bell, Mail, MessageSquare, Users, Calendar } from 'lucide-react';
import Link from 'next/link';

const settingsSchema = z.object({
  language: z.enum(['en', 'ar']),
  timezone: z.string(),
  email_notifications: z.boolean(),
  push_notifications: z.boolean(),
  message_notifications: z.boolean(),
  mention_notifications: z.boolean(),
  channel_notifications: z.boolean(),
  direct_message_notifications: z.boolean(),
  announcement_notifications: z.boolean(),
  meeting_notifications: z.boolean(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

const languages = [
  { value: 'en', label: 'English', labelAr: 'الإنجليزية' },
  { value: 'ar', label: 'العربية', labelAr: 'Arabic' },
];

const timezones = [
  { value: 'Asia/Riyadh', label: 'Riyadh (UTC+3)', labelAr: 'الرياض (UTC+3)' },
  { value: 'Asia/Dubai', label: 'Dubai (UTC+4)', labelAr: 'دبي (UTC+4)' },
  { value: 'Asia/Kuwait', label: 'Kuwait (UTC+3)', labelAr: 'الكويت (UTC+3)' },
  { value: 'Asia/Qatar', label: 'Doha (UTC+3)', labelAr: 'الدوحة (UTC+3)' },
  { value: 'Asia/Bahrain', label: 'Manama (UTC+3)', labelAr: 'المنامة (UTC+3)' },
];

// Static translations object
const t = {
  'settings.title': 'Settings',
  'settings.subtitle': 'Manage your preferences and notification settings',
  'settings.language': 'Language',
  'settings.timezone': 'Timezone',
  'settings.notifications': 'Notifications',
  'settings.email': 'Email Notifications',
  'settings.push': 'Push Notifications',
  'settings.messages': 'Message Notifications',
  'settings.mentions': 'Mention Notifications',
  'settings.channels': 'Channel Notifications',
  'settings.directMessages': 'Direct Message Notifications',
  'settings.announcements': 'Announcement Notifications',
  'settings.meetings': 'Meeting Notifications',
  'common.save': 'Save Settings',
  'common.loading': 'Saving...',
  'common.success': 'Success',
  'common.error': 'Error',
  'settings.languageDesc': 'Choose your preferred language for the interface',
  'settings.timezoneDesc': 'Set your local timezone for accurate timestamps',
  'settings.emailDesc': 'Receive email notifications for important updates',
  'settings.pushDesc': 'Receive push notifications on your device',
  'settings.messagesDesc': 'Get notified when you receive new messages',
  'settings.mentionsDesc': 'Get notified when someone mentions you',
  'settings.channelsDesc': 'Get notified for new messages in channels you follow',
  'settings.directMessagesDesc': 'Get notified for new direct messages',
  'settings.announcementsDesc': 'Get notified for company announcements',
  'settings.meetingsDesc': 'Get notified for meeting reminders and updates',
};

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const { profile, updateProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const getSettingsValue = (key: string, defaultValue: any) => {
    try {
      const settings = profile?.settings as any;
      return settings?.[key] ?? defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      language: getSettingsValue('language', 'ar') as 'en' | 'ar',
      timezone: getSettingsValue('timezone', 'Asia/Riyadh'),
      email_notifications: getSettingsValue('email_notifications', true),
      push_notifications: getSettingsValue('push_notifications', true),
      message_notifications: getSettingsValue('message_notifications', true),
      mention_notifications: getSettingsValue('mention_notifications', true),
      channel_notifications: getSettingsValue('channel_notifications', true),
      direct_message_notifications: getSettingsValue('direct_message_notifications', true),
      announcement_notifications: getSettingsValue('announcement_notifications', true),
      meeting_notifications: getSettingsValue('meeting_notifications', true),
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: SettingsForm) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const settings = {
        language: data.language,
        timezone: data.timezone,
        email_notifications: data.email_notifications,
        push_notifications: data.push_notifications,
        message_notifications: data.message_notifications,
        mention_notifications: data.mention_notifications,
        channel_notifications: data.channel_notifications,
        direct_message_notifications: data.direct_message_notifications,
        announcement_notifications: data.announcement_notifications,
        meeting_notifications: data.meeting_notifications,
      };

      const { error } = await updateProfile({
        settings: settings,
      });

      if (error) {
        toast({
          title: t['common.error'],
          description: error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: t['common.success'],
          description: 'Settings updated successfully',
        });
      }
    } catch (error) {
      toast({
        title: t['common.error'],
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
          <Link href="/ar/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-hyhom-dark">
          {t['settings.title']}
        </h1>
        <p className="text-gray-600 mt-1">
          {t['settings.subtitle']}
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Language & Timezone Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <Globe className="h-5 w-5 text-hyhom-primary" />
                <span>Language & Region</span>
              </CardTitle>
              <CardDescription>
                Configure your language and timezone preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language">{t['settings.language']}</Label>
                <Select 
                  value={watchedValues.language || ''}
                  onValueChange={(value) => setValue('language', value as 'en' | 'ar')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        <span className="flex items-center justify-between w-full">
                          <span>{lang.label}</span>
                          <span className="text-gray-500 mr-2">{lang.labelAr}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  {t['settings.languageDesc']}
                </p>
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label htmlFor="timezone">{t['settings.timezone']}</Label>
                <Select 
                  value={watchedValues.timezone || ''}
                  onValueChange={(value) => setValue('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        <span className="flex items-center justify-between w-full">
                          <span>{tz.label}</span>
                          <span className="text-gray-500 mr-2">{tz.labelAr}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  {t['settings.timezoneDesc']}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <Bell className="h-5 w-5 text-hyhom-primary" />
                <span>{t['settings.notifications']}</span>
              </CardTitle>
              <CardDescription>
                Control when and how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* General Notifications */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">General Notifications</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label htmlFor="email_notifications">{t['settings.email']}</Label>
                      <p className="text-sm text-gray-500">{t['settings.emailDesc']}</p>
                    </div>
                  </div>
                  <Switch
                    id="email_notifications"
                    checked={watchedValues.email_notifications}
                    onCheckedChange={(checked) => setValue('email_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label htmlFor="push_notifications">{t['settings.push']}</Label>
                      <p className="text-sm text-gray-500">{t['settings.pushDesc']}</p>
                    </div>
                  </div>
                  <Switch
                    id="push_notifications"
                    checked={watchedValues.push_notifications}
                    onCheckedChange={(checked) => setValue('push_notifications', checked)}
                  />
                </div>
              </div>

              <Separator />

              {/* Message Notifications */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Message Notifications</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label htmlFor="message_notifications">{t['settings.messages']}</Label>
                      <p className="text-sm text-gray-500">{t['settings.messagesDesc']}</p>
                    </div>
                  </div>
                  <Switch
                    id="message_notifications"
                    checked={watchedValues.message_notifications}
                    onCheckedChange={(checked) => setValue('message_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Users className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label htmlFor="mention_notifications">{t['settings.mentions']}</Label>
                      <p className="text-sm text-gray-500">{t['settings.mentionsDesc']}</p>
                    </div>
                  </div>
                  <Switch
                    id="mention_notifications"
                    checked={watchedValues.mention_notifications}
                    onCheckedChange={(checked) => setValue('mention_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label htmlFor="channel_notifications">{t['settings.channels']}</Label>
                      <p className="text-sm text-gray-500">{t['settings.channelsDesc']}</p>
                    </div>
                  </div>
                  <Switch
                    id="channel_notifications"
                    checked={watchedValues.channel_notifications}
                    onCheckedChange={(checked) => setValue('channel_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label htmlFor="direct_message_notifications">{t['settings.directMessages']}</Label>
                      <p className="text-sm text-gray-500">{t['settings.directMessagesDesc']}</p>
                    </div>
                  </div>
                  <Switch
                    id="direct_message_notifications"
                    checked={watchedValues.direct_message_notifications}
                    onCheckedChange={(checked) => setValue('direct_message_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label htmlFor="announcement_notifications">{t['settings.announcements']}</Label>
                      <p className="text-sm text-gray-500">{t['settings.announcementsDesc']}</p>
                    </div>
                  </div>
                  <Switch
                    id="announcement_notifications"
                    checked={watchedValues.announcement_notifications}
                    onCheckedChange={(checked) => setValue('announcement_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label htmlFor="meeting_notifications">{t['settings.meetings']}</Label>
                      <p className="text-sm text-gray-500">{t['settings.meetingsDesc']}</p>
                    </div>
                  </div>
                  <Switch
                    id="meeting_notifications"
                    checked={watchedValues.meeting_notifications}
                    onCheckedChange={(checked) => setValue('meeting_notifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-hyhom-primary hover:bg-hyhom-dark"
              disabled={loading}
            >
              {loading ? t['common.loading'] : t['common.save']}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}