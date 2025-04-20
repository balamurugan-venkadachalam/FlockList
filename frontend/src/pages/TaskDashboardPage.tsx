import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Breadcrumbs, 
  Link as MuiLink,
  Button
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Add as AddIcon } from '@mui/icons-material';
import TaskDashboard from '../components/features/dashboard/TaskDashboard';
import { useAuth } from '../context/AuthContext';

const TaskDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleCreateTask = () => {
    navigate('/tasks/create');
  };
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
              <MuiLink component={Link} to="/dashboard" color="inherit">
                Dashboard
              </MuiLink>
              <Typography color="text.primary">Task Dashboard</Typography>
            </Breadcrumbs>
            
            <Typography variant="h4" component="h1">
              Task Dashboard
            </Typography>
          </div>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateTask}
          >
            Create Task
          </Button>
        </Box>
      </Paper>
      
      <TaskDashboard />
    </Container>
  );
};

export default TaskDashboardPage; 