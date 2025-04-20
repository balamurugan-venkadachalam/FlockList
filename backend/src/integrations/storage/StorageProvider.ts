import { Stream } from 'stream';

/**
 * Interface for file storage providers
 * Any storage implementation (S3, Azure, GCP, Local) should implement this interface
 */
export interface StorageProvider {
  /**
   * Upload a file to storage
   * @param buffer The file buffer to upload
   * @param key The storage key/path for the file
   * @param contentType The MIME type of the file
   * @returns A Promise resolving to the file URL
   */
  uploadFile(buffer: Buffer, key: string, contentType: string): Promise<string>;
  
  /**
   * Delete a file from storage
   * @param key The storage key/path of the file to delete
   * @returns A Promise resolving to boolean indicating success
   */
  deleteFile(key: string): Promise<boolean>;
  
  /**
   * Get a file from storage
   * @param key The storage key/path of the file to get
   * @returns A Promise resolving to the file buffer or a stream
   */
  getFile?(key: string): Promise<Buffer | Stream | null>;
}

/**
 * Configuration interface for storage providers
 */
export interface StorageConfig {
  providerType: 'local' | 's3' | 'azure' | 'gcp' | 'oracle';
  bucket?: string;
  region?: string;
  basePath?: string;
  baseUrl?: string;
  credentials?: {
    // AWS S3 credentials
    accessKeyId?: string;
    secretAccessKey?: string;
    
    // GCP credentials
    projectId?: string;
    keyFilename?: string;
    
    // Oracle Cloud credentials
    namespace?: string;
    configFilePath?: string;
    profile?: string;
    
    // Azure credentials
    connectionString?: string;
    accountName?: string;
    accountKey?: string;
    
    // Any other provider-specific credentials
    [key: string]: string | undefined;
  };
} 