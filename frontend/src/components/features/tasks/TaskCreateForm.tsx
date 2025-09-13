// Rule applied: Write concise, technical TypeScript code with accurate examples
import React from 'react';
import TaskForm from './TaskForm';

interface TaskCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialFlockId?: string;
}

const TaskCreateForm: React.FC<TaskCreateFormProps> = ({ onSuccess, onCancel, initialFlockId }) => {
  return (
    <TaskForm 
      onSuccess={onSuccess}
      onCancel={onCancel}
      initialFlockId={initialFlockId}
    />
  );
};

export default TaskCreateForm;
