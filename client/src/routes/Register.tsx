import { useState } from 'react'
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
      <div className="container" style={successContainerStyle}>
        <div style={successCardStyle}>
          <h2 style={successTitleStyle}>Thanks! 🎉</h2>
          <p style={successTextStyle}>Hold on — we will review and verify your profile. After approval, you will receive a unique ID and password on WhatsApp.</p>
        <Link to="/" style={btnGhost}>Back home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={containerStyle}>
      <div style={formCardStyle}>
        <h2 style={titleStyle}>Tell us about you</h2>
        <form onSubmit={submit} style={formStyle}>
        <Input label="Name" value={form.name} onChange={v=>setForm({...form,name:v})} required />
        <Select label="Gender" value={form.gender} onChange={v=>setForm({...form,gender:v})} options={['male','female','trans']} required />
        <Input label="Date of birth" type="date" value={form.dateOfBirth} onChange={v=>setForm({...form,dateOfBirth:v})} required />
        <Input label="WhatsApp number" value={form.whatsappNumber} onChange={v=>setForm({...form,whatsappNumber:v})} required />
        <Input label="Instagram handle" value={form.instagramHandle} onChange={v=>setForm({...form,instagramHandle:v})} required />
          <LocationSelect 
            label="Location" 
            value={form.location} 
            onChange={v=>setForm({...form,location:v})} 
            customValue={form.customLocation}
            onCustomChange={v=>setForm({...form,customLocation:v})}
            options={cities}
            required 
          />
        <Select label="Relationship status" value={form.relationshipStatus} onChange={v=>setForm({...form,relationshipStatus:v})} options={['single','in a relationship','recent breakup','its complicated','divorced']} required />
        <Text label="Bio (minimum 25 words, don't use AI)" value={form.bio} onChange={v=>setForm({...form,bio:v})} rows={6} required full />
        <Input label="Interest 1" value={form.interest1} onChange={v=>setForm({...form,interest1:v})} required />
        <Text label="Interest 1 description (minimum 10 words)" value={form.interest1Desc} onChange={v=>setForm({...form,interest1Desc:v})} rows={3} required full />
        <Input label="Interest 2" value={form.interest2} onChange={v=>setForm({...form,interest2:v})} required />
        <Text label="Interest 2 description (minimum 10 words)" value={form.interest2Desc} onChange={v=>setForm({...form,interest2Desc:v})} rows={3} required full />
        <Input label="Interest 3" value={form.interest3} onChange={v=>setForm({...form,interest3:v})} required />
        <Text label="Interest 3 description (minimum 10 words)" value={form.interest3Desc} onChange={v=>setForm({...form,interest3Desc:v})} rows={3} required full />
          <div style={buttonContainerStyle}>
          <button style={btnPrimary} type="submit">Submit for review</button>
          <Link to="/" style={btnGhost}>Cancel</Link>
        </div>
          {status && status!=='submitted' && <div style={errorStyle}>{status}</div>}
      </form>
      </div>
    </div>
  )
}

function Input({label,value,onChange,required=false,full=false,type="text"}:{label:string;value:string;onChange:(v:string)=>void;required?:boolean;full?:boolean;type?:string}){
  return (
    <label style={{...labelStyle, gridColumn: full? '1/-1': undefined}}>
      <span style={labelTextStyle}>{label}{required?' *':''}</span>
      <input 
        type={type} 
        value={value} 
        onChange={e=>onChange(e.target.value)} 
        required={required} 
        style={inputStyle} 
      />
    </label>
  )
}

function Select({label,value,onChange,options,required=false,full=false}:{label:string;value:string;onChange:(v:string)=>void;options:string[];required?:boolean;full?:boolean}){
  return (
    <label style={{...labelStyle, gridColumn: full? '1/-1': undefined}}>
      <span style={labelTextStyle}>{label}{required?' *':''}</span>
      <select value={value} onChange={e=>onChange(e.target.value)} required={required} style={selectStyle}>
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </label>
  )
}

function LocationSelect({label,value,onChange,customValue,onCustomChange,options,required=false,full=false}:{
  label:string;
  value:string;
  onChange:(v:string)=>void;
  customValue:string;
  onCustomChange:(v:string)=>void;
  options:string[];
  required?:boolean;
  full?:boolean;
}){
  return (
    <label style={{...labelStyle, gridColumn: full? '1/-1': undefined}}>
      <span style={labelTextStyle}>{label}{required?' *':''}</span>
      <select value={value} onChange={e=>onChange(e.target.value)} required={required} style={selectStyle}>
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
          style={{...inputStyle, marginTop: '8px'}} 
        />
      )}
    </label>
  )
}

function Text({label,value,onChange,rows=4,required=false,full=false}:{label:string;value:string;onChange:(v:string)=>void;rows?:number;required?:boolean;full?:boolean}){
  return (
    <label style={{...labelStyle, gridColumn: full? '1/-1': undefined}}>
      <span style={labelTextStyle}>{label}{required?' *':''}</span>
      <textarea 
        value={value} 
        onChange={e=>onChange(e.target.value)} 
        rows={rows} 
        required={required} 
        style={textareaStyle} 
      />
    </label>
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

const formCardStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  padding: '48px',
  maxWidth: '800px',
  width: '100%',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)'
}

const titleStyle: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 40px 0',
  textAlign: 'center',
  letterSpacing: '-0.5px'
}

const formStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '24px'
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

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundPosition: 'right 12px center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '16px',
  paddingRight: '48px'
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
  minHeight: '120px',
  fontFamily: 'inherit',
  lineHeight: '1.5'
}

const buttonContainerStyle: React.CSSProperties = {
  gridColumn: '1/-1',
  display: 'flex',
  gap: '16px',
  marginTop: '32px',
  justifyContent: 'center'
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
  minWidth: '160px'
}

const btnGhost: React.CSSProperties = {
  padding: '16px 32px',
  borderRadius: '12px',
  color: '#6b7280',
  border: '2px solid #e5e7eb',
  background: 'transparent',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '16px',
  textDecoration: 'none',
  transition: 'all 0.2s ease',
  minWidth: '160px',
  textAlign: 'center'
}

const errorStyle: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '14px',
  fontWeight: '500',
  textAlign: 'center',
  marginTop: '16px',
  padding: '12px',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px'
}

const successContainerStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '40px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
}

const successCardStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  padding: '48px',
  maxWidth: '500px',
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)'
}

const successTitleStyle: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 24px 0',
  letterSpacing: '-0.5px'
}

const successTextStyle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 32px 0'
}

// Add hover effects
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
  `
  document.head.appendChild(style)
}

// Initialize hover effects
if (typeof document !== 'undefined') {
  addHoverEffects()
}



