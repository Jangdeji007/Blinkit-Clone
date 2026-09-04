import ProductCard from './ProductCard'

export default function ProductGrid({ products, loading, error, onClearFilters }) {
  if (loading) {
    return <p className="grid-message">Loading products...</p>
  }

  if (error) {
    return (
      <div className="grid-message grid-error">
        <p>{error}</p>
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="grid-message grid-empty">
        <p>No products found.</p>
        {onClearFilters && (
          <button type="button" className="btn-clear-filters" onClick={onClearFilters}>
            Clear filters
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <h2 className="section-title">Daily essentials</h2>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  )
}
