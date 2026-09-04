import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Navbar from './components/Navbar'
import AdminDashboardPage from './pages/AdminDashboardPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProductDetailPage from './pages/ProductDetailPage'
import SignupPage from './pages/SignupPage'
import GuestRoute from './routes/GuestRoute'
import ProtectedRoute from './routes/ProtectedRoute'

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={(
            <Layout>
              <HomePage />
            </Layout>
          )}
        />
        <Route
          path="/product/:id"
          element={(
            <Layout>
              <ProductDetailPage />
            </Layout>
          )}
        />
        <Route
          path="/login"
          element={(
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          )}
        />
        <Route
          path="/signup"
          element={(
            <GuestRoute>
              <SignupPage />
            </GuestRoute>
          )}
        />
        <Route
          path="/admin/dashboard"
          element={(
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <AdminDashboardPage />
              </Layout>
            </ProtectedRoute>
          )}
        />
      </Routes>
    </BrowserRouter>
  )
}
