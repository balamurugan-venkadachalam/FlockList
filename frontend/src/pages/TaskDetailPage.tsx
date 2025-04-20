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
  Link,
  Tooltip,
  Stack
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
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DoneIcon from '@mui/icons-material/Done';
import { format } from 'date-fns';

import { useAuth } from '../context/AuthContext';
import { getTaskById, updateTaskStatus, deleteTask, Task, TaskResponse } from '../services/taskService';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_CATEGORY_LABELS, TaskStatus } from '../types/task';
import TaskStatusChanger from '../components/features/tasks/TaskStatusChanger';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

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
        setTask(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (task) {
      setTask({
        ...task,
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : task.completedAt,
        completedBy: newStatus === 'completed' && user ? {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        } : task.completedBy
      });
    }
  };

  const handleDeleteTask = async () => {
    if (!task || !id) return;
    
    try {
      setDeleteLoading(true);
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
    } finally {
      setDeleteLoading(false);
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
    // Check if user is creator or assignee or admin
    const isCreator = user._id === task.createdBy._id;
    const isAssignee = task.assignees?.some(assignee => assignee._id === user._id);
    return isCreator || isAssignee || user.role === 'admin';
  };

  const renderStatusActions = () => {
    if (!task) return null;
    
    const { status } = task;
    
    return (
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        {status !== 'in_progress' && (
          <Tooltip title="Start Task">
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={() => handleStatusChange('in_progress')}
              disabled={statusLoading || status === 'completed'}
            >
              Start
            </Button>
          </Tooltip>
        )}
        
        {status === 'in_progress' && (
          <Tooltip title="Pause Task">
            <Button
              variant="contained"
              color="warning"
              startIcon={<PauseIcon />}
              onClick={() => handleStatusChange('pending')}
              disabled={statusLoading}
            >
              Pause
            </Button>
          </Tooltip>
        )}
        
        {status !== 'completed' && (
          <Tooltip title="Complete Task">
            <Button
              variant="contained"
              color="success"
              startIcon={<DoneIcon />}
              onClick={() => handleStatusChange('completed')}
              disabled={statusLoading}
            >
              Complete
            </Button>
          </Tooltip>
        )}
      </Box>
    );
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

  const isAssignee = !!user && task?.assignees.some(assignee => assignee._id === user._id);
  const isCreator = !!user && task?.createdBy._id === user._id;
  const canManageTask = isAssignee || isCreator;

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
          
          {canManageTask && (
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
            <Typography variant="body1" paragraph>
              {task.description || 'No description provided'}
            </Typography>
            
            {canEditTask() && (
              <Box sx={{ mt: 2 }}>
                <TaskStatusChanger 
                  taskId={task._id}
                  currentStatus={task.status}
                  onStatusChange={handleStatusChange}
                />
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Details</Typography>
              
              <List dense disablePadding>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CalendarTodayIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Due Date" 
                    secondary={task.dueDate ? formatDate(task.dueDate) : 'Not set'}
                  />
                </ListItem>
                
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CategoryIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Category" 
                    secondary={TASK_CATEGORY_LABELS[task.category] || task.category}
                  />
                </ListItem>
                
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PriorityHighIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Priority" 
                    secondary={TASK_PRIORITY_LABELS[task.priority] || task.priority}
                  />
                </ListItem>
                
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Created By" 
                    secondary={`${task.createdBy.firstName || ''} ${task.createdBy.lastName || ''}`.trim() || task.createdBy.email}
                  />
                </ListItem>
                
                {task.completedBy && (
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleOutlineIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Completed By" 
                      secondary={
                        <>
                          {`${task.completedBy.firstName || ''} ${task.completedBy.lastName || ''}`.trim() || task.completedBy.email}
                          {task.completedAt && (
                            <Typography variant="caption" display="block">
                              {formatDate(task.completedAt)}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
            
            <Paper elevation={0} variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>Assignees</Typography>
              
              {task.assignees?.length ? (
                <List dense disablePadding>
                  {task.assignees.map(assignee => (
                    <ListItem key={assignee._id} disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() || assignee.email}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No assignees
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Delete Confirmation Dialog */}
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
          <Button onClick={() => setConfirmDelete(false)} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteTask} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : undefined}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskDetailPage; 