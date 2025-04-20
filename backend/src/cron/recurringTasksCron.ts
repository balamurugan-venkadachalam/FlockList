import cron from 'node-cron';
import { recurringTaskService } from '../services/RecurringTaskService';
import { logger } from '../utils/logger';

/**
 * Schedule recurring task generation to run daily at midnight
 */
export const scheduleRecurringTaskGeneration = (): void => {
  // Schedule job to run at midnight (00:00) every day
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Running scheduled job: generating tasks from recurring patterns');
      
      const generatedCount = await recurringTaskService.generateAllDueRecurringTasks();
      
      logger.info(`Recurring task generation complete. Generated ${generatedCount} tasks.`);
    } catch (error) {
      logger.error('Error in recurring task generation job:', error);
    }
  });
  
  logger.info('Scheduled recurring task generation job (daily at midnight)');
};

/**
 * Schedule hourly check for recent recurring tasks
 * This handles cases where the server might have been down during the nightly job
 */
export const scheduleHourlyRecurringTaskCheck = (): void => {
  // Schedule job to run at the beginning of every hour
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Running hourly check for recurring tasks');
      
      const generatedCount = await recurringTaskService.generateAllDueRecurringTasks();
      
      if (generatedCount > 0) {
        logger.info(`Hourly check complete. Generated ${generatedCount} tasks.`);
      } else {
        logger.debug('Hourly check complete. No tasks needed to be generated.');
      }
    } catch (error) {
      logger.error('Error in hourly recurring task check:', error);
    }
  });
  
  logger.info('Scheduled hourly recurring task check');
}; 