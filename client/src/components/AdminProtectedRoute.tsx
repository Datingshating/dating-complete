import { ReactNode, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { LoadingSpinner } from './LoadingSpinner'

interface AdminProtectedRouteProps {
  children: ReactNode
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [securityChecks, setSecurityChecks] = useState({
    tokenValid: false,
    userExists: false,
    isAdminUser: false,
    sessionValid: false
  })

  useEffect(() => {
    const performSecurityChecks = async () => {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        setIsAuthenticated(false)
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      try {
        // Multiple security checks for extra protection
        const checks = {
          tokenValid: false,
          userExists: false,
          isAdminUser: false,
          sessionValid: false
        }

        // Check 1: Verify token with backend and get user details
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const userData = await response.json()
          checks.tokenValid = true
          checks.userExists = true
          checks.isAdminUser = userData.is_admin === true
          checks.sessionValid = true
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem('authToken')
          localStorage.removeItem('userId')
          localStorage.removeItem('userName')
          localStorage.removeItem('isAdmin')
          sessionStorage.removeItem('userId')
          setIsAuthenticated(false)
          setIsAdmin(false)
          setIsLoading(false)
          return
        }

        // Check 2: Additional admin verification endpoint
        if (checks.isAdminUser) {
          const adminResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (!adminResponse.ok) {
            checks.isAdminUser = false
          }
        }

        setSecurityChecks(checks)
        setIsAuthenticated(checks.tokenValid && checks.userExists && checks.sessionValid)
        setIsAdmin(checks.isAdminUser)

        // Additional security: Clear sensitive data if not admin
        if (!checks.isAdminUser) {
          console.warn('Non-admin user attempted to access admin route')
        }

      } catch (error) {
        console.error('Admin security check failed:', error)
        // Clear storage on error
        localStorage.removeItem('authToken')
        localStorage.removeItem('userId')
        localStorage.removeItem('userName')
        localStorage.removeItem('isAdmin')
        sessionStorage.removeItem('userId')
        setIsAuthenticated(false)
        setIsAdmin(false)
      }
      
      setIsLoading(false)
    }

    performSecurityChecks()
  }, [])

  if (isLoading) {
    return <LoadingSpinner overlay={true} message="Verifying admin access..." />
  }

  // Extra security: Only allow if user is authenticated AND is admin
  if (!isAuthenticated || !isAdmin) {
    console.warn('Unauthorized admin access attempt blocked', {
      isAuthenticated,
      isAdmin,
      securityChecks
    })
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
