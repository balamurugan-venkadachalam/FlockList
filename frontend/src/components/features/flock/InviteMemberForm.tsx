// Rule applied: Write concise, technical TypeScript code with accurate examples
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { InviteMemberFormData } from '@/types/flock';
import { cn } from '@/lib/utils';

// Shadcn UI components
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/shadcn/card';
import { Input } from '@/components/ui/shadcn/input';
import { Button } from '@/components/ui/shadcn/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/shadcn/radio-group';
import { Label } from '@/components/ui/shadcn/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/shadcn/alert';
import { FormItem, FormLabel, FormControl } from '@/components/ui/form';

interface InviteMemberFormProps {
  flockId: string;
  onInviteMember: (flockId: string, data: InviteMemberFormData) => Promise<void>;
}

const InviteMemberForm: React.FC<InviteMemberFormProps> = ({ flockId, onInviteMember }) => {
  const [formData, setFormData] = useState<InviteMemberFormData>({
    email: '',
    role: 'member'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await onInviteMember(flockId, formData);
      setSuccess(`Invitation sent to ${formData.email}`);
      setFormData({
        email: '',
        role: 'member'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle>Invite a Flock Member</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormItem>
            <FormLabel htmlFor="email">Email Address</FormLabel>
            <FormControl>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
                className="w-full"
                aria-required="true"
              />
            </FormControl>
          </FormItem>
          
          <div className="space-y-2">
            <Label htmlFor="role-group">Member Role</Label>
            <RadioGroup
              id="role-group"
              name="role"
              value={formData.role}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, role: value as 'member' | 'admin' }));
              }}
              className="flex space-x-4"
              aria-label="Member role"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="member" id="member" disabled={loading} />
                <Label htmlFor="member" className={cn(loading && "opacity-50")}>Regular Member</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin" disabled={loading} />
                <Label htmlFor="admin" className={cn(loading && "opacity-50")}>Administrator</Label>
              </div>
            </RadioGroup>
          </div>
          
          <CardFooter className="px-0 pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !formData.email}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default InviteMemberForm; 