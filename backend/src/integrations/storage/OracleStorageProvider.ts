// Using require instead of import for oci-sdk
const oci = require('oci-sdk');
import { StorageProvider, UploadResult, FileDetails } from './StorageProvider';
import { logger } from '../../utils/logger';

// Type declarations for oci-sdk
declare namespace ociTypes {
  namespace objectstorage {
    class ObjectStorageClient {
      constructor(config: any);
      putObject(request: requests.PutObjectRequest): Promise<any>;
      deleteObject(request: requests.DeleteObjectRequest): Promise<any>;
      getObject(request: requests.GetObjectRequest): Promise<any>;
    }
    namespace requests {
      interface PutObjectRequest {
        namespaceName: string;
        bucketName: string;
        objectName: string;
        putObjectBody: Buffer;
        contentLength: number;
        contentType: string;
      }
      interface DeleteObjectRequest {
        namespaceName: string;
        bucketName: string;
        objectName: string;
      }
      interface GetObjectRequest {
        namespaceName: string;
        bucketName: string;
        objectName: string;
      }
    }
  }
  namespace common {
    class ConfigFileAuthenticationDetailsProvider {
      constructor();
    }
  }
}

interface OracleStorageConfig {
  tenancy: string;
  namespace: string;
  bucket: string;
  credentials: OracleCredentials;
}

/**
 * Oracle Cloud Infrastructure Object Storage implementation of the StorageProvider interface
 */
export class OracleStorageProvider implements StorageProvider {
  private client!: any; // Use any for the client type
  private config: OracleStorageConfig;

  /**
   * Constructor for OracleStorageProvider
   * @param config Configuration object for Oracle Cloud Storage
   */
  constructor(config: OracleStorageConfig) {
    this.config = config;
    this.initializeClient();
  }

  private initializeClient() {
    try {
      // Create authentication provider
      const provider = new oci.common.ConfigFileAuthenticationDetailsProvider();
      
      // Set configuration file path if provided
      if (this.config.credentials.configFilePath) {
        // Use directly, without property that doesn't exist
        // Adjust based on actual SDK
        // Skip this if the property doesn't exist
      }
      
      // Set profile if provided
      if (this.config.credentials.profile) {
        // Use directly, without property that doesn't exist
        // Adjust based on actual SDK
        // Skip this if the property doesn't exist
      }
      
      // Create client
      this.client = new oci.objectstorage.ObjectStorageClient({
        authenticationDetailsProvider: provider
      });
      
      logger.info('Oracle Cloud Storage client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Oracle Cloud Storage client:', error);
      throw error;
    }
  }

  /**
   * Upload a file to Oracle Cloud Object Storage
   * @param file The file buffer to upload
   * @param filename The storage key for the file
   * @param mimetype The MIME type of the file
   * @returns A Promise resolving to the file URL
   */
  async uploadFile(
    file: Buffer, 
    filename: string, 
    mimetype: string
  ): Promise<UploadResult> {
    try {
      // Create put object request
      const putObjectRequest = {
        namespaceName: this.config.namespace,
        bucketName: this.config.bucket,
        objectName: filename,
        putObjectBody: file,
        contentLength: file.length,
        contentType: mimetype
      };
      
      // Upload file
      await this.client.putObject(putObjectRequest);
      
      // Return URL
      const url = this.getFileUrl(filename);
      
      logger.info(`Uploaded file to Oracle Cloud Storage: ${filename}`);
      
      return {
        url,
        key: filename,
        provider: 'oracle'
      };
    } catch (error) {
      logger.error(`Error uploading file to Oracle Cloud Storage: ${filename}`, error);
      throw error;
    }
  }

  /**
   * Delete a file from Oracle Cloud Object Storage
   * @param filename The storage key of the file to delete
   * @returns A Promise resolving to boolean indicating success
   */
  async deleteFile(filename: string): Promise<boolean> {
    try {
      // Create delete object request
      const deleteObjectRequest = {
        namespaceName: this.config.namespace,
        bucketName: this.config.bucket,
        objectName: filename
      };
      
      // Delete file
      await this.client.deleteObject(deleteObjectRequest);
      
      logger.info(`Deleted file from Oracle Cloud Storage: ${filename}`);
      
      return true;
    } catch (error) {
      logger.error(`Error deleting file from Oracle Cloud Storage: ${filename}`, error);
      throw error;
    }
  }

  /**
   * Get a file from Oracle Cloud Object Storage
   * @param filename The storage key of the file to get
   * @returns A Promise resolving to the file buffer
   */
  async getFileDetails(filename: string): Promise<FileDetails> {
    try {
      // Create get object request
      const getObjectRequest = {
        namespaceName: this.config.namespace,
        bucketName: this.config.bucket,
        objectName: filename
      };
      
      // Get file
      const response = await this.client.getObject(getObjectRequest);
      
      return {
        contentType: response.contentType || 'application/octet-stream',
        contentLength: Number(response.contentLength) || 0,
        url: this.getFileUrl(filename)
      };
    } catch (error) {
      logger.error(`Error getting file details from Oracle Cloud Storage: ${filename}`, error);
      throw error;
    }
  }

  async getFileStream(filename: string): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        // Create get object request
        const getObjectRequest = {
          namespaceName: this.config.namespace,
          bucketName: this.config.bucket,
          objectName: filename
        };
        
        // Get file
        const response = await this.client.getObject(getObjectRequest);
        
        if (response && response.value) {
          // Handle both NodeJS Readable and Web ReadableStream
          if (typeof response.value.on === 'function') {
            // Node.js Readable stream
            const chunks: Buffer[] = [];
            
            // Stream the response body
            response.value.on('data', (chunk: Buffer) => {
              chunks.push(chunk);
            });
            
            response.value.on('end', () => {
              const buffer = Buffer.concat(chunks);
              resolve(buffer);
            });
            
            response.value.on('error', (err: Error) => {
              reject(err);
            });
          } else {
            // Web ReadableStream or other stream type
            // Use a more compatible approach
            const reader = response.value.getReader ? response.value.getReader() : null;
            if (reader) {
              const chunks: Uint8Array[] = [];
              
              const processChunks = async () => {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  chunks.push(value);
                }
                const buffer = Buffer.concat(chunks);
                resolve(buffer);
              };
              
              processChunks().catch(reject);
            } else {
              reject(new Error('Unsupported stream type'));
            }
          }
        } else {
          reject(new Error('No response value from OCI'));
        }
      } catch (error) {
        logger.error(`Error getting file stream from Oracle Cloud Storage: ${filename}`, error);
        reject(error);
      }
    });
  }

  private getFileUrl(filename: string): string {
    return `https://objectstorage.${this.config.credentials.region}.oraclecloud.com/n/${this.config.namespace}/b/${this.config.bucket}/o/${encodeURIComponent(filename)}`;
  }
}

interface OracleCredentials {
  region?: string;
  configFilePath?: string;
  profile?: string;
} 