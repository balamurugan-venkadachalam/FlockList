# Family Task Manager - Architecture Document

## System Overview

Family Task Manager is a full-stack web application built with a modern JavaScript/TypeScript stack. The application follows a client-server architecture with a React.js frontend and a Node.js/Express backend, connected to a MongoDB database.

## Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │◄───►│  Express API    │◄───►│  MongoDB        │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                       ▲
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  JWT Auth       │     │  Email Service  │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

## Frontend Architecture

The frontend is built with React.js and follows a component-based architecture:

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images, fonts, etc.
│   │   ├── common/         # Shared components (buttons, inputs, etc.)
│   │   ├── layout/         # Layout components (header, footer, sidebar)
│   │   └── features/       # Feature-specific components
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── services/           # API service modules
│   ├── store/              # State management (Redux/Context)
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main application component
│   ├── index.tsx           # Application entry point
│   └── routes.tsx          # Application routing
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

### Key Frontend Technologies

- **React.js**: UI library for building the user interface
- **TypeScript**: Type-safe JavaScript for better developer experience
- **Material UI**: Component library for consistent design
- **React Router**: Client-side routing
- **Redux Toolkit**: State management
- **Axios**: HTTP client for API requests
- **Jest & React Testing Library**: Testing framework

## Backend Architecture

The backend is built with Node.js and Express, following a modular architecture:

```
backend/
├── src/
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   ├── validation/         # Request validation
│   └── app.js              # Express application
├── tests/                  # Test files
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

### Key Backend Technologies

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication
- **Bcrypt**: Password hashing
- **Jest**: Testing framework
- **ESLint & Prettier**: Code quality tools

## Database Schema

The application uses MongoDB with the following collections:

### Users Collection
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String",
  "password": "String (hashed)",
  "role": "String (parent, child)",
  "familyId": "ObjectId",
  "avatar": "String (URL)",
  "notificationPreferences": "Object"
}
```

### Families Collection
```json
{
  "_id": "ObjectId",
  "name": "String",
  "createdBy": "ObjectId (parent)",
  "members": ["ObjectId (users)"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Tasks Collection
```json
{
  "_id": "ObjectId",
  "title": "String",
  "description": "String",
  "createdBy": "ObjectId (user)",
  "assignedTo": ["ObjectId (users)"],
  "dueDate": "Date",
  "priority": "String (high, medium, low)",
  "category": "String",
  "status": "String (pending, in progress, completed)",
  "familyId": "ObjectId",
  "isRecurring": "Boolean",
  "recurrencePattern": "Object (if recurring)",
  "createdAt": "Date",
  "updatedAt": "Date",
  "completedAt": "Date"
}
```

### Notifications Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "taskId": "ObjectId",
  "type": "String (new task, reminder, completed)",
  "message": "String",
  "isRead": "Boolean",
  "createdAt": "Date"
}
```

## API Endpoints

### Authentication API
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Family API
- `POST /api/families` - Create a new family
- `GET /api/families/:id` - Get family details
- `PUT /api/families/:id` - Update family details
- `POST /api/families/:id/invite` - Invite a member to the family
- `GET /api/families/:id/members` - Get family members

### Task API
- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - Get tasks (with filters)
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task details
- `DELETE /api/tasks/:id` - Delete a task
- `PUT /api/tasks/:id/complete` - Mark a task as complete
- `GET /api/tasks/family/:familyId` - Get all tasks for a family

### Notification API
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark a notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

## Security Considerations

- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based access control (parent vs. child)
- **Data Validation**: Input validation on both client and server
- **Password Security**: Bcrypt hashing for passwords
- **HTTPS**: All API communication over HTTPS
- **CORS**: Proper CORS configuration for API access
- **Rate Limiting**: Protection against brute force attacks

## Deployment Architecture

The application is containerized using Docker and can be deployed to various cloud providers:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Docker Container                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │             │  │             │  │             │     │
│  │  Frontend   │  │  Backend    │  │  MongoDB    │     │
│  │  Container  │  │  Container  │  │  Container  │     │
│  │             │  │             │  │             │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Development Workflow

1. **Local Development**: Developers work on their local machines using Docker Compose
2. **Continuous Integration**: GitHub Actions run tests and linting on pull requests
3. **Continuous Deployment**: Automated deployment to staging/production environments
4. **Monitoring**: Application monitoring and error tracking
5. **Backup**: Regular database backups 