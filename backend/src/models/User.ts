import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface NotificationPreferences {
  inApp: {
    taskCreated: boolean;
    deadlineApproaching: boolean;
    taskCompleted: boolean;
    memberAdded: boolean;
    invitationAccepted: boolean;
  };
  email: {
    taskCreated: boolean;
    deadlineApproaching: boolean;
    taskCompleted: boolean;
    memberAdded: boolean;
    invitationAccepted: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'member';
  refreshToken?: string;
  googleId?: string;
  profilePicture?: string;
  notificationPreferences: NotificationPreferences;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      required: [true, 'Role is required'],
    },
    refreshToken: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationTokenExpires: {
      type: Date,
      default: null,
    },
    notificationPreferences: {
      inApp: {
        taskCreated: {
          type: Boolean,
          default: true,
        },
        deadlineApproaching: {
          type: Boolean,
          default: true,
        },
        taskCompleted: {
          type: Boolean,
          default: true,
        },
        memberAdded: {
          type: Boolean,
          default: true,
        },
        invitationAccepted: {
          type: Boolean,
          default: true,
        },
      },
      email: {
        taskCreated: {
          type: Boolean,
          default: true,
        },
        deadlineApproaching: {
          type: Boolean,
          default: true,
        },
        taskCompleted: {
          type: Boolean,
          default: true,
        },
        memberAdded: {
          type: Boolean,
          default: false,
        },
        invitationAccepted: {
          type: Boolean,
          default: false,
        },
      },
      frequency: {
        type: String,
        enum: ['immediate', 'daily', 'weekly'],
        default: 'immediate',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for frequently queried fields
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Remove password from JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

export const User = mongoose.model<IUser>('User', userSchema); 