import api from './axios'

export function login(credentials) {
  return api.post('/auth/login/', credentials)
}

export function signup(data) {
  return api.post('/auth/signup/', data)
}
