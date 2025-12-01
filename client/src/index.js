import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// simple-peer и некоторые зависимости ожидают наличие process в браузере
if (typeof window !== "undefined" && !window.process) {
  window.process = { env: { NODE_ENV: process.env.NODE_ENV || "development" } };
}
if (typeof window !== "undefined" && window.process && !window.process.nextTick) {
  window.process.nextTick = (cb, ...args) => setTimeout(() => cb(...args), 0);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
