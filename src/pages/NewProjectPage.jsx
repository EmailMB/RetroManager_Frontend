import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MOCK_MEMBERS } from '../data/mockData'
import './NewProjectPage.css'

export default function NewProjectPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    status: 'Ativo',
  })
  const [members, setMembers] = useState([MOCK_MEMBERS[4]]) // Ema Botelho pre-added
  const [memberSearch, setMemberSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const searchResults = memberSearch.trim()
    ? MOCK_MEMBERS.filter(m =>
        !members.find(sel => sel.id === m.id) &&
        m.name.toLowerCase().includes(memberSearch.toLowerCase())
      )
    : []

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function addMember(member) {
    setMembers(prev => [...prev, member])
    setMemberSearch('')
  }

  function removeMember(id) {
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    // MOCK: simulate async creation
    setTimeout(() => {
      navigate('/projects')
    }, 400)
    // REAL: uncomment when backend is connected:
    // try {
    //   const project = await createProject({ ...form, memberIds: members.map(m => m.id) })
    //   navigate(`/projects/${project.id}`)
    // } catch { setError('Erro ao criar projeto.') }
    // finally { setSubmitting(false) }
  }

  return (
    <div className="new-project-page">
      {/* ── Breadcrumb ──────────────────────────────────────── */}
      <div className="new-project-breadcrumb">
        <Link to="/projects">Projetos</Link>
        <span>›</span>
        <span>Novo Projeto</span>
      </div>

      <h1>Criar Novo Projeto</h1>
      <p className="new-project-subtitle">Configura o espaço de trabalho para as retrospectivas da tua equipa.</p>

      <form onSubmit={handleSubmit} className="new-project-form">
        {/* ── Basic info ──────────────────────────────────── */}
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

        {/* ── Team members ────────────────────────────────── */}
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
                  placeholder="Procurar por nome ou email..."
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
              <button type="button" className="btn" onClick={() => {
                const found = MOCK_MEMBERS.find(m =>
                  !members.find(s => s.id === m.id) &&
                  m.name.toLowerCase().includes(memberSearch.toLowerCase())
                )
                if (found) addMember(found)
              }}>
                Adicionar
              </button>
            </div>
          </div>

          {members.length > 0 && (
            <div className="member-chips">
              {members.map(m => (
                <div key={m.id} className="member-chip">
                  <span className="avatar avatar-sm" style={{ background: m.color }}>{m.initials}</span>
                  <span>{m.name}</span>
                  <button type="button" className="member-chip-remove" onClick={() => removeMember(m.id)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Settings ────────────────────────────────────── */}
        <div className="page-card new-project-section">
          <h2>Configurações</h2>
          <div className="new-project-settings-grid">
            <div className="form-field">
              <label>Data de Início</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label>Estado Inicial</label>
              <input
                name="status"
                value={form.status}
                onChange={handleChange}
                placeholder="Ativo"
              />
            </div>
          </div>
        </div>

        {/* ── Actions ─────────────────────────────────────── */}
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
