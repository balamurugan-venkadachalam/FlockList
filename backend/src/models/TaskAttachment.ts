import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskAttachment extends Document {
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  url: string;
  key: string; // S3 key or storage identifier
  task: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskAttachmentSchema = new Schema<ITaskAttachment>(
  {
    filename: {
      type: String,
      required: [true, 'Filename is required'],
      trim: true
    },
    originalFilename: {
      type: String,
      required: [true, 'Original filename is required'],
      trim: true
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required']
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size cannot be negative']
    },
    url: {
      type: String,
      required: [true, 'File URL is required']
    },
    key: {
      type: String,
      required: [true, 'Storage key is required']
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required'],
      index: true
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader reference is required']
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient attachment lookup by task
taskAttachmentSchema.index({ task: 1, createdAt: -1 });

export const TaskAttachment = mongoose.model<ITaskAttachment>('TaskAttachment', taskAttachmentSchema); 