import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFlock } from '@/services/flockService';

// Rule applied: Use Shadcn UI components
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/shadcn/label';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, X } from 'lucide-react';

// Define the form schema using zod
const flockFormSchema = z.object({
  name: z.string()
    .min(1, { message: 'Flock name is required' })
    .max(100, { message: 'Flock name cannot exceed 100 characters' }),
  description: z.string().max(500, { message: 'Description cannot exceed 500 characters' }).optional()
});

// Infer the form data type from the schema
type FlockFormData = z.infer<typeof flockFormSchema>;

function CreateFlockForm(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Initialize react-hook-form
  const { 
    register,
    handleSubmit: formSubmit, 
    formState: { errors },
    setError: setFormError
  } = useForm<FlockFormData>({
    resolver: zodResolver(flockFormSchema),
    defaultValues: {
      name: '',
      description: ''
    },
    mode: 'onBlur' // Validate on blur for better user experience
  });

  const onSubmit = async (data: FlockFormData): Promise<void> => {
    // Clear any previous errors
    setError(null);

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await createFlock(data.name, data.description);
      
      // Get the flock ID from the response
      const flockData = response.flock;
      const flockId = flockData?._id;
      
      if (!flockId) {
        throw new Error('Invalid response from server: Missing flock ID');
      }
      
      // Navigate to the flock detail page with the newly created flock ID
      navigate(`/flocks/${flockId}`, { 
        state: { message: 'Flock created successfully!' }
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create flock. Please try again.';
      setError(errorMessage);
      
      // If the error is about duplicate flock name, set the field error too
      if (errorMessage.includes('already exists')) {
        setFormError('name', { 
          type: 'manual',
          message: 'A flock with this name already exists'
        });
      }
      
      console.error('Flock creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearError = () => {
    setError(null);
  };

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-xl shadow-md">
        <CardContent className="pt-6 flex flex-col gap-4">
          <p className="text-center text-muted-foreground mb-2">
            Create a flock group to manage tasks together with your flock members.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleClearError}
                  className="h-5 w-5 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <form 
            onSubmit={formSubmit(onSubmit, (errors) => {
              console.error('Form validation errors:', errors);
            })} 
            data-testid="create-flock-form"
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="block">
                  Flock Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter a name for your flock"
                  className={errors.name ? 'border-destructive' : ''}
                  disabled={isLoading}
                  maxLength={100}
                  data-testid="flock-name-input"
                />
                {errors.name ? (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">This will be visible to all flock members</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="block">
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Enter a description for your flock (optional)"
                  className={errors.description ? 'border-destructive' : ''}
                  disabled={isLoading}
                  rows={3}
                  maxLength={500}
                  data-testid="flock-description-input"
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="submit-flock-button"
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Create Flock
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateFlockForm;