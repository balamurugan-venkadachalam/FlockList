import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Typography, Box, Paper, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to Your Dashboard
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Hello, {user?.firstName} {user?.lastName}!
          </Typography>
          
          <Typography variant="body1" paragraph>
            You are logged in as: {user?.email}
          </Typography>
          
          <Typography variant="body1" paragraph>
            Your role: {user?.role}
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleLogout}
            sx={{ mt: 2 }}
          >
            Logout
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard; 