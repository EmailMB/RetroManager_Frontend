import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAllUsers, updateUserRole } from '../services/userService'
import './UsersPage.css'

const ROLE_LABELS = { 0: 'Normal', 1: 'Manager', 2: 'Admin' }
const ROLE_BADGE  = { 0: 'badge-gray', 1: 'badge-blue', 2: 'badge-purple' }

function getInitials(name) {
  return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? '?'
}

function stringToColor(str) {
  const colors = ['#14b8a6','#f97316','#ec4899','#8b5cf6','#4f46e5','#ef4444','#22c55e','#0ea5e9','#a855f7']
  let hash = 0
  for (let i = 0; i < (str?.length ?? 0); i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function UsersPage() {
  const { user, isAdmin } = useAuth()
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [saving, setSaving]     = useState(null)

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (!isAdmin) return <div className="users-page"><p>Acesso restrito a administradores.</p></div>

  const filtered = users.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false
    if (filterRole !== '' && u.role !== Number(filterRole)) return false
    return true
  })

  const countByRole = {
    total: users.length,
    normal:  users.filter(u => u.role === 0).length,
    manager: users.filter(u => u.role === 1).length,
    admin:   users.filter(u => u.role === 2).length,
  }

  async function handleRoleChange(userId, newRole) {
    setSaving(userId)
    const snapshot = users.map(u => ({ ...u }))
    setUsers(us => us.map(u => u.userId === userId ? { ...u, role: newRole } : u))
    try {
      await updateUserRole(userId, newRole)
      const fresh = await getAllUsers()
      setUsers(fresh)
    } catch {
      setUsers(snapshot)
    } finally {
      setSaving(null)
    }
  }

  if (loading) return <div className="users-page"><p>A carregar utilizadores...</p></div>

  return (
    <div className="users-page">
      <div className="users-header">
        <div>
          <h1>Gestão de Utilizadores</h1>
          <p className="users-subtitle">
            Consulta e gere os roles de todos os utilizadores da plataforma.
          </p>
        </div>
      </div>

      <div className="users-stats">
        <div className="users-stat">
          <span className="users-stat-value">{countByRole.total}</span>
          <span className="users-stat-label">Total</span>
        </div>
        <div className="users-stat">
          <span className="users-stat-value">{countByRole.normal}</span>
          <span className="users-stat-label">Normal</span>
        </div>
        <div className="users-stat">
          <span className="users-stat-value">{countByRole.manager}</span>
          <span className="users-stat-label">Manager</span>
        </div>
        <div className="users-stat">
          <span className="users-stat-value">{countByRole.admin}</span>
          <span className="users-stat-label">Admin</span>
        </div>
      </div>

      <div className="users-filters">
        <div className="users-search">
          <svg className="users-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Procurar por nome ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="">Todos os Roles</option>
          <option value="0">Normal</option>
          <option value="1">Manager</option>
          <option value="2">Admin</option>
        </select>
      </div>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Utilizador</th>
              <th>Email</th>
              <th>Role Atual</th>
              <th>Última Alteração</th>
              <th>Alterar Role</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="users-table-empty">Nenhum utilizador encontrado.</td></tr>
            )}
            {filtered.map(u => (
              <tr key={u.userId} className={u.userId === user?.id ? 'users-row-self' : ''}>
                <td>
                  <div className="users-cell-user">
                    <span
                      className="avatar avatar-sm"
                      style={{ background: stringToColor(u.name) }}
                    >
                      {getInitials(u.name)}
                    </span>
                    <span className="users-cell-name">
                      {u.name}
                      {u.userId === user?.id && <span className="users-you-tag"> (Tu)</span>}
                    </span>
                  </div>
                </td>
                <td className="users-cell-email">{u.email}</td>
                <td>
                  <span className={`badge ${ROLE_BADGE[u.role] ?? 'badge-gray'}`}>
                    {ROLE_LABELS[u.role] ?? 'Desconhecido'}
                  </span>
                </td>
                <td className="users-cell-audit">
                  {u.roleUpdatedByName ? (
                    <div className="users-audit-info">
                      <span className="users-audit-by">{u.roleUpdatedByName}</span>
                      {u.roleUpdatedAt && (
                        <span className="users-audit-date">
                          {new Date(u.roleUpdatedAt).toLocaleDateString('pt-PT')}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="users-audit-none">&mdash;</span>
                  )}
                </td>
                <td>
                  {u.userId === user?.id ? (
                    <span className="users-self-hint">N/A</span>
                  ) : (
                    <select
                      className="users-role-select"
                      value={u.role}
                      onChange={e => handleRoleChange(u.userId, Number(e.target.value))}
                      disabled={saving === u.userId}
                    >
                      <option value={0}>Normal</option>
                      <option value={1}>Manager</option>
                      <option value={2}>Admin</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
