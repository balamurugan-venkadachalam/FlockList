import mongoose from 'mongoose';
import { Task, ITask } from '../models/Task';
import { Flock } from '../models/Flock';

/**
 * Check if a user is a member of the task's flock and can access the task
 */
export const checkTaskMemberAccess = async (
  task: ITask,
  userId: string
): Promise<boolean> => {
  try {
    // Check if user is an assignee
    if (task.assignees.some(assignee => assignee.toString() === userId)) {
      return true;
    }

    // Check if user is the task creator
    if (task.createdBy.toString() === userId) {
      return true;
    }

    // Check if user is a member of the flock
    const flock = await Flock.findById(task.flock);
    
    if (!flock) {
      return false;
    }

    // Check if user is a member or admin of the flock
    return flock.members.some(member => 
      member.user.toString() === userId
    );
  } catch (error) {
    console.error('Error checking task access:', error);
    return false;
  }
};

/**
 * Check if a user has admin access to a task (creator or flock admin)
 */
export const checkTaskAdminAccess = async (
  task: ITask,
  userId: string
): Promise<boolean> => {
  try {
    // Check if user is the task creator
    if (task.createdBy.toString() === userId) {
      return true;
    }

    // Check if user is an admin of the flock
    const flock = await Flock.findById(task.flock);
    
    if (!flock) {
      return false;
    }

    // Check if user is an admin of the flock
    return flock.members.some(member => 
      member.user.toString() === userId && member.role === 'admin'
    );
  } catch (error) {
    console.error('Error checking task admin access:', error);
    return false;
  }
};

/**
 * Check if a user can edit a task (creator, assignee, or flock admin)
 */
export const checkTaskEditAccess = async (
  task: ITask,
  userId: string
): Promise<boolean> => {
  try {
    // Check if user is the task creator
    if (task.createdBy.toString() === userId) {
      return true;
    }

    // Check if user is an assignee
    if (task.assignees.some(assignee => assignee.toString() === userId)) {
      return true;
    }

    // Check if user is an admin of the flock
    const flock = await Flock.findById(task.flock);
    
    if (!flock) {
      return false;
    }

    // Check if user is an admin of the flock
    return flock.members.some(member => 
      member.user.toString() === userId && member.role === 'admin'
    );
  } catch (error) {
    console.error('Error checking task edit access:', error);
    return false;
  }
}; 