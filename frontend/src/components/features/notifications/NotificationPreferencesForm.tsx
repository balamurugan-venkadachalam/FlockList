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
import notificationService from '../../../services/notificationService';
import { NotificationPreferences } from '../../../types/notification';

const NotificationPreferencesForm: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
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
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadPreferences();
  }, []);
  
  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotificationPreferences();
      setPreferences(response.data);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInAppChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setPreferences(prev => ({
      ...prev,
      inApp: {
        ...prev.inApp,
        [name]: checked
      }
    }));
  };
  
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setPreferences(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [name]: checked
      }
    }));
  };
  
  const handleFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences(prev => ({
      ...prev,
      frequency: event.target.value as 'immediate' | 'daily' | 'weekly'
    }));
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      setSaving(true);
      await notificationService.updateNotificationPreferences(preferences);
      setSuccess(true);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to update notification preferences');
      setSuccess(false);
    } finally {
      setSaving(false);
    }
  };
  
  const handleSnackbarClose = () => {
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
    <form onSubmit={handleSubmit}>
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
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.inApp.taskCreated}
                        onChange={handleInAppChange}
                        name="taskCreated"
                        color="primary"
                      />
                    }
                    label="New task assignments"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.inApp.deadlineApproaching}
                        onChange={handleInAppChange}
                        name="deadlineApproaching"
                        color="primary"
                      />
                    }
                    label="Approaching deadlines"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.inApp.taskCompleted}
                        onChange={handleInAppChange}
                        name="taskCompleted"
                        color="primary"
                      />
                    }
                    label="Task completions"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.inApp.memberAdded}
                        onChange={handleInAppChange}
                        name="memberAdded"
                        color="primary"
                      />
                    }
                    label="New family members"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.inApp.invitationAccepted}
                        onChange={handleInAppChange}
                        name="invitationAccepted"
                        color="primary"
                      />
                    }
                    label="Invitation acceptance"
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
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.email.taskCreated}
                        onChange={handleEmailChange}
                        name="taskCreated"
                        color="primary"
                      />
                    }
                    label="New task assignments"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.email.deadlineApproaching}
                        onChange={handleEmailChange}
                        name="deadlineApproaching"
                        color="primary"
                      />
                    }
                    label="Approaching deadlines"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.email.taskCompleted}
                        onChange={handleEmailChange}
                        name="taskCompleted"
                        color="primary"
                      />
                    }
                    label="Task completions"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.email.memberAdded}
                        onChange={handleEmailChange}
                        name="memberAdded"
                        color="primary"
                      />
                    }
                    label="New family members"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.email.invitationAccepted}
                        onChange={handleEmailChange}
                        name="invitationAccepted"
                        color="primary"
                      />
                    }
                    label="Invitation acceptance"
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
                  <RadioGroup 
                    name="frequency" 
                    value={preferences.frequency} 
                    onChange={handleFrequencyChange}
                  >
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
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : undefined}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
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