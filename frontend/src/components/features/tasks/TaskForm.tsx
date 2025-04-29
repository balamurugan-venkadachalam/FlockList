import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Typography, 
  CircularProgress,
  Grid,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getFamilies } from '@/services/flockService';
import { createTask, updateTask } from '@/services/taskService';
import { TaskPriority, TaskCategory, TASK_PRIORITY_LABELS, TASK_CATEGORY_LABELS } from '@/types/task';
import MemberSelectField from './MemberSelectField';
import { useAuth } from '@/context/AuthContext';
import { Flock } from '@/types/flock';


// Define fallback labels in case imports fail
const DEFAULT_PRIORITY_LABELS: Record<string, string> = {
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High'
};

const DEFAULT_CATEGORY_LABELS: Record<string, string> = {
  'chore': 'Chore',
  'homework': 'Homework',
  'activity': 'Activity',
  'other': 'Other'
};

// Define the Zod schema for form validation
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  priority: z.enum(['low', 'medium', 'high'] as const),
  dueDate: z.date().optional().nullable(),
  category: z.enum(['chore', 'homework', 'activity', 'other'] as const),
  flockId: z.string().min(1, 'Flock is required'),
  assignees: z.array(z.string()).optional()
});

// Infer TypeScript type from Zod schema
type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: {
    _id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: Date;
    category: TaskCategory;
    assignees?: string[];
    flock: {
      _id: string;
      name: string;
      members: Array<{
        _id: string;
        name: string;
      }>;
    };
  }; // Optional - if provided, we're in edit mode
  onSuccess?: () => void;
  onCancel?: () => void;
  initialFlockId?: string; // For create mode only
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSuccess, onCancel, initialFlockId }) => {
  const { user } = useAuth();
  const isEditMode = !!task;
  
  // State for loading flocks and error handling
  const [families, setFamilies] = useState<Flock[]>([]);
  const [familiesLoading, setFamiliesLoading] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // We track selectedFlock state for future UI enhancements
  // This state is maintained for consistency with the original implementation
  // and will be useful when adding features like member filtering
  const [selectedFlock, setSelectedFlock] = useState<Flock | null>(null);
  
  // This silences the lint warning by accessing the variable
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = selectedFlock;

  // Setup react-hook-form with zod validation
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'medium',
      dueDate: task?.dueDate ? new Date(task.dueDate) : null,
      category: task?.category || 'other',
      flockId: task?.flock?._id || initialFlockId || '',
      assignees: task?.assignees || []
    }
  });

  // Watch for flockId changes to update the selected flock
  const watchedFlockId = watch('flockId');

  // Load families/flocks for dropdown
  useEffect(() => {
    const loadFamilies = async (): Promise<void> => {
      try {
        setFamiliesLoading(true);
        const flocksList = await getFamilies();
        setFamilies(flocksList);
        
        // If we have flocks and a flockId, find the selected flock
        if (flocksList.length > 0 && watchedFlockId) {
          const flock = flocksList.find(f => f._id === watchedFlockId);
          if (flock) {
            setSelectedFlock(flock);
          }
        }
      } catch (error) {
        console.error('Error loading families:', error);
        setFamilies([]); // Ensure families is an array even on error
        setSubmissionError('Failed to load families/flocks');
      } finally {
        setFamiliesLoading(false);
      }
    };

    loadFamilies();
  }, [watchedFlockId]);

  // Update selected flock when flockId changes
  useEffect(() => {
    if (families.length > 0 && watchedFlockId) {
      const flock = families.find(f => f._id === watchedFlockId);
      if (flock) {
        setSelectedFlock(flock);
      } else {
        setSelectedFlock(null);
      }
    }
  }, [families, watchedFlockId]);

  // Handle form submission
  const onSubmit = async (data: TaskFormData): Promise<void> => {
    try {
      setIsSubmitting(true);
      setSubmissionError(null);
      
      if (isEditMode && task) {
        // Update existing task
        await updateTask(task._id, {
          ...data,
          dueDate: data.dueDate?.toISOString(),
        });
      } else {
        // Create new task
        await createTask({
          ...data,
          dueDate: data.dueDate?.toISOString(),
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} task:`, err);
      setSubmissionError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} task`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle assignees change
  const handleAssigneesChange = (assignees: string[]): void => {
    setValue('assignees', assignees);
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {submissionError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submissionError}
          </Alert>
        )}
        
        <Typography variant="h5" gutterBottom>
          {isEditMode ? 'Edit Task' : 'Create New Task'}
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Title"
                  fullWidth
                  required
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  disabled={isSubmitting}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12}>
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
                  disabled={isSubmitting}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Controller
              name="flockId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.flockId} disabled={isSubmitting || familiesLoading}>
                  <InputLabel id="flock-label">Flock</InputLabel>
                  <Select
                    {...field}
                    labelId="flock-label"
                    label="Flock"
                    endAdornment={familiesLoading ? <CircularProgress size={20} /> : null}
                  >
                    {families.length > 0 ? (
                      families.map((flock) => (
                        <MenuItem key={flock._id} value={flock._id}>
                          {flock.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        No flocks available
                      </MenuItem>
                    )}
                  </Select>
                  {errors.flockId && <FormHelperText>{errors.flockId.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Due Date"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
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
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth disabled={isSubmitting} error={!!errors.priority}>
                  <InputLabel id="priority-label">Priority</InputLabel>
                  <Select
                    {...field}
                    labelId="priority-label"
                    label="Priority"
                  >
                    {(Object.entries(TASK_PRIORITY_LABELS || DEFAULT_PRIORITY_LABELS) as [string, string][]).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.priority && <FormHelperText>{errors.priority.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth disabled={isSubmitting} error={!!errors.category}>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    {...field}
                    labelId="category-label"
                    label="Category"
                  >
                    {(Object.entries(TASK_CATEGORY_LABELS || DEFAULT_CATEGORY_LABELS) as [string, string][]).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" gutterBottom>
              Task Assignment
            </Typography>
            {watchedFlockId ? (
              <MemberSelectField
                flockId={watchedFlockId}
                value={watch('assignees') || []}
                onChange={handleAssigneesChange}
                error={errors.assignees?.message}
                disabled={isSubmitting}
                currentUserId={user?._id}
                label="Assign To"
              />
            ) : (
              <Typography color="text.secondary" variant="body2">
                Please select a flock to assign members
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {onCancel && (
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting 
                  ? (isEditMode ? 'Updating...' : 'Creating...') 
                  : (isEditMode ? 'Update Task' : 'Create Task')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default TaskForm;
