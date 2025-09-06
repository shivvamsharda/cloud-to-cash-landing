import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  connected: boolean;
  publicKey: any;
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  profileComplete: boolean | null;
  isFullyAuthenticated: boolean;
  signInWithWallet: () => Promise<boolean>;
  signOut: () => Promise<void>;
  checkProfileComplete: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { connected, wallet, publicKey, disconnect, signMessage } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const { toast } = useToast();
  
  // Global lock to prevent simultaneous sign-in attempts
  const signingRef = useRef(false);

  // Initialize auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check profile completeness when auth state changes
        if (session?.user) {
          setTimeout(async () => {
            await checkProfileComplete(session.user.id);
          }, 0);
        } else {
          setProfileComplete(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkProfileComplete(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check if user has a complete profile
  const checkProfileComplete = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, username')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking profile:', error);
        setProfileComplete(false);
        return;
      }

      // Profile is complete if it exists and has required fields
      const isComplete = data && data.name && data.username;
      setProfileComplete(!!isComplete);
    } catch (error) {
      console.error('Error in checkProfileComplete:', error);
      setProfileComplete(false);
    }
  };

  const signInWithWallet = useCallback(async () => {
    // Global guard against simultaneous sign-in attempts
    if (signingRef.current) {
      console.log('Sign-in already in progress, skipping...');
      return false;
    }

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

    signingRef.current = true;
    setIsAuthenticating(true);
    
    try {
      console.log('Starting Web3 sign-in for:', publicKey.toString());
      
      const { error } = await supabase.auth.signInWithWeb3({
        chain: 'solana',
        statement: 'Sign in to VapeFi to start tracking your puffs and earning rewards.',
        wallet: {
          publicKey,
          signMessage: async (message: Uint8Array) => {
            console.log('Signing message...');
            return await signMessage(message);
          },
        } as any,
      });

      if (error) {
        console.error('Auth error:', error);
        toast({
          title: "Authentication failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      console.log('Web3 sign-in successful');
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
      signingRef.current = false;
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

  const value: AuthContextType = {
    user,
    session,
    connected,
    publicKey,
    isAuthenticating,
    isAuthenticated: !!user && connected,
    profileComplete,
    isFullyAuthenticated: !!user && connected && profileComplete,
    signInWithWallet,
    signOut,
    checkProfileComplete,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};