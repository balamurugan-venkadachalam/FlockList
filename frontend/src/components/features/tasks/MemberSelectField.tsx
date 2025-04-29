import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Typography,
  CircularProgress,
} from '@mui/material';
import { getFlockById } from '../../../services/flockService';
import { FlockMember as FlockMemberType } from '../../../types/flock';

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

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const newValue = event.target.value as string[];
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
    <FormControl fullWidth error={!!error} disabled={disabled || loading}>
      <InputLabel id="assignees-label">{label}</InputLabel>
      <Select
        labelId="assignees-label"
        id="assignees"
        name="assignees"
        multiple
        value={value}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((selectedId) => {
              const member = members.find(m => m.userId === selectedId);
              return (
                <Chip 
                  key={selectedId} 
                  label={member ? getMemberDisplayName(member) : selectedId} 
                  color={isCurrentUser(selectedId) ? "primary" : "default"}
                />
              );
            })}
          </Box>
        )}
      >
        {loading ? (
          <MenuItem disabled>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography>Loading flock members...</Typography>
            </Box>
          </MenuItem>
        ) : loadError ? (
          <MenuItem disabled>
            <Typography color="error">{loadError}</Typography>
          </MenuItem>
        ) : members.length === 0 ? (
          <MenuItem disabled>
            <Typography>No flock members found</Typography>
          </MenuItem>
        ) : (
          members.map((member) => (
            <MenuItem 
              key={member.userId} 
              value={member.userId}
              sx={{ 
                fontWeight: isCurrentUser(member.userId) ? 'bold' : 'normal',
                '&.Mui-selected': {
                  backgroundColor: theme => 
                    isCurrentUser(member.userId) ? 
                    theme.palette.primary.light + '33' : // Light transparency
                    theme.palette.action.selected
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <Typography>{getMemberDisplayName(member)}</Typography>
                {member.role && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {member.role === 'admin' ? 'Admin' : 'Member'}
                  </Typography>
                )}
                {isCurrentUser(member.userId) && (
                  <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                    (You)
                  </Typography>
                )}
              </Box>
            </MenuItem>
          ))
        )}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export default MemberSelectField; 