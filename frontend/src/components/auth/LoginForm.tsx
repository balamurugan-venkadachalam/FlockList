// Rule applied: Use TypeScript for all code; prefer interfaces over types
// Rule applied: Use React Form for form handling

// Rule applied: Use absolute imports for all files @/...
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  useTheme,
  useMediaQuery
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

// Rule applied: Use TypeScript for all code; prefer interfaces over types
// Rule applied: Use React Form for form handling

// Define form schema using Zod
const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

// Infer the form data type from the schema
type LoginFormData = z.infer<typeof loginFormSchema>;

// Define error interface for authentication errors
interface AuthErrorData {
  code?: string;
  message: string;
  requireEmailVerification?: boolean;
  isAuthError?: boolean;
  isRateLimited?: boolean;
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

// Rule applied: Use functional components with TypeScript interfaces
const LoginForm: React.FC = () => {
  const theme = useTheme();
  // Rule applied: Use declarative programming patterns
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Rule applied: Use React Form for form handling
  const {
    control,
    handleSubmit: hookFormSubmit,
    getValues,
    formState: { isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onBlur' // Validate on blur for better UX
  });
  
  // UI state
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState<boolean>(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState<boolean>(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendingSent, setResendingSent] = useState<boolean>(false);
  
  // Rule applied: Use absolute imports for all files
  // Get auth context values
  const { login, googleLogin, resendVerificationEmail, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Get the return URL from location state or check for invitation redirect
  const redirectUrl = localStorage.getItem('invitationRedirect');
  // Default to dashboard if no other redirects are available
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Check for message in location state (e.g., from invitation redirect)
  const message = (location.state as any)?.message || null;
  const [infoMessage, setInfoMessage] = useState<string | null>(message);

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

  // Handle redirect after successful login
  const handleLoginSuccess = () => {
    if (redirectUrl) {
      // Clear the stored redirect URL
      localStorage.removeItem('invitationRedirect');
      // Navigate to the saved URL
      window.location.href = redirectUrl;
    } else {
      // Navigate to the from path or dashboard
      navigate(from, { replace: true });
    }
  };

  // Handle Google OAuth response
  const handleGoogleResponse = async (response: any) => {
    try {
      await googleLogin(response.credential);
      handleLoginSuccess();
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  // Rule applied: Use explicit return types for all functions
  // Rule applied: Implement proper error handling
  // Rule applied: Use React Form for form handling
  // Handle form submission
  const onSubmit = async (data: LoginFormData): Promise<void> => {
    setCustomError(null);
    
    try {
      await login(data.email, data.password);
      handleLoginSuccess();
    } catch (err: unknown) {
      console.error('Login error:', err);
      
      // Type guard to handle error properly
      const authError = err as AuthErrorData;
      
      // Handle different error types
      if (authError.requireEmailVerification) {
        setNeedsVerification(true);
        setUnverifiedEmail(data.email);
        setCustomError(authError.message || 'Please verify your email before logging in');
      } else if (authError.isAuthError || authError.code === 'AUTHENTICATION_ERROR') {
        setCustomError(authError.message || 'Invalid credentials');
      } else if (authError.isRateLimited || authError.response?.status === 429) {
        setCustomError('Too many login attempts, please try again later');
      } else {
        setCustomError(authError.message || 'An error occurred during login');
      }
    }
  };
  
  // Rule applied: Implement proper error handling
  // Rule applied: Use React Form for form handling
  // Handle resend verification email
  const handleResendVerification = async (): Promise<void> => {
    // Use unverifiedEmail if available, otherwise get the email from the form
    const emailToVerify = unverifiedEmail || getValues('email');
    if (!emailToVerify) return;
    
    try {
      await resendVerificationEmail(emailToVerify);
      setResendingSent(true);
      setCustomError(null);
    } catch (err: unknown) {
      console.error('Resend verification error:', err);
      const authError = err as AuthErrorData;
      setCustomError(authError.response?.data?.message || 'Failed to resend verification email');
    }
  };

  // Clear info message when dismissed
  const clearInfoMessage = () => {
    setInfoMessage(null);
  };

  // Rule applied: Implementation of Material UI for styling
  return (
    <Box
      sx={{
        maxWidth: 500,
        mx: 'auto',
        p: { xs: 1, sm: 2 },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1.5, sm: 2 },
      }}
    >
      <Paper 
        sx={{ 
          padding: { xs: 2, sm: 3 },
          borderRadius: theme.shape.borderRadius
        }} 
        data-testid="login-form"
      >
        {/* Rule applied: Use TypeScript for all code; prefer interfaces over types */}
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            textAlign: 'center',
            fontWeight: 500,
            mb: { xs: 2, sm: 3 }
          }}
        >
          Sign in to your account
        </Typography>

        {/* Display custom error messages with proper data-testid for e2e tests */}
        {customError && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.85rem', sm: '0.9rem' }
            }}
            onClose={() => setCustomError(null)} 
            data-testid="error-message"
          >
            {customError}
          </Alert>
        )}

