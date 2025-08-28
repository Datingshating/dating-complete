import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export function Register(){
  const [form, setForm] = useState({
    name:"",
    gender:"",
    dateOfBirth:"",
    whatsappNumber:"",
    instagramHandle:"",
    location:"",
    customLocation:"",
    bio:"",
    relationshipStatus:"",
    interest1:"",
    interest1Desc:"",
    interest2:"",
    interest2Desc:"",
    interest3:"",
    interest3Desc:"",
  })
  const [status,setStatus]=useState<string|undefined>()
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

  const cities = [
    "Pune",
    "Delhi NCR",
    "Mumbai",
    "Bengaluru",
    "Kolkata",
    "Hyderabad",
    "Chennai",
    "Chandigarh",
    "Ahmedabad",
    "Indore",
    "Jaipur",
    "Lucknow",
    "Goa",
    "Gurgaon (Gurugram)",
    "Bhopal",
    "Others"
  ]

  async function submit(e:React.FormEvent){
    e.preventDefault()
    try{
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/register',{
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form)
      })
      const data = await res.json()
      if(res.ok){ setStatus('submitted') }
      else setStatus(data?.error||'Failed')
    }catch{ setStatus('Failed') }
  }

  if(status==='submitted'){
    return (
      <div className="container" style={getSuccessContainerStyle(isMobile)}>
        <div style={getSuccessCardStyle(isMobile)}>
          <h2 style={getSuccessTitleStyle(isMobile)}>Thanks! 🎉</h2>
          <p style={getSuccessTextStyle(isMobile)}>Hold on — we will review and verify your profile. After approval, you will receive a unique ID and password on WhatsApp.</p>
        <Link to="/" style={getBtnGhostStyle(isMobile)}>Back home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={getContainerStyle(isMobile)}>
      <div style={getFormCardStyle(isMobile)}>
        <h2 style={getTitleStyle(isMobile)}>Tell us about you</h2>
        <form onSubmit={submit} style={getFormStyle(isMobile)}>
          {/* Personal Information - Two columns on PC, single column on phone */}
          <div style={getPersonalInfoGridStyle(isMobile)}>
            <Input label="Name" value={form.name} onChange={v=>setForm({...form,name:v})} required isMobile={isMobile} />
            <Select label="Gender" value={form.gender} onChange={v=>setForm({...form,gender:v})} options={['male','female','trans']} required isMobile={isMobile} />
            <Input label="Date of birth" type="date" value={form.dateOfBirth} onChange={v=>setForm({...form,dateOfBirth:v})} required isMobile={isMobile} />
            <Input label="WhatsApp number" value={form.whatsappNumber} onChange={v=>setForm({...form,whatsappNumber:v})} required isMobile={isMobile} />
            <Input label="Instagram handle" value={form.instagramHandle} onChange={v=>setForm({...form,instagramHandle:v})} required isMobile={isMobile} />
            <LocationSelect 
              label="Location" 
              value={form.location} 
              onChange={v=>setForm({...form,location:v})} 
              customValue={form.customLocation}
              onCustomChange={v=>setForm({...form,customLocation:v})}
              options={cities}
              required 
              isMobile={isMobile}
            />
          </div>
          
          {/* Full width fields */}
          <Select label="Relationship status" value={form.relationshipStatus} onChange={v=>setForm({...form,relationshipStatus:v})} options={['single','in a relationship','recent breakup','its complicated','divorced']} required full isMobile={isMobile} />
          <Text label="Bio (minimum 25 words, don't use AI)" value={form.bio} onChange={v=>setForm({...form,bio:v})} rows={6} required full isMobile={isMobile} />
          <Input label="Interest 1" value={form.interest1} onChange={v=>setForm({...form,interest1:v})} required full isMobile={isMobile} />
          <Text label="Interest 1 description (minimum 10 words)" value={form.interest1Desc} onChange={v=>setForm({...form,interest1Desc:v})} rows={3} required full isMobile={isMobile} />
          <Input label="Interest 2" value={form.interest2} onChange={v=>setForm({...form,interest2:v})} required full isMobile={isMobile} />
          <Text label="Interest 2 description (minimum 10 words)" value={form.interest2Desc} onChange={v=>setForm({...form,interest2Desc:v})} rows={3} required full isMobile={isMobile} />
          <Input label="Interest 3" value={form.interest3} onChange={v=>setForm({...form,interest3:v})} required full isMobile={isMobile} />
          <Text label="Interest 3 description (minimum 10 words)" value={form.interest3Desc} onChange={v=>setForm({...form,interest3Desc:v})} rows={3} required full isMobile={isMobile} />
          
          <div style={getButtonContainerStyle(isMobile)}>
            <button style={getBtnPrimaryStyle(isMobile)} type="submit">Submit for review</button>
            <Link to="/" style={getBtnGhostStyle(isMobile)}>Cancel</Link>
          </div>
          {status && status!=='submitted' && <div style={getErrorStyle(isMobile)}>{status}</div>}
        </form>
      </div>
    </div>
  )
}

