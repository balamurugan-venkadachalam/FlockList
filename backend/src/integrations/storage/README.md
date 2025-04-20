# Storage Provider Integrations

This directory contains the abstraction and implementations for file storage providers in the TaskMaster application.

## Overview

The storage system is designed to be modular and pluggable, allowing different storage backends to be used without changing the application logic. Currently, the following providers are implemented:

- **Local Storage**: Stores files on the local file system
- **Amazon S3**: Stores files in an Amazon S3 bucket
- **Google Cloud Storage**: Stores files in a Google Cloud Storage bucket
- **Oracle Cloud Storage**: Stores files in an Oracle Cloud Infrastructure Object Storage bucket

## Architecture

The storage system consists of:

1. **StorageProvider Interface**: Defines the contract that all storage providers must implement
2. **Storage Provider Implementations**: Classes that implement the StorageProvider interface
3. **StorageFactory**: A factory class that creates instances of storage providers based on configuration

## Usage

The `FileService` uses the `StorageFactory` to create a storage provider based on environment variables:

```typescript
import { StorageFactory } from '../integrations/storage';

// Create a storage provider
const storageProvider = StorageFactory.createFromEnvironment();

// Use the provider
const url = await storageProvider.uploadFile(buffer, key, contentType);
```

## Configuration

Storage providers are configured through environment variables:

### Common Configuration
- `STORAGE_TYPE`: The type of storage provider to use (`local`, `s3`, `gcp`, `oracle`, etc.)
- `STORAGE_BASE_URL`: Base URL for serving files (optional)

### Local Storage
- `LOCAL_STORAGE_PATH`: The path to store files locally

### Amazon S3 
- `AWS_S3_BUCKET`: The S3 bucket name
- `AWS_REGION`: The AWS region
- `AWS_ACCESS_KEY_ID`: The AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: The AWS secret access key

### Google Cloud Storage
- `GCP_BUCKET_NAME`: The GCP bucket name
- `GCP_PROJECT_ID`: The GCP project ID
- `GCP_KEY_FILE_PATH`: Path to the service account key file
- `GCP_REGION`: The GCP region
- `GCP_STORAGE_BASE_URL`: Custom base URL for GCP storage (optional)

### Oracle Cloud Storage
- `OCI_BUCKET_NAME`: The OCI bucket name
- `OCI_NAMESPACE`: The OCI namespace
- `OCI_REGION`: The OCI region
- `OCI_CONFIG_FILE_PATH`: Path to the OCI config file
- `OCI_PROFILE`: OCI profile name
- `OCI_STORAGE_BASE_URL`: Custom base URL for OCI storage (optional)

## Required Dependencies

Depending on the storage provider you use, you'll need to install additional dependencies:

```bash
# For AWS S3
npm install aws-sdk

# For Google Cloud Storage
npm install @google-cloud/storage

# For Oracle Cloud Storage
npm install oci-sdk
```

### Easy Installation Script

For convenience, we've included an installation script that can install the required dependencies for a specific provider:

```bash
# Navigate to the backend directory
cd backend

# Install dependencies for a specific provider (s3, gcp, oracle, azure)
./src/integrations/storage/install-dependencies.js s3

# Or install dependencies for all providers
./src/integrations/storage/install-dependencies.js all
```

## Implementing a New Provider

To implement a new storage provider:

1. Create a new file in this directory (e.g., `AzureBlobStorageProvider.ts`)
2. Implement the `StorageProvider` interface
3. Add the new provider to the `StorageFactory.createProvider` method
4. Update the `StorageConfig` interface with any new credential properties

Example:

```typescript
// AzureBlobStorageProvider.ts
import { StorageProvider, StorageConfig } from './StorageProvider';

export class AzureBlobStorageProvider implements StorageProvider {
  constructor(config: StorageConfig) {
    // Initialize Azure Blob Storage client
  }

  async uploadFile(buffer: Buffer, key: string, contentType: string): Promise<string> {
    // Implement upload logic
  }

  async deleteFile(key: string): Promise<boolean> {
    // Implement delete logic
  }
}
```

Then update the `StorageFactory`:

```typescript
// StorageFactory.ts
case 'azure':
  return new AzureBlobStorageProvider(config);
``` 