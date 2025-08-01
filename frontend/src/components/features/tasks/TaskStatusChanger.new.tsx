import React, { useState } from 'react';
import { Play, Pause, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/shadcn/tooltip';
import { TaskStatus } from '@/types/task';
import { updateTaskStatus } from '@/services/taskService';
import { cn } from '@/lib/utils';

interface TaskStatusChangerProps {
  taskId: string;
  currentStatus: TaskStatus;
  onStatusChange?: (newStatus: TaskStatus) => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabels?: boolean;
}

const TaskStatusChanger: React.FC<TaskStatusChangerProps> = ({
  taskId,
  currentStatus,
  onStatusChange,
  disabled = false,
  variant = 'default',
  size = 'default',
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
    <div className="flex gap-2">
      {currentStatus !== 'in_progress' && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={variant}
                size={size}
                onClick={() => handleStatusChange('in_progress')}
                disabled={loading || disabled || currentStatus === 'completed'}
                className={cn(
                  "bg-blue-600 hover:bg-blue-700",
                  variant !== 'default' && "bg-transparent"
                )}
              >
                <Play className="h-4 w-4 mr-2" />
                {showLabels && 'Start'}
                {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Start Task</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {currentStatus === 'in_progress' && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={variant}
                size={size}
                onClick={() => handleStatusChange('pending')}
                disabled={loading || disabled}
                className={cn(
                  "bg-amber-600 hover:bg-amber-700",
                  variant !== 'default' && "bg-transparent"
                )}
              >
                <Pause className="h-4 w-4 mr-2" />
                {showLabels && 'Pause'}
                {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Pause Task</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {currentStatus !== 'completed' && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={variant}
                size={size}
                onClick={() => handleStatusChange('completed')}
                disabled={loading || disabled}
                className={cn(
                  "bg-green-600 hover:bg-green-700",
                  variant !== 'default' && "bg-transparent"
                )}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {showLabels && 'Complete'}
                {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Complete Task</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default TaskStatusChanger;
