import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Square } from 'lucide-react';
import SmartPuffTracker from '@/components/detection/SmartPuffTracker';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePuffSessions } from '@/hooks/usePuffSessions';
import { WalletConnectionModal } from '@/components/WalletConnectionModal';
import { ProfileCreationModal } from '@/components/ProfileCreationModal';

const Track = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isNewUser, completeProfile } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { createSession, loading: sessionLoading } = usePuffSessions();
  
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState({
    puffs: 0,
    duration: 0,
  });
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  // Show connection modal if not authenticated
  useEffect(() => {
    if (!user) {
      setShowConnectionModal(true);
    }
  }, [user]);

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
    if (currentSession.puffs > 0) {
      try {
        await createSession(currentSession.puffs, currentSession.duration);
        const tokensEarned = currentSession.puffs * 0.1;
        
        toast({
          title: "Session saved!",
          description: `Earned ${tokensEarned.toFixed(1)} VapeFi tokens from ${currentSession.puffs} puffs.`,
        });
      } catch (error) {
        console.error('Error saving session:', error);
        toast({
          title: "Error",
          description: "Failed to save session. Please try again.",
          variant: "destructive",
        });
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

  // Show loading screen while checking auth
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--pure-black))] pt-24 px-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show connection modal if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[hsl(var(--pure-black))] pt-24 px-6 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl mb-4">Authentication Required</h2>
          <p className="mb-6">Please connect your wallet to start tracking.</p>
        </div>
        <WalletConnectionModal 
          isOpen={showConnectionModal} 
          onClose={() => {
            setShowConnectionModal(false);
            navigate('/');
          }} 
        />
      </div>
    );
  }

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
              <div className="text-center">
                <div className="text-4xl font-bold text-[hsl(195,100%,50%)] mb-2">
                  {profile?.total_puffs || 0}
                </div>
                <div className="text-white/70">Total Puffs</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-semibold text-[hsl(var(--button-green))] mb-2">
                  {profile?.total_rewards?.toFixed(1) || '0.0'}
                </div>
                <div className="text-white/70">Total VapeFi Tokens</div>
              </div>

              <Progress 
                value={Math.min((profile?.total_puffs || 0) / 100 * 100, 100)} 
                className="w-full [&>div]:bg-[hsl(var(--button-green))]"
              />
              <div className="text-center text-sm text-white/70">
                Progress to Bronze Vaper (100 puffs)
              </div>
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

      {/* Modals */}
      <WalletConnectionModal
        isOpen={!user}
        onClose={() => {}}
      />

      {user && isNewUser && profile?.wallet_address && (
        <ProfileCreationModal
          isOpen={isNewUser}
          walletAddress={profile.wallet_address}
          userId={user.id}
        />
      )}
    </div>
  );
};

export default Track;