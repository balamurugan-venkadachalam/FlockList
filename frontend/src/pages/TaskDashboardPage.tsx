import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Plus } from 'lucide-react';
import TaskDashboard from '../components/features/dashboard/TaskDashboard';

const TaskDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  // We don't need user in this component, but keeping the auth context for future use
  
  const handleCreateTask = () => {
    navigate('/tasks/create');
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <Breadcrumbs>
                <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">
                  Dashboard
                </Link>
                <span className="text-gray-900 font-medium">Task Dashboard</span>
              </Breadcrumbs>
              
              <h1 className="text-2xl font-bold mt-2">
                Task Dashboard
              </h1>
            </div>
            
            <Button
              variant="default"
              onClick={handleCreateTask}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <TaskDashboard />
    </div>
  );
};

export default TaskDashboardPage; 