import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// Import API service to set up axios interceptors
import './services/api';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
