// Rule applied: Use TypeScript for all code; prefer interfaces over types
// Rule applied: Use functional components with TypeScript interfaces
import React, { useState, useEffect } from 'react';
// Rule applied: Use explicit imports for better code organization
import { Search, Filter, X, Loader2 } from 'lucide-react';

// Rule applied: Use absolute imports for all files @/...
import { useAuth } from '@/context/AuthContext';
import { getTasks, Task, TaskListResponse } from '@/services/taskService';
import { TaskStatusType } from '@/types/models/task';

import TaskCard from './TaskCard';
import TaskStatistics from './TaskStatistics';

// Shadcn UI components
import { Card } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Alert, AlertDescription } from '@/components/ui/shadcn/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';

interface TaskDashboardProps {
  flockId?: string;
  showAllTasks?: boolean;
}

const TaskDashboard: React.FC<TaskDashboardProps> = ({ flockId }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Statistics
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [pendingTasks, setPendingTasks] = useState<number>(0);
  const [inProgressTasks, setInProgressTasks] = useState<number>(0);
  
  // Load tasks initially and when filters change
  useEffect(() => {
    fetchTasks();
  }, [flockId, statusFilter, priorityFilter, categoryFilter, assigneeFilter]);
  
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params: Record<string, string> = {};
      if (flockId) params.flockId = flockId;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (assigneeFilter !== 'all') params.assignee = assigneeFilter;
      if (searchQuery.trim()) params.searchTerm = searchQuery.trim();
      
      // Fetch tasks with filters
      const response: TaskListResponse = await getTasks(params);
      setTasks(response.tasks);
      
      // Update statistics
      const completed = response.tasks.filter(task => task.status === 'completed').length;
      const pending = response.tasks.filter(task => task.status === 'pending').length;
      const inProgress = response.tasks.filter(task => task.status === 'in_progress').length;
      
      setCompletedTasks(completed);
      setPendingTasks(pending);
      setInProgressTasks(inProgress);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTaskStatusChange = (taskId: string, newStatus: TaskStatusType) => {
    // Update local state first for immediate feedback
    const updatedTasks = tasks.map(task => 
      task._id === taskId ? { ...task, status: newStatus as any } : task
    );
    
    setTasks(updatedTasks);
    
    // Update statistics
    const completed = updatedTasks.filter(task => task.status === 'completed').length;
    const pending = updatedTasks.filter(task => task.status === 'pending').length;
    const inProgress = updatedTasks.filter(task => task.status === 'in_progress').length;
    
    setCompletedTasks(completed);
    setPendingTasks(pending);
    setInProgressTasks(inProgress);
    
    // In a real app, you would also make an API call to update the task status
  };
  
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };
  
  const handlePriorityFilterChange = (value: string) => {
    setPriorityFilter(value);
  };
  
  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
  };
  
  const handleAssigneeFilterChange = (value: string) => {
    setAssigneeFilter(value);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  const handleSearch = () => {
    fetchTasks();
  };
  
  const clearFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    setAssigneeFilter('all');
    setSearchQuery('');
  };
  
  // Computed property to determine if any filter is applied
  const filterApplied = statusFilter !== 'all' || 
                       priorityFilter !== 'all' || 
                       categoryFilter !== 'all' || 
                       assigneeFilter !== 'all' || 
                       searchQuery.trim() !== '';
  
  return (
    <div className="w-full">
      {/* Task Statistics */}
      <TaskStatistics 
        totalTasks={tasks.length}
        completedTasks={completedTasks}
        pendingTasks={pendingTasks}
        inProgressTasks={inProgressTasks}
      />
      
      {/* Search and Filter */}
      <Card className="mt-6 p-6">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-medium flex-grow flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </h2>
          
          <div className="flex items-center">
            <div className="relative mr-4">
              <Input
                className="pr-10"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2" 
                onClick={handleSearch}
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            
            <Button 
              variant="outline" 
              onClick={clearFilters}
              disabled={!filterApplied}
              className="flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <Select
              value={statusFilter}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Priority</label>
            <Select
              value={priorityFilter}
              onValueChange={handlePriorityFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <Select
              value={categoryFilter}
              onValueChange={handleCategoryFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="chore">Chore</SelectItem>
                <SelectItem value="homework">Homework</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Assignee</label>
            <Select
              value={assigneeFilter}
              onValueChange={handleAssigneeFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {user && <SelectItem value={user._id}>My Tasks</SelectItem>}
                {/* Additional assignees would be dynamically added here */}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* No tasks state */}
      {!loading && !error && tasks.length === 0 && (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium mb-2">
            No tasks found
          </h3>
          <p className="text-muted-foreground">
            {filterApplied 
              ? 'Try adjusting your filters or create a new task.'
              : 'Create your first task to get started.'}
          </p>
        </Card>
      )}
      
      {/* Task cards */}
      {!loading && !error && tasks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {tasks.map(task => (
            <TaskCard 
              key={task._id}
              task={task} 
              onStatusChange={handleTaskStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskDashboard;