// Rule applied: Use TypeScript for all code; prefer interfaces over types
// Rule applied: Use functional components with TypeScript interfaces
// Rule applied: Use React Form for form handling

import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Rule applied: Use Shadcn UI components
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/shadcn/select";
import { Separator } from "@/components/ui/shadcn/separator";

// Rule applied: Use Lucide icons for UI elements
import { Loader2 } from "lucide-react";

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
  return new Promise((resolve) => {
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
    
    document.body.appendChild(script);
  });
};

const RegisterForm: React.FC<RegisterFormProps> = ({ onVerificationSent }) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState<boolean>(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  
  // Detect if running in Storybook environment
  const isStorybook = window.location.href.includes('localhost:6006');
  
  // Auth and navigation hooks
  const { register: registerUser, googleLogin } = useAuth();
  const navigate = useNavigate();
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

  // Clear form error when needed
  const resetFormState = () => {
    setFormError(null);
    setLoading(false);
  };

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
      } catch (err: any) {
        console.error('Failed to load Google script:', err);
        if (err.message && err.message.includes('network')) {
          setFormError('Network error. Please check your connection.');
        } else {
          setFormError('Failed to load Google OAuth. Please try again later.');
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
          text: 'signup_with',
          shape: 'rectangular'
        }
      );
      
      // Also provide the One Tap experience when appropriate
      if (!isStorybook) {
        window.google.accounts.id.prompt();
      }
    } catch (error) {
      console.error('Error initializing Google Sign-In button:', error);
    }
  };

  // Handle Google OAuth response
  const handleGoogleResponse = async (response: any) => {
    const { credential } = response;
    if (!credential) return;
    
    try {
      setLoading(true);
      setFormError(null);
      
      try {
        await googleLogin(credential);
        // If successful, navigate to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Google login error:', error);
        setFormError('Google login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      resetFormState();
      
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
      setFormError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Rule applied: Create Shared Component Libraries for complex styling needs
  return (
    <div 
      className="flex justify-center items-center min-h-screen p-4"
      data-testid="register-form-container"
    >
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Input
                        {...field}
                        id="firstName"
                        placeholder="First Name"
                        className={error ? "border-red-500" : ""}
                        data-testid="register-firstname-input"
                      />
                      {error && (
                        <p className="text-sm text-red-500 mt-1">{error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Input
                        {...field}
                        id="lastName"
                        placeholder="Last Name"
                        className={error ? "border-red-500" : ""}
                        data-testid="register-lastname-input"
                      />
                      {error && (
                        <p className="text-sm text-red-500 mt-1">{error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="Email"
                      className={error ? "border-red-500" : ""}
                      data-testid="register-email-input"
                    />
                    {error && (
                      <p className="text-sm text-red-500 mt-1">{error.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger 
                        id="role" 
                        className={error ? "border-red-500" : ""}
                        data-testid="register-role-select"
                      >
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin" data-testid="register-role-admin">Admin</SelectItem>
                        <SelectItem value="member" data-testid="register-role-member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                    {error && (
                      <p className="text-sm text-red-500 mt-1">{error.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      placeholder="Password"
                      className={error ? "border-red-500" : ""}
                      data-testid="register-password-input"
                    />
                    {error && (
                      <p className="text-sm text-red-500 mt-1">{error.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Input
                      {...field}
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm Password"
                      className={error ? "border-red-500" : ""}
                      data-testid="register-confirm-password-input"
                    />
                    {error && (
                      <p className="text-sm text-red-500 mt-1">{error.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={loading}
              data-testid="register-submit-button"
            >
              {/* Never show loading state in Storybook environment */}
              {loading && !window.location.href.includes('localhost:6006') ? 
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Register'}
            </Button>
          </form>

          <Separator className="my-6">OR</Separator>

          {isGoogleScriptLoaded ? (
            <div 
              ref={googleButtonRef} 
              className="flex justify-center"
              data-testid="google-signin-button"
            ></div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              disabled
              data-testid="google-signin-loading"
            >
              Loading Google Sign-In...
            </Button>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <RouterLink to="/login" className="text-blue-600 hover:text-blue-800 font-medium" data-testid="login-link">
                Login
              </RouterLink>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;