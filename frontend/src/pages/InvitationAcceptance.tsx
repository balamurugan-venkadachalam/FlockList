import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/shadcn/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { PaperCard } from '@/components/ui/shadcn/card';
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { acceptInvitation } from '../services/flockService';
import { useAuth } from '../context/AuthContext';

const InvitationAcceptance: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token, isLoading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flockName, setFlockName] = useState<string | null>(null);
  const [flockId, setFlockId] = useState<string | null>(null);

  // Get the invitation token from URL query parameter
  const invitationToken = searchParams.get('token');

  useEffect(() => {
    // Wait for authentication to complete
    if (authLoading) return;

    // Make sure user is logged in
    if (!user || !token) {
      // Save the invitation URL to localStorage so we can redirect back after login
      if (invitationToken) {
        localStorage.setItem('invitationRedirect', window.location.href);
      }
      navigate('/login', { state: { message: 'Please log in to accept the invitation' } });
      return;
    }

    // Process the invitation automatically if token is present
    if (invitationToken && !isProcessing && !success && !error) {
      processInvitation(invitationToken);
    }
  }, [invitationToken, authLoading, user, token]);

  const processInvitation = async (token: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      setIsProcessing(true);
      const response = await acceptInvitation(token);
      
      // Extract the flock data from the response
      const flockData = response.flock;
      
      if (!flockData) {
        throw new Error('Invalid response: Missing flock data');
      }
      
      setSuccess(true);
      setFlockId(flockData._id);
      setFlockName(flockData.name);
    } catch (error: any) {
      setError(error.message || 'Failed to accept invitation. It may be invalid or expired.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToFlock = () => {
    if (flockId) {
      navigate(`/flocks/${flockId}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (authLoading) {
    return (
      <div className="container mx-auto max-w-md px-4">
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <h2 className="text-xl font-semibold ml-2">
            Authenticating...
          </h2>
        </div>
      </div>
    );
  }

  if (!invitationToken) {
    return (
      <div className="container mx-auto max-w-md px-4">
        <PaperCard elevation={3} className="p-6 mt-6">
          <div className="text-center mb-6">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold mt-4">
              Invalid Invitation
            </h2>
          </div>
          
          <p className="text-gray-700 mb-6">
            No invitation token was provided. Please use the complete invitation link sent to your email.
          </p>
          
          <Button 
            variant="default" 
            className="w-full mt-4"
            onClick={handleGoToDashboard}
          >
            Go to Dashboard
          </Button>
        </PaperCard>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="container mx-auto max-w-md px-4">
        <PaperCard elevation={3} className="p-6 mt-6">
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-semibold mt-6">
              Processing Invitation
            </h2>
            <p className="text-gray-500 mt-2">
              Please wait while we process your invitation...
            </p>
          </div>
        </PaperCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-md px-4">
        <PaperCard elevation={3} className="p-6 mt-6">
          <div className="text-center mb-6">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold mt-4">
              Invitation Error
            </h2>
          </div>
          
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <p className="text-gray-700 mb-6">
            There was a problem accepting the invitation. The invitation may have expired or been cancelled.
          </p>
          
          <Button 
            variant="default" 
            className="w-full mt-4"
            onClick={handleGoToDashboard}
          >
            Go to Dashboard
          </Button>
        </PaperCard>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto max-w-md px-4">
        <PaperCard elevation={3} className="p-6 mt-6">
          <div className="text-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold mt-4">
              Invitation Accepted
            </h2>
          </div>
          
          <p className="text-gray-700 mb-6">
            You have successfully joined the flock <strong>{flockName}</strong>!
          </p>
          
          <div className="border-t border-gray-200 my-6"></div>
          
          <Button 
            variant="default" 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoToFlock}
          >
            Go to Flock Page <ArrowRight className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={handleGoToDashboard}
          >
            Go to Dashboard
          </Button>
        </PaperCard>
      </div>
    );
  }

  // Default fallback (should not reach here in normal flow)
  return (
    <div className="container mx-auto max-w-md px-4">
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );
};

export default InvitationAcceptance; 