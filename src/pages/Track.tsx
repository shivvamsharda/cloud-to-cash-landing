import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, Square } from 'lucide-react';

const Track = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState({
    puffs: 0,
    duration: 0,
    rewards: 0,
  });
  const [profile, setProfile] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Load user profile
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error);
      return;
    }

    setProfile(data);
  };

  const startTracking = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('puff_sessions')
        .insert([
          {
            user_id: user.id,
            puffs_count: 0,
            session_duration: 0,
            rewards_earned: 0,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setIsTracking(true);
      setCurrentSession({ puffs: 0, duration: 0, rewards: 0 });

      toast({
        title: "Tracking started!",
        description: "Start vaping to earn rewards",
      });
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Error",
        description: "Failed to start tracking session",
        variant: "destructive",
      });
    }
  };

  const addPuff = async () => {
    if (!sessionId || !isTracking) return;

    const newPuffs = currentSession.puffs + 1;
    const newRewards = newPuffs * 0.1; // 0.1 token per puff

    try {
      const { error } = await supabase
        .from('puff_sessions')
        .update({
          puffs_count: newPuffs,
          rewards_earned: newRewards,
        })
        .eq('id', sessionId);

      if (error) throw error;

      setCurrentSession(prev => ({
        ...prev,
        puffs: newPuffs,
        rewards: newRewards,
      }));

      toast({
        title: "Puff recorded!",
        description: `+0.1 VapeFi tokens earned`,
      });
    } catch (error) {
      console.error('Error recording puff:', error);
    }
  };

  const stopTracking = async () => {
    if (!sessionId) return;

    try {
      // Update the session with final duration
      const { error } = await supabase
        .from('puff_sessions')
        .update({
          session_duration: currentSession.duration,
        })
        .eq('id', sessionId);

      if (error) throw error;

      // Update profile totals
      if (profile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            total_puffs: (profile.total_puffs || 0) + currentSession.puffs,
            total_rewards: (profile.total_rewards || 0) + currentSession.rewards,
          })
          .eq('id', user?.id);

        if (profileError) throw profileError;
      }

      setIsTracking(false);
      setSessionId(null);
      loadProfile(); // Reload updated profile

      toast({
        title: "Session completed!",
        description: `Earned ${currentSession.rewards} VapeFi tokens total`,
      });
    } catch (error) {
      console.error('Error stopping session:', error);
    }
  };

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking) {
      interval = setInterval(() => {
        setCurrentSession(prev => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background pt-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            VapeFi Tracker
          </h1>
          <p className="text-xl text-muted-foreground">
            Track your puffs and earn VapeFi tokens
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Current Session */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Current Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-brand-purple mb-2">
                  {currentSession.puffs}
                </div>
                <div className="text-muted-foreground">Puffs</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-semibold text-brand-yellow mb-2">
                  {currentSession.rewards.toFixed(1)}
                </div>
                <div className="text-muted-foreground">VapeFi Tokens</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl font-medium mb-2">
                  {formatTime(currentSession.duration)}
                </div>
                <div className="text-muted-foreground">Session Time</div>
              </div>

              <div className="flex flex-col gap-3">
                {!isTracking ? (
                  <Button onClick={startTracking} className="w-full" size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    Start Tracking
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={addPuff} 
                      variant="hero-primary" 
                      className="w-full" 
                      size="lg"
                    >
                      Record Puff (+0.1 Token)
                    </Button>
                    <Button 
                      onClick={stopTracking} 
                      variant="destructive" 
                      className="w-full"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop Session
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Your Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-brand-purple mb-2">
                  {profile?.total_puffs || 0}
                </div>
                <div className="text-muted-foreground">Total Puffs</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-semibold text-brand-yellow mb-2">
                  {(profile?.total_rewards || 0).toFixed(1)}
                </div>
                <div className="text-muted-foreground">Total VapeFi Tokens</div>
              </div>

              {profile?.wallet_address && (
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Wallet</div>
                  <div className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {profile.wallet_address.slice(0, 8)}...{profile.wallet_address.slice(-8)}
                  </div>
                </div>
              )}

              <Progress 
                value={Math.min((profile?.total_puffs || 0) / 100 * 100, 100)} 
                className="w-full"
              />
              <div className="text-center text-sm text-muted-foreground">
                Progress to next reward level
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            size="lg"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Track;