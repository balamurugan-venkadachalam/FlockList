import {
  scheduleRecurringTaskGeneration,
  scheduleHourlyRecurringTaskCheck
} from './recurringTasksCron';
import { logger } from '../utils/logger';

/**
 * Initialize all scheduled jobs
 */
export const initScheduledJobs = (): void => {
  try {
    logger.info('Initializing scheduled jobs...');
    
    // Schedule recurring task generation jobs
    scheduleRecurringTaskGeneration();
    scheduleHourlyRecurringTaskCheck();
    
    // Add other scheduled jobs here
    
    logger.info('All scheduled jobs initialized successfully');
  } catch (error) {
    logger.error('Error initializing scheduled jobs:', error);
  }
}; 