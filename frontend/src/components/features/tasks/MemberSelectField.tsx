import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { getFlockById } from '@/services/flockService';
import { FlockMember as FlockMemberType } from '@/types/flock';
import { cn } from '@/lib/utils';

// Shadcn UI components
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/shadcn/popover';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

// Extended interface for flock members with user information and a consistent userId
interface MemberWithUser extends Omit<FlockMemberType, 'user'> {
  userId: string;
  firstName?: string;
  lastName?: string;
  email: string;
  name?: string;
  role: 'admin' | 'member';
}

export interface MemberSelectFieldProps {
  flockId: string;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
  currentUserId?: string;
  label?: string;
}

const MemberSelectField: React.FC<MemberSelectFieldProps> = ({
  flockId,
  value,
  onChange,
  error,
  disabled = false,
  currentUserId,
  label = 'Assign To'
}) => {
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Load flock members when flockId changes
  useEffect(() => {
    const loadFlockMembers = async (): Promise<void> => {
      if (!flockId) return;
      
      try {
        setLoading(true);
        setLoadError(null);
        const response = await getFlockById(flockId);
        
        if (response.flock && Array.isArray(response.flock.members)) {
          // Get flock members and sort by role (admins first, then members)
          const sortedMembers = [...response.flock.members]
            .sort((a, b) => {
              if (a.role === 'admin' && b.role !== 'admin') return -1;
              if (a.role !== 'admin' && b.role === 'admin') return 1;
              return 0;
            })
            .map(member => {
              let userId = member.user._id;
              let firstName = member.user.firstName;
              let lastName = member.user.lastName;
              let email = member.user.email || '';
              return {
                ...member,
                userId,
                firstName,
                lastName,
                email,
                name: firstName && lastName ? `${firstName} ${lastName}` : undefined
              };
            });
          
          setMembers(sortedMembers);
          
          // If value is empty and current user exists, auto-select current user
          if (value.length === 0 && currentUserId) {
            onChange([currentUserId]);
          }
        } else {
          // Handle case where members array is missing or not an array
          console.warn('Flock members missing or invalid format:', response.flock);
          setMembers([]);
        }
      } catch (err) {
        console.error('Error loading flock members:', err);
        setLoadError(typeof err === 'object' && err !== null && 'message' in err 
          ? String(err.message) 
          : 'Failed to load flock members');
      } finally {
        setLoading(false);
      }
    };

    loadFlockMembers();
  }, [flockId, onChange, currentUserId, value]);

  // Handle selection of a member
  const handleSelect = (memberId: string) => {
    const newValue = value.includes(memberId)
      ? value.filter(id => id !== memberId) // Remove if already selected
      : [...value, memberId]; // Add if not selected
    
    onChange(newValue);
  };

  // Generate display name for a member
  const getMemberDisplayName = (member: MemberWithUser): string => {
    if (member.firstName && member.lastName) {
      return `${member.firstName} ${member.lastName}`;
    } else if (member.firstName) {
      return member.firstName;
    } else if (member.lastName) {
      return member.lastName;
    } else if (member.name) {
      return member.name;
    } else if (member.email && member.email.length > 0) {
      return member.email;
    } else {
      return `User ${member.userId.substring(0, 8)}`;
    }
  };

  // Highlight if member is the current user
  const isCurrentUser = (memberId: string): boolean => {
    return currentUserId === memberId;
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <FormItem>
        {label && (
          <FormLabel className={cn(error && "text-destructive")}>{label}</FormLabel>
        )}
        <FormControl>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                aria-label={label}
                className={cn(
                  "w-full justify-between",
                  disabled && "opacity-50 cursor-not-allowed",
                  error && "border-destructive focus-visible:ring-destructive"
                )}
                disabled={disabled || loading}
                onClick={() => setOpen(!open)}
              >
                {value.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mr-2 max-w-[90%] overflow-hidden">
                    {value.map((selectedId) => {
                      const member = members.find(m => m.userId === selectedId);
                      const displayName = member ? getMemberDisplayName(member) : selectedId;
                      return (
                        <Badge 
                          key={selectedId} 
                          variant={isCurrentUser(selectedId) ? "default" : "outline"}
                          className="truncate max-w-[150px]"
                        >
                          {displayName}
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Select members</span>
                )}
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                ) : (
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search members..." />
                <CommandList>
                  <CommandEmpty>
                    {loadError ? (
                      <p className="p-2 text-sm text-destructive">{loadError}</p>
                    ) : (
                      <p className="p-2 text-sm">No members found</p>
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {members.length === 0 && !loading && !loadError ? (
                      <CommandItem disabled>
                        <span>No flock members found</span>
                      </CommandItem>
                    ) : (
                      members.map((member) => {
                        const isSelected = value.includes(member.userId);
                        const displayName = getMemberDisplayName(member);
                        const isUser = isCurrentUser(member.userId);
                        
                        return (
                          <CommandItem
                            key={member.userId}
                            value={displayName}
                            onSelect={() => handleSelect(member.userId)}
                            className={cn(
                              "flex items-center justify-between",
                              isUser && "font-medium",
                              isSelected && "bg-accent"
                            )}
                            disabled={disabled}
                          >
                            <div className="flex items-center">
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <span>{displayName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {member.role && (
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs",
                                    member.role === 'admin' ? "bg-blue-50" : "bg-gray-50"
                                  )}
                                >
                                  {member.role === 'admin' ? 'Admin' : 'Member'}
                                </Badge>
                              )}
                              {isUser && (
                                <Badge variant="secondary" className="text-xs">
                                  You
                                </Badge>
                              )}
                            </div>
                          </CommandItem>
                        );
                      })
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </FormControl>
        {error && <FormMessage>{error}</FormMessage>}
      </FormItem>
    </div>
  );
};

export default MemberSelectField; 