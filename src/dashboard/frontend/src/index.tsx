/**
 * React Application Entry Point
 * 
 * @file index.tsx
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);