function Input({label,value,onChange,required=false,full=false,type="text",isMobile=false}:{label:string;value:string;onChange:(v:string)=>void;required?:boolean;full?:boolean;type?:string;isMobile?:boolean}){
  return (
    <label style={{...getLabelStyle(isMobile), gridColumn: full? '1/-1': undefined}}>
      <span style={getLabelTextStyle(isMobile)}>{label}{required?' *':''}</span>
      <input 
        type={type} 
        value={value} 
        onChange={e=>onChange(e.target.value)} 
        required={required} 
        style={getInputStyle(isMobile)} 
      />
    </label>
  )
}

function Select({label,value,onChange,options,required=false,full=false,isMobile=false}:{label:string;value:string;onChange:(v:string)=>void;options:string[];required?:boolean;full?:boolean;isMobile?:boolean}){
  return (
    <label style={{...getLabelStyle(isMobile), gridColumn: full? '1/-1': undefined}}>
      <span style={getLabelTextStyle(isMobile)}>{label}{required?' *':''}</span>
      <select value={value} onChange={e=>onChange(e.target.value)} required={required} style={getSelectStyle(isMobile)}>
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </label>
  )
}

function LocationSelect({label,value,onChange,customValue,onCustomChange,options,required=false,full=false,isMobile=false}:{
  label:string;
  value:string;
  onChange:(v:string)=>void;
  customValue:string;
  onCustomChange:(v:string)=>void;
  options:string[];
  required?:boolean;
  full?:boolean;
  isMobile?:boolean;
}){
  return (
    <label style={{...getLabelStyle(isMobile), gridColumn: full? '1/-1': undefined}}>
      <span style={getLabelTextStyle(isMobile)}>{label}{required?' *':''}</span>
      <select value={value} onChange={e=>onChange(e.target.value)} required={required} style={getSelectStyle(isMobile)}>
        <option value="">Select your city</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {value === 'Others' && (
        <input 
          type="text" 
          placeholder="Enter your city name" 
          value={customValue} 
          onChange={e=>onCustomChange(e.target.value)} 
          required={required}
          style={{...getInputStyle(isMobile), marginTop: '8px'}} 
        />
      )}
    </label>
  )
}

function Text({label,value,onChange,rows=4,required=false,full=false,isMobile=false}:{label:string;value:string;onChange:(v:string)=>void;rows?:number;required?:boolean;full?:boolean;isMobile?:boolean}){
  return (
    <label style={{...getLabelStyle(isMobile), gridColumn: full? '1/-1': undefined}}>
      <span style={getLabelTextStyle(isMobile)}>{label}{required?' *':''}</span>
      <textarea 
        value={value} 
        onChange={e=>onChange(e.target.value)} 
        rows={rows} 
        required={required} 
        style={getTextareaStyle(isMobile)} 
      />
    </label>
  )
}

// Dynamic style functions
const getContainerStyle = (isMobile: boolean): React.CSSProperties => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: isMobile ? '20px' : '40px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
})

const getFormCardStyle = (isMobile: boolean): React.CSSProperties => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: isMobile ? '16px' : '24px',
  padding: isMobile ? '24px' : '48px',
  width: '100%',
  maxWidth: isMobile ? '100%' : '900px',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)'
})

const getTitleStyle = (isMobile: boolean): React.CSSProperties => ({
  fontSize: isMobile ? '24px' : '32px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: isMobile ? '0 0 24px 0' : '0 0 40px 0',
  textAlign: 'center',
  letterSpacing: '-0.5px'
})

const getFormStyle = (isMobile: boolean): React.CSSProperties => ({
  display: 'grid',
  gap: isMobile ? '16px' : '24px'
})

const getPersonalInfoGridStyle = (isMobile: boolean): React.CSSProperties => ({
  display: 'grid',
  gap: isMobile ? '16px' : '24px',
  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr'
})

