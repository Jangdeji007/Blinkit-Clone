import { Navigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

function getRoleHome(role) {
  return role === 'admin' ? '/admin/dashboard' : '/'
}

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <p className="loading-text">Loading...</p>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={getRoleHome(user.role)} replace />
  }

  return children
}
