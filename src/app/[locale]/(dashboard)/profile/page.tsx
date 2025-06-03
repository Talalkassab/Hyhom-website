'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { createClient } from '@/lib/supabase/client';
import { User, Camera, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const profileSchema = z.object({
  full_name: z.string().min(2),
  full_name_ar: z.string().min(2),
  phone: z.string().optional(),
  department: z.enum(['management', 'operations', 'kitchen', 'service', 'hr', 'finance', 'marketing']).optional(),
  position: z.string().optional(),
  position_ar: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const departments = [
  { value: 'management', label: 'Management', labelAr: 'الإدارة' },
  { value: 'operations', label: 'Operations', labelAr: 'العمليات' },
  { value: 'kitchen', label: 'Kitchen', labelAr: 'المطبخ' },
  { value: 'service', label: 'Service', labelAr: 'الخدمة' },
  { value: 'hr', label: 'Human Resources', labelAr: 'الموارد البشرية' },
  { value: 'finance', label: 'Finance', labelAr: 'المالية' },
  { value: 'marketing', label: 'Marketing', labelAr: 'التسويق' },
];

// Static translations object
const t = {
  'common.error': 'Error',
  'common.success': 'Success',
  'common.loading': 'Loading...',
  'common.save': 'Save',
  'profile.editProfile': 'Edit Profile',
  'profile.uploadAvatar': 'Upload Avatar',
  'auth.fullName': 'Full Name',
  'profile.phone': 'Phone',
  'profile.department': 'Department',
  'profile.position': 'Position',
  'profile.bio': 'Bio'
};

export default function ProfilePage() {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const { profile, updateProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      full_name_ar: profile?.full_name_ar || '',
      phone: profile?.phone || '',
      department: profile?.department || undefined,
      position: profile?.position || '',
      position_ar: profile?.position_ar || '',
      bio: profile?.bio || '',
    },
  });

  const departmentValue = watch('department');

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { error } = await updateProfile({
        full_name: data.full_name,
        full_name_ar: data.full_name_ar,
        phone: data.phone || null,
        department: data.department || null,
        position: data.position || null,
        position_ar: data.position_ar || null,
        bio: data.bio || null,
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
          description: 'Profile updated successfully',
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setAvatarUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error } = await updateProfile({ 
        avatar_url: urlData.publicUrl 
      });

      if (error) {
        throw new Error(error);
      }

      toast({
        title: t['common.success'],
        description: 'Avatar updated successfully',
      });
    } catch (error: any) {
      toast({
        title: t['common.error'],
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
          <Link href="/en/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-hyhom-dark">
          {t['profile.editProfile']}
        </h1>
      </div>

      {/* Main Content */}
      <div>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{t['profile.editProfile']}</CardTitle>
              <CardDescription>
                Update your profile information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="text-lg">
                      {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-2 -right-2 bg-hyhom-primary text-white p-2 rounded-full cursor-pointer hover:bg-hyhom-dark transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={avatarUploading}
                  />
                </div>
                <div>
                  <h3 className="font-medium">{t['profile.uploadAvatar']}</h3>
                  <p className="text-sm text-gray-500">
                    {avatarUploading ? 'Uploading...' : 'Click the camera icon to change your avatar'}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Profile Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">{t['auth.fullName']} (English)</Label>
                    <Input
                      id="full_name"
                      {...register('full_name')}
                      className={errors.full_name ? 'border-red-500' : ''}
                    />
                    {errors.full_name && (
                      <p className="text-sm text-red-500">Required</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full_name_ar">{t['auth.fullName']} (العربية)</Label>
                    <Input
                      id="full_name_ar"
                      {...register('full_name_ar')}
                      className={errors.full_name_ar ? 'border-red-500' : ''}
                      dir="rtl"
                    />
                    {errors.full_name_ar && (
                      <p className="text-sm text-red-500">مطلوب</p>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <Label htmlFor="phone">{t['profile.phone']}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+966 50 123 4567"
                    {...register('phone')}
                  />
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department">{t['profile.department']}</Label>
                  <Select 
                    value={departmentValue || ''}
                    onValueChange={(value) => setValue('department', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          <span className="flex items-center justify-between w-full">
                            <span>{dept.label}</span>
                            <span className="text-gray-500 mr-2">{dept.labelAr}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Positions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">{t['profile.position']} (English)</Label>
                    <Input
                      id="position"
                      placeholder="Senior Developer"
                      {...register('position')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position_ar">{t['profile.position']} (العربية)</Label>
                    <Input
                      id="position_ar"
                      placeholder="مطور أول"
                      {...register('position_ar')}
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">{t['profile.bio']}</Label>
                  <textarea
                    id="bio"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hyhom-primary focus:border-transparent"
                    placeholder="Tell us about yourself..."
                    {...register('bio')}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-hyhom-primary hover:bg-hyhom-dark"
                  disabled={loading}
                >
                  {loading ? t['common.loading'] : t['common.save']}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}