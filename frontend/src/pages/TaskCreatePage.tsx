import React from 'react';
import { Container, Typography, Box, Paper, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import TaskCreateForm from '../components/features/tasks/TaskCreateForm';

const TaskCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    // Redirect to tasks list page after successful creation
    navigate('/tasks', { 
      state: { 
        notification: { 
          type: 'success', 
          message: 'Task created successfully!' 
        } 
      } 
    });
  };
  
  const handleCancel = () => {
    // Go back to tasks page
    navigate('/tasks');
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <MuiLink component={Link} to="/dashboard" color="inherit">
            Dashboard
          </MuiLink>
          <MuiLink component={Link} to="/tasks" color="inherit">
            Tasks
          </MuiLink>
          <Typography color="text.primary">Create Task</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Task
        </Typography>
      </Paper>
      
      <TaskCreateForm 
        onSuccess={handleSuccess} 
        onCancel={handleCancel} 
      />
    </Container>
  );
};

export default TaskCreatePage; 