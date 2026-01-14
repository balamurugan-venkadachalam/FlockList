// Rule applied: Write concise, technical TypeScript code with accurate examples
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useToast } from '@/components/ui/shadcn/toast-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/shadcn/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { Alert, AlertDescription } from '@/components/ui/shadcn/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/shadcn/avatar';
import { Badge } from '@/components/ui/shadcn/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/shadcn/tooltip';
import LoadingScreen from '@/components/common/LoadingScreen';
import { format, parseISO, isValid } from 'date-fns';

import { User, UserPlus, Users, Trash, ShieldCheck, X, Mail } from 'lucide-react';

// Helper function to safely format dates
function formatSafeDate(dateString: string): string {
  try {
    if (!dateString) return 'N/A';
    
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid date';
    
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

// Define interfaces for the component
interface FlockMember {
  _id?: string; // Make _id optional to support both interfaces
  user: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string;
  };
  role: 'admin' | 'member';
  joinedAt?: string; // Make joinedAt optional
  flock?: string;
}

interface PendingInvitation {
  _id?: string; // Make _id optional
  email: string;
  role: 'admin' | 'member';
  createdAt?: string; // Make createdAt optional
  token: string;
  expiresAt: string;
}

interface Flock {
  _id: string;
  name: string;
  description?: string; // Make description optional
  members: FlockMember[];
  pendingInvitations: PendingInvitation[];
  createdAt: string;
  updatedAt: string;
}

interface InviteMemberFormData {
  email: string;
  role: 'admin' | 'member';
}

interface MemberManagementProps {
  flockId?: string; // Make flockId optional
  currentUserId: string;
  flock: Flock;
  isAdmin?: boolean; // Make isAdmin optional
  onMemberRemoved?: () => void;
  onInvitationSent?: () => void;
  onInviteMember: (flockId: string, data: InviteMemberFormData) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  onCancelInvitation: (email: string) => Promise<void>;
}

/**
 * MemberManagement component for managing flock members and invitations
 * Uses Shadcn UI components for the UI
 */
const MemberManagement: React.FC<MemberManagementProps> = ({
  flockId,
  currentUserId,
  flock,
  isAdmin,
  onMemberRemoved,
  onInvitationSent,
  onInviteMember,
  onRemoveMember,
  onCancelInvitation
}) => {
  // State management
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FlockMember | null>(null);
  const [cancelInviteDialogOpen, setCancelInviteDialogOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<PendingInvitation | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<InviteMemberFormData>({
    email: '',
    role: 'member'
  });

  // Utility functions for member display
  const getInitials = (member: FlockMember): string => {
    const { firstName, lastName, name, email } = member.user;
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (name) {
      const nameParts = name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    }
    
    return email.charAt(0).toUpperCase();
  };

  // Generate a consistent color based on email
  const getAvatarColor = (email: string): string => {
    const colors = [
      'bg-red-500',
      'bg-green-500',
      'bg-blue-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Event handlers
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await onInviteMember(flockId || flock._id, formData);
      setSuccess('Invitation sent successfully!');
      setFormData({ email: '', role: 'member' });
      toast({
        title: 'Success',
        description: 'Invitation sent successfully!',
      });
      if (onInvitationSent) onInvitationSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClick = (member: FlockMember) => {
    setSelectedMember(member);
    setConfirmDialogOpen(true);
  };

  const handleCancelInvitationClick = (invitation: PendingInvitation) => {
    setSelectedInvitation(invitation);
    setCancelInviteDialogOpen(true);
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await onRemoveMember(selectedMember._id || '');
      setSuccess('Member removed successfully!');
      setConfirmDialogOpen(false);
      setSelectedMember(null);
      toast({
        title: 'Success',
        description: 'Member removed successfully!',
      });
      if (onMemberRemoved) onMemberRemoved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to remove member',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvitation = async () => {
    if (!selectedInvitation) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await onCancelInvitation(selectedInvitation.email);
      setSuccess('Invitation cancelled successfully!');
      setCancelInviteDialogOpen(false);
      setSelectedInvitation(null);
      toast({
        title: 'Success',
        description: 'Invitation cancelled successfully!',
      });
      // Call the callback if provided
      if (onInvitationSent) onInvitationSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel invitation');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to cancel invitation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Render component
  if (loading && !flock) {
    return <LoadingScreen />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <Users className="mr-2" /> Flock Members
        </CardTitle>
        <CardDescription>
          Manage members and invitations for your flock
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="members" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">
              <User className="mr-2 h-4 w-4" /> Members
            </TabsTrigger>
            <TabsTrigger value="invite" disabled={!isAdmin}>
              <UserPlus className="mr-2 h-4 w-4" /> Invite
            </TabsTrigger>
            {flock.pendingInvitations.length > 0 && (
              <TabsTrigger value="pending">
                <Mail className="mr-2 h-4 w-4" /> Pending
                <Badge variant="secondary" className="ml-2">
                  {flock.pendingInvitations.length}
                </Badge>
              </TabsTrigger>
            )}
          </TabsList>
          
          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <div className="space-y-4">
              {flock.members.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No members in this flock yet. Invite members to collaborate!
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {flock.members.map((member) => (
                    <div 
                      key={member._id}
                      className="flex items-center justify-between p-3 rounded-md bg-secondary/20"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className={getAvatarColor(member.user.email)}>
                          <AvatarFallback>{getInitials(member)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.user.firstName && member.user.lastName 
                              ? `${member.user.firstName} ${member.user.lastName}`
                              : member.user.name || member.user.email}
                          </p>
                          <p className="text-sm text-muted-foreground">{member.user.email}</p>
                          <div className="flex items-center mt-1">
                            {member.role === 'admin' && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" /> Admin
                              </Badge>
                            )}
                            {member.user._id === currentUserId && (
                              <Badge className="ml-2">You</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {isAdmin && member.user._id !== currentUserId && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleRemoveClick(member)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Remove member</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Invite Tab */}
          <TabsContent value="invite" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Role</Label>
                <RadioGroup
                  defaultValue={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as 'admin' | 'member' }))}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="member" id="member" />
                    <Label htmlFor="member" className="cursor-pointer">Member</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="cursor-pointer">Administrator</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !formData.email}
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </form>
          </TabsContent>
          
          {/* Pending Invitations Tab */}
          <TabsContent value="pending" className="space-y-4">
            <div className="space-y-2">
              {flock.pendingInvitations.map((invitation) => (
                <div 
                  key={invitation._id}
                  className="flex items-center justify-between p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="bg-yellow-500">
                      <AvatarFallback>
                        <Mail className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <div className="flex items-center mt-1 gap-2">
                        <Badge variant="outline">
                          {invitation.role === 'admin' ? 'Administrator' : 'Member'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Expires: {formatSafeDate(invitation.expiresAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleCancelInvitationClick(invitation)}
                            className="text-amber-600 hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Cancel invitation</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Remove Member Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Flock Member</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The member will lose access to this flock and all its tasks.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedMember && (
              <p>
                Are you sure you want to remove{' '}
                <strong>
                  {selectedMember.user.firstName && selectedMember.user.lastName 
                    ? `${selectedMember.user.firstName} ${selectedMember.user.lastName}`
                    : selectedMember.user.name || selectedMember.user.email}
                </strong>{' '}
                from this flock?
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRemoveMember}
              disabled={loading}
            >
              {loading ? 'Removing...' : 'Remove Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Invitation Dialog */}
      <Dialog open={cancelInviteDialogOpen} onOpenChange={setCancelInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Invitation</DialogTitle>
            <DialogDescription>
              This will revoke the invitation and the recipient will no longer be able to join the flock.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedInvitation && (
              <p>
                Are you sure you want to cancel the invitation sent to{' '}
                <strong>{selectedInvitation.email}</strong>?
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelInviteDialogOpen(false)}>
              Keep Invitation
            </Button>
            <Button 
              variant="default" 
              onClick={handleCancelInvitation}
              disabled={loading}
            >
              {loading ? 'Cancelling...' : 'Cancel Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MemberManagement;
