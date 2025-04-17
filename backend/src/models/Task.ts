import mongoose, { Schema, Document } from 'mongoose';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'chore' | 'homework' | 'activity' | 'other';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  family: mongoose.Types.ObjectId;
  assignees: mongoose.Types.ObjectId[];
  category: TaskCategory;
  completedAt?: Date;
  completedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>({
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
  status: {
    type: String,
    enum: {
      values: ['pending', 'in-progress', 'completed', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: '{VALUE} is not a valid priority'
    },
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task creator is required']
  },
  family: {
    type: Schema.Types.ObjectId,
    ref: 'Family',
    required: [true, 'Family is required']
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
  completedAt: {
    type: Date
  },
  completedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for improved query performance
taskSchema.index({ family: 1, status: 1 });
taskSchema.index({ assignees: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ category: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema); 