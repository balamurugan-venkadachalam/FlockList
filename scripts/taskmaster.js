#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const TASKS_DIR = path.join(__dirname, '..', 'tasks');
const TASKS_JSON = path.join(TASKS_DIR, 'tasks.json');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Helper functions
function loadTasks() {
  try {
    const data = fs.readFileSync(TASKS_JSON, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`${colors.red}Error loading tasks:${colors.reset}`, error.message);
    return [];
  }
}

function saveTasks(tasks) {
  try {
    fs.writeFileSync(TASKS_JSON, JSON.stringify(tasks, null, 2), 'utf8');
    console.log(`${colors.green}Tasks saved successfully!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error saving tasks:${colors.reset}`, error.message);
  }
}

// Command handlers
function listTasks(args) {
  const tasks = loadTasks();
  const filter = args[0]?.toLowerCase();
  
  if (tasks.length === 0) {
    console.log(`${colors.yellow}No tasks found.${colors.reset}`);
    return;
  }

  // Filter tasks if a status is provided
  const filteredTasks = filter ? 
    tasks.filter(task => task.status.toLowerCase() === filter) : 
    tasks;
  
  if (filteredTasks.length === 0) {
    console.log(`${colors.yellow}No tasks with status "${filter}" found.${colors.reset}`);
    return;
  }

  console.log(`${colors.bold}${colors.cyan}Task List:${colors.reset}`);
  filteredTasks.forEach((task, index) => {
    const statusColor = 
      task.status === 'completed' ? colors.green :
      task.status === 'in_progress' ? colors.blue : 
      task.status === 'blocked' ? colors.red : colors.yellow;
    
    console.log(`${colors.bold}[${index + 1}]${colors.reset} ${task.title}`);
    console.log(`    ID: ${task.id}`);
    console.log(`    Status: ${statusColor}${task.status}${colors.reset}`);
    console.log(`    Priority: ${task.priority}`);
    if (task.dueDate) console.log(`    Due: ${task.dueDate}`);
    console.log('');
  });
}

function updateTaskStatus(args) {
  if (args.length < 2) {
    console.log(`${colors.red}Usage: update <task_id> <new_status>${colors.reset}`);
    return;
  }

  const taskId = args[0];
  const newStatus = args[1];
  const validStatuses = ['todo', 'in_progress', 'completed', 'blocked'];
  
  if (!validStatuses.includes(newStatus)) {
    console.log(`${colors.red}Invalid status. Use one of: ${validStatuses.join(', ')}${colors.reset}`);
    return;
  }

  const tasks = loadTasks();
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) {
    console.log(`${colors.red}Task with ID ${taskId} not found.${colors.reset}`);
    return;
  }

  tasks[taskIndex].status = newStatus;
  saveTasks(tasks);
  console.log(`${colors.green}Task "${tasks[taskIndex].title}" updated to ${newStatus}${colors.reset}`);
}

function showTaskDetails(args) {
  if (args.length < 1) {
    console.log(`${colors.red}Usage: show <task_id>${colors.reset}`);
    return;
  }

  const taskId = args[0];
  const tasks = loadTasks();
  const task = tasks.find(task => task.id === taskId);
  
  if (!task) {
    console.log(`${colors.red}Task with ID ${taskId} not found.${colors.reset}`);
    return;
  }

  // Try to find the task's detailed file
  const taskFile = path.join(TASKS_DIR, `task_${taskId.padStart(3, '0')}.txt`);
  let taskDetails = '';
  try {
    if (fs.existsSync(taskFile)) {
      taskDetails = fs.readFileSync(taskFile, 'utf8');
    }
  } catch (error) {
    console.log(`${colors.yellow}Warning: Could not read task details file.${colors.reset}`);
  }

  const statusColor = 
    task.status === 'completed' ? colors.green :
    task.status === 'in_progress' ? colors.blue : 
    task.status === 'blocked' ? colors.red : colors.yellow;

  console.log(`${colors.bold}${colors.cyan}Task Details:${colors.reset}`);
  console.log(`${colors.bold}Title:${colors.reset} ${task.title}`);
  console.log(`${colors.bold}ID:${colors.reset} ${task.id}`);
  console.log(`${colors.bold}Status:${colors.reset} ${statusColor}${task.status}${colors.reset}`);
  console.log(`${colors.bold}Priority:${colors.reset} ${task.priority}`);
  if (task.dueDate) console.log(`${colors.bold}Due Date:${colors.reset} ${task.dueDate}`);
  if (task.assignee) console.log(`${colors.bold}Assignee:${colors.reset} ${task.assignee}`);
  if (task.tags && task.tags.length) console.log(`${colors.bold}Tags:${colors.reset} ${task.tags.join(', ')}`);
  
  if (taskDetails) {
    console.log(`\n${colors.bold}Description:${colors.reset}`);
    console.log(taskDetails);
  }
}

function showHelp() {
  console.log(`
${colors.bold}${colors.cyan}TaskMaster CLI - Task Management Utility${colors.reset}

${colors.bold}Usage:${colors.reset}
  node ${path.basename(__filename)} <command> [arguments]

${colors.bold}Commands:${colors.reset}
  ${colors.green}list [status]${colors.reset}        List all tasks, optionally filtered by status
  ${colors.green}show <task_id>${colors.reset}       Show detailed information about a task
  ${colors.green}update <task_id> <status>${colors.reset}  Update a task's status
  ${colors.green}help${colors.reset}                 Show this help message

${colors.bold}Examples:${colors.reset}
  node ${path.basename(__filename)} list
  node ${path.basename(__filename)} list todo
  node ${path.basename(__filename)} show 123
  node ${path.basename(__filename)} update 123 completed
  `);
}

// Main CLI function
function main() {
  const args = process.argv.slice(2);
  const command = args.shift() || 'help';

  switch (command) {
    case 'list':
      listTasks(args);
      break;
    case 'show':
      showTaskDetails(args);
      break;
    case 'update':
      updateTaskStatus(args);
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
}

// Execute the script
main(); 