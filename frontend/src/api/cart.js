import api from './axios'

export function getCart() {
  return api.get('/cart/')
}

export function addToCart(body) {
  return api.post('/cart/add/', body)
}

export function removeFromCart(itemId) {
  return api.delete(`/cart/remove/${itemId}/`)
}
