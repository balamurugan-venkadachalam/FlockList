import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { 
  AccessTime as TimeIcon, 
  PriorityHigh as HighPriorityIcon,
  Flag as MediumPriorityIcon,
  LowPriority as LowPriorityIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { Task } from '../../../services/taskService';
import { TaskPriority } from '../../../types/task';

interface TaskCalendarEventProps {
  task: Task;
}

const TaskCalendarEvent: React.FC<TaskCalendarEventProps> = ({ task }) => {
  // Determine color based on task priority
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return '#f44336'; // Red
      case 'medium':
        return '#ff9800'; // Orange
      case 'low':
        return '#2196f3'; // Blue
      default:
        return '#757575'; // Grey
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4caf50'; // Green
      case 'in_progress':
        return '#ff9800'; // Orange
      case 'pending':
        return '#2196f3'; // Blue
      default:
        return '#757575'; // Grey
    }
  };
  
  // Get priority icon
  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return <HighPriorityIcon fontSize="inherit" />;
      case 'medium':
        return <MediumPriorityIcon fontSize="inherit" />;
      case 'low':
        return <LowPriorityIcon fontSize="inherit" />;
      default:
        return null;
    }
  };
  
  // Generate assignee initials
  const getAssigneeInitials = () => {
    if (!task.assignees || task.assignees.length === 0) return null;
    
    const assignee = task.assignees[0];
    const firstInitial = assignee.firstName ? assignee.firstName.charAt(0) : '';
    const lastInitial = assignee.lastName ? assignee.lastName.charAt(0) : '';
    
    return firstInitial + lastInitial;
  };
  
  const backgroundColor = getPriorityColor(task.priority);
  const textColor = '#ffffff';
  const statusColor = getStatusColor(task.status);
  const priorityIcon = getPriorityIcon(task.priority);
  const assigneeInitials = getAssigneeInitials();
  const isCompleted = task.status === 'completed';
  
  // Format assignee name
  const assigneeName = task.assignees && task.assignees.length > 0 
    ? `${task.assignees[0].firstName || ''} ${task.assignees[0].lastName || ''}`.trim() 
    : 'Unassigned';
  
  return (
    <Tooltip 
      title={
        <Box>
          <Typography variant="subtitle2">{task.title}</Typography>
          <Typography variant="body2">Status: {task.status.replace('_', ' ')}</Typography>
          <Typography variant="body2">Priority: {task.priority}</Typography>
          <Typography variant="body2">Assigned to: {assigneeName}</Typography>
        </Box>
      }
    >
      <Box
        sx={{
          backgroundColor,
          color: textColor,
          padding: '2px 4px',
          borderRadius: '4px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          opacity: isCompleted ? 0.7 : 1,
          textDecoration: isCompleted ? 'line-through' : 'none',
          borderLeft: `4px solid ${statusColor}`,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          gap: 0.5,
          height: '100%',
          minHeight: '20px',
          boxSizing: 'border-box'
        }}
      >
        {priorityIcon && (
          <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '10px' }}>
            {priorityIcon}
          </Box>
        )}
        
        <Typography variant="caption" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {task.title}
        </Typography>
        
        {assigneeInitials && (
          <Box 
            sx={{ 
              borderRadius: '50%', 
              width: '16px', 
              height: '16px', 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '8px',
              fontWeight: 'bold'
            }}
          >
            {assigneeInitials}
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};

export default TaskCalendarEvent; 