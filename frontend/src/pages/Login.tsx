// Rule applied: Use TypeScript for all code; prefer interfaces over types
import React, { useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Box, 
  Typography, 
  Link,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
// Rule applied: Use absolute imports for all files @/...
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';

/**
 * LoginPage component that serves as a wrapper for the LoginForm
 * Handles authentication state and redirects
 */
// Rule applied: Use functional components with TypeScript interfaces
const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  // Rule applied: Use declarative programming patterns
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('User is already authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Rule applied: Implementation of Material UI for styling
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
                Sign In
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
                Welcome back to Flock Task Manager
              </Typography>
              
              <LoginForm />
              
              <Box sx={{ mt: 3, textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="body1">
                  Don't have an account?{' '}
                  <Link 
                    component={RouterLink} 
                    to="/register" 
                    sx={{ fontWeight: 500 }}
                  >
                    Register here
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
                src="/images/login-illustration.svg" 
                alt="Login"
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

export default LoginPage;