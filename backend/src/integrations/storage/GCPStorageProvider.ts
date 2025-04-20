import { Storage, Bucket, File } from '@google-cloud/storage';
import { StorageProvider, StorageConfig } from './StorageProvider';
import { logger } from '../../utils/logger';

/**
 * Google Cloud Storage implementation of the StorageProvider interface
 */
export class GCPStorageProvider implements StorageProvider {
  private storage: Storage;
  private bucket: Bucket;
  private bucketName: string;
  private baseUrl?: string;

  /**
   * Constructor for GCPStorageProvider
   * @param config Configuration object for GCP
   */
  constructor(config: StorageConfig) {
    this.bucketName = config.bucket || process.env.GCP_BUCKET_NAME || '';
    this.baseUrl = config.baseUrl || process.env.GCP_STORAGE_BASE_URL;

    if (!this.bucketName) {
      throw new Error('GCP bucket name is required');
    }

    const credentials = config.credentials || {
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GCP_KEY_FILE_PATH,
    };

    // Initialize GCP Storage
    this.storage = new Storage({
      projectId: credentials.projectId as string,
      keyFilename: credentials.keyFilename as string,
    });

    this.bucket = this.storage.bucket(this.bucketName);
  }

  /**
   * Upload a file to GCP Storage
   * @param buffer The file buffer to upload
   * @param key The storage key for the file
   * @param contentType The MIME type of the file
   * @returns A Promise resolving to the file URL
   */
  async uploadFile(buffer: Buffer, key: string, contentType: string): Promise<string> {
    try {
      const file = this.bucket.file(key);
      
      // Upload the file with appropriate content type
      await file.save(buffer, {
        contentType,
        resumable: false
      });
      
      // Make the file publicly accessible
      await file.makePublic();
      
      // Return the URL to the uploaded file
      if (this.baseUrl) {
        return `${this.baseUrl}/${key}`;
      }
      
      // Standard GCP Storage URL format
      return `https://storage.googleapis.com/${this.bucketName}/${key}`;
    } catch (error) {
      logger.error(`Error uploading file to GCP with key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete a file from GCP Storage
   * @param key The storage key of the file to delete
   * @returns A Promise resolving to boolean indicating success
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      const file = this.bucket.file(key);
      
      // Check if file exists before attempting to delete
      const [exists] = await file.exists();
      
      if (!exists) {
        logger.warn(`File not found in GCP Storage for deletion: ${key}`);
        return true;
      }
      
      await file.delete();
      return true;
    } catch (error) {
      logger.error(`Error deleting file from GCP Storage with key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a file from GCP Storage
   * @param key The storage key of the file to get
   * @returns A Promise resolving to the file buffer
   */
  async getFile(key: string): Promise<Buffer | null> {
    try {
      const file = this.bucket.file(key);
      
      // Check if file exists
      const [exists] = await file.exists();
      
      if (!exists) {
        return null;
      }
      
      // Download the file
      const [buffer] = await file.download();
      return buffer;
    } catch (error) {
      logger.error(`Error getting file from GCP Storage with key ${key}:`, error);
      throw error;
    }
  }
} 