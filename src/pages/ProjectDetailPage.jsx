import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProjectById } from '../services/projectService'
import './ProjectDetailPage.css'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('pt-PT', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function stringToColor(str) {
  const colors = ['#14b8a6','#f97316','#ec4899','#8b5cf6','#4f46e5','#ef4444','#22c55e','#0ea5e9','#a855f7']
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function ProjectDetailPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { isManager } = useAuth()

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    getProjectById(projectId)
      .then(data => setProject(data))
      .catch(() => setError('Projeto não encontrado.'))
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) return <div className="project-detail-page"><p>A carregar...</p></div>
  if (error || !project) return <div className="project-detail-not-found">{error || 'Projeto não encontrado.'}</div>

  return (
    <div className="project-detail-page">
      <div className="project-detail-breadcrumb">
        <Link to="/projects">Projetos</Link>
        <span className="breadcrumb-sep">›</span>
        <span>{project.name}</span>
      </div>

      <div className="project-detail-header">
        <div className="project-detail-title-row">
          <h1>{project.name}</h1>
          <div className="project-detail-header-actions">
            {isManager && (
              <button
                className="btn project-detail-settings-btn"
                title="Definições do projeto"
                onClick={() => navigate(`/projects/${projectId}/edit`)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            )}
            {isManager && (
              <button
                className="btn-primary"
                onClick={() => navigate(`/projects/${projectId}/retrospectives/new`)}
              >
                + Nova Retrospectiva
              </button>
            )}
          </div>
        </div>

        <p className="project-detail-desc">{project.description}</p>

        <div className="project-detail-team">
          <span className="project-detail-team-label">Equipa ({project.members.length}):</span>
          <div className="project-detail-members">
            {project.members.slice(0, 3).map(m => (
              <span
                key={m.userId}
                className="avatar avatar-sm"
                style={{ background: stringToColor(m.name) }}
                title={m.name}
              >
                {getInitials(m.name)}
              </span>
            ))}
            {project.members.length > 3 && (
              <span className="project-detail-members-more">
                +{project.members.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="project-detail-stats">
        <div className="stat-card">
          <div className="stat-card-icon blue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <span className="stat-card-label">Total de Sessões</span>
            <span className="stat-card-value">{project.retrospectives.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon purple">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <span className="stat-card-label">Membros da Equipa</span>
            <span className="stat-card-value">{project.members.length}</span>
          </div>
        </div>
      </div>

      <div className="project-detail-history">
        <div className="project-detail-history-header">
          <h2>Histórico de Retrospectivas</h2>
        </div>

        {project.retrospectives.length === 0 ? (
          <p className="project-detail-empty">Sem retrospectivas neste projeto.</p>
        ) : (
          <div className="retro-list">
            {project.retrospectives.map(retro => (
              <div key={retro.id} className="retro-list-item">
                <div className="retro-list-item-info">
                  <div className="retro-list-item-title">
                    <strong>{retro.title}</strong>
                  </div>
                  <span className="retro-list-item-date">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {formatDate(retro.date)}
                  </span>
                </div>

                <button
                  className="btn retro-list-open-btn"
                  onClick={() => navigate(`/retrospectives/${retro.id}`)}
                >
                  Abrir Quadro
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
