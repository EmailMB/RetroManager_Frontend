import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAllProjects } from '../services/projectService'
import './ProjectsPage.css'

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function stringToColor(str) {
  const colors = ['#14b8a6','#f97316','#ec4899','#8b5cf6','#4f46e5','#ef4444','#22c55e','#0ea5e9','#a855f7']
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const { isManager } = useAuth()
  const [search, setSearch] = useState('')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getAllProjects()
      .then(data => setProjects(data))
      .catch(() => setError('Erro ao carregar projetos.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="projects-page"><p>A carregar projetos...</p></div>
  if (error)   return <div className="projects-page"><p className="error-msg">{error}</p></div>

  return (
    <div className="projects-page">
      <div className="projects-header">
        <div>
          <h1>Meus Projetos</h1>
          <p className="projects-subtitle">Gere as retrospectivas de todas as tuas equipas num só lugar.</p>
        </div>
        {isManager && (
          <button className="btn-primary" onClick={() => navigate('/projects/new')}>
            + Novo Projeto
          </button>
        )}
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
            </div>

            <h3 className="project-card-name">{project.name}</h3>
            <p className="project-card-desc">{project.description}</p>

            <div className="project-card-footer">
              <div className="project-card-members">
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
                  <span className="avatar avatar-sm project-card-members-more">
                    +{project.members.length - 3}
                  </span>
                )}
              </div>
              <div className="project-card-stats">
                <span>{project.retrospectives.length} Retrospectivas</span>
                <span>{project.members.length} Membros</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
