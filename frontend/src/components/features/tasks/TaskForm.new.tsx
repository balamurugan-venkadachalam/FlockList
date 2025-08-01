// Rule applied: Use TypeScript for all code; prefer interfaces over types
// Rule applied: Use functional components with TypeScript interfaces
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CalendarIcon, Loader2 } from 'lucide-react';

// Rule applied: Use absolute imports for all files @/...
import { getFamilies } from '@/services/flockService';
import { createTask, updateTask } from '@/services/taskService';
import { TaskPriority, TaskCategory, TASK_PRIORITY_LABELS, TASK_CATEGORY_LABELS } from '@/types/task';
import MemberSelectField from './MemberSelectField';
import { useAuth } from '@/context/AuthContext';
import { Flock } from '@/types/models/flock';

// Shadcn UI components
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Textarea } from '@/components/ui/shadcn/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/shadcn/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/shadcn/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/shadcn/popover';
import { Calendar } from '@/components/ui/shadcn/calendar';
import { Alert, AlertDescription } from '@/components/ui/shadcn/alert';
import { Separator } from '@/components/ui/shadcn/separator';
import { cn } from '@/lib/utils';

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
export const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  priority: z.enum(['low', 'medium', 'high'] as const),
  dueDate: z.date().optional().nullable(),
  category: z.enum(['chore', 'homework', 'activity', 'other'] as const),
  flockId: z.string().min(1, 'Flock is required'),
  assignees: z.array(z.string()).optional()
});

// Infer TypeScript type from Zod schema
export type TaskFormData = z.infer<typeof formSchema>;

export interface TaskFormProps {
  task?: {
    _id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: Date;
    category: TaskCategory;
    assignees?: { id: string; name: string }[];
    flock?: { _id: string; name: string };
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

  // Setup react-hook-form with zod validation
  const form = useForm<TaskFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'medium',
      dueDate: task?.dueDate ? new Date(task.dueDate) : undefined,
      category: task?.category || 'chore',
      assignees: task?.assignees?.map(a => a.id) || [],
      flockId: task?.flock?._id || initialFlockId || '',
    },
  });

  const watchedFlockId = form.watch('flockId');

  // Load families when component mounts
  useEffect(() => {
    loadFamilies();
  }, []);


  // Load families from API
  const loadFamilies = async () => {
    setFamiliesLoading(true);
    setSubmissionError(null);
    
    try {
      const families = await getFamilies();
      setFamilies(families);
      
      // If we have families but no flockId is selected, select the first one
      if (families.length > 0 && !watchedFlockId) {
        form.setValue('flockId', families[0]._id);
      }
    } catch (error) {
      console.error('Failed to load families:', error);
      setSubmissionError('Failed to load families. Please try again later.');
    } finally {
      setFamiliesLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: TaskFormData) => {

    setIsSubmitting(true);
    setSubmissionError(null);
    
    try {
      if (isEditMode && task) {
        await updateTask(task._id, {
          ...data,
          dueDate: data.dueDate ? data.dueDate.toISOString() : undefined
        });
      } else {
        await createTask({
          ...data,
          dueDate: data.dueDate ? data.dueDate.toISOString() : undefined
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to save task:', error);
      setSubmissionError('Failed to save task. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle assignees change
  const handleAssigneesChange = (assignees: string[]) => {
    form.setValue('assignees', assignees);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit Task' : 'Create New Task'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {submissionError && (
              <Alert variant="destructive">
                <AlertDescription>{submissionError}</AlertDescription>
              </Alert>
            )}
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter task description" 
                      {...field} 
                      disabled={isSubmitting}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="flockId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flock *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value} 
                      disabled={isSubmitting || familiesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a flock" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent data-testid="flock-select-content">
                        {familiesLoading ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Loading...</span>
                          </div>
                        ) : families.length === 0 ? (
                          <div className="p-2 text-sm">No flocks available</div>
                        ) : (
                          families.map((family) => (
                            <SelectItem key={family._id} value={family._id}>
                              {family.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isSubmitting}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={(date) => field.onChange(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.entries(TASK_PRIORITY_LABELS || DEFAULT_PRIORITY_LABELS) as [string, string][]).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.entries(TASK_CATEGORY_LABELS || DEFAULT_CATEGORY_LABELS) as [string, string][]).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Separator />
              <h3 className="text-lg font-medium">Task Assignment</h3>
              
              {watchedFlockId ? (
                <MemberSelectField
                  flockId={watchedFlockId}
                  value={form.watch('assignees') || []}
                  onChange={handleAssigneesChange}
                  error={form.formState.errors.assignees?.message}
                  disabled={isSubmitting}
                  currentUserId={user?._id}
                  label="Assign To"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Please select a flock to assign members
                </p>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Update Task' : 'Create Task'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default TaskForm;
