import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// GitHub Pages'de baseUrl'i doğru bir şekilde ayarlamak için
if (typeof document !== 'undefined') {
  // Sadece tarayıcı ortamında çalıştır
  const baseTag = document.createElement('base');
  baseTag.href = '/NSWordsWebsite/';
  // Başka bir base tag yoksa ekle
  if (!document.querySelector('base')) {
    document.head.appendChild(baseTag);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
