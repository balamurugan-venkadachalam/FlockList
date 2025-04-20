import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Alert, 
  CircularProgress, 
  Grid 
} from '@mui/material';
import { createFlock } from '../../../services/flockService';

const CreateFlockForm: React.FC = () => {
  const [flockName, setFlockName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!flockName.trim()) {
      setError('Flock name is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await createFlock(flockName);
      
      // Get the flock ID from the response
      // Support both flock and family keys in the response
      const flockData = response.flock || response.family;
      const flockId = flockData?._id;
      
      if (!flockId) {
        throw new Error('Invalid response from server: Missing flock ID');
      }
      
      // Navigate to the flock detail page with the newly created flock ID
      navigate(`/flocks/${flockId}`, { 
        state: { message: 'Flock created successfully!' }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create flock. Please try again.');
      console.error('Flock creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearError = () => {
    setError(null);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 600,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Create a New Flock
        </Typography>

        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
          Create a flock group to manage tasks together with your flock members.
        </Typography>

        {error && (
          <Alert severity="error" onClose={handleClearError}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Flock Name"
                name="flockName"
                fullWidth
                value={flockName}
                onChange={(e) => setFlockName(e.target.value)}
                required
                placeholder="Enter a name for your flock"
                helperText="This will be visible to all flock members"
                disabled={isLoading}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>
          </Grid>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Create Flock'}
          </Button>
          
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            size="large"
            sx={{ mt: 2 }}
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateFlockForm; 