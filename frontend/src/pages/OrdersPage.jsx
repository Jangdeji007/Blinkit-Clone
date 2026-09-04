import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getOrders, payOrder } from '../api/orders'
import { getApiErrorMessage } from '../utils/errors'
import { formatPrice } from '../utils/media'

function formatDate(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [payingOrderId, setPayingOrderId] = useState(null)
  const [actionError, setActionError] = useState('')

  const loadOrders = useCallback(async () => {
    setError('')
    try {
      const { data } = await getOrders()
      setOrders(data)
    } catch (err) {
      setOrders([])
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handlePay = async (orderId) => {
    setActionError('')
    setPayingOrderId(orderId)
    try {
      const { data } = await payOrder(orderId)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data : o)))
    } catch (err) {
      setActionError(getApiErrorMessage(err))
    } finally {
      setPayingOrderId(null)
    }
  }

  if (loading) {
    return <main className="page-content"><p className="grid-message">Loading orders...</p></main>
  }

  if (error) {
    return (
      <main className="page-content">
        <div className="grid-message grid-error">
          <p>{error}</p>
          <button type="button" className="btn-link" onClick={loadOrders}>Try again</button>
        </div>
      </main>
    )
  }

  return (
    <main className="page-content orders-page">
      <h1>My Orders</h1>

      {actionError && <p className="error-message">{actionError}</p>}

      {orders.length === 0 ? (
        <div className="grid-message">
          <p>No orders yet.</p>
          <Link to="/" className="back-link">Start shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article key={order.id} className="order-card">
              <header className="order-card-header">
                <div>
                  <h2>Order #{order.id}</h2>
                  <p className="order-date">{formatDate(order.created_at)}</p>
                </div>
                <span className={`status-badge status-${order.status}`}>
                  {order.status}
                </span>
              </header>

              <ul className="order-items">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.product_name} × {item.quantity} — {formatPrice(item.price_at_purchase * item.quantity)}
                  </li>
                ))}
              </ul>

              <footer className="order-card-footer">
                <p className="order-total">Total: <strong>{formatPrice(order.total_amount)}</strong></p>
                {order.status === 'pending' && (
                  <button
                    type="button"
                    className="auth-btn order-pay-btn"
                    onClick={() => handlePay(order.id)}
                    disabled={payingOrderId === order.id}
                  >
                    {payingOrderId === order.id ? 'Processing...' : 'Pay Now'}
                  </button>
                )}
              </footer>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
