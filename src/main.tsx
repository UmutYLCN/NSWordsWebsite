import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// GitHub Pages yönlendirmesi için base tag eklemek
const baseTag = document.createElement('base');
baseTag.href = '/NSWordsWebsite/';
document.head.appendChild(baseTag);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
