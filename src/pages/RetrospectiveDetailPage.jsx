import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getRetrospectiveById, updateRetrospective } from '../services/retrospectiveService'
import { getAttendances, updateAttendance } from '../services/attendanceService'
import { useAuth } from '../context/AuthContext'

export default function RetrospectiveDetailPage() {
    const { retroId } = useParams()
    const { isManager } = useAuth()

    const [retro, setRetro] = useState(null)
    const [attendance, setAttendance] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Notes are tracked separately to allow editing without mutating retro directly
    const [notes, setNotes] = useState('')
    const [notesSaving, setNotesSaving] = useState(false)
    const [notesSaved, setNotesSaved] = useState(false)

    // Load retrospective and attendance in parallel
    useEffect(() => {
        Promise.all([
            getRetrospectiveById(retroId),
            getAttendances(retroId)
        ])
            .then(([retroData, attendanceData]) => {
                setRetro(retroData)
                setAttendance(attendanceData)
                setNotes(retroData.managerNotes ?? '')
            })
            .catch(() => setError('Failed to load retrospective.'))
            .finally(() => setLoading(false))
    }, [retroId])

    // Toggle a single user's presence. Updates local state optimistically.
    async function handleToggleAttendance(userId, currentIsPresent) {
        try {
            const updated = await updateAttendance(retroId, userId, !currentIsPresent)
            setAttendance(prev => prev.map(a => a.userId === userId ? updated : a))
        } catch {
            alert('Failed to update attendance.')
        }
    }

    // Save manager notes via the PUT endpoint
    async function handleSaveNotes() {
        setNotesSaving(true)
        setNotesSaved(false)
        try {
            const updated = await updateRetrospective(retroId, { managerNotes: notes })
            setRetro(updated)
            setNotesSaved(true)
        } catch {
            alert('Failed to save notes.')
        } finally {
            setNotesSaving(false)
        }
    }

    if (loading) return <p className="status-msg">Loading...</p>
    if (error)   return <p className="status-msg error">{error}</p>

    return (
        <div className="page">

            {/* ── Header ────────────────────────────────────────── */}
            <div className="page-header">
                <div>
                    <p className="breadcrumb">{retro.projectName}</p>
                    <h1>{retro.title}</h1>
                    <p className="subtitle">{new Date(retro.date).toLocaleDateString()}</p>
                </div>
            </div>

            {/* ── Attendance ─────────────────────────────────────── */}
            <section className="retro-section">
                <h2>Attendance</h2>
                {attendance.length === 0 ? (
                    <p className="empty-state">No members found.</p>
                ) : (
                    <ul className="attendance-list">
                        {attendance.map(record => (
                            <li key={record.userId} className="attendance-item">
                                <span>{record.userName}</span>
                                {isManager ? (
                                    // Managers can toggle presence with a clickable button
                                    <button
                                        className={`attendance-btn ${record.isPresent ? 'present' : 'absent'}`}
                                        onClick={() => handleToggleAttendance(record.userId, record.isPresent)}
                                    >
                                        {record.isPresent ? 'Present' : 'Absent'}
                                    </button>
                                ) : (
                                    // Normal users see a read-only badge
                                    <span className={`attendance-badge ${record.isPresent ? 'present' : 'absent'}`}>
                    {record.isPresent ? 'Present' : 'Absent'}
                  </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/*Manager Notes (hidden from Normal users)*/}
            {isManager && (
                <section className="retro-section">
                    <h2>Private Notes</h2>
                    <p className="section-hint">Only visible to Managers and Admins.</p>
                    <textarea
                        className="notes-textarea"
                        value={notes}
                        onChange={e => { setNotes(e.target.value); setNotesSaved(false) }}
                        rows={6}
                        placeholder="Add private notes for this retrospective..."
                    />
                    <div className="form-actions">
                        {notesSaved && <span className="saved-msg">Saved!</span>}
                        <button
                            className="btn-primary"
                            onClick={handleSaveNotes}
                            disabled={notesSaving}
                        >
                            {notesSaving ? 'Saving...' : 'Save Notes'}
                        </button>
                    </div>
                </section>
            )}

        </div>
    )
}