import React, { useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Box, 
  Typography, 
  Link,
  Grid
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';

/**
 * LoginPage component that serves as a wrapper for the LoginForm
 * Handles authentication state and redirects
 */
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
                Sign In
              </Typography>
              
              <Typography variant="h6" color="text.secondary" paragraph>
                Welcome back to Flock Task Manager
              </Typography>
              
              <LoginForm />
              
              <Box sx={{ mt: 3 }}>
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
            
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                src="/images/login-illustration.svg" 
                alt="Login"
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

export default LoginPage;