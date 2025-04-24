import React, { useEffect, useRef } from 'react';
import { Button, CircularProgress, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../../context/AuthContext';

// Define window with gapi property
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GoogleSignInButton: React.FC = () => {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleGoogleSignIn = async (response: any) => {
      try {
        setLoading(true);
        // Pass the token from Google's response to your Auth context
        await googleLogin(response.credential);
      } catch (err) {
        console.error('Google sign-in failed:', err);
      } finally {
        setLoading(false);
      }
    };

    // Initialize Google OAuth when the component mounts
    const initializeGoogleAuth = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
        });
      }
    };

    // Add the Google Sign-In script
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleAuth;
    document.body.appendChild(script);

    return () => {
      // Clean up
      document.body.removeChild(script);
    };
  }, [googleLogin]);

  return (
    <div>
      {loading ? (
        <Button
          variant="outlined"
          fullWidth
          startIcon={<CircularProgress size={20} />}
          disabled
        >
          Signing in...
        </Button>
      ) : (
        <div ref={googleButtonRef} style={{ width: '100%' }}></div>
      )}
    </div>
  );
};

export default GoogleSignInButton; 