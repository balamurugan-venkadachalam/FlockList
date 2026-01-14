import { taskHandlers } from './taskHandlers';
import { authHandlers } from './authHandlers';
import { notificationHandlers } from './notificationHandlers';
import { flockHandlers } from './flockHandlers';

/**
 * Combine all handlers from different resources
 * Each resource has its own file for better organization
 */
export const handlers = [
  ...taskHandlers,
  ...authHandlers,
  ...notificationHandlers,
  ...flockHandlers,
];

// Export all handlers for direct use in stories
export * from './taskHandlers';
export * from './authHandlers';
export * from './notificationHandlers';
export * from './flockHandlers';
