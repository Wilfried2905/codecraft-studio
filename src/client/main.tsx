import React from 'react'
import ReactDOM from 'react-dom/client'
import AppIDE from './AppIDE'
import { AppProvider } from './contexts/AppContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppProvider>
        <AppIDE />
      </AppProvider>
    </AuthProvider>
  </React.StrictMode>
)
