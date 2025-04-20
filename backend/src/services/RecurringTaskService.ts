import mongoose from 'mongoose';
import { RecurringTask, IRecurringTask } from '../models/RecurringTask';
import { Task, ITask } from '../models/Task';
import { logger } from '../utils/logger';
import { DateTime } from 'luxon';

class RecurringTaskService {
  /**
   * Create a new recurring task pattern
   */
  async createRecurringTask(data: Partial<IRecurringTask>): Promise<IRecurringTask> {
    try {
      const recurringTask = new RecurringTask(data);
      await recurringTask.save();
      
      // Generate the first instance immediately
      await this.generateNextInstance(recurringTask);
      
      return recurringTask;
    } catch (error) {
      logger.error('Error creating recurring task:', error);
      throw error;
    }
  }
  
  /**
   * Update a recurring task pattern
   */
  async updateRecurringTask(
    recurringTaskId: mongoose.Types.ObjectId,
    data: Partial<IRecurringTask>
  ): Promise<IRecurringTask | null> {
    try {
      const recurringTask = await RecurringTask.findByIdAndUpdate(
        recurringTaskId,
        data,
        { new: true, runValidators: true }
      );
      
      return recurringTask;
    } catch (error) {
      logger.error(`Error updating recurring task ${recurringTaskId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a recurring task pattern and optionally all generated tasks
   */
  async deleteRecurringTask(
    recurringTaskId: mongoose.Types.ObjectId,
    deleteGeneratedTasks = false
  ): Promise<boolean> {
    try {
      // Delete the recurring task pattern
      const result = await RecurringTask.findByIdAndDelete(recurringTaskId);
      
      if (!result) {
        return false;
      }
      
      // Optionally delete all tasks generated from this pattern
      if (deleteGeneratedTasks) {
        await Task.deleteMany({ recurringTaskId });
      } else {
        // Just detach the tasks from the recurring pattern
        await Task.updateMany(
          { recurringTaskId },
          { $unset: { recurringTaskId: 1 } }
        );
      }
      
      return true;
    } catch (error) {
      logger.error(`Error deleting recurring task ${recurringTaskId}:`, error);
      throw error;
    }
  }
  
  /**
   * Generate the next instance of a recurring task if needed
   */
  async generateNextInstance(recurringTask: IRecurringTask): Promise<ITask | null> {
    try {
      // If the recurring task is not active, don't generate anything
      if (!recurringTask.active) {
        return null;
      }
      
      // Check if we've reached the end date or max occurrences
      if (this.hasReachedEnd(recurringTask)) {
        // Deactivate the recurring pattern
        recurringTask.active = false;
        await recurringTask.save();
        return null;
      }
      
      // Calculate the next due date
      const nextDueDate = this.calculateNextDueDate(recurringTask);
      if (!nextDueDate) {
        return null;
      }
      
      // Create a new task instance
      const task = new Task({
        title: recurringTask.title,
        description: recurringTask.description,
        priority: recurringTask.priority,
        dueDate: nextDueDate.toJSDate(),
        createdBy: recurringTask.createdBy,
        flock: recurringTask.flock,
        assignees: recurringTask.assignees,
        category: recurringTask.category,
        recurringTaskId: recurringTask._id
      });
      
      await task.save();
      
      // Update the lastGenerated date on the recurring task
      recurringTask.lastGenerated = new Date();
      await recurringTask.save();
      
      return task;
    } catch (error) {
      logger.error(`Error generating task for recurring pattern ${recurringTask._id}:`, error);
      throw error;
    }
  }
  
  /**
   * Check if a recurring task has reached its end conditions
   */
  private hasReachedEnd(recurringTask: IRecurringTask): boolean {
    const now = new Date();
    
    // Check end date if it exists
    if (recurringTask.endDate && recurringTask.endDate < now) {
      return true;
    }
    
    // Check occurrences if specified
    if (recurringTask.occurrences) {
      // Count existing tasks generated from this pattern
      Task.countDocuments({ recurringTaskId: recurringTask._id })
        .then(count => {
          if (count >= (recurringTask.occurrences || 0)) {
            return true;
          }
        })
        .catch(error => {
          logger.error(`Error counting tasks for recurring pattern ${recurringTask._id}:`, error);
        });
    }
    
    return false;
  }
  
  /**
   * Calculate the next due date for a recurring task
   */
  private calculateNextDueDate(recurringTask: IRecurringTask): DateTime | null {
    let baseDate: DateTime;
    
    // If we've never generated a task, start from the startDate
    if (!recurringTask.lastGenerated) {
      baseDate = DateTime.fromJSDate(recurringTask.startDate);
    } else {
      // Otherwise, start from the last generated date
      baseDate = DateTime.fromJSDate(recurringTask.lastGenerated);
    }
    
    // Calculate the next date based on frequency
    let nextDate: DateTime;
    
    switch (recurringTask.frequency) {
      case 'daily':
        nextDate = baseDate.plus({ days: recurringTask.interval });
        break;
        
      case 'weekly':
        if (recurringTask.daysOfWeek && recurringTask.daysOfWeek.length > 0) {
          // Find the next occurrence based on specified days of week
          nextDate = this.findNextDayOfWeek(baseDate, recurringTask.daysOfWeek, recurringTask.interval);
        } else {
          // Simple weekly recurrence
          nextDate = baseDate.plus({ weeks: recurringTask.interval });
        }
        break;
        
      case 'monthly':
        if (recurringTask.dayOfMonth) {
          // Use specified day of month
          nextDate = this.findNextDayOfMonth(baseDate, recurringTask.dayOfMonth, recurringTask.interval);
        } else {
          // Simple monthly recurrence
          nextDate = baseDate.plus({ months: recurringTask.interval });
        }
        break;
        
      case 'yearly':
        if (recurringTask.dayOfMonth && recurringTask.monthOfYear) {
          // Use specified day and month
          nextDate = this.findNextYearlyDate(
            baseDate, 
            recurringTask.dayOfMonth, 
            recurringTask.monthOfYear,
            recurringTask.interval
          );
        } else {
          // Simple yearly recurrence
          nextDate = baseDate.plus({ years: recurringTask.interval });
        }
        break;
        
      case 'custom':
        // For custom, just add the specified interval in days
        nextDate = baseDate.plus({ days: recurringTask.interval });
        break;
        
      default:
        return null;
    }
    
    // Check if the calculated date exceeds the end date
    if (recurringTask.endDate && nextDate.toJSDate() > recurringTask.endDate) {
      return null;
    }
    
    return nextDate;
  }
  
  /**
   * Find the next occurrence of a specific day of the week
   */
  private findNextDayOfWeek(
    baseDate: DateTime, 
    daysOfWeek: number[], 
    intervalWeeks: number
  ): DateTime {
    // Sort days of week to ensure proper ordering
    const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
    
    // Find the first day of week that's after the base date
    const baseDayOfWeek = baseDate.weekday % 7; // Convert to 0-6 format where 0 is Sunday
    
    // Find the next day of week
    let nextDay = sortedDays.find(day => day > baseDayOfWeek);
    
    if (nextDay !== undefined) {
      // We found a day of week later in the current week
      return baseDate.plus({ days: nextDay - baseDayOfWeek });
    } else {
      // We need to go to the next interval of weeks and use the first specified day
      return baseDate.plus({ weeks: intervalWeeks }).startOf('week').plus({ days: sortedDays[0] });
    }
  }
  
  /**
   * Find the next occurrence of a specific day of the month
   */
  private findNextDayOfMonth(
    baseDate: DateTime, 
    dayOfMonth: number, 
    intervalMonths: number
  ): DateTime {
    const currentMonth = baseDate.month;
    const currentDay = baseDate.day;
    
    if (dayOfMonth > currentDay) {
      // The day is later in the current month
      return baseDate.set({ day: dayOfMonth });
    } else {
      // We need to go to the next interval of months
      return baseDate.plus({ months: intervalMonths }).set({ day: 1 }).set({ day: dayOfMonth });
    }
  }
  
  /**
   * Find the next occurrence of a specific day of a specific month
   */
  private findNextYearlyDate(
    baseDate: DateTime, 
    dayOfMonth: number, 
    monthOfYear: number,
    intervalYears: number
  ): DateTime {
    const currentMonth = baseDate.month;
    const currentDay = baseDate.day;
    
    if (
      monthOfYear > currentMonth || 
      (monthOfYear === currentMonth && dayOfMonth > currentDay)
    ) {
      // The date is later in the current year
      return baseDate.set({ month: monthOfYear, day: dayOfMonth });
    } else {
      // We need to go to the next interval of years
      return baseDate.plus({ years: intervalYears }).set({ month: monthOfYear, day: dayOfMonth });
    }
  }
  
  /**
   * Run scheduled job to generate tasks for all active recurring patterns
   */
  async generateAllDueRecurringTasks(): Promise<number> {
    try {
      const activePatterns = await RecurringTask.find({ active: true });
      let generatedCount = 0;
      
      for (const pattern of activePatterns) {
        const task = await this.generateNextInstance(pattern);
        if (task) {
          generatedCount++;
        }
      }
      
      logger.info(`Generated ${generatedCount} tasks from recurring patterns`);
      return generatedCount;
    } catch (error) {
      logger.error('Error generating recurring tasks:', error);
      throw error;
    }
  }
}

export const recurringTaskService = new RecurringTaskService(); 