import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const { connected, wallet, publicKey, disconnect, signMessage } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithWallet = useCallback(async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return false;
    }

    if (!signMessage) {
      toast({
        title: "Wallet cannot sign messages",
        description: "Your wallet doesn't support signMessage. Try Phantom or enable message signing.",
        variant: "destructive",
      });
      return false;
    }

    setIsAuthenticating(true);
    try {
      const { error } = await supabase.auth.signInWithWeb3({
        chain: 'solana',
        statement: 'Sign in to VapeFi to start tracking your puffs and earning rewards.',
        wallet: {
          publicKey,
          signMessage: async (message: Uint8Array) => {
            return await signMessage(message);
          },
        } as any,
      });

      if (error) {
        toast({
          title: "Authentication failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Successfully authenticated!",
        description: "Welcome to VapeFi.",
      });
      return true;
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Authentication error",
        description: "Failed to authenticate with wallet.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [connected, wallet, publicKey, signMessage, toast]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      await disconnect();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out error",
        description: "Failed to sign out properly.",
        variant: "destructive",
      });
    }
  }, [disconnect, toast]);

  return {
    user,
    session,
    connected,
    publicKey,
    isAuthenticating,
    isAuthenticated: !!user && connected,
    signInWithWallet,
    signOut,
  };
};