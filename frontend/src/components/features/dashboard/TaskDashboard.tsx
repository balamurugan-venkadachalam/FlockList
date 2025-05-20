// Rule applied: Use TypeScript for all code; prefer interfaces over types
// Rule applied: Use functional components with TypeScript interfaces
import React, { useState, useEffect } from 'react';
// Rule applied: Use explicit imports for better code organization
import { 
  Box, 
  Typography, 
  Grid, 
  CircularProgress, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
// Rule applied: Use absolute imports for all files @/...
import { useAuth } from '@/context/AuthContext';
import { getTasks } from '@/services/taskService';
import { TaskStatus, TaskPriority, TaskCategory } from '@/types/task';

// Using the imported type from taskService for consistency
type Task = {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: Date;
  assignees?: string[];
  flock: {
    _id: string;
    name: string;
  };
};
import TaskCard from './TaskCard';
import TaskStatistics from './TaskStatistics';

// Rule applied: Create reusable styled components for frequently used patterns
import { ContentCard } from '@/components/ui/ThemeComponents';

interface TaskDashboardProps {
  flockId?: string;
  showAllTasks?: boolean;
}

const TaskDashboard: React.FC<TaskDashboardProps> = ({ flockId, showAllTasks = true }) => {
  // Rule applied: Use theme-based styling
  const theme = useTheme();
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
  
  // Track if any filters are applied
  const filterApplied = statusFilter !== 'all' || 
                       priorityFilter !== 'all' || 
                       categoryFilter !== 'all' || 
                       assigneeFilter !== 'all' ||
                       searchQuery.trim() !== '';
  
  // Rule applied: Use theme spacing for all margins, paddings, and gaps
  return (
    <Box>
      {/* Rule applied: Use theme typography */}
      <Box sx={{ mb: theme.spacing(3) }}>
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{ 
            fontWeight: theme.typography.fontWeightMedium,
            color: theme.palette.text.primary 
          }}
        >
          Task Dashboard {flockId ? '(Family View)' : ''}
        </Typography>
      </Box>
      
      {/* Task statistics - Rule applied: Use theme spacing for all margins, paddings, and gaps */}
      <ContentCard sx={{ mb: theme.spacing(3) }}>
        <TaskStatistics 
          totalTasks={tasks.length}
          completedTasks={completedTasks}
          pendingTasks={pendingTasks}
          inProgressTasks={inProgressTasks}
        />
      </ContentCard>
      
      {/* Filter options */}
      <ContentCard sx={{ mb: theme.spacing(3) }}>
        <Box sx={{ 
          mb: theme.spacing(2), 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <Typography 
            variant="h6"
            sx={{ fontWeight: theme.typography.fontWeightMedium }}
          >
            <FilterIcon sx={{ mr: theme.spacing(1), verticalAlign: 'middle' }} />
            Filters
          </Typography>
          <Button 
            variant="outlined" 
            size="small"
            onClick={clearFilters}
            disabled={!filterApplied}
            startIcon={<ClearIcon />}
          >
            Clear Filters
          </Button>
        </Box>
        
        <Grid container spacing={theme.spacing(2)}>
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
      </ContentCard>
      
      {/* Loading state - Rule applied: Use sx prop shorthand for theme-based values */}
      {loading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          my: theme.spacing(4) 
        }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Error state - Rule applied: Use theme spacing for all margins, paddings, and gaps */}
      {error && (
        <Alert severity="error" sx={{ mb: theme.spacing(3) }}>
          {error}
        </Alert>
      )}
      
      {/* No tasks state - Rule applied: Use theme spacing for all margins, paddings, and gaps */}
      {!loading && !error && tasks.length === 0 && (
        <ContentCard sx={{ 
          p: theme.spacing(4), 
          textAlign: 'center' 
        }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontWeight: theme.typography.fontWeightMedium }}
          >
            No tasks found
          </Typography>
          <Typography color="text.secondary">
            {filterApplied 
              ? 'Try adjusting your filters or create a new task.'
              : 'Create your first task to get started.'}
          </Typography>
        </ContentCard>
      )}
      
      {/* Task cards - Rule applied: Use theme-based grid and container configurations */}
      {!loading && !error && tasks.length > 0 && (
        <Grid container spacing={theme.spacing(3)}>
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