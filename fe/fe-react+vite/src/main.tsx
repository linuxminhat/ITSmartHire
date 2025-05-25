import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { router } from '@/routes'
import { RouterProvider } from 'react-router-dom'
import { ensureFirebaseSignedIn } from './utils/firebaseAuth'
ensureFirebaseSignedIn();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
