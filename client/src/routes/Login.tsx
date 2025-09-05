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
      console.log('Login - VITE_API_URL:', import.meta.env.VITE_API_URL);
      console.log('Login - Full URL:', import.meta.env.VITE_API_URL + '/api/login');
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
    <div className="min-h-screen bg-background flex items-center justify-center p-5">
      <div className="bg-card rounded-3xl p-8 md:p-12 max-w-md w-full shadow-xl animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl md:text-4xl font-black text-card-foreground mb-3">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        
        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2">
            <label className="block">
              <span className="text-sm font-bold text-card-foreground mb-2 block">
                Login ID
              </span>
              <input 
                value={loginId} 
                onChange={e=>setLoginId(e.target.value)} 
                className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-card-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-all duration-300"
                placeholder="Enter your login ID"
                required
              />
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="block">
              <span className="text-sm font-bold text-card-foreground mb-2 block">
                Password
              </span>
              <input 
                type="password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-card-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-all duration-300"
                placeholder="Enter your password"
                required
              />
            </label>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground font-bold py-4 px-6 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            Sign In
          </button>
          
          {err && (
            <div className="bg-destructive text-destructive-foreground text-sm font-medium text-center p-3 rounded-lg">
              {err}
            </div>
          )}
          
          <div className="text-center mt-6">
            <Link 
              to="/" 
              className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors duration-300"
            >
              ← Back to home
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}