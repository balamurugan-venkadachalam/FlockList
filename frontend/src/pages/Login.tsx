// Rule applied: Use TypeScript for all code; prefer interfaces over types
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Rule applied: Use absolute imports for all files @/...
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';

// Shadcn UI components
import { Card, CardContent } from '@/components/ui/shadcn/card';

/**
 * LoginPage component that serves as a wrapper for the LoginForm
 * Handles authentication state and redirects
 */
// Rule applied: Use functional components with TypeScript interfaces
const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('User is already authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Rule applied: Implementation of Tailwind CSS for styling
  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-5xl">
      <div className="my-4 sm:my-6 md:my-8">
        <Card className="overflow-hidden bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center md:flex-row-reverse">
              <div className="col-span-1 order-first md:order-last mb-4 md:mb-0 hidden sm:block">
                <img
                  src="/images/login-illustration.svg"
                  alt="Login"
                  className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              
              <div className="col-span-1">
                <h1 className="text-3xl font-bold mb-2 text-center md:text-left">
                  Sign In
                </h1>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 text-center md:text-left">
                  Welcome back to Flock Task Manager
                </p>
                
                <LoginForm />
                
                <div className="mt-6 text-center md:text-left">
                  <p className="text-base">
                    Don't have an account?{' '}
                    <Link 
                      to="/register" 
                      className="font-medium text-primary hover:underline"
                    >
                      Register here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;