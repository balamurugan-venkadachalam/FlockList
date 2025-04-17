import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import CreateFamilyForm from '../components/features/family/CreateFamilyForm';

const FamilyCreatePage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Family Management
        </Typography>
        <CreateFamilyForm />
      </Box>
    </Container>
  );
};

export default FamilyCreatePage; 