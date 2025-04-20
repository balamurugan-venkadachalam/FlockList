import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskComment extends Document {
  content: string;
  task: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskCommentSchema = new Schema<ITaskComment>(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot be more than 1000 characters']
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required'],
      index: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient comments lookup by task
taskCommentSchema.index({ task: 1, createdAt: -1 });

export const TaskComment = mongoose.model<ITaskComment>('TaskComment', taskCommentSchema); 