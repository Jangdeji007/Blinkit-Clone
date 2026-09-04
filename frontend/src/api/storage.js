export const ACCESS_KEY = 'blinkit_access_token'
export const REFRESH_KEY = 'blinkit_refresh_token'
export const USER_KEY = 'blinkit_user'

export function getStoredAuth() {
  const access = localStorage.getItem(ACCESS_KEY)
  const refresh = localStorage.getItem(REFRESH_KEY)
  const userRaw = localStorage.getItem(USER_KEY)

  if (!access || !userRaw) {
    return null
  }

  try {
    const user = JSON.parse(userRaw)
    return { access, refresh, user }
  } catch {
    clearAuth()
    return null
  }
}

export function saveAuth({ access, refresh, user }) {
  localStorage.setItem(ACCESS_KEY, access)
  if (refresh) {
    localStorage.setItem(REFRESH_KEY, refresh)
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}
