import { StorageProvider, StorageConfig } from './StorageProvider';
import { logger } from '../../utils/logger';
import * as oci from 'oci-sdk';

/**
 * Oracle Cloud Infrastructure Object Storage implementation of the StorageProvider interface
 */
export class OracleStorageProvider implements StorageProvider {
  private client: oci.ObjectStorage.ObjectStorageClient;
  private namespace: string;
  private bucketName: string;
  private baseUrl?: string;

  /**
   * Constructor for OracleStorageProvider
   * @param config Configuration object for Oracle Cloud Storage
   */
  constructor(config: StorageConfig) {
    this.bucketName = config.bucket || process.env.OCI_BUCKET_NAME || '';
    this.namespace = config.credentials?.namespace as string || process.env.OCI_NAMESPACE || '';
    this.baseUrl = config.baseUrl || process.env.OCI_STORAGE_BASE_URL;

    if (!this.bucketName) {
      throw new Error('Oracle bucket name is required');
    }

    if (!this.namespace) {
      throw new Error('Oracle namespace is required');
    }

    // Initialize Oracle Cloud Object Storage Client
    const provider = new oci.common.ConfigFileAuthenticationDetailsProvider();
    
    // Allow for custom config if provided
    if (config.credentials?.configFilePath) {
      provider.configurationFilePath = config.credentials.configFilePath as string;
    }
    
    if (config.credentials?.profile) {
      provider.profile = config.credentials.profile as string;
    }
    
    this.client = new oci.ObjectStorage.ObjectStorageClient({
      authenticationDetailsProvider: provider
    });
  }

  /**
   * Upload a file to Oracle Cloud Object Storage
   * @param buffer The file buffer to upload
   * @param key The storage key for the file
   * @param contentType The MIME type of the file
   * @returns A Promise resolving to the file URL
   */
  async uploadFile(buffer: Buffer, key: string, contentType: string): Promise<string> {
    try {
      // Upload object
      const putObjectRequest: oci.ObjectStorage.requests.PutObjectRequest = {
        namespaceName: this.namespace,
        bucketName: this.bucketName,
        objectName: key,
        putObjectBody: buffer,
        contentType: contentType
      };
      
      await this.client.putObject(putObjectRequest);
      
      // Generate pre-authenticated request for read access (if needed)
      // This would typically be used for private buckets
      // For public buckets, we can just return the direct URL
      
      // Return the URL to the uploaded file
      if (this.baseUrl) {
        return `${this.baseUrl}/${key}`;
      }
      
      // Standard Oracle Cloud Object Storage URL format
      // Note: This assumes the bucket is public or you're using pre-authenticated URLs
      return `https://objectstorage.${process.env.OCI_REGION || 'us-phoenix-1'}.oraclecloud.com/n/${this.namespace}/b/${this.bucketName}/o/${key}`;
    } catch (error) {
      logger.error(`Error uploading file to Oracle Cloud with key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete a file from Oracle Cloud Object Storage
   * @param key The storage key of the file to delete
   * @returns A Promise resolving to boolean indicating success
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      // Create request to delete object
      const deleteObjectRequest: oci.ObjectStorage.requests.DeleteObjectRequest = {
        namespaceName: this.namespace,
        bucketName: this.bucketName,
        objectName: key
      };
      
      await this.client.deleteObject(deleteObjectRequest);
      return true;
    } catch (error) {
      // If the error is that the object doesn't exist, consider it a success
      if ((error as any).statusCode === 404) {
        logger.warn(`File not found in Oracle Cloud Storage for deletion: ${key}`);
        return true;
      }
      
      logger.error(`Error deleting file from Oracle Cloud Storage with key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a file from Oracle Cloud Object Storage
   * @param key The storage key of the file to get
   * @returns A Promise resolving to the file buffer
   */
  async getFile(key: string): Promise<Buffer | null> {
    try {
      // Create request to get object
      const getObjectRequest: oci.ObjectStorage.requests.GetObjectRequest = {
        namespaceName: this.namespace,
        bucketName: this.bucketName,
        objectName: key
      };
      
      const response = await this.client.getObject(getObjectRequest);
      
      if (response.value) {
        // Convert the response stream to a buffer
        return new Promise((resolve, reject) => {
          const chunks: Buffer[] = [];
          
          response.value.on('data', (chunk) => {
            chunks.push(Buffer.from(chunk));
          });
          
          response.value.on('end', () => {
            resolve(Buffer.concat(chunks));
          });
          
          response.value.on('error', (err) => {
            reject(err);
          });
        });
      }
      
      return null;
    } catch (error) {
      // If the error is that the object doesn't exist, return null
      if ((error as any).statusCode === 404) {
        return null;
      }
      
      logger.error(`Error getting file from Oracle Cloud Storage with key ${key}:`, error);
      throw error;
    }
  }
} 