import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  Pencil, 
  CheckCircle, 
  Clock, 
  Hourglass, 
  Calendar, 
  Flag, 
  User, 
  ArrowUpDown, 
  Filter, 
  Loader2 
} from 'lucide-react';
import { getTasks, Task as ServiceTask } from '@/services/taskService';
import { TaskStatus, TaskPriority } from '@/types/task';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Badge } from '@/components/ui/shadcn/badge';
import { Alert, AlertDescription } from '@/components/ui/shadcn/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/shadcn/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/shadcn/tooltip';
import { Separator } from '@/components/ui/shadcn/separator';
import { cn } from '@/lib/utils';

// Use the Task interface from taskService
type Task = ServiceTask;

// Define interfaces for tasks based on the taskService interface
interface TaskUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

interface FlockTaskListProps {
  flockId: string;
  isAdmin: boolean;
  currentUserId: string;
}

const FlockTaskList: React.FC<FlockTaskListProps> = ({ flockId, isAdmin, currentUserId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('dueDate');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await getTasks({ flockId });
        setTasks(response.tasks);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [flockId]);

  // Handle creating a new task
  const handleCreateTask = () => {
    // Navigate to task creation page
    navigate(`/tasks/create?flockId=${flockId}`);
  };

  // Handle viewing a task
  const handleViewTask = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  // Get sorted and filtered tasks
  const getSortedFilteredTasks = () => {
    let filteredTasks = [...tasks];
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === filterStatus);
    }
    
    // Apply sorting
    return filteredTasks.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          // Sort by due date (tasks with due dates first)
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        
        case 'priority':
          // Sort by priority (high to low)
          const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        
        case 'status':
          // Sort by status (pending, in-progress, completed)
          const statusOrder: Record<string, number> = { 'pending': 0, 'in_progress': 1, 'completed': 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        
        default:
          return 0;
      }
    });
  };

  // Get status badge for task
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <Hourglass className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get priority badge for task
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            <Flag className="h-3 w-3 mr-1" />
            High
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <Flag className="h-3 w-3 mr-1" />
            Medium
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            <Flag className="h-3 w-3 mr-1" />
            Low
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get category badge for task
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'chore':
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Chore
          </Badge>
        );
      case 'homework':
        return (
          <Badge variant="outline" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
            Homework
          </Badge>
        );
      case 'activity':
        return (
          <Badge variant="outline" className="bg-cyan-100 text-cyan-800 hover:bg-cyan-100">
            Activity
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {category || 'Other'}
          </Badge>
        );
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Invalid date';
      
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold">Tasks</CardTitle>
            {isAdmin && (
              <Button onClick={handleCreateTask} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="flex-1 min-w-[200px]">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value)}
              >
                <SelectTrigger className="w-full">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Sort by Due Date</SelectItem>
                  <SelectItem value="priority">Sort by Priority</SelectItem>
                  <SelectItem value="status">Sort by Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Select
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value)}
              >
                <SelectTrigger className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium text-muted-foreground">
                No tasks found
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isAdmin ? 'Create your first task to get started' : 'No tasks have been assigned yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {getSortedFilteredTasks().map((task) => (
                <Card 
                  key={task._id}
                  className={cn(
                    "cursor-pointer transition-shadow hover:shadow-md",
                    "border-l-4",
                    task.status === 'completed' ? "border-l-green-500" :
                    task.priority === 'high' ? "border-l-red-500" :
                    task.priority === 'medium' ? "border-l-orange-500" :
                    "border-l-blue-500"
                  )}
                  onClick={() => handleViewTask(task._id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className={cn(
                        task.status === 'completed' ? "bg-green-100 text-green-700" :
                        task.priority === 'high' ? "bg-red-100 text-red-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        <AvatarFallback>
                          <ClipboardList className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-base font-medium">{task.title}</h4>
                          {getStatusBadge(task.status)}
                          {getPriorityBadge(task.priority)}
                          {task.category && getCategoryBadge(task.category)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {task.description || 'No description provided'}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          {task.dueDate && (
                            <div className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              {formatDate(task.dueDate)}
                            </div>
                          )}
                          {task.assignees.length > 0 && (
                            <div className="flex items-center">
                              <User className="h-3.5 w-3.5 mr-1" />
                              Assigned to: {task.assignees.map(a => a.firstName || a.lastName || a.email).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FlockTaskList;
