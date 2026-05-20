import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createProject, addProjectMember } from '../services/projectService'
import { searchUsers } from '../services/userService'
import './NewProjectPage.css'

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function stringToColor(str) {
  const colors = ['#14b8a6','#f97316','#ec4899','#8b5cf6','#4f46e5','#ef4444','#22c55e','#0ea5e9','#a855f7']
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function NewProjectPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    description: '',
  })
  const [members, setMembers] = useState([])
  const [memberSearch, setMemberSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleMemberSearch(query) {
    setMemberSearch(query)
    if (query.trim().length < 2) {
      setSearchResults([])
      return
    }
    try {
      const results = await searchUsers(query.trim())
      setSearchResults(results.filter(u => !members.find(m => m.userId === u.userId)))
    } catch {
      setSearchResults([])
    }
  }

  function addMember(user) {
    setMembers(prev => [...prev, user])
    setMemberSearch('')
    setSearchResults([])
  }

  function removeMember(userId) {
    setMembers(prev => prev.filter(m => m.userId !== userId))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const project = await createProject({
        name: form.name,
        description: form.description,
      })

      for (const member of members) {
        try {
          await addProjectMember(project.id, member.userId)
        } catch { /* ignore */ }
      }

      navigate(`/projects/${project.id}`)
    } catch {
      setError('Erro ao criar projeto.')
      setSubmitting(false)
    }
  }

  return (
    <div className="new-project-page">
      <div className="new-project-breadcrumb">
        <Link to="/projects">Projetos</Link>
        <span>›</span>
        <span>Novo Projeto</span>
      </div>

      <h1>Criar Novo Projeto</h1>
      <p className="new-project-subtitle">Configura o espaço de trabalho para as retrospectivas da tua equipa.</p>

      <form onSubmit={handleSubmit} className="new-project-form">
        <div className="page-card new-project-section">
          <h2>Informação Básica</h2>
          <div className="form-field">
            <label>Nome do Projeto</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Ex: Aplicação Web v2"
            />
          </div>
          <div className="form-field">
            <label>Descrição</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Qual o objetivo principal desta equipa ou projeto?"
            />
          </div>
        </div>

        <div className="page-card new-project-section">
          <h2>Membros da Equipa</h2>
          <div className="form-field">
            <label>Adicionar Membros</label>
            <div className="member-search-row">
              <div className="member-search-input-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Procurar por email..."
                  value={memberSearch}
                  onChange={e => handleMemberSearch(e.target.value)}
                />
              </div>
              {searchResults.length > 0 && (
                <div className="member-search-dropdown">
                  {searchResults.map(u => (
                    <button
                      key={u.userId}
                      type="button"
                      className="member-search-result"
                      onClick={() => addMember(u)}
                    >
                      <span className="avatar avatar-sm" style={{ background: stringToColor(u.name) }}>
                        {getInitials(u.name)}
                      </span>
                      <span>{u.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 'auto' }}>{u.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {members.length > 0 && (
            <div className="member-chips">
              {members.map(m => (
                <div key={m.userId} className="member-chip">
                  <span className="avatar avatar-sm" style={{ background: stringToColor(m.name) }}>
                    {getInitials(m.name)}
                  </span>
                  <span>{m.name}</span>
                  <button type="button" className="member-chip-remove" onClick={() => removeMember(m.userId)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="error-msg">{error}</p>}

        <div className="new-project-actions">
          <button type="button" className="btn" onClick={() => navigate('/projects')}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {submitting ? 'A criar...' : 'Criar Projeto'}
          </button>
        </div>
      </form>
    </div>
  )
}
