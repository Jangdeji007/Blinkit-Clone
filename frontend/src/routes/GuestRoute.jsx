import { Navigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

function getRoleHome(role) {
  return role === 'admin' ? '/admin/dashboard' : '/'
}

export default function GuestRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <p className="loading-text">Loading...</p>
  }

  if (isAuthenticated) {
    return <Navigate to={getRoleHome(user.role)} replace />
  }

  return children
}
