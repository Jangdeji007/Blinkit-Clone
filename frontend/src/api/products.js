import api from './axios'

export function getProducts(params = {}) {
  const query = {}

  if (params.search?.trim()) {
    query.search = params.search.trim()
  }
  if (params.category) {
    query.category = params.category
  }
  if (params.min_price !== '' && params.min_price != null) {
    query.min_price = params.min_price
  }
  if (params.max_price !== '' && params.max_price != null) {
    query.max_price = params.max_price
  }

  return api.get('/products/', { params: query })
}

export function getProduct(id) {
  return api.get(`/products/${id}/`)
}
