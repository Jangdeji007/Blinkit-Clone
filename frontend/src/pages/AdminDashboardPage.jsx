import { useAuth } from '../context/AuthContext'

export default function AdminDashboardPage() {
  const { user } = useAuth()

  return (
    <main className="page-content admin-page">
      <h1>Admin Dashboard</h1>
      <p>Hello, {user.username}. Product management coming in Phase 4.</p>
    </main>
  )
}
