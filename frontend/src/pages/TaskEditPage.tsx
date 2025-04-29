import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Breadcrumbs, Link as MuiLink, CircularProgress, Alert } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import TaskEditForm from '../components/features/tasks/TaskEditForm';
import { getTaskById } from '../services/taskService';
import { TaskPriority, TaskCategory, TaskStatus } from '../types/task';

// Define interfaces for the task data structure
interface FlockMember {
  _id: string;
  name: string;
}

interface FlockData {
  _id: string;
  name: string;
  members: FlockMember[];
}

// Define the task response type from the API
interface TaskResponse {
  task: {
    _id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    category: TaskCategory;
    status: TaskStatus;
    dueDate?: string;
    assignees: Array<string | { _id: string; firstName?: string; lastName?: string; email?: string }>;
    flock: {
      _id: string;
      name: string;
      members?: Array<{ _id: string; firstName?: string; lastName?: string; name?: string }>
    } | string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  };
}

const TaskEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Define a proper interface for the task
  interface EditableTask {
    _id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    category: TaskCategory;
    status: TaskStatus;
    dueDate?: string; // Use string for dates from API
    assignees: string[];
    flock: FlockData;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  }
  
  const [task, setTask] = useState<EditableTask | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await getTaskById(id);
        // Get the task data from the response and explicitly type it
        const taskData = response.task as TaskResponse['task'];
        
        // Process the flock data to ensure it has the correct structure
        const flockData: FlockData = {
          _id: typeof taskData.flock === 'string' ? taskData.flock : taskData.flock._id,
          name: typeof taskData.flock === 'string' ? 'Unknown Flock' : (taskData.flock.name || 'Unknown Flock'),
          members: []
        };
        
        // Process members if they exist
        if (typeof taskData.flock !== 'string' && taskData.flock.members) {
          flockData.members = taskData.flock.members.map((member) => ({
            _id: typeof member === 'string' ? member : member._id,
            name: typeof member === 'string' ? 'Unknown Member' : 
              (member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown Member')
          }));
        }
        
        // Process assignees to ensure they are string IDs
        const assignees: string[] = [];
        if (Array.isArray(taskData.assignees)) {
          taskData.assignees.forEach((assignee) => {
            if (typeof assignee === 'string') {
              assignees.push(assignee);
            } else if (assignee && typeof assignee === 'object' && assignee._id) {
              assignees.push(assignee._id);
            }
          });
        }
        
        // Format the task data to ensure it's properly structured
        // and doesn't contain any objects that might be rendered directly
        const formattedTask: EditableTask = {
          _id: taskData._id,
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          category: taskData.category,
          status: taskData.status,
          dueDate: taskData.dueDate, // Keep as string
          assignees,
          flock: flockData,
          createdBy: taskData.createdBy,
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
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          assignees: task.assignees,
          flock: task.flock
        }}
        onSuccess={handleSuccess} 
        onCancel={handleCancel}
      />
    </Container>
  );
};

export default TaskEditPage; 