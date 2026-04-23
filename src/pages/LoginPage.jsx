import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MOCK_USER } from '../data/mockData'
import './LoginPage.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // MOCK: accept any credentials and log in as mock user
    await new Promise(r => setTimeout(r, 400))
    login(MOCK_USER, 'mock-token')
    navigate('/projects')

    // REAL: uncomment when backend is connected:
    // try {
    //   const result = await loginService(form.email, form.password)
    //   login(result, result.token)
    //   navigate('/projects')
    // } catch {
    //   setError('Email ou palavra-passe incorretos.')
    // } finally {
    //   setLoading(false)
    // }

    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">R</div>
          <span>RetroManager</span>
        </div>
        <div className="login-left-content">
          <h2>Bem-vindo de volta</h2>
          <p>A plataforma para gerir retrospectivas ágeis da tua equipa.</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <h1>Iniciar Sessão</h1>
          <p className="login-box-subtitle">Acede à tua conta para continuar</p>

          <form onSubmit={handleSubmit} className="login-form">
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
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" className="btn-primary login-submit-btn" disabled={loading}>
              {loading ? 'A entrar...' : 'Entrar'}
            </button>
          </form>

          <p className="login-register-link">
            Não tens conta? <Link to="/register">Criar conta</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
