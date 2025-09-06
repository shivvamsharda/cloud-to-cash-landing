import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Upload, Save, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: profile?.name || '',
    username: profile?.username || '',
    twitterHandle: profile?.twitter_username || '',
    vapeName: profile?.vape_name || '',
  });
  
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.name || '',
        username: profile.username || '',
        twitterHandle: profile.twitter_username || '',
        vapeName: profile.vape_name || '',
      });
    }
  }, [profile]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setNewProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  });

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3 || username === profile?.username) {
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
    const cleanUsername = value.replace(/\s+/g, '').toLowerCase();
    setFormData(prev => ({ ...prev, username: cleanUsername }));
    
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(cleanUsername);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const uploadProfilePicture = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!profile) return;

    if (formData.username !== profile.username && usernameAvailable === false) {
      toast.error('Username is not available');
      return;
    }

    setSaving(true);
    try {
      const updates: any = {
        name: formData.displayName || null,
        username: formData.username,
        twitter_username: formData.twitterHandle || null,
        vape_name: formData.vapeName || null,
      };

      // Upload new profile picture if selected
      if (newProfilePicture) {
        const profilePictureUrl = await uploadProfilePicture(newProfilePicture);
        updates.profile_picture_url = profilePictureUrl;
      }

      await updateProfile(updates);
      
      setIsEditing(false);
      setNewProfilePicture(null);
      setPreviewUrl('');
      setUsernameAvailable(null);
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: profile?.name || '',
      username: profile?.username || '',
      twitterHandle: profile?.twitter_username || '',
      vapeName: profile?.vape_name || '',
    });
    setIsEditing(false);
    setNewProfilePicture(null);
    setPreviewUrl('');
    setUsernameAvailable(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Profile not found</div>
      </div>
    );
  }

  const currentProfilePicture = previewUrl || profile.profile_picture_url || '';

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Profile Settings</CardTitle>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="space-y-4">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentProfilePicture} />
                  <AvatarFallback>
                    <Upload className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                
                {isEditing && (
                  <div 
                    {...getRootProps()} 
                    className="flex-1 border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  >
                    <input {...getInputProps()} />
                    <div className="text-center">
                      {isDragActive ? (
                        <p>Drop the image here...</p>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-medium">Click or drag to upload new picture</p>
                          <p className="text-sm text-muted-foreground">JPEG, PNG, WebP (max 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                disabled={!isEditing}
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  disabled={!isEditing}
                  className={
                    isEditing && usernameAvailable === false ? 'border-destructive' :
                    isEditing && usernameAvailable === true ? 'border-green-500' : ''
                  }
                />
                {isEditing && checkingUsername && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
                {isEditing && usernameAvailable === true && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {isEditing && usernameAvailable === false && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
                )}
              </div>
              {isEditing && usernameAvailable === false && (
                <p className="text-sm text-destructive">Username is already taken</p>
              )}
            </div>

            {/* Twitter Handle */}
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter Handle</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">@</span>
                <Input
                  id="twitter"
                  value={formData.twitterHandle}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitterHandle: e.target.value.replace('@', '') }))}
                  disabled={!isEditing}
                  className="pl-8"
                  placeholder="username"
                />
              </div>
            </div>

            {/* Vape Name */}
            <div className="space-y-2">
              <Label htmlFor="vapeName">Vape Device Name</Label>
              <Input
                id="vapeName"
                value={formData.vapeName}
                onChange={(e) => setFormData(prev => ({ ...prev, vapeName: e.target.value }))}
                disabled={!isEditing}
                placeholder="e.g., Vaporesso Gen 200"
              />
            </div>

            <Separator />

            {/* Wallet Address (Read Only) */}
            <div className="space-y-2">
              <Label>Connected Wallet</Label>
              <Input 
                value={profile.wallet_address || 'Not connected'} 
                readOnly 
                className="bg-muted text-muted-foreground"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{profile.total_puffs}</div>
                <div className="text-sm text-muted-foreground">Total Puffs</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{profile.total_rewards}</div>
                <div className="text-sm text-muted-foreground">Tokens Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}