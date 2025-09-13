import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

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
    partnerExpectations:"",
    interest1:"",
    interest2:"",
    interest3:"",
    interest4:"",
    interest5:"",
    interest6:"",
  })
  const [status,setStatus]=useState<string|undefined>()
  const [isMobile, setIsMobile] = useState(false)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Update form when selectedInterests changes
  useEffect(() => {
    const newForm = { ...form }
    for (let i = 0; i < 6; i++) {
      newForm[`interest${i + 1}` as keyof typeof form] = selectedInterests[i] || ""
    }
    setForm(newForm)
  }, [selectedInterests])

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

  const interests = [
    "Travel & Adventure",
    "Cooking & Food",
    "Music & Concerts",
    "Movies & TV Shows",
    "Reading & Books",
    "Fitness & Gym",
    "Dancing",
    "Photography",
    "Art & Creativity",
    "Gaming",
    "Sports & Athletics",
    "Nature & Hiking",
    "Technology & Gadgets",
    "Fashion & Style",
    "Coffee & Cafes",
    "Wine & Fine Dining",
    "Yoga & Meditation",
    "Pets & Animals",
    "Comedy & Stand-up",
    "Board Games",
    "Volunteering",
    "Language Learning",
    "DIY & Crafts",
    "Astronomy",
    "History & Museums",
    "Fashion & Shopping",
    "Beach & Water Sports",
    "Camping & Outdoors",
    "Classical Music",
    "Street Food",
    "Skincare & Beauty"
  ]

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest))
    } else if (selectedInterests.length < 6) {
      setSelectedInterests([...selectedInterests, interest])
    }
  }

  async function submit(e:React.FormEvent){
    e.preventDefault()
    if (selectedInterests.length !== 6) {
      setStatus('Please select exactly 6 interests')
      return
    }
    if (!acceptedTerms) {
      setStatus('Please accept the Terms and Conditions to continue')
      return
    }
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
      <>
        <Helmet>
          <title>Registration Complete | Snift</title>
          <meta name="description" content="Thank you for joining Snift! Your profile is under review. We'll notify you once approved to start connecting with meaningful people." />
          <link rel="canonical" href="https://thesnift.com/register" />
        </Helmet>
        <div className="min-h-screen" style={{backgroundColor: 'var(--page-background)', padding: '16px'}}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="form-card animate-fade-in text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-4" style={{color: 'var(--primary-text)'}}>
              Thanks! 🎉
            </h2>
            <p className="mb-8 leading-relaxed" style={{color: 'var(--secondary-text)'}}>
              Hold on — we will review and verify your profile. After approval, you will receive a unique ID and password on WhatsApp.
            </p>
            <Link 
              to="/" 
              className="primary-button inline-block"
            >
              Back home
            </Link>
          </div>
        </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Join Snift | Create Your Profile - No Photo Dating App</title>
        <meta name="description" content="Join Snift and create your profile in our unique no-photo dating app. Share your story, interests, and connect through meaningful conversations. Character finds connection." />
        <meta name="keywords" content="join snift, sign up, create profile, no photo dating, character based dating, meaningful connections, dating app registration" />
        <link rel="canonical" href="https://thesnift.com/register" />
        
        <meta property="og:title" content="Join Snift | Create Your Profile - No Photo Dating App" />
        <meta property="og:description" content="Join Snift and create your profile in our unique no-photo dating app. Share your story, interests, and connect through meaningful conversations." />
        <meta property="og:url" content="https://thesnift.com/register" />
        <meta property="og:type" content="website" />
        
        <meta property="twitter:title" content="Join Snift | Create Your Profile - No Photo Dating App" />
        <meta property="twitter:description" content="Join Snift and create your profile in our unique no-photo dating app. Share your story, interests, and connect through meaningful conversations." />
        <meta property="twitter:url" content="https://thesnift.com/register" />
      </Helmet>
      <div className="min-h-screen" style={{backgroundColor: 'var(--page-background)', padding: '16px'}}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="form-card animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="font-heading text-2xl md:text-3xl font-semibold mb-2" style={{color: 'var(--primary-text)'}}>
              Tell us about you
            </h1>
            <p className="text-xs md:text-sm" style={{color: 'var(--secondary-text)'}}>
              It takes ~2 minutes.
            </p>
          </div>
          <form id="registration-form" onSubmit={submit} className="space-y-6">
            {/* Basics Section */}
            <div>
              <h3 className="form-section-header">Basics</h3>
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
            </div>
            
            {/* About you Section */}
            <div>
              <h3 className="form-section-header">About you</h3>
              <div className="space-y-6">
                <Select label="Relationship status" value={form.relationshipStatus} onChange={v=>setForm({...form,relationshipStatus:v})} options={['single','in a relationship','recent breakup','its complicated','divorced']} required full />
                <Text label="Bio (minimum 25 words, don't use AI)" value={form.bio} onChange={v=>setForm({...form,bio:v})} rows={6} required full />
                <Text label="What do you expect in your partner? (minimum 25 words)" value={form.partnerExpectations} onChange={v=>setForm({...form,partnerExpectations:v})} rows={6} required full />
              </div>
            </div>
            
            {/* Interests Section */}
            <div>
              <div className="mb-4">
                <h3 className="text-base font-semibold mb-2" style={{color: 'var(--primary-text)'}}>
                  Interests
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm" style={{color: 'var(--helper-text)'}}>
                    ({selectedInterests.length}/6)
                  </span>
                </div>
                <div className="h-px mb-4" style={{backgroundColor: 'var(--dividers)'}}></div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`interest-chip ${
                      selectedInterests.includes(interest) ? 'selected' : ''
                    } ${selectedInterests.length >= 6 && !selectedInterests.includes(interest) ? 'disabled' : ''}`}
                    disabled={selectedInterests.length >= 6 && !selectedInterests.includes(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              
              {selectedInterests.length === 6 && (
                <p className="text-xs mt-3" style={{color: 'var(--helper-text)'}}>
                  You've selected 6. Tap again to deselect.
                </p>
              )}
            </div>
            
            {/* Review & Submit Section */}
            <div>
              <div className="form-divider"></div>
              <h3 className="form-section-header">Review & submit</h3>
              
              {/* Terms and Conditions Checkbox */}
              <div className="flex items-start gap-3 p-4 rounded-lg mb-10" style={{backgroundColor: 'var(--muted)', border: '1px solid var(--hairline-borders)'}}>
                <input
                  type="checkbox"
                  id="terms-checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded focus:ring-2"
                  style={{
                    accentColor: 'var(--brand-accent)',
                    backgroundColor: 'var(--card-paper)',
                    borderColor: 'var(--hairline-borders)'
                  }}
                />
                <label htmlFor="terms-checkbox" className="text-sm leading-relaxed cursor-pointer" style={{color: 'var(--secondary-text)'}}>
                  I agree to the{' '}
                  <Link 
                    to="/terms" 
                    target="_blank"
                    className="underline font-medium transition-colors"
                    style={{color: 'var(--brand-accent)'}}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--brand-accent-hover)'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--brand-accent)'}
                  >
                    Terms and Conditions
                  </Link>
                  {' '}and understand that I must comply with the community guidelines and safety requirements.
                </label>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link 
                  to="/" 
                  className="secondary-button text-center"
                >
                  Cancel
                </Link>
              </div>
              {status && status!=='submitted' && (
                <div className="text-sm font-medium text-center p-3 rounded-lg mt-4" style={{backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)'}}>
                  {status}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      
      {/* Sticky submit bar */}
      <div className="sticky-submit-bar">
        <button 
          className="primary-button"
          type="submit"
          form="registration-form"
          disabled={!acceptedTerms}
        >
          Submit for review
        </button>
      </div>
      </div>
    </>
  )
}

function Input({label,value,onChange,required=false,full=false,type="text"}:{label:string;value:string;onChange:(v:string)=>void;required?:boolean;full?:boolean;type?:string}){
  return (
    <div className={`block ${full ? 'md:col-span-2' : ''}`}>
      <label className="form-label">
        {label}{required?' *':''}
      </label>
      <input 
        type={type} 
        value={value} 
        onChange={e=>onChange(e.target.value)} 
        required={required} 
        className="form-input w-full"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  )
}

function Select({label,value,onChange,options,required=false,full=false}:{label:string;value:string;onChange:(v:string)=>void;options:string[];required?:boolean;full?:boolean}){
  return (
    <div className={`block ${full ? 'md:col-span-2' : ''}`}>
      <label className="form-label">
        {label}{required?' *':''}
      </label>
      <select 
        value={value} 
        onChange={e=>onChange(e.target.value)} 
        required={required} 
        className="form-input w-full cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238A4B2A' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 12px center',
          backgroundSize: '16px'
        }}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
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
    <div className={`block ${full ? 'md:col-span-2' : ''}`}>
      <label className="form-label">
        {label}{required?' *':''}
      </label>
      <select 
        value={value} 
        onChange={e=>onChange(e.target.value)} 
        required={required} 
        className="form-input w-full cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238A4B2A' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
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
          className="form-input w-full mt-2"
        />
      )}
    </div>
  )
}

function Text({label,value,onChange,rows=4,required=false,full=false}:{label:string;value:string;onChange:(v:string)=>void;rows?:number;required?:boolean;full?:boolean}){
  const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
  const minWords = 25;
  const isMinimumMet = wordCount >= minWords;
  
  return (
    <div className={`block ${full ? 'md:col-span-2' : ''}`}>
      <label className="form-label">
        {label}{required?' *':''}
      </label>
      <div className="relative">
        <textarea 
          value={value} 
          onChange={e=>onChange(e.target.value)} 
          rows={rows} 
          required={required} 
          className="form-input w-full resize-vertical min-h-32"
          placeholder={`Enter ${label.toLowerCase()}`}
          style={{
            minHeight: '140px',
            paddingBottom: '32px'
          }}
        />
        <div 
          className="absolute bottom-2 right-3 text-xs"
          style={{color: isMinimumMet ? 'var(--brand-accent)' : 'var(--helper-text)'}}
        >
          {wordCount} words
        </div>
      </div>
      {required && (
        <p className="form-helper">
          Minimum {minWords} words required
        </p>
      )}
    </div>
  )
}



