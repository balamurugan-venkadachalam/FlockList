import React from 'react';
import { Typography, Box, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" color="error" gutterBottom>
            Access Denied
          </Typography>
          
          <Typography variant="body1" paragraph>
            You do not have permission to access this page.
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            Go to Dashboard
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Unauthorized; 