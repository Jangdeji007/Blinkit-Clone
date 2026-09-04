import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="page-content">
      <div className="grid-message grid-empty">
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist.</p>
        <Link to="/" className="auth-btn">
          Back to home
        </Link>
      </div>
    </main>
  )
}
