import { createContext, useContext, useState } from 'react'
import { MOCK_USER } from '../data/mockData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // MOCK MODE: user is pre-set to mock user — no real authentication needed.
  // When integrating with the backend, replace the initial state below with
  // the real localStorage rehydration logic (see commented block).
  const [user, setUser] = useState(MOCK_USER)
  const [token, setToken] = useState('mock-token')

  // REAL AUTH (uncomment when backend is connected):
  // const [user, setUser] = useState(() => {
  //   const saved = localStorage.getItem('user')
  //   return saved ? JSON.parse(saved) : null
  // })
  // const [token, setToken] = useState(() => localStorage.getItem('token'))

  // Called after a successful login response from the backend.
  // Stores the JWT and the user object (id, name, email, role as int).
  function login(userData, jwt) {
    setUser(userData)
    setToken(jwt)
    // REAL AUTH: uncomment when backend is connected:
    // localStorage.setItem('user', JSON.stringify(userData))
    // localStorage.setItem('token', jwt)
  }

  // Clears all session data — called on logout or on 401 response.
  function logout() {
    setUser(null)
    setToken(null)
    // REAL AUTH: uncomment when backend is connected:
    // localStorage.removeItem('user')
    // localStorage.removeItem('token')
  }

  // Convenience flags derived from the numeric role value.
  // Role values: Normal=0, Manager=1, Admin=2 (matches backend UserRole enum).
  const isManager = user?.role === 1 || user?.role === 2
  const isAdmin   = user?.role === 2

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isManager, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook for consuming the auth context in any component.
export function useAuth() {
  return useContext(AuthContext)
}
