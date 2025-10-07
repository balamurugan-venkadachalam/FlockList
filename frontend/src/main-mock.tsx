import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './globals.css';
import { worker } from './mocks/browser';

// Initialize the MSW worker before rendering the app
async function startApp() {
  // Enable the worker in development environment
  if (import.meta.env.DEV) {
    // Start the worker with a custom onUnhandledRequest option
    await worker.start({
      onUnhandledRequest: 'bypass', // 'warn' | 'error' | 'bypass'
    });
    console.log('[MSW] Mock Service Worker activated');
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

startApp();
