import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { createRetrospective } from '../services/retrospectiveService'

export default function NewRetrospectivePage() {
    const { projectId } = useParams()
    const navigate = useNavigate()

    const [form, setForm] = useState({ title: '', date: '' })
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        setError(null)
        try {
            // HTML date input gives "yyyy-MM-dd" — convert to ISO string for the backend
            const retro = await createRetrospective(projectId, {
                title: form.title,
                date: new Date(form.date).toISOString()
            })
            navigate(`/retrospectives/${retro.id}`)
        } catch {
            setError('Failed to create retrospective. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="page form-page">
            <h1>New Retrospective</h1>
            <form onSubmit={handleSubmit} className="form">
                <label className="form-field">
                    Title
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        maxLength={255}
                        placeholder="e.g. Sprint 12 Retrospective"
                    />
                </label>
                <label className="form-field">
                    Date
                    <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                    />
                </label>
                {error && <p className="error">{error}</p>}
                <div className="form-actions">
                    <button type="button" onClick={() => navigate(-1)}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={submitting}>
                        {submitting ? 'Creating...' : 'Create Retrospective'}
                    </button>
                </div>
            </form>
        </div>
    )
}