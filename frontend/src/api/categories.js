import api from './axios'

export function getCategories() {
  return api.get('/categories/')
}
