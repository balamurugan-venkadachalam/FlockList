import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Chip, 
  Divider, 
  Grid,
  Avatar,
  AvatarGroup,
  IconButton
} from '@mui/material';
import { 
  Close as CloseIcon,
  PriorityHigh as PriorityHighIcon,
  Flag as MediumPriorityIcon,
  LowPriority as LowPriorityIcon,
  Category as CategoryIcon,
  AccessTime as ClockIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompleteIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { Task } from '../../../services/taskService';
import { TaskPriority, TaskStatus, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS, TASK_CATEGORY_LABELS } from '../../../types/task';

interface TaskDetailPopupProps {
  task: Task;
  open: boolean;
  onClose: () => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

const TaskDetailPopup: React.FC<TaskDetailPopupProps> = ({ 
  task, 
  open, 
  onClose,
  onStatusChange
}) => {
  // Format date in a human-readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date set';
    
    try {
      const date = parseISO(dateString);
      
      if (isToday(date)) {
        return `Today (${format(date, 'MMM d, yyyy')})`;
      } else if (isTomorrow(date)) {
        return `Tomorrow (${format(date, 'MMM d, yyyy')})`;
      } else {
        return format(date, 'EEEE, MMMM d, yyyy');
      }
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Get color for priority
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };
  
  // Get color for status
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'pending':
        return 'info';
      default:
        return 'default';
    }
  };
  
  // Get priority icon
  const getPriorityIcon = (priority: TaskPriority): React.ReactNode => {
    switch (priority) {
      case 'high':
        return <PriorityHighIcon />;
      case 'medium':
        return <MediumPriorityIcon />;
      case 'low':
        return <LowPriorityIcon />;
      default:
        return null;
    }
  };
  
  // Handle marking task as complete
  const handleMarkComplete = () => {
    if (onStatusChange) {
      onStatusChange(task._id, 'completed');
      onClose();
    }
  };
  
  // Determine if the task is overdue
  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'completed';
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ 
        sx: { 
          borderTop: 5, 
          borderColor: getPriorityColor(task.priority) + '.main',
          borderRadius: '8px'
        } 
      }}
    >
      <DialogTitle sx={{ pr: 6, pb: 1 }}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 10, top: 10 }}
        >
          <CloseIcon />
        </IconButton>
        
        <Typography variant="h6" component="div">
          {task.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            label={TASK_STATUS_LABELS[task.status]} 
            color={getStatusColor(task.status)} 
            size="small" 
          />
          <Chip 
            icon={getPriorityIcon(task.priority)} 
            label={TASK_PRIORITY_LABELS[task.priority]} 
            color={getPriorityColor(task.priority)} 
            size="small" 
          />
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 2 }}>
        {/* Description */}
        {task.description && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1">
              {task.description}
            </Typography>
          </Box>
        )}
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Category */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CategoryIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Category:
              </Typography>
              <Typography variant="body2" sx={{ ml: 1, fontWeight: 'medium' }}>
                {TASK_CATEGORY_LABELS[task.category] || 'Uncategorized'}
              </Typography>
            </Box>
          </Grid>
          
          {/* Due Date */}
          {task.dueDate && (
            <Grid item xs={12} sm={6}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: isOverdue ? 'error.main' : 'text.primary' 
                }}
              >
                {isOverdue ? (
                  <ClockIcon color="error" sx={{ mr: 1 }} />
                ) : (
                  <EventIcon color="action" sx={{ mr: 1 }} />
                )}
                <Typography variant="body2" color={isOverdue ? 'error' : 'text.secondary'}>
                  {isOverdue ? 'Overdue:' : 'Due Date:'}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    ml: 1, 
                    fontWeight: isOverdue ? 'bold' : 'medium',
                    color: isOverdue ? 'error.main' : 'text.primary'  
                  }}
                >
                  {formatDate(task.dueDate)}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
        
        {/* Assignees */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            <PersonIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
            Assigned to:
          </Typography>
          
          {task.assignees && task.assignees.length > 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              {task.assignees.map(assignee => (
                <Chip
                  key={assignee._id}
                  avatar={
                    <Avatar>
                      {assignee.firstName ? assignee.firstName[0] : assignee.email[0]}
                    </Avatar>
                  }
                  label={`${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() || assignee.email}
                  variant="outlined"
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No assignees
            </Typography>
          )}
        </Box>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        {task.status !== 'completed' && (
          <Button 
            startIcon={<CompleteIcon />} 
            color="success" 
            onClick={handleMarkComplete}
            disabled={!onStatusChange}
          >
            Mark Complete
          </Button>
        )}
        
        <Button 
          component={Link} 
          to={`/tasks/${task._id}`} 
          startIcon={<EditIcon />}
          color="primary"
        >
          View Details
        </Button>
        
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetailPopup; 