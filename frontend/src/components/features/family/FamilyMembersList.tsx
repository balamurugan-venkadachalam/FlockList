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
import { FamilyMember } from '../../../types/family';
import { format, parseISO } from 'date-fns';

interface FamilyMembersListProps {
  members: FamilyMember[];
  currentUserId: string;
  isAdmin: boolean;
  onRemoveMember?: (memberId: string) => void;
}

const FamilyMembersList: React.FC<FamilyMembersListProps> = ({ 
  members, 
  currentUserId, 
  isAdmin, 
  onRemoveMember 
}) => {
  const [memberToRemove, setMemberToRemove] = useState<FamilyMember | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleOpenConfirmDialog = (member: FamilyMember) => {
    setMemberToRemove(member);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  const handleConfirmRemove = () => {
    if (memberToRemove && onRemoveMember) {
      onRemoveMember(memberToRemove.userId);
    }
    setConfirmDialogOpen(false);
    setMemberToRemove(null);
  };

  if (!members || members.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body1" color="text.secondary">
          No family members found.
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
          {sortedMembers.map((member, index) => (
            <React.Fragment key={member.userId}>
              {index > 0 && <Divider component="li" variant="inset" />}
              <ListItem
                alignItems="flex-start"
                secondaryAction={
                  isAdmin && member.userId !== currentUserId ? (
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
                        {member.name || member.email}
                        {member.userId === currentUserId && ' (You)'}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Mail fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" component="span">
                          {member.email}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
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
          Remove Family Member
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="remove-member-dialog-description">
            Are you sure you want to remove {memberToRemove?.name || memberToRemove?.email} from this family?
            This action cannot be undone.
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

export default FamilyMembersList; 