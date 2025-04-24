import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
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
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <Typography component="h1" variant="h5" gutterBottom>
            Email Verification
          </Typography>
          
          {loading && (
            <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CircularProgress size={60} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Verifying your email...
              </Typography>
            </Box>
          )}
          
          {error && !loading && (
            <>
              <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                {error}
              </Alert>
              <Box sx={{ mt: 3 }}>
                <Typography variant="body1" paragraph>
                  The verification link may have expired.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  color="primary"
                >
                  Go to Login
                </Button>
              </Box>
            </>
          )}
          
          {verified && !loading && (
            <>
              <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
                Your email has been successfully verified!
              </Alert>
              <Typography variant="body1" sx={{ mt: 3 }}>
                You will be redirected to the dashboard in a few seconds...
              </Typography>
              <Link component={RouterLink} to="/dashboard" sx={{ mt: 2 }}>
                Click here if you are not redirected automatically
              </Link>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default VerifyEmailPage; 