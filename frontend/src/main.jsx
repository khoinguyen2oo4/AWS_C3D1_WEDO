import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { applyTheme, getInitialTheme } from './shared/utils/theme.js'
import { applyLocale, getInitialLocale } from './shared/utils/locale.js'
import { LanguageProvider } from './shared/i18n/LanguageProvider.jsx'
import ToastProvider from './shared/components/toast/ToastProvider.jsx'

applyTheme(getInitialTheme())
applyLocale(getInitialLocale())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </LanguageProvider>
  </StrictMode>,
)
