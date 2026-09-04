import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import AuthLayout from '../components/AuthLayout'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/errors'

function redirectByRole(navigate, role) {
  navigate(role === 'admin' ? '/admin/dashboard' : '/')
}

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
  })
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
      const payload = {
        username: form.username,
        password: form.password,
      }
      if (form.email) payload.email = form.email
      if (form.first_name) payload.first_name = form.first_name
      if (form.last_name) payload.last_name = form.last_name

      const role = await signup(payload)
      redirectByRole(navigate, role)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Sign up to start shopping"
      footer={(
        <p>
          Already have an account? <Link to="/login">Login</Link>
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
            placeholder="Choose a username"
            required
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email (optional)</label>
          <input
            id="email"
            name="email"
            type="email"
            className="auth-input"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email"
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <PasswordInput
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create password"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <p className="field-hint">Minimum 8 characters</p>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="first_name">First name (optional)</label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              className="auth-input"
              value={form.first_name}
              onChange={handleChange}
              placeholder="First name"
              autoComplete="given-name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last name (optional)</label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              className="auth-input"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Last name"
              autoComplete="family-name"
            />
          </div>
        </div>

        <button type="submit" className="auth-btn" disabled={submitting}>
          {submitting ? 'Please wait...' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}
