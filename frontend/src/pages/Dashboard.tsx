import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Divider,
  LinearProgress,
  CircularProgress 
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate, useLocation } from 'react-router-dom';
import { getFamilies } from '../services/flockService';
import { Flock } from '@/types/flock';
import LoadingScreen from '../components/common/LoadingScreen';
import InvitationsList from '../components/features/flock/InvitationsList';
import { getUserInvitations, acceptInvitation, declineInvitation } from '../services/flockService';

interface UserInvitation {
  _id: string;
  flockId: string;
  flockName: string;
  invitedBy: {
    name: string;
    email: string;
  };
  role: 'admin' | 'member';
  token: string;
  createdAt: string;
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
  const { user, token, isLoading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
    if (tokenReady) {
      fetchFamilies();
      fetchUserInvitations();
    }
  }, [tokenReady]);

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

  const fetchUserInvitations = async () => {
    try {
      setInvitationsLoading(true);
      setInvitationsError(null);
      const response = await getUserInvitations();
      setInvitations(response.invitations);
    } catch (err: any) {
      setInvitationsError(err.message || 'Failed to fetch invitations');
      console.error('Error fetching invitations:', err);
    } finally {
      setInvitationsLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const invitation = invitations.find(inv => inv._id === invitationId);
      if (!invitation) {
        throw new Error('Invitation not found');
      }
      
      await acceptInvitation(invitation.token);
      
      fetchUserInvitations();
      fetchFamilies();
    } catch (err: any) {
      setInvitationsError(err.message || 'Failed to accept invitation');
      console.error('Error accepting invitation:', err);
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      const invitation = invitations.find(inv => inv._id === invitationId);
      if (!invitation) {
        throw new Error('Invitation not found');
      }
      
      await declineInvitation(invitation.token);
      
      fetchUserInvitations();
    } catch (err: any) {
      setInvitationsError(err.message || 'Failed to decline invitation');
      console.error('Error declining invitation:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom data-testid="user-greeting">
        Welcome, {userName}!
      </Typography>
      
      {invitations.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <InvitationsList 
            invitations={invitations}
            onAcceptInvitation={handleAcceptInvitation}
            onDeclineInvitation={handleDeclineInvitation}
            isLoading={invitationsLoading}
          />
        </Box>
      )}

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Flock Management
        </Typography>
        
        <Divider sx={{ mb: 2 }} />

        {!tokenReady ? (
          <Box sx={{ width: '100%', my: 4 }}>
            <Typography align="center" variant="body1" sx={{ mb: 2 }}>
              Initializing secure connection...
            </Typography>
            <LinearProgress color="secondary" sx={{ height: 6, borderRadius: 3 }} />
          </Box>
        ) : isLoading ? (
          <Box sx={{ width: '100%', my: 4 }}>
            <Typography align="center" variant="body1" sx={{ mb: 2 }}>
              Loading your flocks...
            </Typography>
            <LinearProgress color="primary" sx={{ height: 6, borderRadius: 3 }} />
          </Box>
        ) : error ? (
          <Box>
            <Typography color="error" paragraph>
              {error}
            </Typography>
            <Button 
              startIcon={<RefreshIcon />} 
              variant="outlined" 
              onClick={fetchFamilies}
            >
              Try Again
            </Button>
          </Box>
        ) : families && families.families && families.families.length > 0 ? (
          <>
            <Typography variant="body1" paragraph>
              You are a member of {families.families.length} {families.families.length === 1 ? 'flock' : 'flocks'}.
            </Typography>
          
            <Grid container spacing={3}>
              {families.families.map((flock) => (
                <Grid item xs={12} sm={6} md={4} key={flock?._id || 'unknown'}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent>
                      <Typography variant="h6" component="div" gutterBottom>
                        {flock?.name || 'Unnamed Flock'}
                      </Typography>
                      <Typography color="text.secondary" gutterBottom>
                        Members: {flock?.members?.length || 0}
                      </Typography>
                      
                      {flock?.members && flock.members.some(m => {
                        // Handle both formats of member data
                        const memberId = typeof m.user === 'object' ? m.user._id : m.user;
                        return memberId === user?._id && m.role === 'admin';
                      }) && (
                        <Typography variant="caption" color="primary">
                          You are an admin of this flock
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions sx={{ mt: 'auto' }}>
                      <Button 
                        size="small" 
                        color="primary"
                        onClick={() => handleFlockClick(flock._id)}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleCreateFlock}
              >
                Create New Flock
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" paragraph>
              You're not a member of any flock yet.
            </Typography>
            <Typography paragraph>
              Create a new flock to start managing tasks together.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleCreateFlock}
              size="large"
            >
              Create Your First Flock
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard; 