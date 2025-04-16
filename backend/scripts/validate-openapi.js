#!/usr/bin/env node

/**
 * This script validates that the OpenAPI documentation matches the actual API routes
 * defined in the codebase. It checks for:
 * 
 * 1. Missing routes in the OpenAPI documentation
 * 2. Routes in the OpenAPI documentation that don't exist in the codebase
 * 3. Inconsistencies in route methods
 * 
 * Usage: node validate-openapi.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { glob } = require('glob');
const colors = require('colors/safe');

// Configuration
const ROUTES_DIR = path.join(__dirname, '../src/routes');
const APP_PATH = path.join(__dirname, '../src/app.ts');
const OPENAPI_PATH = path.join(__dirname, '../openapi.yaml');
const API_PREFIX = '/api';

// Extract route mappings from app.ts
function extractRouteMappings() {
  const appContent = fs.readFileSync(APP_PATH, 'utf8');
  const mappings = {};
  
  // Match lines like: app.use('/api/auth', authRoutes);
  const routeMappingRegex = /app\.use\s*\(\s*['"]([^'"]+)['"]\s*,\s*([^)]+)\s*\)/g;
  let match;
  
  while ((match = routeMappingRegex.exec(appContent)) !== null) {
    const mountPath = match[1];
    const routeVar = match[2].trim();
    
    // Use a simpler approach to find imports
    // Look for routes defined in app.ts and map their mount paths
    // Extract the filename from import lines
    const lines = appContent.split('\n');
    for (const line of lines) {
      if (line.includes(`import ${routeVar} from `)) {
        // Extract the import path
        const importMatch = line.match(/from\s+['"]([^'"]+)['"]/);
        if (importMatch) {
          const importPath = importMatch[1];
          const fileName = importPath.split('/').pop();
          mappings[fileName] = mountPath.replace(API_PREFIX, '');
        }
      }
    }
  }
  
  return mappings;
}

// Helper function to extract routes from route files
function extractRoutesFromFile(filePath, routeMappings) {
  const content = fs.readFileSync(filePath, 'utf8');
  const routes = [];
  
  // Get the filename without extension
  const fileName = path.basename(filePath, path.extname(filePath));
  
  // Determine the route base path
  let routeBase = routeMappings[fileName] || '/' + fileName;
  
  // Extract routes using regex
  const routeRegex = /router\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]*)['"]/g;
  let match;
  
  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const route = match[2];
    
    // Skip if the route is a parameter route that's already captured
    if (route.includes(':') && routes.some(r => 
      r.route.replace(/\{[^}]+\}/g, ':param') === route && r.method === method
    )) {
      continue;
    }
    
    // Handle root route
    if (route === '/') {
      routes.push({
        method,
        route: API_PREFIX + routeBase,
        file: path.basename(filePath)
      });
    } else {
      routes.push({
        method,
        route: API_PREFIX + routeBase + route,
        file: path.basename(filePath)
      });
    }
  }
  
  return routes;
}

// Helper function to normalize route path (convert Express params to OpenAPI params)
function normalizeRoutePath(route) {
  return route.replace(/:([^/]+)/g, '{$1}');
}

// Helper function to extract routes from OpenAPI spec
function extractRoutesFromOpenAPI(openapiDoc) {
  const routes = [];
  
  for (const [path, pathItem] of Object.entries(openapiDoc.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
        routes.push({
          method: method.toUpperCase(),
          route: path,
          operationId: operation.operationId
        });
      }
    }
  }
  
  return routes;
}

// Main function
async function main() {
  try {
    // Read and parse OpenAPI document
    const openapiContent = fs.readFileSync(OPENAPI_PATH, 'utf8');
    const openapiDoc = yaml.load(openapiContent);
    
    // Extract routes from OpenAPI
    const openapiRoutes = extractRoutesFromOpenAPI(openapiDoc);
    
    // Extract route mappings from app.ts
    const routeMappings = extractRouteMappings();
    
    // Find all route files
    const routeFiles = await glob(`${ROUTES_DIR}/**/*.{js,ts}`);
    
    // Extract routes from route files
    let codeRoutes = [];
    for (const file of routeFiles) {
      const routes = extractRoutesFromFile(file, routeMappings);
      codeRoutes = [...codeRoutes, ...routes];
    }
    
    // Normalize code routes to match OpenAPI format
    codeRoutes = codeRoutes.map(route => ({
      ...route,
      route: normalizeRoutePath(route.route)
    }));
    
    // Check for missing routes in OpenAPI
    const missingInOpenAPI = codeRoutes.filter(codeRoute => 
      !openapiRoutes.some(openapiRoute => 
        openapiRoute.route === codeRoute.route && 
        openapiRoute.method === codeRoute.method
      )
    );
    
    // Check for routes in OpenAPI that don't exist in code
    const missingInCode = openapiRoutes.filter(openapiRoute => 
      !codeRoutes.some(codeRoute => 
        codeRoute.route === openapiRoute.route && 
        codeRoute.method === openapiRoute.method
      )
    );
    
    // Print validation results
    console.log(colors.bold('\nOpenAPI Validation Results:'));
    console.log(colors.cyan(`Found ${codeRoutes.length} routes in code and ${openapiRoutes.length} routes in OpenAPI documentation.\n`));
    
    if (missingInOpenAPI.length === 0 && missingInCode.length === 0) {
      console.log(colors.green.bold('✓ All routes are properly documented in the OpenAPI specification!'));
    } else {
      if (missingInOpenAPI.length > 0) {
        console.log(colors.yellow.bold(`! Found ${missingInOpenAPI.length} routes in code that are missing from OpenAPI documentation:`));
        missingInOpenAPI.forEach(route => {
          console.log(colors.yellow(`  - ${route.method} ${route.route} (from ${route.file})`));
        });
        console.log();
      }
      
      if (missingInCode.length > 0) {
        console.log(colors.red.bold(`! Found ${missingInCode.length} routes in OpenAPI documentation that don't exist in the code:`));
        missingInCode.forEach(route => {
          console.log(colors.red(`  - ${route.method} ${route.route} (operationId: ${route.operationId})`));
        });
        console.log();
      }
      
      console.log(colors.bold('Please update the OpenAPI documentation to match the API implementation.'));
      process.exit(1);
    }
  } catch (error) {
    console.error(colors.red(`Error: ${error.message}`));
    console.error(error.stack);
    process.exit(1);
  }
}

main(); 