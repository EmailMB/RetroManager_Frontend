import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MOCK_USER } from '../data/mockData'
import './RegisterPage.css'

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(false)

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

    // MOCK: accept any input and log in as mock user
    await new Promise(r => setTimeout(r, 400))
    login({ ...MOCK_USER, name: form.name || MOCK_USER.name }, 'mock-token')
    navigate('/projects')

    // REAL: uncomment when backend is connected:
    // try {
    //   const result = await registerService(form.name, form.email, form.password)
    //   login(result, result.token)
    //   navigate('/projects')
    // } catch {
    //   setError('Erro ao criar conta. Tenta novamente.')
    // } finally {
    //   setLoading(false)
    // }

    setLoading(false)
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
        </div>
      </div>
    </div>
  )
}
