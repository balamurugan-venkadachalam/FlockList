import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

// Google OAuth client ID - replace with your actual client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Load Google OAuth script
const loadGoogleScript = () => {
  // Check if script already exists
  if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
    return null;
  }
  
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);
  return script;
};

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  const { login, googleLogin, error, isLoading, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Get the return URL from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    // Load Google OAuth script
    const script = loadGoogleScript();
    
    const handleScriptLoad = () => {
      setIsGoogleScriptLoaded(true);
      // Delay initialization to ensure DOM is ready
      setTimeout(() => {
        initializeGoogleButton();
      }, 100);
    };
    
    if (script) {
      script.onload = handleScriptLoad;
    } else {
      // Script already exists, initialize directly
      setIsGoogleScriptLoaded(true);
      setTimeout(() => {
        initializeGoogleButton();
      }, 100);
    }

    return () => {
      // Clean up script on component unmount
      const scriptElement = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, []);

  // Initialize Google OAuth button
  const initializeGoogleButton = () => {
    if (!window.google || !window.google.accounts) {
      console.error('Google API not loaded yet');
      return;
    }
    
    if (!googleButtonRef.current) {
      console.error('Google button container not found');
      return;
    }
    
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        { theme: 'outline', size: 'large', width: '100%' }
      );
      
      console.log('Google Sign-In button initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Sign-In button:', error);
    }
  };

  // Handle Google OAuth response
  const handleGoogleResponse = async (response: any) => {
    try {
      await googleLogin(response.credential);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: 2,
        backgroundColor: '#f5f5f5',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Login
        </Typography>

        {error && (
          <Alert severity="error" onClose={clearError}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                name="password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </form>

        <Divider sx={{ my: 2 }}>OR</Divider>

        {isGoogleScriptLoaded ? (
          <div ref={googleButtonRef} style={{display: 'flex', justifyContent: 'center'}}></div>
        ) : (
          <Button
            variant="outlined"
            fullWidth
            size="large"
            startIcon={<GoogleIcon />}
            disabled
          >
            Loading Google Sign-In...
          </Button>
        )}

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link to="/register" style={{ textDecoration: 'none' }}>
              Register
            </Link>
          </Typography>
          <Typography variant="body2">
            <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm; 