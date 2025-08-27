import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export function Login(){
  const nav = useNavigate()
  const [loginId,setLoginId]=useState('')
  const [password,setPassword]=useState('')
  const [err,setErr]=useState<string|undefined>()

  async function submit(e:React.FormEvent){
    e.preventDefault()
    setErr(undefined)
    try{
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/login',{
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({loginId,password})
      })
      const data = await res.json()
      if(res.ok){
        sessionStorage.setItem('userId', data.userId)
        nav('/dashboard')
      } else setErr(data?.error||'Failed')
    }catch{ setErr('Failed') }
  }

  return (
    <div style={containerStyle}>
      <div style={loginCardStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Welcome Back</h1>
          <p style={subtitleStyle}>Sign in to your account to continue</p>
        </div>
        
        <form onSubmit={submit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Login ID</span>
              <input 
                value={loginId} 
                onChange={e=>setLoginId(e.target.value)} 
                style={inputStyle}
                placeholder="Enter your login ID"
                required
              />
        </label>
          </div>
          
          <div style={inputGroupStyle}>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Password</span>
              <input 
                type="password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                style={inputStyle}
                placeholder="Enter your password"
                required
              />
        </label>
          </div>
          
          <button type="submit" style={btnPrimary}>
            Sign In
          </button>
          
          {err && <div style={errorStyle}>{err}</div>}
          
          <div style={footerStyle}>
            <Link to="/" style={backLinkStyle}>← Back to home</Link>
          </div>
      </form>
      </div>
    </div>
  )
}

// Modern, classy styling
const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '40px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
}

const loginCardStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  padding: '48px',
  maxWidth: '420px',
  width: '100%',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)'
}

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '40px'
}

const titleStyle: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 12px 0',
  letterSpacing: '-0.5px'
}

const subtitleStyle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '16px',
  margin: '0',
  lineHeight: '1.5'
}

const formStyle: React.CSSProperties = {
  display: 'grid',
  gap: '24px'
}

const inputGroupStyle: React.CSSProperties = {
  display: 'grid',
  gap: '8px'
}

const labelStyle: React.CSSProperties = {
  display: 'grid',
  gap: '8px'
}

const labelTextStyle: React.CSSProperties = {
  color: '#374151',
  fontSize: '14px',
  fontWeight: '600',
  letterSpacing: '0.025em'
}

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '2px solid #e5e7eb',
  borderRadius: '12px',
  padding: '16px 20px',
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '500',
  transition: 'all 0.2s ease',
  outline: 'none',
  fontFamily: 'inherit'
}

const btnPrimary: React.CSSProperties = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '16px 32px',
  borderRadius: '12px',
  color: 'white',
  fontWeight: '600',
  fontSize: '16px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  marginTop: '8px'
}

const errorStyle: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '14px',
  fontWeight: '500',
  textAlign: 'center',
  padding: '12px',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px'
}

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '8px'
}

const backLinkStyle: React.CSSProperties = {
  color: '#6b7280',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease'
}

// Add hover effects
const addHoverEffects = () => {
  const style = document.createElement('style')
  style.textContent = `
    input:focus {
      border-color: #667eea !important;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
    }
    
    button:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4) !important;
    }
    
    a:hover {
      color: #374151 !important;
    }
  `
  document.head.appendChild(style)
}

// Initialize hover effects
if (typeof document !== 'undefined') {
  addHoverEffects()
}



