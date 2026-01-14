import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Button } from '@/components/ui/shadcn/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { PaperCard } from '@/components/ui/shadcn/card';
import { Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError('Invalid or missing verification token');
        setLoading(false);
        return;
      }

      try {
        await verifyEmail(token);
        setVerified(true);
        
        // Auto-redirect to dashboard after successful verification
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } catch (err: any) {
        console.error('Verification error:', err);
        setError(err.response?.data?.message || 'Failed to verify email. The token may be invalid or expired.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token, verifyEmail, navigate]);

  return (
    <div className="container mx-auto max-w-md px-4">
      <PaperCard elevation={3} className="p-6 mt-8">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-xl font-semibold mb-4">
            Email Verification
          </h1>
          
          {loading && (
            <div className="my-8 flex flex-col items-center">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="mt-4 text-gray-700">
                Verifying your email...
              </p>
            </div>
          )}
          
          {error && !loading && (
            <>
              <Alert variant="destructive" className="mt-4 w-full">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="mt-6">
                <p className="text-gray-700 mb-4">
                  The verification link may have expired.
                </p>
                <Button
                  asChild
                  variant="default"
                >
                  <RouterLink to="/login">Go to Login</RouterLink>
                </Button>
              </div>
            </>
          )}
          
          {verified && !loading && (
            <>
              <Alert className="mt-4 w-full bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Your email has been successfully verified!</AlertDescription>
              </Alert>
              <p className="mt-6 text-gray-700">
                You will be redirected to the dashboard in a few seconds...
              </p>
              <RouterLink to="/dashboard" className="mt-4 text-primary hover:text-primary/80 underline">
                Click here if you are not redirected automatically
              </RouterLink>
            </>
          )}
        </div>
      </PaperCard>
    </div>
  );
};

export default VerifyEmailPage; 