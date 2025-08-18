import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, Square } from 'lucide-react';
import SmartPuffTracker from '@/components/detection/SmartPuffTracker';
import { useScoreUpdater } from '@/hooks/useScoreUpdater';

const Track = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Initialize 3-minute score updater
  useScoreUpdater();
  
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState({
    puffs: 0,
    duration: 0,
  });
  const [displayedPuffs, setDisplayedPuffs] = useState(0); // Delayed display puffs
  const [pendingPuffs, setPendingPuffs] = useState(0); // Actual puffs count
  const [profile, setProfile] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Load user profile initially and refresh every 30 seconds
  useEffect(() => {
    if (user) {
      loadProfile();
      
      // Refresh profile data every 30 seconds to show updated scores
      const interval = setInterval(loadProfile, 30000);
      return () => clearInterval(interval);
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
      setCurrentSession({ puffs: 0, duration: 0 });
      setDisplayedPuffs(0);
      setPendingPuffs(0);

      toast({
        title: "Tracking started!",
        description: "AI detection only - no manual input",
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

    // Only update local state - batch database updates every 60 seconds
    setPendingPuffs(prev => prev + 1);
    setCurrentSession(prev => ({
      ...prev,
      puffs: prev.puffs + 1,
    }));

    // No toast notification to prevent gaming the system
  };

  const stopTracking = async () => {
    if (!sessionId) return;

    try {
      // Update the session with final puff count and duration
      const { error } = await supabase
        .from('puff_sessions')
        .update({
          puffs_count: currentSession.puffs,
          session_duration: currentSession.duration,
        })
        .eq('id', sessionId);

      if (error) throw error;

      // Profile totals will be updated by the 3-minute scoring system
      setIsTracking(false);
      setSessionId(null);
      setDisplayedPuffs(0);
      setPendingPuffs(0);
      loadProfile(); // Reload profile immediately

      toast({
        title: "Session completed!",
        description: "Scores will update within 3 minutes",
      });
    } catch (error) {
      console.error('Error stopping session:', error);
    }
  };

  // Session timer and 60-second update intervals
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    let displayInterval: NodeJS.Timeout;
    let dbUpdateInterval: NodeJS.Timeout;
    
    if (isTracking) {
      // 1-second timer for session duration
      timerInterval = setInterval(() => {
        setCurrentSession(prev => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);

      // 60-second interval to update displayed puffs (anti-cheating)
      displayInterval = setInterval(() => {
        setPendingPuffs(current => {
          setDisplayedPuffs(current);
          return current;
        });
      }, 60000);

      // 60-second interval to batch database updates
      dbUpdateInterval = setInterval(async () => {
        if (sessionId && pendingPuffs > 0) {
          try {
            await supabase
              .from('puff_sessions')
              .update({
                puffs_count: pendingPuffs,
                rewards_earned: 0,
              })
              .eq('id', sessionId);
          } catch (error) {
            console.error('Error batch updating puffs:', error);
          }
        }
      }, 60000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (displayInterval) clearInterval(displayInterval);
      if (dbUpdateInterval) clearInterval(dbUpdateInterval);
    };
  }, [isTracking, sessionId, pendingPuffs]);

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

        {/* Smart AI Detection */}
        <div className="mb-8">
          <SmartPuffTracker onPuffDetected={addPuff} isTracking={isTracking} />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Current Session */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Current Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-[hsl(195,100%,50%)] mb-2">
                  {isTracking ? displayedPuffs : currentSession.puffs}
                </div>
                <div className="text-muted-foreground">
                  {isTracking ? "Puffs (Updates every 60s)" : "Puffs This Session"}
                </div>
                {isTracking && (
                  <div className="text-xs text-muted-foreground mt-1">
                    🤖 AI Detection Active - No Manual Input
                  </div>
                )}
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

          {/* Profile Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Your Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-3 rounded-none text-center mb-4">
                <div className="text-sm text-muted-foreground">
                  ⏱️ Scores update every 3 minutes
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Last updated: {profile?.last_score_update ? 
                    new Date(profile.last_score_update).toLocaleTimeString() : 'Never'}
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-[hsl(195,100%,50%)] mb-2">
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
                  <div className="font-mono text-xs bg-muted px-2 py-1 rounded-none">
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