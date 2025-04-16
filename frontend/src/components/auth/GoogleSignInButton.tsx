import React from 'react';
import { Button, CircularProgress, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../../context/AuthContext';

const GoogleSignInButton: React.FC = () => {
  const { googleLogin, isLoading, error } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      // In a real implementation, this would get the token from Google's OAuth flow
      // For now, we'll use a placeholder token
      const token = 'google-auth-token';
      await googleLogin(token);
    } catch (err) {
      // Ensure we're passing the error object correctly
      console.error('Google sign-in failed:', err);
    }
  };

  return (
    <Button
      variant="outlined"
      fullWidth
      startIcon={isLoading ? <CircularProgress size={20} /> : <GoogleIcon />}
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      {isLoading ? 'Signing in...' : 'Continue with Google'}
    </Button>
  );
};

export default GoogleSignInButton; 