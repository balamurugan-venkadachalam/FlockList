import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { CheckCircle, Cancel, Group } from '@mui/icons-material';
import { format } from 'date-fns';
import { acceptInvitation } from '../../../services/familyService';

interface Invitation {
  _id: string;
  familyId: string;
  familyName: string;
  invitedBy: {
    name: string;
    email: string;
  };
  role: 'admin' | 'member';
  token: string;
  createdAt: string;
}

interface InvitationsListProps {
  invitations: Invitation[];
  onAcceptInvitation: (invitationId: string) => void;
  onDeclineInvitation: (invitationId: string) => void;
  isLoading?: boolean;
}

const InvitationsList: React.FC<InvitationsListProps> = ({
  invitations,
  onAcceptInvitation,
  onDeclineInvitation,
  isLoading = false
}) => {
  const [processingInvitationId, setProcessingInvitationId] = useState<string | null>(null);

  const handleAccept = (invitationId: string) => {
    setProcessingInvitationId(invitationId);
    onAcceptInvitation(invitationId);
    setProcessingInvitationId(null);
  };

  const handleDecline = (invitationId: string) => {
    setProcessingInvitationId(invitationId);
    onDeclineInvitation(invitationId);
    setProcessingInvitationId(null);
  };

  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={40} />
        </Box>
      </Paper>
    );
  }

  if (!invitations || invitations.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Group sx={{ mr: 1 }} />
          <Typography variant="h6">Family Invitations</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info">
          You don't have any pending family invitations.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Group sx={{ mr: 1 }} />
        <Typography variant="h6">Family Invitations</Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      
      <Typography variant="body2" sx={{ mb: 2 }}>
        You have {invitations.length} pending invitation{invitations.length !== 1 ? 's' : ''}.
      </Typography>
      
      <List>
        {invitations.map((invitation) => (
          <ListItem
            key={invitation._id}
            alignItems="flex-start"
            sx={{
              mb: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 2
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle1" component="span">
                    {invitation.familyName}
                  </Typography>
                  <Chip
                    label={invitation.role}
                    color={invitation.role === 'admin' ? 'primary' : 'default'}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>
              }
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Invited by {invitation.invitedBy.name || invitation.invitedBy.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Sent on {format(new Date(invitation.createdAt), 'MMM d, yyyy')}
                  </Typography>
                </>
              }
              sx={{ mb: { xs: 2, sm: 0 } }}
            />
            
            <Box sx={{ display: 'flex', gap: 1, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckCircle />}
                onClick={() => handleAccept(invitation._id)}
                disabled={!!processingInvitationId}
                size="small"
              >
                {processingInvitationId === invitation._id ? <CircularProgress size={24} /> : 'Accept'}
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={() => handleDecline(invitation._id)}
                disabled={!!processingInvitationId}
                size="small"
              >
                Decline
              </Button>
            </Box>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default InvitationsList; 