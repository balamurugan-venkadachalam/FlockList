import React, { useState } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Typography, 
  IconButton, 
  Tooltip, 
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Paper,
  Divider
} from '@mui/material';
import { 
  Person, 
  AdminPanelSettings, 
  Delete as DeleteIcon, 
  Group,
  Mail,
  CalendarMonth 
} from '@mui/icons-material';
import { FlockMember } from '../../../types/flock';
import { format, parseISO } from 'date-fns';

interface FlockMembersListProps {
  members: FlockMember[];
  currentUserId: string;
  isAdmin: boolean;
  onRemoveMember?: (memberId: string) => void;
}

const FlockMembersList: React.FC<FlockMembersListProps> = ({ 
  members, 
  currentUserId, 
  isAdmin, 
  onRemoveMember 
}) => {
  const [memberToRemove, setMemberToRemove] = useState<FlockMember | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Helper function to extract user information safely
  const getUserInfo = (member: FlockMember) => {
    // If user is an object, extract information
    if (typeof member.user === 'object' && member.user !== null) {
      return {
        id: member.user._id,
        email: member.user.email,
        name: member.user.firstName && member.user.lastName 
          ? `${member.user.firstName} ${member.user.lastName}`
          : member.user.firstName || member.user.email
      };
    }
    
    // If user is just a string ID
    return {
      id: member.user as string,
      email: '', // We don't have email info in this case
      name: '' // We don't have name info in this case
    };
  };

  const handleOpenConfirmDialog = (member: FlockMember) => {
    setMemberToRemove(member);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  const handleConfirmRemove = () => {
    if (memberToRemove && onRemoveMember) {
      // Get the correct user ID
      const userInfo = getUserInfo(memberToRemove);
      onRemoveMember(userInfo.id);
    }
    setConfirmDialogOpen(false);
    setMemberToRemove(null);
  };

  if (!members || members.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body1" color="text.secondary">
          No flock members found.
        </Typography>
      </Box>
    );
  }

  // Sort members with admins first
  const sortedMembers = [...members].sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (a.role !== 'admin' && b.role === 'admin') return 1;
    return 0;
  });

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Group color="primary" sx={{ mr: 1 }} />
        <Typography variant="subtitle1">
          Total members: {members.length}
        </Typography>
      </Box>
      
      <Paper elevation={1}>
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {sortedMembers.map((member, index) => {
            const userInfo = getUserInfo(member);
            
            return (
              <React.Fragment key={userInfo.id}>
                {index > 0 && <Divider key={`divider-${userInfo.id}`} component="li" variant="inset" />}
                <ListItem
                  key={`item-${userInfo.id}`}
                  alignItems="flex-start"
                  secondaryAction={
                    isAdmin && userInfo.id !== currentUserId ? (
                      <Tooltip title="Remove member">
                        <IconButton 
                          edge="end" 
                          aria-label="remove" 
                          onClick={() => handleOpenConfirmDialog(member)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    ) : null
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: member.role === 'admin' ? 'primary.main' : 'secondary.main' }}>
                      {member.role === 'admin' ? <AdminPanelSettings /> : <Person />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="body1" component="span" fontWeight="medium">
                          {userInfo.name || userInfo.email || 'Unknown Member'}
                          {userInfo.id === currentUserId && ' (You)'}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={member.role} 
                          color={member.role === 'admin' ? 'primary' : 'default'}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        {userInfo.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Mail fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary" component="span">
                              {userInfo.email}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            );
          })}
        </List>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="remove-member-dialog-title"
        aria-describedby="remove-member-dialog-description"
      >
        <DialogTitle id="remove-member-dialog-title">
          Remove Flock Member
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="remove-member-dialog-description">
            {memberToRemove && (
              <>
                Are you sure you want to remove {getUserInfo(memberToRemove).name || getUserInfo(memberToRemove).email || 'this member'} from this flock?
                This action cannot be undone.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmRemove} color="error" autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FlockMembersList; 