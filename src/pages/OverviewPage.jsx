import { useNavigate } from 'react-router-dom'
import { MOCK_PROJECTS, MOCK_USER } from '../data/mockData'
import './OverviewPage.css'

export default function OverviewPage() {
  const navigate = useNavigate()

  const totalSessions  = MOCK_PROJECTS.reduce((s, p) => s + p.totalSessions, 0)
  const totalPending   = MOCK_PROJECTS.reduce((s, p) => s + p.pendingActions, 0)
  const totalCompleted = MOCK_PROJECTS.reduce((s, p) => s + p.completedActions, 0)
  const activeProjects = MOCK_PROJECTS.filter(p => p.status === 'Ativo').length

  // Collect all retrospectives, sorted by date descending
  const allRetros = MOCK_PROJECTS.flatMap(p =>
    p.retrospectives.map(r => ({ ...r, projectName: p.name, projectId: p.id }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4)

  return (
    <div className="overview-page">
      <div className="overview-header">
        <div>
          <h1>Visão Geral</h1>
          <p className="overview-subtitle">
            Olá, {MOCK_USER.name.split(' ')[0]}! Aqui está o resumo de toda a actividade.
          </p>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="overview-stats">
        <div className="overview-stat-card">
          <div className="overview-stat-icon blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="overview-stat-info">
            <span className="overview-stat-value">{activeProjects}</span>
            <span className="overview-stat-label">Projetos Ativos</span>
          </div>
        </div>
        <div className="overview-stat-card">
          <div className="overview-stat-icon purple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div className="overview-stat-info">
            <span className="overview-stat-value">{totalSessions}</span>
            <span className="overview-stat-label">Total de Sessões</span>
          </div>
        </div>
        <div className="overview-stat-card">
          <div className="overview-stat-icon green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="overview-stat-info">
            <span className="overview-stat-value">{totalCompleted}</span>
            <span className="overview-stat-label">Ações Concluídas</span>
          </div>
        </div>
        <div className="overview-stat-card">
          <div className="overview-stat-icon orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="overview-stat-info">
            <span className="overview-stat-value orange">{totalPending}</span>
            <span className="overview-stat-label">Ações Pendentes</span>
          </div>
        </div>
      </div>

      {/* ── Projects quick access ────────────────────────── */}
      <div className="overview-section">
        <div className="overview-section-header">
          <h2>Os Meus Projetos</h2>
          <button className="btn" onClick={() => navigate('/projects')}>Ver todos</button>
        </div>
        <div className="overview-projects">
          {MOCK_PROJECTS.map(p => (
            <div
              key={p.id}
              className="overview-project-item"
              onClick={() => navigate(`/projects/${p.id}`)}
            >
              <div className="overview-project-left">
                <span className={`badge ${p.status === 'Ativo' ? 'badge-green' : 'badge-gray'}`}>
                  {p.status}
                </span>
                <div>
                  <strong>{p.name}</strong>
                  <span className="overview-project-sessions">{p.totalSessions} sessões</span>
                </div>
              </div>
              <span className={`overview-project-pending ${p.pendingActions === 0 ? 'done' : ''}`}>
                {p.pendingActions === 0
                  ? 'Tudo concluído'
                  : `${p.pendingActions} pendentes`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent retrospectives ────────────────────────── */}
      <div className="overview-section">
        <div className="overview-section-header">
          <h2>Retrospectivas Recentes</h2>
        </div>
        <div className="overview-retros">
          {allRetros.map(r => (
            <div
              key={r.id}
              className="overview-retro-item"
              onClick={() => navigate(`/retrospectives/${r.id}`)}
            >
              <div>
                <strong>{r.title}</strong>
                <span className="overview-retro-project">{r.projectName}</span>
              </div>
              <span className={`badge ${r.status === 'Em curso' ? 'badge-blue' : 'badge-gray'}`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
