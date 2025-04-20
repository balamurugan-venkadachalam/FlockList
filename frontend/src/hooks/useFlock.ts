import { useState, useCallback } from 'react';
import { Flock } from '../types/flock';
import { FlockResponse, getFlocks, createFlock, inviteMember, removeMember } from '../services/flockService';

export const useFlock = () => {
  const [flocks, setFlocks] = useState<Flock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFlocks();
      setFlocks(data);
    } catch (err) {
      setError('Failed to fetch flocks');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateFlock = useCallback(async (name: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createFlock(name);
      const newFlock = response.flock || response.family;
      
      if (!newFlock) {
        throw new Error('Failed to create flock: Invalid response format');
      }
      
      setFlocks(prev => [...prev, newFlock]);
      return response;
    } catch (err) {
      setError('Failed to create flock');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInviteMember = useCallback(async (flockId: string, email: string) => {
    try {
      setLoading(true);
      setError(null);
      await inviteMember(flockId, email);
      await fetchFlocks(); // Refresh flocks to get updated members
    } catch (err) {
      setError('Failed to invite member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFlocks]);

  const handleRemoveMember = useCallback(async (flockId: string, memberId: string) => {
    try {
      setLoading(true);
      setError(null);
      await removeMember(flockId, memberId);
      await fetchFlocks(); // Refresh flocks to get updated members
    } catch (err) {
      setError('Failed to remove member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFlocks]);

  return {
    flocks,
    loading,
    error,
    fetchFlocks,
    createFlock: handleCreateFlock,
    inviteMember: handleInviteMember,
    removeMember: handleRemoveMember,
  };
}; 