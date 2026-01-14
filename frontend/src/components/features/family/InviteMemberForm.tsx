import React, { useState } from 'react';
import { InviteMemberFormData } from '@/types/flock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/shadcn/radio-group';
import { Alert, AlertDescription } from '@/components/ui/shadcn/alert';
import { Loader2 } from 'lucide-react';

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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevData => ({
      ...prevData,
      email: e.target.value
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prevData => ({
      ...prevData,
      role: value as 'member' | 'admin'
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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Invite a Flock Member</CardTitle>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleEmailChange}
              disabled={loading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Member Role</Label>
            <RadioGroup
              value={formData.role}
              onValueChange={handleRoleChange}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="member" id="member" disabled={loading} />
                <Label htmlFor="member">Regular Member</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin" disabled={loading} />
                <Label htmlFor="admin">Administrator</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !formData.email}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InviteMemberForm;
