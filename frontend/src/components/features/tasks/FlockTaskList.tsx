import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  IconButton,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip,
  Grid
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CompleteIcon,
  HourglassEmpty as PendingIcon,
  AccessTime as InProgressIcon,
  Today as TodayIcon,
  Flag as FlagIcon,
  Person as PersonIcon,
  Sort as SortIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getTasks, Task as ServiceTask } from '../../../services/taskService';
import { TaskStatus, TaskPriority } from '../../../types/task';

// Use the Task interface from taskService
type Task = ServiceTask;

// Define interfaces for tasks based on the taskService interface
interface TaskUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

interface FlockTaskListProps {
  flockId: string;
  isAdmin: boolean;
  currentUserId: string;
}

const FlockTaskList: React.FC<FlockTaskListProps> = ({ flockId, isAdmin, currentUserId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('dueDate');
  const [filterStatus, setFilterStatus] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await getTasks({ flockId });
        setTasks(response.tasks);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [flockId]);

  // Handle creating a new task
  const handleCreateTask = () => {
    // Navigate to task creation page
    navigate(`/tasks/create?flockId=${flockId}`);
  };

  // Handle viewing a task
  const handleViewTask = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  // Get sorted and filtered tasks
  const getSortedFilteredTasks = () => {
    let filteredTasks = [...tasks];
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === filterStatus);
    }
    
    // Apply sorting
    return filteredTasks.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          // Sort by due date (tasks with due dates first)
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        
        case 'priority':
          // Sort by priority (high to low)
          const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        
        case 'status':
          // Sort by status (pending, in-progress, completed)
          const statusOrder: Record<string, number> = { 'pending': 0, 'in_progress': 1, 'completed': 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        
        default:
          return 0;
      }
    });
  };

  // Get status chip for task
  const getStatusChip = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return <Chip icon={<PendingIcon />} label="Pending" color="warning" size="small" />;
      case 'in_progress':
        return <Chip icon={<InProgressIcon />} label="In Progress" color="primary" size="small" />;
      case 'completed':
        return <Chip icon={<CompleteIcon />} label="Completed" color="success" size="small" />;
      case 'cancelled':
        return <Chip icon={<DeleteIcon />} label="Cancelled" color="default" size="small" />;
      default:
        return null;
    }
  };

  // Get priority chip for task
  const getPriorityChip = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Chip icon={<FlagIcon />} label="High" color="error" size="small" variant="outlined" />;
      case 'medium':
        return <Chip icon={<FlagIcon />} label="Medium" color="primary" size="small" variant="outlined" />;
      case 'low':
        return <Chip icon={<FlagIcon />} label="Low" color="success" size="small" variant="outlined" />;
      default:
        return null;
    }
  };

  // Get category chip for task
  const getCategoryChip = (category: string) => {
    switch (category) {
      case 'chore':
        return <Chip label="Chore" variant="outlined" size="small" />;
      case 'homework':
        return <Chip label="Homework" variant="outlined" size="small" />;
      case 'activity':
        return <Chip label="Activity" variant="outlined" size="small" />;
      case 'other':
        return <Chip label="Other" variant="outlined" size="small" />;
      default:
        return null;
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Flock Tasks
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateTask}
            disabled={!isAdmin}
          >
            New Task
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Filters and Sorting */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="filter-status-label">Filter by Status</InputLabel>
              <Select
                labelId="filter-status-label"
                id="filter-status"
                value={filterStatus}
                label="Filter by Status"
                onChange={(e) => setFilterStatus(e.target.value)}
                startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1 }} />}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-by-label">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                id="sort-by"
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                startAdornment={<SortIcon fontSize="small" sx={{ mr: 1 }} />}
              >
                <MenuItem value="dueDate">Due Date</MenuItem>
                <MenuItem value="priority">Priority</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {/* Task List */}
        {tasks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No tasks found
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {isAdmin ? 'Create your first task to get started' : 'No tasks have been assigned yet'}
            </Typography>
          </Box>
        ) : (
          <List>
            {getSortedFilteredTasks().map((task) => (
              <Paper
                key={task._id}
                elevation={1}
                sx={{ 
                  mb: 2, 
                  borderLeft: '4px solid',
                  borderLeftColor: task.status === 'completed' 
                    ? 'success.main' 
                    : task.priority === 'high' 
                      ? 'error.main' 
                      : task.priority === 'medium' 
                        ? 'primary.main' 
                        : 'success.main',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer'
                  }
                }}
                onClick={() => handleViewTask(task._id)}
              >
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar 
                      sx={{ 
                        bgcolor: task.status === 'completed' 
                          ? 'success.main' 
                          : task.priority === 'high' 
                            ? 'error.main' 
                            : 'primary.main' 
                      }}
                    >
                      <TaskIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="body1" fontWeight={500} component="span">
                          {task.title}
                        </Typography>
                        {getStatusChip(task.status)}
                        {getPriorityChip(task.priority)}
                        {task.category && getCategoryChip(task.category)}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {task.description && task.description.length > 100 
                            ? `${task.description.substring(0, 100)}...` 
                            : task.description || 'No description provided'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 2 }}>
                          {task.dueDate && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <TodayIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(task.dueDate)}
                              </Typography>
                            </Box>
                          )}
                          
                          {task.assignees.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PersonIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                              <Typography variant="caption" color="text.secondary">
                                Assigned to: {task.assignees.map(a => a.firstName || a.lastName || a.email).join(', ')}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default FlockTaskList; 