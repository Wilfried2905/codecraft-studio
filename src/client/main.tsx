import React from 'react'
import ReactDOM from 'react-dom/client'
import AppIDE from './AppIDE'
import { AppProvider } from './contexts/AppContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <AppIDE />
    </AppProvider>
  </React.StrictMode>
)
