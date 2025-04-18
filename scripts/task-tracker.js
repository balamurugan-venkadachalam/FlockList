#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');

// Constants
const TASKS_JSON_PATH = path.join(__dirname, '../tasks/tasks.json');
const TASK_STATUS_MD_PATH = path.join(__dirname, '../TaskStatus.md');
const TASK_FILES_DIR = path.join(__dirname, '../tasks');

// Valid status values
const VALID_STATUSES = ['pending', 'in-progress', 'done'];

/**
 * Load tasks from tasks.json
 * @returns {Object} The tasks data object
 */
function loadTasks() {
  try {
    const tasksData = JSON.parse(fs.readFileSync(TASKS_JSON_PATH, 'utf8'));
    return tasksData;
  } catch (error) {
    console.error(`${colors.red}Error loading tasks: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Save tasks to tasks.json
 * @param {Object} tasksData The tasks data object to save
 */
function saveTasks(tasksData) {
  try {
    fs.writeFileSync(TASKS_JSON_PATH, JSON.stringify(tasksData, null, 2), 'utf8');
  } catch (error) {
    console.error(`${colors.red}Error saving tasks: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Find a task by ID in the tasks array
 * @param {Array} tasks Array of tasks
 * @param {number} taskId ID of the task to find
 * @returns {Object|null} The found task or null
 */
function findTask(tasks, taskId) {
  const id = parseInt(taskId, 10);
  return tasks.find(task => task.id === id) || null;
}

/**
 * Find a subtask by ID in the parent task
 * @param {Object} parentTask The parent task
 * @param {number} subtaskId ID of the subtask to find
 * @returns {Object|null} The found subtask or null
 */
function findSubtask(parentTask, subtaskId) {
  if (!parentTask.subtasks) return null;
  
  const id = parseInt(subtaskId, 10);
  return parentTask.subtasks.find(subtask => subtask.id === id) || null;
}

/**
 * Update task status in tasks.json
 * @param {number} taskId The task ID
 * @param {string} newStatus The new status
 * @returns {boolean} Success status
 */
function updateTaskJsonStatus(taskId, newStatus) {
  if (!VALID_STATUSES.includes(newStatus)) {
    console.error(`${colors.red}Invalid status. Use one of: ${VALID_STATUSES.join(', ')}${colors.reset}`);
    return false;
  }
  
  const tasksData = loadTasks();
  const task = findTask(tasksData, taskId);
  
  if (!task) {
    console.error(`${colors.red}Task with ID ${taskId} not found${colors.reset}`);
    return false;
  }
  
  // Update task status
  task.status = newStatus;
  saveTasks(tasksData);
  console.log(`${colors.green}Updated task ${taskId} status to "${newStatus}" in tasks.json${colors.reset}`);
  return true;
}

/**
 * Update subtask status in tasks.json
 * @param {number} taskId The parent task ID
 * @param {number} subtaskId The subtask ID
 * @param {string} newStatus The new status
 * @returns {boolean} Success status
 */
function updateSubtaskJsonStatus(taskId, subtaskId, newStatus) {
  if (!VALID_STATUSES.includes(newStatus)) {
    console.error(`${colors.red}Invalid status. Use one of: ${VALID_STATUSES.join(', ')}${colors.reset}`);
    return false;
  }
  
  const tasksData = loadTasks();
  const task = findTask(tasksData, taskId);
  
  if (!task) {
    console.error(`${colors.red}Task with ID ${taskId} not found${colors.reset}`);
    return false;
  }
  
  const subtask = findSubtask(task, subtaskId);
  if (!subtask) {
    console.error(`${colors.red}Subtask with ID ${subtaskId} not found in task ${taskId}${colors.reset}`);
    return false;
  }
  
  // Update subtask status
  subtask.status = newStatus;
  saveTasks(tasksData);
  console.log(`${colors.green}Updated subtask ${subtaskId} status to "${newStatus}" in tasks.json${colors.reset}`);
  
  // Auto-update task status based on subtasks
  if (task.subtasks && task.subtasks.length > 0) {
    const allDone = task.subtasks.every(st => st.status === 'done');
    const allPending = task.subtasks.every(st => st.status === 'pending');
    
    if (allDone && task.status !== 'done') {
      task.status = 'done';
      saveTasks(tasksData);
      console.log(`${colors.green}Auto-updated task ${taskId} status to "done" in tasks.json${colors.reset}`);
    } else if (!allPending && !allDone && task.status !== 'in-progress') {
      task.status = 'in-progress';
      saveTasks(tasksData);
      console.log(`${colors.green}Auto-updated task ${taskId} status to "in-progress" in tasks.json${colors.reset}`);
    }
  }
  
  return true;
}

/**
 * Update task status in task_NNN.txt file
 * @param {number} taskId The task ID
 * @param {string} newStatus The new status
 * @returns {boolean} Success status
 */
function updateTaskFileStatus(taskId, newStatus) {
  const taskFilePath = path.join(TASK_FILES_DIR, `task_${String(taskId).padStart(3, '0')}.txt`);
  
  if (!fs.existsSync(taskFilePath)) {
    console.error(`${colors.red}Task file not found: ${taskFilePath}${colors.reset}`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(taskFilePath, 'utf8');
    
    // Replace the status line in the text file
    content = content.replace(/^# Status:.*$/m, `# Status: ${newStatus}`);
    
    fs.writeFileSync(taskFilePath, content, 'utf8');
    console.log(`${colors.green}Updated task ${taskId} status to "${newStatus}" in ${path.basename(taskFilePath)}${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Error updating task file: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Update subtask status in task_NNN.txt file
 * @param {number} taskId The parent task ID
 * @param {number} subtaskId The subtask ID
 * @param {string} newStatus The new status
 * @returns {boolean} Success status
 */
function updateSubtaskFileStatus(taskId, subtaskId, newStatus) {
  const taskFilePath = path.join(TASK_FILES_DIR, `task_${String(taskId).padStart(3, '0')}.txt`);
  
  if (!fs.existsSync(taskFilePath)) {
    console.error(`${colors.red}Task file not found: ${taskFilePath}${colors.reset}`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(taskFilePath, 'utf8');
    
    // Find and replace the subtask status in the text file
    const subtaskRegex = new RegExp(`^## ${subtaskId}\\. .* \\[.*\\]$`, 'm');
    const subtaskMatch = content.match(subtaskRegex);
    
    if (!subtaskMatch) {
      console.error(`${colors.red}Subtask ${subtaskId} not found in task file${colors.reset}`);
      return false;
    }
    
    // Replace status in the subtask heading
    const updatedSubtaskLine = subtaskMatch[0].replace(/\[.*\]/, `[${newStatus}]`);
    content = content.replace(subtaskRegex, updatedSubtaskLine);
    
    fs.writeFileSync(taskFilePath, content, 'utf8');
    console.log(`${colors.green}Updated subtask ${subtaskId} status to "${newStatus}" in ${path.basename(taskFilePath)}${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Error updating subtask in file: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Update task status in TaskStatus.md
 * @param {number} taskId The task ID
 * @param {string} newStatus The new status
 * @returns {boolean} Success status
 */
function updateTaskStatusMd(taskId, newStatus) {
  if (!fs.existsSync(TASK_STATUS_MD_PATH)) {
    console.error(`${colors.red}TaskStatus.md not found${colors.reset}`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(TASK_STATUS_MD_PATH, 'utf8');
    
    // Find the task row in the table
    const taskRowRegex = new RegExp(`^\\| ${taskId} \\| .* \\| .* \\| .* \\| .*\\|$`, 'm');
    const taskRowMatch = content.match(taskRowRegex);
    
    if (!taskRowMatch) {
      console.error(`${colors.red}Task ${taskId} not found in TaskStatus.md${colors.reset}`);
      return false;
    }
    
    // Replace status in the task row
    const parts = taskRowMatch[0].split('|');
    parts[3] = ` ${newStatus} `;
    const updatedTaskRow = parts.join('|');
    content = content.replace(taskRowRegex, updatedTaskRow);
    
    fs.writeFileSync(TASK_STATUS_MD_PATH, content, 'utf8');
    console.log(`${colors.green}Updated task ${taskId} status to "${newStatus}" in TaskStatus.md${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Error updating TaskStatus.md: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Update subtask status in TaskStatus.md
 * @param {number} taskId The parent task ID
 * @param {number} subtaskId The subtask ID
 * @param {string} newStatus The new status
 * @returns {boolean} Success status
 */
function updateSubtaskStatusMd(taskId, subtaskId, newStatus) {
  if (!fs.existsSync(TASK_STATUS_MD_PATH)) {
    console.error(`${colors.red}TaskStatus.md not found${colors.reset}`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(TASK_STATUS_MD_PATH, 'utf8');
    
    // Find the subtask line
    const subtaskRegex = new RegExp(`^- \\[.\\] ${taskId}\\.${subtaskId} .*$`, 'm');
    const subtaskMatch = content.match(subtaskRegex);
    
    if (!subtaskMatch) {
      console.error(`${colors.red}Subtask ${taskId}.${subtaskId} not found in TaskStatus.md${colors.reset}`);
      return false;
    }
    
    // Replace the checkbox status
    let updatedSubtaskLine;
    if (newStatus === 'done') {
      updatedSubtaskLine = subtaskMatch[0].replace(/\[ \]/, '[x]');
    } else {
      updatedSubtaskLine = subtaskMatch[0].replace(/\[.\]/, '[ ]');
    }
    
    content = content.replace(subtaskRegex, updatedSubtaskLine);
    
    fs.writeFileSync(TASK_STATUS_MD_PATH, content, 'utf8');
    console.log(`${colors.green}Updated subtask ${taskId}.${subtaskId} checkbox in TaskStatus.md${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Error updating subtask in TaskStatus.md: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Update task status across all tracking files
 * @param {number} taskId The task ID
 * @param {string} newStatus The new status
 */
function updateTaskStatus(taskId, newStatus) {
  console.log(`${colors.blue}Updating task ${taskId} status to "${newStatus}"...${colors.reset}`);
  
  if (!VALID_STATUSES.includes(newStatus)) {
    console.error(`${colors.red}Invalid status. Use one of: ${VALID_STATUSES.join(', ')}${colors.reset}`);
    return;
  }
  
  // Update status in all tracking files
  const jsonUpdated = updateTaskJsonStatus(taskId, newStatus);
  const fileUpdated = updateTaskFileStatus(taskId, newStatus);
  const mdUpdated = updateTaskStatusMd(taskId, newStatus);
  
  if (jsonUpdated && fileUpdated && mdUpdated) {
    console.log(`${colors.green}Successfully updated task ${taskId} status to "${newStatus}" in all files${colors.reset}`);
  } else {
    console.log(`${colors.yellow}Task ${taskId} status update was partially successful${colors.reset}`);
  }
}

/**
 * Update subtask status across all tracking files
 * @param {number} taskId The parent task ID
 * @param {number} subtaskId The subtask ID
 * @param {string} newStatus The new status
 */
function updateSubtaskStatus(taskId, subtaskId, newStatus) {
  console.log(`${colors.blue}Updating subtask ${taskId}.${subtaskId} status to "${newStatus}"...${colors.reset}`);
  
  if (!VALID_STATUSES.includes(newStatus)) {
    console.error(`${colors.red}Invalid status. Use one of: ${VALID_STATUSES.join(', ')}${colors.reset}`);
    return;
  }
  
  // Update status in all tracking files
  const jsonUpdated = updateSubtaskJsonStatus(taskId, subtaskId, newStatus);
  const fileUpdated = updateSubtaskFileStatus(taskId, subtaskId, newStatus);
  const mdUpdated = updateSubtaskStatusMd(taskId, subtaskId, newStatus);
  
  if (jsonUpdated && fileUpdated && mdUpdated) {
    console.log(`${colors.green}Successfully updated subtask ${taskId}.${subtaskId} status to "${newStatus}" in all files${colors.reset}`);
  } else {
    console.log(`${colors.yellow}Subtask ${taskId}.${subtaskId} status update was partially successful${colors.reset}`);
  }
}

/**
 * Main function to parse command line arguments and execute appropriate action
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
${colors.cyan}Task Tracker - Update task status across all tracking files${colors.reset}

Usage:
  ${colors.yellow}task-tracker task <task_id> <status>${colors.reset}
    Update a task's status

  ${colors.yellow}task-tracker subtask <task_id> <subtask_id> <status>${colors.reset}
    Update a subtask's status

Valid status values: ${VALID_STATUSES.join(', ')}

Examples:
  ${colors.gray}task-tracker task 4 in-progress${colors.reset}
  ${colors.gray}task-tracker task 4 done${colors.reset}
  ${colors.gray}task-tracker subtask 4 1 in-progress${colors.reset}
  ${colors.gray}task-tracker subtask 4 1 done${colors.reset}
`);
    return;
  }
  
  const command = args[0];
  
  if (command === 'task' && args.length === 3) {
    const taskId = parseInt(args[1], 10);
    const status = args[2];
    
    if (isNaN(taskId)) {
      console.error(`${colors.red}Invalid task ID: ${args[1]}${colors.reset}`);
      return;
    }
    
    updateTaskStatus(taskId, status);
  } else if (command === 'subtask' && args.length === 4) {
    const taskId = parseInt(args[1], 10);
    const subtaskId = parseInt(args[2], 10);
    const status = args[3];
    
    if (isNaN(taskId) || isNaN(subtaskId)) {
      console.error(`${colors.red}Invalid task or subtask ID${colors.reset}`);
      return;
    }
    
    updateSubtaskStatus(taskId, subtaskId, status);
  } else {
    console.error(`${colors.red}Invalid command or arguments. Use --help for usage information.${colors.reset}`);
  }
}

// Execute the main function if this script is run directly
if (require.main === module) {
  main();
}

module.exports = {
  updateTaskStatus,
  updateSubtaskStatus,
  VALID_STATUSES
}; 