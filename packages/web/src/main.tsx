import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Buffer } from 'buffer'

import App from '@/App.tsx'
import { store } from '@/store/store'
import theme from '@/theme.ts'
import { ThemeProvider } from '@mui/material/styles'

import './index.css'

// Some wallet libs still expect a Node-style Buffer global in browsers.
if (typeof globalThis.Buffer === 'undefined') {
  ;(globalThis as typeof globalThis & { Buffer: typeof Buffer }).Buffer = Buffer
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <App />
        <ToastContainer />
      </Provider>
    </ThemeProvider>
  </StrictMode>
)
