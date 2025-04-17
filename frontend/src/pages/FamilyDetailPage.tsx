import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useSearchParams } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Divider, 
  Alert, 
  Snackbar,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { 
  getFamilyById, 
  inviteMember, 
  removeMember,
  cancelInvitation
} from '../services/familyService';
import { Family, InviteMemberFormData } from '@/types/family';
import { useAuth } from '../context/AuthContext';

// Import our new components
import FamilyMembersList from '../components/features/family/FamilyMembersList';
import InviteMemberForm from '../components/features/family/InviteMemberForm';
import PendingInvitationsList from '../components/features/family/PendingInvitationsList';
import FamilyDashboard from '../components/features/family/FamilyDashboard';

// Tab panel component
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
      id={`family-tabpanel-${index}`}
      aria-labelledby={`family-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const FamilyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, token, isLoading: authLoading } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    // Check if there's a success message from navigation state
    location.state && 'message' in location.state 
      ? (location.state as { message: string }).message 
      : null
  );
  
  // Update activeTab initialization to check URL search params first
  const [activeTab, setActiveTab] = useState(() => {
    // First check if tab is specified in URL search params
    const tabParam = searchParams.get('tab');
    if (tabParam !== null) {
      const tabIndex = parseInt(tabParam);
      return !isNaN(tabIndex) ? tabIndex : 0;
    }
    
    // Then check location state
    if (location.state && 'activeTab' in location.state) {
      return (location.state as { activeTab: number }).activeTab;
    }
    
    // Default to 0
    return 0;
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const loadFamily = async () => {
    if (!id) {
      setError('Family ID is missing');
      setLoading(false);
      return;
    }

    if (!token) {
      console.log('Waiting for authentication token...');
      return; // Don't attempt to load if token is not available
    }

    try {
      setLoading(true);
      console.log('Loading family with ID:', id);
      const response = await getFamilyById(id);
      setFamily(response.family);
    } catch (err: any) {
      setError(err.message || 'Failed to load family details');
      console.error('Error loading family:', err);
    } finally {
      setLoading(false);
    }
  };

  // Only load family when authentication is complete and token is available
  useEffect(() => {
    if (!authLoading && token && id) {
      loadFamily();
    }
  }, [id, token, authLoading]);

  const handleInviteMember = async (familyId: string, data: InviteMemberFormData) => {
    if (!token) return;
    
    setActionLoading(true);
    try {
      await inviteMember(familyId, data);
      setSuccessMessage(`Invitation sent to ${data.email}`);
      await loadFamily(); // Reload family to get updated data
    } catch (err: any) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!family || !token) return;
    
    setActionLoading(true);
    try {
      await removeMember(family._id, memberId);
      setSuccessMessage('Member removed successfully');
      await loadFamily(); // Reload family to get updated data
    } catch (err: any) {
      setError(err.message || 'Failed to remove member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelInvitation = async (email: string) => {
    if (!family || !token) return;
    
    setActionLoading(true);
    try {
      await cancelInvitation(family._id, email);
      setSuccessMessage('Invitation cancelled successfully');
      await loadFamily(); // Reload family to get updated data
    } catch (err: any) {
      setError(err.message || 'Failed to cancel invitation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseSuccessMessage = () => {
    setSuccessMessage(null);
  };

  const handleCloseErrorMessage = () => {
    setError(null);
  };

  const isAdmin = family?.members.some(
    member => member.userId === user?._id && member.role === 'admin'
  );

  if (authLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Authenticating...</Typography>
        </Box>
      </Container>
    );
  }

  if (!token) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            Authentication token is missing. Please try logging in again.
          </Alert>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" onClose={handleCloseErrorMessage}>
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  if (!family) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning">
            Family not found or you don't have access.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={handleCloseSuccessMessage}
      >
        <Alert 
          onClose={handleCloseSuccessMessage} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {family.name}
        </Typography>
        
        <Box sx={{ width: '100%', mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="family tabs"
              centered
            >
              <Tab label="Dashboard" id="family-tab-0" aria-controls="family-tabpanel-0" />
              <Tab label="Members" id="family-tab-1" aria-controls="family-tabpanel-1" />
              {isAdmin && (
                <Tab label="Manage" id="family-tab-2" aria-controls="family-tabpanel-2" />
              )}
            </Tabs>
          </Box>
          
          {/* Dashboard Tab */}
          <TabPanel value={activeTab} index={0}>
            <FamilyDashboard family={family} currentUserId={user?._id || ''} />
          </TabPanel>
          
          {/* Members Tab */}
          <TabPanel value={activeTab} index={1}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Family Members
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <FamilyMembersList 
                members={family.members}
                currentUserId={user?._id || ''}
                isAdmin={!!isAdmin}
                onRemoveMember={isAdmin ? handleRemoveMember : undefined}
              />
            </Paper>
          </TabPanel>
          
          {/* Manage Tab (Admin Only) */}
          {isAdmin && (
            <TabPanel value={activeTab} index={2}>
              <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Invite New Member
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <InviteMemberForm 
                  familyId={family._id}
                  onInviteMember={handleInviteMember}
                />
              </Paper>
              
              {family.pendingInvitations && family.pendingInvitations.length > 0 && (
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    Pending Invitations
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <PendingInvitationsList 
                    invitations={family.pendingInvitations}
                    onCancelInvitation={handleCancelInvitation}
                  />
                </Paper>
              )}
            </TabPanel>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default FamilyDetailPage; 