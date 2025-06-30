import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Rule applied: Use absolute imports for all files @/...
// Shadcn UI components
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/shadcn/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/shadcn/badge';

// Lucide React icons
import { Plus, LayoutDashboard, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTasks } from '../services/taskService';
import { Task, TaskListResponse } from '../types/models/task';

// Task status type
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'all';

// Notification interface
interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}

const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatus>('all');
  const [notification, setNotification] = useState<Notification | null>(null);

  // Check for notification in location state (e.g., from task creation)
  useEffect(() => {
    if (location.state && (location.state as any).notification) {
      setNotification((location.state as any).notification);
      // Clear the state to prevent showing the notification again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response: TaskListResponse = await getTasks({ 
          status: statusFilter !== 'all' ? statusFilter : undefined 
        });
        setTasks(response.tasks);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [statusFilter]);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as TaskStatus);
  };

  // Removed unused getStatusColor function

  const handleCloseNotification = () => {
    setNotification(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Notification alert */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in-50 slide-in-from-top-5">
          <Alert className={`${notification.type === 'error' ? 'bg-destructive' : notification.type === 'success' ? 'bg-green-100' : 'bg-blue-100'} w-full`}>
            <AlertDescription className="flex items-center justify-between">
              {notification.message}
              <Button variant="ghost" size="sm" onClick={handleCloseNotification} className="h-8 w-8 p-0 rounded-full">
                <span className="sr-only">Close</span>
                <span className="text-lg">×</span>
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            asChild
            className="flex items-center gap-2"
          >
            <Link to="/tasks/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard View
            </Link>
          </Button>
          <Button 
            variant="outline" 
            asChild
            className="flex items-center gap-2"
          >
            <Link to="/tasks/calendar">
              <Calendar className="h-4 w-4" />
              Calendar View
            </Link>
          </Button>
          {user?.role === 'admin' && (
            <Button 
              variant="default" 
              asChild
              className="flex items-center gap-2"
            >
              <Link to="/tasks/create">
                <Plus className="h-4 w-4" />
                Create Task
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="w-[200px]">
          <Select
            value={statusFilter}
            onValueChange={handleStatusFilterChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center mt-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : error ? (
        <Alert className="bg-destructive/15 mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : tasks.length === 0 ? (
        <Alert className="bg-blue-100 mt-4">
          <AlertDescription>No tasks found</AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <Card key={task._id} className="h-full flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <CardContent className="flex-grow p-5">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold">{task.title}</h2>
                  <Badge 
                    className={`
                      ${task.status === 'pending' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
                      ${task.status === 'in_progress' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : ''}
                      ${task.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                    `}
                  >
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {task.description ? (
                    <>
                      {task.description.substring(0, 100)}
                      {task.description.length > 100 ? '...' : ''}
                    </>
                  ) : (
                    <em>No description</em>
                  )}
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-sm">
                    {task.assignees && task.assignees.length > 0 
                      ? `Assigned to: ${task.assignees[0]}` 
                      : 'Unassigned'}
                  </p>
                  <Button 
                    variant="link" 
                    asChild
                    className="p-0 h-auto"
                  >
                    <Link to={`/tasks/${task._id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksPage; 