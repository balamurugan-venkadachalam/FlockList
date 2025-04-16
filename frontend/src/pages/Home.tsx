import React from 'react';
import { Typography, Box, Button, Container, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
                Family Task Manager
              </Typography>
              
              <Typography variant="h5" color="text.secondary" paragraph>
                Organize your family's tasks and activities in one place.
              </Typography>
              
              <Typography variant="body1" paragraph>
                Our application helps families manage tasks, chores, and activities efficiently.
                Stay organized and keep track of everyone's responsibilities.
              </Typography>
              
              {user ? (
                <Button 
                  variant="contained" 
                  size="large"
                  color="primary" 
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <Box sx={{ mt: 3 }}>
                  <Button 
                    variant="contained" 
                    size="large"
                    color="primary" 
                    onClick={() => navigate('/login')}
                    sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}
                  >
                    Login
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    size="large"
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </Button>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                src="/images/family-tasks.svg" 
                alt="Family organizing tasks"
                sx={{ 
                  width: '100%', 
                  maxWidth: 400,
                  height: 'auto',
                  display: 'block',
                  mx: 'auto'
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Home; 