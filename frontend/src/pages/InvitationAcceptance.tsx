import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Box, 
  CircularProgress, 
  Alert,
  Divider
} from '@mui/material';
import { CheckCircle, ErrorOutline, ArrowForward } from '@mui/icons-material';
import { acceptInvitation } from '../services/familyService';
import { useAuth } from '../context/AuthContext';

const InvitationAcceptance: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token, isLoading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [familyName, setFamilyName] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);

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
      const response = await acceptInvitation(token);
      setSuccess(true);
      setFamilyName(response.family.name);
      setFamilyId(response.family._id);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation. It may be invalid or expired.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToFamily = () => {
    if (familyId) {
      navigate(`/families/${familyId}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (authLoading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Authenticating...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!invitationToken) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <ErrorOutline color="error" sx={{ fontSize: 60 }} />
            <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
              Invalid Invitation
            </Typography>
          </Box>
          
          <Typography variant="body1" paragraph>
            No invitation token was provided. Please use the complete invitation link sent to your email.
          </Typography>
          
          <Button 
            variant="contained" 
            fullWidth 
            onClick={handleGoToDashboard}
            sx={{ mt: 2 }}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  if (isProcessing) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} />
            <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
              Processing Invitation
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we process your invitation...
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <ErrorOutline color="error" sx={{ fontSize: 60 }} />
            <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
              Invitation Error
            </Typography>
          </Box>
          
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          
          <Typography variant="body1" paragraph>
            There was a problem accepting the invitation. The invitation may have expired or been cancelled.
          </Typography>
          
          <Button 
            variant="contained" 
            fullWidth 
            onClick={handleGoToDashboard}
            sx={{ mt: 2 }}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <CheckCircle color="success" sx={{ fontSize: 60 }} />
            <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
              Invitation Accepted
            </Typography>
          </Box>
          
          <Typography variant="body1" paragraph>
            You have successfully joined the family <strong>{familyName}</strong>!
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Button 
            variant="contained" 
            fullWidth 
            onClick={handleGoToFamily}
            endIcon={<ArrowForward />}
            color="primary"
          >
            Go to Family Page
          </Button>
          
          <Button 
            variant="outlined" 
            fullWidth 
            onClick={handleGoToDashboard}
            sx={{ mt: 2 }}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  // Default fallback (should not reach here in normal flow)
  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    </Container>
  );
};

export default InvitationAcceptance; 