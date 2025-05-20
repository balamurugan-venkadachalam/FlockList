import React, { useState, useEffect } from 'react';
import { 
  useParams, 
  useLocation, 
  Link as RouterLink
} from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Button, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Breadcrumbs,
  Alert,
  Snackbar,
  useTheme,
  Link
} from '@mui/material';
// Rule applied: Create Shared Component Libraries
import { 
  ResponsiveContainer, 
  ContentCard
} from '@/components/ui/ThemeComponents';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { 
  getFlockById,
  inviteMember,
  removeMember,
  cancelInvitation
} from '../services/flockService';
import { Flock, InviteMemberFormData } from '@/types/flock';
import { useAuth } from '../context/AuthContext';

// Import our new components
import FlockMembersList from '../components/features/flock/FlockMembersList';
import InviteMemberForm from '../components/features/flock/InviteMemberForm';
import PendingInvitationsList from '../components/features/flock/PendingInvitationsList';
import FlockDashboard from '../components/features/flock/FlockDashboard';
import MemberManagement from '../components/features/flock/MemberManagement';
import FlockTaskList from '../components/features/tasks/FlockTaskList';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel component for material-ui tabs
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`flock-tabpanel-${index}`}
      aria-labelledby={`flock-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const FlockDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user, token } = useAuth();
  const theme = useTheme();
  
  const [flock, setFlock] = useState<Flock | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // For tab navigation
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // Read activeTab from location state if provided
  useEffect(() => {
    // First check for activeTab in location state
    if (location.state && typeof location.state === 'object' && 'activeTab' in location.state) {
      const tabIndex = Number(location.state.activeTab);
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex <= 3) {
        setActiveTab(tabIndex);
      }
    }
    // Then check for tab parameter in URL search params
    else {
      const params = new URLSearchParams(location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        const tabIndex = Number(tabParam);
        if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex <= 3) {
          setActiveTab(tabIndex);
        }
      }
    }
  }, [location.state, location.search]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Close success message snackbar
  const handleCloseSuccessMessage = () => {
    setSuccessMessage(null);
  };

  // Load flock data
  const loadFlock = async () => {
    if (!id) {
      setError('Flock ID is missing');
      setLoading(false);
      return;
    }
    
    if (!token) {
      // Will load when token is available (see useEffect)
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('Loading flock with ID:', id);
      const response = await getFlockById(id);
      
      // Extract flock data from the response
      const flockData = response.flock;
      
      if (!flockData) {
        throw new Error('Invalid response: Missing flock data');
      }
      
      setFlock(flockData);
    } catch (err: any) {
      setError(err.message || 'Failed to load flock details');
      console.error('Error loading flock:', err);
    } finally {
      setLoading(false);
    }
  };

  // Only load flock when authentication is complete and token is available
  useEffect(() => {
    if (token) {
      loadFlock();
    }
  }, [id, token]);

  const handleInviteMember = async (flockId: string, data: InviteMemberFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      await inviteMember(flockId, data);
      setSuccessMessage(`Invitation sent to ${data.email}`);
      await loadFlock(); // Reload flock to get updated data
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!flock || !token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await removeMember(flock._id, memberId);
      setSuccessMessage('Member removed successfully');
      await loadFlock(); // Reload flock to get updated data
    } catch (err: any) {
      setError(err.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvitation = async (email: string) => {
    if (!flock || !token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await cancelInvitation(flock._id, email);
      setSuccessMessage(`Invitation to ${email} cancelled`);
      await loadFlock(); // Reload flock to get updated data
    } catch (err: any) {
      setError(err.message || 'Failed to cancel invitation');
    } finally {
      setLoading(false);
    }
  };

  // Check if the current user is an admin of this flock
  const isAdmin = flock?.members.some(
    member => {
      // Handle both cases where member.user could be an object or just an ID
      const memberId = typeof member.user === 'object' 
        ? member.user?._id 
        : member.user;
      
      return memberId === user?._id && member.role === 'admin';
    }
  ) ?? false;

  return (
    <ResponsiveContainer>
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

      {/* Display error if any */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Show loading spinner while data is loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Show error message if flock not found */}
      {!loading && !flock && !error && (
        <ContentCard>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Flock not found or you don't have access.
          </Alert>
          <Button 
            component={RouterLink} 
            to="/dashboard"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Back to Dashboard
          </Button>
        </ContentCard>
      )}

      {/* Display flock data if available */}
      {flock && (
        <>
          <Box sx={{ mb: theme.spacing(3), display: 'flex', alignItems: 'center' }}>
            <Button 
              component={RouterLink} 
              to="/dashboard"
              startIcon={<ArrowBackIcon />}
              sx={{ mr: theme.spacing(2) }}
              variant="outlined"
            >
              Back
            </Button>
            <Breadcrumbs aria-label="breadcrumb">
              <Link component={RouterLink} to="/dashboard" color="inherit">
                Dashboard
              </Link>
              <Typography color="text.primary">
                {flock.name}
              </Typography>
            </Breadcrumbs>
          </Box>

          {/* Rule applied: Use theme component variants */}
          <ContentCard sx={{ mb: theme.spacing(2) }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="flock tabs"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Dashboard" id="flock-tab-0" aria-controls="flock-tabpanel-0" />
              <Tab label="Members" id="flock-tab-1" aria-controls="flock-tabpanel-1" />
              <Tab label="Tasks" id="flock-tab-2" aria-controls="flock-tabpanel-2" />
              {isAdmin && (
                <Tab label="Manage" id="flock-tab-3" aria-controls="flock-tabpanel-3" />
              )}
            </Tabs>
          </ContentCard>
        </>
      )}

      {/* Tab panels */}
      {flock && (
        <>
          <TabPanel value={activeTab} index={0}>
            <ContentCard>
              <FlockDashboard 
                flock={flock}
                currentUserId={user?._id || ''} 
              />
            </ContentCard>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <ContentCard sx={{ mb: 4 }}>
              {isAdmin && (
                <Box sx={{ mb: 3 }}>
                  <InviteMemberForm
                    flockId={flock._id}
                    onInviteMember={handleInviteMember}
                  />
                </Box>
              )}

              <FlockMembersList
                members={flock.members}
                currentUserId={user?._id || ''}
                isAdmin={isAdmin}
              />
            </ContentCard>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <ContentCard>
              <FlockTaskList
                flockId={flock._id}
                isAdmin={isAdmin}
                currentUserId={user?._id || ''}
              />
            </ContentCard>
          </TabPanel>

          {isAdmin && (
            <TabPanel value={activeTab} index={3}>
              <ContentCard>
                <MemberManagement
                  flock={flock}
                  currentUserId={user?._id || ''}
                  onInviteMember={handleInviteMember}
                  onRemoveMember={handleRemoveMember}
                  onCancelInvitation={handleCancelInvitation}
                />
              </ContentCard>
            </TabPanel>
          )}
        </>
      )}
    </ResponsiveContainer>
  );
};

export default FlockDetailPage; 