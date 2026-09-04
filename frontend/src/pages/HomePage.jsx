import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { getProducts } from '../api/products'
import ProductFilters from '../components/ProductFilters'
import ProductGrid from '../components/ProductGrid'
import { useAuth } from '../context/AuthContext'
import { extractCategories } from '../utils/categories'
import { getApiErrorMessage } from '../utils/errors'

function filtersFromParams(searchParams) {
  return {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
  }
}

function paramsFromFilters(filters) {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.category) params.set('category', filters.category)
  if (filters.min_price) params.set('min_price', filters.min_price)
  if (filters.max_price) params.set('max_price', filters.max_price)
  return params
}

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams])

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadCategories() {
      try {
        const { data } = await getProducts()
        if (!cancelled) {
          setCategories(extractCategories(data))
        }
      } catch {
        if (!cancelled) {
          setCategories([])
        }
      }
    }

    loadCategories()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      setLoading(true)
      setError('')
      try {
        const { data } = await getProducts(filters)
        if (!cancelled) {
          setProducts(data)
        }
      } catch (err) {
        if (!cancelled) {
          setProducts([])
          setError(getApiErrorMessage(err))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProducts()
    return () => {
      cancelled = true
    }
  }, [filters])

  const updateFilters = useCallback((updates) => {
    const next = { ...filters, ...updates }
    setSearchParams(paramsFromFilters(next))
  }, [filters, setSearchParams])

  const clearFilters = useCallback(() => {
    setSearchParams({})
  }, [setSearchParams])

  return (
    <main className="page-content home-catalog">
      <section className="home-hero">
        <div>
          <h1>Grocery &amp; Kitchen</h1>
          <p>
            {isAuthenticated
              ? `Welcome back, ${user.username}! Delivered in minutes.`
              : 'Fresh groceries delivered to your doorstep in minutes.'}
          </p>
        </div>
      </section>

      <ProductFilters
        filters={filters}
        categories={categories}
        onChange={updateFilters}
        onClear={clearFilters}
      />

      <ProductGrid
        products={products}
        loading={loading}
        error={error}
        onClearFilters={clearFilters}
      />
    </main>
  )
}
