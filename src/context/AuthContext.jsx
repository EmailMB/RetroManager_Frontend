import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  function login(userData, jwt) {
    setUser(userData)
    setToken(jwt)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', jwt)
  }

  function updateUser(updatedFields) {
    setUser(prev => {
      const next = { ...prev, ...updatedFields }
      localStorage.setItem('user', JSON.stringify(next))
      return next
    })
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const isManager = user?.role === 1 || user?.role === 2
  const isAdmin   = user?.role === 2

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isManager, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
