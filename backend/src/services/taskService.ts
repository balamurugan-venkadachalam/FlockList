import { Task, TaskStatus, TaskPriority, TaskCategory } from '../models/Task';
import { Flock } from '../models/Flock';
import mongoose from 'mongoose';
import { AuthenticationError, ValidationError, NotFoundError, DatabaseError, AuthorizationError } from '../types/errors';

export interface CreateTaskParams {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  assignees?: string[];
  category?: TaskCategory;
  flockId: string;
  createdBy: string;
}

export interface UpdateTaskParams {
  taskId: string;
  updates: Partial<{
    title: string;
    description: string;
    dueDate: string;
    priority: TaskPriority;
    assignees: string[];
    category: TaskCategory;
    status: TaskStatus;
  }>;
  userId: string;
}

export interface GetTasksParams {
  userId: string;
  filters: {
    status?: TaskStatus | TaskStatus[];
    priority?: TaskPriority | TaskPriority[];
    category?: TaskCategory | TaskCategory[];
    assignee?: string;
    flockId?: string;
    dueDate?: string;
    dueBefore?: string;
    dueAfter?: string;
  };
}

export interface GetTaskByIdParams {
  taskId: string;
  userId: string;
}

export interface DeleteTaskParams {
  taskId: string;
  userId: string;
}

export interface UpdateTaskStatusParams {
  taskId: string;
  status: TaskStatus;
  userId: string;
}

export async function createTask(params: CreateTaskParams) {
  const { title, description, dueDate, priority, assignees, category, flockId, createdBy } = params;
  if (!title) throw new ValidationError('Title is required');
  if (!flockId) throw new ValidationError('Flock ID is required');
  const task = new Task({
    title,
    description,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    priority,
    createdBy,
    flock: flockId,
    assignees: assignees || [createdBy],
    category
  });
  await task.save();
  return task;
}

export async function getTasks(params: GetTasksParams) {
  const { userId, filters } = params;
  const query: any = {};
  if (filters.flockId) {
    query.flock = filters.flockId;
  } else {
    query.$or = [
      { assignees: userId },
      { createdBy: userId }
    ];
  }
  if (filters.status) {
    query.status = Array.isArray(filters.status) ? { $in: filters.status } : filters.status;
  }
  if (filters.priority) {
    query.priority = Array.isArray(filters.priority) ? { $in: filters.priority } : filters.priority;
  }
  if (filters.category) {
    query.category = Array.isArray(filters.category) ? { $in: filters.category } : filters.category;
  }
  if (filters.assignee) {
    query.assignees = filters.assignee;
  }
  if (filters.dueDate) {
    query.dueDate = { $eq: new Date(filters.dueDate) };
  }
  if (filters.dueBefore) {
    query.dueDate = { ...query.dueDate, $lte: new Date(filters.dueBefore) };
  }
  if (filters.dueAfter) {
    query.dueDate = { ...query.dueDate, $gte: new Date(filters.dueAfter) };
  }
  return Task.find(query);
}

export async function getTaskById(params: GetTaskByIdParams) {
  const { taskId, userId } = params;
  if (!mongoose.isValidObjectId(taskId)) throw new ValidationError('Invalid task ID format');
  const task = await Task.findById(taskId);
  if (!task) throw new NotFoundError('Task not found');
  if (
    !task.assignees.map((id: any) => id.toString()).includes(userId) &&
    task.createdBy.toString() !== userId
  ) {
    throw new AuthorizationError('Not authorized to view this task');
  }
  return task;
}

export async function updateTask(params: UpdateTaskParams) {
  const { taskId, updates, userId } = params;
  if (!mongoose.isValidObjectId(taskId)) throw new ValidationError('Invalid task ID format');
  const task = await Task.findById(taskId);
  if (!task) throw new NotFoundError('Task not found');
  if (task.createdBy.toString() !== userId) throw new AuthorizationError('Not authorized to update this task');
  Object.assign(task, updates);
  await task.save();
  return task;
}

export async function deleteTask(params: DeleteTaskParams) {
  const { taskId, userId } = params;
  if (!mongoose.isValidObjectId(taskId)) throw new ValidationError('Invalid task ID format');
  const task = await Task.findById(taskId);
  if (!task) throw new NotFoundError('Task not found');
  if (task.createdBy.toString() !== userId) throw new AuthorizationError('Not authorized to delete this task');
  await Task.findByIdAndDelete(taskId);
  return true;
}

export async function updateTaskStatus(params: UpdateTaskStatusParams) {
  const { taskId, status, userId } = params;
  if (!mongoose.isValidObjectId(taskId)) throw new ValidationError('Invalid task ID format');
  if (!status || !['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
    throw new ValidationError('Invalid status value');
  }
  const task = await Task.findById(taskId)
    .populate('createdBy', 'firstName lastName email')
    .populate('assignees', 'firstName lastName email')
    .populate('completedBy', 'firstName lastName email')
    .populate('flock', 'name _id');
  if (!task) throw new NotFoundError('Task not found');
  const userFlocks = await Flock.find({
    $or: [
      { members: new mongoose.Types.ObjectId(userId) },
      { createdBy: new mongoose.Types.ObjectId(userId) }
    ]
  }).select('_id');
  const userFlockIds = userFlocks.map(f => f._id.toString());
  const taskFlockId = task.flock._id.toString();
  const hasFlockAccess = userFlockIds.includes(taskFlockId);
  const userIsCreator = task.createdBy._id.toString() === userId;
  const userIsAssignee = task.assignees.some((assignee: any) => assignee._id.toString() === userId);
  if (!userIsAssignee && !userIsCreator && !hasFlockAccess) throw new AuthorizationError('Not authorized to update this task');
  if (status === 'completed' && task.status !== 'completed') {
    task.completedAt = new Date();
    task.completedBy = new mongoose.Types.ObjectId(userId);
  }
  if (status !== 'completed' && task.status === 'completed') {
    task.completedAt = undefined;
    task.completedBy = undefined;
  }
  task.status = status;
  await task.save();
  const updatedTask = await Task.findById(taskId)
    .populate('createdBy', 'firstName lastName email')
    .populate('assignees', 'firstName lastName email')
    .populate('completedBy', 'firstName lastName email')
    .populate('flock', 'name _id');
  return updatedTask;
}
