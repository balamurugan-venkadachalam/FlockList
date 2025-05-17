// Rule applied: Use TypeScript for all code; prefer interfaces over types
import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Box, 
  Typography, 
  Button, 
  Link, 
  Alert,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
// Rule applied: Use absolute imports for all files @/...
import RegisterForm from '@/components/auth/RegisterForm';

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
  const theme = useTheme();
  // Rule applied: Use declarative programming patterns
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  // Rule applied: Implementation of Material UI for styling
  // Show verification screen if verification has been sent
  if (verificationSent && registeredEmail) {
    return (
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ my: { xs: 2, sm: 3, md: 4 } }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderRadius: theme.shape.borderRadius,
              overflow: 'hidden'
            }}
          >
            <Grid 
              container 
              spacing={{ xs: 2, sm: 3, md: 4 }} 
              alignItems="center"
              direction={isMobile ? "column-reverse" : "row"}
            >
              <Grid item xs={12} md={6}>
                {/* Rule applied: Implementation of Material UI for styling */}
                <Typography 
                  variant="h3" 
                  component="h1" 
                  gutterBottom
                  sx={{
                    textAlign: { xs: 'center', md: 'left' }
                  }}
                >
                  Verification Email Sent
                </Typography>
                
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  paragraph
                  sx={{
                    textAlign: { xs: 'center', md: 'left' }
                  }}
                >
                  We've sent a verification email to <strong>{registeredEmail}</strong>
                </Typography>
                
                <Typography 
                  variant="body1" 
                  paragraph
                  sx={{
                    textAlign: { xs: 'center', md: 'left' }
                  }}
                >
                  Please check your inbox and click on the verification link to complete your registration.
                </Typography>
                
                <Box 
                  sx={{ 
                    mt: 3, 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    gap: { xs: 2, sm: 1 },
                    justifyContent: { xs: 'center', md: 'flex-start' }
                  }}
                >
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
                    sx={{ mt: 3, width: '100%', borderRadius: 1 }}
                  >
                    {error}
                  </Alert>
                )}
              </Grid>
              
              {/* Hide image on very small screens */}
              <Grid 
                item 
                xs={12} 
                md={6} 
                sx={{ 
                  display: { xs: isMobile ? 'none' : 'block', md: 'block' },
                  mb: { xs: 2, md: 0 }
                }}
              >
                <Box 
                  component="img"
                  src="/images/email-verification.svg" 
                  alt="Email verification"
                  sx={{ 
                    width: '100%', 
                    maxWidth: { xs: 250, sm: 300, md: 400 },
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

  // Rule applied: Implementation of Material UI for styling
  // Show registration form
  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ my: { xs: 2, sm: 3, md: 4 } }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: theme.shape.borderRadius,
            overflow: 'hidden'
          }}
        >
          <Grid 
            container 
            spacing={{ xs: 2, sm: 3, md: 4 }} 
            alignItems="center"
            direction={isMobile ? "column-reverse" : "row"}
          >
            <Grid item xs={12} md={6}>
              {/* Rule applied: Implementation of Material UI for styling */}
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom
                sx={{
                  textAlign: { xs: 'center', md: 'left' }
                }}
              >
                Create an Account
              </Typography>
              
              <Typography 
                variant="h6" 
                color="text.secondary" 
                paragraph
                sx={{
                  textAlign: { xs: 'center', md: 'left' },
                  mb: { xs: 2, sm: 3 }
                }}
              >
                Join Flock Task Manager to organize your tasks
              </Typography>
              
              <RegisterForm onVerificationSent={handleVerificationSent} />
              
              <Box sx={{ mt: 3, textAlign: { xs: 'center', md: 'left' } }}>
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
            
            {/* Hide image on very small screens */}
            <Grid 
              item 
              xs={12} 
              md={6} 
              sx={{ 
                display: { xs: isMobile ? 'none' : 'block', md: 'block' },
                mb: { xs: 2, md: 0 }
              }}
            >
              <Box 
                component="img"
                src="/images/register-illustration.svg" 
                alt="Register"
                sx={{ 
                  width: '100%', 
                  maxWidth: { xs: 250, sm: 300, md: 400 },
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