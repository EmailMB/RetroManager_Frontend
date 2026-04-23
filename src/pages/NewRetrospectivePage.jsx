import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProjectById } from '../data/mockData'
import './NewRetrospectivePage.css'

export default function NewRetrospectivePage() {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const project = getProjectById(projectId)

  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '',
  })
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    // MOCK: simulate creation and navigate back
    setTimeout(() => {
      navigate(`/projects/${projectId}`)
    }, 400)
    // REAL: uncomment when backend is connected:
    // try {
    //   const retro = await createRetrospective(projectId, {
    //     title: form.title,
    //     date: new Date(`${form.date}T${form.time || '09:00'}`).toISOString(),
    //   })
    //   navigate(`/retrospectives/${retro.id}`)
    // } catch { setError('Erro ao criar retrospectiva.') }
    // finally { setSubmitting(false) }
  }

  function handleSaveDraft(e) {
    e.preventDefault()
    // MOCK: save draft — navigate back for now
    navigate(`/projects/${projectId}`)
  }

  return (
    <div className="new-retro-page">
      {/* ── Breadcrumb ──────────────────────────────────────── */}
      <div className="new-retro-breadcrumb">
        <Link to="/projects">Projetos</Link>
        <span>›</span>
        {project ? (
          <Link to={`/projects/${projectId}`}>{project.name}</Link>
        ) : (
          <span>Projeto</span>
        )}
        <span>›</span>
        <span>Nova Retrospectiva</span>
      </div>

      <h1>Agendar Retrospectiva</h1>
      <p className="new-retro-subtitle">
        Prepara a próxima sessão de reflexão e melhoria contínua da equipa.
      </p>

      <form onSubmit={handleSubmit} className="new-retro-form">
        <div className="page-card new-retro-section">
          <h2>Detalhes da Sessão</h2>

          {/* Projeto Associado (read-only) */}
          <div className="form-field">
            <label>Projeto Associado</label>
            <input
              type="text"
              value={project?.name ?? ''}
              readOnly
              disabled
            />
          </div>

          {/* Título */}
          <div className="form-field">
            <label>Título da Retrospectiva</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              maxLength={255}
              placeholder="Ex: Sprint 26 - Lançamento"
            />
          </div>

          {/* Date + Time row */}
          <div className="new-retro-date-row">
            <div className="form-field">
              <label>Data Agendada</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label>Hora</label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* ── Actions ─────────────────────────────────────── */}
        <div className="new-retro-actions">
          <button type="button" className="btn" onClick={() => navigate(`/projects/${projectId}`)}>
            Cancelar
          </button>
          <button type="button" className="btn new-retro-draft-btn" onClick={handleSaveDraft}>
            Guardar Rascunho
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'A criar...' : 'Criar Retrospectiva →'}
          </button>
        </div>
      </form>
    </div>
  )
}
