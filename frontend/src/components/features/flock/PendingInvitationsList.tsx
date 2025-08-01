// Rule applied: Write concise, technical TypeScript code with accurate examples
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Trash2, Clock } from 'lucide-react';

// Shadcn UI components
import { Card } from '@/components/ui/shadcn/card';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/shadcn/tooltip';

interface PendingInvitation {
  email: string;
  role: 'admin' | 'member';
  invitedBy: string;
  expiresAt: string;
}

interface PendingInvitationsListProps {
  invitations: PendingInvitation[];
  onCancelInvitation?: (email: string) => void;
}

const PendingInvitationsList: React.FC<PendingInvitationsListProps> = ({
  invitations,
  onCancelInvitation
}) => {
  if (!invitations || invitations.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">
          No pending invitations.
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <Card>
      <ul className="divide-y divide-border">
        {invitations.map((invitation) => (
          <li key={invitation.email} className="flex items-center justify-between p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{invitation.email}</span>
                <Badge 
                  variant={invitation.role === 'admin' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {invitation.role}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Clock className="h-3 w-3" />
                <span>Expires on {formatDate(invitation.expiresAt)}</span>
              </div>
            </div>
            {onCancelInvitation && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onCancelInvitation(invitation.email)}
                      aria-label="Cancel invitation"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cancel invitation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default PendingInvitationsList; 