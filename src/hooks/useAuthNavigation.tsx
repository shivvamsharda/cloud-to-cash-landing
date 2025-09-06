import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const useAuthNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, profileComplete } = useAuth();

  useEffect(() => {
    // Only handle navigation when authentication state is known
    if (isAuthenticated && profileComplete !== null) {
      const currentPath = location.pathname;
      
      // If user completes profile setup, go to track
      if (currentPath === '/setup-profile' && profileComplete) {
        navigate('/track', { replace: true });
        return;
      }
      
      // If user tries to access track without complete profile, redirect to setup
      if (currentPath === '/track' && !profileComplete) {
        navigate('/setup-profile', { replace: true });
        return;
      }
      
      // Auto-redirect from home to track for fully authenticated users
      if (currentPath === '/' && profileComplete) {
        navigate('/track', { replace: true });
        return;
      }
    }
  }, [isAuthenticated, profileComplete, location.pathname, navigate]);

  return {
    shouldRedirectToSetup: isAuthenticated && profileComplete === false,
    shouldRedirectToTrack: isAuthenticated && profileComplete === true,
    isReady: profileComplete !== null
  };
};