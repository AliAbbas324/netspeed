import '@fontsource-variable/inter';
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

console.log('[main.tsx] Starting...');

const container = document.getElementById('root');
console.log('[main.tsx] Root container:', container);

if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);
console.log('[main.tsx] React root created');

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('[main.tsx] App rendered');

