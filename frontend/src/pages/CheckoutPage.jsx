import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getCart } from '../api/cart'
import { checkout, payOrder } from '../api/orders'
import { getApiErrorMessage } from '../utils/errors'
import { formatPrice, getMediaUrl } from '../utils/media'

export default function CheckoutPage() {
  const [phase, setPhase] = useState('review')
  const [cart, setCart] = useState(null)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadCart = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const { data } = await getCart()
      setCart(data)
    } catch (err) {
      setCart(null)
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (phase === 'review') {
      loadCart()
    }
  }, [phase, loadCart])

  const handlePlaceOrder = async () => {
    setError('')
    setSubmitting(true)
    try {
      const { data } = await checkout()
      setOrder(data)
      setPhase('payment')
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handlePay = async () => {
    if (!order) return
    setError('')
    setSubmitting(true)
    try {
      const { data } = await payOrder(order.id)
      setOrder(data)
      setPhase('success')
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && phase === 'review') {
    return <main className="page-content"><p className="grid-message">Loading checkout...</p></main>
  }

  if (phase === 'review' && !error && (!cart?.items || cart.items.length === 0)) {
    return (
      <main className="page-content checkout-page">
        <h1>Checkout</h1>
        <div className="grid-message">
          <p>Your cart is empty.</p>
          <Link to="/cart" className="back-link">Go to cart</Link>
        </div>
      </main>
    )
  }

  if (phase === 'success' && order) {
    return (
      <main className="page-content checkout-page">
        <div className="checkout-success">
          <h1>Payment Successful</h1>
          <p>Order #{order.id} has been paid. Total: {formatPrice(order.total_amount)}</p>
          <div className="checkout-success-actions">
            <Link to="/orders" className="auth-btn">View Orders</Link>
            <Link to="/" className="back-link">Continue shopping</Link>
          </div>
        </div>
      </main>
    )
  }

  if (phase === 'payment' && order) {
    return (
      <main className="page-content checkout-page">
        <h1>Payment</h1>
        {error && <p className="error-message">{error}</p>}

        <div className="checkout-summary">
          <p>Order <strong>#{order.id}</strong></p>
          <p className="status-badge status-pending">Pending payment</p>
          <p className="checkout-total">Amount due: <strong>{formatPrice(order.total_amount)}</strong></p>

          <ul className="checkout-items">
            {order.items.map((item) => (
              <li key={item.id}>
                {item.product_name} × {item.quantity} — {formatPrice(item.price_at_purchase * item.quantity)}
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="auth-btn"
            onClick={handlePay}
            disabled={submitting}
          >
            {submitting ? 'Processing...' : 'Pay Now (Mock)'}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="page-content checkout-page">
      <h1>Checkout</h1>
      {error && <p className="error-message">{error}</p>}

      <div className="checkout-summary">
        <h2>Order Summary</h2>
        <ul className="checkout-items">
          {cart?.items.map((item) => {
            const imageUrl = getMediaUrl(item.product.image)
            return (
              <li key={item.id} className="checkout-item">
                <div className="checkout-item-image">
                  {imageUrl ? (
                    <img src={imageUrl} alt={item.product.name} />
                  ) : (
                    <div className="placeholder-image" aria-hidden="true">🛒</div>
                  )}
                </div>
                <div className="checkout-item-details">
                  <span>{item.product.name}</span>
                  <span className="checkout-item-meta">
                    {formatPrice(item.product.price)} × {item.quantity}
                  </span>
                </div>
                <span className="checkout-item-total">{formatPrice(item.line_total)}</span>
              </li>
            )
          })}
        </ul>

        <p className="checkout-total">
          Total: <strong>{formatPrice(cart?.total_amount)}</strong>
        </p>

        <button
          type="button"
          className="auth-btn"
          onClick={handlePlaceOrder}
          disabled={submitting}
        >
          {submitting ? 'Placing order...' : 'Place Order'}
        </button>

        <Link to="/cart" className="back-link checkout-back-link">Back to cart</Link>
      </div>
    </main>
  )
}
