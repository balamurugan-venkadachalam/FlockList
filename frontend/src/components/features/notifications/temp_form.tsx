import React, { useState, useEffect } from 'react';
// Rule applied: Use absolute imports for all files @/...
import { Card, CardContent, CardHeader } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Switch } from '@/components/ui/shadcn/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/shadcn/radio-group';
import { Label } from '@/components/ui/shadcn/label';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/shadcn/toast-provider';
import { Separator } from '@/components/ui/shadcn/separator';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Bell, Clock } from 'lucide-react';
// Rule applied: Use React Form for form handling
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
// Rule applied: Use absolute imports for all files @/...
import notificationService from '@/services/notificationService';

// Define the form schema using zod
const notificationPreferencesSchema = z.object({
  inApp: z.object({
    taskCreated: z.boolean(),
    deadlineApproaching: z.boolean(),
    taskCompleted: z.boolean(),
    memberAdded: z.boolean(),
    invitationAccepted: z.boolean()
  }),
  email: z.object({
    taskCreated: z.boolean(),
    deadlineApproaching: z.boolean(),
    taskCompleted: z.boolean(),
    memberAdded: z.boolean(),
    invitationAccepted: z.boolean()
  }),
  frequency: z.enum(['immediate', 'daily', 'weekly'])
});

// Infer the form data type from the schema
type NotificationPreferencesFormData = z.infer<typeof notificationPreferencesSchema>;

const NotificationPreferencesForm: React.FC = () => {
  // Rule applied: Use React Form for form handling
  const { 
    control, 
    handleSubmit, 
    reset,
    formState: { isSubmitting } 
  } = useForm<NotificationPreferencesFormData>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: {
      inApp: {
        taskCreated: true,
        deadlineApproaching: true,
        taskCompleted: true,
        memberAdded: true,
        invitationAccepted: true
      },
      email: {
        taskCreated: true,
        deadlineApproaching: true,
        taskCompleted: true,
        memberAdded: false,
        invitationAccepted: false
      },
      frequency: 'immediate'
    },
    mode: 'onSubmit'
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    loadPreferences();
  }, []);
  
  // Rule applied: Use TypeScript for all code; prefer interfaces over types
  const loadPreferences = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await notificationService.getNotificationPreferences();
      // Use react-hook-form's reset to update all form values
      reset(response.data);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };
  
  // Using react-hook-form's handleSubmit to process form data
  // Rule applied: Use explicit return types for all functions
  const onSubmit = async (data: NotificationPreferencesFormData): Promise<void> => {
    try {
      // Update preferences using the form data
      await notificationService.updateNotificationPreferences(data);
      toast({
        title: "Success",
        description: "Notification preferences updated successfully",
      });
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to update notification preferences');
    }
  };
  
  if (loading) {
    return <LoadingScreen message="Loading notification preferences..." />;
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold">Notification Preferences</h3>
            <p className="text-sm text-muted-foreground">Manage how and when you receive notifications</p>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* In-App Notifications */}
            <div>
              <div className="flex items-center mb-4">
                <Bell className="mr-2 h-5 w-5" />
                <h3 className="text-lg font-medium">In-App Notifications</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="inApp.taskCreated"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Switch
                          id="inApp-taskCreated"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="inApp-taskCreated">Task created</Label>
                      </>
                    )}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Controller
                    name="inApp.deadlineApproaching"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Switch
                          id="inApp-deadlineApproaching"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="inApp-deadlineApproaching">Deadline approaching</Label>
                      </>
                    )}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Controller
                    name="inApp.taskCompleted"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Switch
                          id="inApp-taskCompleted"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="inApp-taskCompleted">Task completed</Label>
                      </>
                    )}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Controller
                    name="inApp.memberAdded"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Switch
                          id="inApp-memberAdded"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="inApp-memberAdded">Member added</Label>
                      </>
                    )}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Controller
                    name="inApp.invitationAccepted"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Switch
                          id="inApp-invitationAccepted"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="inApp-invitationAccepted">Invitation accepted</Label>
                      </>
                    )}
                  />
                </div>
              </div>
            </div>
            
            {/* Email Notifications */}
            <div>
              <div className="flex items-center mb-4">
                <Bell className="mr-2 h-5 w-5" />
                <h3 className="text-lg font-medium">Email Notifications</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="email.taskCreated"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Switch
                          id="email-taskCreated"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="email-taskCreated">Task created</Label>
                      </>
                    )}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Controller
                    name="email.deadlineApproaching"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Switch
                          id="email-deadlineApproaching"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="email-deadlineApproaching">Deadline approaching</Label>
                      </>
                    )}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Controller
                    name="email.taskCompleted"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Switch
                          id="email-taskCompleted"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="email-taskCompleted">Task completed</Label>
                      </>
                    )}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Controller
                    name="email.memberAdded"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Switch
                          id="email-memberAdded"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="email-memberAdded">Member added</Label>
                      </>
                    )}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Controller
                    name="email.invitationAccepted"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Switch
                          id="email-invitationAccepted"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="email-invitationAccepted">Invitation accepted</Label>
                      </>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Notification Frequency */}
          <div className="mt-8">
            <div className="flex items-center mb-4">
              <Clock className="mr-2 h-5 w-5" />
              <h3 className="text-lg font-medium">Notification Frequency</h3>
            </div>
            
            <Controller
              name="frequency"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="immediate" id="frequency-immediate" />
                    <Label htmlFor="frequency-immediate">Immediate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="frequency-daily" />
                    <Label htmlFor="frequency-daily">Daily digest</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="frequency-weekly" />
                    <Label htmlFor="frequency-weekly">Weekly digest</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default NotificationPreferencesForm;
