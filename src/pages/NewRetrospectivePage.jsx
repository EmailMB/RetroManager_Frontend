import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProjectById } from '../services/projectService'
import { createRetrospective } from '../services/retrospectiveService'
import { getAccessibleTemplates } from '../services/retroTemplateService'
import './NewRetrospectivePage.css'

export default function NewRetrospectivePage() {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const [project, setProject]     = useState(null)
  const [templates, setTemplates] = useState([])

  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '',
    templateId: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getProjectById(projectId).then(setProject).catch(() => {})
    getAccessibleTemplates().then(setTemplates).catch(() => {})
  }, [projectId])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const retro = await createRetrospective(projectId, {
        title: form.title,
        date: new Date(`${form.date}T${form.time || '09:00'}`).toISOString(),
        templateId: form.templateId ? Number(form.templateId) : null,
      })
      navigate(`/retrospectives/${retro.id}`)
    } catch {
      setError('Erro ao criar retrospectiva.')
      setSubmitting(false)
    }
  }

  return (
    <div className="new-retro-page">
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

          <div className="form-field">
            <label>Projeto Associado</label>
            <input
              type="text"
              value={project?.name ?? 'A carregar...'}
              readOnly
              disabled
            />
          </div>

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

          <div className="form-field">
            <label>Template (opcional)</label>
            <select
              name="templateId"
              value={form.templateId}
              onChange={handleChange}
            >
              <option value="">Sem template — começar do zero</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.columns.length} colunas){t.isGlobal ? ' · Global' : ''}
                </option>
              ))}
            </select>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
              As colunas do template serão criadas automaticamente.
            </small>
          </div>

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

        {error && <p className="error-msg">{error}</p>}

        <div className="new-retro-actions">
          <button type="button" className="btn" onClick={() => navigate(`/projects/${projectId}`)}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'A criar...' : 'Criar Retrospectiva →'}
          </button>
        </div>
      </form>
    </div>
  )
}
