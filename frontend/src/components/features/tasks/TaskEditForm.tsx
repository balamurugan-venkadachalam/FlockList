import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, FormHelperText, Stack, Alert } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateTask } from '../../../services/taskService';
import { getFlocks } from '../../../services/flockService';
import { useAuth } from '../../../context/AuthContext';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date().optional().nullable(),
  assignees: z.array(z.string()).optional(),
  flockId: z.string().min(1, 'Flock is required'),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskEditFormProps {
  task: {
    _id: string;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
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
  const { user } = useAuth();
  const [flocks, setFlocks] = useState<Array<{ _id: string; name: string; members: any[] }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      assignees: task.assignees || [],
      flockId: task.flock._id,
    }
  });

  useEffect(() => {
    const loadFlocks = async () => {
      try {
        const response = await getFlocks();
        setFlocks(response);
      } catch (err: any) {
        setError('Failed to load flocks');
      }
    };

    loadFlocks();
  }, []);

  const onSubmit = async (data: TaskFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      await updateTask(task._id, {
        ...data,
        dueDate: data.dueDate?.toISOString(),
      });
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const selectedFlock = flocks.find(f => f._id === task.flock._id);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Title"
              fullWidth
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Description"
              multiline
              rows={4}
              fullWidth
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          )}
        />

        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.priority}>
              <InputLabel>Priority</InputLabel>
              <Select {...field} label="Priority">
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
              {errors.priority && (
                <FormHelperText>{errors.priority.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        <Controller
          name="dueDate"
          control={control}
          render={({ field }) => (
            <DateTimePicker
              {...field}
              label="Due Date"
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.dueDate,
                  helperText: errors.dueDate?.message
                }
              }}
            />
          )}
        />

        <Controller
          name="assignees"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.assignees}>
              <InputLabel>Assignees</InputLabel>
              <Select
                {...field}
                multiple
                label="Assignees"
              >
                {selectedFlock?.members.map((member) => (
                  <MenuItem key={member._id} value={member._id}>
                    {member.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.assignees && (
                <FormHelperText>{errors.assignees.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        <Controller
          name="flockId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.flockId}>
              <InputLabel>Flock</InputLabel>
              <Select {...field} label="Flock">
                {flocks.map((flock) => (
                  <MenuItem key={flock._id} value={flock._id}>
                    {flock.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.flockId && (
                <FormHelperText>{errors.flockId.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            onClick={onCancel}
            variant="outlined"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            Update Task
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default TaskEditForm; 