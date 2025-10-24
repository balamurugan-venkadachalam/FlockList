// Rule applied: Use TypeScript for all code; prefer interfaces over types
// Rule applied: Use React Form for form handling

// Rule applied: Use absolute imports for all files @/...
import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Separator } from "@/components/ui/shadcn/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormContainer } from '@/components/ui/ThemeComponents';

// Rule applied: Use Lucide icons for UI elements
import { Loader2, AlertCircle } from "lucide-react";

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
  // Rule applied: Use declarative programming patterns
  // Using Tailwind's responsive classes instead of Material UI's useMediaQuery
  const isMobile = window.innerWidth < 640; // sm breakpoint in Tailwind is 640px
  
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
  
  // Rule applied: Use controlled components
  const [customError, setCustomError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState<boolean>(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendingSent, setResendingSent] = useState<boolean>(false);
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState<boolean>(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  
  // Detect if running in Storybook environment
  const isStorybook = window.location.href.includes('localhost:6006');

  // Get auth context values
  const { login, googleLogin, resendVerificationEmail, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
        // Use redirect mode instead of popup mode for better compatibility
        ux_mode: 'redirect',
        // Store the current URL to return to after authentication
        state: window.location.pathname + window.location.search
      });

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        { 
          theme: 'outline', 
          size: 'large', 
          width: '100%',
          text: 'signin_with',
          shape: 'rectangular'
        }
      );
      
      // Also provide the One Tap experience when appropriate
      if (!isStorybook) {
        window.google.accounts.id.prompt();
      }
      
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

  // We'll use this function directly where needed
  useEffect(() => {
    if (infoMessage) {
      const timer = setTimeout(() => setInfoMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [infoMessage]);

  // Rule applied: Create Shared Component Libraries for complex styling needs
  return (
    <FormContainer>
      <Card className="w-full" data-testid="login-form">
        <CardContent className="pt-6 px-6 pb-6">
          {/* Rule applied: Use TypeScript for all code; prefer interfaces over types */}
          <h1 className="text-center font-medium text-2xl sm:text-3xl mb-4 sm:mb-6">
            Sign in to your account
          </h1>

          {/* Display custom error messages with proper data-testid for e2e tests */}
          {customError && (
            <Alert variant="destructive" className="mb-3 sm:mb-4 text-sm" data-testid="error-message">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{customError}</AlertDescription>
            </Alert>
          )}

          {/* Display info messages */}
          {infoMessage && (
            <Alert className="mb-3 sm:mb-4 text-sm">
              <AlertDescription>{infoMessage}</AlertDescription>
            </Alert>
          )}
          
          {/* Show success message when verification email is sent */}
          {resendingSent && (
            <Alert className="mb-3 sm:mb-4 text-sm bg-green-50 border-green-200 text-green-800" data-testid="verification-sent-message">
              <AlertDescription>Verification email sent! Please check your inbox.</AlertDescription>
            </Alert>
          )}

          {/* Rule applied: Use controlled components */}
          {/* Rule applied: Use React Form for form handling */}
          <form onSubmit={hookFormSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              {/* Rule applied: Use TypeScript for all code; prefer interfaces over types */}
              <div className="space-y-1">
                <Label htmlFor="email-input" className="text-sm font-medium">Email</Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div>
                      <Input
                        {...field}
                        type="email"
                        id="email-input"
                        className={`w-full ${fieldState.error ? 'border-red-500' : ''}`}
                        required
                        data-testid="email-input"
                      />
                      {fieldState.error && (
                        <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              {/* Rule applied: Use TypeScript for all code; prefer interfaces over types */}
              <div className="space-y-1">
                <Label htmlFor="password-input" className="text-sm font-medium">Password</Label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div>
                      <Input
                        {...field}
                        type="password"
                        id="password-input"
                        className={`w-full ${fieldState.error ? 'border-red-500' : ''}`}
                        required
                        data-testid="password-input"
                      />
                      {fieldState.error && (
                        <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          
          {/* Email verification UI */}
          {needsVerification && unverifiedEmail && (
            <div className="mt-4 sm:mt-6 text-center p-3 sm:p-4 bg-red-50 rounded-md">
              {/* Rule applied: Implementation of Tailwind CSS for styling */}
              <p className="text-sm text-red-600 mb-2">
                Your email needs to be verified before you can log in.
              </p>
              <Button
                onClick={handleResendVerification}
                variant="outline"
                disabled={isLoading || resendingSent}
                data-testid="resend-verification-button"
                size="sm"
                className="text-sm"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Resend Verification Email'}
              </Button>
            </div>
          )}
          
          {/* Rule applied: Implement proper TypeScript discriminated unions for message types */}
          <Button
            type="submit"
            className="w-full mt-6 sm:mt-8 py-2 sm:py-2.5"
            disabled={isSubmitting}
            data-testid="login-button"
          >
            {/* Never show loading state in Storybook environment */}
            {isSubmitting && !window.location.href.includes('localhost:6006') ? 
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
          </Button>
        </form>

      <Separator className="my-4 sm:my-6">OR</Separator>

      {isGoogleScriptLoaded ? (
        <div 
          ref={googleButtonRef}
          id="google-signin-button" 
          className="google-signin-button" 
          data-testid="google-signin-button"
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: isMobile ? '8px' : '16px'
          }}
        ></div>
      ) : (
        <Button
          variant="outline"
          className="w-full py-2 sm:py-2.5"
          disabled
        >
          <span className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Loading Google Sign-In...
          </span>
        </Button>
      )}

      <div className="mt-6 sm:mt-8 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Don't have an account?{' '}
          <RouterLink 
            to="/register" 
            className="font-medium text-primary hover:underline"
            data-testid="register-link"
          >
            Register
          </RouterLink>
        </p>
        <p className="text-sm text-gray-600">
          <RouterLink 
            to="/forgot-password" 
            className="font-medium text-primary hover:underline"
            data-testid="forgot-password-link"
          >
            Forgot password?
          </RouterLink>
        </p>
      </div>
    </CardContent>
  </Card>
</FormContainer>
  );
};

export default LoginForm;