import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ProfileCreationModalProps {
  isOpen: boolean;
  walletAddress: string;
  userId: string;
}

export const ProfileCreationModal: React.FC<ProfileCreationModalProps> = ({ 
  isOpen, 
  walletAddress, 
  userId 
}) => {
  
  const { completeProfile } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    twitterHandle: '',
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  });

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (error) throw error;
      setUsernameAvailable(!data);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    // Remove spaces and convert to lowercase
    const cleanUsername = value.replace(/\s+/g, '').toLowerCase();
    setFormData(prev => ({ ...prev, username: cleanUsername }));
    
    // Debounce username check
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(cleanUsername);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const uploadProfilePicture = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.displayName || !formData.username || !profilePicture) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (usernameAvailable === false) {
      toast.error('Username is not available');
      return;
    }

    setLoading(true);
    try {
      // Upload profile picture
      const profilePictureUrl = await uploadProfilePicture(profilePicture);

      // Create or update profile row
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            name: formData.displayName,
            username: formData.username,
            twitter_username: formData.twitterHandle || null,
            wallet_address: walletAddress,
            profile_picture_url: profilePictureUrl,
          },
          { onConflict: 'id' }
        );

      if (upsertError) throw upsertError;

      completeProfile();
      toast.success('Profile created successfully!');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast.error(`Failed to create profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.displayName && 
                     formData.username && 
                     profilePicture && 
                     usernameAvailable !== false;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="w-full max-w-lg rounded-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="space-y-2">
            <Label>Profile Picture *</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={previewUrl} />
                <AvatarFallback>
                  <Upload className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div 
                {...getRootProps()} 
                className="flex-1 border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 cursor-pointer hover:border-muted-foreground/50 transition-colors"
              >
                <input {...getInputProps()} />
                <div className="text-center text-sm">
                  {isDragActive ? (
                    <p>Drop the image here...</p>
                  ) : (
                    <div>
                      <p className="font-medium">Click or drag to upload</p>
                      <p className="text-muted-foreground">JPEG, PNG, WebP (max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="Your display name"
              required
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <div className="relative">
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="your_username"
                pattern="^[a-z0-9_]+$"
                title="Username can only contain lowercase letters, numbers, and underscores"
                required
                className={
                  usernameAvailable === false ? 'border-destructive' :
                  usernameAvailable === true ? 'border-green-500' : ''
                }
              />
              {checkingUsername && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
              {usernameAvailable === true && (
                <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
              {usernameAvailable === false && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
              )}
            </div>
            {usernameAvailable === false && (
              <p className="text-sm text-destructive">Username is already taken</p>
            )}
          </div>

          {/* Twitter Handle */}
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter Handle (Optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">@</span>
              <Input
                id="twitter"
                value={formData.twitterHandle}
                onChange={(e) => setFormData(prev => ({ ...prev, twitterHandle: e.target.value.replace('@', '') }))}
                placeholder="username"
                className="pl-8"
              />
            </div>
          </div>

          {/* Connected Wallet */}
          <div className="space-y-2">
            <Label>Connected Wallet</Label>
            <Input 
              value={walletAddress} 
              readOnly 
              className="bg-muted text-muted-foreground"
            />
          </div>

          <Button 
            type="submit" 
            disabled={!isFormValid || loading}
            className="w-full"
          >
            {loading ? 'Creating Profile...' : 'Create Profile'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};