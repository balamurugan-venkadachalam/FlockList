import mongoose, { Document, Schema } from 'mongoose';

// Notification types
export type NotificationType = 
  | 'task_created' 
  | 'deadline_approaching' 
  | 'task_completed'
  | 'member_added'
  | 'invitation_accepted';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  content: string;
  relatedEntityId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
  markAsRead(): Promise<INotification>;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['task_created', 'deadline_approaching', 'task_completed', 'member_added', 'invitation_accepted'],
      required: [true, 'Notification type is required'],
    },
    content: {
      type: String,
      required: [true, 'Notification content is required'],
    },
    relatedEntityId: {
      type: Schema.Types.ObjectId,
      refPath: 'type',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: function() {
        // Default expiration: 30 days after creation
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date;
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for frequently queried fields
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic deletion

// Method to mark notification as read
notificationSchema.methods.markAsRead = async function(): Promise<INotification> {
  this.isRead = true;
  return this.save();
};

export const Notification = mongoose.model<INotification>('Notification', notificationSchema); 