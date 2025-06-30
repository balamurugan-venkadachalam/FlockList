import React, { useState } from 'react';
import { format, isValid, parseISO } from 'date-fns';

// Rule applied: Use Shadcn UI components
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardHeader } from '@/components/ui/shadcn/card';
import { Separator } from '@/components/ui/shadcn/separator';
import { Badge } from '@/components/ui/shadcn/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Rule applied: Use lucide-react icons instead of Material UI icons
import { CheckCircle, X, Users, Loader2 } from 'lucide-react';

interface Invitation {
  _id: string;
  flockId: string;
  flockName: string;
  invitedBy: {
    name?: string;
    email: string;
  };
  role: 'admin' | 'member';
  token: string;
  createdAt: string;
}

interface InvitationsListProps {
  invitations: Invitation[];
  onAcceptInvitation: (invitationId: string) => void;
  onDeclineInvitation: (invitationId: string) => void;
  isLoading?: boolean;
}

const InvitationsList: React.FC<InvitationsListProps> = ({
  invitations,
  onAcceptInvitation,
  onDeclineInvitation,
  isLoading = false
}) => {
  const [processingInvitationId, setProcessingInvitationId] = useState<string | null>(null);

  const handleAccept = (invitationId: string) => {
    setProcessingInvitationId(invitationId);
    onAcceptInvitation(invitationId);
    setProcessingInvitationId(null);
  };

  const handleDecline = (invitationId: string) => {
    setProcessingInvitationId(invitationId);
    onDeclineInvitation(invitationId);
    setProcessingInvitationId(null);
  };

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardContent className="p-6 flex justify-center">
          <div className="w-10 h-10 relative">
            <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!invitations || invitations.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Flock Invitations</h3>
          </div>
        </CardHeader>
        <Separator className="my-2" />
        <CardContent>
          <Alert>
            <AlertDescription>
              You don't have any pending flock invitations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Flock Invitations</h3>
        </div>
      </CardHeader>
      <Separator className="my-2" />
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          You have {invitations.length} pending invitation{invitations.length !== 1 ? 's' : ''}.
        </p>
        
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div 
              key={invitation._id}
              className="border rounded-md p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center flex-wrap gap-2">
                  <h4 className="font-medium">
                    {invitation.flockName}
                  </h4>
                  <Badge 
                    variant={invitation.role === 'admin' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {invitation.role}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Invited by {invitation.invitedBy?.name || invitation.invitedBy?.email || 'Unknown'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Sent on {formatDate(invitation.createdAt)}
                </p>
              </div>
              
              <div className="flex gap-2 self-end sm:self-center">
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleAccept(invitation._id)}
                  disabled={!!processingInvitationId}
                >
                  {processingInvitationId === invitation._id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  Accept
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => handleDecline(invitation._id)}
                  disabled={!!processingInvitationId}
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to safely format dates
const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy') : 'Unknown date';
  } catch (error) {
    return 'Unknown date';
  }
};

export default InvitationsList;