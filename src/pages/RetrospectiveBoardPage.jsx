import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRetrospectiveById } from '../data/mockData'
import './RetrospectiveBoardPage.css'

function statusBadgeClass(status) {
  if (status === 'EM PROGRESSO') return 'badge badge-blue'
  if (status === 'CONCLUÍDO')    return 'badge badge-green'
  return 'badge badge-orange' // PENDENTE
}

// ── Ticket card (Positives / Improvements) ───────────────
function TicketCard({ card, onVote }) {
  return (
    <div className="board-card">
      <p className="board-card-text">{card.text}</p>
      <button className="board-card-vote" onClick={() => onVote(card.id)}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z" />
          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
        {card.votes}
      </button>
    </div>
  )
}

// ── Action card ───────────────────────────────────────────
function ActionCard({ action }) {
  return (
    <div className="board-card board-card-action">
      <p className="board-card-text">{action.text}</p>
      <div className="board-card-action-footer">
        <div className="board-card-assignee">
          <span
            className="avatar avatar-sm"
            style={{ background: action.assignee.color }}
          >
            {action.assignee.initials}
          </span>
          <span className="board-card-assignee-label">Responsável</span>
        </div>
        <span className={statusBadgeClass(action.status)}>{action.status}</span>
      </div>
    </div>
  )
}

// ── Column ────────────────────────────────────────────────
function Column({ title, icon, colorClass, count, children, onAdd, addLabel }) {
  return (
    <div className="board-column">
      <div className={`board-column-header ${colorClass}`}>
        <div className="board-column-title">
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        <span className="board-column-count">{count}</span>
      </div>
      <div className="board-column-body">
        {children}
        <button className="board-add-btn" onClick={onAdd}>
          + {addLabel}
        </button>
      </div>
    </div>
  )
}

