import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Typography, 
  Alert,
  Paper,
  Divider,
  Grid,
  Tabs,
  Tab,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  Person, 
  PersonAdd, 
  Delete, 
  Edit, 
  AdminPanelSettings, 
  SupervisedUserCircle
} from '@mui/icons-material';
import { InviteMemberFormData, Flock, FlockMember } from '../../../types/flock';

interface MemberManagementProps {
  flock: Flock;
  currentUserId: string;
  onInviteMember: (flockId: string, data: InviteMemberFormData) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  onCancelInvitation: (email: string) => Promise<void>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`member-tabpanel-${index}`}
      aria-labelledby={`member-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface MemberToRemove {
  userId: string;
  name: string;
  email: string;
  role: string;
}

const MemberManagement: React.FC<MemberManagementProps> = ({ 
  flock, 
  currentUserId,
  onInviteMember, 
  onRemoveMember,
  onCancelInvitation 
}) => {
  const [formData, setFormData] = useState<InviteMemberFormData>({
    email: '',
    role: 'member'
  });
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<MemberToRemove | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [invitationToCancel, setInvitationToCancel] = useState<string | null>(null);
  const [cancelInviteDialogOpen, setCancelInviteDialogOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await onInviteMember(flock._id, formData);
      setSuccess(`Invitation sent to ${formData.email}`);
      setFormData({
        email: '',
        role: 'member'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClick = (member: FlockMember) => {
    // Determine the memberId and user details for display
    const userId = typeof member.user === 'object' ? member.user._id : member.user;
    const userEmail = typeof member.user === 'object' ? member.user.email : '';
    const userName = typeof member.user === 'object' 
      ? `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim() 
      : '';
    
    setMemberToRemove({
      userId,
      name: userName,
      email: userEmail,
      role: member.role
    });
    setConfirmDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    
    setLoading(true);
    try {
      await onRemoveMember(memberToRemove.userId);
      setSuccess(`${memberToRemove.name || memberToRemove.email} has been removed from the flock`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setLoading(false);
      setConfirmDialogOpen(false);
      setMemberToRemove(null);
    }
  };

  const handleCancelInviteClick = (email: string) => {
    setInvitationToCancel(email);
    setCancelInviteDialogOpen(true);
  };

  const handleConfirmCancelInvite = async () => {
    if (!invitationToCancel) return;
    
    setLoading(true);
    try {
      await onCancelInvitation(invitationToCancel);
      setSuccess(`Invitation to ${invitationToCancel} has been cancelled`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel invitation');
    } finally {
      setLoading(false);
      setCancelInviteDialogOpen(false);
      setInvitationToCancel(null);
    }
  };

  // Generate initials for avatar
  const getInitials = (name: string | undefined, email: string) => {
    if (name && name.length > 0) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    return email.substring(0, 2).toUpperCase();
  };

  // Get avatar background color based on user ID for consistency
  const getAvatarColor = (id: string | undefined) => {
    const colors = [
      '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', '#c2185b',
      '#0288d1', '#00796b', '#303f9f', '#5d4037', '#689f38'
    ];
    
    // Return a default color if id is undefined or null
    if (!id) {
      return colors[0]; // Return first color as default
    }
    
    const hash = id.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="member management tabs">
          <Tab icon={<Person />} label="Current Members" id="member-tab-0" />
          <Tab icon={<PersonAdd />} label="Invite New" id="member-tab-1" />
          {flock.pendingInvitations.length > 0 && (
            <Tab 
              icon={<SupervisedUserCircle />} 
              label={`Pending (${flock.pendingInvitations.length})`} 
              id="member-tab-2" 
            />
          )}
        </Tabs>
      </Box>
      
      <TabPanel value={activeTab} index={0}>
        <Typography variant="h6" gutterBottom>
          Flock Members
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <List>
          {flock.members.map((member) => {
            // Check if user is an object or string ID
            const userId = typeof member.user === 'object' ? member.user._id : member.user;
            const userEmail = typeof member.user === 'object' ? member.user.email : '';
            const userName = typeof member.user === 'object' ? 
              `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim() : '';
            
            const isCurrentUser = userId === currentUserId;
            const isAdmin = member.role === 'admin';
            
            return (
              <ListItem 
                key={userId}
                sx={{ 
                  mb: 1, 
                  backgroundColor: isCurrentUser ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                  borderRadius: 1
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    sx={{ 
                      bgcolor: getAvatarColor(userId),
                      width: 40,
                      height: 40
                    }}
                  >
                    {getInitials(userName, userEmail)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1">
                        {userName || userEmail}
                      </Typography>
                      {isCurrentUser && (
                        <Chip 
                          label="You" 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      )}
                      {isAdmin && (
                        <Chip 
                          icon={<AdminPanelSettings fontSize="small" />}
                          label="Admin" 
                          size="small" 
                          color="secondary" 
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={!userName ? undefined : userEmail}
                />
                
                {!isCurrentUser && (
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      aria-label="remove" 
                      onClick={() => handleRemoveClick(member)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            );
          })}
        </List>
      </TabPanel>
      
      <TabPanel value={activeTab} index={1}>
        <Typography variant="h6" gutterBottom>
          Invite a Flock Member
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel component="legend">Member Role</FormLabel>
            <RadioGroup
              row
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <FormControlLabel 
                value="member" 
                control={<Radio />} 
                label="Regular Member" 
                disabled={loading}
              />
              <FormControlLabel 
                value="admin" 
                control={<Radio />} 
                label="Administrator" 
                disabled={loading}
              />
            </RadioGroup>
          </FormControl>
          
          <Button
            type="submit"
            variant="contained"
            startIcon={<PersonAdd />}
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !formData.email}
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </Box>
      </TabPanel>
      
      {flock.pendingInvitations.length > 0 && (
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Pending Invitations
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List>
            {flock.pendingInvitations.map((invitation) => (
              <ListItem 
                key={invitation.email}
                sx={{ 
                  mb: 1,
                  backgroundColor: 'rgba(255, 152, 0, 0.08)',
                  borderRadius: 1
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <PersonAdd />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={invitation.email}
                  secondary={`Invited as ${invitation.role}, expires on ${new Date(invitation.expiresAt).toLocaleDateString()}`}
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    aria-label="cancel" 
                    onClick={() => handleCancelInviteClick(invitation.email)}
                    color="warning"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </TabPanel>
      )}
      
      {/* Confirmation Dialog for Removing Member */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Remove Flock Member</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove {memberToRemove?.name || memberToRemove?.email} from your flock?
            They will no longer have access to flock information and tasks.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmRemove} 
            color="error" 
            disabled={loading}
            variant="contained"
          >
            {loading ? 'Removing...' : 'Remove Member'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirmation Dialog for Cancelling Invitation */}
      <Dialog
        open={cancelInviteDialogOpen}
        onClose={() => setCancelInviteDialogOpen(false)}
      >
        <DialogTitle>Cancel Invitation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel the invitation sent to {invitationToCancel}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelInviteDialogOpen(false)} color="primary">
            Keep Invitation
          </Button>
          <Button 
            onClick={handleConfirmCancelInvite} 
            color="warning" 
            disabled={loading}
            variant="contained"
          >
            {loading ? 'Cancelling...' : 'Cancel Invitation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MemberManagement; 