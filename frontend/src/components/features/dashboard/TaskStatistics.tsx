import React from 'react';
import { Card } from '@/components/ui/shadcn/card';
import { Progress } from '@/components/ui/shadcn/progress';
import { CheckCircle, Clock, Activity } from 'lucide-react';

interface TaskStatisticsProps {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
}

const TaskStatistics: React.FC<TaskStatisticsProps> = ({
  totalTasks,
  completedTasks,
  pendingTasks,
  inProgressTasks
}) => {
  // Calculate percentages
  const completedPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingPercentage = totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0;
  const inProgressPercentage = totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-4 h-full">
        <p className="text-sm text-muted-foreground mb-2">
          Total Tasks
        </p>
        <h2 className="text-3xl font-medium">
          {totalTasks}
        </h2>
      </Card>
      
      <Card className="p-4 h-full">
        <div className="flex items-center mb-2">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <p className="text-sm text-muted-foreground">
            Completed
          </p>
        </div>
        <h2 className="text-3xl font-medium text-green-500">
          {completedTasks}
          <span className="text-sm text-muted-foreground ml-2">
            ({completedPercentage}%)
          </span>
        </h2>
        <Progress 
          value={completedPercentage} 
          className="h-2 mt-2" 
        />
      </Card>
      
      <Card className="p-4 h-full">
        <div className="flex items-center mb-2">
          <Activity className="h-5 w-5 text-amber-500 mr-2" />
          <p className="text-sm text-muted-foreground">
            In Progress
          </p>
        </div>
        <h2 className="text-3xl font-medium text-amber-500">
          {inProgressTasks}
          <span className="text-sm text-muted-foreground ml-2">
            ({inProgressPercentage}%)
          </span>
        </h2>
        <Progress 
          value={inProgressPercentage} 
          className="h-2 mt-2" 
        />
      </Card>
      
      <Card className="p-4 h-full">
        <div className="flex items-center mb-2">
          <Clock className="h-5 w-5 text-blue-500 mr-2" />
          <p className="text-sm text-muted-foreground">
            Pending
          </p>
        </div>
        <h2 className="text-3xl font-medium text-blue-500">
          {pendingTasks}
          <span className="text-sm text-muted-foreground ml-2">
            ({pendingPercentage}%)
          </span>
        </h2>
        <Progress 
          value={pendingPercentage} 
          className="h-2 mt-2" 
        />
      </Card>
    </div>
  );
};

export default TaskStatistics; 