export default function RetrospectiveBoardPage() {
  const { retroId } = useParams()
  const navigate = useNavigate()
  const { isManager } = useAuth()

  const found = getRetrospectiveById(retroId)

  const [positives,    setPositives]    = useState(found?.retro.board.positives    ?? [])
  const [improvements, setImprovements] = useState(found?.retro.board.improvements ?? [])
  const [actions,      setActions]      = useState(found?.retro.board.actions      ?? [])

  // Manager notes
  const [notes, setNotes]             = useState('')
  const [notesSaving, setNotesSaving] = useState(false)
  const [notesSaved, setNotesSaved]   = useState(false)

  // Attendance: default everyone present (mock).
  // REAL: replace with useEffect that loads
  //   GET /api/retrospectives/{retroId}/attendances
  // and builds the map from { userId, isPresent } records.
  const initialAttendance = Object.fromEntries(
    (found?.project.members ?? []).map(m => [m.id, true])
  )
  const [attendance, setAttendance]       = useState(initialAttendance)
  const [attendanceSaving, setAttSaving]  = useState(false)
  const [attendanceSaved,  setAttSaved]   = useState(false)

  // New card / action input state
  const [newPositive,    setNewPositive]    = useState('')
  const [newImprovement, setNewImprovement] = useState('')
  const [newActionText,  setNewActionText]  = useState('')

  const [addingPositive,    setAddingPositive]    = useState(false)
  const [addingImprovement, setAddingImprovement] = useState(false)
  const [addingAction,      setAddingAction]      = useState(false)

  if (!found) {
    return <div className="board-not-found">Retrospectiva não encontrada.</div>
  }

  const { retro, project } = found

  function votePositive(id) {
    setPositives(prev => prev.map(c => c.id === id ? { ...c, votes: c.votes + 1 } : c))
  }

  function voteImprovement(id) {
    setImprovements(prev => prev.map(c => c.id === id ? { ...c, votes: c.votes + 1 } : c))
  }

  function submitPositive() {
    if (!newPositive.trim()) return
    setPositives(prev => [...prev, { id: Date.now(), text: newPositive.trim(), votes: 0 }])
    setNewPositive('')
    setAddingPositive(false)
  }

  function submitImprovement() {
    if (!newImprovement.trim()) return
    setImprovements(prev => [...prev, { id: Date.now(), text: newImprovement.trim(), votes: 0 }])
    setNewImprovement('')
    setAddingImprovement(false)
  }

  function submitAction() {
    if (!newActionText.trim()) return
    setActions(prev => [...prev, {
      id: Date.now(),
      text: newActionText.trim(),
      assignee: { id: 0, name: 'Por definir', initials: '?', color: '#9ca3af' },
      status: 'PENDENTE',
    }])
    setNewActionText('')
    setAddingAction(false)
  }

  function toggleAttendance(memberId) {
    setAttendance(prev => ({ ...prev, [memberId]: !prev[memberId] }))
    setAttSaved(false)
  }

  function markAll(value) {
    const next = Object.fromEntries(
      (project.members ?? []).map(m => [m.id, value])
    )
    setAttendance(next)
    setAttSaved(false)
  }

  function handleSaveAttendance() {
    setAttSaving(true)
    setAttSaved(false)
    // MOCK: simulate save
    setTimeout(() => {
      setAttSaving(false)
      setAttSaved(true)
    }, 400)
    // REAL: uncomment when backend is connected.
    // Backend exposes a per-user endpoint:
    //   PUT /api/retrospectives/{retroId}/attendances/{userId}   body: { isPresent }
    // so we fan out one request per changed user.
    // try {
    //   await Promise.all(
    //     Object.entries(attendance).map(([userId, isPresent]) =>
    //       api.put(
    //         `/retrospectives/${retroId}/attendances/${userId}`,
    //         { isPresent },
    //       )
    //     )
    //   )
    //   setAttSaved(true)
    // } catch { alert('Erro ao guardar presenças.') }
    // finally { setAttSaving(false) }
  }

  function handleSaveNotes() {
    setNotesSaving(true)
    setNotesSaved(false)
    // MOCK: simulate save
    setTimeout(() => {
      setNotesSaving(false)
      setNotesSaved(true)
    }, 400)
    // REAL: uncomment when backend is connected:
    // try {
    //   await updateRetrospective(retroId, { managerNotes: notes })
    //   setNotesSaved(true)
    // } catch { alert('Erro ao guardar notas.') }
    // finally { setNotesSaving(false) }
  }

  return (
    <div className="board-page">
      {/* ── Top breadcrumb ───────────────────────────────── */}
      <div className="board-breadcrumb">
        <span className="board-project-name">{project.name.toUpperCase()}</span>
        <span className="board-status-dot">•</span>
        <span className="board-retro-status">{retro.status}</span>
      </div>

      {/* ── Header ──────────────────────────────────────── */}
      <div className="board-header">
        <button className="board-back-btn" onClick={() => navigate(`/projects/${project.id}`)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h1 className="board-title">{retro.title}</h1>
      </div>

      {/* ── Kanban board ────────────────────────────────── */}
      <div className="board-columns">

        {/* Pontos Positivos */}
        <Column
          title="Pontos Positivos"
          colorClass="col-green"
          count={positives.length}
          onAdd={() => setAddingPositive(true)}
          addLabel="Adicionar Cartão"
        >
          {positives.map(card => (
            <TicketCard key={card.id} card={card} onVote={votePositive} />
          ))}
          {addingPositive && (
            <div className="board-add-form">
              <textarea
                autoFocus
                rows={3}
                placeholder="Escreve aqui..."
                value={newPositive}
                onChange={e => setNewPositive(e.target.value)}
              />
              <div className="board-add-form-actions">
                <button className="btn-primary" onClick={submitPositive}>Adicionar</button>
                <button className="btn" onClick={() => { setAddingPositive(false); setNewPositive('') }}>Cancelar</button>
              </div>
            </div>
          )}
        </Column>

        {/* A Melhorar */}
        <Column
          title="A Melhorar"
          colorClass="col-orange"
          count={improvements.length}
          onAdd={() => setAddingImprovement(true)}
          addLabel="Adicionar Cartão"
        >
          {improvements.map(card => (
            <TicketCard key={card.id} card={card} onVote={voteImprovement} />
          ))}
          {addingImprovement && (
            <div className="board-add-form">
              <textarea
                autoFocus
                rows={3}
                placeholder="Escreve aqui..."
                value={newImprovement}
                onChange={e => setNewImprovement(e.target.value)}
              />
              <div className="board-add-form-actions">
                <button className="btn-primary" onClick={submitImprovement}>Adicionar</button>
                <button className="btn" onClick={() => { setAddingImprovement(false); setNewImprovement('') }}>Cancelar</button>
              </div>
            </div>
          )}
        </Column>

        {/* Ações */}
        <Column
          title="Ações"
          colorClass="col-blue"
          count={actions.length}
          onAdd={() => setAddingAction(true)}
          addLabel="Adicionar Ação"
        >
          {actions.map(action => (
            <ActionCard key={action.id} action={action} />
          ))}
          {addingAction && (
            <div className="board-add-form">
              <textarea
                autoFocus
                rows={3}
                placeholder="Descreve a ação..."
                value={newActionText}
                onChange={e => setNewActionText(e.target.value)}
              />
              <div className="board-add-form-actions">
                <button className="btn-primary" onClick={submitAction}>Adicionar</button>
                <button className="btn" onClick={() => { setAddingAction(false); setNewActionText('') }}>Cancelar</button>
              </div>
            </div>
          )}
        </Column>

      </div>

      {/* ── Attendance (manager only) ───────────────────── */}
      {isManager && (
        <div className="board-attendance-section">
          <div className="board-attendance-header">
            <div>
              <h2>Presenças</h2>
              <span className="board-attendance-hint">
                Regista quem participou nesta retrospectiva. Visível apenas para gestores.
              </span>
            </div>
            <div className="board-attendance-quick">
              <button type="button" className="btn" onClick={() => markAll(true)}>
                Marcar todos
              </button>
              <button type="button" className="btn" onClick={() => markAll(false)}>
                Limpar
              </button>
            </div>
          </div>

          <ul className="board-attendance-list">
            {project.members.map(m => {
              const present = !!attendance[m.id]
              return (
                <li key={m.id} className="board-attendance-row">
                  <label className="board-attendance-label">
                    <input
                      type="checkbox"
                      checked={present}
                      onChange={() => toggleAttendance(m.id)}
                    />
                    <span
                      className="avatar avatar-sm"
                      style={{ background: m.color }}
                    >
                      {m.initials}
                    </span>
                    <span className="board-attendance-name">{m.name}</span>
                  </label>
                  <span
                    className={`badge ${present ? 'badge-green' : 'badge-gray'}`}
                  >
                    {present ? 'Presente' : 'Ausente'}
                  </span>
                </li>
              )
            })}
          </ul>

          <div className="board-attendance-footer">
            <span className="board-attendance-count">
              {Object.values(attendance).filter(Boolean).length} / {project.members.length} presentes
            </span>
            <div className="board-attendance-actions">
              {attendanceSaved && <span className="board-notes-saved">Guardado!</span>}
              <button
                className="btn-primary"
                onClick={handleSaveAttendance}
                disabled={attendanceSaving}
              >
                {attendanceSaving ? 'A guardar...' : 'Guardar Presenças'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Manager Notes ──────────────────────────────── */}
      {/* Future: only show for managers → {isManager && ( ... )} */}
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
        />
        <div className="board-notes-actions">
          {notesSaved && <span className="board-notes-saved">Guardado!</span>}
          <button
            className="btn-primary"
            onClick={handleSaveNotes}
            disabled={notesSaving}
          >
            {notesSaving ? 'A guardar...' : 'Guardar Notas'}
          </button>
        </div>
      </div>
    </div>
  )
}
