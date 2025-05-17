import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Box, 
  Typography, 
  Button, 
  Link, 
  Alert,
  Grid
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';

/**
 * Register page component
 * Uses the RegisterForm component to handle user registration
 */
const Register: React.FC = () => {
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle when verification email is sent
   */
  const handleVerificationSent = (email: string) => {
    setVerificationSent(true);
    setRegisteredEmail(email);
  };

  /**
   * Handle resending verification email
   */
  const handleResendVerification = async () => {
    if (!registeredEmail) return;

    try {
      setResendLoading(true);
      // This would typically call an API endpoint to resend the verification email
      // For now, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setError(null);
    } catch (err: any) {
      console.error('Resend verification error:', err);
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  // Show verification screen if verification has been sent
  if (verificationSent && registeredEmail) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderRadius: 2
            }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h3" component="h1" gutterBottom>
                  Verification Email Sent
                </Typography>
                
                <Typography variant="h6" color="text.secondary" paragraph>
                  We've sent a verification email to <strong>{registeredEmail}</strong>
                </Typography>
                
                <Typography variant="body1" paragraph>
                  Please check your inbox and click on the verification link to complete your registration.
                </Typography>
                
                <Box sx={{ mt: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 1 } }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    sx={{ mr: { xs: 0, sm: 2 } }}
                    size="large"
                  >
                    {resendLoading ? 'Sending...' : 'Resend Email'}
                  </Button>
                  
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    size="large"
                  >
                    Back to Login
                  </Button>
                </Box>
                
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ mt: 3, width: '100%' }}
                  >
                    {error}
                  </Alert>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box 
                  component="img"
                  src="/images/email-verification.svg" 
                  alt="Email verification"
                  sx={{ 
                    width: '100%', 
                    maxWidth: 400,
                    height: 'auto',
                    display: 'block',
                    mx: 'auto'
                  }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Container>
    );
  }

  // Show registration form
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: 2
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h1" gutterBottom>
                Create an Account
              </Typography>
              
              <Typography variant="h6" color="text.secondary" paragraph>
                Join Flock Task Manager to organize your tasks
              </Typography>
              
              <RegisterForm onVerificationSent={handleVerificationSent} />
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body1">
                  Already have an account?{' '}
                  <Link 
                    component={RouterLink} 
                    to="/login" 
                    sx={{ fontWeight: 500 }}
                  >
                    Sign in here
                  </Link>
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                src="/images/register-illustration.svg" 
                alt="Register"
                sx={{ 
                  width: '100%', 
                  maxWidth: 400,
                  height: 'auto',
                  display: 'block',
                  mx: 'auto'
                }}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 