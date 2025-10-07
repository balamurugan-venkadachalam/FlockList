# TaskMaster - Flock Task Management Application

TaskMaster is a comprehensive task management application designed for families, allowing parents and children to organize, assign, and track tasks within a flock unit.

## Task Status Tracking

The project uses a multi-file approach to track tasks and their statuses:

1. `tasks.json` - Main JSON file containing all tasks and subtasks with their statuses
2. `task_NNN.txt` - Individual text files for each main task with detailed descriptions
3. `TaskStatus.md` - Markdown file with an overview of all tasks in a readable format

Task status values:
- `pending` - Not yet started
- `in-progress` - Currently being worked on
- `done` - Completed

### Using the Task Tracker Script

We've implemented a task tracker script to ensure consistent status updates across all tracking files. The script updates task and subtask statuses in all three tracking mechanisms simultaneously.

```bash
# Update a task status
./scripts/task-tracker.js task <task_id> <status>

# Update a subtask status
./scripts/task-tracker.js subtask <task_id> <subtask_id> <status>
```

Examples:
```bash
# Mark task 4 as in-progress
./scripts/task-tracker.js task 4 in-progress

# Mark task 4 as done
./scripts/task-tracker.js task 4 done

# Mark subtask 1 of task 4 as in-progress
./scripts/task-tracker.js subtask 4 1 in-progress

# Mark subtask 1 of task 4 as done
./scripts/task-tracker.js subtask 4 1 done
```

The script automatically handles:
- Updating the status in tasks.json
- Updating the status in the corresponding task_NNN.txt file
- Updating the status in TaskStatus.md
- Auto-updating parent task status based on subtask completion

### Task Status Rules

The following rules apply to task status tracking:

1. When a task is picked up for work, its status should be set to `in-progress`
2. When a task is completed, its status should be set to `done`
3. A parent task is automatically marked as:
   - `in-progress` when at least one subtask is started
   - `done` when all subtasks are marked as `done`

## Application Structure

The application consists of:

- Frontend (React.js)
- Backend (Node.js/Express)
- MongoDB database

## API Endpoints

The application includes REST API endpoints for various operations including:

- User authentication
- Flock management 
- Task management
  - GET /api/tasks - List tasks with filtering
  - POST /api/tasks - Create a new task
  - GET /api/tasks/:id - Get task details
  - PUT /api/tasks/:id - Update a task
  - DELETE /api/tasks/:id - Delete a task
  - PATCH /api/tasks/:id/status - Update task status

## Development

To set up the development environment:

1. Clone the repository
2. Install dependencies for both frontend and backend
3. Configure environment variables
4. Start the development servers 

## Storage System

The application supports multiple storage providers for file attachments:

- **Local filesystem:** Files are stored locally in the server's filesystem.
- **Amazon S3:** Files are stored in an S3 bucket.
- **Google Cloud Storage:** Files are stored in a GCP bucket.
- **Oracle Cloud Storage:** Files are stored in Oracle Cloud Infrastructure Object Storage.
- Additional providers can be added by implementing the `StorageProvider` interface.

Configure the storage provider using environment variables:

```
# For local storage (default)
STORAGE_TYPE=local
LOCAL_STORAGE_PATH=/path/to/uploads

# For S3 storage
STORAGE_TYPE=s3
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# For Google Cloud Storage
STORAGE_TYPE=gcp
GCP_BUCKET_NAME=your-bucket-name
GCP_PROJECT_ID=your-project-id
GCP_KEY_FILE_PATH=/path/to/keyfile.json

# For Oracle Cloud Storage
STORAGE_TYPE=oracle
OCI_BUCKET_NAME=your-bucket-name
OCI_NAMESPACE=your-namespace
OCI_REGION=your-region
```

Each provider requires its own dependencies to be installed:

```bash
# For AWS S3
npm install aws-sdk

# For Google Cloud Storage
npm install @google-cloud/storage

# For Oracle Cloud Storage
npm install oci-sdk
```

See `/backend/src/integrations/storage/README.md` for details on implementing additional storage providers. 

## Mock Service Worker (MSW) for Storybook

The project uses Mock Service Worker (MSW) to mock API requests in Storybook, allowing components to be tested with realistic API interactions without requiring a backend server.

### MSW Setup

1. **Installation**

   ```bash
   npm install msw msw-storybook-addon --save-dev
   npx msw init public/ --save
   ```

2. **Handler Structure**

   Handlers are organized in the following structure:
   - `/src/mocks/handlers/` - Contains all API mock handlers
   - `/src/mocks/handlers/index.ts` - Exports all handlers
   - `/src/mocks/handlers/taskHandlers.ts` - Task-specific handlers
   - `/src/mocks/browser.ts` - Browser setup for MSW

3. **Storybook Integration**

   MSW is integrated with Storybook in `.storybook/preview.tsx`:

   ```tsx
   import { initialize, mswLoader } from 'msw-storybook-addon';

   // Initialize MSW
   initialize();

   const preview: Preview = {
     loaders: [mswLoader],
     // other configuration...
   };
   ```

4. **Using MSW in Stories**

   Example of using MSW in a story:

   ```tsx
   import { taskHandlers } from '../mocks/handlers/taskHandlers';

   const meta: Meta<typeof TasksPage> = {
     // ...
     parameters: {
       msw: {
         handlers: taskHandlers,
       },
     },
   };

   // Override handlers for specific stories
   export const ErrorState: Story = {
     parameters: {
       msw: {
         handlers: [getTasksErrorHandler],
       },
     },
   };
   ```

5. **Creating Custom Handlers**

   Create custom handlers in `/src/mocks/handlers/` following this pattern:

   ```tsx
   import { http, HttpResponse, delay } from 'msw';

   export const taskHandlers = [
     http.get('/api/tasks', async ({ request }) => {
       await delay(500); // Simulate network delay
       return HttpResponse.json({ /* response data */ });
     }),
   ];
   ```

This setup allows for realistic API mocking in Storybook, making it easier to test components that depend on API data without needing a running backend server.