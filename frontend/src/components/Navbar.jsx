import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        blinkit
      </Link>

      <nav className="navbar-links">
        {!isAuthenticated && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}

        {isAuthenticated && user.role === 'customer' && (
          <>
            <Link to="/">Home</Link>
            <span className="nav-placeholder">Cart (Phase 3)</span>
            <span className="nav-placeholder">Orders (Phase 3)</span>
          </>
        )}

        {isAuthenticated && user.role === 'admin' && (
          <Link to="/admin/dashboard">Dashboard</Link>
        )}

        {isAuthenticated && (
          <button type="button" className="btn-link" onClick={handleLogout}>
            Logout
          </button>
        )}
      </nav>
    </header>
  )
}
