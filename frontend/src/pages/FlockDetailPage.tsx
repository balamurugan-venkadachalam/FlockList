import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/shadcn/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useToast } from "@/components/ui/shadcn/toast-provider";
import { Button } from "@/components/ui/shadcn/button";
import { Loader2, ArrowLeft } from "lucide-react";

// Services
import { 
  getFlockById,
  inviteMember,
  removeMember,
  cancelInvitation
} from '../services/flockService';

// Types
import { InviteMemberFormData, Flock } from '../types/flock';

// Components
import FlockMembersList from '../components/features/flock/FlockMembersList';
import InviteMemberForm from '../components/features/flock/InviteMemberForm';
import FlockDashboard from '../components/features/flock/FlockDashboard';
import MemberManagement from '../components/features/flock/MemberManagement';
import FlockTaskList from '../components/features/tasks/FlockTaskList';

const FlockDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user, token } = useAuth();
  const { toast } = useToast();
  
  const [flock, setFlock] = useState<Flock | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // For tab navigation - using string-based tabs for Shadcn UI
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  
  // Read activeTab from location state if provided
  useEffect(() => {
    if (location.state && typeof location.state === 'object' && 'activeTab' in location.state) {
      const tabValue = location.state.activeTab;
      // Convert number to string if needed for backward compatibility
      if (typeof tabValue === 'number') {
        const tabMap: Record<number, string> = {
          0: "dashboard",
          1: "members",
          2: "tasks",
          3: "settings"
        };
        setActiveTab(tabMap[tabValue] || "dashboard");
      } else if (typeof tabValue === 'string') {
        setActiveTab(tabValue);
      }
    }
  }, [location.state]);

  // Handle tab change - updated for string-based tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Load flock data
  const loadFlock = async () => {
    if (!id) {
      setError('Flock ID is missing');
      setLoading(false);
      return;
    }
    
    if (!token) {
      // Will load when token is available (see useEffect)
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('Loading flock with ID:', id);
      const response = await getFlockById(id);
      
      // Extract flock data from the response
      const flockData = response.flock;
      
      if (!flockData) {
        throw new Error('Invalid response: Missing flock data');
      }
      
      // Convert API response to Flock by ensuring pendingInvitations is properly formatted
      const convertedFlock: Flock = {
        ...flockData,
        pendingInvitations: flockData.pendingInvitations?.map(inv => ({
          email: inv.email,
          role: inv.role,
          token: '', // Default empty token
          expiresAt: inv.invitedAt || ''
        })) || []
      };
      
      setFlock(convertedFlock);
    } catch (err: any) {
      setError(err.message || 'Failed to load flock details');
      console.error('Error loading flock:', err);
    } finally {
      setLoading(false);
    }
  };

  // Only load flock when authentication is complete and token is available
  useEffect(() => {
    if (token) {
      loadFlock();
    }
  }, [id, token]);

  // Handle invite member
  const handleInviteMember = async (flockId: string, data: InviteMemberFormData) => {
    try {
      setLoading(true);
      setError(null);
      await inviteMember(flockId, data);
      toast({
        title: "Success",
        description: `Invitation sent to ${data.email}`,
      });
      // Refresh flock data to update member list
      await loadFlock();
    } catch (error) {
      console.error('Error inviting member:', error);
      setError('Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!flock || !token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await removeMember(flock._id, memberId);
      toast({
        title: "Success",
        description: 'Member removed successfully'
      });
      await loadFlock(); // Reload flock to get updated data
    } catch (err: any) {
      setError(err.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvitation = async (email: string) => {
    if (!flock || !token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await cancelInvitation(flock._id, email);
      toast({
        title: "Success",
        description: `Invitation to ${email} cancelled`
      });
      await loadFlock(); // Reload flock to get updated data
    } catch (err: any) {
      setError(err.message || 'Failed to cancel invitation');
    } finally {
      setLoading(false);
    }
  };

  // Check if the current user is an admin of this flock
  const isAdmin = flock?.members.some(
    member => {
      // Handle both cases where member.user could be an object or just an ID
      const memberId = typeof member.user === 'object' 
        ? member.user?._id 
        : member.user;
      
      return memberId === user?._id && member.role === 'admin';
    }
  ) ?? false;

  return (
    <div className="container mx-auto px-4 py-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Show loading spinner while data is loading */}
      {loading && (
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Show error message if flock not found */}
      {!loading && !flock && !error && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <Alert variant="default" className="mb-4">
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>Flock not found or you don't have access.</AlertDescription>
            </Alert>
            <Button 
              asChild
              variant="outline"
              className="flex items-center gap-2"
            >
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Display flock data if available */}
      {flock && (
        <>
          <div className="flex items-center mb-6">
            <Button 
              asChild
              variant="outline"
              className="mr-4 flex items-center gap-2"
            >
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Breadcrumbs>
              <Link to="/dashboard" className="text-muted-foreground hover:text-primary">
                Dashboard
              </Link>
              <span className="font-medium">{flock.name}</span>
            </Breadcrumbs>
          </div>

          <Card className="mb-4">
            <CardContent className="pt-6">
              <Tabs 
                defaultValue={activeTab} 
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  {isAdmin && (
                    <TabsTrigger value="settings">Manage</TabsTrigger>
                  )}
                </TabsList>
                
                {/* Tab panels */}
                <TabsContent value="dashboard" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <FlockDashboard 
                        flock={flock}
                        currentUserId={user?._id || ''} 
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="members" className="mt-4">
                  <Card className="mb-4">
                    <CardContent className="pt-6">
                      {isAdmin && (
                        <div className="mb-6">
                          <InviteMemberForm
                            flockId={flock._id}
                            onInviteMember={handleInviteMember}
                          />
                        </div>
                      )}

                      <FlockMembersList
                        members={flock.members}
                        currentUserId={user?._id || ''}
                        isAdmin={isAdmin}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tasks" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <FlockTaskList
                        flockId={flock._id}
                        isAdmin={isAdmin}
                        currentUserId={user?._id || ''}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {isAdmin && (
                  <TabsContent value="settings" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <MemberManagement
                          flock={flock}
                          currentUserId={user?._id || ''}
                          onInviteMember={handleInviteMember}
                          onRemoveMember={handleRemoveMember}
                          onCancelInvitation={handleCancelInvitation}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default FlockDetailPage; 