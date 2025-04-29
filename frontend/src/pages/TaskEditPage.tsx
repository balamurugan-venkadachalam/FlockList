import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Breadcrumbs, Link as MuiLink, CircularProgress, Alert } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import TaskEditForm from '../components/features/tasks/TaskEditForm';
import { getTaskById } from '../services/taskService';
import { TaskDetail, TaskUserInfo } from '../types/models/task';

// Use the centralized model definitions

const TaskEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Use the TaskDetail interface from our centralized models
  const [task, setTask] = useState<TaskDetail | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await getTaskById(id);
        // Get the task data from the response
        const taskData = response.task;
        
        // Process the task data to ensure it's properly structured for rendering
        // Convert complex objects to simple types to prevent rendering issues
        
        // Process flock data with properly typed members array
        const flock = {
          _id: typeof taskData.flock === 'string' ? taskData.flock : taskData.flock._id,
          name: typeof taskData.flock === 'string' ? 'Unknown Flock' : (taskData.flock.name || 'Unknown Flock'),
          members: [] as Array<{ _id: string; name: string }>
        };
        
        // Process flock members if they exist
        if (typeof taskData.flock !== 'string' && taskData.flock.members) {
          // Use type assertion to handle the complex member structure
          // Rule: TypeScript Usage - use proper type assertions for complex objects
          flock.members = taskData.flock.members.map((member: any) => {
            // Handle string member IDs
            if (typeof member === 'string') {
              return {
                _id: member,
                name: 'Unknown Member'
              };
            }
            
            // Handle object members with user property
            if (member.user && typeof member.user === 'object') {
              const user = member.user;
              return {
                _id: member._id,
                name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown Member'
              };
            }
            
            // Handle object members with direct properties
            return {
              _id: member._id,
              name: member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown Member'
            };
          });
        }
        
        // Process createdBy to ensure it's a TaskUserInfo object
        const createdBy: TaskUserInfo = typeof taskData.createdBy === 'string' 
          ? { _id: taskData.createdBy } 
          : {
              _id: taskData.createdBy._id,
              firstName: taskData.createdBy.firstName,
              lastName: taskData.createdBy.lastName,
              email: taskData.createdBy.email
            };

        // Process completedBy if it exists
        const completedBy = taskData.completedBy 
          ? (typeof taskData.completedBy === 'string'
              ? { _id: taskData.completedBy }
              : {
                  _id: taskData.completedBy._id,
                  firstName: taskData.completedBy.firstName,
                  lastName: taskData.completedBy.lastName,
                  email: taskData.completedBy.email
                })
          : undefined;

        // Process assignees to ensure they are TaskUserInfo objects
        const formattedAssignees = taskData.assignees.map(assignee => {
          if (typeof assignee === 'string') {
            return assignee;
          } else if (assignee && typeof assignee === 'object' && assignee._id) {
            return {
              _id: assignee._id,
              firstName: assignee.firstName,
              lastName: assignee.lastName,
              email: assignee.email
            } as TaskUserInfo;
          }
          return assignee;
        });

        // Create a properly formatted task object using our TaskDetail interface
        const formattedTask: TaskDetail = {
          _id: taskData._id,
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          category: taskData.category,
          status: taskData.status,
          dueDate: taskData.dueDate,
          assignees: formattedAssignees,
          flock: flock,
          createdBy: createdBy,
          completedBy: completedBy,
          createdAt: taskData.createdAt,
          updatedAt: taskData.updatedAt
        };
        
        setTask(formattedTask);
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
        task={{
          _id: task._id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          category: task.category,
          dueDate: task.dueDate ? new Date(task.dueDate.toString()) : undefined,
          // Convert complex assignee objects to string IDs for the form
          assignees: task.assignees.map(assignee => 
            typeof assignee === 'string' ? assignee : assignee._id
          ),
          flock: {
            _id: task.flock._id,
            name: task.flock.name,
            members: task.flock.members
          }
        }}
        onSuccess={handleSuccess} 
        onCancel={handleCancel}
      />
    </Container>
  );
};

export default TaskEditPage; 