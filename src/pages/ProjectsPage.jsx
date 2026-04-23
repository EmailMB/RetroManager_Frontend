import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOCK_PROJECTS } from '../data/mockData'
import './ProjectsPage.css'

function ProjectIcon({ type }) {
  if (type === 'mobile') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    )
  }
  if (type === 'web') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = MOCK_PROJECTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="projects-page">
      <div className="projects-header">
        <div>
          <h1>Meus Projetos</h1>
          <p className="projects-subtitle">Gere as retrospectivas de todas as tuas equipas num só lugar.</p>
        </div>
        {/* Only managers/admins can create projects */}
        {/* {isManager && ( */}
        <button className="btn-primary" onClick={() => navigate('/projects/new')}>
          + Novo Projeto
        </button>
        {/* )} */}
      </div>

      <div className="projects-search">
        <span className="projects-search-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Procurar projeto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="projects-grid">
        {filtered.map(project => (
          <div
            key={project.id}
            className="project-card"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <div className="project-card-top">
              <div className="project-card-icon">
                <ProjectIcon type={project.icon} />
              </div>
              <span className={`badge ${project.status === 'Ativo' ? 'badge-green' : 'badge-gray'}`}>
                {project.status}
              </span>
            </div>

            <h3 className="project-card-name">{project.name}</h3>
            <p className="project-card-desc">{project.description}</p>

            <div className="project-card-footer">
              <div className="project-card-members">
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
                  <span className="avatar avatar-sm project-card-members-more">
                    +{project.totalMembers - 3}
                  </span>
                )}
              </div>
              <div className="project-card-stats">
                <span>{project.totalSessions} Retrospectivas</span>
                {project.pendingActions > 0 ? (
                  <span className="project-card-pending">
                    {project.pendingActions} Ações Pendentes
                  </span>
                ) : (
                  <span className="project-card-done">Todas concluídas</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
