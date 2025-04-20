import AWS from 'aws-sdk';
import { StorageProvider, StorageConfig } from './StorageProvider';
import { logger } from '../../utils/logger';

/**
 * AWS S3 implementation of the StorageProvider interface
 */
export class S3StorageProvider implements StorageProvider {
  private s3: AWS.S3;
  private bucket: string;
  private region: string;
  private baseUrl?: string;

  /**
   * Constructor for S3StorageProvider
   * @param config Configuration object for S3
   */
  constructor(config: StorageConfig) {
    this.bucket = config.bucket || process.env.AWS_S3_BUCKET || '';
    this.region = config.region || process.env.AWS_REGION || 'us-east-1';
    this.baseUrl = config.baseUrl;

    if (!this.bucket) {
      throw new Error('S3 bucket name is required');
    }

    // Initialize S3 client
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || config.credentials?.accessKeyId,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || config.credentials?.secretAccessKey,
      region: this.region
    });
  }

  /**
   * Upload a file to S3
   * @param buffer The file buffer to upload
   * @param key The S3 key for the file
   * @param contentType The MIME type of the file
   * @returns A Promise resolving to the file URL
   */
  async uploadFile(buffer: Buffer, key: string, contentType: string): Promise<string> {
    try {
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType
      };
      
      await this.s3.upload(params).promise();
      
      // Return the URL to the uploaded file
      if (this.baseUrl) {
        return `${this.baseUrl}/${key}`;
      }
      return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    } catch (error) {
      logger.error(`Error uploading file to S3 with key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete a file from S3
   * @param key The S3 key of the file to delete
   * @returns A Promise resolving to boolean indicating success
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      const params: AWS.S3.DeleteObjectRequest = {
        Bucket: this.bucket,
        Key: key
      };
      
      await this.s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      logger.error(`Error deleting file from S3 with key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a file from S3
   * @param key The S3 key of the file to get
   * @returns A Promise resolving to the file buffer
   */
  async getFile(key: string): Promise<Buffer | null> {
    try {
      const params: AWS.S3.GetObjectRequest = {
        Bucket: this.bucket,
        Key: key
      };
      
      const response = await this.s3.getObject(params).promise();
      
      if (response.Body) {
        return response.Body as Buffer;
      }
      return null;
    } catch (error) {
      // If file doesn't exist, return null instead of throwing
      if ((error as AWS.AWSError).code === 'NoSuchKey') {
        return null;
      }
      logger.error(`Error getting file from S3 with key ${key}:`, error);
      throw error;
    }
  }
} 