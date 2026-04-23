import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProjectById } from '../data/mockData'
import './ProjectDetailPage.css'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('pt-PT', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function ActionsProgress({ resolved, total, allDone }) {
  const pct = total > 0 ? (resolved / total) * 100 : 0
  return (
    <div className="retro-progress">
      <span className={`retro-progress-label ${allDone ? 'done' : ''}`}>
        {allDone ? 'Todas Concluídas' : 'Resolução de Ações'}
      </span>
      <div className="retro-progress-bar-wrap">
        <div
          className={`retro-progress-bar ${allDone ? 'done' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="retro-progress-count">{resolved} / {total}</span>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { isManager } = useAuth()
  const [activeTab, setActiveTab] = useState('all')

  const project = getProjectById(projectId)

  if (!project) {
    return <div className="project-detail-not-found">Projeto não encontrado.</div>
  }

  const retros = activeTab === 'pending'
    ? project.retrospectives.filter(r => r.pendingCount > 0)
    : project.retrospectives

  return (
    <div className="project-detail-page">
      {/* ── Breadcrumb ─────────────────────────────────────── */}
      <div className="project-detail-breadcrumb">
        <Link to="/projects">Projetos</Link>
        <span className="breadcrumb-sep">›</span>
        <span>{project.name}</span>
      </div>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="project-detail-header">
        <div className="project-detail-title-row">
          <h1>{project.name}</h1>
          <span className={`badge ${project.status === 'Ativo' ? 'badge-green' : 'badge-gray'}`}>
            {project.status}
          </span>
          <div className="project-detail-header-actions">
            {/* Settings button: only managers/admins */}
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
            {/* Only managers/admins can create retrospectives */}
            {/* {isManager && ( */}
            <button
              className="btn-primary"
              onClick={() => navigate(`/projects/${projectId}/retrospectives/new`)}
            >
              + Nova Retrospectiva
            </button>
            {/* )} */}
          </div>
        </div>

        <p className="project-detail-desc">{project.description}</p>

        <div className="project-detail-team">
          <span className="project-detail-team-label">Equipa ({project.totalMembers}):</span>
          <div className="project-detail-members">
            {project.members.slice(0, 3).map(m => (
              <span
                key={m.id}
                className="avatar avatar-sm"
                style={{ background: m.color }}
                title={m.name}
              >
                {m.initials}
              </span>
            ))}
            {project.totalMembers > 3 && (
              <span className="project-detail-members-more">
                +{project.totalMembers - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="project-detail-stats">
        <div className="stat-card">
          <div className="stat-card-icon blue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <span className="stat-card-label">Total de Sessões</span>
            <span className="stat-card-value">{project.totalSessions}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon purple">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <div>
            <span className="stat-card-label">Ações Geradas</span>
            <span className="stat-card-value">{project.generatedActions}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon green">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <span className="stat-card-label">Ações Concluídas</span>
            <span className="stat-card-value">{project.completedActions}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon orange">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <span className="stat-card-label">Ações Pendentes</span>
            <span className="stat-card-value orange">{project.pendingActions}</span>
          </div>
        </div>
      </div>

      {/* ── Retrospective history ───────────────────────────── */}
      <div className="project-detail-history">
        <div className="project-detail-history-header">
          <h2>Histórico de Retrospectivas</h2>
          <div className="project-detail-tabs">
            <button
              className={`project-detail-tab${activeTab === 'all' ? ' active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Todas
            </button>
            <button
              className={`project-detail-tab${activeTab === 'pending' ? ' active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Com Pendências
            </button>
          </div>
        </div>

        {retros.length === 0 ? (
          <p className="project-detail-empty">Sem retrospectivas nesta categoria.</p>
        ) : (
          <div className="retro-list">
            {retros.map((retro, i) => {
              const allDone = retro.actionsResolved === retro.actionsTotal && retro.actionsTotal > 0
              return (
                <div key={retro.id} className="retro-list-item">
                  <div className="retro-list-item-info">
                    <div className="retro-list-item-title">
                      <strong>{retro.title}</strong>
                      {i === 0 && retro.status === 'Em curso' && (
                        <span className="badge badge-blue retro-badge-recent">MAIS RECENTE</span>
                      )}
                    </div>
                    <span className="retro-list-item-date">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Realizada a {formatDate(retro.date)}
                    </span>
                  </div>

                  <div className="retro-list-item-counts">
                    <span className="retro-count retro-count-positive">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z" />
                        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                      {retro.thumbsUp}
                    </span>
                    <span className="retro-count retro-count-pending">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      {retro.pendingCount}
                    </span>
                  </div>

                  <ActionsProgress
                    resolved={retro.actionsResolved}
                    total={retro.actionsTotal}
                    allDone={allDone}
                  />

                  <button
                    className="btn retro-list-open-btn"
                    onClick={() => navigate(`/retrospectives/${retro.id}`)}
                  >
                    Abrir Quadro
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
