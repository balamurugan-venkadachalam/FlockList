#!/usr/bin/env node
/**
 * This script helps install dependencies for different storage providers
 * Usage: node install-dependencies.js [provider]
 * Where provider is one of: s3, gcp, oracle, azure, all
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define dependencies for each provider
const dependencies = {
  s3: ['aws-sdk'],
  gcp: ['@google-cloud/storage'],
  oracle: ['oci-sdk'],
  azure: ['@azure/storage-blob']
};

// Parse command line arguments
const args = process.argv.slice(2);
const provider = args[0]?.toLowerCase() || 'all';

// Check if provider is valid
const validProviders = Object.keys(dependencies).concat(['all']);
if (!validProviders.includes(provider)) {
  console.error(`Invalid provider: ${provider}`);
  console.error(`Valid providers are: ${validProviders.join(', ')}`);
  process.exit(1);
}

// Function to install dependencies
function installDependencies(providerList) {
  const depsToInstall = providerList.flatMap(p => dependencies[p]);
  
  if (depsToInstall.length === 0) {
    console.log('No dependencies to install');
    return;
  }
  
  console.log(`Installing dependencies for: ${providerList.join(', ')}`);
  console.log(`Installing packages: ${depsToInstall.join(', ')}`);
  
  try {
    execSync(`npm install ${depsToInstall.join(' ')}`, { stdio: 'inherit' });
    console.log('Dependencies installed successfully!');
  } catch (error) {
    console.error('Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

// Determine which providers to install
let providersToInstall = [];
if (provider === 'all') {
  providersToInstall = Object.keys(dependencies);
} else {
  providersToInstall = [provider];
}

// Install the dependencies
installDependencies(providersToInstall);

// Make the script executable
try {
  fs.chmodSync(__filename, '755');
} catch (error) {
  console.warn('Could not make script executable:', error.message);
} 