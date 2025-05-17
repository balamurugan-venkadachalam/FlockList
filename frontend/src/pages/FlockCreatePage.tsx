import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import CreateFlockForm from '../components/features/flocks/CreateFamilyForm';

const FlockCreatePage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Flock Management
        </Typography>
        <CreateFlockForm />
      </Box>
    </Container>
  );
};

export default FlockCreatePage; 