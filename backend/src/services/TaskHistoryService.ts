import mongoose from 'mongoose';
import { TaskHistory, ITaskHistory, ChangeType } from '../models/TaskHistory';
import { ITask } from '../models/Task';
import { logger } from '../utils/logger';

class TaskHistoryService {
  /**
   * Record a change to a task
   */
  async recordChange(
    taskId: mongoose.Types.ObjectId,
    changeType: ChangeType,
    userId: mongoose.Types.ObjectId,
    oldValue?: any,
    newValue?: any
  ): Promise<ITaskHistory> {
    try {
      const historyEntry = new TaskHistory({
        task: taskId,
        changeType,
        changedBy: userId,
        oldValue,
        newValue,
        changedAt: new Date()
      });
      
      await historyEntry.save();
      logger.debug(`Recorded task history: ${changeType} for task ${taskId}`);
      
      return historyEntry;
    } catch (error) {
      logger.error(`Error recording task history for task ${taskId}:`, error);
      throw error;
    }
  }
  
  /**
   * Track changes between original and updated task
   */
  async trackTaskChanges(
    originalTask: ITask,
    updatedTask: ITask,
    userId: mongoose.Types.ObjectId
  ): Promise<ITaskHistory[]> {
    const historyEntries: ITaskHistory[] = [];
    
    try {
      // Track changes to title
      if (originalTask.title !== updatedTask.title) {
        const entry = await this.recordChange(
          originalTask._id,
          'title_updated',
          userId,
          originalTask.title,
          updatedTask.title
        );
        historyEntries.push(entry);
      }
      
      // Track changes to description
      if (originalTask.description !== updatedTask.description) {
        const entry = await this.recordChange(
          originalTask._id,
          'description_updated',
          userId,
          originalTask.description,
          updatedTask.description
        );
        historyEntries.push(entry);
      }
      
      // Track changes to status
      if (originalTask.status !== updatedTask.status) {
        const entry = await this.recordChange(
          originalTask._id,
          'status_updated',
          userId,
          originalTask.status,
          updatedTask.status
        );
        historyEntries.push(entry);
      }
      
      // Track changes to priority
      if (originalTask.priority !== updatedTask.priority) {
        const entry = await this.recordChange(
          originalTask._id,
          'priority_updated',
          userId,
          originalTask.priority,
          updatedTask.priority
        );
        historyEntries.push(entry);
      }
      
      // Track changes to due date
      const originalDueDate = originalTask.dueDate ? originalTask.dueDate.toISOString() : null;
      const updatedDueDate = updatedTask.dueDate ? updatedTask.dueDate.toISOString() : null;
      
      if (originalDueDate !== updatedDueDate) {
        const entry = await this.recordChange(
          originalTask._id,
          'due_date_updated',
          userId,
          originalDueDate,
          updatedDueDate
        );
        historyEntries.push(entry);
      }
      
      // Track changes to assignees (simplified - just recording the change, not the specific additions/removals)
      const originalAssigneeIds = originalTask.assignees.map(a => a.toString()).sort();
      const updatedAssigneeIds = updatedTask.assignees.map(a => a.toString()).sort();
      
      if (JSON.stringify(originalAssigneeIds) !== JSON.stringify(updatedAssigneeIds)) {
        const entry = await this.recordChange(
          originalTask._id,
          'assignees_updated',
          userId,
          originalAssigneeIds,
          updatedAssigneeIds
        );
        historyEntries.push(entry);
      }
      
      // Track changes to category
      if (originalTask.category !== updatedTask.category) {
        const entry = await this.recordChange(
          originalTask._id,
          'category_updated',
          userId,
          originalTask.category,
          updatedTask.category
        );
        historyEntries.push(entry);
      }
      
      return historyEntries;
    } catch (error) {
      logger.error(`Error tracking changes for task ${originalTask._id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get history entries for a task with pagination
   */
  async getTaskHistory(
    taskId: mongoose.Types.ObjectId,
    limit = 20,
    offset = 0
  ): Promise<ITaskHistory[]> {
    try {
      const history = await TaskHistory.find({ task: taskId })
        .sort({ changedAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate('changedBy', 'firstName lastName');
      
      return history;
    } catch (error) {
      logger.error(`Error fetching history for task ${taskId}:`, error);
      throw error;
    }
  }
  
  /**
   * Record the creation of a new task
   */
  async recordTaskCreation(
    task: ITask,
    userId: mongoose.Types.ObjectId
  ): Promise<ITaskHistory> {
    try {
      const taskData = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assignees: task.assignees.map(a => a.toString()),
        category: task.category
      };
      
      return await this.recordChange(
        task._id,
        'created',
        userId,
        null,
        taskData
      );
    } catch (error) {
      logger.error(`Error recording task creation for task ${task._id}:`, error);
      throw error;
    }
  }
  
  /**
   * Record a comment being added to a task
   */
  async recordCommentAdded(
    taskId: mongoose.Types.ObjectId,
    commentId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    commentText: string
  ): Promise<ITaskHistory> {
    try {
      return await this.recordChange(
        taskId,
        'comment_added',
        userId,
        null,
        {
          commentId: commentId.toString(),
          text: commentText
        }
      );
    } catch (error) {
      logger.error(`Error recording comment addition for task ${taskId}:`, error);
      throw error;
    }
  }
  
  /**
   * Record an attachment being added to a task
   */
  async recordAttachmentAdded(
    taskId: mongoose.Types.ObjectId,
    attachmentId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    fileName: string
  ): Promise<ITaskHistory> {
    try {
      return await this.recordChange(
        taskId,
        'attachment_added',
        userId,
        null,
        {
          attachmentId: attachmentId.toString(),
          fileName
        }
      );
    } catch (error) {
      logger.error(`Error recording attachment addition for task ${taskId}:`, error);
      throw error;
    }
  }
  
  /**
   * Record an attachment being removed from a task
   */
  async recordAttachmentRemoved(
    taskId: mongoose.Types.ObjectId,
    attachmentId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    fileName: string
  ): Promise<ITaskHistory> {
    try {
      return await this.recordChange(
        taskId,
        'attachment_removed',
        userId,
        {
          attachmentId: attachmentId.toString(),
          fileName
        },
        null
      );
    } catch (error) {
      logger.error(`Error recording attachment removal for task ${taskId}:`, error);
      throw error;
    }
  }
  
  /**
   * Record a task being deleted
   */
  async recordTaskDeleted(
    taskId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    taskData: Partial<ITask>
  ): Promise<ITaskHistory> {
    try {
      return await this.recordChange(
        taskId,
        'deleted',
        userId,
        taskData,
        null
      );
    } catch (error) {
      logger.error(`Error recording task deletion for task ${taskId}:`, error);
      throw error;
    }
  }
}

export const taskHistoryService = new TaskHistoryService(); 