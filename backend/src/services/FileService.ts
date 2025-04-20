import { v4 as uuidv4 } from 'uuid';
import { TaskAttachment, ITaskAttachment } from '../models/TaskAttachment';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';
import path from 'path';
import { StorageFactory, StorageProvider } from '../integrations/storage';

// Define a custom interface for multer files
interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
  fieldname: string;
  encoding: string;
}

class FileService {
  private storageProvider: StorageProvider;
  
  constructor() {
    // Create the appropriate storage provider based on environment variables
    this.storageProvider = StorageFactory.createFromEnvironment();
  }
  
  /**
   * Upload a file to storage
   */
  async uploadFile(
    file: MulterFile,
    taskId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<ITaskAttachment> {
    try {
      // Generate a unique filename to prevent collisions
      const fileExtension = path.extname(file.originalname);
      const filename = `${uuidv4()}${fileExtension}`;
      
      // Define the storage key
      const key = `tasks/${taskId}/attachments/${filename}`;
      
      // Upload the file using the storage provider
      const url = await this.storageProvider.uploadFile(
        file.buffer,
        key,
        file.mimetype
      );
      
      // Create and save the attachment record
      const attachment = new TaskAttachment({
        filename,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url,
        key,
        task: taskId,
        uploadedBy: userId
      });
      
      await attachment.save();
      logger.info(`File uploaded: ${filename} for task ${taskId}`);
      
      return attachment;
    } catch (error) {
      logger.error(`Error uploading file for task ${taskId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a file from storage
   */
  async deleteFile(attachmentId: mongoose.Types.ObjectId): Promise<boolean> {
    try {
      const attachment = await TaskAttachment.findById(attachmentId);
      
      if (!attachment) {
        logger.warn(`Attachment not found: ${attachmentId}`);
        return false;
      }
      
      // Delete the file using the storage provider
      await this.storageProvider.deleteFile(attachment.key);
      
      // Delete the attachment record
      await TaskAttachment.findByIdAndDelete(attachmentId);
      logger.info(`File deleted: ${attachment.filename}`);
      
      return true;
    } catch (error) {
      logger.error(`Error deleting file ${attachmentId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get attachments for a task
   */
  async getTaskAttachments(
    taskId: mongoose.Types.ObjectId
  ): Promise<ITaskAttachment[]> {
    try {
      const attachments = await TaskAttachment.find({ task: taskId })
        .sort({ createdAt: -1 })
        .populate('uploadedBy', 'firstName lastName');
      
      return attachments;
    } catch (error) {
      logger.error(`Error fetching attachments for task ${taskId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get a file from storage
   */
  async getLocalFile(key: string): Promise<{ path: string; mimetype: string } | null> {
    try {
      const attachment = await TaskAttachment.findOne({ key });
      
      if (!attachment) {
        return null;
      }
      
      // For local storage provider, we need the file path
      if (this.storageProvider instanceof require('../integrations/storage/LocalStorageProvider').LocalStorageProvider) {
        const localProvider = this.storageProvider as any;
        
        return {
          path: localProvider.getFilePath(key),
          mimetype: attachment.mimeType
        };
      }
      
      // For other providers, we would need to download the file first, which
      // is not implemented here since the original implementation only handled local files
      logger.warn(`getLocalFile is only supported with LocalStorageProvider`);
      return null;
    } catch (error) {
      logger.error(`Error getting file ${key}:`, error);
      throw error;
    }
  }
}

export const fileService = new FileService(); 