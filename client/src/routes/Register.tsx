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
      <div className="min-h-screen bg-background flex items-center justify-center p-5">
        <div className="bg-card rounded-3xl p-8 md:p-12 max-w-lg w-full shadow-xl animate-fade-in text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-black text-card-foreground mb-6">
            Thanks! 🎉
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Hold on — we will review and verify your profile. After approval, you will receive a unique ID and password on WhatsApp.
          </p>
          <Link 
            to="/" 
            className="inline-block bg-primary text-primary-foreground font-bold px-8 py-4 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            Back home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-5 flex items-center justify-center">
      <div className="bg-card rounded-3xl p-8 md:p-12 max-w-4xl w-full shadow-xl animate-slide-up">
        <h2 className="font-heading text-3xl md:text-4xl font-black text-card-foreground mb-10 text-center">
          Tell us about you
        </h2>
        <form onSubmit={submit} className="space-y-6">
          {/* Personal Information - Two columns on PC, single column on phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
          
          {/* Full width fields */}
          <Select label="Relationship status" value={form.relationshipStatus} onChange={v=>setForm({...form,relationshipStatus:v})} options={['single','in a relationship','recent breakup','its complicated','divorced']} required full />
          <Text label="Bio (minimum 25 words, don't use AI)" value={form.bio} onChange={v=>setForm({...form,bio:v})} rows={6} required full />
          <Input label="Interest 1" value={form.interest1} onChange={v=>setForm({...form,interest1:v})} required full />
          <Text label="Interest 1 description (minimum 10 words)" value={form.interest1Desc} onChange={v=>setForm({...form,interest1Desc:v})} rows={3} required full />
          <Input label="Interest 2" value={form.interest2} onChange={v=>setForm({...form,interest2:v})} required full />
          <Text label="Interest 2 description (minimum 10 words)" value={form.interest2Desc} onChange={v=>setForm({...form,interest2Desc:v})} rows={3} required full />
          <Input label="Interest 3" value={form.interest3} onChange={v=>setForm({...form,interest3:v})} required full />
          <Text label="Interest 3 description (minimum 10 words)" value={form.interest3Desc} onChange={v=>setForm({...form,interest3Desc:v})} rows={3} required full />
          
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-10">
            <button 
              className="bg-primary text-primary-foreground font-bold px-8 py-4 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" 
              type="submit"
            >
              Submit for review
            </button>
            <Link 
              to="/" 
              className="border-2 border-primary text-primary font-bold px-8 py-4 rounded-lg text-lg bg-transparent hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-center"
            >
              Cancel
            </Link>
          </div>
          {status && status!=='submitted' && (
            <div className="bg-destructive text-destructive-foreground text-sm font-medium text-center p-3 rounded-lg">
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

function Input({label,value,onChange,required=false,full=false,type="text"}:{label:string;value:string;onChange:(v:string)=>void;required?:boolean;full?:boolean;type?:string}){
  return (
    <label className={`block ${full ? 'md:col-span-2' : ''}`}>
      <span className="text-sm font-bold text-card-foreground mb-2 block">
        {label}{required?' *':''}
      </span>
      <input 
        type={type} 
        value={value} 
        onChange={e=>onChange(e.target.value)} 
        required={required} 
        className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-card-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-all duration-300"
      />
    </label>
  )
}

function Select({label,value,onChange,options,required=false,full=false}:{label:string;value:string;onChange:(v:string)=>void;options:string[];required?:boolean;full?:boolean}){
  return (
    <label className={`block ${full ? 'md:col-span-2' : ''}`}>
      <span className="text-sm font-bold text-card-foreground mb-2 block">
        {label}{required?' *':''}
      </span>
      <select 
        value={value} 
        onChange={e=>onChange(e.target.value)} 
        required={required} 
        className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-card-foreground focus:border-primary focus:outline-none transition-all duration-300 cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b4423' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 12px center',
          backgroundSize: '16px'
        }}
      >
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
    <label className={`block ${full ? 'md:col-span-2' : ''}`}>
      <span className="text-sm font-bold text-card-foreground mb-2 block">
        {label}{required?' *':''}
      </span>
      <select 
        value={value} 
        onChange={e=>onChange(e.target.value)} 
        required={required} 
        className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-card-foreground focus:border-primary focus:outline-none transition-all duration-300 cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b4423' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 12px center',
          backgroundSize: '16px'
        }}
      >
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
          className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-card-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-all duration-300 mt-2"
        />
      )}
    </label>
  )
}

function Text({label,value,onChange,rows=4,required=false,full=false}:{label:string;value:string;onChange:(v:string)=>void;rows?:number;required?:boolean;full?:boolean}){
  return (
    <label className={`block ${full ? 'md:col-span-2' : ''}`}>
      <span className="text-sm font-bold text-card-foreground mb-2 block">
        {label}{required?' *':''}
      </span>
      <textarea 
        value={value} 
        onChange={e=>onChange(e.target.value)} 
        rows={rows} 
        required={required} 
        className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-card-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-all duration-300 resize-vertical min-h-32"
      />
    </label>
  )
}



