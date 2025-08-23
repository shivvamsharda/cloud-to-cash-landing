import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/WalletContext';
import { Loader2 } from 'lucide-react';

interface ProfileCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated: () => void;
}

interface ProfileFormData {
  name: string;
  username: string;
  twitter_username: string;
}

interface FormErrors {
  name?: string;
  username?: string;
  twitter_username?: string;
}

const ProfileCreationModal: React.FC<ProfileCreationModalProps> = ({
  isOpen,
  onClose,
  onProfileCreated,
}) => {
  const { user } = useAuth();
  const { publicKey, connected } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    username: '',
    twitter_username: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateUsername = (username: string): string | null => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      return 'Username can only contain letters, numbers, dots, underscores, and dashes';
    }
    return null;
  };

  const validateTwitterUsername = (twitter: string): string | null => {
    if (!twitter) return 'Twitter username is required';
    if (twitter.length < 1) return 'Twitter username is required';
    if (twitter.length > 15) return 'Twitter username must be less than 15 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(twitter)) {
      return 'Twitter username can only contain letters, numbers, and underscores';
    }
    return null;
  };

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    if (!username || validateUsername(username)) return false;
    
    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking username:', error);
        return false;
      }
      
      return !data; // Available if no data found
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleInputChange = async (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear existing error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Check username availability on change
    if (field === 'username' && value) {
      const usernameError = validateUsername(value);
      if (!usernameError) {
        const isAvailable = await checkUsernameAvailability(value);
        if (!isAvailable) {
          setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
        }
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      newErrors.username = usernameError;
    }
    
    const twitterError = validateTwitterUsername(formData.twitter_username);
    if (twitterError) {
      newErrors.twitter_username = twitterError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please sign in first",
        variant: "destructive",
      });
      return;
    }

    if (!connected || !publicKey) {
      toast({
        title: "Wallet Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateForm()) return;
    
    // Final username availability check
    const isUsernameAvailable = await checkUsernameAvailability(formData.username);
    if (!isUsernameAvailable) {
      setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
      return;
    }
    
    setLoading(true);
    
    try {
      const walletAddress = publicKey.toString();
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: formData.name.trim(),
          username: formData.username,
          twitter_username: formData.twitter_username,
          wallet_address: walletAddress,
        });
      
      if (error) {
        console.error('Profile creation error:', error);
        toast({
          title: "Profile Creation Failed",
          description: error.message || "Failed to create profile",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Profile Created!",
        description: "Welcome to VapeFi! Your profile has been created successfully.",
      });
      
      onProfileCreated();
      onClose();
    } catch (error) {
      console.error('Profile creation error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-[hsl(195,100%,50%)]">
            Complete Your Profile
          </DialogTitle>
          <p className="text-center text-muted-foreground mt-2">
            Welcome to VapeFi! Please fill out your profile to get started.
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Choose a unique username"
              className={errors.username ? 'border-destructive' : ''}
            />
            {checkingUsername && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking availability...
              </p>
            )}
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username}</p>
            )}
            <p className="text-xs text-muted-foreground">
              3-20 characters. Letters, numbers, dots, underscores and dashes only.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter Username *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                @
              </span>
              <Input
                id="twitter"
                type="text"
                value={formData.twitter_username}
                onChange={(e) => handleInputChange('twitter_username', e.target.value)}
                placeholder="your_twitter_handle"
                className={`pl-8 ${errors.twitter_username ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.twitter_username && (
              <p className="text-sm text-destructive">{errors.twitter_username}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Your Twitter handle without the @ symbol.
            </p>
          </div>
          
          <Button
            type="submit"
            disabled={loading || checkingUsername}
            className="w-full bg-[hsl(195,100%,50%)] hover:bg-[hsl(195,100%,45%)] text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Create Profile'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileCreationModal;