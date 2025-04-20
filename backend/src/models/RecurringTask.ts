import mongoose, { Schema, Document } from 'mongoose';
import { ITask, TaskPriority, TaskCategory } from './Task';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface IRecurringTask extends Document {
  title: string;
  description?: string;
  priority: TaskPriority;
  frequency: RecurrenceFrequency;
  interval: number; // e.g., every 2 days, every 3 weeks
  daysOfWeek?: number[]; // 0-6, where 0 is Sunday (for weekly recurrence)
  dayOfMonth?: number; // 1-31 (for monthly recurrence)
  monthOfYear?: number; // 1-12 (for yearly recurrence)
  startDate: Date;
  endDate?: Date; // Optional end date
  occurrences?: number; // Optional number of occurrences
  flock: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  assignees: mongoose.Types.ObjectId[];
  category: TaskCategory;
  lastGenerated?: Date; // To track when tasks were last generated
  active: boolean; // To enable/disable the recurring pattern
  createdAt: Date;
  updatedAt: Date;
}

const recurringTaskSchema = new Schema<IRecurringTask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [100, 'Task title cannot be more than 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Task description cannot be more than 500 characters']
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid priority'
      },
      default: 'medium'
    },
    frequency: {
      type: String,
      enum: {
        values: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
        message: '{VALUE} is not a valid frequency'
      },
      required: [true, 'Recurrence frequency is required']
    },
    interval: {
      type: Number,
      required: [true, 'Recurrence interval is required'],
      min: [1, 'Interval must be at least 1']
    },
    daysOfWeek: {
      type: [Number],
      validate: {
        validator: function(days: number[]) {
          return days.every(day => day >= 0 && day <= 6);
        },
        message: 'Days of week must be between 0 and 6'
      }
    },
    dayOfMonth: {
      type: Number,
      min: [1, 'Day of month must be at least 1'],
      max: [31, 'Day of month cannot exceed 31']
    },
    monthOfYear: {
      type: Number,
      min: [1, 'Month must be at least 1'],
      max: [12, 'Month cannot exceed 12']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date
    },
    occurrences: {
      type: Number,
      min: [1, 'Occurrences must be at least 1']
    },
    flock: {
      type: Schema.Types.ObjectId,
      ref: 'Flock',
      required: [true, 'Flock is required']
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task creator is required']
    },
    assignees: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    category: {
      type: String,
      enum: {
        values: ['chore', 'homework', 'activity', 'other'],
        message: '{VALUE} is not a valid category'
      },
      default: 'other'
    },
    lastGenerated: {
      type: Date
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for improved query performance
recurringTaskSchema.index({ flock: 1, active: 1 });
recurringTaskSchema.index({ frequency: 1 });
recurringTaskSchema.index({ startDate: 1 });
recurringTaskSchema.index({ endDate: 1 });

export const RecurringTask = mongoose.model<IRecurringTask>('RecurringTask', recurringTaskSchema); 