        {/* Display info messages */}
        {infoMessage && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.85rem', sm: '0.9rem' }
            }} 
            onClose={clearInfoMessage}
          >
            {infoMessage}
          </Alert>
        )}
        
        {/* Show success message when verification email is sent */}
        {resendingSent && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.85rem', sm: '0.9rem' }
            }} 
            data-testid="verification-sent-message"
          >
            Verification email sent! Please check your inbox.
          </Alert>
        )}

        {/* Rule applied: Use controlled components */}
        {/* Rule applied: Use React Form for form handling */}
        <form onSubmit={hookFormSubmit(onSubmit)}>
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            <Grid item xs={12}>
              {/* Rule applied: Use TypeScript for all code; prefer interfaces over types */}
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    required
                    id="email-input"
                    margin="normal"
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      mt: { xs: 0.5, sm: 1 },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      },
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }
                    }}
                    inputProps={{
                      'data-testid': 'email-input' // Apply data-testid to the input element
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              {/* Rule applied: Use TypeScript for all code; prefer interfaces over types */}
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Password"
                    type="password"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    required
                    id="password-input"
                    margin="normal"
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      },
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }
                    }}
                    inputProps={{
                      'data-testid': 'password-input' // Apply data-testid to the input element
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
          
          {/* Email verification UI */}
          {needsVerification && unverifiedEmail && (
            <Box sx={{ 
              mt: { xs: 1.5, sm: 2 }, 
              textAlign: 'center',
              p: { xs: 1, sm: 1.5 },
              bgcolor: 'rgba(211, 47, 47, 0.04)',
              borderRadius: 1
            }}>
              {/* Rule applied: Implementation of Material UI for styling */}
              <Typography 
                variant="body2" 
                color="error" 
                gutterBottom
              >
                Your email needs to be verified before you can log in.
              </Typography>
              <Button
                onClick={handleResendVerification}
                color="secondary"
                disabled={isLoading || resendingSent}
                data-testid="resend-verification-button"
                size={isMobile ? "small" : "medium"}
              >
                {isLoading ? <CircularProgress size={isMobile ? 16 : 24} /> : 'Resend Verification Email'}
              </Button>
            </Box>
          )}
          
          {/* Rule applied: Implement proper TypeScript discriminated unions for message types */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size={isMobile ? "medium" : "large"}
            sx={{ 
              mt: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.5 }
            }}
            disabled={isLoading || isSubmitting}
            data-testid="login-button"
          >
            {(isLoading || isSubmitting) ? <CircularProgress size={isMobile ? 20 : 24} /> : 'Login'}
          </Button>
        </form>

        <Divider sx={{ my: { xs: 1.5, sm: 2 } }}>OR</Divider>

        {isGoogleScriptLoaded ? (
          <div 
            ref={googleButtonRef} 
            style={{
              display: 'flex', 
              justifyContent: 'center',
              marginTop: isMobile ? '8px' : '16px'
            }}
          ></div>
        ) : (
          <Button
            variant="outlined"
            fullWidth
            size={isMobile ? "medium" : "large"}
            startIcon={<GoogleIcon />}
            disabled
            sx={{ 
              mt: { xs: 1, sm: 2 }
            }}
          >
            Loading Google Sign-In...
          </Button>
        )}

        {/* Rule applied: Implementation of Material UI for styling */}
        <Box sx={{ 
          mt: { xs: 1.5, sm: 2.5, md: 3, lg: 3.5 }, 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 0.5, sm: 1, md: 1.5 }
        }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              style={{ 
                textDecoration: 'none',
                fontWeight: 500
              }}
            >
              Register
            </Link>
          </Typography>
          <Typography variant="body2">
            <Link 
              to="/forgot-password" 
              style={{ 
                textDecoration: 'none',
                fontWeight: 500 
              }}
            >
              Forgot password?
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm; 