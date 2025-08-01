// Rule applied: Write concise, technical TypeScript code with accurate examples
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Flock } from '@/types/flock';
import { Link } from 'react-router-dom';

// Shadcn UI components
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/shadcn/badge';
import { Separator } from '@/components/ui/shadcn/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/shadcn/tooltip';

// Icons
import { 
  Users, 
  User, 
  CheckSquare, 
  Bell, 
  Calendar, 
  Plus, 
  ArrowRight,
  Mail,
  Clock
} from 'lucide-react';

interface FlockDashboardProps {
  flock: Flock;
  currentUserId: string;
}

const FlockDashboard: React.FC<FlockDashboardProps> = ({ flock, currentUserId }) => {
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  const adminCount = flock.members.filter(member => member.role === 'admin').length;
  const memberCount = flock.members.filter(member => member.role === 'member').length;
  const pendingInvitationsCount = flock.pendingInvitations.length;
  
  const isAdmin = flock.members.some(
    member => {
      // Handle both cases where member.user could be an object or just an ID
      const memberId = typeof member.user === 'object' 
        ? member.user?._id 
        : member.user;
      
      return memberId === currentUserId && member.role === 'admin';
    }
  );

  return (
    <div className="mb-8">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Flock Dashboard</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Created on {formatDate(flock.createdAt)}</span>
          </Badge>
        </CardHeader>
        
        <Separator className="mb-6" />
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Flock Statistics Cards */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-2">
                  <Users className="h-5 w-5 text-primary mr-2" />
                  <h3 className="text-lg font-semibold">Members</h3>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">
                    Total: <strong>{flock.members.length}</strong>
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {adminCount} Admin{adminCount !== 1 ? 's' : ''}
                    </Badge>
                    <Badge>
                      {memberCount} Member{memberCount !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                >
                  <Link 
                    to={`/flocks/${flock._id}`}
                    state={{ activeTab: 1 }}
                    className="flex items-center"
                  >
                    View Members
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-2">
                  <CheckSquare className="h-5 w-5 text-primary mr-2" />
                  <h3 className="text-lg font-semibold">Tasks</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Manage and track your flock's tasks
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                >
                  <Link 
                    to={`/tasks?flockId=${flock._id}`}
                    className="flex items-center"
                  >
                    View Tasks
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-2">
                  <Mail className="h-5 w-5 text-primary mr-2" />
                  <h3 className="text-lg font-semibold">Invitations</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {pendingInvitationsCount > 0 
                    ? `${pendingInvitationsCount} pending invitation${pendingInvitationsCount !== 1 ? 's' : ''}` 
                    : 'No pending invitations'}
                </p>
              </CardContent>
              {pendingInvitationsCount > 0 && (
                <CardFooter className="pt-0">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild
                  >
                    <Link 
                      to={`/flocks/${flock._id}`}
                      state={{ activeTab: 3 }}
                      className="flex items-center"
                    >
                      Manage Invitations
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations Section */}
      {pendingInvitationsCount > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Pending Invitations</CardTitle>
          </CardHeader>
          <Separator className="mb-4" />
          
          <CardContent>
            <ul className="space-y-4">
              {flock.pendingInvitations.slice(0, 3).map((invitation) => (
                <li key={invitation.email} className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Role: {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">
                      {invitation.expiresAt ? (
                        (() => {
                          try {
                            return `Expires: ${format(parseISO(invitation.expiresAt), 'MMM d, yyyy')}`;
                          } catch (error) {
                            return 'Expiration unknown';
                          }
                        })()
                      ) : 'Expiration unknown'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            
            {pendingInvitationsCount > 3 && (
              <div className="text-center mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                >
                  <Link 
                    to={`/flocks/${flock._id}`}
                    state={{ activeTab: 3 }}
                    className="flex items-center"
                  >
                    Manage Invitations
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <Separator className="mb-4" />
        
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {isAdmin && (
              <Card className="h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                  <Link 
                    to={`/flocks/${flock._id}`}
                    className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <User className="h-5 w-5 text-primary" />
                  </Link>
                  <p className="text-sm text-center">
                    Invite Member
                  </p>
                </CardContent>
              </Card>
            )}
            
            <Card className="h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                <Link 
                  to={`/tasks/create?flockId=${flock._id}`}
                  className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <Plus className="h-5 w-5 text-primary" />
                </Link>
                <p className="text-sm text-center">
                  Create Task
                </p>
              </CardContent>
            </Card>
            
            <Card className="h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-2 rounded-full bg-primary/10 opacity-50 cursor-not-allowed">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Coming soon</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <p className="text-sm text-center">
                  Add Event
                </p>
              </CardContent>
            </Card>
            
            <Card className="h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-2 rounded-full bg-primary/10 opacity-50 cursor-not-allowed">
                        <Bell className="h-5 w-5 text-primary" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Coming soon</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <p className="text-sm text-center">
                  Notifications
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlockDashboard; 