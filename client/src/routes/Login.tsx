import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export function Login(){
  const nav = useNavigate()
  const [loginId,setLoginId]=useState('')
  const [password,setPassword]=useState('')
  const [err,setErr]=useState<string|undefined>()
  const [isMobile, setIsMobile] = useState(false)

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  async function submit(e:React.FormEvent){
    e.preventDefault()
    setErr(undefined)
    try{
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/login',{
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({loginId,password})
      })
      const data = await res.json()
      if(res.ok){
        // Store JWT token and user data
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('userId', data.userId)
        localStorage.setItem('userName', data.name)
        sessionStorage.setItem('userId', data.userId)
        nav('/dashboard')
      } else setErr(data?.error||'Failed')
    }catch{ setErr('Failed') }
  }

  return (
    <div style={getContainerStyle(isMobile)}>
      <div style={getLoginCardStyle(isMobile)}>
        <div style={getHeaderStyle(isMobile)}>
          <h1 style={getTitleStyle(isMobile)}>Welcome Back</h1>
          <p style={getSubtitleStyle(isMobile)}>Sign in to your account to continue</p>
        </div>
        
        <form onSubmit={submit} style={getFormStyle(isMobile)}>
          <div style={getInputGroupStyle(isMobile)}>
            <label style={getLabelStyle(isMobile)}>
              <span style={getLabelTextStyle(isMobile)}>Login ID</span>
              <input 
                value={loginId} 
                onChange={e=>setLoginId(e.target.value)} 
                style={getInputStyle(isMobile)}
                placeholder="Enter your login ID"
                required
              />
        </label>
          </div>
          
          <div style={getInputGroupStyle(isMobile)}>
            <label style={getLabelStyle(isMobile)}>
              <span style={getLabelTextStyle(isMobile)}>Password</span>
              <input 
                type="password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                style={getInputStyle(isMobile)}
                placeholder="Enter your password"
                required
              />
        </label>
          </div>
          
          <button type="submit" style={getBtnPrimaryStyle(isMobile)}>
            Sign In
          </button>
          
          {err && <div style={getErrorStyle(isMobile)}>{err}</div>}
          
          <div style={getFooterStyle(isMobile)}>
            <Link to="/" style={getBackLinkStyle(isMobile)}>← Back to home</Link>
          </div>
      </form>
      </div>
    </div>
  )
}

// Modern, classy styling
const getContainerStyle = (isMobile: boolean) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '40px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
})

const getLoginCardStyle = (isMobile: boolean) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  padding: '48px',
  maxWidth: '420px',
  width: '100%',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)'
})

const getHeaderStyle = (isMobile: boolean): React.CSSProperties => ({
  textAlign: 'center',
  marginBottom: '40px'
})

const getTitleStyle = (isMobile: boolean) => ({
  fontSize: '32px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 12px 0',
  letterSpacing: '-0.5px'
})

const getSubtitleStyle = (isMobile: boolean) => ({
  color: '#6b7280',
  fontSize: '16px',
  margin: '0',
  lineHeight: '1.5'
})

const getFormStyle = (isMobile: boolean) => ({
  display: 'grid',
  gap: '24px'
})

const getInputGroupStyle = (isMobile: boolean) => ({
  display: 'grid',
  gap: '8px'
})

const getLabelStyle = (isMobile: boolean) => ({
  display: 'grid',
  gap: '8px'
})

const getLabelTextStyle = (isMobile: boolean) => ({
  color: '#374151',
  fontSize: '14px',
  fontWeight: '600',
  letterSpacing: '0.025em'
})

const getInputStyle = (isMobile: boolean) => ({
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
})

const getBtnPrimaryStyle = (isMobile: boolean) => ({
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
})

const getErrorStyle = (isMobile: boolean): React.CSSProperties => ({
  color: '#dc2626',
  fontSize: '14px',
  fontWeight: '500',
  textAlign: 'center',
  padding: '12px',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px'
})

const getFooterStyle = (isMobile: boolean): React.CSSProperties => ({
  textAlign: 'center',
  marginTop: '8px'
})

const getBackLinkStyle = (isMobile: boolean) => ({
  color: '#6b7280',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease'
})

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



