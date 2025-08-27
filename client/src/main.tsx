import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { App } from './routes/App'
import { Register } from './routes/Register'
import { Login } from './routes/Login'
import { Dashboard } from './routes/Dashboard'
import { Admin } from './routes/Admin'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/register', element: <Register /> },
  { path: '/login', element: <Login /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/admin', element: <Admin /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)



