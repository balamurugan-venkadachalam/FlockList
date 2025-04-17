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
import { createFamily } from '../../../services/familyService';

const CreateFamilyForm: React.FC = () => {
  const [familyName, setFamilyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!familyName.trim()) {
      setError('Family name is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await createFamily({ name: familyName });
      
      // Navigate to the family detail page with the newly created family ID
      navigate(`/families/${response.family._id}`, { 
        state: { message: 'Family created successfully!' }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create family. Please try again.');
      console.error('Family creation error:', err);
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
          Create a New Family
        </Typography>

        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
          Create a family group to manage tasks together with your family members.
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
                label="Family Name"
                name="familyName"
                fullWidth
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                required
                placeholder="Enter a name for your family"
                helperText="This will be visible to all family members"
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
            {isLoading ? <CircularProgress size={24} /> : 'Create Family'}
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

export default CreateFamilyForm; 