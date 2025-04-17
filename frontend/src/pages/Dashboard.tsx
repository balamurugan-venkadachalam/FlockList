import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Divider,
  LinearProgress,
  CircularProgress 
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate, useLocation } from 'react-router-dom';
import { getFamilies } from '../services/familyService';
import { FamiliesResponse } from '../services/familyService';
import LoadingScreen from '../components/common/LoadingScreen';

const Dashboard: React.FC = () => {
  const { user, token, isLoading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [families, setFamilies] = useState<FamiliesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState(false);

  // Track when token is fully ready and valid
  useEffect(() => {
    if (token && user && !authLoading) {
      // Set a small delay to ensure token is properly set in axios headers
      const timer = setTimeout(() => {
        setTokenReady(true);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setTokenReady(false);
    }
  }, [token, user, authLoading]);

  // Only fetch families when token is fully ready
  useEffect(() => {
    if (tokenReady) {
      fetchFamilies();
    }
  }, [tokenReady]);

  const fetchFamilies = async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors
      const response = await getFamilies();
      setFamilies(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch families');
      console.error('Error fetching families:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreateFamily = () => {
    navigate('/families/create');
  };

  // Show loading screen while authentication is in progress
  if (authLoading) {
    return <LoadingScreen message="Preparing your dashboard..." />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to Your Dashboard
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Hello, {user?.firstName} {user?.lastName}!
          </Typography>
          
          <Typography variant="body1" paragraph>
            You are logged in as: {user?.email}
          </Typography>
          
          <Typography variant="body1" paragraph>
            Your role: {user?.role}
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleLogout}
            sx={{ mt: 2 }}
          >
            Logout
          </Button>
        </Paper>

        {/* Family Management Section */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Family Management
          </Typography>
          
          <Divider sx={{ mb: 2 }} />

          {!tokenReady ? (
            <Box sx={{ width: '100%', my: 4 }}>
              <Typography align="center" variant="body1" sx={{ mb: 2 }}>
                Initializing secure connection...
              </Typography>
              <LinearProgress color="secondary" sx={{ height: 6, borderRadius: 3 }} />
            </Box>
          ) : isLoading ? (
            <Box sx={{ width: '100%', my: 4 }}>
              <Typography align="center" variant="body1" sx={{ mb: 2 }}>
                Loading your families...
              </Typography>
              <LinearProgress color="primary" sx={{ height: 6, borderRadius: 3 }} />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', my: 3 }}>
              <Typography color="error" paragraph>
                {error}
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={fetchFamilies}
                sx={{ mt: 1 }}
              >
                Retry
              </Button>
            </Box>
          ) : (
            <>
              {/* Show families if they exist */}
              {families && families.families.length > 0 ? (
                <Grid container spacing={3}>
                  {families.families.map((family) => (
                    <Grid item xs={12} sm={6} md={4} key={family._id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">{family.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Members: {family.members.length}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            onClick={() => navigate(`/families/${family._id}`)}
                          >
                            View Details
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography paragraph>
                  You don't have any families yet.
                </Typography>
              )}

              {/* Show Create Family button if user is a parent */}
              {user?.role === 'parent' && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleCreateFamily}
                  sx={{ mt: 3 }}
                >
                  Create New Family
                </Button>
              )}
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard; 