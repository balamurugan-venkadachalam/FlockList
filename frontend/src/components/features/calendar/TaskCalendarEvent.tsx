import React from 'react';
import { 
  AlertTriangle, 
  Flag, 
  ArrowDown
} from 'lucide-react';
import { Task } from '@/services/taskService';
import { TaskPriorityType } from '@/types/models/task';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/shadcn/tooltip';

interface TaskCalendarEventProps {
  task: Task;
}

const TaskCalendarEvent: React.FC<TaskCalendarEventProps> = ({ task }) => {
  // Determine color based on task priority
  const getPriorityColor = (priority: TaskPriorityType) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground'; // Red
      case 'medium':
        return 'bg-warning text-warning-foreground'; // Orange
      case 'low':
        return 'bg-primary text-primary-foreground'; // Blue
      default:
        return 'bg-muted text-muted-foreground'; // Grey
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500'; // Green
      case 'in_progress':
        return 'border-amber-500'; // Orange
      case 'pending':
        return 'border-blue-500'; // Blue
      default:
        return 'border-gray-500'; // Grey
    }
  };
  
  // Get priority icon
  const getPriorityIcon = (priority: TaskPriorityType) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-3 w-3" />;
      case 'medium':
        return <Flag className="h-3 w-3" />;
      case 'low':
        return <ArrowDown className="h-3 w-3" />;
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
  
  const priorityColorClass = getPriorityColor(task.priority as TaskPriorityType);
  const statusColorClass = getStatusColor(task.status);
  const priorityIcon = getPriorityIcon(task.priority as TaskPriorityType);
  const assigneeInitials = getAssigneeInitials();
  const isCompleted = task.status === 'completed';
  
  // Format assignee name
  const assigneeName = task.assignees && task.assignees.length > 0 
    ? `${task.assignees[0].firstName || ''} ${task.assignees[0].lastName || ''}`.trim() 
    : 'Unassigned';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              priorityColorClass,
              "px-1 py-0.5 rounded text-xs flex items-center",
              isCompleted ? "opacity-70 line-through" : "",
              `border-l-4 ${statusColorClass}`,
              "overflow-hidden text-ellipsis whitespace-nowrap gap-1 h-full min-h-[20px] box-border"
            )}
          >
            {priorityIcon && (
              <span className="flex items-center text-[10px]">
                {priorityIcon}
              </span>
            )}
            
            <span className="flex-grow overflow-hidden text-ellipsis">
              {task.title}
            </span>
            
            {assigneeInitials && (
              <span 
                className="rounded-full w-4 h-4 bg-white/20 flex items-center justify-center text-[8px] font-bold"
              >
                {assigneeInitials}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{task.title}</p>
            <p className="text-xs">Status: {task.status.replace('_', ' ')}</p>
            <p className="text-xs">Priority: {task.priority}</p>
            <p className="text-xs">Assigned to: {assigneeName}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TaskCalendarEvent;
