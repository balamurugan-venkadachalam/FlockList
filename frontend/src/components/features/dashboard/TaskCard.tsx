import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Box, 
  Chip, 
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider 
} from '@mui/material';
import { 
  MoreVert as MoreIcon,
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
  DirectionsRun as InProgressIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { format, parseISO, isPast, isToday, isTomorrow } from 'date-fns';
import { Link } from 'react-router-dom';
import { Task } from '../../../services/taskService';
import { TaskStatus } from '../../../types/task';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange }) => {
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  
  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };
  
  // Handle status change
  const handleStatusChange = (newStatus: TaskStatus) => {
    if (onStatusChange) {
      onStatusChange(task._id, newStatus);
    }
    handleMenuClose();
  };
  
  // Get status details (color, icon)
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'completed':
        return { 
          color: 'success', 
          label: 'Completed',
          icon: <CompletedIcon fontSize="small" />
        };
      case 'in_progress':
        return { 
          color: 'warning', 
          label: 'In Progress',
          icon: <InProgressIcon fontSize="small" />
        };
      case 'pending':
        return { 
          color: 'info', 
          label: 'Pending',
          icon: <PendingIcon fontSize="small" />
        };
      default:
        return { 
          color: 'default', 
          label: status,
          icon: <PendingIcon fontSize="small" />
        };
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
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
  
  // Format due date
  const formatDueDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    
    try {
      const date = parseISO(dateString);
      
      if (isToday(date)) {
        return 'Today';
      } else if (isTomorrow(date)) {
        return 'Tomorrow';
      } else {
        return format(date, 'MMM d, yyyy');
      }
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Get assignee display name
  const getAssigneeName = () => {
    if (!task.assignees || task.assignees.length === 0) {
      return 'Unassigned';
    }
    
    const assignee = task.assignees[0];
    return `${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() || assignee.email;
  };
  
  // Check if task is overdue
  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'completed';
  
  // Get status details
  const statusDetails = getStatusDetails(task.status);
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        },
        borderLeft: 5,
        borderColor: `${statusDetails.color}.main`,
      }}
    >
      <CardContent sx={{ flexGrow: 1, pt: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography 
            variant="h6" 
            component="h3" 
            sx={{ 
              fontWeight: 'medium',
              textDecoration: task.status === 'completed' ? 'line-through' : 'none',
              opacity: task.status === 'completed' ? 0.8 : 1
            }}
          >
            {task.title}
          </Typography>
          
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreIcon />
          </IconButton>
          
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
          >
            {task.status !== 'completed' && (
              <MenuItem onClick={() => handleStatusChange('completed')}>
                <CompletedIcon fontSize="small" sx={{ mr: 1 }} />
                Mark Complete
              </MenuItem>
            )}
            
            {task.status !== 'in_progress' && (
              <MenuItem onClick={() => handleStatusChange('in_progress')}>
                <InProgressIcon fontSize="small" sx={{ mr: 1 }} />
                Mark In Progress
              </MenuItem>
            )}
            
            {task.status !== 'pending' && (
              <MenuItem onClick={() => handleStatusChange('pending')}>
                <PendingIcon fontSize="small" sx={{ mr: 1 }} />
                Mark Pending
              </MenuItem>
            )}
            
            <Divider />
            
            <MenuItem 
              component={Link} 
              to={`/tasks/${task._id}`}
            >
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              View Details
            </MenuItem>
          </Menu>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip 
            icon={statusDetails.icon}
            label={statusDetails.label}
            size="small"
            color={statusDetails.color as any}
          />
          
          <Chip 
            label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            size="small"
            color={getPriorityColor(task.priority) as any}
          />
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {task.description || <em>No description</em>}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EventIcon fontSize="small" color={isOverdue ? 'error' : 'action'} sx={{ mr: 1 }} />
            <Typography variant="body2" color={isOverdue ? 'error' : 'text.secondary'}>
              {isOverdue ? 'Overdue: ' : 'Due: '}
              {formatDueDate(task.dueDate)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {getAssigneeName()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      
      <CardActions sx={{ pt: 0 }}>
        <Button 
          size="small" 
          component={Link} 
          to={`/tasks/${task._id}`}
          sx={{ ml: 'auto' }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default TaskCard; 