import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProjectById } from '../services/projectService'
import { useAuth } from '../context/AuthContext'

export default function RetrospectiveListPage() {
    const { projectId } = useParams()
    const { isManager } = useAuth()
    const navigate = useNavigate()

    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        getProjectById(projectId)
            .then(data => setProject(data))
            .catch(() => setError('Failed to load project.'))
            .finally(() => setLoading(false))
    }, [projectId])

    if (loading) return <p className="status-msg">Loading...</p>
    if (error)   return <p className="status-msg error">{error}</p>

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>{project.name}</h1>
                    {project.description && <p className="subtitle">{project.description}</p>}
                </div>
                {/* Only managers and admins can create retrospectives */}
                {isManager && (
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/projects/${projectId}/retrospectives/new`)}
                    >
                        + New Retrospective
                    </button>
                )}
            </div>

            {project.retrospectives.length === 0 ? (
                <p className="empty-state">No retrospectives yet.</p>
            ) : (
                <ul className="card-list">
                    {project.retrospectives.map(retro => (
                        <li key={retro.id} className="card">
                            <Link to={`/retrospectives/${retro.id}`}>
                                <strong>{retro.title}</strong>
                                <span className="date">{new Date(retro.date).toLocaleDateString()}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}