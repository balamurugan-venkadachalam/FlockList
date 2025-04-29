import React from 'react';
import TaskForm from './TaskForm';

interface TaskEditFormProps {
  task: {
    _id: string;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    category: 'chore' | 'homework' | 'activity' | 'other';
    dueDate?: Date;
    assignees?: string[];
    flock: {
      _id: string;
      name: string;
      members: Array<{
        _id: string;
        name: string;
      }>;
    };
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const TaskEditForm: React.FC<TaskEditFormProps> = ({ task, onSuccess, onCancel }) => {
  return (
    <TaskForm
      task={task}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};

export default TaskEditForm; 