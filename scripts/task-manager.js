#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Path to tasks.json file
const tasksFilePath = path.join(__dirname, '../tasks/tasks.json');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Helper functions
function loadTasks() {
  try {
    const data = fs.readFileSync(tasksFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`${colors.red}Error loading tasks: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

function saveTasks(tasksData) {
  try {
    fs.writeFileSync(
      tasksFilePath,
      JSON.stringify(tasksData, null, 2),
      'utf8'
    );
    console.log(`${colors.green}Tasks saved successfully${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error saving tasks: ${error.message}${colors.reset}`);
  }
}

function formatStatus(status) {
  switch (status) {
    case 'completed':
      return `${colors.green}✓ Completed${colors.reset}`;
    case 'in-progress':
      return `${colors.yellow}⟳ In Progress${colors.reset}`;
    case 'pending':
      return `${colors.blue}○ Pending${colors.reset}`;
    default:
      return status;
  }
}

function findTask(tasks, taskId) {
  return tasks.find(task => task.id === taskId);
}

function findSubtask(task, subtaskId) {
  return task.subtasks?.find(subtask => subtask.id === subtaskId);
}

// Command functions
function listTasks() {
  const tasksData = loadTasks();
  console.log(`\n${colors.bright}${colors.cyan}=== TaskMaster Tasks ===${colors.reset}\n`);
  
  tasksData.tasks.forEach(task => {
    const completedSubtasks = task.subtasks ? 
      task.subtasks.filter(st => st.status === 'completed').length : 0;
    const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
    const progress = totalSubtasks > 0 ? 
      Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
    
    console.log(`${colors.bright}${task.id}. ${task.title} [${formatStatus(task.status)}]${colors.reset}`);
    console.log(`   Priority: ${task.priority}`);
    console.log(`   Progress: ${progress}% (${completedSubtasks}/${totalSubtasks} subtasks)`);
  });
}

function showTaskDetails(taskId) {
  const tasksData = loadTasks();
  const task = findTask(tasksData.tasks, taskId);
  
  if (!task) {
    console.log(`${colors.red}Task with ID ${taskId} not found${colors.reset}`);
    return;
  }
  
  console.log(`\n${colors.bright}${colors.cyan}=== Task ${task.id}: ${task.title} ===${colors.reset}\n`);
  console.log(`${colors.bright}Description:${colors.reset} ${task.description}`);
  console.log(`${colors.bright}Status:${colors.reset} ${formatStatus(task.status)}`);
  console.log(`${colors.bright}Priority:${colors.reset} ${task.priority}`);
  console.log(`${colors.bright}Dependencies:${colors.reset} ${task.dependencies.join(', ') || 'None'}`);
  console.log(`\n${colors.bright}Details:${colors.reset}\n${task.details}`);
  console.log(`\n${colors.bright}Test Strategy:${colors.reset}\n${task.testStrategy || 'Not specified'}`);
  
  if (task.subtasks && task.subtasks.length > 0) {
    console.log(`\n${colors.bright}${colors.cyan}Subtasks:${colors.reset}\n`);
    task.subtasks.forEach(subtask => {
      console.log(`${colors.bright}${subtask.id}. ${subtask.title} [${formatStatus(subtask.status)}]${colors.reset}`);
      console.log(`   ${subtask.description}`);
    });
  }
}

function updateTaskStatus(taskId, newStatus) {
  const validStatuses = ['pending', 'in-progress', 'completed'];
  if (!validStatuses.includes(newStatus)) {
    console.log(`${colors.red}Invalid status. Use one of: ${validStatuses.join(', ')}${colors.reset}`);
    return;
  }
  
  const tasksData = loadTasks();
  const task = findTask(tasksData.tasks, taskId);
  
  if (!task) {
    console.log(`${colors.red}Task with ID ${taskId} not found${colors.reset}`);
    return;
  }
  
  task.status = newStatus;
  saveTasks(tasksData);
  console.log(`${colors.green}Updated task ${taskId} status to ${formatStatus(newStatus)}${colors.reset}`);
}

function updateSubtaskStatus(taskId, subtaskId, newStatus) {
  const validStatuses = ['pending', 'in-progress', 'completed'];
  if (!validStatuses.includes(newStatus)) {
    console.log(`${colors.red}Invalid status. Use one of: ${validStatuses.join(', ')}${colors.reset}`);
    return;
  }
  
  const tasksData = loadTasks();
  const task = findTask(tasksData.tasks, taskId);
  
  if (!task) {
    console.log(`${colors.red}Task with ID ${taskId} not found${colors.reset}`);
    return;
  }
  
  const subtask = findSubtask(task, subtaskId);
  if (!subtask) {
    console.log(`${colors.red}Subtask with ID ${subtaskId} not found in task ${taskId}${colors.reset}`);
    return;
  }
  
  subtask.status = newStatus;
  saveTasks(tasksData);
  console.log(`${colors.green}Updated subtask ${subtaskId} status to ${formatStatus(newStatus)}${colors.reset}`);
  
  // Auto-update task status based on subtasks
  if (task.subtasks && task.subtasks.length > 0) {
    const allCompleted = task.subtasks.every(st => st.status === 'completed');
    const allPending = task.subtasks.every(st => st.status === 'pending');
    
    if (allCompleted && task.status !== 'completed') {
      task.status = 'completed';
      saveTasks(tasksData);
      console.log(`${colors.green}Auto-updated task ${taskId} status to ${formatStatus('completed')}${colors.reset}`);
    } else if (!allPending && !allCompleted && task.status !== 'in-progress') {
      task.status = 'in-progress';
      saveTasks(tasksData);
      console.log(`${colors.green}Auto-updated task ${taskId} status to ${formatStatus('in-progress')}${colors.reset}`);
    }
  }
}

function showProgress() {
  const tasksData = loadTasks();
  const totalTasks = tasksData.tasks.length;
  const completedTasks = tasksData.tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasksData.tasks.filter(t => t.status === 'in-progress').length;
  
  let totalSubtasks = 0;
  let completedSubtasks = 0;
  
  tasksData.tasks.forEach(task => {
    if (task.subtasks) {
      totalSubtasks += task.subtasks.length;
      completedSubtasks += task.subtasks.filter(st => st.status === 'completed').length;
    }
  });
  
  const taskProgress = Math.round((completedTasks / totalTasks) * 100);
  const subtaskProgress = Math.round((completedSubtasks / totalSubtasks) * 100);
  
  console.log(`\n${colors.bright}${colors.cyan}=== Project Progress ===${colors.reset}\n`);
  console.log(`${colors.bright}Tasks:${colors.reset} ${completedTasks}/${totalTasks} (${taskProgress}%)`);
  console.log(`${colors.bright}Subtasks:${colors.reset} ${completedSubtasks}/${totalSubtasks} (${subtaskProgress}%)`);
  console.log(`${colors.bright}Task Breakdown:${colors.reset}`);
  console.log(`  ${colors.green}✓ Completed:${colors.reset} ${completedTasks}`);
  console.log(`  ${colors.yellow}⟳ In Progress:${colors.reset} ${inProgressTasks}`);
  console.log(`  ${colors.blue}○ Pending:${colors.reset} ${totalTasks - completedTasks - inProgressTasks}`);
}

// Command-line interface
function showHelp() {
  console.log(`\n${colors.bright}${colors.cyan}=== TaskMaster CLI Help ===${colors.reset}\n`);
  console.log(`${colors.bright}Available commands:${colors.reset}`);
  console.log(`  ${colors.green}list${colors.reset}                        List all tasks`);
  console.log(`  ${colors.green}show <taskId>${colors.reset}               Show details of a specific task`);
  console.log(`  ${colors.green}update-task <taskId> <status>${colors.reset}   Update a task's status`);
  console.log(`  ${colors.green}update-subtask <taskId> <subtaskId> <status>${colors.reset}   Update a subtask's status`);
  console.log(`  ${colors.green}progress${colors.reset}                    Show overall project progress`);
  console.log(`  ${colors.green}help${colors.reset}                        Show this help message`);
  console.log(`  ${colors.green}exit${colors.reset}                        Exit the program`);
}

// Main interactive CLI
function startCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${colors.bright}${colors.cyan}taskmaster>${colors.reset} `
  });
  
  console.log(`\n${colors.bright}${colors.cyan}Welcome to TaskMaster CLI${colors.reset}`);
  console.log(`Type 'help' to see available commands\n`);
  
  rl.prompt();
  
  rl.on('line', (line) => {
    const args = line.trim().split(' ');
    const command = args[0].toLowerCase();
    
    try {
      switch (command) {
        case 'list':
          listTasks();
          break;
        case 'show':
          if (!args[1]) {
            console.log(`${colors.red}Error: Task ID required${colors.reset}`);
          } else {
            showTaskDetails(parseInt(args[1], 10));
          }
          break;
        case 'update-task':
          if (!args[1] || !args[2]) {
            console.log(`${colors.red}Error: Task ID and status required${colors.reset}`);
          } else {
            updateTaskStatus(parseInt(args[1], 10), args[2]);
          }
          break;
        case 'update-subtask':
          if (!args[1] || !args[2] || !args[3]) {
            console.log(`${colors.red}Error: Task ID, subtask ID, and status required${colors.reset}`);
          } else {
            updateSubtaskStatus(parseInt(args[1], 10), parseInt(args[2], 10), args[3]);
          }
          break;
        case 'progress':
          showProgress();
          break;
        case 'help':
          showHelp();
          break;
        case 'exit':
          rl.close();
          return;
        default:
          console.log(`${colors.red}Unknown command: ${command}${colors.reset}`);
          console.log(`Type 'help' to see available commands`);
      }
    } catch (error) {
      console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    }
    
    rl.prompt();
  }).on('close', () => {
    console.log(`\n${colors.bright}${colors.cyan}Goodbye!${colors.reset}`);
    process.exit(0);
  });
}

// Direct command line usage
function processCommandLineArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    startCLI();
    return;
  }
  
  const command = args[0].toLowerCase();
  
  try {
    switch (command) {
      case 'list':
        listTasks();
        break;
      case 'show':
        if (!args[1]) {
          console.log(`${colors.red}Error: Task ID required${colors.reset}`);
        } else {
          showTaskDetails(parseInt(args[1], 10));
        }
        break;
      case 'update-task':
        if (!args[1] || !args[2]) {
          console.log(`${colors.red}Error: Task ID and status required${colors.reset}`);
        } else {
          updateTaskStatus(parseInt(args[1], 10), args[2]);
        }
        break;
      case 'update-subtask':
        if (!args[1] || !args[2] || !args[3]) {
          console.log(`${colors.red}Error: Task ID, subtask ID, and status required${colors.reset}`);
        } else {
          updateSubtaskStatus(parseInt(args[1], 10), parseInt(args[2], 10), args[3]);
        }
        break;
      case 'progress':
        showProgress();
        break;
      case 'help':
        showHelp();
        break;
      default:
        console.log(`${colors.red}Unknown command: ${command}${colors.reset}`);
        showHelp();
    }
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

// Execute the program
processCommandLineArgs(); 