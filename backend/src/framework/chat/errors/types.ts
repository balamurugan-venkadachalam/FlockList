/**
 * Chat service specific error types
 *
 */

/**
 * Base error for chat service
 */
export class ChatServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChatServiceError';
  }
}

/**
 * Error for provider initialization failures
 */
export class ProviderInitializationError extends ChatServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'ProviderInitializationError';
  }
}

/**
 * Error for API request failures
 */
export class ApiRequestError extends ChatServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/**
 * Error for session management issues
 */
export class SessionError extends ChatServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'SessionError';
  }
}

/**
 * Error for configuration issues
 */
export class ConfigurationError extends ChatServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}
