import { ReactNode, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { LoadingSpinner } from './LoadingSpinner'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      try {
        // Verify token with backend
        console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
        console.log('Full URL:', `${import.meta.env.VITE_API_URL}/api/me`);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem('authToken')
          localStorage.removeItem('userId')
          localStorage.removeItem('userName')
          localStorage.removeItem('isAdmin')
          sessionStorage.removeItem('userId')
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Clear storage on error
        localStorage.removeItem('authToken')
        localStorage.removeItem('userId')
        localStorage.removeItem('userName')
        localStorage.removeItem('isAdmin')
        sessionStorage.removeItem('userId')
        setIsAuthenticated(false)
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return <LoadingSpinner overlay={true} message="Verifying your access..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
