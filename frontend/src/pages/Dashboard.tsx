import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw } from 'lucide-react';
import { getFamilies } from '../services/flockService';
// Using the correct Flock type to fix type errors
import { Flock } from '../types/models/flock';
import LoadingScreen from '../components/common/LoadingScreen';
import InvitationsList from '../components/features/flock/InvitationsList';
import { getUserInvitations, acceptInvitation, declineInvitation } from '../services/flockService';

// Shadcn UI components
import { Button } from '../components/ui/shadcn/button';
import { Card, CardContent, CardFooter } from '../components/ui/shadcn/card';
import { Progress } from '../components/ui/shadcn/progress';
import { Separator } from '../components/ui/shadcn/separator';

interface UserInvitation {
  _id: string;
  flockId: string;
  flockName: string;
  invitedBy: {
    _id: string;
    name: string;
    email: string;
  };
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  expiresAt: string;
  token: string;
}

interface UserInvitationsResponse {
  invitations: UserInvitation[];
}

// Local interface for families response
interface FamiliesResponse {
  message?: string;
  families?: Flock[];
  flocks?: Flock[];
}

const Dashboard: React.FC = () => {
  const { user, token, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [families, setFamilies] = useState<FamiliesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState(false);
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [invitationsError, setInvitationsError] = useState<string | null>(null);

  useEffect(() => {
    if (token && user && !authLoading) {
      const timer = setTimeout(() => {
        setTokenReady(true);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setTokenReady(false);
    }
  }, [token, user, authLoading]);

  useEffect(() => {
    if (token) {
      setTokenReady(true);
      fetchInvitations();
      fetchFamilies();
    }
  }, [token]);

  const fetchFamilies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getFamilies();
      
      // Handle the response properly based on its type
      if (Array.isArray(response)) {
        // If response is an array of flocks (new format)
        setFamilies({ families: response });
      } else {
        // If response is the old format object
        setFamilies(response);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch families');
      console.error('Error fetching families:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvitations = async () => {
    if (token) {
      try {
        setInvitationsLoading(true);
        const response = await getUserInvitations();
        // Convert the API response to match our UserInvitation interface
        const formattedInvitations = response.invitations.map((inv: any) => ({
          _id: inv._id || '',
          flockId: inv.flockId || '',
          flockName: inv.flockName || '',
          invitedBy: {
            _id: inv.invitedBy?._id || '',
            name: inv.invitedBy?.name || '',
            email: inv.invitedBy?.email || ''
          },
          role: inv.role || 'member',
          status: (inv.status as 'pending' | 'accepted' | 'declined') || 'pending',
          createdAt: inv.createdAt || new Date().toISOString(),
          expiresAt: inv.expiresAt || new Date().toISOString(),
          token: inv.token || ''
        }));
        
        setInvitations(formattedInvitations);
      } catch (err) {
        console.error('Error fetching invitations:', err);
        setInvitationsError('Failed to load invitations');
      } finally {
        setInvitationsLoading(false);
      }
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const token = invitations.find(i => i._id === invitationId)?.token || '';
      await acceptInvitation(token);
      fetchInvitations();
      fetchFamilies();
    } catch (err) {
      console.error('Error accepting invitation:', err);
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      const token = invitations.find(i => i._id === invitationId)?.token || '';
      await declineInvitation(token);
      fetchInvitations();
    } catch (err) {
      console.error('Error declining invitation:', err);
    }
  };

  const handleCreateFlock = () => {
    navigate('/flocks/create');
  };

  const handleFlockClick = (flockId: string) => {
    navigate(`/flocks/${flockId}`);
  };

  if (!user || !token) {
    navigate('/login');
    return null;
  }

  // Get user's display name
  const userName = user.firstName 
    ? `${user.firstName} ${user.lastName || ''}`
    : user.email.split('@')[0];

  if (authLoading) {
    return <LoadingScreen message="Authenticating..." />;
  }

  return (
    <div className="container mx-auto px-4 max-w-7xl py-6">
      <h1 className="text-3xl font-bold mb-4" data-testid="user-greeting">Welcome, {userName}!</h1>
      
      {invitations.length > 0 && (
        <div className="mb-6">
          <InvitationsList 
            invitations={invitations}
            onAcceptInvitation={handleAcceptInvitation}
            onDeclineInvitation={handleDeclineInvitation}
            isLoading={invitationsLoading}
          />
        </div>
      )}
      
      {authLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : !user ? (
        <div className="py-4">
          <LoadingScreen message="Checking authentication..." />
        </div>
      ) : (

      <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
        <h2 className="text-2xl font-semibold tracking-tight">Flock Management</h2>
        
        <Separator className="my-4" />

        {!tokenReady ? (
          <div className="w-full my-4">
            <p className="text-center mb-2">Initializing secure connection...</p>
            <Progress value={40} className="h-2" />
          </div>
        ) : isLoading ? (
          <div className="w-full my-4">
            <p className="text-center mb-2">Loading your flocks...</p>
            <Progress value={70} className="h-2" />
          </div>
        ) : error ? (
          <div>
            <p className="text-destructive mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={fetchFamilies}
              className="flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" /> Try Again
            </Button>
          </div>
        ) : families && families.families && families.families.length > 0 ? (
          <>
            <p className="mb-4">
              You are a member of {families.families.length} {families.families.length === 1 ? 'flock' : 'flocks'}.
            </p>
          
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {families.families.map((flock) => (
                <Card key={flock?._id || 'unknown'} className="h-full flex flex-col">
                  <CardContent>
                    <h3 className="text-lg font-semibold mb-2">
                      {flock?.name || 'Unnamed Flock'}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      Members: {flock?.members?.length || 0}
                    </p>
                    
                    {flock?.members && flock.members.some(m => {
                      // Handle both formats of member data
                      const memberId = typeof m.user === 'object' ? m.user._id : m.user;
                      return memberId === user?._id && m.role === 'admin';
                    }) && (
                      <p className="text-xs text-primary">
                        You are an admin of this flock
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="mt-auto pt-0">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleFlockClick(flock._id)}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <Button 
                variant="default" 
                onClick={handleCreateFlock}
              >
                Create New Flock
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-2">
              You're not a member of any flock yet.
            </h3>
            <p className="mb-6">
              Create a new flock to start managing tasks together.
            </p>
            <Button 
              variant="default" 
              size="lg"
              onClick={handleCreateFlock}
            >
              Create Your First Flock
            </Button>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default Dashboard;