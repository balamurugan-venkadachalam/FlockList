import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Divider, 
  Button, 
  Card, 
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Group, 
  Person, 
  TaskAlt, 
  Notifications, 
  Event, 
  Add, 
  ArrowForward,
  Mail,
  CalendarMonth,
  AccessTime
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { Family } from '../../../types/family';
import { Link } from 'react-router-dom';

interface FamilyDashboardProps {
  family: Family;
  currentUserId: string;
}

const FamilyDashboard: React.FC<FamilyDashboardProps> = ({ family, currentUserId }) => {
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  const adminCount = family.members.filter(member => member.role === 'admin').length;
  const memberCount = family.members.filter(member => member.role === 'member').length;
  const pendingInvitationsCount = family.pendingInvitations.length;
  
  const isAdmin = family.members.some(
    member => member.userId === currentUserId && member.role === 'admin'
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Family Dashboard
          </Typography>
          <Chip 
            icon={<CalendarMonth fontSize="small" />} 
            label={`Created on ${formatDate(family.createdAt)}`} 
            variant="outlined" 
            color="primary"
          />
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* Family Statistics Cards */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Group color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Members</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total: <strong>{family.members.length}</strong>
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      size="small"
                      label={`${adminCount} Admin${adminCount !== 1 ? 's' : ''}`}
                      color="primary"
                    />
                    <Chip
                      size="small"
                      label={`${memberCount} Member${memberCount !== 1 ? 's' : ''}`}
                      color="secondary"
                    />
                  </Stack>
                </Box>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  component={Link} 
                  to={`/families/${family._id}`}
                  state={{ activeTab: 1 }}
                  endIcon={<ArrowForward />}
                >
                  View Members
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TaskAlt color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Tasks</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Family tasks coming soon
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  component={Link} 
                  to={`/families/${family._id}/tasks`} 
                  endIcon={<ArrowForward />}
                  disabled
                >
                  View Tasks
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Event color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Calendar</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Family calendar coming soon
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  component={Link} 
                  to={`/families/${family._id}/calendar`} 
                  endIcon={<ArrowForward />}
                  disabled
                >
                  View Calendar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Pending Invitations Section (Only for admins) */}
      {isAdmin && pendingInvitationsCount > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Pending Invitations
            </Typography>
            <Chip 
              label={`${pendingInvitationsCount} Pending`} 
              color="warning" 
              size="small" 
            />
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <List dense>
            {family.pendingInvitations.slice(0, 3).map((invitation) => (
              <ListItem key={invitation.email}>
                <ListItemIcon>
                  <Mail color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={invitation.email}
                  secondary={`Invited as ${invitation.role}`}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTime fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {format(parseISO(invitation.invitedAt), 'MMM d, yyyy')}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
          
          {pendingInvitationsCount > 3 && (
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Button 
                size="small" 
                component={Link} 
                to={`/families/${family._id}`} 
                endIcon={<ArrowForward />}
              >
                View All Invitations
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Quick Actions Section */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          {isAdmin && (
            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2, pb: '16px !important' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <IconButton color="primary" component={Link} to={`/families/${family._id}`}>
                      <Person />
                    </IconButton>
                    <Typography variant="body2" align="center">
                      Invite Member
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
          
          <Grid item xs={6} sm={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2, pb: '16px !important' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="Coming soon">
                    <Box>
                      <IconButton color="primary" disabled>
                        <Add />
                      </IconButton>
                    </Box>
                  </Tooltip>
                  <Typography variant="body2" align="center">
                    Create Task
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2, pb: '16px !important' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="Coming soon">
                    <Box>
                      <IconButton color="primary" disabled>
                        <Event />
                      </IconButton>
                    </Box>
                  </Tooltip>
                  <Typography variant="body2" align="center">
                    Add Event
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2, pb: '16px !important' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="Coming soon">
                    <Box>
                      <IconButton color="primary" disabled>
                        <Notifications />
                      </IconButton>
                    </Box>
                  </Tooltip>
                  <Typography variant="body2" align="center">
                    Notifications
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default FamilyDashboard; 