import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import * as authApi from '../api/auth'
import { clearAuth, getStoredAuth, saveAuth } from '../api/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = getStoredAuth()
    if (stored) {
      setUser(stored.user)
      setToken(stored.access)
    }
    setIsLoading(false)
  }, [])

  const applyAuth = useCallback((data) => {
    const authUser = { username: data.username, role: data.role }
    saveAuth({
      access: data.access,
      refresh: data.refresh,
      user: authUser,
    })
    setUser(authUser)
    setToken(data.access)
    return authUser.role
  }, [])

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials)
    return applyAuth(data)
  }, [applyAuth])

  const signup = useCallback(async (formData) => {
    await authApi.signup(formData)
    return login({ username: formData.username, password: formData.password })
  }, [login])

  const logout = useCallback(() => {
    clearAuth()
    setUser(null)
    setToken(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      login,
      signup,
      logout,
    }),
    [user, token, isLoading, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
