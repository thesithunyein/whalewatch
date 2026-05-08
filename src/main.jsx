import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import './index.css'
import { AuthProvider } from './lib/auth-context';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppProvider>
        <ToastProvider>
          <AuthProvider>
      <App />
    </AuthProvider>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
)
