import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';

// Shadcn UI components
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Separator } from '@/components/ui/shadcn/separator';
import { ProgressIndeterminate } from '@/components/ui/shadcn/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Badge } from '@/components/ui/shadcn/badge';
import { useToast } from '@/components/ui/shadcn/toast-provider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';

// Lucide icons
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  User,
  Calendar,
  Tag,
  AlertCircle,
  Flag,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { getTaskById, deleteTask, updateTaskStatus, Task } from '../services/taskService';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_CATEGORY_LABELS, TaskStatus } from '../types/task';
import TaskStatusChanger from '../components/features/tasks/TaskStatusChanger';

// Define the assignee type
interface Assignee {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await getTaskById(id);
        setTask(response.task);
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

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task || !id) return;
    
    try {
      // Optimistic update
      const updatedTask = {
        ...task,
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : task.completedAt,
        completedBy: newStatus === 'completed' && user ? {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        } : task.completedBy
      };
      
      setTask(updatedTask);
      
      // Call API to update status
      await updateTaskStatus(id, newStatus);
      
      toast({
        title: "Status Updated",
        description: `Task status changed to ${TASK_STATUS_LABELS[newStatus] || newStatus}`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Failed to update task status',
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async () => {
    if (!task || !id) return;
    
    try {
      setDeleteLoading(true);
      await deleteTask(id);
      
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      
      navigate('/tasks');
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
      setConfirmDelete(false);
      
      toast({
        title: "Error",
        description: err.message || 'Failed to delete task',
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusVariant = (status: string): "default" | "destructive" | "outline" | "secondary" | "success" | "warning" | undefined => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };
  
  const getPriorityVariant = (priority: string): "default" | "destructive" | "outline" | "secondary" | "success" | "warning" | undefined => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (err) {
      return dateString;
    }
  };

  const canEditTask = () => {
    if (!task || !user) return false;
    return isCreator || isAssignee;
  };

  if (loading) {
    return (
      <div className="container mx-auto mt-8 flex justify-center">
        <ProgressIndeterminate />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto mt-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          className="mt-4 flex items-center gap-2"
          asChild
        >
          <Link to="/tasks">
            <ArrowLeft className="h-4 w-4" /> Back to Tasks
          </Link>
        </Button>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto mt-8 px-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Task Not Found</AlertTitle>
          <AlertDescription>The requested task could not be found.</AlertDescription>
        </Alert>
        <Button 
          className="mt-4 flex items-center gap-2"
          asChild
        >
          <Link to="/tasks">
            <ArrowLeft className="h-4 w-4" /> Back to Tasks
          </Link>
        </Button>
      </div>
    );
  }

  // These variables are used to determine if the current user can edit the task
  const isAssignee = !!user && task?.assignees.some((assignee: Assignee) => assignee._id === user._id);
  const isCreator = !!user && task?.createdBy._id === user._id;

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <Card className="mb-6">
        <CardContent className="p-6">
          <Breadcrumbs className="mb-4">
            <Link to="/dashboard" className="text-muted-foreground hover:text-primary">
              Dashboard
            </Link>
            <Link to="/tasks" className="text-muted-foreground hover:text-primary">
              Tasks
            </Link>
            <span className="font-medium">Task Details</span>
          </Breadcrumbs>
          
          {/* Task Header */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold">{task.title}</h1>
            
            <div className="mt-4 flex gap-2 sm:mt-0">
              {canEditTask() && (
                <Button
                  variant="outline"
                  className="flex items-center gap-1"
                  asChild
                >
                  <Link to={`/tasks/${task._id}/edit`}>
                    <Edit className="h-4 w-4" /> Edit
                  </Link>
                </Button>
              )}
              
              {canEditTask() && (
                <Button
                  variant="outline"
                  className="flex items-center gap-1 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              )}
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="mt-4">
            <Badge variant={getStatusVariant(task.status)}>
              {TASK_STATUS_LABELS[task.status] || task.status}
            </Badge>
            
            <p className="mt-4 text-gray-700">
              {task.description}
            </p>
          </div>
          
          {/* Status Actions */}
          {canEditTask() && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h2 className="mb-2 text-lg font-medium">Status Actions</h2>
              <TaskStatusChanger 
                taskId={task._id}
                currentStatus={task.status} 
                onStatusChange={handleStatusChange}
              />
            </div>
          )}
          
          {/* Task Details */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Due Date</p>
                      <p className="text-sm text-gray-600">
                        {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Tag className="mt-0.5 h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Category</p>
                      <p className="text-sm text-gray-600">
                        {TASK_CATEGORY_LABELS[task.category] || task.category}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Flag className="mt-0.5 h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Priority</p>
                      <Badge variant={getPriorityVariant(task.priority)}>
                        {TASK_PRIORITY_LABELS[task.priority] || task.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <User className="mt-0.5 h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Created By</p>
                      <p className="text-sm text-gray-600">
                        {`${task.createdBy.firstName || ''} ${task.createdBy.lastName || ''}`.trim() || task.createdBy.email}
                      </p>
                    </div>
                  </div>
                  
                  {task.completedBy && (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Completed By</p>
                        <p className="text-sm text-gray-600">
                          {`${task.completedBy.firstName || ''} ${task.completedBy.lastName || ''}`.trim() || task.completedBy.email}
                          {task.completedAt && (
                            <span className="mt-1 block text-xs text-gray-500">
                              {formatDate(task.completedAt)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Assignees</CardTitle>
                </CardHeader>
                <CardContent>
                  {task.assignees?.length ? (
                    <div className="space-y-3">
                      {task.assignees.map((assignee: Assignee) => (
                        <div key={assignee._id} className="flex items-center gap-3">
                          <User className="h-5 w-5 text-gray-500" />
                          <span>
                            {`${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() || assignee.email || 'Unknown User'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No assignees</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDelete(false)} 
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteTask} 
              disabled={deleteLoading}
              className="flex items-center gap-2"
            >
              {deleteLoading ? (
                <>
                  <ProgressIndeterminate className="h-4 w-4" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDetailPage;