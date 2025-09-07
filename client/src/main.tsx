import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './debug-env'
import { App } from './routes/App'
import { Register } from './routes/Register'
import { Login } from './routes/Login'
import { Dashboard } from './routes/Dashboard'
import { Admin } from './routes/Admin'
import { Terms } from './routes/Terms'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminProtectedRoute } from './components/AdminProtectedRoute'
import '../globals.css'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/register', element: <Register /> },
  { path: '/login', element: <Login /> },
  { path: '/terms', element: <Terms /> },
  { 
    path: '/dashboard', 
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/admin', 
    element: (
      <AdminProtectedRoute>
        <Admin />
      </AdminProtectedRoute>
    ) 
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)



