import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getRetrospectiveById,
  updateRetrospective,
  closeRetrospective,
  reopenRetrospective,
} from '../services/retrospectiveService'
import {
  getTicketsByRetroId,
  createTicket,
  deleteTicket,
  toggleVote,
} from '../services/ticketService'
import {
  getColumnsByRetroId,
  createColumn,
  deleteColumn,
  lockColumn,
  unlockColumn,
  startColumnTimer,
  stopColumnTimer,
} from '../services/retroColumnService'
import {
  getActionsByRetroId,
  createAction,
  updateActionStatus,
  deleteAction,
  ActionStatus,
  ActionStatusLabel,
} from '../services/actionService'
import { getAttendances, updateAttendance } from '../services/attendanceService'
import { getProjectById } from '../services/projectService'
import './RetrospectiveBoardPage.css'
/* eslint-disable react/prop-types */

const STATUS_OPTIONS = [
  { value: ActionStatus.Pending,    label: ActionStatusLabel[ActionStatus.Pending],    badgeClass: 'badge-orange' },
  { value: ActionStatus.InProgress, label: ActionStatusLabel[ActionStatus.InProgress], badgeClass: 'badge-blue'   },
  { value: ActionStatus.Complete,   label: ActionStatusLabel[ActionStatus.Complete],   badgeClass: 'badge-green'  },
]

