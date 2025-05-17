import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  Switch,
  Typography,
  Button,
  FormGroup,
  Alert,
  Snackbar,
  CircularProgress,
  FormLabel,
  RadioGroup,
  Radio
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
// Rule applied: Use React Form for form handling
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
// Rule applied: Use absolute imports for all files @/...
import notificationService from '@/services/notificationService';

// Define the form schema using zod
const notificationPreferencesSchema = z.object({
  inApp: z.object({
    taskCreated: z.boolean(),
    deadlineApproaching: z.boolean(),
    taskCompleted: z.boolean(),
    memberAdded: z.boolean(),
    invitationAccepted: z.boolean()
  }),
  email: z.object({
    taskCreated: z.boolean(),
    deadlineApproaching: z.boolean(),
    taskCompleted: z.boolean(),
    memberAdded: z.boolean(),
    invitationAccepted: z.boolean()
  }),
  frequency: z.enum(['immediate', 'daily', 'weekly'])
});

// Infer the form data type from the schema
type NotificationPreferencesFormData = z.infer<typeof notificationPreferencesSchema>;

const NotificationPreferencesForm: React.FC = () => {
  // Rule applied: Use React Form for form handling
  const { 
    control, 
    handleSubmit, 
    reset,
    formState: { isSubmitting } 
  } = useForm<NotificationPreferencesFormData>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: {
      inApp: {
        taskCreated: true,
        deadlineApproaching: true,
        taskCompleted: true,
        memberAdded: true,
        invitationAccepted: true
      },
      email: {
        taskCreated: true,
        deadlineApproaching: true,
        taskCompleted: true,
        memberAdded: false,
        invitationAccepted: false
      },
      frequency: 'immediate'
    },
    mode: 'onSubmit'
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadPreferences();
  }, []);
  
  // Rule applied: Use TypeScript for all code; prefer interfaces over types
  const loadPreferences = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await notificationService.getNotificationPreferences();
      // Use react-hook-form's reset to update all form values
      reset(response.data);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };
  
  // Using react-hook-form's handleSubmit to process form data
  // Rule applied: Use explicit return types for all functions
  const onSubmit = async (data: NotificationPreferencesFormData): Promise<void> => {
    try {
      // Update preferences using the form data
      await notificationService.updateNotificationPreferences(data);
      setSuccess(true);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to update notification preferences');
      setSuccess(false);
    }
  };
  
  // Handle snackbar close
  const handleSnackbarClose = (): void => {
    setSuccess(false);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader 
          title="Notification Preferences" 
          subheader="Manage how and when you receive notifications"
        />
        <Divider />
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            {/* In-app notifications */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <NotificationsIcon sx={{ mr: 1 }} />
                  In-App Notifications
                </Typography>
                <FormGroup>
                  {/* Rule applied: Use Controller for form fields */}
                  <Controller
                    name="inApp.taskCreated"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="New task assignments"
                      />
                    )}
                  />
                  <Controller
                    name="inApp.deadlineApproaching"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Approaching deadlines"
                      />
                    )}
                  />
                  <Controller
                    name="inApp.taskCompleted"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Task completions"
                      />
                    )}
                  />
                  <Controller
                    name="inApp.memberAdded"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="New family members"
                      />
                    )}
                  />
                  <Controller
                    name="inApp.invitationAccepted"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Invitation acceptance"
                      />
                    )}
                  />
                </FormGroup>
              </Box>
            </Grid>
            
            {/* Email notifications */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ mr: 1 }} />
                  Email Notifications
                </Typography>
                <FormGroup>
                  <Controller
                    name="email.taskCreated"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="New task assignments"
                      />
                    )}
                  />
                  <Controller
                    name="email.deadlineApproaching"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Approaching deadlines"
                      />
                    )}
                  />
                  <Controller
                    name="email.taskCompleted"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Task completions"
                      />
                    )}
                  />
                  <Controller
                    name="email.memberAdded"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="New family members"
                      />
                    )}
                  />
                  <Controller
                    name="email.invitationAccepted"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Invitation acceptance"
                      />
                    )}
                  />
                </FormGroup>
              </Box>
            </Grid>
            
            {/* Notification frequency */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <ScheduleIcon sx={{ mr: 1 }} />
                  Notification Frequency
                </Typography>
                <FormControl component="fieldset">
                  <Controller
                    name="frequency"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field}>
                        <FormControlLabel 
                          value="immediate" 
                          control={<Radio />} 
                          label="Immediate (receive notifications as they happen)" 
                        />
                        <FormControlLabel 
                          value="daily" 
                          control={<Radio />} 
                          label="Daily digest (receive a summary once a day)" 
                        />
                        <FormControlLabel 
                          value="weekly" 
                          control={<Radio />} 
                          label="Weekly digest (receive a summary once a week)" 
                        />
                      </RadioGroup>
                    )}
                  />
                </FormControl>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
          >
            {isSubmitting ? 'Saving...' : 'Save Preferences'}
          </Button>
        </Box>
      </Card>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          Notification preferences updated successfully
        </Alert>
      </Snackbar>
    </form>
  );
};

export default NotificationPreferencesForm; 