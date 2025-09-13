// Rule applied: Write concise, technical TypeScript code with accurate examples
// Rule applied: Use React Form for form handling
// Rule applied: Use functional and declarative programming patterns; avoid classes
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { InviteMemberFormData } from '@/types/flock';

// Shadcn UI components
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/shadcn/card';
import { Input } from '@/components/ui/shadcn/input';
import { Button } from '@/components/ui/shadcn/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/shadcn/radio-group';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/shadcn/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

interface InviteMemberFormProps {
  flockId: string;
  onInviteMember: (flockId: string, data: InviteMemberFormData) => Promise<void>;
}

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(["admin", "member"], {
    required_error: "You need to select a role.",
  }),
});

const InviteMemberForm: React.FC<InviteMemberFormProps> = ({ flockId, onInviteMember }) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  const { formState: { isSubmitting, errors }, setError } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await onInviteMember(flockId, values);
      toast({
        title: "Invitation Sent",
        description: `Successfully sent an invitation to ${values.email}.`,
      });
      form.reset();
    } catch (err) {
      setError("root.serverError", {
        type: "manual",
        message: err instanceof Error ? err.message : 'Failed to send invitation.',
      });
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle>Invite a Flock Member</CardTitle>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardContent className="space-y-4 pb-0">
            {errors.root?.serverError && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errors.root.serverError.message}</AlertDescription>
              </Alert>
            )}
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Member Role</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                      disabled={isSubmitting}
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="member" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Member
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="admin" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Admin
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invitation
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default InviteMemberForm;