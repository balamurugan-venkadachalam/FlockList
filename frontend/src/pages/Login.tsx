// Rule applied: Use TypeScript for all code; prefer interfaces over types
// Rule applied: Use functional and declarative programming patterns; avoid classes
// Rule applied: Use PascalCase for component files

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Box } from '@mui/material';
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

  // Rule applied: Implement proper UI and Styling
  return (
    <Container component="main" maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          py: 4, // padding top and bottom
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, sm: 4 }, // Responsive padding
            width: '100%',
            maxWidth: '450px', // Control the form width
            mx: 'auto', // Center horizontally
            borderRadius: 2,
          }}
        >
          <LoginForm />
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;