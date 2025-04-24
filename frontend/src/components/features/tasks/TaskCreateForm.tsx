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
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getFamilies } from '../../../services/flockService';
import { createTask } from '../../../services/taskService';
import { TaskPriority, TaskCategory, TASK_PRIORITY_LABELS, TASK_CATEGORY_LABELS } from '../../../types/task';
import MemberSelectField from './MemberSelectField';
import { useAuth } from '../../../context/AuthContext';
import { Flock } from '../../../types/flock';

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

interface TaskCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialFlockId?: string;
}

interface FormData {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: Date | null;
  category: TaskCategory;
  flockId: string;
  assignees: string[];
}

const TaskCreateForm: React.FC<TaskCreateFormProps> = ({ onSuccess, onCancel, initialFlockId }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: null,
    category: 'other',
    flockId: initialFlockId || '',
    assignees: []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [families, setFamilies] = useState<Flock[]>([]);
  const [familiesLoading, setFamiliesLoading] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Load families for dropdown
  useEffect(() => {
    const loadFamilies = async () => {
      try {
        setFamiliesLoading(true);
        // getFamilies() already handles the different response formats and returns Flock[]
        const flocksList = await getFamilies();
        setFamilies(flocksList);
      } catch (error) {
        console.error('Error loading families:', error);
        setFamilies([]); // Ensure families is an array even on error
      } finally {
        setFamiliesLoading(false);
      }
    };

    loadFamilies();
  }, []);

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Clear errors when field is updated
      if (errors[name as keyof FormData]) {
        setErrors({
          ...errors,
          [name]: undefined
        });
      }
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<unknown>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Clear errors when field is updated
      if (errors[name as keyof FormData]) {
        setErrors({
          ...errors,
          [name]: undefined
        });
      }
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData({
      ...formData,
      dueDate: date
    });
    
    // Clear date error if exists
    if (errors.dueDate) {
      setErrors({
        ...errors,
        dueDate: undefined
      });
    }
  };

  const handleAssigneesChange = (assignees: string[]) => {
    setFormData({
      ...formData,
      assignees
    });

    // Clear assignees error if exists
    if (errors.assignees) {
      setErrors({
        ...errors,
        assignees: undefined
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.flockId) {
      newErrors.flockId = 'Flock is required';
    }

    if (formData.assignees.length === 0) {
      newErrors.assignees = 'At least one assignee is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Format data for API
      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? formData.dueDate.toISOString() : undefined
      };
      
      await createTask(taskData);
      
      // Reset form or call onSuccess
      if (onSuccess) {
        onSuccess();
      } else {
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          dueDate: null,
          category: 'other',
          flockId: '',
          assignees: []
        });
      }
    } catch (error: any) {
      console.error('Error creating task:', error);
      setSubmissionError(error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Create New Task
      </Typography>
      
      {submissionError && (
        <Typography color="error" sx={{ mb: 2 }}>
          {submissionError}
        </Typography>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="title"
              name="title"
              label="Task Title"
              value={formData.title}
              onChange={handleTextFieldChange}
              error={!!errors.title}
              helperText={errors.title}
              disabled={isLoading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleTextFieldChange}
              disabled={isLoading}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.flockId} disabled={isLoading || familiesLoading}>
              <InputLabel id="flock-label">Flock</InputLabel>
              <Select
                labelId="flock-label"
                id="flockId"
                name="flockId"
                value={formData.flockId}
                label="Flock"
                onChange={handleSelectChange}
              >
                {familiesLoading ? (
                  <MenuItem value="">
                    <CircularProgress size={20} /> Loading...
                  </MenuItem>
                ) : families && families.length > 0 ? (
                  families.map(flock => (
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
              {errors.flockId && <FormHelperText>{errors.flockId}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date"
                value={formData.dueDate}
                onChange={handleDateChange}
                disabled={isLoading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.dueDate,
                    helperText: errors.dueDate
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={isLoading}>
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                id="priority"
                name="priority"
                value={formData.priority}
                label="Priority"
                onChange={handleSelectChange}
              >
                {(Object.entries(TASK_PRIORITY_LABELS || DEFAULT_PRIORITY_LABELS) as [string, string][]).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={isLoading}>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                name="category"
                value={formData.category}
                label="Category"
                onChange={handleSelectChange}
              >
                {(Object.entries(TASK_CATEGORY_LABELS || DEFAULT_CATEGORY_LABELS) as [string, string][]).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" gutterBottom>
              Task Assignment
            </Typography>
            {formData.flockId ? (
              <MemberSelectField
                flockId={formData.flockId}
                value={formData.assignees}
                onChange={handleAssigneesChange}
                error={errors.assignees}
                disabled={isLoading}
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
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
              >
                {isLoading ? 'Creating...' : 'Create Task'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default TaskCreateForm; 