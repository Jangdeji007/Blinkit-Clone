import api from './axios'

export function checkout() {
  return api.post('/orders/checkout/')
}

export function payOrder(orderId) {
  return api.post(`/orders/${orderId}/pay/`)
}

export function getOrders() {
  return api.get('/orders/')
}
