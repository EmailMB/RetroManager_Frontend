import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register as registerService } from '../services/authService'
import './RegisterPage.css'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirmPassword) {
      setError('As palavras-passe não coincidem.')
      return
    }

    setLoading(true)

    try {
      const result = await registerService(form.name, form.email, form.password)
      if (result?.emailVerified) {
        navigate('/login')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      const msg = err.response?.data ?? 'Erro ao criar conta. Tenta novamente.'
      setError(typeof msg === 'string' ? msg : 'Erro ao criar conta. Tenta novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-left">
        <div className="register-brand">
          <div className="register-brand-icon">R</div>
          <span>RetroManager</span>
        </div>
        <div className="register-left-content">
          <h2>Junta-te à equipa</h2>
          <p>Cria a tua conta e começa a gerir retrospectivas de forma eficiente.</p>
        </div>
      </div>

      <div className="register-right">
        <div className="register-box">
          {success ? (
            <>
              <h1>Verifica o teu email</h1>
              <p className="register-box-subtitle">
                Enviámos um link de confirmação para <strong>{form.email}</strong>.
                Clica no link no email para ativar a conta.
              </p>
              <Link to="/login" className="btn-primary register-submit-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Voltar ao Login
              </Link>
            </>
          ) : (
          <>
          <h1>Criar Conta</h1>
          <p className="register-box-subtitle">Preenche os dados para começar</p>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-field">
              <label>Nome completo</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="O teu nome"
                disabled={loading}
              />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="o.teu@email.com"
                disabled={loading}
              />
            </div>
            <div className="form-field">
              <label>Palavra-passe</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
              />
            </div>
            <div className="form-field">
              <label>Confirmar palavra-passe</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Repete a palavra-passe"
                disabled={loading}
              />
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" className="btn-primary register-submit-btn" disabled={loading}>
              {loading ? 'A criar conta...' : 'Criar Conta'}
            </button>
          </form>

          <p className="register-login-link">
            Já tens conta? <Link to="/login">Iniciar sessão</Link>
          </p>
          </>
          )}
        </div>
      </div>
    </div>
  )
}
