'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Database } from '@/types/database';

type FileUpload = Database['public']['Tables']['file_uploads']['Row'];

export function useFileUpload() {
  const { user } = useAuthContext();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const supabase = createClient();

  const uploadFile = async (
    file: File,
    options?: {
      messageId?: string;
      directMessageId?: string;
      bucket?: string;
      path?: string;
    }
  ): Promise<{ data: FileUpload | null; error: string | null; url?: string }> => {
    if (!user) return { data: null, error: 'No user logged in' };

    try {
      setUploading(true);
      setUploadProgress(0);

      // Validate file
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return { data: null, error: 'File size must be less than 10MB' };
      }

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
      ];

      if (!allowedTypes.includes(file.type)) {
        return { data: null, error: 'File type not supported' };
      }

      // Generate file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const bucket = options?.bucket || 'files';
      const filePath = options?.path || `uploads/${user.id}/${fileName}`;

      setUploadProgress(25);

      // Ensure bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === bucket);

      if (!bucketExists) {
        // Create bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket(bucket, {
          public: true,
          allowedMimeTypes: allowedTypes,
          fileSizeLimit: maxSize,
        });

        if (createError && !createError.message.includes('already exists')) {
          return { data: null, error: `Failed to create bucket: ${createError.message}` };
        }
      }

      setUploadProgress(50);

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        return { data: null, error: `Upload failed: ${uploadError.message}` };
      }

      setUploadProgress(75);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // Save file record to database
      const { data: fileRecord, error: dbError } = await supabase
        .from('file_uploads')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: filePath,
          message_id: options?.messageId || null,
          direct_message_id: options?.directMessageId || null,
        })
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file on database error
        await supabase.storage.from(bucket).remove([filePath]);
        return { data: null, error: `Database error: ${dbError.message}` };
      }

      setUploadProgress(100);

      return { 
        data: fileRecord, 
        error: null, 
        url: urlData.publicUrl 
      };
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Upload failed' 
      };
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteFile = async (fileId: string): Promise<{ error: string | null }> => {
    if (!user) return { error: 'No user logged in' };

    try {
      // Get file record
      const { data: fileRecord, error: fetchError } = await supabase
        .from('file_uploads')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', user.id) // Ensure user owns the file
        .single();

      if (fetchError || !fileRecord) {
        return { error: 'File not found or access denied' };
      }

      // Delete from storage
      const bucket = fileRecord.storage_path.split('/')[0] === 'uploads' ? 'files' : 'avatars';
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([fileRecord.storage_path]);

      if (storageError) {
        console.warn('Storage deletion failed:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('file_uploads')
        .delete()
        .eq('id', fileId)
        .eq('user_id', user.id);

      if (dbError) {
        return { error: `Database error: ${dbError.message}` };
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Delete failed' };
    }
  };

  const getFileUrl = (storagePath: string, bucket: string = 'files'): string => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath);
    
    return data.publicUrl;
  };

  const isImageFile = (fileType: string): boolean => {
    return fileType.startsWith('image/');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    uploading,
    uploadProgress,
    uploadFile,
    deleteFile,
    getFileUrl,
    isImageFile,
    formatFileSize,
  };
}