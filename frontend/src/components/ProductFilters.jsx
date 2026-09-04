import { useEffect, useState } from 'react'

export default function ProductFilters({
  filters,
  categories,
  onChange,
  onClear,
}) {
  const [searchInput, setSearchInput] = useState(filters.search || '')

  useEffect(() => {
    setSearchInput(filters.search || '')
  }, [filters.search])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.search || '')) {
        onChange({ search: searchInput })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, filters.search, onChange])

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    onChange({ [name]: value })
  }

  const hasActiveFilters = Boolean(
    filters.search
    || filters.category
    || filters.min_price
    || filters.max_price,
  )

  return (
    <section className="filters-bar" aria-label="Product filters">
      <div className="filter-group filter-search">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="search"
          placeholder="Search products..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={filters.category || ''}
          onChange={handleFieldChange}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="min_price">Min price</label>
        <input
          id="min_price"
          name="min_price"
          type="number"
          min="0"
          step="0.01"
          placeholder="Min"
          value={filters.min_price || ''}
          onChange={handleFieldChange}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="max_price">Max price</label>
        <input
          id="max_price"
          name="max_price"
          type="number"
          min="0"
          step="0.01"
          placeholder="Max"
          value={filters.max_price || ''}
          onChange={handleFieldChange}
        />
      </div>

      {hasActiveFilters && (
        <button type="button" className="btn-clear-filters" onClick={onClear}>
          Clear filters
        </button>
      )}
    </section>
  )
}
