// Rule applied: Write concise, technical TypeScript code with accurate examples
import React, { useState } from 'react';
import { FlockMember } from '../../../types/flock';
import { format, parseISO } from 'date-fns';

// Shadcn UI components
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Avatar, AvatarFallback } from '@/components/ui/shadcn/avatar';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { Separator } from '@/components/ui/shadcn/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/shadcn/tooltip';

// Lucide icons
import { 
  Users, 
  User, 
  ShieldCheck, 
  Trash, 
  Mail as MailIcon,
  Calendar 
} from 'lucide-react';

interface FlockMembersListProps {
  members: FlockMember[];
  currentUserId: string;
  isAdmin: boolean;
  onRemoveMember?: (memberId: string) => void;
}

const FlockMembersList: React.FC<FlockMembersListProps> = ({ 
  members, 
  currentUserId, 
  isAdmin, 
  onRemoveMember 
}) => {
  const [memberToRemove, setMemberToRemove] = useState<FlockMember | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Helper function to extract user information safely
  const getUserInfo = (member: FlockMember) => {
    // If user is an object, extract information
    if (typeof member.user === 'object' && member.user !== null) {
      return {
        id: member.user._id,
        email: member.user.email,
        name: member.user.firstName && member.user.lastName 
          ? `${member.user.firstName} ${member.user.lastName}`
          : member.user.firstName || member.user.email
      };
    }
    
    // If user is just a string ID
    return {
      id: member.user as string,
      email: '', // We don't have email info in this case
      name: '' // We don't have name info in this case
    };
  };

  // Generate initials for avatar
  const getInitials = (member: FlockMember): string => {
    const userInfo = getUserInfo(member);
    
    if (userInfo.name) {
      const nameParts = userInfo.name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
      }
      return userInfo.name.charAt(0).toUpperCase();
    }
    
    return userInfo.email.charAt(0).toUpperCase();
  };

  // Generate a consistent color based on email
  const getAvatarColor = (member: FlockMember): string => {
    const userInfo = getUserInfo(member);
    const email = userInfo.email || 'unknown';
    
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

  const handleOpenConfirmDialog = (member: FlockMember) => {
    setMemberToRemove(member);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  const handleConfirmRemove = () => {
    if (memberToRemove && onRemoveMember) {
      // Get the correct user ID
      const userInfo = getUserInfo(memberToRemove);
      onRemoveMember(userInfo.id);
    }
    setConfirmDialogOpen(false);
    setMemberToRemove(null);
  };

  if (!members || members.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No flock members found.</p>
      </div>
    );
  }

  // Sort members with admins first
  const sortedMembers = [...members].sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (a.role !== 'admin' && b.role === 'admin') return 1;
    return 0;
  });

  return (
    <>
      <div className="mb-4 flex items-center">
        <Users className="mr-2 text-primary" />
        <span className="text-lg font-medium">
          Total members: {members.length}
        </span>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="space-y-1 py-2">
            {sortedMembers.map((member, index) => {
              const userInfo = getUserInfo(member);
              const isAdmin = member.role === 'admin';
              const isCurrentUser = userInfo.id === currentUserId;
              
              return (
                <React.Fragment key={userInfo.id}>
                  {index > 0 && <Separator className="my-2" />}
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center space-x-4">
                      <Avatar className={`${isAdmin ? 'bg-primary' : getAvatarColor(member)}`}>
                        <AvatarFallback>
                          {isAdmin ? <ShieldCheck className="h-4 w-4" /> : getInitials(member)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">
                            {userInfo.name || userInfo.email || 'Unknown Member'}
                          </p>
                          {isCurrentUser && (
                            <Badge variant="secondary">You</Badge>
                          )}
                          <Badge variant={isAdmin ? "default" : "outline"} className="capitalize">
                            {member.role}
                          </Badge>
                        </div>
                        
                        {userInfo.email && (
                          <div className="flex items-center mt-1 text-sm text-muted-foreground">
                            <MailIcon className="h-3 w-3 mr-1" />
                            <span>{userInfo.email}</span>
                          </div>
                        )}
                        
                        {member.joinedAt && (
                          <div className="flex items-center mt-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Joined {format(new Date(member.joinedAt), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {isAdmin && !isCurrentUser && onRemoveMember && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleOpenConfirmDialog(member)}
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
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Flock Member</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The member will lose access to this flock.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {memberToRemove && (
              <p>
                Are you sure you want to remove{' '}
                <strong>
                  {getUserInfo(memberToRemove).name || getUserInfo(memberToRemove).email || 'this member'}
                </strong>{' '}
                from this flock?
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseConfirmDialog}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmRemove}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FlockMembersList;
