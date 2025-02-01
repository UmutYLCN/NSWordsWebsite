import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

const router = {
  future: {
    v7_startTransition: true,
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter {...router}>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