function statusBadgeClass(status) {
  if (status === ActionStatus.InProgress) return 'badge badge-blue'
  if (status === ActionStatus.Complete)   return 'badge badge-green'
  return 'badge badge-orange'
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

function formatDate(d) {
  if (!d) return null
  return new Date(d).toLocaleDateString('pt-PT')
}

function daysOverdue(action) {
  if (action.status === ActionStatus.Complete) return null
  if (!action.expectedCompletionDate) return null
  const exp = new Date(action.expectedCompletionDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  exp.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((today - exp) / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : null
}

function TicketCard({ card, canDelete, onDelete, onToggleVote, disabled }) {
  return (
    <div className="board-card">
      <p className="board-card-text">{card.content}</p>
      <div className="board-card-footer">
        <button
          className={`ticket-vote-btn ${card.hasVoted ? 'voted' : ''}`}
          title={card.hasVoted ? 'Remover voto' : 'Votar neste ticket'}
          onClick={e => { e.stopPropagation(); !disabled && onToggleVote(card.id) }}
          disabled={disabled}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill={card.hasVoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M7 10v12" />
            <path d="M15 5.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7l-4-2V10l4-7h2.91a1 1 0 0 1 .92 1.39l-.83 1.49z" />
          </svg>
          <span>{card.voteCount}</span>
        </button>
        {canDelete && (
          <button
            className="board-card-delete-btn ticket-delete-inline"
            title="Eliminar ticket"
            onClick={e => { e.stopPropagation(); onDelete(card.id) }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

function ActionCard({ action, canDelete, canChangeStatus, onDelete, onOpenStatus }) {
  const assigneeName = action.responsibleUserName || 'Por definir'
  const overdue = daysOverdue(action)
  return (
    <div className={`board-card board-card-action ${overdue ? 'is-overdue' : ''}`}>
      <div className="board-card-action-top">
        <p className="board-card-text">{action.description}</p>
        {canDelete && (
          <button
            className="board-card-delete-btn"
            title="Eliminar ação"
            onClick={e => { e.stopPropagation(); onDelete(action.id) }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
          </button>
        )}
      </div>

      {(action.expectedCompletionDate || action.completedAt) && (
        <div className="board-card-action-dates">
          {action.expectedCompletionDate && (
            <span className={`board-card-date ${overdue ? 'atrasada' : 'prevista'}`}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
              </svg>
              Prevista: {formatDate(action.expectedCompletionDate)}
              {overdue && <strong> ({overdue}d atraso)</strong>}
            </span>
          )}
          {action.completedAt && (
            <span className="board-card-date concluida">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Concluída: {formatDate(action.completedAt)}
            </span>
          )}
        </div>
      )}

      <div className="board-card-action-footer">
        <div className="board-card-assignee">
          <span
            className="avatar avatar-sm"
            style={{ background: action.responsibleUserName ? stringToColor(assigneeName) : '#9ca3af' }}
          >
            {action.responsibleUserName ? getInitials(assigneeName) : '?'}
          </span>
          <span className="board-card-assignee-label">{assigneeName}</span>
        </div>
        {canChangeStatus ? (
          <button
            className={`board-status-btn ${statusBadgeClass(action.status).replace('badge ', '')}`}
            onClick={() => onOpenStatus(action)}
          >
            {ActionStatusLabel[action.status]}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        ) : (
          <span className={`badge ${statusBadgeClass(action.status).replace('badge ', '')}`}>
            {ActionStatusLabel[action.status]}
          </span>
        )}
      </div>
    </div>
  )
}

function StatusChangeModal({ action, onClose, onConfirm }) {
  const [status, setStatus] = useState(action.status)
  const [notes, setNotes]   = useState(action.notes || '')
  const [submitting, setSubmitting] = useState(false)

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
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`modal-status-option ${opt.badgeClass} ${status === opt.value ? 'selected' : ''}`}
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

function AddColumnModal({ onClose, onConfirm }) {
  const [name, setName]   = useState('')
  const [color, setColor] = useState('#4f46e5')
  const [submitting, setSubmitting] = useState(false)

  const COLORS = ['#22c55e','#f97316','#3b82f6','#a855f7','#ec4899','#06b6d4','#f59e0b','#ef4444']

  async function handleConfirm() {
    if (!name.trim()) return
    setSubmitting(true)
    await onConfirm(name.trim(), color)
    setSubmitting(false)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Nova Coluna</h3>

        <div className="modal-field">
          <label>Nome da coluna</label>
          <input
            type="text"
            placeholder="Ex: Positivo, A Melhorar, Ideias..."
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={80}
            autoFocus
          />
        </div>

        <div className="modal-field">
          <label>Cor</label>
          <div className="modal-color-grid">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                className={`modal-color-swatch ${color === c ? 'selected' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose} disabled={submitting}>Cancelar</button>
          <button className="btn-primary" onClick={handleConfirm} disabled={submitting || !name.trim()}>
            {submitting ? 'A criar...' : 'Criar Coluna'}
          </button>
        </div>
      </div>
    </div>
  )
}

function TimerModal({ columnName, onClose, onStart }) {
  const [minutes, setMinutes] = useState(5)
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Iniciar Timer — {columnName}</h3>
        <p className="modal-action-desc">A coluna será automaticamente bloqueada quando o timer terminar.</p>

        <div className="modal-field">
          <label>Duração (minutos)</label>
          <input
            type="number"
            min="1"
            max="120"
            value={minutes}
            onChange={e => setMinutes(Number(e.target.value))}
            autoFocus
          />
        </div>

        <div className="modal-quick-times">
          {[1, 3, 5, 10, 15].map(m => (
            <button key={m} type="button" className="btn" onClick={() => setMinutes(m)}>
              {m} min
            </button>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={() => { onStart(minutes * 60); onClose() }}>
            Iniciar
          </button>
        </div>
      </div>
    </div>
  )
}

function ColumnTimerDisplay({ column, onExpire }) {
  const [now, setNow] = useState(Date.now())
  const active = !!(column.timerStartedAt && column.timerDurationSeconds)

  const startedAt = active ? new Date(column.timerStartedAt).getTime() : 0
  const elapsed   = active ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0
  const remaining = active ? Math.max(0, column.timerDurationSeconds - elapsed) : 0

  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [active])

  useEffect(() => {
    if (active && remaining === 0 && !column.isLocked) onExpire?.(column.id)
  }, [active, remaining, column.isLocked, column.id, onExpire])

  if (!active) return null

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div className={`column-timer ${remaining < 30 ? 'timer-warning' : ''} ${remaining === 0 ? 'timer-expired' : ''}`}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
      <span>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
    </div>
  )
}

function Column({
  column, tickets, canAddTickets, canManageColumn, canDeleteTickets,
  onAddTicket, onDeleteTicket, onDeleteColumn, onToggleVote,
  onStartTimer, onStopTimer, onLockColumn, onUnlockColumn,
  onTimerExpired, frozen
}) {
  const [adding, setAdding] = useState(false)
  const [text, setText]     = useState('')
  const [showTimerModal, setShowTimerModal] = useState(false)

  async function submit() {
    if (!text.trim()) return
    await onAddTicket(column.id, text.trim())
    setText('')
    setAdding(false)
  }

  const timerActive = !!(column.timerStartedAt && column.timerDurationSeconds)
  const locked = column.isLocked

  return (
    <>
      <div className="board-column">
        <div className="board-column-header" style={{ borderTopColor: column.color, background: column.color + '15' }}>
          <div className="board-column-title">
            <span className="board-column-color-dot" style={{ background: column.color }} />
            <span>{column.name}</span>
          </div>
          <div className="board-column-header-right">
            <ColumnTimerDisplay column={column} onExpire={onTimerExpired} />
            <span className="board-column-count">{tickets.length}</span>
            {canManageColumn && !frozen && (
              <>
                {timerActive ? (
                  <button
                    className="board-column-icon-btn"
                    title="Parar timer"
                    onClick={() => onStopTimer(column.id)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="6" width="12" height="12" rx="1" />
                    </svg>
                  </button>
                ) : (
                  <button
                    className="board-column-icon-btn"
                    title="Iniciar timer"
                    onClick={() => setShowTimerModal(true)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                  </button>
                )}
                <button
                  className="board-column-icon-btn"
                  title={locked ? 'Desbloquear coluna' : 'Bloquear coluna'}
                  onClick={() => locked ? onUnlockColumn(column.id) : onLockColumn(column.id)}
                >
                  {locked ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                </button>
                <button
                  className="board-column-icon-btn board-column-delete"
                  title="Eliminar coluna"
                  onClick={() => onDeleteColumn(column.id)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
        <div className="board-column-body">
          {tickets.map(t => (
            <TicketCard
              key={t.id}
              card={t}
              canDelete={canDeleteTickets || t.isOwner}
              onDelete={onDeleteTicket}
              onToggleVote={onToggleVote}
              disabled={frozen}
            />
          ))}

          {canAddTickets && !locked && !frozen && (
            adding ? (
              <div className="board-add-form">
                <textarea
                  autoFocus
                  rows={3}
                  placeholder="Escreve aqui..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                />
                <div className="board-add-form-actions">
                  <button className="btn-primary" onClick={submit}>Adicionar</button>
                  <button className="btn" onClick={() => { setAdding(false); setText('') }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <button className="board-add-btn" onClick={() => setAdding(true)}>
                + Adicionar Cartão
              </button>
            )
          )}
          {locked && <div className="board-locked-hint">Coluna bloqueada</div>}
        </div>
      </div>

      {showTimerModal && (
        <TimerModal
          columnName={column.name}
          onClose={() => setShowTimerModal(false)}
          onStart={(seconds) => onStartTimer(column.id, seconds)}
        />
      )}
    </>
  )
}

function ActionsColumn({ actions, canCreate, canDelete, currentUserId, isManager, projectMembers, onCreate, onDelete, onOpenStatus, frozen }) {
  const [adding, setAdding] = useState(false)
  const [text, setText]     = useState('')
  const [responsible, setResponsible] = useState('')
  const [expectedDate, setExpectedDate] = useState('')

  async function submit() {
    if (!text.trim()) return
    await onCreate(text.trim(), responsible ? Number(responsible) : null, expectedDate || null)
    setText('')
    setResponsible('')
    setExpectedDate('')
    setAdding(false)
  }

  return (
    <div className="board-column">
      <div className="board-column-header col-blue">
        <div className="board-column-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          </svg>
          <span>Ações</span>
        </div>
        <span className="board-column-count">{actions.length}</span>
      </div>
      <div className="board-column-body">
        {actions.map(a => (
          <ActionCard
            key={a.id}
            action={a}
            canDelete={canDelete}
            canChangeStatus={(isManager || a.responsibleUserId === currentUserId) && !frozen}
            onDelete={onDelete}
            onOpenStatus={onOpenStatus}
          />
        ))}

        {canCreate && !frozen && (
          adding ? (
            <div className="board-add-form">
              <textarea
                autoFocus
                rows={3}
                placeholder="Descreve a ação..."
                value={text}
                onChange={e => setText(e.target.value)}
              />
              <select
                className="board-add-form-select"
                value={responsible}
                onChange={e => setResponsible(e.target.value)}
              >
                <option value="">Sem responsável</option>
                {projectMembers.map(m => (
                  <option key={m.userId} value={m.userId}>{m.name}</option>
                ))}
              </select>
              <div className="board-add-form-field">
                <label>Data prevista (opcional)</label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={e => setExpectedDate(e.target.value)}
                />
              </div>
              <div className="board-add-form-actions">
                <button className="btn-primary" onClick={submit}>Adicionar</button>
                <button className="btn" onClick={() => { setAdding(false); setText(''); setResponsible(''); setExpectedDate('') }}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button className="board-add-btn" onClick={() => setAdding(true)}>
              + Adicionar Ação
            </button>
          )
        )}
      </div>
    </div>
  )
}

export default function RetrospectiveBoardPage() {
  const { retroId } = useParams()
  const navigate = useNavigate()
  const { user, isManager } = useAuth()

  const [retro, setRetro]         = useState(null)
  const [project, setProject]     = useState(null)
  const [columns, setColumns]     = useState([])
  const [tickets, setTickets]     = useState([])
  const [actions, setActions]     = useState([])
  const [attendance, setAttendance] = useState({})
  const [projectMembers, setProjectMembers] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const [notes, setNotes]             = useState('')
  const [notesSaving, setNotesSaving] = useState(false)
  const [notesSaved, setNotesSaved]   = useState(false)

  const [attendanceSaving, setAttSaving] = useState(false)
  const [attendanceSaved, setAttSaved]   = useState(false)

  const [statusModalAction, setStatusModalAction] = useState(null)
  const [showAddColumn, setShowAddColumn]         = useState(false)

  const expiredColumnsRef = useRef(new Set())

  useEffect(() => {
    async function loadData() {
      try {
        const retroData = await getRetrospectiveById(retroId)
        setRetro(retroData)
        setNotes(retroData.managerNotes ?? '')

        const projectData = await getProjectById(retroData.projectId)
        setProject(projectData)
        setProjectMembers(projectData.members)

        const [cols, tk, ac, atts] = await Promise.all([
          getColumnsByRetroId(retroId),
          getTicketsByRetroId(retroId),
          getActionsByRetroId(retroId),
          isManager ? getAttendances(retroId).catch(() => []) : Promise.resolve([]),
        ])

        setColumns(cols)
        setTickets(tk)
        setActions(ac)

        const attMap = {}
        for (const m of projectData.members) {
          const record = atts.find(a => a.userId === m.userId)
          attMap[m.userId] = record ? record.isPresent : true
        }
        setAttendance(attMap)
      } catch {
        setError('Erro ao carregar retrospectiva.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [retroId, isManager])

  if (loading) return <div className="board-page"><p>A carregar...</p></div>
  if (error || !retro) return <div className="board-not-found">{error || 'Retrospectiva não encontrada.'}</div>

  const frozen = retro.isFrozen

  async function handleAddTicket(columnId, content) {
    try {
      const ticket = await createTicket(retroId, content, columnId)
      setTickets(prev => [...prev, ticket])
    } catch (e) { alert(e.response?.data || 'Erro ao criar ticket.') }
  }

  async function handleDeleteTicket(ticketId) {
    if (!confirm('Eliminar este ticket?')) return
    try {
      await deleteTicket(ticketId)
      setTickets(prev => prev.filter(t => t.id !== ticketId))
    } catch { /* ignore */ }
  }

  async function handleToggleVote(ticketId) {
    try {
      const updated = await toggleVote(ticketId)
      setTickets(prev => prev.map(t => t.id === ticketId ? updated : t))
    } catch { /* ignore */ }
  }

  async function handleAddColumn(name, color) {
    try {
      const col = await createColumn(retroId, name, color)
      setColumns(prev => [...prev, col])
    } catch (e) { alert(e.response?.data || 'Erro ao criar coluna.') }
  }

  async function handleDeleteColumn(columnId) {
    const colTickets = tickets.filter(t => t.retroColumnId === columnId)
    const msg = colTickets.length > 0
      ? `Esta coluna tem ${colTickets.length} ticket(s). Eliminar mesmo assim?`
      : 'Eliminar esta coluna?'
    if (!confirm(msg)) return
    try {
      await deleteColumn(columnId)
      setColumns(prev => prev.filter(c => c.id !== columnId))
      setTickets(prev => prev.filter(t => t.retroColumnId !== columnId))
    } catch { /* ignore */ }
  }

  function replaceColumn(updated) {
    setColumns(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  async function handleLockColumn(columnId) {
    try { replaceColumn(await lockColumn(columnId)) } catch { /* ignore */ }
  }

  async function handleUnlockColumn(columnId) {
    try {
      const updated = await unlockColumn(columnId)
      replaceColumn(updated)
      expiredColumnsRef.current.delete(columnId)
    } catch { /* ignore */ }
  }

  async function handleStartColumnTimer(columnId, seconds) {
    try {
      const updated = await startColumnTimer(columnId, seconds)
      replaceColumn(updated)
      expiredColumnsRef.current.delete(columnId)
    } catch { /* ignore */ }
  }

  async function handleStopColumnTimer(columnId) {
    try { replaceColumn(await stopColumnTimer(columnId)) } catch { /* ignore */ }
  }

  function handleTimerExpired(columnId) {
    if (expiredColumnsRef.current.has(columnId)) return
    expiredColumnsRef.current.add(columnId)
    handleLockColumn(columnId)
  }

  async function handleCreateAction(description, responsibleUserId, expectedDate) {
    try {
      const action = await createAction(retroId, description, responsibleUserId, expectedDate)
      setActions(prev => [...prev, action])
    } catch (e) { alert(e.response?.data || 'Erro ao criar ação.') }
  }

  async function handleDeleteAction(actionId) {
    if (!confirm('Eliminar esta ação?')) return
    try {
      await deleteAction(actionId)
      setActions(prev => prev.filter(a => a.id !== actionId))
    } catch { /* ignore */ }
  }

  async function handleStatusChange(actionId, newStatus, notes) {
    try {
      const updated = await updateActionStatus(actionId, newStatus, notes)
      setActions(prev => prev.map(a => a.id === actionId ? updated : a))
    } catch { /* ignore */ }
  }

  async function handleClose() {
    if (!confirm('Fechar esta retrospectiva? Ninguém poderá editar mais nada.')) return
    try { setRetro(await closeRetrospective(retroId)) } catch { /* ignore */ }
  }

  async function handleReopen() {
    try { setRetro(await reopenRetrospective(retroId)) } catch { /* ignore */ }
  }

  function toggleAttendance(memberId) {
    setAttendance(prev => ({ ...prev, [memberId]: !prev[memberId] }))
    setAttSaved(false)
  }

  function markAll(value) {
    const next = Object.fromEntries(projectMembers.map(m => [m.userId, value]))
    setAttendance(next)
    setAttSaved(false)
  }

  async function handleSaveAttendance() {
    setAttSaving(true)
    setAttSaved(false)
    try {
      await Promise.all(
        Object.entries(attendance).map(([userId, isPresent]) =>
          updateAttendance(retroId, Number(userId), isPresent)
        )
      )
      setAttSaved(true)
    } catch { alert('Erro ao guardar presenças.') }
    finally { setAttSaving(false) }
  }

  async function handleSaveNotes() {
    setNotesSaving(true)
    setNotesSaved(false)
    try {
      await updateRetrospective(retroId, { managerNotes: notes })
      setNotesSaved(true)
    } catch { alert('Erro ao guardar notas.') }
    finally { setNotesSaving(false) }
  }

  const ticketsByColumn = {}
  for (const c of columns) ticketsByColumn[c.id] = []
  for (const t of tickets) {
    if (ticketsByColumn[t.retroColumnId]) ticketsByColumn[t.retroColumnId].push(t)
  }

  return (
    <div className="board-page">
      <div className="board-breadcrumb">
        <span className="board-project-name">{project?.name?.toUpperCase() ?? ''}</span>
        {frozen && <span className="board-status-frozen">FECHADA</span>}
      </div>

      <div className="board-header">
        <button className="board-back-btn" onClick={() => navigate(`/projects/${retro.projectId}`)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h1 className="board-title">{retro.title}</h1>

        <div className="board-header-actions">
          {isManager && (
            frozen ? (
              <button className="btn" onClick={handleReopen}>Reabrir Retrospectiva</button>
            ) : (
              <button className="btn btn-danger" onClick={handleClose}>Fechar Retrospectiva</button>
            )
          )}
        </div>
      </div>

      <div className="board-columns" style={{ gridTemplateColumns: `repeat(${columns.length + 1}, 1fr)` }}>
        {columns.map(col => (
          <Column
            key={col.id}
            column={col}
            tickets={ticketsByColumn[col.id] || []}
            canAddTickets={true}
            canManageColumn={isManager}
            canDeleteTickets={isManager}
            onAddTicket={handleAddTicket}
            onDeleteTicket={handleDeleteTicket}
            onDeleteColumn={handleDeleteColumn}
            onToggleVote={handleToggleVote}
            onStartTimer={handleStartColumnTimer}
            onStopTimer={handleStopColumnTimer}
            onLockColumn={handleLockColumn}
            onUnlockColumn={handleUnlockColumn}
            onTimerExpired={handleTimerExpired}
            frozen={frozen}
          />
        ))}

        <ActionsColumn
          actions={actions}
          canCreate={isManager}
          canDelete={isManager}
          currentUserId={user?.id}
          isManager={isManager}
          projectMembers={projectMembers}
          onCreate={handleCreateAction}
          onDelete={handleDeleteAction}
          onOpenStatus={setStatusModalAction}
          frozen={frozen}
        />
      </div>

      {isManager && !frozen && (
        <div className="board-add-column-wrapper">
          <button className="btn" onClick={() => setShowAddColumn(true)}>
            + Adicionar Coluna
          </button>
        </div>
      )}

      {isManager && projectMembers.length > 0 && (
        <div className="board-attendance-section">
          <div className="board-attendance-header">
            <div>
              <h2>Presenças</h2>
              <span className="board-attendance-hint">
                Regista quem participou nesta retrospectiva. Visível apenas para gestores.
              </span>
            </div>
            <div className="board-attendance-quick">
              <button type="button" className="btn" onClick={() => markAll(true)} disabled={frozen}>Marcar todos</button>
              <button type="button" className="btn" onClick={() => markAll(false)} disabled={frozen}>Limpar</button>
            </div>
          </div>

          <ul className="board-attendance-list">
            {projectMembers.map(m => {
              const present = !!attendance[m.userId]
              return (
                <li key={m.userId} className="board-attendance-row">
                  <label className="board-attendance-label">
                    <input
                      type="checkbox"
                      checked={present}
                      onChange={() => toggleAttendance(m.userId)}
                      disabled={frozen}
                    />
                    <span className="avatar avatar-sm" style={{ background: stringToColor(m.name) }}>
                      {getInitials(m.name)}
                    </span>
                    <span className="board-attendance-name">{m.name}</span>
                  </label>
                  <span className={`badge ${present ? 'badge-green' : 'badge-gray'}`}>
                    {present ? 'Presente' : 'Ausente'}
                  </span>
                </li>
              )
            })}
          </ul>

          <div className="board-attendance-footer">
            <span className="board-attendance-count">
              {Object.values(attendance).filter(Boolean).length} / {projectMembers.length} presentes
            </span>
            <div className="board-attendance-actions">
              {attendanceSaved && <span className="board-notes-saved">Guardado!</span>}
              <button className="btn-primary" onClick={handleSaveAttendance} disabled={attendanceSaving || frozen}>
                {attendanceSaving ? 'A guardar...' : 'Guardar Presenças'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isManager && (
        <div className="board-notes-section">
          <div className="board-notes-header">
            <h2>Notas Gerais</h2>
            <span className="board-notes-hint">Visível apenas para gestores</span>
          </div>
          <textarea
            className="board-notes-textarea"
            value={notes}
            onChange={e => { setNotes(e.target.value); setNotesSaved(false) }}
            rows={5}
            placeholder="Adiciona notas privadas sobre esta retrospectiva..."
            disabled={frozen}
          />
          <div className="board-notes-actions">
            {notesSaved && <span className="board-notes-saved">Guardado!</span>}
            <button className="btn-primary" onClick={handleSaveNotes} disabled={notesSaving || frozen}>
              {notesSaving ? 'A guardar...' : 'Guardar Notas'}
            </button>
          </div>
        </div>
      )}

      {statusModalAction && (
        <StatusChangeModal
          action={statusModalAction}
          onClose={() => setStatusModalAction(null)}
          onConfirm={handleStatusChange}
        />
      )}
      {showAddColumn && (
        <AddColumnModal onClose={() => setShowAddColumn(false)} onConfirm={handleAddColumn} />
      )}
    </div>
  )
}
