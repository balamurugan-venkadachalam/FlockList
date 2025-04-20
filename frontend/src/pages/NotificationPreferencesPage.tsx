import React from 'react';
import { Container, Typography, Box, Paper, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import NotificationPreferencesForm from '../components/features/notifications/NotificationPreferencesForm';
import { Notifications as NotificationsIcon } from '@mui/icons-material';

const NotificationPreferencesPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <MuiLink component={Link} to="/dashboard" color="inherit">
              Dashboard
            </MuiLink>
            <MuiLink component={Link} to="/settings" color="inherit">
              Settings
            </MuiLink>
            <Typography color="text.primary">Notifications</Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <NotificationsIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography variant="h4" component="h1">
              Notification Preferences
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      <NotificationPreferencesForm />
    </Container>
  );
};

export default NotificationPreferencesPage; 