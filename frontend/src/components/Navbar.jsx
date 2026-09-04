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
    <header className="site-header">
      <div className="header-promo">
        <span>⚡ Get groceries delivered in 10 minutes</span>
      </div>

      <div className="navbar">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            blinkit
          </Link>
          <div className="header-location">
            <span className="location-title">Delivery in 10 minutes</span>
            <span className="location-sub">Your Location, India ▾</span>
          </div>
        </div>

        <nav className="navbar-links">
          {!isAuthenticated && (
            <>
              <Link to="/login" className="nav-btn nav-btn-outline">Login</Link>
              <Link to="/signup" className="nav-btn nav-btn-primary">Sign Up</Link>
            </>
          )}

          {isAuthenticated && user.role === 'customer' && (
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/cart" className="nav-btn nav-btn-cart">
                🛒 Cart
              </Link>
              <Link to="/orders" className="nav-link">Orders</Link>
            </>
          )}

          {isAuthenticated && user.role === 'admin' && (
            <Link to="/admin/dashboard" className="nav-btn nav-btn-primary">
              Admin Dashboard
            </Link>
          )}

          {isAuthenticated && (
            <button type="button" className="nav-link nav-logout" onClick={handleLogout}>
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
