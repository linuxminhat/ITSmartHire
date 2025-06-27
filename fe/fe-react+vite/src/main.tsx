import { StrictMode } from 'react'
//React 18+
import { createRoot } from 'react-dom/client'
import './index.css'
import { router } from '@/routes'
import { RouterProvider } from 'react-router-dom'
//check if client has session/auth token with Firebase 
import { ensureFirebaseSignedIn } from './utils/firebaseAuth'
ensureFirebaseSignedIn();
//Render in DOM
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
