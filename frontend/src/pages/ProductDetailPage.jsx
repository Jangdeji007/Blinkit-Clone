import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

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
  const showCartPlaceholder = isAuthenticated && user.role === 'customer'

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

          {showCartPlaceholder && (
            <button type="button" className="auth-btn product-detail-btn" disabled>
              Add to Cart (Phase 3)
            </button>
          )}
        </div>
      </article>
    </main>
  )
}
