import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square } from 'lucide-react';
import SmartPuffTracker from '@/components/detection/SmartPuffTracker';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Track = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, publicKey } = useAuth();
  const { toast } = useToast();
  
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState({
    puffs: 0,
    duration: 0,
  });
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          return;
        }

        if (!data) {
          // Create profile if it doesn't exist
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              wallet_address: publicKey?.toBase58(),
              username: 'Anonymous Vaper',
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
        } else {
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Error handling profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, publicKey]);

  const startTracking = () => {
    setIsTracking(true);
    setCurrentSession({ puffs: 0, duration: 0 });
  };

  const addPuff = () => {
    if (!isTracking) return;
    
    setCurrentSession(prev => ({
      ...prev,
      puffs: prev.puffs + 1,
    }));
  };

  const stopTracking = async () => {
    setIsTracking(false);
    
    // Save session to database
    if (currentSession.puffs > 0 && user) {
      try {
        const { error } = await supabase
          .from('puff_sessions')
          .insert({
            user_id: user.id,
            puffs_count: currentSession.puffs,
            session_duration: currentSession.duration,
            rewards_earned: currentSession.puffs * 0.1, // 0.1 tokens per puff
          });

        if (error) {
          console.error('Error saving session:', error);
          toast({
            title: "Error saving session",
            description: "Your session couldn't be saved to the database.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Session saved!",
            description: `Earned ${(currentSession.puffs * 0.1).toFixed(1)} VapeFi tokens from ${currentSession.puffs} puffs.`,
          });
          
          // Refresh user profile to get updated totals
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (data) {
            setUserProfile(data);
          }
        }
      } catch (error) {
        console.error('Error in stopTracking:', error);
      }
    }
  };

  // Session timer
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    
    if (isTracking) {
      timerInterval = setInterval(() => {
        setCurrentSession(prev => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isTracking]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--pure-black))] pt-24 px-6 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-20 w-80 h-80 bg-[hsl(var(--button-green))] rounded-full mix-blend-screen filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-96 h-96 bg-[hsl(var(--effect-purple))] rounded-full mix-blend-screen filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            VapeFi <span className="text-[hsl(var(--button-green))]">Tracker</span>
          </h1>
          <p className="text-xl text-white/70">
            Track your puffs and earn VapeFi tokens
          </p>
          {publicKey && (
            <div className="mt-4 p-3 bg-[hsl(var(--button-green))]/20 border border-[hsl(var(--button-green))]/30 rounded-lg">
              <p className="text-[hsl(var(--button-green))] text-sm">
                🔗 Connected: {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
              </p>
            </div>
          )}
        </div>

        {/* Smart AI Detection */}
        <div className="mb-8">
          <SmartPuffTracker onPuffDetected={addPuff} isTracking={isTracking} />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Current Session */}
          <Card className="!bg-neutral-900 !border-neutral-800 text-white">
            <CardHeader>
              <CardTitle className="text-center text-white">Current Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-[hsl(195,100%,50%)] mb-2">
                  {currentSession.puffs}
                </div>
                <div className="text-white/70">
                  Puffs This Session
                </div>
                {isTracking && (
                  <div className="text-xs text-white/70 mt-1">
                    🤖 AI Detection Active - No Manual Input
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <div className="text-xl font-medium mb-2">
                  {formatTime(currentSession.duration)}
                </div>
                <div className="text-white/70">Session Time</div>
              </div>

              <div className="flex flex-col gap-3">
                {!isTracking ? (
                  <Button 
                    onClick={startTracking} 
                    className="w-full rounded-full bg-[hsl(var(--button-green))] text-[hsl(var(--pure-black))] hover:bg-[hsl(var(--button-green))]/90" 
                    size="lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Tracking
                  </Button>
                ) : (
                  <Button 
                    onClick={stopTracking} 
                    variant="destructive" 
                    className="w-full"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Session
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Stats */}
          <Card className="!bg-neutral-900 !border-neutral-800 text-white">
            <CardHeader>
              <CardTitle className="text-center text-white">Your Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="text-center text-white/70">Loading your stats...</div>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[hsl(195,100%,50%)] mb-2">
                      {userProfile?.total_puffs || 0}
                    </div>
                    <div className="text-white/70">Total Puffs</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-[hsl(var(--button-green))] mb-2">
                      {userProfile?.total_rewards?.toFixed(1) || '0.0'}
                    </div>
                    <div className="text-white/70">Total VapeFi Tokens</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-white/70 mb-1">Wallet</div>
                    <div className="font-mono text-xs text-white">
                      {publicKey ? `${publicKey.toBase58().slice(0, 8)}...${publicKey.toBase58().slice(-8)}` : 'Not connected'}
                    </div>
                  </div>

                  <Progress 
                    value={Math.min((userProfile?.total_puffs || 0) / 100 * 100, 100)} 
                    className="w-full [&>div]:bg-[hsl(var(--button-green))]"
                  />
                  <div className="text-center text-sm text-white/70">
                    Progress to Bronze Vaper (100 puffs)
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            onClick={() => navigate('/')}
            className="rounded-full bg-[hsl(var(--button-green))] text-[hsl(var(--pure-black))] hover:bg-[hsl(var(--button-green))]/90"
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