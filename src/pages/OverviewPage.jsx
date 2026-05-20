import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAllProjects } from '../services/projectService'
import { getAllActions, updateActionStatus, ActionStatus, ActionStatusLabel } from '../services/actionService'
import { getAllUsers } from '../services/userService'
import './OverviewPage.css'

function getInitials(name) {
  return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? '?'
}

function stringToColor(str) {
  const colors = ['#14b8a6','#f97316','#ec4899','#8b5cf6','#4f46e5','#ef4444','#22c55e','#0ea5e9','#a855f7']
  let hash = 0
  for (let i = 0; i < (str?.length ?? 0); i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function daysOverdue(action) {
  if (action.status === ActionStatus.Complete) return null
  if (!action.expectedCompletionDate) return null
  const exp = new Date(action.expectedCompletionDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  exp.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((today - exp) / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : null
}

function OverdueBadge({ days }) {
  if (!days) return null
  return (
    <span className="overdue-badge" title={`${days} dia${days === 1 ? '' : 's'} em atraso`}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {days}d atraso
    </span>
  )
}

export default function OverviewPage() {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  const [projects, setProjects] = useState([])
  const [actions, setActions]   = useState([])
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)

  const [search, setSearch]               = useState('')
  const [filterProject, setFilterProject] = useState('')
  const [filterStatus, setFilterStatus]   = useState('')

  useEffect(() => {
    const requests = [getAllProjects(), getAllActions()]
    if (isAdmin) requests.push(getAllUsers())

    Promise.all(requests)
      .then(([projectData, actionData, userData]) => {
        setProjects(projectData)
        setActions(actionData)
        if (userData) setUsers(userData)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAdmin])

  const totalRetros  = projects.reduce((s, p) => s + p.retrospectives.length, 0)
  const resolvedCount = actions.filter(a => a.status === ActionStatus.Complete).length
  const resolvedPct   = actions.length > 0 ? Math.round((resolvedCount / actions.length) * 100) : 0
  const pendingCount  = actions.filter(a => a.status === ActionStatus.Pending).length

  const filteredActions = useMemo(() => {
    return actions.filter(a => {
      if (search && !a.description.toLowerCase().includes(search.toLowerCase())) return false
      if (filterProject && a.projectId !== Number(filterProject)) return false
      if (filterStatus && a.status !== Number(filterStatus)) return false
      return true
    })
  }, [actions, search, filterProject, filterStatus])

  const myActions = useMemo(() => {
    return actions.filter(a => a.responsibleUserId === user?.id && a.status !== ActionStatus.Complete)
  }, [actions, user])

  const myCompleted = useMemo(() => {
    return actions.filter(a => a.responsibleUserId === user?.id && a.status === ActionStatus.Complete)
  }, [actions, user])

  const projectOptions = useMemo(() => {
    const map = new Map()
    actions.forEach(a => { if (a.projectId && a.projectName) map.set(a.projectId, a.projectName) })
    return [...map.entries()]
  }, [actions])

  const [statusModalAction, setStatusModalAction] = useState(null)

  async function handleStatusChange(actionId, newStatus, notes) {
    try {
      const updated = await updateActionStatus(actionId, newStatus, notes)
      setActions(prev => prev.map(a => a.id === actionId ? updated : a))
    } catch {
      const fresh = await getAllActions()
      setActions(fresh)
    }
  }

  if (loading) return <div className="overview-page"><p>A carregar...</p></div>

  const headerTitle = isAdmin
    ? `Painel de Administração`
    : `Bom dia, ${user?.name?.split(' ')[0] ?? ''}!`

  const headerSubtitle = isAdmin
    ? 'Visão global de toda a plataforma — projetos, utilizadores e ações.'
    : 'Aqui está o resumo do que está a acontecer nos teus projetos.'

  return (
    <div className="overview-page">
      <div className="overview-header">
        <h1>{headerTitle}</h1>
        <p className="overview-subtitle">{headerSubtitle}</p>
      </div>

      <div className={`overview-stats ${isAdmin ? 'overview-stats-admin' : ''}`}>
        {isAdmin && (
          <div className="overview-stat-card">
            <div className="overview-stat-icon purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="overview-stat-info">
              <span className="overview-stat-value">{users.length}</span>
              <span className="overview-stat-label">Utilizadores</span>
            </div>
          </div>
        )}

        <div className="overview-stat-card">
          <div className="overview-stat-icon blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="overview-stat-info">
            <span className="overview-stat-value">{projects.length}</span>
            <span className="overview-stat-label">{isAdmin ? 'Projetos' : 'Projetos Ativos'}</span>
          </div>
        </div>

        {isAdmin && (
          <div className="overview-stat-card">
            <div className="overview-stat-icon orange">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="overview-stat-info">
              <span className="overview-stat-value">{totalRetros}</span>
              <span className="overview-stat-label">Retrospectivas</span>
            </div>
          </div>
        )}

        <div className="overview-stat-card">
          <div className="overview-stat-icon green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="overview-stat-info">
            <span className="overview-stat-value">{resolvedPct}%</span>
            <span className="overview-stat-label">{isAdmin ? 'Taxa de Resolução' : 'Ações Resolvidas'}</span>
          </div>
        </div>

        {!isAdmin && (
          <div className="overview-stat-card">
            <div className="overview-stat-icon orange">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="overview-stat-info">
              <span className="overview-stat-value">{pendingCount}</span>
              <span className="overview-stat-label">Ações Pendentes</span>
            </div>
          </div>
        )}
      </div>

      <div className={`overview-body ${isAdmin ? 'overview-body-admin' : ''}`}>
        <div className="overview-section overview-all-actions">
          <div className="overview-section-header">
            <h2>{isAdmin ? 'Todas as Ações da Plataforma' : 'Ações da Equipa'}</h2>
          </div>

          <div className="overview-table-filters">
            <div className="overview-search-box">
              <svg className="overview-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder={isAdmin ? 'Procurar em todas as ações...' : 'Procurar ações da equipa...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select value={filterProject} onChange={e => setFilterProject(e.target.value)}>
              <option value="">Todos os Projetos</option>
              {projectOptions.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Estado</option>
              <option value={ActionStatus.Pending}>Pendente</option>
              <option value={ActionStatus.InProgress}>Em Progresso</option>
              <option value={ActionStatus.Complete}>Concluído</option>
            </select>
          </div>

          <table className="overview-table">
            <thead>
              <tr>
                <th>Descrição da Ação</th>
                <th>Projeto / Contexto</th>
                <th>Responsável</th>
                <th>Notas</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredActions.length === 0 && (
                <tr><td colSpan={5} className="overview-table-empty">Nenhuma ação encontrada.</td></tr>
              )}
              {filteredActions.map(a => {
                const overdue = daysOverdue(a)
                return (
                <tr key={a.id} onClick={() => navigate(`/retrospectives/${a.retrospectiveId}`)} className="overview-table-row">
                  <td className="overview-table-desc">
                    <div className="overview-desc-wrapper">
                      <span>{a.description}</span>
                      <OverdueBadge days={overdue} />
                    </div>
                  </td>
                  <td className="overview-table-project">
                    <span className="overview-table-project-name">{a.projectName}</span>
                    <span className="overview-table-retro-name">{a.retrospectiveTitle}</span>
                  </td>
                  <td>
                    <div className="overview-table-responsible">
                      {a.responsibleUserName ? (
                        <>
                          <span
                            className="avatar avatar-sm"
                            style={{ background: stringToColor(a.responsibleUserName) }}
                          >
                            {getInitials(a.responsibleUserName)}
                          </span>
                          <span>
                            {a.responsibleUserName}
                            {a.responsibleUserId === user?.id && <span className="overview-you-tag"> (Tu)</span>}
                          </span>
                        </>
                      ) : (
                        <span className="overview-table-no-one">Sem responsável</span>
                      )}
                    </div>
                  </td>
                  <td className="overview-table-notes">
                    {a.notes ? (
                      <span className="overview-notes-text" title={a.notes}>{a.notes}</span>
                    ) : (
                      <span className="overview-notes-empty">—</span>
                    )}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    {a.responsibleUserId === user?.id && !isAdmin ? (
                      <button
                        className={`overview-status-btn ${
                          a.status === ActionStatus.Complete   ? 'status-green'  :
                          a.status === ActionStatus.InProgress ? 'status-blue'   : 'status-orange'
                        }`}
                        onClick={() => setStatusModalAction(a)}
                      >
                        {ActionStatusLabel[a.status]}
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    ) : (
                      <span className={`badge ${
                        a.status === ActionStatus.Complete   ? 'badge-green'  :
                        a.status === ActionStatus.InProgress ? 'badge-blue'   : 'badge-orange'
                      }`}>
                        {ActionStatusLabel[a.status]?.toUpperCase() ?? 'PENDENTE'}
                      </span>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

        {!isAdmin && (
          <div className="overview-my-actions">
            <div className="overview-my-actions-header">
              <div className="overview-my-actions-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h3>Minhas Ações</h3>
                <span className="overview-my-actions-hint">Tarefas atribuídas a ti</span>
              </div>
            </div>

            <div className="overview-my-actions-list">
              {myActions.length === 0 && myCompleted.length === 0 && (
                <p className="overview-my-actions-empty">Nenhuma ação atribuída.</p>
              )}
              {myActions.map(a => {
                const overdue = daysOverdue(a)
                return (
                <div key={a.id} className="overview-my-action-item">
                  <span className={`overview-my-action-dot ${a.status === ActionStatus.InProgress ? 'dot-blue' : 'dot-orange'}`} />
                  <div className="overview-my-action-info" onClick={() => navigate(`/retrospectives/${a.retrospectiveId}`)}>
                    <span className="overview-my-action-desc">
                      {a.description}
                      <OverdueBadge days={overdue} />
                    </span>
                    <span className="overview-my-action-context">{a.projectName} &middot; {a.retrospectiveTitle}</span>
                  </div>
                  <button
                    className={`overview-status-btn ${
                      a.status === ActionStatus.InProgress ? 'status-blue' : 'status-orange'
                    }`}
                    onClick={() => setStatusModalAction(a)}
                  >
                    {ActionStatusLabel[a.status]}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
              )})}
              {myCompleted.slice(0, 3).map(a => (
                <div
                  key={a.id}
                  className="overview-my-action-item done"
                  onClick={() => navigate(`/retrospectives/${a.retrospectiveId}`)}
                >
                  <span className="overview-my-action-dot dot-green" />
                  <div className="overview-my-action-info">
                    <span className="overview-my-action-desc">{a.description}</span>
                    <span className="overview-my-action-context">Concluído</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {statusModalAction && (
        <StatusChangeModal
          action={statusModalAction}
          onClose={() => setStatusModalAction(null)}
          onConfirm={handleStatusChange}
        />
      )}
    </div>
  )
}

function StatusChangeModal({ action, onClose, onConfirm }) {
  const [status, setStatus] = useState(action.status)
  const [notes, setNotes]   = useState(action.notes || '')
  const [submitting, setSubmitting] = useState(false)

  const OPTS = [
    { value: ActionStatus.Pending,    label: 'Pendente',     cls: 'badge-orange' },
    { value: ActionStatus.InProgress, label: 'Em Progresso', cls: 'badge-blue' },
    { value: ActionStatus.Complete,   label: 'Concluído',    cls: 'badge-green' },
  ]

  async function handleConfirm() {
    setSubmitting(true)
    await onConfirm(action.id, status, notes)
    setSubmitting(false)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Alterar Estado da Ação</h3>
        <p className="modal-action-desc">{action.description}</p>

        <div className="modal-field">
          <label>Estado</label>
          <div className="modal-status-options">
            {OPTS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`modal-status-option ${opt.cls} ${status === opt.value ? 'selected' : ''}`}
                onClick={() => setStatus(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-field">
          <label>Notas (opcional)</label>
          <textarea
            rows={3}
            placeholder="Adiciona contexto sobre esta alteração..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose} disabled={submitting}>Cancelar</button>
          <button className="btn-primary" onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'A guardar...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
