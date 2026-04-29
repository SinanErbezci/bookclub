import React from 'react';
import ReactDOM from 'react-dom/client';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import '../src/styles/style.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById("root")).render(
    <ToastProvider>
<BrowserRouter>
  <AuthProvider>
      <App />
  </AuthProvider>
</BrowserRouter>
    </ToastProvider>
);