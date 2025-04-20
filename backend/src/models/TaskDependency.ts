import mongoose, { Schema, Document } from 'mongoose';

export type DependencyType = 'blocking' | 'related';

export interface ITaskDependency extends Document {
  parentTask: mongoose.Types.ObjectId; // The task that must be completed first
  dependentTask: mongoose.Types.ObjectId; // The task that depends on the parent
  type: DependencyType;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskDependencySchema = new Schema<ITaskDependency>(
  {
    parentTask: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Parent task reference is required']
    },
    dependentTask: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Dependent task reference is required']
    },
    type: {
      type: String,
      enum: {
        values: ['blocking', 'related'],
        message: '{VALUE} is not a valid dependency type'
      },
      default: 'blocking'
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required']
    }
  },
  {
    timestamps: true
  }
);

// Create compound unique index to prevent duplicate dependencies
taskDependencySchema.index(
  { parentTask: 1, dependentTask: 1 }, 
  { unique: true }
);

// Create indices for efficient lookups
taskDependencySchema.index({ parentTask: 1 });
taskDependencySchema.index({ dependentTask: 1 });

// Create a pre-save hook to prevent circular dependencies
taskDependencySchema.pre('save', async function(next) {
  if (this.isNew) {
    const TaskDependency = mongoose.model<ITaskDependency>('TaskDependency');
    
    // Check if this would create a circular dependency
    const dependencyPath = await findDependencyPath(
      TaskDependency,
      this.dependentTask,
      this.parentTask
    );
    
    if (dependencyPath) {
      const error = new Error(
        'Circular dependency detected. This would create a dependency loop.'
      );
      return next(error);
    }
  }
  
  next();
});

// Helper function to detect circular dependencies
async function findDependencyPath(
  TaskDependencyModel: mongoose.Model<ITaskDependency>,
  startTaskId: mongoose.Types.ObjectId,
  targetTaskId: mongoose.Types.ObjectId,
  visited: Set<string> = new Set()
): Promise<boolean> {
  if (startTaskId.toString() === targetTaskId.toString()) {
    return true;
  }
  
  if (visited.has(startTaskId.toString())) {
    return false;
  }
  
  visited.add(startTaskId.toString());
  
  const dependencies = await TaskDependencyModel.find({
    parentTask: startTaskId
  });
  
  for (const dependency of dependencies) {
    if (await findDependencyPath(
      TaskDependencyModel,
      dependency.dependentTask,
      targetTaskId,
      visited
    )) {
      return true;
    }
  }
  
  return false;
}

export const TaskDependency = mongoose.model<ITaskDependency>('TaskDependency', taskDependencySchema); 