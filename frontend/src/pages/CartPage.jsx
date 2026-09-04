import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { addToCart, getCart, removeFromCart } from '../api/cart'
import { getApiErrorMessage } from '../utils/errors'
import { formatPrice, getMediaUrl } from '../utils/media'

export default function CartPage() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [updatingItemId, setUpdatingItemId] = useState(null)

  const loadCart = useCallback(async () => {
    setError('')
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
    loadCart()
  }, [loadCart])

  const handleIncrease = async (item) => {
    setActionError('')
    setUpdatingItemId(item.id)
    try {
      const { data } = await addToCart({ product_id: item.product.id, quantity: 1 })
      setCart(data)
    } catch (err) {
      setActionError(getApiErrorMessage(err))
    } finally {
      setUpdatingItemId(null)
    }
  }

  const handleDecrease = async (item) => {
    setActionError('')
    setUpdatingItemId(item.id)
    try {
      if (item.quantity <= 1) {
        const { data } = await removeFromCart(item.id)
        setCart(data)
      } else {
        await removeFromCart(item.id)
        const { data } = await addToCart({
          product_id: item.product.id,
          quantity: item.quantity - 1,
        })
        setCart(data)
      }
    } catch (err) {
      setActionError(getApiErrorMessage(err))
      await loadCart()
    } finally {
      setUpdatingItemId(null)
    }
  }

  const handleRemove = async (itemId) => {
    setActionError('')
    setUpdatingItemId(itemId)
    try {
      const { data } = await removeFromCart(itemId)
      setCart(data)
    } catch (err) {
      setActionError(getApiErrorMessage(err))
    } finally {
      setUpdatingItemId(null)
    }
  }

  if (loading) {
    return <main className="page-content"><p className="grid-message">Loading cart...</p></main>
  }

  if (error) {
    return (
      <main className="page-content">
        <div className="grid-message grid-error">
          <p>{error}</p>
          <button type="button" className="btn-link" onClick={loadCart}>Try again</button>
        </div>
      </main>
    )
  }

  const items = cart?.items ?? []
  const isEmpty = items.length === 0

  return (
    <main className="page-content cart-page">
      <h1>Your Cart</h1>

      {actionError && <p className="error-message">{actionError}</p>}

      {isEmpty ? (
        <div className="grid-message">
          <p>Your cart is empty.</p>
          <Link to="/" className="back-link">Continue shopping</Link>
        </div>
      ) : (
        <>
          <div className="cart-table">
            {items.map((item) => {
              const imageUrl = getMediaUrl(item.product.image)
              const isUpdating = updatingItemId === item.id

              return (
                <div key={item.id} className="cart-row">
                  <div className="cart-row-image">
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.product.name} />
                    ) : (
                      <div className="placeholder-image" aria-hidden="true">🛒</div>
                    )}
                  </div>
                  <div className="cart-row-info">
                    <Link to={`/product/${item.product.id}`} className="cart-row-name">
                      {item.product.name}
                    </Link>
                    <p className="cart-row-price">{formatPrice(item.product.price)}</p>
                  </div>
                  <div className="qty-controls">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => handleDecrease(item)}
                      disabled={isUpdating}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => handleIncrease(item)}
                      disabled={isUpdating || item.quantity >= item.product.stock}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <p className="cart-row-total">{formatPrice(item.line_total)}</p>
                  <button
                    type="button"
                    className="btn-link cart-remove-btn"
                    onClick={() => handleRemove(item.id)}
                    disabled={isUpdating}
                  >
                    Remove
                  </button>
                </div>
              )
            })}
          </div>

          <div className="cart-footer">
            <p className="cart-total">
              Total: <strong>{formatPrice(cart.total_amount)}</strong>
            </p>
            <Link to="/checkout" className="auth-btn cart-checkout-btn">
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </main>
  )
}
