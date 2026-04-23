import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProjectById, MOCK_MEMBERS } from '../data/mockData'
import './ProjectEditPage.css'

export default function ProjectEditPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { isManager } = useAuth()

  const project = getProjectById(projectId)

  const [form, setForm] = useState({
    name: project?.name ?? '',
    description: project?.description ?? '',
    status: project?.status ?? 'Ativo',
  })
  const [members, setMembers] = useState(project?.members ?? [])
  const [memberSearch, setMemberSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  // Gate: only managers can edit (defensive — the button is also hidden)
  if (!isManager) {
    return (
      <div className="project-edit-page">
        <p className="project-edit-forbidden">Não tens permissão para editar este projeto.</p>
      </div>
    )
  }

  if (!project) {
    return <div className="project-edit-not-found">Projeto não encontrado.</div>
  }

  const searchResults = memberSearch.trim()
    ? MOCK_MEMBERS.filter(m =>
        !members.find(sel => sel.id === m.id) &&
        m.name.toLowerCase().includes(memberSearch.toLowerCase())
      )
    : []

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  function addMember(member) {
    setMembers(prev => [...prev, member])
    setMemberSearch('')
    setSaved(false)
  }

  function removeMember(id) {
    setMembers(prev => prev.filter(m => m.id !== id))
    setSaved(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    // MOCK: simulate async save
    setTimeout(() => {
      setSubmitting(false)
      setSaved(true)
    }, 400)
    // REAL: uncomment when backend is connected:
    // try {
    //   await api.put(`/projects/${projectId}`, {
    //     name: form.name,
    //     description: form.description,
    //     memberIds: members.map(m => m.id),
    //   })
    //   setSaved(true)
    // } catch { setError('Erro ao guardar alterações.') }
    // finally { setSubmitting(false) }
  }

  return (
    <div className="project-edit-page">
      {/* ── Breadcrumb ──────────────────────────────────────── */}
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
        {/* ── Basic info ──────────────────────────────────── */}
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
          <div className="form-field">
            <label>Estado</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="Ativo">Ativo</option>
              <option value="Concluído">Concluído</option>
              <option value="Pausado">Pausado</option>
            </select>
          </div>
        </div>

        {/* ── Team members ────────────────────────────────── */}
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
                  placeholder="Procurar por nome..."
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                />
              </div>
              {searchResults.length > 0 && (
                <div className="member-search-dropdown">
                  {searchResults.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      className="member-search-result"
                      onClick={() => addMember(m)}
                    >
                      <span className="avatar avatar-sm" style={{ background: m.color }}>{m.initials}</span>
                      {m.name}
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
                <li key={m.id} className="project-edit-member-row">
                  <div className="project-edit-member-info">
                    <span className="avatar avatar-sm" style={{ background: m.color }}>
                      {m.initials}
                    </span>
                    <span className="project-edit-member-name">{m.name}</span>
                  </div>
                  <button
                    type="button"
                    className="project-edit-member-remove"
                    onClick={() => removeMember(m.id)}
                    title="Remover da equipa"
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Actions ─────────────────────────────────────── */}
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
