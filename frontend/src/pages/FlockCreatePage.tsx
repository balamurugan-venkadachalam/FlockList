import CreateFlockForm from '@/components/features/flock/CreateFlockForm';
import { Container, Typography, Box } from '@mui/material';

import { Helmet } from 'react-helmet-async';

// Empty props interface as the component doesn't require any props

function FlockCreatePage(): JSX.Element {
  return (
    <>
      <Helmet>
        <title>Create New Flock | TaskMaster</title>
        <meta name="description" content="Create a new flock to manage tasks and collaborate with others" />
      </Helmet>
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Create New Flock
          </Typography>
          <CreateFlockForm />
        </Box>
      </Container>
    </>  
  );
}

export default FlockCreatePage; 