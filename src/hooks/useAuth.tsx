import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isNewUser: boolean;
  completeProfile: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Create or update user profile when user signs in
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(async () => {
            try {
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id, username, name, profile_picture_url')
                .eq('id', session.user.id)
                .maybeSingle();

              if (!existingProfile) {
                // New user - no profile exists, prompt for creation
                setIsNewUser(true);
              } else {
                // Check if profile is complete (has required fields)
                const isProfileComplete = existingProfile.name && 
                                        existingProfile.profile_picture_url && 
                                        existingProfile.username && 
                                        !existingProfile.username.startsWith('temp_');
                setIsNewUser(!isProfileComplete);
              }
            } catch (error) {
              console.error('Error checking user profile:', error);
            }
          }, 0);
        } else {
          setIsNewUser(false);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const completeProfile = () => {
    setIsNewUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isNewUser, completeProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};