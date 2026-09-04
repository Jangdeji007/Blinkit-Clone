import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { addToCart } from '../api/cart'
import { getProduct } from '../api/products'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/errors'
import { formatPrice, getMediaUrl } from '../utils/media'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [cartMessage, setCartMessage] = useState('')
  const [cartError, setCartError] = useState('')
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadProduct() {
      setLoading(true)
      setError('')
      try {
        const { data } = await getProduct(id)
        if (!cancelled) {
          setProduct(data)
        }
      } catch (err) {
        if (!cancelled) {
          setProduct(null)
          if (err.response?.status === 404) {
            setError('Product not found.')
          } else {
            setError(getApiErrorMessage(err))
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProduct()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return <main className="page-content"><p className="grid-message">Loading product...</p></main>
  }

  if (error || !product) {
    return (
      <main className="page-content">
        <div className="grid-message grid-error">
          <p>{error || 'Product not found.'}</p>
          <Link to="/" className="back-link">Back to home</Link>
        </div>
      </main>
    )
  }

  const imageUrl = getMediaUrl(product.image)
  const outOfStock = product.stock === 0
  const isCustomer = isAuthenticated && user.role === 'customer'

  const handleAddToCart = async () => {
    setCartMessage('')
    setCartError('')
    setAddingToCart(true)
    try {
      await addToCart({ product_id: product.id, quantity })
      setCartMessage('Added to cart!')
    } catch (err) {
      setCartError(getApiErrorMessage(err))
    } finally {
      setAddingToCart(false)
    }
  }

  const handleQuantityChange = (event) => {
    const value = Math.max(1, Math.min(product.stock, Number(event.target.value) || 1))
    setQuantity(value)
  }

  return (
    <main className="page-content product-detail-page">
      <Link to="/" className="back-link">← Back to products</Link>

      <article className="product-detail">
        <div className={`product-detail-image ${outOfStock ? 'out-of-stock' : ''}`}>
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} />
          ) : (
            <div className="placeholder-image placeholder-image-lg" aria-hidden="true">🛒</div>
          )}
          {outOfStock && <span className="stock-badge">Out of stock</span>}
        </div>

        <div className="product-detail-info">
          {product.category_name && (
            <span className="product-badge">{product.category_name}</span>
          )}
          <h1>{product.name}</h1>
          <p className="product-price product-price-lg">{formatPrice(product.price)}</p>
          <p className="product-stock">
            {outOfStock ? 'Currently unavailable' : `${product.stock} in stock`}
          </p>
          {product.description && (
            <p className="product-description">{product.description}</p>
          )}

          {!isAuthenticated && !outOfStock && (
            <p className="product-cart-hint">
              <Link to="/login">Login</Link> to add to cart
            </p>
          )}

          {isCustomer && !outOfStock && (
            <div className="product-cart-actions">
              <label htmlFor="quantity" className="qty-label">Quantity</label>
              <input
                id="quantity"
                type="number"
                className="qty-input"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={handleQuantityChange}
              />
              <button
                type="button"
                className="auth-btn product-detail-btn"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              {cartMessage && <p className="success-message">{cartMessage}</p>}
              {cartError && <p className="error-message">{cartError}</p>}
              <Link to="/cart" className="back-link">View cart</Link>
            </div>
          )}
        </div>
      </article>
    </main>
  )
}
