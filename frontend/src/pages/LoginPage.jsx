import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import AuthLayout from '../components/AuthLayout'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/errors'

function redirectByRole(navigate, role) {
  navigate(role === 'admin' ? '/admin/dashboard' : '/')
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const role = await login(form)
      redirectByRole(navigate, role)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Login"
      subtitle="Welcome back! Order groceries in minutes."
      footer={(
        <p>
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      )}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            className="auth-input"
            value={form.username}
            onChange={handleChange}
            placeholder="Enter username"
            required
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <PasswordInput
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="auth-btn" disabled={submitting}>
          {submitting ? 'Please wait...' : 'Continue'}
        </button>
      </form>
    </AuthLayout>
  )
}
