import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProjectById, updateProject, addProjectMember, removeProjectMember } from '../services/projectService'
import { searchUsers } from '../services/userService'
import './ProjectEditPage.css'

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function stringToColor(str) {
  const colors = ['#14b8a6','#f97316','#ec4899','#8b5cf6','#4f46e5','#ef4444','#22c55e','#0ea5e9','#a855f7']
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function ProjectEditPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { isManager } = useAuth()

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({ name: '', description: '' })
  const [members, setMembers] = useState([])
  const [memberSearch, setMemberSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getProjectById(projectId)
      .then(data => {
        setProject(data)
        setForm({ name: data.name, description: data.description ?? '' })
        setMembers(data.members)
      })
      .catch(() => setError('Projeto não encontrado.'))
      .finally(() => setLoading(false))
  }, [projectId])

  if (!isManager) {
    return (
      <div className="project-edit-page">
        <p className="project-edit-forbidden">Não tens permissão para editar este projeto.</p>
      </div>
    )
  }

  if (loading) return <div className="project-edit-page"><p>A carregar...</p></div>
  if (error || !project) return <div className="project-edit-not-found">{error || 'Projeto não encontrado.'}</div>

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
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

  async function handleAddMember(user) {
    try {
      await addProjectMember(projectId, user.userId)
      setMembers(prev => [...prev, user])
      setMemberSearch('')
      setSearchResults([])
      setSaved(false)
    } catch (err) {
      if (err.response?.status === 409) {
        setMembers(prev => [...prev, user])
      }
    }
  }

  async function handleRemoveMember(userId) {
    try {
      await removeProjectMember(projectId, userId)
      setMembers(prev => prev.filter(m => m.userId !== userId))
      setSaved(false)
    } catch {
      setError('Erro ao remover membro.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await updateProject(projectId, {
        name: form.name,
        description: form.description,
      })
      setSaved(true)
    } catch {
      setError('Erro ao guardar alterações.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="project-edit-page">
      <div className="project-edit-breadcrumb">
        <Link to="/projects">Projetos</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to={`/projects/${projectId}`}>{project.name}</Link>
        <span className="breadcrumb-sep">›</span>
        <span>Definições</span>
      </div>

      <h1>Editar Projeto</h1>
      <p className="project-edit-subtitle">
        Atualiza o nome, descrição ou membros da equipa.
      </p>

      <form onSubmit={handleSubmit} className="project-edit-form">
        <div className="page-card project-edit-section">
          <h2>Informação Básica</h2>
          <div className="form-field">
            <label>Nome do Projeto</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label>Descrição</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </div>

        <div className="page-card project-edit-section">
          <h2>Membros da Equipa ({members.length})</h2>

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
                      onClick={() => handleAddMember(u)}
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

          {members.length === 0 ? (
            <p className="project-edit-empty">Sem membros nesta equipa.</p>
          ) : (
            <ul className="project-edit-member-list">
              {members.map(m => (
                <li key={m.userId} className="project-edit-member-row">
                  <div className="project-edit-member-info">
                    <span className="avatar avatar-sm" style={{ background: stringToColor(m.name) }}>
                      {getInitials(m.name)}
                    </span>
                    <span className="project-edit-member-name">{m.name}</span>
                  </div>
                  <button
                    type="button"
                    className="project-edit-member-remove"
                    onClick={() => handleRemoveMember(m.userId)}
                    title="Remover da equipa"
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="error-msg">{error}</p>}

        <div className="project-edit-actions">
          {saved && <span className="project-edit-saved-msg">Alterações guardadas!</span>}
          <button
            type="button"
            className="btn"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            Voltar
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'A guardar...' : 'Guardar Alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}
