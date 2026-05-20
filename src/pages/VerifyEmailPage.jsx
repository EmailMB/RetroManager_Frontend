import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../services/api'
import './LoginPage.css'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const [state, setState] = useState('verifying') // verifying | success | error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      setState('error')
      setErrorMsg('Token em falta no URL.')
      return
    }

    api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(() => setState('success'))
      .catch(err => {
        setState('error')
        setErrorMsg(err.response?.data || 'Link inválido ou expirado.')
      })
  }, [params])

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">R</div>
          <span>RetroManager</span>
        </div>
        <div className="login-left-content">
          <h2>Confirmação de Email</h2>
          <p>A processar a tua confirmação...</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          {state === 'verifying' && (
            <>
              <h1>A verificar...</h1>
              <p className="login-box-subtitle">A processar o teu link de confirmação.</p>
            </>
          )}
          {state === 'success' && (
            <>
              <h1>Conta confirmada! ✓</h1>
              <p className="login-box-subtitle">
                O teu email foi verificado com sucesso. Já podes iniciar sessão.
              </p>
              <Link
                to="/login"
                className="btn-primary login-submit-btn"
                style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '20px' }}
              >
                Iniciar Sessão
              </Link>
            </>
          )}
          {state === 'error' && (
            <>
              <h1>Algo correu mal</h1>
              <p className="login-box-subtitle error-msg">{errorMsg}</p>
              <Link
                to="/register"
                className="btn login-submit-btn"
                style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '20px' }}
              >
                Voltar ao Registo
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
