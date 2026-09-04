import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { deleteProduct, getProducts } from '../api/products'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/errors'
import { formatPrice } from '../utils/media'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [actionError, setActionError] = useState('')

  const loadProducts = useCallback(async () => {
    setError('')
    try {
      const { data } = await getProducts()
      setProducts(data)
    } catch (err) {
      setProducts([])
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`Delete "${product.name}"? This cannot be undone.`)
    if (!confirmed) return

    setActionError('')
    setDeletingId(product.id)
    try {
      await deleteProduct(product.id)
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
    } catch (err) {
      setActionError(getApiErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return <main className="page-content admin-page"><p className="grid-message">Loading products...</p></main>
  }

  return (
    <main className="page-content admin-page">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="admin-subtitle">Hello, {user.username}. Manage your product catalog.</p>
        </div>
        <Link to="/admin/products/add" className="auth-btn admin-add-btn">
          Add Product
        </Link>
      </div>

      {error && (
        <div className="grid-message grid-error">
          <p>{error}</p>
          <button type="button" className="btn-link" onClick={loadProducts}>Try again</button>
        </div>
      )}

      {actionError && <p className="error-message">{actionError}</p>}

      {!error && products.length === 0 && (
        <div className="grid-message">
          <p>No products yet.</p>
          <Link to="/admin/products/add" className="back-link">Add your first product</Link>
        </div>
      )}

      {!error && products.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>{product.stock}</td>
                  <td>{product.category_name || '—'}</td>
                  <td>
                    <div className="admin-table-actions">
                      <Link to={`/admin/products/edit/${product.id}`} className="btn-link">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="btn-link admin-delete-btn"
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                      >
                        {deletingId === product.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
