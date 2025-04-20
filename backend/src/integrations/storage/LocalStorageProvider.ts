import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { StorageProvider, StorageConfig } from './StorageProvider';
import { logger } from '../../utils/logger';

// Promisify fs functions
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);
const readFileAsync = promisify(fs.readFile);
const mkdirAsync = promisify(fs.mkdir);

/**
 * Local file system implementation of the StorageProvider interface
 */
export class LocalStorageProvider implements StorageProvider {
  private basePath: string;
  private baseUrl: string;

  /**
   * Constructor for LocalStorageProvider
   * @param config Configuration object for local storage
   */
  constructor(config: StorageConfig) {
    this.basePath = config.basePath || process.env.LOCAL_STORAGE_PATH || path.join(process.cwd(), 'uploads');
    this.baseUrl = config.baseUrl || process.env.LOCAL_STORAGE_URL || '/api/attachments';
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  /**
   * Upload a file to local file system
   * @param buffer The file buffer to upload
   * @param key The key/filename for the file
   * @param contentType The MIME type of the file (not used for local storage)
   * @returns A Promise resolving to the file URL
   */
  async uploadFile(buffer: Buffer, key: string, contentType: string): Promise<string> {
    try {
      // Ensure any subdirectories in the key path exist
      const subDirPath = path.dirname(path.join(this.basePath, key));
      if (!fs.existsSync(subDirPath)) {
        await mkdirAsync(subDirPath, { recursive: true });
      }
      
      // Write the file
      const filePath = path.join(this.basePath, key);
      await writeFileAsync(filePath, buffer);
      
      // Return the URL
      return `${this.baseUrl}/${key}`;
    } catch (error) {
      logger.error(`Error saving file to local storage with key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete a file from local file system
   * @param key The key/filename of the file to delete
   * @returns A Promise resolving to boolean indicating success
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      const filePath = path.join(this.basePath, key);
      await unlinkAsync(filePath);
      return true;
    } catch (error) {
      // If file doesn't exist, log a warning and return true
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.warn(`File not found for deletion: ${key}`);
        return true;
      }
      logger.error(`Error deleting file from local storage with key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a file from local file system
   * @param key The key/filename of the file to get
   * @returns A Promise resolving to the file buffer
   */
  async getFile(key: string): Promise<Buffer | null> {
    try {
      const filePath = path.join(this.basePath, key);
      return await readFileAsync(filePath);
    } catch (error) {
      // If file doesn't exist, return null instead of throwing
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      logger.error(`Error reading file from local storage with key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get the absolute file path for a given key
   * @param key The key/filename
   * @returns The absolute file path
   */
  getFilePath(key: string): string {
    return path.join(this.basePath, key);
  }
} 