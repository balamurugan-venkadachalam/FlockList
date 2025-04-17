import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Chip, 
  Button, 
  Grid, 
  Divider, 
  CircularProgress, 
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Breadcrumbs,
  Link
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';

import { useAuth } from '../context/AuthContext';
import { getTaskById, updateTaskStatus, deleteTask, Task, TaskResponse } from '../services/taskService';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_CATEGORY_LABELS } from '../types/task';

interface Subtask {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
}

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await getTaskById(id);
        setTask(response.task);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch task details');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleStatusChange = async (newStatus: 'pending' | 'in_progress' | 'completed') => {
    if (!task || !id) return;
    
    try {
      const response = await updateTaskStatus(id, newStatus);
      setTask(response.task);
    } catch (err: any) {
      setError(err.message || 'Failed to update task status');
    }
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    if (!task) return;
    
    const subtask = task.subtasks?.find(st => st._id === subtaskId);
    if (!subtask) return;
    
    const newStatus = subtask.status === 'completed' ? 'pending' : 'completed';
    
    setTask({
      ...task,
      subtasks: task.subtasks?.map(st => 
        st._id === subtaskId ? { ...st, status: newStatus } : st
      )
    });
  };

  const handleDeleteTask = async () => {
    if (!task || !id) return;
    
    try {
      await deleteTask(id);
      navigate('/tasks', {
        state: {
          notification: {
            type: 'success',
            message: 'Task deleted successfully'
          }
        }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
      setConfirmDelete(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const canEditTask = () => {
    if (!user || !task) return false;
    // Check if user is creator or assignee or parent
    const isCreator = user.userId === task.createdBy._id;
    const isAssignee = task.assignees?.some(assignee => assignee._id === user.userId);
    return isCreator || isAssignee || user.role === 'parent';
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/tasks')}
          sx={{ mt: 2 }}
        >
          Back to Tasks
        </Button>
      </Container>
    );
  }

  if (!task) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Task not found</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/tasks')}
          sx={{ mt: 2 }}
        >
          Back to Tasks
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/dashboard" color="inherit">
            Dashboard
          </Link>
          <Link component={RouterLink} to="/tasks" color="inherit">
            Tasks
          </Link>
          <Typography color="text.primary">Task Details</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {task.title}
            </Typography>
            <Chip 
              label={TASK_STATUS_LABELS[task.status] || task.status}
              color={getStatusColor(task.status) as any}
              sx={{ mr: 1 }}
            />
            <Chip 
              label={TASK_PRIORITY_LABELS[task.priority] || task.priority}
              color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'default'}
            />
          </Box>
          
          {canEditTask() && (
            <Box>
              <Button 
                startIcon={<EditIcon />}
                variant="outlined"
                component={RouterLink}
                to={`/tasks/${task._id}/edit`}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              <Button 
                startIcon={<DeleteIcon />}
                variant="outlined"
                color="error"
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </Button>
            </Box>
          )}
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>Description</Typography>
            <Typography paragraph>
              {task.description || <em>No description provided</em>}
            </Typography>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>Status</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant={task.status === 'pending' ? 'contained' : 'outlined'}
                  color="info"
                  onClick={() => handleStatusChange('pending')}
                  disabled={task.status === 'pending'}
                >
                  Pending
                </Button>
                <Button 
                  variant={task.status === 'in_progress' ? 'contained' : 'outlined'}
                  color="warning"
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={task.status === 'in_progress'}
                >
                  In Progress
                </Button>
                <Button 
                  variant={task.status === 'completed' ? 'contained' : 'outlined'}
                  color="success"
                  onClick={() => handleStatusChange('completed')}
                  disabled={task.status === 'completed'}
                  startIcon={<CheckCircleOutlineIcon />}
                >
                  Complete
                </Button>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Details</Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Due Date</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>{formatDate(task.dueDate)}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CategoryIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>{TASK_CATEGORY_LABELS[task.category] || task.category}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Created By</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>{task.createdBy.firstName} {task.createdBy.lastName}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Assigned To</Typography>
                {task.assignees && task.assignees.length > 0 ? (
                  task.assignees.map(assignee => (
                    <Box key={assignee._id} sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography>{assignee.firstName} {assignee.lastName}</Typography>
                    </Box>
                  ))
                ) : (
                  <Typography><em>Unassigned</em></Typography>
                )}
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                <Typography>{formatDate(task.createdAt)}</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Subtasks section if applicable */}
        {task.subtasks && task.subtasks.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Subtasks</Typography>
            <List>
              {task.subtasks.map(subtask => (
                <ListItem key={subtask._id}>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={subtask.status === 'completed'}
                      onChange={() => handleSubtaskToggle(subtask._id)}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={subtask.title}
                    secondary={subtask.description}
                    sx={{
                      textDecoration: subtask.status === 'completed' ? 'line-through' : 'none'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
      >
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this task? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button onClick={handleDeleteTask} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskDetailPage; 