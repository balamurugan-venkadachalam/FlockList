// Rule applied: Use TypeScript for all code; prefer interfaces over types
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// Rule applied: Use absolute imports for all files @/...
import RegisterForm from '@/components/auth/RegisterForm';

// Rule applied: Use Shadcn UI components
import { Button } from "@/components/ui/shadcn/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/shadcn/card";

// Rule applied: Use Lucide icons for UI elements
import { Loader2 } from "lucide-react";

/**
 * Register page component
 * Uses the RegisterForm component to handle user registration
 */
// Rule applied: Use functional components with TypeScript interfaces
const Register: React.FC = () => {
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Rule applied: Use Tailwind's responsive approach instead of Material UI's useMediaQuery
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640); // sm breakpoint in Tailwind is 640px
  
  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Handle when verification email is sent
   * @param email - The email that was registered
   */
  const handleVerificationSent = (email: string) => {
    setVerificationSent(true);
    setRegisteredEmail(email);
  };

  /**
   * Handle resend verification email
   */
  const handleResendVerification = async () => {
    if (!registeredEmail) return;
    
    setResendLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: registeredEmail }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resend verification email');
      }
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while resending verification email');
    } finally {
      setResendLoading(false);
    }
  };

  // Rule applied: Use Tailwind CSS for styling
  // Show verification screen if verification has been sent
  if (verificationSent && registeredEmail) {
    return (
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 max-w-6xl">
        <div className="my-4 sm:my-6 md:my-8">
          <Card className="overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 shadow-lg">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className={`flex flex-col ${isMobile ? 'flex-col-reverse' : 'md:flex-row'} items-center gap-6 md:gap-8`}>
                <div className="w-full md:w-1/2">
                  {/* Rule applied: Use Tailwind CSS for typography */}
                  <h1 className="text-3xl font-bold mb-4 text-center md:text-left">
                    Verification Email Sent
                  </h1>
                  
                  <p className="text-xl text-gray-600 mb-4 sm:mb-6 text-center md:text-left">
                    We've sent a verification email to <strong>{registeredEmail}</strong>
                  </p>
                  
                  <p className="text-base mb-4 text-center md:text-left">
                    Please check your inbox and click on the verification link to complete your registration.
                    If you don't see the email, please check your spam folder.
                  </p>
                  
                  <div className="mt-6 text-center md:text-left">
                    {error && (
                      <Alert variant="destructive" className="mt-4 w-full rounded">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-4">
                      <Button
                        variant="default"
                        size="lg"
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                        className="min-w-[200px]"
                      >
                        {resendLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Resend Verification Email'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Hide image on very small screens */}
                {(!isMobile || window.innerWidth >= 768) && (
                  <div className="w-full md:w-1/2 mb-4 md:mb-0">
                    <img
                      src="/images/email-verification.svg" 
                      alt="Email verification"
                      className="w-full max-w-[250px] sm:max-w-[300px] md:max-w-[400px] h-auto mx-auto block"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Rule applied: Use Tailwind CSS for styling
  // Show registration form
  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 max-w-6xl">
      <div className="my-4 sm:my-6 md:my-8">
        <Card className="overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 shadow-lg">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className={`flex flex-col ${isMobile ? 'flex-col-reverse' : 'md:flex-row'} items-center gap-6 md:gap-8`}>
              <div className="w-full md:w-1/2">
                {/* Rule applied: Use Tailwind CSS for typography */}
                <h1 className="text-3xl font-bold mb-4 text-center md:text-left">
                  Create an Account
                </h1>
                
                <p className="text-xl text-gray-600 mb-4 sm:mb-6 text-center md:text-left">
                  Join Flock Task Manager to organize your tasks
                </p>
                
                <RegisterForm onVerificationSent={handleVerificationSent} />
                
                <div className="mt-6 text-center md:text-left">
                  <p className="text-base">
                    Already have an account?{' '}
                    <RouterLink 
                      to="/login" 
                      className="text-blue-600 hover:text-blue-800 font-bold"
                    >
                      Sign in here
                    </RouterLink>
                  </p>
                </div>
              </div>
              
              {/* Hide image on very small screens */}
              {(!isMobile || window.innerWidth >= 768) && (
                <div className="w-full md:w-1/2 mb-4 md:mb-0">
                  <img
                    src="/images/register-illustration.svg" 
                    alt="Register"
                    className="w-full max-w-[250px] sm:max-w-[300px] md:max-w-[400px] h-auto mx-auto block"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register; 