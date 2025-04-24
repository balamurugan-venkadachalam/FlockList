import { StorageProvider, StorageConfig } from './StorageProvider';
import { S3StorageProvider } from './S3StorageProvider';
import { LocalStorageProvider } from './LocalStorageProvider';
import { logger } from '../../utils/logger';

/**
 * Factory class for creating storage providers
 */
export class StorageFactory {
  /**
   * Create a storage provider based on the configuration
   * @param config Configuration for the storage provider
   * @returns An instance of a StorageProvider
   */
  static createProvider(config: StorageConfig): StorageProvider {
    logger.info(`Creating storage provider of type: ${config.providerType}`);
    
    switch (config.providerType) {
      case 's3':
        return new S3StorageProvider(config);
        
      case 'local':
        return new LocalStorageProvider(config);
        
      case 'gcp':
        try {
          // Dynamically import to avoid dependency issues if GCP SDK is not installed
          const { GCPStorageProvider } = require('./GCPStorageProvider');
          return new GCPStorageProvider(config);
        } catch (error) {
          logger.error('Failed to initialize GCP Storage Provider:', error);
          logger.warn('Make sure @google-cloud/storage is installed: npm install @google-cloud/storage');
          throw new Error('GCP Storage Provider initialization failed. See logs for details.');
        }
      
      // Oracle Storage Provider is no longer available
        
      // case 'azure':
      //   return new AzureBlobStorageProvider(config);
        
      default:
        logger.warn(`Unknown provider type: ${config.providerType}, falling back to local storage`);
        return new LocalStorageProvider(config);
    }
  }
  
  /**
   * Create a storage provider based on environment variables
   * @returns An instance of a StorageProvider
   */
  static createFromEnvironment(): StorageProvider {
    const providerType = process.env.STORAGE_TYPE || 'local';
    
    const config: StorageConfig = {
      providerType: providerType as 'local' | 's3' | 'azure' | 'gcp',
      bucket: process.env.AWS_S3_BUCKET || process.env.GCP_BUCKET_NAME,
      region: process.env.AWS_REGION || process.env.GCP_REGION,
      basePath: process.env.LOCAL_STORAGE_PATH,
      baseUrl: process.env.STORAGE_BASE_URL
    };
    
    // Add provider-specific credential details
    switch (providerType) {
      case 'gcp':
        config.credentials = {
          projectId: process.env.GCP_PROJECT_ID,
          keyFilename: process.env.GCP_KEY_FILE_PATH
        };
        break;
    }
    
    return this.createProvider(config);
  }
} 