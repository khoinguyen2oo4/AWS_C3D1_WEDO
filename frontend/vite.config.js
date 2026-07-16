import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const googleIdentityHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

export default defineConfig({
  plugins: [react()],
  server: {
    headers: googleIdentityHeaders,
  },
  preview: {
    headers: googleIdentityHeaders,
  },
})
