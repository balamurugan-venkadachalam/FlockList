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
import { Bell, Clock, Mail } from 'lucide-react';
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
    return <LoadingScreen message="Loading notification preferences..." aria-live="polite" />;
  }
  
  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="space-y-6"
      aria-label="Notification preferences form"
      role="form"
    >
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2 text-lg font-semibold" aria-labelledby="form-title">
            <Bell className="h-5 w-5" aria-hidden="true" />
            <h2 id="form-title" tabIndex={-1}>Notification Preferences</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure how and when you receive notifications about tasks and team activity.
          </p>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          {error && (
            <Alert 
              variant="destructive" 
              className="mb-6"
              role="alert"
              aria-live="assertive"
            >
              <AlertTitle>Error</AlertTitle>
              <p>{error}</p>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* In-App Notifications */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 id="inapp-section" className="text-base font-medium">In-App Notifications</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Notifications shown within the application</p>
              
              <div className="space-y-3" aria-labelledby="inapp-section">
                <div className="flex items-center justify-between">
                  <Label htmlFor="inApp-taskCreated" className="cursor-pointer">Task created</Label>
                  <Controller
                    name="inApp.taskCreated"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="inApp-taskCreated"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="inApp-deadlineApproaching" className="cursor-pointer">Deadline approaching</Label>
                  <Controller
                    name="inApp.deadlineApproaching"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="inApp-deadlineApproaching"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="inApp-taskCompleted" className="cursor-pointer">Task completions</Label>
                  <Controller
                    name="inApp.taskCompleted"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="inApp-taskCompleted"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="inApp-memberAdded" className="cursor-pointer">New family members</Label>
                  <Controller
                    name="inApp.memberAdded"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="inApp-memberAdded"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="inApp-invitationAccepted" className="cursor-pointer">Invitation acceptance</Label>
                  <Controller
                    name="inApp.invitationAccepted"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="inApp-invitationAccepted"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            
            {/* Email Notifications */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 id="email-section" className="text-base font-medium">Email Notifications</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Notifications sent to your email address</p>
              
              <div className="space-y-3" aria-labelledby="inapp-section">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-taskCreated" className="cursor-pointer">Task created</Label>
                  <Controller
                    name="email.taskCreated"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="email-taskCreated"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-deadlineApproaching" className="cursor-pointer">Deadline approaching</Label>
                  <Controller
                    name="email.deadlineApproaching"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="email-deadlineApproaching"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-taskCompleted" className="cursor-pointer">Task completions</Label>
                  <Controller
                    name="email.taskCompleted"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="email-taskCompleted"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-memberAdded" className="cursor-pointer">New family members</Label>
                  <Controller
                    name="email.memberAdded"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="email-memberAdded"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-invitationAccepted" className="cursor-pointer">Invitation acceptance</Label>
                  <Controller
                    name="email.invitationAccepted"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="email-invitationAccepted"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Notification Frequency */}
          <div className="mt-8">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 id="frequency-section" className="text-base font-medium">Notification Frequency</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Choose how often you want to receive email notifications
            </p>
            
            <Controller
              name="frequency"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="space-y-3"
                  aria-labelledby="frequency-section"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="immediate" id="frequency-immediate" />
                    <Label htmlFor="frequency-immediate" className="cursor-pointer">
                      Immediate
                      <span className="block text-xs text-muted-foreground">
                        Send notifications as events occur
                      </span>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="frequency-daily" />
                    <Label htmlFor="frequency-daily" className="cursor-pointer">
                      Daily digest
                      <span className="block text-xs text-muted-foreground">
                        Send a daily summary of all notifications
                      </span>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="frequency-weekly" />
                    <Label htmlFor="frequency-weekly" className="cursor-pointer">
                      Weekly digest
                      <span className="block text-xs text-muted-foreground">
                        Send a weekly summary of all notifications
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>
        </CardContent>
        
        <div className="flex justify-end p-6 pt-2">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full sm:w-auto"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </Card>
    </form>
  );
};

export default NotificationPreferencesForm;
