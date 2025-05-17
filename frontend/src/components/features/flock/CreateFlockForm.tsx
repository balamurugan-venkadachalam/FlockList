import { useState } from 'react';
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
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFlock } from '@/services/flockService';

// Define the form schema using zod
const flockFormSchema = z.object({
  name: z.string()
    .min(1, { message: 'Flock name is required' })
    .max(100, { message: 'Flock name cannot exceed 100 characters' }),
  description: z.string().max(500, { message: 'Description cannot exceed 500 characters' }).optional()
});

// Infer the form data type from the schema
type FlockFormData = z.infer<typeof flockFormSchema>;

function CreateFlockForm(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Initialize react-hook-form
  const { 
    control, 
    handleSubmit: formSubmit, 
    formState: { errors },
    setError: setFormError
  } = useForm<FlockFormData>({
    resolver: zodResolver(flockFormSchema),
    defaultValues: {
      name: '',
      description: ''
    },
    mode: 'onBlur' // Validate on blur for better user experience
  });

  const onSubmit = async (data: FlockFormData): Promise<void> => {
    // Clear any previous errors
    setError(null);

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await createFlock(data.name, data.description);
      
      // Get the flock ID from the response
      const flockData = response.flock;
      const flockId = flockData?._id;
      
      if (!flockId) {
        throw new Error('Invalid response from server: Missing flock ID');
      }
      
      // Navigate to the flock detail page with the newly created flock ID
      navigate(`/flocks/${flockId}`, { 
        state: { message: 'Flock created successfully!' }
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create flock. Please try again.';
      setError(errorMessage);
      
      // If the error is about duplicate flock name, set the field error too
      if (errorMessage.includes('already exists')) {
        setFormError('name', { 
          type: 'manual',
          message: 'A flock with this name already exists'
        });
      }
      
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


        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
          Create a flock group to manage tasks together with your flock members.
        </Typography>

        {error && (
          <Alert severity="error" onClose={handleClearError}>
            {error}
          </Alert>
        )}

        <form onSubmit={formSubmit(onSubmit, (errors) => {
          // This callback runs when form validation fails
          console.error('Form validation errors:', errors);
          // No need to set error state as react-hook-form will handle displaying field errors
        })} data-testid="create-flock-form">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Flock name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Flock Name"
                    fullWidth
                    required
                    placeholder="Enter a name for your flock"
                    helperText={errors.name?.message || "This will be visible to all flock members"}
                    error={!!errors.name}
                    disabled={isLoading}
                    inputProps={{ maxLength: 100 }}
                    data-testid="flock-name-input"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    placeholder="Enter a description for your flock (optional)"
                    helperText={errors.description?.message}
                    error={!!errors.description}
                    multiline
                    rows={3}
                    disabled={isLoading}
                    inputProps={{ maxLength: 500 }}
                    data-testid="flock-description-input"
                  />
                )}
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
            data-testid="submit-flock-button"
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