const getLabelStyle = (isMobile: boolean): React.CSSProperties => ({
  display: 'grid',
  gap: isMobile ? '6px' : '8px'
})

const getLabelTextStyle = (isMobile: boolean): React.CSSProperties => ({
  color: '#374151',
  fontSize: isMobile ? '13px' : '14px',
  fontWeight: '600',
  letterSpacing: '0.025em'
})

const getInputStyle = (isMobile: boolean): React.CSSProperties => ({
  background: '#ffffff',
  border: '2px solid #e5e7eb',
  borderRadius: isMobile ? '10px' : '12px',
  padding: isMobile ? '12px 16px' : '16px 20px',
  color: '#1f2937',
  fontSize: isMobile ? '15px' : '16px',
  fontWeight: '500',
  transition: 'all 0.2s ease',
  outline: 'none',
  fontFamily: 'inherit'
})

const getSelectStyle = (isMobile: boolean): React.CSSProperties => ({
  ...getInputStyle(isMobile),
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundPosition: 'right 12px center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '16px',
  paddingRight: isMobile ? '40px' : '48px'
})

const getTextareaStyle = (isMobile: boolean): React.CSSProperties => ({
  ...getInputStyle(isMobile),
  resize: 'vertical',
  minHeight: isMobile ? '100px' : '120px',
  fontFamily: 'inherit',
  lineHeight: '1.5'
})

const getButtonContainerStyle = (isMobile: boolean): React.CSSProperties => ({
  gridColumn: '1/-1',
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  gap: isMobile ? '12px' : '16px',
  marginTop: isMobile ? '24px' : '32px',
  justifyContent: isMobile ? 'stretch' : 'center'
})

const getBtnPrimaryStyle = (isMobile: boolean): React.CSSProperties => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: isMobile ? '14px 24px' : '16px 32px',
  borderRadius: isMobile ? '10px' : '12px',
  color: 'white',
  fontWeight: '600',
  fontSize: isMobile ? '15px' : '16px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  minWidth: isMobile ? 'auto' : '160px'
})

const getBtnGhostStyle = (isMobile: boolean): React.CSSProperties => ({
  padding: isMobile ? '14px 24px' : '16px 32px',
  borderRadius: isMobile ? '10px' : '12px',
  color: '#6b7280',
  border: '2px solid #e5e7eb',
  background: 'transparent',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: isMobile ? '15px' : '16px',
  textDecoration: 'none',
  transition: 'all 0.2s ease',
  textAlign: 'center',
  minWidth: isMobile ? 'auto' : '160px'
})

const getErrorStyle = (isMobile: boolean): React.CSSProperties => ({
  color: '#dc2626',
  fontSize: isMobile ? '13px' : '14px',
  fontWeight: '500',
  textAlign: 'center',
  marginTop: isMobile ? '12px' : '16px',
  padding: isMobile ? '10px' : '12px',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px'
})

const getSuccessContainerStyle = (isMobile: boolean): React.CSSProperties => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: isMobile ? '20px' : '40px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
})

const getSuccessCardStyle = (isMobile: boolean): React.CSSProperties => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: isMobile ? '16px' : '24px',
  padding: isMobile ? '24px' : '48px',
  width: '100%',
  maxWidth: isMobile ? '100%' : '500px',
  textAlign: 'center',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)'
})

const getSuccessTitleStyle = (isMobile: boolean): React.CSSProperties => ({
  fontSize: isMobile ? '24px' : '32px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: isMobile ? '0 0 16px 0' : '0 0 24px 0',
  letterSpacing: '-0.5px'
})

const getSuccessTextStyle = (isMobile: boolean): React.CSSProperties => ({
  color: '#6b7280',
  fontSize: isMobile ? '14px' : '16px',
  lineHeight: '1.6',
  margin: isMobile ? '0 0 24px 0' : '0 0 32px 0'
})

// Add responsive hover effects
const addHoverEffects = () => {
  const style = document.createElement('style')
  style.textContent = `
    input:focus, select:focus, textarea:focus {
      border-color: #667eea !important;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
    }
    
    button:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4) !important;
    }
    
    a:hover {
      background-color: #f9fafb !important;
      border-color: #d1d5db !important;
    }
    
    /* Mobile-specific adjustments */
    @media (max-width: 767px) {
      button:hover {
        transform: none !important;
      }
    }
  `
  document.head.appendChild(style)
}

// Initialize hover effects
if (typeof document !== 'undefined') {
  addHoverEffects()
}



