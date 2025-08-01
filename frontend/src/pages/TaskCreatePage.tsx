import React from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import TaskCreateForm from '@/components/features/tasks/TaskCreateForm.new';

const TaskCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const flockId = searchParams.get('flockId') || '';
  
  const handleSuccess = () => {
    // Redirect to tasks list page after successful creation
    navigate('/tasks', { 
      state: { 
        notification: { 
          type: 'success', 
          message: 'Task created successfully!' 
        } 
      } 
    });
  };
  
  const handleCancel = () => {
    // Go back to previous page or tasks page
    if (location.state && (location.state as any).from) {
      navigate(-1);
    } else {
      navigate('/tasks');
    }
  };
  
  return (
    <div className="container max-w-3xl mx-auto py-6 px-4">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <Breadcrumbs>
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">
              Dashboard
            </Link>
            {flockId && (
              <Link to={`/flocks/${flockId}`} className="text-gray-500 hover:text-gray-700">
                Flock
              </Link>
            )}
            <Link to="/tasks" className="text-gray-500 hover:text-gray-700">
              Tasks
            </Link>
            <span className="text-gray-900 font-medium">Create Task</span>
          </Breadcrumbs>
          
          <h1 className="text-2xl font-bold mt-4 mb-2">
            Create New Task
          </h1>
        </CardContent>
      </Card>
      
      <TaskCreateForm 
        onSuccess={handleSuccess} 
        onCancel={handleCancel}
        initialFlockId={flockId}
      />
    </div>
  );
};

export default TaskCreatePage; 