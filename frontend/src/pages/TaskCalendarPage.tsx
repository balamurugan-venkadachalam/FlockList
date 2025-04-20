import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Breadcrumbs, 
  Link as MuiLink,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  SelectChangeEvent,
  Snackbar
} from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FilterList as FilterIcon,
  Event as EventIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  NotificationsActive as NotificationIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getTasks } from '../services/taskService';
import { getFlocks } from '../services/flockService';
import notificationService from '../services/notificationService';
import TaskCalendar from '../components/features/calendar/TaskCalendar';
import { TaskCategory } from '../types/task';

const TaskCalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [flocks, setFlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, severity: 'success' | 'info' | 'warning' | 'error'} | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filters
  const [flockFilter, setFlockFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  
  // Check URL parameters for initial filter values
  useEffect(() => {
    const flockId = searchParams.get('flockId');
    if (flockId) {
      setFlockFilter(flockId);
    }
  }, [searchParams]);
  
  // Load tasks and flocks data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Build filters
        const filters: any = {};
        
        if (flockFilter !== 'all') {
          filters.familyId = flockFilter;
        }
        
        if (categoryFilter !== 'all') {
          filters.category = categoryFilter;
        }
        
        if (assigneeFilter !== 'all') {
          filters.assignee = assigneeFilter;
        }
        
        // Get tasks with filters
        const tasksResponse = await getTasks(filters);
        setTasks(tasksResponse.tasks);
        
        // Get flocks for filtering
        const flocksResponse = await getFlocks();
        setFlocks(flocksResponse.flocks || []);
        
        // Show notification for flock filter
        if (flockFilter !== 'all' && flocks.length > 0) {
          const selectedFlock = flocks.find(flock => flock._id === flockFilter);
          if (selectedFlock) {
            setNotification({
              message: `Showing tasks for flock: ${selectedFlock.name}`,
              severity: 'info'
            });
          }
        }
        
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [flockFilter, categoryFilter, assigneeFilter, flocks.length]);
  
  // Handle filter changes
  const handleFlockFilterChange = (event: SelectChangeEvent) => {
    const newFlockId = event.target.value;
    setFlockFilter(newFlockId);
    
    // Update URL params if a flock is selected
    if (newFlockId !== 'all') {
      searchParams.set('flockId', newFlockId);
      setSearchParams(searchParams);
    } else {
      searchParams.delete('flockId');
      setSearchParams(searchParams);
    }
  };
  
  const handleCategoryFilterChange = (event: SelectChangeEvent) => {
    setCategoryFilter(event.target.value as TaskCategory | 'all');
  };
  
  const handleAssigneeFilterChange = (event: SelectChangeEvent) => {
    setAssigneeFilter(event.target.value);
  };
  
  // Reset all filters
  const handleClearFilters = () => {
    setFlockFilter('all');
    setCategoryFilter('all');
    setAssigneeFilter('all');
    
    // Clear URL params
    searchParams.delete('flockId');
    setSearchParams(searchParams);
  };
  
  // Check if any filter is applied
  const isFilterApplied = flockFilter !== 'all' || categoryFilter !== 'all' || assigneeFilter !== 'all';
  
  // Close notification
  const handleCloseNotification = () => {
    setNotification(null);
  };
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
              <MuiLink component={Link} to="/dashboard" color="inherit">
                Dashboard
              </MuiLink>
              <MuiLink component={Link} to="/tasks" color="inherit">
                Tasks
              </MuiLink>
              <Typography color="text.primary">Calendar</Typography>
            </Breadcrumbs>
            
            <Typography variant="h4" component="h1">
              <EventIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Task Calendar
            </Typography>
          </div>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to={flockFilter !== 'all' ? `/tasks/create?flockId=${flockFilter}` : '/tasks/create'}
          >
            Create Task
          </Button>
        </Box>
      </Paper>
      
      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filter Calendar
          </Typography>
          
          {isFilterApplied && (
            <Chip 
              label="Clear Filters" 
              onDelete={handleClearFilters}
              color="primary"
              deleteIcon={<ClearIcon />}
            />
          )}
        </Box>
        
        <Grid container spacing={2}>
          {/* Flock Filter */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Flock</InputLabel>
              <Select
                value={flockFilter}
                label="Flock"
                onChange={handleFlockFilterChange}
              >
                <MenuItem value="all">All Flocks</MenuItem>
                {flocks.map(flock => (
                  <MenuItem key={flock._id} value={flock._id}>
                    {flock.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Category Filter */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={handleCategoryFilterChange}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="home">Home</MenuItem>
                <MenuItem value="work">Work</MenuItem>
                <MenuItem value="personal">Personal</MenuItem>
                <MenuItem value="shopping">Shopping</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Assignee Filter */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Assignee</InputLabel>
              <Select
                value={assigneeFilter}
                label="Assignee"
                onChange={handleAssigneeFilterChange}
              >
                <MenuItem value="all">All Assignees</MenuItem>
                {user && <MenuItem value={user._id}>My Tasks</MenuItem>}
                {/* We would dynamically add other flock members here */}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Calendar */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : tasks.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No tasks found for the selected filters.
        </Alert>
      ) : (
        <Box sx={{ height: '70vh' }}>
          <TaskCalendar tasks={tasks} flockMembers={[]} />
        </Box>
      )}
      
      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification?.severity || 'info'}
          sx={{ display: 'flex', alignItems: 'center' }}
          icon={<NotificationIcon />}
        >
          {notification?.message || ''}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TaskCalendarPage; 