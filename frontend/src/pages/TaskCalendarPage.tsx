import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/shadcn/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, Filter as FilterIcon, Calendar, X, CheckCircle, Info, Plus } from 'lucide-react';
import { PaperCard } from '@/components/ui/shadcn/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select';
import { Toast, ToastClose } from '@/components/ui/shadcn/toast';
import { useAuth } from '../context/AuthContext';
import { getTasks } from '../services/taskService';
import { getFlocks } from '../services/flockService';
import TaskCalendar from '../components/features/calendar/TaskCalendar';
import { TaskCategory } from '../types/task';
// Using any type to avoid type conflicts between different Flock interfaces

const TaskCalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [flocks, setFlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, severity: 'success' | 'info' | 'warning' | 'error'} | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filters
  const [flockFilter, setFlockFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  
  // Check URL parameters for initial filter values
  useEffect(() => {
    const flockId = searchParams.get('flockId');
    if (flockId) {
      setFlockFilter(flockId);
    }
  }, [searchParams]);
  
  // Load tasks and flocks data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Build filters
        const filters: any = {};
        
        if (flockFilter !== 'all') {
          filters.familyId = flockFilter;
        }
        
        if (categoryFilter !== 'all') {
          filters.category = categoryFilter;
        }
        
        if (assigneeFilter !== 'all') {
          filters.assignee = assigneeFilter;
        }
        
        // Get tasks with filters
        const tasksResponse = await getTasks(filters);
        setTasks(tasksResponse.tasks);
        
        // Get flocks for filtering
        const flocksResponse = await getFlocks();
        // Handle the API response structure correctly
        if (flocksResponse && typeof flocksResponse === 'object' && 'flocks' in flocksResponse) {
          setFlocks(Array.isArray(flocksResponse.flocks) ? flocksResponse.flocks : []);
        } else if (Array.isArray(flocksResponse)) {
          setFlocks(flocksResponse);
        } else {
          setFlocks([]);
        }
        
        // Show notification for flock filter
        if (flockFilter !== 'all' && flocks.length > 0) {
          const selectedFlock = flocks.find(flock => flock._id === flockFilter);
          if (selectedFlock) {
            setNotification({
              message: `Showing tasks for flock: ${selectedFlock.name}`,
              severity: 'info'
            });
          }
        }
        
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [flockFilter, categoryFilter, assigneeFilter, flocks.length]);
  
  // Handle filter changes
  const handleFlockFilterChange = (value: string) => {
    const newFlockId = value;
    setFlockFilter(newFlockId);
    
    // Update URL params if a flock is selected
    if (newFlockId !== 'all') {
      searchParams.set('flockId', newFlockId);
      setSearchParams(searchParams);
    } else {
      searchParams.delete('flockId');
      setSearchParams(searchParams);
    }
  };
  
  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value as TaskCategory | 'all');
  };
  
  const handleAssigneeFilterChange = (value: string) => {
    setAssigneeFilter(value);
  };
  
  // Reset all filters
  const handleClearFilters = () => {
    setFlockFilter('all');
    setCategoryFilter('all');
    setAssigneeFilter('all');
    
    // Clear URL params
    searchParams.delete('flockId');
    setSearchParams(searchParams);
  };
  
  // Check if any filter is applied
  const isFilterApplied = flockFilter !== 'all' || categoryFilter !== 'all' || assigneeFilter !== 'all';
  
  // Close notification
  const handleCloseNotification = () => {
    setNotification(null);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <PaperCard elevation={2} className="mb-6">
        <div className="mb-6">
          {/* Breadcrumbs */}
          <nav className="mb-4" aria-label="breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link to="/dashboard" className="text-blue-500 hover:text-blue-700">
                  Dashboard
                </Link>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link to="/tasks" className="text-blue-500 hover:text-blue-700">
                  Tasks
                </Link>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-700">Calendar</span>
              </li>
            </ol>
          </nav>
          
          {/* Header */}
          <h1 className="text-2xl font-bold flex items-center mb-4">
            <Calendar className="mr-2 h-6 w-6" />
            Task Calendar
          </h1>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            {/* Empty div */}
          </div>
          
          <Button
            variant="default"
            asChild
          >
            <Link to={flockFilter !== 'all' ? `/tasks/create?flockId=${flockFilter}` : '/tasks/create'} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create Task
            </Link>
          </Button>
        </div>
      </PaperCard>
      
      {/* Filters */}
      <PaperCard elevation={2} className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <FilterIcon className="mr-2 h-5 w-5" />
            Filter Calendar
          </h2>
          
          {isFilterApplied && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={handleClearFilters}
            >
              Clear Filters <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Flock Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Flock</label>
            <Select
              value={flockFilter}
              onValueChange={handleFlockFilterChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Flock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Flocks</SelectItem>
                {flocks.map((flock) => (
                  <SelectItem key={flock._id} value={flock._id}>
                    {flock.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={categoryFilter}
              onValueChange={handleCategoryFilterChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="MEETING">Meeting</SelectItem>
                <SelectItem value="TASK">Task</SelectItem>
                <SelectItem value="EVENT">Event</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Assignee Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Assignee</label>
            <Select
              value={assigneeFilter}
              onValueChange={handleAssigneeFilterChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {user && <SelectItem value={user._id}>My Tasks</SelectItem>}
                {/* We would dynamically add other flock members here */}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PaperCard>
      
      {/* Calendar */}
      {loading ? (
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : tasks.length === 0 ? (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Info</AlertTitle>
          <AlertDescription>No tasks found for the selected filters.</AlertDescription>
        </Alert>
      ) : (
        <div className="h-[70vh]">
          <TaskCalendar tasks={tasks} flockMembers={[]} />
        </div>
      )}
      
      {/* Toast notifications */}
      {notification && (
        <Toast className="fixed bottom-4 right-4 w-auto">
          <div className="flex items-center gap-2">
            {notification.severity === 'info' ? (
              <Info className="h-4 w-4 text-blue-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <div className="flex-1">{notification.message}</div>
            <ToastClose onClick={handleCloseNotification} />
          </div>
        </Toast>
      )}
    </div>
  );
};

export default TaskCalendarPage;