import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Twitter, Zap } from 'lucide-react';

const SetupProfile = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, publicKey } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    twitter_username: '',
    vape_name: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Display name is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, underscore, and dash';
    }
    
    if (formData.twitter_username && !/^[a-zA-Z0-9_]+$/.test(formData.twitter_username)) {
      newErrors.twitter_username = 'Twitter username can only contain letters, numbers, and underscore';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkUsernameUnique = async (username: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .neq('id', user?.id || '');
      
      if (error) {
        console.error('Error checking username:', error);
        return false;
      }
      
      return data.length === 0;
    } catch (error) {
      console.error('Error checking username uniqueness:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      // Check username uniqueness
      const isUnique = await checkUsernameUnique(formData.username);
      if (!isUnique) {
        setErrors({ username: 'Username is already taken' });
        setIsSubmitting(false);
        return;
      }

      // Create or update profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          wallet_address: publicKey?.toBase58(),
          name: formData.name.trim(),
          username: formData.username.trim(),
          twitter_username: formData.twitter_username.trim() || null,
          vape_name: formData.vape_name.trim() || null,
        });

      if (error) {
        console.error('Error creating profile:', error);
        toast({
          title: "Error creating profile",
          description: "There was an issue setting up your profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Profile created successfully!",
        description: "Welcome to VapeFi. You can now start tracking your puffs.",
      });

      navigate('/track');
    } catch (error) {
      console.error('Error in profile setup:', error);
      toast({
        title: "Setup error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--pure-black))] pt-24 px-6 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-20 w-80 h-80 bg-[hsl(var(--button-green))] rounded-full mix-blend-screen filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-96 h-96 bg-[hsl(var(--effect-purple))] rounded-full mix-blend-screen filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Welcome to <span className="text-[hsl(var(--button-green))]">VapeFi</span>
          </h1>
          <p className="text-xl text-white/70">
            Let's set up your profile to get started
          </p>
          {publicKey && (
            <div className="mt-4 p-3 bg-[hsl(var(--button-green))]/20 border border-[hsl(var(--button-green))]/30 rounded-lg">
              <p className="text-[hsl(var(--button-green))] text-sm">
                🔗 Connected: {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
              </p>
            </div>
          )}
        </div>

        <Card className="!bg-neutral-900 !border-neutral-800 text-white">
          <CardHeader>
            <CardTitle className="text-center text-white flex items-center justify-center gap-2">
              <User className="w-5 h-5" />
              Create Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Display Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your display name"
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-white/50"
                  maxLength={50}
                />
                {errors.name && (
                  <p className="text-red-400 text-sm">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username *
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
                  placeholder="Enter your unique username"
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-white/50"
                  maxLength={30}
                />
                {errors.username && (
                  <p className="text-red-400 text-sm">{errors.username}</p>
                )}
                <p className="text-white/50 text-xs">
                  This will be your unique identifier on VapeFi
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter_username" className="text-white flex items-center gap-2">
                  <Twitter className="w-4 h-4" />
                  Twitter Username (Optional)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">@</span>
                  <Input
                    id="twitter_username"
                    type="text"
                    value={formData.twitter_username}
                    onChange={(e) => handleInputChange('twitter_username', e.target.value.replace('@', ''))}
                    placeholder="twitter_handle"
                    className="bg-neutral-800 border-neutral-700 text-white placeholder:text-white/50 pl-8"
                    maxLength={15}
                  />
                </div>
                {errors.twitter_username && (
                  <p className="text-red-400 text-sm">{errors.twitter_username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vape_name" className="text-white flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Vape Device Name (Optional)
                </Label>
                <Input
                  id="vape_name"
                  type="text"
                  value={formData.vape_name}
                  onChange={(e) => handleInputChange('vape_name', e.target.value)}
                  placeholder="e.g., Mighty Vaporizer, PAX 3"
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-white/50"
                  maxLength={50}
                />
                <p className="text-white/50 text-xs">
                  What vape device do you use? This helps us personalize your experience
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1 border-neutral-700 text-white hover:bg-neutral-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[hsl(var(--button-green))] text-[hsl(var(--pure-black))] hover:bg-[hsl(var(--button-green))]/90"
                >
                  {isSubmitting ? 'Creating Profile...' : 'Create Profile & Start Tracking'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetupProfile;