import React from 'react';
import { format, parseISO, isPast, isToday, isTomorrow } from 'date-fns';
import { Link } from 'react-router-dom';
import { MoreVertical, CheckCircle, Clock, Rss, User, Calendar, Edit } from 'lucide-react';

import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Badge, BadgeProps } from '@/components/ui/shadcn/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/shadcn/dropdown-menu';
import { Task } from '../../../services/taskService';
import { TaskStatusType } from '@/types/models/task';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: TaskStatusType) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange }) => {
  const handleStatusChange = (newStatus: TaskStatusType) => {
    if (onStatusChange) {
      onStatusChange(task._id, newStatus);
    }
  };

  const getStatusDetails = (status: string): { variant: BadgeProps['variant']; label: string; icon: JSX.Element; color: string } => {
    switch (status) {
      case 'completed':
        return { variant: 'default', label: 'Completed', icon: <CheckCircle className="h-4 w-4 mr-2" />, color: 'green-500' };
      case 'in_progress':
        return { variant: 'secondary', label: 'In Progress', icon: <Rss className="h-4 w-4 mr-2" />, color: 'yellow-500' };
      case 'pending':
        return { variant: 'outline', label: 'Pending', icon: <Clock className="h-4 w-4 mr-2" />, color: 'blue-500' };
      default:
        return { variant: 'outline', label: status, icon: <Clock className="h-4 w-4 mr-2" />, color: 'gray-500' };
    }
  };

  const getPriorityDetails = (priority: string): { variant: BadgeProps['variant']; label: string } => {
    switch (priority) {
      case 'high':
        return { variant: 'destructive', label: 'High' };
      case 'medium':
        return { variant: 'secondary', label: 'Medium' };
      case 'low':
        return { variant: 'outline', label: 'Low' };
      default:
        return { variant: 'default', label: priority };
    }
  };

  const formatDueDate = (dateValue?: string | Date) => {
    if (!dateValue) return 'No due date';
    try {
      const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getAssigneeName = () => {
    if (!task.assignees || task.assignees.length === 0) return 'Unassigned';
    const assignee = task.assignees[0];
    return `${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() || assignee.email;
  };

  const isOverdue = task.dueDate && isPast(typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate) && task.status !== 'completed';
  const statusDetails = getStatusDetails(task.status);
  const priorityDetails = getPriorityDetails(task.priority);

  return (
    <Card className={cn('h-full flex flex-col transition-transform transform hover:-translate-y-1 hover:shadow-lg border-l-4', `border-${statusDetails.color}`)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className={cn('text-lg font-medium', task.status === 'completed' && 'line-through text-gray-500')}>
            {task.title}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {task.status !== 'completed' && <DropdownMenuItem onClick={() => handleStatusChange('completed')}><CheckCircle className="h-4 w-4 mr-2" />Mark Complete</DropdownMenuItem>}
              {task.status !== 'in_progress' && <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}><Rss className="h-4 w-4 mr-2" />Mark In Progress</DropdownMenuItem>}
              {task.status !== 'pending' && <DropdownMenuItem onClick={() => handleStatusChange('pending')}><Clock className="h-4 w-4 mr-2" />Mark Pending</DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/tasks/${task._id}`}><Edit className="h-4 w-4 mr-2" />View Details</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center space-x-2 pt-1">
          <Badge variant={statusDetails.variant}>{statusDetails.icon}{statusDetails.label}</Badge>
          <Badge variant={priorityDetails.variant}>{priorityDetails.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
      </CardContent>
      <CardFooter className="justify-between text-sm text-gray-500 dark:text-gray-400 border-t pt-4">
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2" />
          <span>{getAssigneeName()}</span>
        </div>
        <div className={cn('flex items-center', isOverdue && 'text-red-500 font-semibold')}>
          <Calendar className="h-4 w-4 mr-2" />
          <span>{formatDueDate(task.dueDate)}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;