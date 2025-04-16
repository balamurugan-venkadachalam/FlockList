import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import familyRoutes from './routes/familyRoutes';
import { errorHandler } from './middleware/errorHandler';
import http from 'http';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
// @ts-ignore - cookieParser types are not properly recognized
app.use(cookieParser());

// OpenAPI documentation
try {
  const openapiPath = path.join(__dirname, '../openapi.yaml');
  // @ts-ignore - yaml loading and swagger setup typing issues
  const openapiSpec = yaml.load(fs.readFileSync(openapiPath, 'utf8'));
  // @ts-ignore - swagger-ui-express has type incompatibilities
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
  console.log('OpenAPI documentation available at /api-docs');
} catch (error) {
  console.warn('Could not load OpenAPI documentation:', error);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/families', familyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (error: Error) => {
    console.error('Unhandled Promise Rejection:', error);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
}

export { app }; 