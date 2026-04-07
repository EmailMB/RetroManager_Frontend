import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Maps the numeric role value to a human-readable label.
// Must stay in sync with the backend UserRole enum: Normal=0, Manager=1, Admin=2.
const ROLE_LABEL = { 0: 'User', 1: 'Manager', 2: 'Admin' }

export default function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Clear auth state and redirect to login page.
  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/projects" className="navbar-brand">RetroManager</Link>

      {/* Only rendered when a user session is active */}
      {user && (
        <div className="navbar-user">
          <span>{user.name} — {ROLE_LABEL[user.role]}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  )
}
