import { Link } from 'react-router-dom'

import { formatPrice, getMediaUrl } from '../utils/media'

export default function ProductCard({ product }) {
  const imageUrl = getMediaUrl(product.image)
  const outOfStock = product.stock === 0

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-link">
        <div className={`product-card-image ${outOfStock ? 'out-of-stock' : ''}`}>
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} loading="lazy" />
          ) : (
            <div className="placeholder-image" aria-hidden="true">🛒</div>
          )}
          {outOfStock && <span className="stock-badge">Out of stock</span>}
        </div>
        <div className="product-card-body">
          {product.category_name && (
            <span className="product-badge">{product.category_name}</span>
          )}
          <h3 className="product-name">{product.name}</h3>
          <p className="product-delivery-hint">⚡ 10 min</p>
        </div>
      </Link>
      <div className="product-card-actions">
        <p className="product-price">{formatPrice(product.price)}</p>
        {outOfStock ? (
          <span className="product-add-btn product-add-btn-disabled">SOLD OUT</span>
        ) : (
          <Link to={`/product/${product.id}`} className="product-add-btn">
            ADD
          </Link>
        )}
      </div>
    </article>
  )
}
