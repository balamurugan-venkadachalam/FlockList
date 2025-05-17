// Rule applied: Use TypeScript for all code; prefer interfaces over types
// Rule applied: Use functional components with TypeScript interfaces
// Rule applied: Use React Form for form handling

import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Link,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';

// Define validation schema
const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['admin', 'member'])
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onVerificationSent?: (email: string) => void;
}

// Google OAuth client ID from environment variables
// Using Vite's import.meta.env instead of process.env
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Rule applied: Use functional and declarative programming patterns
// Load Google OAuth script
const loadGoogleScript = (): Promise<HTMLScriptElement> => {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (existingScript) {
      resolve(existingScript as HTMLScriptElement);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve(script);
    script.onerror = (error) => reject(new Error(`Failed to load Google OAuth script: ${error}`));
    
    document.body.appendChild(script);
  });
};

const RegisterForm: React.FC<RegisterFormProps> = ({ onVerificationSent }) => {
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register: registerUser, googleLogin } = useAuth();
  const navigate = useNavigate();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const { 
    control, 
    handleSubmit, 
    formState: { /* errors not used directly */ } 
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'member',
    }
  });

  const clearError = () => setError(null);

  // Rule applied: Use functional and declarative programming patterns
  useEffect(() => {
    // Load Google OAuth script using Promise
    let isMounted = true;
    
    const initializeScript = async () => {
      try {
        await loadGoogleScript();
        
        // Only update state if component is still mounted
        if (isMounted) {
          setIsGoogleScriptLoaded(true);
          // Delay initialization to ensure DOM is ready
          setTimeout(() => {
            if (isMounted) {
              initializeGoogleButton();
            }
          }, 100);
        }
      } catch (error) {
        console.error('Failed to load Google script:', error);
        if (isMounted) {
          setError('Failed to load Google Sign-In. Please try again later.');
        }
      }
    };
    
    initializeScript();

    return () => {
      // Prevent state updates after unmount
      isMounted = false;
      
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
    } catch (error) {
      console.error('Error initializing Google Sign-In button:', error);
    }
  };

  // Handle Google OAuth response
  const handleGoogleResponse = async (response: any) => {
    try {
      await googleLogin(response.credential);
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google login failed. Please try again.');
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { confirmPassword, ...registerData } = data;
      
      const result = await registerUser(registerData);
      
      // Check if email verification is required
      if (result && result.requireEmailVerification) {
        if (onVerificationSent) {
          onVerificationSent(data.email);
        }
      } else {
        // If no verification needed, redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
        backgroundColor: '#f5f5f5',
      }}
      data-testid="register-form-container"
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom data-testid="register-title">
          Register
        </Typography>

        {error && (
          <Alert severity="error" onClose={clearError} data-testid="register-error">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} data-testid="register-form">
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Controller
                name="firstName"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    data-testid="register-firstname-input"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="lastName"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    data-testid="register-lastname-input"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    data-testid="register-email-input"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="role"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error} data-testid="register-role-select">
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                      {...field}
                      labelId="role-label"
                      label="Role"
                    >
                      <MenuItem value="admin" data-testid="register-role-admin">Admin</MenuItem>
                      <MenuItem value="member" data-testid="register-role-member">Member</MenuItem>
                    </Select>
                    {error && <Typography color="error" variant="caption">{error.message}</Typography>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Password"
                    type="password"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    data-testid="register-password-input"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    data-testid="register-confirm-password-input"
                  />
                )}
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
            disabled={loading}
            data-testid="register-submit-button"
          >
            {loading ? <CircularProgress size={24} /> : 'Register'}
          </Button>
        </form>

        <Divider sx={{ my: 2 }}>OR</Divider>

        {isGoogleScriptLoaded ? (
          <div 
            ref={googleButtonRef} 
            style={{display: 'flex', justifyContent: 'center'}}
            data-testid="google-signin-button"
          ></div>
        ) : (
          <Button
            variant="outlined"
            fullWidth
            size="large"
            disabled
            data-testid="google-signin-loading"
          >
            Loading Google Sign-In...
          </Button>
        )}

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" sx={{ textDecoration: 'none' }} data-testid="login-link">
              Login
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterForm;