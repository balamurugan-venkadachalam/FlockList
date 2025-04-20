import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Breadcrumbs, Link as MuiLink, CircularProgress, Alert } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import TaskEditForm from '../components/features/tasks/TaskEditForm';
import { getTaskById } from '../services/taskService';

const TaskEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [task, setTask] = useState<any>(null);

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
  
  const handleSuccess = () => {
    navigate(`/tasks/${id}`, { 
      state: { 
        notification: { 
          type: 'success', 
          message: 'Task updated successfully!' 
        } 
      } 
    });
  };
  
  const handleCancel = () => {
    navigate(`/tasks/${id}`);
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!task) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Task not found</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <MuiLink component={Link} to="/dashboard" color="inherit">
            Dashboard
          </MuiLink>
          <MuiLink component={Link} to={`/flocks/${task.flock._id}`} color="inherit">
            {task.flock.name}
          </MuiLink>
          <MuiLink component={Link} to="/tasks" color="inherit">
            Tasks
          </MuiLink>
          <MuiLink component={Link} to={`/tasks/${id}`} color="inherit">
            {task.title}
          </MuiLink>
          <Typography color="text.primary">Edit</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Task
        </Typography>
      </Paper>
      
      <TaskEditForm 
        task={task}
        onSuccess={handleSuccess} 
        onCancel={handleCancel}
      />
    </Container>
  );
};

export default TaskEditPage; 