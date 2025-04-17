import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Chip,
  Box,
  Tooltip,
  Paper
} from '@mui/material';
import { Delete, AccessTime } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

interface PendingInvitation {
  email: string;
  role: 'admin' | 'member';
  invitedBy: string;
  invitedAt: string;
}

interface PendingInvitationsListProps {
  invitations: PendingInvitation[];
  onCancelInvitation?: (email: string) => void;
}

const PendingInvitationsList: React.FC<PendingInvitationsListProps> = ({
  invitations,
  onCancelInvitation
}) => {
  if (!invitations || invitations.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body1" color="text.secondary">
          No pending invitations.
        </Typography>
      </Box>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Paper>
      <List sx={{ width: '100%' }}>
        {invitations.map((invitation) => (
          <ListItem key={invitation.email}>
            <ListItemText
              disableTypography
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1">
                    {invitation.email}
                  </Typography>
                  <Chip
                    size="small"
                    label={invitation.role}
                    color={invitation.role === 'admin' ? 'primary' : 'default'}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <AccessTime fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Invited on {formatDate(invitation.invitedAt)}
                  </Typography>
                </Box>
              }
            />
            {onCancelInvitation && (
              <ListItemSecondaryAction>
                <Tooltip title="Cancel invitation">
                  <IconButton
                    edge="end"
                    aria-label="cancel invitation"
                    onClick={() => onCancelInvitation(invitation.email)}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            )}
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default PendingInvitationsList; 