import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Tooltip,
  CircularProgress
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DoneIcon from '@mui/icons-material/Done';
import { TaskStatus } from '../../../types/task';
import { updateTaskStatus } from '../../../services/taskService';

interface TaskStatusChangerProps {
  taskId: string;
  currentStatus: TaskStatus;
  onStatusChange?: (newStatus: TaskStatus) => void;
  disabled?: boolean;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
}

const TaskStatusChanger: React.FC<TaskStatusChangerProps> = ({
  taskId,
  currentStatus,
  onStatusChange,
  disabled = false,
  variant = 'contained',
  size = 'medium',
  showLabels = true
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (currentStatus === newStatus) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await updateTaskStatus(taskId, newStatus);
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (err: any) {
      setError(err.message || `Failed to update task status to ${newStatus}`);
      console.error('Error updating task status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {currentStatus !== 'in_progress' && (
        <Tooltip title="Start Task">
          <span>
            <Button
              variant={variant}
              color="primary"
              size={size}
              startIcon={<PlayArrowIcon />}
              onClick={() => handleStatusChange('in_progress')}
              disabled={loading || disabled || currentStatus === 'completed'}
            >
              {showLabels && 'Start'}
              {loading && <CircularProgress size={24} sx={{ ml: showLabels ? 1 : 0 }} />}
            </Button>
          </span>
        </Tooltip>
      )}
      
      {currentStatus === 'in_progress' && (
        <Tooltip title="Pause Task">
          <span>
            <Button
              variant={variant}
              color="warning"
              size={size}
              startIcon={<PauseIcon />}
              onClick={() => handleStatusChange('pending')}
              disabled={loading || disabled}
            >
              {showLabels && 'Pause'}
              {loading && <CircularProgress size={24} sx={{ ml: showLabels ? 1 : 0 }} />}
            </Button>
          </span>
        </Tooltip>
      )}
      
      {currentStatus !== 'completed' && (
        <Tooltip title="Complete Task">
          <span>
            <Button
              variant={variant}
              color="success"
              size={size}
              startIcon={<DoneIcon />}
              onClick={() => handleStatusChange('completed')}
              disabled={loading || disabled}
            >
              {showLabels && 'Complete'}
              {loading && <CircularProgress size={24} sx={{ ml: showLabels ? 1 : 0 }} />}
            </Button>
          </span>
        </Tooltip>
      )}
    </Box>
  );
};

export default TaskStatusChanger; 