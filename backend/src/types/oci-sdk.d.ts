declare module 'oci-sdk' {
  namespace common {
    class ConfigFileAuthenticationDetailsProvider {
      constructor();
    }
  }

  namespace objectstorage {
    class ObjectStorageClient {
      constructor(options: { authenticationDetailsProvider: any });
      putObject(request: requests.PutObjectRequest): Promise<any>;
      getObject(request: requests.GetObjectRequest): Promise<any>;
      deleteObject(request: requests.DeleteObjectRequest): Promise<any>;
    }

    namespace requests {
      interface PutObjectRequest {
        namespaceName: string;
        bucketName: string;
        objectName: string;
        putObjectBody: Buffer;
        contentType?: string;
        contentLength?: number;
      }

      interface GetObjectRequest {
        namespaceName: string;
        bucketName: string;
        objectName: string;
      }

      interface DeleteObjectRequest {
        namespaceName: string;
        bucketName: string;
        objectName: string;
      }
    }
  }

  // Export namespace as a property of the module
  export const objectstorage: typeof objectstorage;
  export const common: typeof common;
} 