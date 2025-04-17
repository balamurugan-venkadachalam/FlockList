import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Typography, 
  Alert,
  Paper 
} from '@mui/material';
import { InviteMemberFormData } from '../../../types/family';

interface InviteMemberFormProps {
  familyId: string;
  onInviteMember: (familyId: string, data: InviteMemberFormData) => Promise<void>;
}

const InviteMemberForm: React.FC<InviteMemberFormProps> = ({ familyId, onInviteMember }) => {
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
      await onInviteMember(familyId, formData);
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
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Invite a Family Member
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
        />
        
        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <FormLabel component="legend">Member Role</FormLabel>
          <RadioGroup
            row
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <FormControlLabel 
              value="member" 
              control={<Radio />} 
              label="Regular Member" 
              disabled={loading}
            />
            <FormControlLabel 
              value="admin" 
              control={<Radio />} 
              label="Administrator" 
              disabled={loading}
            />
          </RadioGroup>
        </FormControl>
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading || !formData.email}
        >
          {loading ? 'Sending...' : 'Send Invitation'}
        </Button>
      </Box>
    </Paper>
  );
};

export default InviteMemberForm; 