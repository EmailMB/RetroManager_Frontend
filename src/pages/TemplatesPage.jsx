import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getAccessibleTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '../services/retroTemplateService'
import './TemplatesPage.css'
/* eslint-disable react/prop-types */

const PRESET_COLORS = ['#22c55e','#f97316','#3b82f6','#a855f7','#ec4899','#06b6d4','#f59e0b','#ef4444']

export default function TemplatesPage() {
  const { isAdmin } = useAuth()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState(null) // null | template object | 'new'

  useEffect(() => {
    refresh()
  }, [])

  function refresh() {
    setLoading(true)
    getAccessibleTemplates()
      .then(setTemplates)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  async function handleSave(data) {
    if (editing === 'new') {
      await createTemplate(data)
    } else {
      await updateTemplate(editing.id, data)
    }
    setEditing(null)
    refresh()
  }

  async function handleDelete(id) {
    if (!confirm('Eliminar este template?')) return
    await deleteTemplate(id)
    refresh()
  }

  if (loading) return <div className="templates-page"><p>A carregar...</p></div>

  return (
    <div className="templates-page">
      <div className="templates-header">
        <div>
          <h1>Templates de Retrospectivas</h1>
          <p className="templates-subtitle">
            Cria modelos reutilizáveis com colunas pré-definidas (Mad/Sad/Glad, 4Ls, etc.).
          </p>
        </div>
        <button className="btn-primary" onClick={() => setEditing('new')}>
          + Novo Template
        </button>
      </div>

      <div className="templates-grid">
        {templates.length === 0 && (
          <p className="templates-empty">Ainda não existem templates. Cria um para começar.</p>
        )}
        {templates.map(t => (
          <div key={t.id} className="template-card">
            <div className="template-card-header">
              <h3>{t.name}</h3>
              {t.isGlobal && <span className="badge badge-purple">Global</span>}
            </div>
            {t.description && <p className="template-card-desc">{t.description}</p>}

            <div className="template-card-columns">
              {t.columns.map(c => (
                <span key={c.id || c.displayOrder} className="template-column-chip" style={{ background: c.color + '20', color: c.color, borderColor: c.color + '40' }}>
                  {c.name}
                </span>
              ))}
            </div>

            <div className="template-card-footer">
              <span className="template-card-meta">
                {t.isOwner ? 'Criado por ti' : `Por ${t.createdByName ?? 'admin'}`}
              </span>
              {(t.isOwner || isAdmin) && (
                <div className="template-card-actions">
                  <button className="btn" onClick={() => setEditing(t)}>Editar</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(t.id)}>Eliminar</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <TemplateModal
          template={editing === 'new' ? null : editing}
          isAdmin={isAdmin}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

function TemplateModal({ template, isAdmin, onClose, onSave }) {
  const [name, setName]               = useState(template?.name ?? '')
  const [description, setDescription] = useState(template?.description ?? '')
  const [isGlobal, setIsGlobal]       = useState(template?.isGlobal ?? false)
  const [columns, setColumns]         = useState(
    template?.columns?.length
      ? template.columns.map(c => ({ name: c.name, color: c.color }))
      : [{ name: '', color: PRESET_COLORS[0] }]
  )
  const [submitting, setSubmitting]   = useState(false)

  function updateColumn(i, field, value) {
    setColumns(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c))
  }

  function addColumn() {
    setColumns(prev => [...prev, { name: '', color: PRESET_COLORS[prev.length % PRESET_COLORS.length] }])
  }

  function removeColumn(i) {
    if (columns.length === 1) return
    setColumns(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit() {
    if (!name.trim() || columns.some(c => !c.name.trim())) {
      alert('Preenche o nome do template e de todas as colunas.')
      return
    }
    setSubmitting(true)
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        isGlobal,
        columns: columns.map((c, i) => ({ name: c.name.trim(), color: c.color, displayOrder: i }))
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content template-modal" onClick={e => e.stopPropagation()}>
        <h3>{template ? 'Editar Template' : 'Novo Template'}</h3>

        <div className="modal-field">
          <label>Nome</label>
          <input
            type="text"
            placeholder="Ex: Mad / Sad / Glad"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={120}
            autoFocus
          />
        </div>

        <div className="modal-field">
          <label>Descrição (opcional)</label>
          <textarea
            rows={2}
            placeholder="Quando usar este template..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={500}
          />
        </div>

        {isAdmin && (
          <div className="modal-field">
            <label className="modal-checkbox">
              <input
                type="checkbox"
                checked={isGlobal}
                onChange={e => setIsGlobal(e.target.checked)}
              />
              <span>Template global (visível a todos os utilizadores)</span>
            </label>
          </div>
        )}

        <div className="modal-field">
          <label>Colunas</label>
          <div className="template-columns-editor">
            {columns.map((c, i) => (
              <div key={i} className="template-column-row">
                <input
                  type="text"
                  placeholder="Nome da coluna"
                  value={c.name}
                  onChange={e => updateColumn(i, 'name', e.target.value)}
                  maxLength={80}
                />
                <div className="template-column-colors">
                  {PRESET_COLORS.map(col => (
                    <button
                      key={col}
                      type="button"
                      className={`template-color-dot ${c.color === col ? 'selected' : ''}`}
                      style={{ background: col }}
                      onClick={() => updateColumn(i, 'color', col)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="template-column-remove"
                  onClick={() => removeColumn(i)}
                  disabled={columns.length === 1}
                  title="Remover coluna"
                >
                  ✕
                </button>
              </div>
            ))}
            <button type="button" className="btn template-add-column" onClick={addColumn}>
              + Adicionar Coluna
            </button>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose} disabled={submitting}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'A guardar...' : 'Guardar Template'}
          </button>
        </div>
      </div>
    </div>
  )
}
