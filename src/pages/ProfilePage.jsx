import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './ProfilePage.css'

const ROLE_LABELS = { 0: 'Utilizador', 1: 'Gestor', 2: 'Administrador' }

export default function ProfilePage() {
  const { user } = useAuth()

  const [form, setForm] = useState({
    name: user?.name ?? '',
  })
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPass: '',
    confirm: '',
  })
  const [saved, setSaved]             = useState(false)
  const [passwordError, setPasswordError] = useState(null)
  const [passwordSaved, setPasswordSaved] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  function handlePasswordChange(e) {
    setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setPasswordError(null)
    setPasswordSaved(false)
  }

  function handleSaveProfile(e) {
    e.preventDefault()
    // MOCK: simulate save
    setTimeout(() => setSaved(true), 300)
    // REAL: uncomment when backend is connected:
    // try {
    //   await api.put('/users/profile', { name: form.name })
    //   // update AuthContext user with new name
    // } catch { ... }
  }

  function handleChangePassword(e) {
    e.preventDefault()
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError('As palavras-passe não coincidem.')
      return
    }
    if (passwordForm.newPass.length < 6) {
      setPasswordError('A nova palavra-passe deve ter no mínimo 6 caracteres.')
      return
    }
    // MOCK: simulate save
    setTimeout(() => {
      setPasswordSaved(true)
      setPasswordForm({ current: '', newPass: '', confirm: '' })
    }, 300)
    // REAL: uncomment when backend is connected:
    // try {
    //   await api.put('/users/profile', {
    //     currentPassword: passwordForm.current,
    //     newPassword: passwordForm.newPass,
    //   })
    //   setPasswordSaved(true)
    //   setPasswordForm({ current: '', newPass: '', confirm: '' })
    // } catch (err) {
    //   setPasswordError(err.response?.data ?? 'Erro ao alterar palavra-passe.')
    // }
  }

  const initials = user?.initials ?? user?.name?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>O Meu Perfil</h1>
        <p className="profile-subtitle">Gere a tua informação pessoal e preferências de conta.</p>
      </div>

      {/* ── Avatar + identity card ──────────────────────── */}
      <div className="page-card profile-identity">
        <div className="profile-avatar" style={{ background: user?.color ?? '#4f46e5' }}>
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

      {/* ── Edit profile form ───────────────────────────── */}
      <form className="page-card profile-section" onSubmit={handleSaveProfile}>
        <h2>Informação Pessoal</h2>
        <p className="profile-hint"></p>
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
        <div className="profile-form-actions">
          {saved && <span className="profile-saved-msg">Perfil atualizado!</span>}
          <button type="submit" className="btn-primary">Guardar Alterações</button>
        </div>
      </form>

      {/* ── Change password ─────────────────────────────── */}
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
          <button type="submit" className="btn-primary">Alterar Palavra-passe</button>
        </div>
      </form>
    </div>
  )
}
