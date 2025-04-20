import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress, 
  Alert,
  Divider,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Dashboard as DashboardIcon,
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
  DirectionsRun as InProgressIcon
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { getTasks, Task, TasksResponse } from '../../../services/taskService';
import { TaskStatus, TaskPriority, TaskCategory } from '../../../types/task';
import TaskCard from './TaskCard';
import TaskStatistics from './TaskStatistics';

interface TaskDashboardProps {
  flockId?: string;
  showAllTasks?: boolean;
}

const TaskDashboard: React.FC<TaskDashboardProps> = ({ flockId, showAllTasks = true }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Statistics
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [pendingTasks, setPendingTasks] = useState<number>(0);
  const [inProgressTasks, setInProgressTasks] = useState<number>(0);
  
  // Load tasks initially and when filters change
  useEffect(() => {
    fetchTasks();
  }, [flockId, statusFilter, priorityFilter, categoryFilter, assigneeFilter]);
  
  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      // Build filter object
      const filters: any = {};
      
      if (flockId) {
        filters.familyId = flockId;
      }
      
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      
      if (priorityFilter !== 'all') {
        filters.priority = priorityFilter;
      }
      
      if (categoryFilter !== 'all') {
        filters.category = categoryFilter;
      }
      
      if (assigneeFilter !== 'all') {
        filters.assignee = assigneeFilter;
      }
      
      const response = await getTasks(filters);
      
      // Apply search filter client-side (if needed)
      let filteredTasks = response.tasks;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredTasks = filteredTasks.filter(task => 
          task.title.toLowerCase().includes(query) || 
          (task.description && task.description.toLowerCase().includes(query))
        );
      }
      
      setTasks(filteredTasks);
      
      // Update statistics
      setCompletedTasks(response.tasks.filter(task => task.status === 'completed').length);
      setPendingTasks(response.tasks.filter(task => task.status === 'pending').length);
      setInProgressTasks(response.tasks.filter(task => task.status === 'in_progress').length);
      
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value as TaskStatus | 'all');
  };
  
  const handlePriorityFilterChange = (event: SelectChangeEvent) => {
    setPriorityFilter(event.target.value as TaskPriority | 'all');
  };
  
  const handleCategoryFilterChange = (event: SelectChangeEvent) => {
    setCategoryFilter(event.target.value as TaskCategory | 'all');
  };
  
  const handleAssigneeFilterChange = (event: SelectChangeEvent) => {
    setAssigneeFilter(event.target.value);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  const handleSearch = () => {
    fetchTasks();
  };
  
  const clearFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    setAssigneeFilter('all');
    setSearchQuery('');
  };
  
  const handleTaskStatusChange = (taskId: string, newStatus: TaskStatus) => {
    // Update local state to reflect the change immediately
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task._id === taskId 
          ? { ...task, status: newStatus } 
          : task
      )
    );
    
    // Refresh task data
    fetchTasks();
  };
  
  const filterApplied = statusFilter !== 'all' || 
                       priorityFilter !== 'all' || 
                       categoryFilter !== 'all' || 
                       assigneeFilter !== 'all' ||
                       searchQuery.trim() !== '';
  
  return (
    <Box sx={{ mb: 4 }}>
      {/* Header with statistics */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Task Dashboard
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <TaskStatistics 
          totalTasks={tasks.length}
          completedTasks={completedTasks}
          pendingTasks={pendingTasks}
          inProgressTasks={inProgressTasks}
        />
      </Paper>
      
      {/* Filters */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filter Tasks
          </Typography>
          
          {filterApplied && (
            <Chip 
              label="Clear Filters" 
              onDelete={clearFilters}
              color="primary"
              deleteIcon={<ClearIcon />}
            />
          )}
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Tasks"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                label="Priority"
                onChange={handlePriorityFilterChange}
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
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
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Assignee</InputLabel>
              <Select
                value={assigneeFilter}
                label="Assignee"
                onChange={handleAssigneeFilterChange}
              >
                <MenuItem value="all">All Assignees</MenuItem>
                {user && <MenuItem value={user._id}>My Tasks</MenuItem>}
                {/* Additional assignees would be dynamically added here */}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Error state */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* No tasks state */}
      {!loading && !error && tasks.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No tasks found
          </Typography>
          <Typography color="textSecondary">
            {filterApplied 
              ? 'Try adjusting your filters or create a new task.'
              : 'Create your first task to get started.'}
          </Typography>
        </Paper>
      )}
      
      {/* Task cards */}
      {!loading && !error && tasks.length > 0 && (
        <Grid container spacing={3}>
          {tasks.map(task => (
            <Grid item xs={12} sm={6} md={4} key={task._id}>
              <TaskCard 
                task={task} 
                onStatusChange={handleTaskStatusChange}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default TaskDashboard; 