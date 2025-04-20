import mongoose, { Schema, Document } from 'mongoose';
import { TaskStatus, TaskPriority, TaskCategory } from './Task';

export type ChangeType = 
  | 'created'
  | 'title_updated'
  | 'description_updated'
  | 'status_updated'
  | 'priority_updated'
  | 'due_date_updated'
  | 'assignees_updated'
  | 'category_updated'
  | 'comment_added'
  | 'attachment_added'
  | 'attachment_removed'
  | 'deleted';

export interface ITaskHistory extends Document {
  task: mongoose.Types.ObjectId;
  changeType: ChangeType;
  oldValue?: any;
  newValue?: any;
  changedBy: mongoose.Types.ObjectId;
  changedAt: Date;
}

const taskHistorySchema = new Schema<ITaskHistory>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required'],
      index: true
    },
    changeType: {
      type: String,
      enum: {
        values: [
          'created',
          'title_updated',
          'description_updated',
          'status_updated',
          'priority_updated',
          'due_date_updated',
          'assignees_updated',
          'category_updated',
          'comment_added',
          'attachment_added',
          'attachment_removed',
          'deleted'
        ],
        message: '{VALUE} is not a valid change type'
      },
      required: [true, 'Change type is required']
    },
    oldValue: {
      type: Schema.Types.Mixed
    },
    newValue: {
      type: Schema.Types.Mixed
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

// Compound index for efficient history lookup by task
taskHistorySchema.index({ task: 1, changedAt: -1 });

export const TaskHistory = mongoose.model<ITaskHistory>('TaskHistory', taskHistorySchema); 