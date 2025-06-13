import React from 'react';
import ReactDOM from 'react-dom/client';
import './globals.css';
import './index.css';
import App from './App';
// Import API service to set up axios interceptors
import './services/api';

// Add debug logging condition
const isDebug = import.meta.env.VITE_DEBUG === 'true';
if (isDebug) {
  console.log('Frontend running in DEBUG mode');
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
