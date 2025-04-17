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
  Chip,
  Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getFamilies } from '../../../services/familyService';
import { createTask } from '../../../services/taskService';
import { TaskPriority, TaskCategory, TASK_PRIORITY_LABELS, TASK_CATEGORY_LABELS } from '../../../types/task';

interface TaskCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: Date | null;
  category: TaskCategory;
  familyId: string;
  assignees: string[];
}

const TaskCreateForm: React.FC<TaskCreateFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: null,
    category: 'other',
    familyId: '',
    assignees: []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [families, setFamilies] = useState<any[]>([]);
  const [familiesLoading, setFamiliesLoading] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Load families for dropdown
  useEffect(() => {
    const loadFamilies = async () => {
      try {
        setFamiliesLoading(true);
        const response = await getFamilies();
        setFamilies(response.families);
      } catch (error) {
        console.error('Error loading families:', error);
      } finally {
        setFamiliesLoading(false);
      }
    };

    loadFamilies();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value
    });
    
    // Clear errors when field is updated
    if (errors[name as keyof FormData]) {
      setErrors({
        ...errors,
        [name as string]: undefined
      });
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

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.familyId) {
      newErrors.familyId = 'Family is required';
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
          familyId: '',
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
              onChange={handleChange}
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
              onChange={handleChange}
              disabled={isLoading}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.familyId} disabled={isLoading || familiesLoading}>
              <InputLabel id="family-label">Family</InputLabel>
              <Select
                labelId="family-label"
                id="familyId"
                name="familyId"
                value={formData.familyId}
                label="Family"
                onChange={handleChange}
              >
                {familiesLoading ? (
                  <MenuItem value="">
                    <CircularProgress size={20} /> Loading...
                  </MenuItem>
                ) : (
                  families.map(family => (
                    <MenuItem key={family._id} value={family._id}>
                      {family.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.familyId && <FormHelperText>{errors.familyId}</FormHelperText>}
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
                onChange={handleChange}
              >
                {(Object.entries(TASK_PRIORITY_LABELS) as [TaskPriority, string][]).map(([value, label]) => (
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
                onChange={handleChange}
              >
                {(Object.entries(TASK_CATEGORY_LABELS) as [TaskCategory, string][]).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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