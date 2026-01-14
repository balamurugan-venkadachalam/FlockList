import React from 'react';
import { Link } from 'react-router-dom';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { 
  AlertTriangle, 
  Flag, 
  ArrowDown, 
  X, 
  Clock, 
  Calendar, 
  User, 
  Edit, 
  CheckCircle,
  Tags
} from 'lucide-react';

import { Task } from '@/services/taskService';
import { TaskPriorityType, TaskStatusType } from '@/types/models/task';
import { cn } from '@/lib/utils';

// Shadcn UI components
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/shadcn/badge';
import { Separator } from '@/components/ui/shadcn/separator';
import { Avatar, AvatarFallback } from '@/components/ui/shadcn/avatar';

interface TaskDetailPopupProps {
  task: Task;
  open: boolean;
  onClose: () => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatusType) => void;
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
  
  // Get priority badge variant
  const getPriorityVariant = (priority: TaskPriorityType): "default" | "destructive" | "outline" | "secondary" => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'default';
    }
  };
  
  // Get status badge variant
  const getStatusVariant = (status: TaskStatusType): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'default';
    }
  };
  
  // Get priority icon
  const getPriorityIcon = (priority: TaskPriorityType): React.ReactNode => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      case 'medium':
        return <Flag className="h-4 w-4 mr-1" />;
      case 'low':
        return <ArrowDown className="h-4 w-4 mr-1" />;
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
  const isOverdue = task.dueDate && isPast(typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate) && task.status !== 'completed';
  
  // Format status label
  const getStatusLabel = (status: TaskStatusType): string => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };
  
  // Format priority label
  const getPriorityLabel = (priority: TaskPriorityType): string => {
    switch (priority) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return priority;
    }
  };
  
  // Format category label
  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'chore': return 'Chore';
      case 'homework': return 'Homework';
      case 'activity': return 'Activity';
      case 'other': return 'Other';
      default: return category;
    }
  };
  
  // Get initials for avatar
  const getInitials = (firstName?: string, lastName?: string, email?: string): string => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(
        "sm:max-w-[500px]",
        task.priority === 'high' ? "border-t-4 border-t-destructive" :
        task.priority === 'medium' ? "border-t-4 border-t-amber-500" :
        "border-t-4 border-t-primary"
      )}>
        <DialogHeader className="space-y-3">
          <div className="flex justify-between items-start">
            <DialogTitle className="text-xl">{task.title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant={getStatusVariant(task.status as TaskStatusType)}>
              {getStatusLabel(task.status as TaskStatusType)}
            </Badge>
            <Badge variant={getPriorityVariant(task.priority as TaskPriorityType)}>
              {getPriorityIcon(task.priority as TaskPriorityType)}
              {getPriorityLabel(task.priority as TaskPriorityType)}
            </Badge>
          </div>
        </DialogHeader>
        
        <Separator />
        
        <div className="space-y-4">
          {/* Description */}
          {task.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div className="flex items-center">
              <Tags className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Category:</span>
              <span className="text-sm font-medium ml-2">
                {getCategoryLabel(task.category)}
              </span>
            </div>
            
            {/* Due Date */}
            {task.dueDate && (
              <div className={cn(
                "flex items-center",
                isOverdue ? "text-destructive" : ""
              )}>
                {isOverdue ? (
                  <Clock className="h-4 w-4 mr-2 text-destructive" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                )}
                <span className={cn(
                  "text-sm",
                  isOverdue ? "text-destructive" : "text-muted-foreground"
                )}>
                  {isOverdue ? 'Overdue:' : 'Due Date:'}
                </span>
                <span className={cn(
                  "text-sm ml-2",
                  isOverdue ? "text-destructive font-bold" : "font-medium"
                )}>
                  {formatDate(task.dueDate as string)}
                </span>
              </div>
            )}
          </div>
          
          {/* Assignees */}
          <div className="mt-4">
            <h4 className="text-sm font-medium flex items-center mb-2">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              Assigned to:
            </h4>
            
            {task.assignees && task.assignees.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {task.assignees.map(assignee => (
                  <div key={assignee._id} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {getInitials(assignee.firstName, assignee.lastName, assignee.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {`${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() || assignee.email}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No assignees</p>
            )}
          </div>
        </div>
        
        <Separator className="my-2" />
        
        <DialogFooter className="flex justify-between sm:justify-end gap-2">
          {task.status !== 'completed' && (
            <Button 
              variant="outline"
              className="border-green-500 hover:bg-green-500 hover:text-white"
              onClick={handleMarkComplete}
              disabled={!onStatusChange}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
          )}
          
          <Button 
            variant="default"
            asChild
          >
            <Link to={`/tasks/${task._id}`}>
              <Edit className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
          
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailPopup;
