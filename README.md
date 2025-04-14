# Flock List

FlockList is a collaborative family to-do list application that helps households organize tasks, assign responsibilities, and stay in sync with each other's activities.

Simply add tasks, assign family members, set due dates, and watch your family productivity soar. Perfect for managing household chores, shopping lists, family events, and children's activities.

## Project Overview

Family Task Manager is a web and mobile application that solves the problem of task coordination within families by providing a centralized platform where parents can assign tasks to children, track their completion, and manage family schedules.

## Features

- **User Management & Authentication**: Secure login for all family members with role-based permissions
- **Task Creation & Assignment**: Parents can create tasks and assign them to specific family members
- **Task Viewing & Completion**: Family members can view their assigned tasks and mark them as complete
- **Family Calendar**: Visual calendar view of all family tasks and events
- **Notifications & Reminders**: Alerts about new tasks, upcoming deadlines, and task completions

## Tech Stack

- **Frontend**: React.js 18+, TypeScript, Material UI
- **Backend**: Node.js 18+, Express 4+, MongoDB 5+
- **Authentication**: JWT with refresh tokens
- **Database**: MongoDB with Mongoose ODM
- **Deployment**: Docker containers on cloud provider

## Project Structure

```
family-task-manager/
├── frontend/           # React.js frontend application
├── backend/            # Node.js/Express backend application
├── docs/               # Project documentation
├── package.json        # Root package.json for workspace management
└── README.md           # Project documentation
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 8 or higher
- MongoDB 5 or higher
- Docker and Docker Compose (for containerized development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/family-task-manager.git
   cd family-task-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update the variables with your configuration

4. Start the development servers:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run frontend tests only
npm run test:frontend

# Run backend tests only
npm run test:backend
```

### Linting

```bash
# Lint all code
npm run lint

# Lint frontend code only
npm run lint:frontend

# Lint backend code only
npm run lint:backend
```

### Building for Production

```bash
# Build both frontend and backend
npm run build

# Build frontend only
npm run build:frontend

# Build backend only
npm run build:backend
```

## Docker Development

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Any.do and other family task management applications
- Built with modern web technologies and best practices 