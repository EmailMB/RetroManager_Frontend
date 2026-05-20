import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../services/userService'
import './ProfilePage.css'

const ROLE_LABELS = { 0: 'Utilizador', 1: 'Gestor', 2: 'Administrador' }

function getInitials(name) {
  return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? '?'
}

function stringToColor(str) {
  const colors = ['#14b8a6','#f97316','#ec4899','#8b5cf6','#4f46e5','#ef4444','#22c55e','#0ea5e9','#a855f7']
  let hash = 0
  for (let i = 0; i < (str?.length ?? 0); i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()

  const [form, setForm] = useState({
    name: user?.name ?? '',
  })
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPass: '',
    confirm: '',
  })
  const [saved, setSaved]               = useState(false)
  const [saving, setSaving]             = useState(false)
  const [profileError, setProfileError] = useState(null)
  const [passwordError, setPasswordError]   = useState(null)
  const [passwordSaved, setPasswordSaved]   = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
    setProfileError(null)
  }

  function handlePasswordChange(e) {
    setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setPasswordError(null)
    setPasswordSaved(false)
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSaving(true)
    setProfileError(null)

    try {
      const result = await updateProfile({ name: form.name })
      updateUser({ name: result.name })
      setSaved(true)
    } catch (err) {
      const msg = err.response?.data ?? 'Erro ao atualizar perfil.'
      setProfileError(typeof msg === 'string' ? msg : 'Erro ao atualizar perfil.')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError('As palavras-passe não coincidem.')
      return
    }
    if (passwordForm.newPass.length < 6) {
      setPasswordError('A nova palavra-passe deve ter no mínimo 6 caracteres.')
      return
    }

    setPasswordSaving(true)
    setPasswordError(null)

    try {
      await updateProfile({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.newPass,
      })
      setPasswordSaved(true)
      setPasswordForm({ current: '', newPass: '', confirm: '' })
    } catch (err) {
      const msg = err.response?.data ?? 'Erro ao alterar palavra-passe.'
      setPasswordError(typeof msg === 'string' ? msg : 'Erro ao alterar palavra-passe.')
    } finally {
      setPasswordSaving(false)
    }
  }

  const initials = getInitials(user?.name)

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>O Meu Perfil</h1>
        <p className="profile-subtitle">Gere a tua informação pessoal e preferências de conta.</p>
      </div>

      <div className="page-card profile-identity">
        <div className="profile-avatar" style={{ background: stringToColor(user?.name ?? '') }}>
          {initials}
        </div>
        <div className="profile-identity-info">
          <h2>{user?.name}</h2>
          <span className="profile-email">{user?.email}</span>
          <span className={`badge ${user?.role >= 1 ? 'badge-blue' : 'badge-gray'}`}>
            {ROLE_LABELS[user?.role] ?? 'Utilizador'}
          </span>
        </div>
      </div>

      <form className="page-card profile-section" onSubmit={handleSaveProfile}>
        <h2>Informação Pessoal</h2>
        <p className="profile-hint">O email é usado para iniciar sessão e não pode ser alterado.</p>
        <div className="profile-form-grid">
          <div className="form-field">
            <label>Nome completo</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        {profileError && <p className="error-msg">{profileError}</p>}
        <div className="profile-form-actions">
          {saved && <span className="profile-saved-msg">Perfil atualizado!</span>}
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'A guardar...' : 'Guardar Alterações'}
          </button>
        </div>
      </form>

      <form className="page-card profile-section" onSubmit={handleChangePassword}>
        <h2>Alterar Palavra-passe</h2>
        <div className="profile-password-fields">
          <div className="form-field">
            <label>Palavra-passe atual</label>
            <input
              type="password"
              name="current"
              value={passwordForm.current}
              onChange={handlePasswordChange}
              required
              placeholder="••••••••"
            />
          </div>
          <div className="profile-form-grid">
            <div className="form-field">
              <label>Nova palavra-passe</label>
              <input
                type="password"
                name="newPass"
                value={passwordForm.newPass}
                onChange={handlePasswordChange}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div className="form-field">
              <label>Confirmar nova palavra-passe</label>
              <input
                type="password"
                name="confirm"
                value={passwordForm.confirm}
                onChange={handlePasswordChange}
                required
                placeholder="Repete a nova palavra-passe"
              />
            </div>
          </div>
        </div>
        {passwordError && <p className="error-msg">{passwordError}</p>}
        <div className="profile-form-actions">
          {passwordSaved && <span className="profile-saved-msg">Palavra-passe alterada!</span>}
          <button type="submit" className="btn-primary" disabled={passwordSaving}>
            {passwordSaving ? 'A alterar...' : 'Alterar Palavra-passe'}
          </button>
        </div>
      </form>
    </div>
  )
}
