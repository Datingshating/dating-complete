import { useEffect, useState, useRef, useLayoutEffect  } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'

type Profile = { 
  id:string; 
  name:string; 
  gender:string; 
  age?:number;
  date_of_birth?:string;
  whatsapp_number?:string;
  instagram_handle?:string;
  location?:string; 
  custom_location?:string; 
  bio:string; 
  relationship_status:string; 
  partner_expectations?:string; 
  interest_1:string; 
  interest_2:string; 
  interest_3:string; 
  interest_4:string; 
  interest_5:string; 
  interest_6:string; 
  is_visible?:boolean;
  profile_created_at?:string;
  profile_updated_at?:string;
}
type MatchItem = { id:string; other_user_id:string; name:string; bio:string; relationship_status:string; partner_expectations?:string; interest_1:string; interest_2:string; interest_3:string; interest_4:string; interest_5:string; interest_6:string; instagram_handle?: string; location?:string; custom_location?:string; age?:number }

export function Dashboard(){
  const navigate = useNavigate()
  const [feed, setFeed] = useState<Profile[]>([])
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [incoming, setIncoming] = useState<{
    id: string;
    from_user_id: string;
    message: string;
    created_at: string;
    bio: string;
    name?: string;
    location?: string;
    custom_location?: string;
  }[]>([])
  const [selected, setSelected] = useState<Profile|undefined>()
  const [selectedMatchProfile, setSelectedMatchProfile] = useState<Profile|undefined>()
  const [me, setMe] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'dating' | 'profile' | 'matches' | 'requests' | 'chat' | 'packs'>('dating')
  const [filters, setFilters] = useState({
    ageRange: [18, 50],
    gender: '',
    relationshipStatus: '',
    location: ''
  })
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [filtersVisible, setFiltersVisible] = useState(false)
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [upgradeModal, setUpgradeModal] = useState<{visible:boolean; title:string; subtitle:string; cta:string; reason:'no-pack'|'requests-limit'|'matches-limit'|null}>({visible:false, title:'', subtitle:'', cta:'', reason:null})
  const userId = localStorage.getItem('userId') || ''
  const token = localStorage.getItem('authToken') || ''
  const socketRef = useRef<Socket | null>(null)

  // Function to fetch all data
  const fetchData = async () => {
    if (!userId || !token) return
    
    try {
      const base = import.meta.env.VITE_API_URL
      
      const [feedRes, matchesRes, incomingRes, meRes] = await Promise.all([
        fetch(`${base}/api/feed?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${base}/api/matches?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${base}/api/requests/incoming?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${base}/api/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ])

      const feedData = await feedRes.json()
      const matchesData = await matchesRes.json()
      const incomingData = await incomingRes.json()
      const meData = await meRes.json()



      setFeed(Array.isArray(feedData) ? feedData : [])
      setMatches(Array.isArray(matchesData) ? matchesData : [])
      setIncoming(Array.isArray(incomingData) ? incomingData : [])
      setMe(meData)
    } catch (error) {
      console.error('Error fetching data:', error)
      setFeed([])
      setMatches([])
      setIncoming([])
    }
  }

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    if (!userId) return
    
    const socket = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true
    })
    socketRef.current = socket
    
    // Authenticate the socket connection
    socket.emit('authenticate', { userId })
    
    // Listen for real-time updates
    socket.on('request_received', () => {
      console.log('New request received via WebSocket')
      fetchData() // Refresh data immediately
    })
    
    socket.on('match_updated', () => {
      console.log('Match updated via WebSocket')
      fetchData() // Refresh data immediately
    })
    
    socket.on('connect', () => {
      console.log('WebSocket connected for Dashboard')
    })
    
    socket.on('disconnect', () => {
      console.log('WebSocket disconnected from Dashboard')
    })
    
    return () => {
      socket.disconnect()
    }
  }, [userId])

  // Real-time updates for incoming requests
  useEffect(() => {
    fetchData()
    
    // Set up polling for real-time updates every 1 second for faster response
    const interval = setInterval(fetchData, 1000)
    return () => clearInterval(interval)
  }, [userId])

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showProfileDropdown && !target.closest('[data-profile-dropdown]')) {
        setShowProfileDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showProfileDropdown])

  // Header scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const header = document.getElementById('app-header')
      if (header) {
        if (window.scrollY > 10) {
          header.classList.add('scrolled')
        } else {
          header.classList.remove('scrolled')
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  async function sendRequest(toUserId:string, message:string){
    if (!message.trim()) return
    
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/requests',{
        method:'POST', 
        headers:{
          'Content-Type':'application/json',
          'Authorization': `Bearer ${token}`
        }, 
        body: JSON.stringify({fromUserId:userId,toUserId,message:message})
      })
      
      if (response.ok) {
        // Show beautiful success animation
        setShowSuccessAnimation(true)
        setTimeout(() => setShowSuccessAnimation(false), 3000)
        fetchData()
        setTimeout(() => { fetchData() }, 100)
      } else {
        const err = await response.json().catch(()=>({}))
        // Handle pack gating errors
        if (response.status === 402 && err?.errorCode === 'NO_PACK') {
          setUpgradeModal({
            visible: true,
            title: 'Unlock Matching',
            subtitle: 'Purchase a pack to start sending match requests.',
            cta: 'View Packs',
            reason: 'no-pack'
          })
          setActiveTab('packs')
          return
        }
        if (response.status === 403 && err?.errorCode === 'REQUESTS_LIMIT_REACHED') {
          setUpgradeModal({
            visible: true,
            title: "You've reached your request limit",
            subtitle: `Your plan allows up to ${err?.total ?? ''} requests. Upgrade to continue.`,
            cta: 'Upgrade Plan',
            reason: 'requests-limit'
          })
          setActiveTab('packs')
          return
        }
        alert(err?.error || 'Failed to send request. Please try again.')
      }
    } catch (error) {
      alert('Failed to send request. Please try again.')
    }
  }

  async function openPayment(){
    const r = await fetch(import.meta.env.VITE_API_URL + '/api/payment/whatsapp-link')
    const { url } = await r.json(); window.open(url,'_blank')
  }

  async function handleLogout(){
    try {
      await fetch(import.meta.env.VITE_API_URL + '/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    // Clear all storage
    localStorage.removeItem('authToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    sessionStorage.removeItem('userId')
    
    // Redirect to login
    navigate('/login')
  }

  return (
    <div className="responsive-main" style={{
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh', 
      background: '#F5F1E8',
      paddingBottom: '88px', // Space for footer navigation
      paddingLeft: '16px',
      paddingRight: '16px',
      paddingTop: '16px'
    }}>
      {/* Top Header */}
      <header className="app-header" id="app-header">
        <h1 className="header-brand">Whispyr</h1>
        <div style={{position: 'relative', zIndex: 1001}} data-profile-dropdown>
            <button 
              className="profile-avatar"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              aria-label="Profile menu"
            >
              {me?.name?.charAt(0).toUpperCase() || 'U'}
            </button>
            
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setActiveTab('profile')
                    setShowProfileDropdown(false)
                  }}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  View Profile
                </button>
                <Link
                  to="/terms"
                  className="dropdown-item"
                  onClick={() => setShowProfileDropdown(false)}
                  style={{textDecoration: 'none', display: 'block'}}
                >
                  Terms & Conditions
                </Link>
                <button
                  className="dropdown-item danger"
                  onClick={handleLogout}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        background: '#f8f9fa',
        minHeight: '100vh'
      }}>


        {/* Content Area */}
        <div style={{padding: '16px'}}>
          {activeTab === 'dating' && (
            <div className="fade-in">
              <DatingZone 
                feed={feed} 
                filters={filters} 
                setFilters={setFilters}
                filtersVisible={filtersVisible}
                setFiltersVisible={setFiltersVisible}
                onSendRequest={sendRequest}
                onViewProfile={setSelected}
                onRequireUpgrade={(info)=>{
                  setUpgradeModal({
                    visible: true,
                    title: info.title,
                    subtitle: info.subtitle,
                    cta: info.cta,
                    reason: info.reason
                  })
                  setActiveTab('packs')
                }}
              />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="fade-in">
              <ProfileSection me={me} onSaved={async()=>{
                const meR = await fetch(`${import.meta.env.VITE_API_URL}/api/me?userId=${userId}`); 
                setMe(await meR.json())
              }} />
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="fade-in">
              <MatchesSection 
                matches={matches}
                onRefresh={fetchData}
                onChatClick={(userId) => {
                  setSelectedChatUser(userId)
                  setActiveTab('chat')
                }}
                onViewProfile={async (matchItem) => {
                  try {
                    const base = import.meta.env.VITE_API_URL
                    const response = await fetch(`${base}/api/profile/${matchItem.other_user_id}`, {
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    })
                    
                    if (!response.ok) {
                      throw new Error('Failed to fetch profile')
                    }
                    
                    const profileData = await response.json()
                    setSelectedMatchProfile(profileData)
                  } catch (error) {
                    console.error('Error fetching profile:', error)
                    // Fallback to basic data if API fails
                    const fallbackProfile: Profile = {
                      id: matchItem.other_user_id,
                      name: matchItem.bio.split(' ')[0] || 'Match',
                      gender: 'Not specified',
                      location: matchItem.location,
                      custom_location: matchItem.custom_location,
                      bio: matchItem.bio,
                      relationship_status: matchItem.relationship_status,
                      interest_1: matchItem.interest_1,
                      interest_2: matchItem.interest_2,
                      interest_3: matchItem.interest_3,
                      interest_4: matchItem.interest_4,
                      interest_5: matchItem.interest_5,
                      interest_6: matchItem.interest_6
                    }
                    setSelectedMatchProfile(fallbackProfile)
                  }
                }}
              />
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="fade-in">
              <RequestsSection 
                incoming={incoming}
                onAccepted={async (id) => {
                  // Remove from incoming requests
                  setIncoming(incoming.filter(i => i.id !== id))
                  // Refresh data to update matches
                  await fetchData()
                }}
                userId={userId}
                onViewProfile={async (requestItem) => {
                  try {
                    const base = import.meta.env.VITE_API_URL
                    const response = await fetch(`${base}/api/profile/${requestItem.from_user_id}`, {
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    })
                    
                    if (!response.ok) {
                      throw new Error('Failed to fetch profile')
                    }
                    
                    const profileData = await response.json()
                    setSelectedMatchProfile(profileData)
                  } catch (error) {
                    console.error('Error fetching profile:', error)
                    // Fallback to basic data if API fails
                    const fallbackProfile: Profile = {
                      id: requestItem.from_user_id,
                      name: requestItem.name || `User ${requestItem.from_user_id.slice(0,8)}…`,
                      bio: requestItem.bio || 'No bio available',
                      gender: 'Not specified',
                      relationship_status: 'Not specified',
                      location: requestItem.location || 'Not specified',
                      custom_location: requestItem.custom_location,
                      interest_1: 'Not specified',
                      interest_2: 'Not specified',
                      interest_3: 'Not specified',
                      interest_4: 'Not specified',
                      interest_5: 'Not specified',
                      interest_6: 'Not specified',
                      partner_expectations: 'Not specified',
                      instagram_handle: undefined,
                      age: undefined
                    }
                    setSelectedMatchProfile(fallbackProfile)
                  }
                }}
              />
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="fade-in">
              <ChatSection 
                matches={matches} 
                userId={userId}
                selectedChatUser={selectedChatUser}
                setSelectedChatUser={setSelectedChatUser}
              />
            </div>
          )}

          {activeTab === 'packs' && (
            <div className="fade-in">
              <PacksSection userId={userId} />
            </div>
          )}
        </div>
      </main>

      {/* Profile Modal */}
      {selected && (
        <Modal onClose={()=>setSelected(undefined)}>
          <h3 style={{color: 'var(--text)', margin: '0 0 16px 0'}}>Profile Details</h3>
          <p style={{color:'var(--muted)', margin: '0 0 16px 0', lineHeight: 1.6}}>{selected.bio}</p>
          {selected.partner_expectations && (
            <div style={{marginBottom: '16px'}}>
              <div style={{color: 'var(--text)', fontWeight: 600, marginBottom: '8px'}}>Partner Expectations:</div>
              <p style={{color:'var(--muted)', margin: 0, lineHeight: 1.6}}>{selected.partner_expectations}</p>
            </div>
          )}
          <div style={{display: 'grid', gap: '8px', marginBottom: '16px'}}>
            <div style={{color: 'var(--text)'}}><strong>Name:</strong> {selected.name}</div>
            <div style={{color: 'var(--text)'}}><strong>Gender:</strong> {selected.gender}</div>
            <div style={{color: 'var(--text)'}}><strong>Status:</strong> {selected.relationship_status}</div>
            {selected.location && (
              <div style={{color: 'var(--text)'}}><strong>Location:</strong> {selected.location}</div>
            )}
          </div>
          <div style={{display: 'grid', gap: '12px'}}>
            <div>
              <div style={{color: 'var(--text)', fontWeight: 600}}>Interest 1: {selected.interest_1}</div>
            </div>
            <div>
              <div style={{color: 'var(--text)', fontWeight: 600}}>Interest 2: {selected.interest_2}</div>
            </div>
            <div>
              <div style={{color: 'var(--text)', fontWeight: 600}}>Interest 3: {selected.interest_3}</div>
            </div>
            <div>
              <div style={{color: 'var(--text)', fontWeight: 600}}>Interest 4: {selected.interest_4}</div>
            </div>
            <div>
              <div style={{color: 'var(--text)', fontWeight: 600}}>Interest 5: {selected.interest_5}</div>
            </div>
            <div>
              <div style={{color: 'var(--text)', fontWeight: 600}}>Interest 6: {selected.interest_6}</div>
            </div>
          </div>
        </Modal>
      )}

      {/* Match Profile Modal */}
      {selectedMatchProfile && (
        <Modal onClose={()=>setSelectedMatchProfile(undefined)}>

          
          {/* Basic Info */}
          <div style={{display: 'grid', gap: '16px', marginBottom: '24px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <svg width="16" height="16" fill="#8B4513" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span style={{color: '#8B4513', fontSize: '18px', fontWeight: 600}}>{selectedMatchProfile.name}</span>
              {selectedMatchProfile.age && (
                <span style={{color: '#8B4513', fontSize: '14px'}}>• {selectedMatchProfile.age} years</span>
              )}
            </div>
            
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <svg width="16" height="16" fill="#8B4513" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span style={{color: '#8B4513', fontSize: '16px', textTransform: 'capitalize'}}>{selectedMatchProfile.gender}</span>
              {selectedMatchProfile.relationship_status && (
                <>
                  <span style={{color: '#8B4513', fontSize: '14px'}}>•</span>
                  <span style={{color: '#8B4513', fontSize: '16px', textTransform: 'capitalize'}}>{selectedMatchProfile.relationship_status.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                </>
              )}
            </div>
            
            {selectedMatchProfile.location && (
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <svg width="16" height="16" fill="#8B4513" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span style={{color: '#8B4513', fontSize: '16px'}}>{selectedMatchProfile.location}</span>
                {selectedMatchProfile.custom_location && (
                  <>
                    <span style={{color: '#8B4513', fontSize: '14px'}}>•</span>
                    <span style={{color: '#8B4513', fontSize: '16px'}}>{selectedMatchProfile.custom_location}</span>
                  </>
                )}
              </div>
            )}
            
            {selectedMatchProfile.instagram_handle && (
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <svg width="16" height="16" fill="#8B4513" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span style={{color: '#8B4513', fontSize: '16px'}}>@{selectedMatchProfile.instagram_handle}</span>
              </div>
            )}
          </div>

          {/* Bio */}
          <div style={{marginBottom: '20px'}}>
            <div style={{color: '#8B4513', fontWeight: 600, marginBottom: '8px', fontSize: '16px'}}>About:</div>
            <p style={{color:'#8B4513', margin: 0, lineHeight: 1.6, fontSize: '14px'}}>{selectedMatchProfile.bio}</p>
          </div>

          {/* Partner Expectations */}
          <div style={{marginBottom: '20px'}}>
            <div style={{color: '#8B4513', fontWeight: 600, marginBottom: '8px', fontSize: '16px'}}>Partner Expectations:</div>
            <p style={{color:'#8B4513', margin: 0, lineHeight: 1.6, fontSize: '14px'}}>{selectedMatchProfile.partner_expectations || 'No partner expectations specified'}</p>
          </div>

          {/* Interests */}
          <div style={{display: 'grid', gap: '16px'}}>
            <div style={{color: '#8B4513', fontWeight: 600, fontSize: '16px', marginBottom: '8px'}}>Interests:</div>
            {selectedMatchProfile.interest_1 && (
              <InterestDropdown 
                title={selectedMatchProfile.interest_1}
              />
            )}
            {selectedMatchProfile.interest_2 && (
              <InterestDropdown 
                title={selectedMatchProfile.interest_2}
              />
            )}
            {selectedMatchProfile.interest_3 && (
              <InterestDropdown 
                title={selectedMatchProfile.interest_3}
              />
            )}
            {selectedMatchProfile.interest_4 && (
              <InterestDropdown 
                title={selectedMatchProfile.interest_4}
              />
            )}
            {selectedMatchProfile.interest_5 && (
              <InterestDropdown 
                title={selectedMatchProfile.interest_5}
              />
            )}
            {selectedMatchProfile.interest_6 && (
              <InterestDropdown 
                title={selectedMatchProfile.interest_6}
              />
            )}
          </div>
        </Modal>
      )}

      {/* Footer Navigation */}
      {!selectedChatUser && (
        <nav className="footer-navigation">
          <button
            className={`footer-nav-item ${activeTab === 'dating' ? 'active' : ''}`}
            onClick={() => setActiveTab('dating')}
          >
            <svg className="footer-nav-icon" fill={activeTab === 'dating' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="footer-nav-label">Discover</span>
          </button>

          <button
            className={`footer-nav-item ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            <svg className="footer-nav-icon" fill={activeTab === 'matches' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            <span className="footer-nav-label">Matches</span>
            {matches.length > 0 && (
              <div className="footer-nav-badge">
                {matches.length}
              </div>
            )}
          </button>

          <button
            className={`footer-nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <svg className="footer-nav-icon" fill={activeTab === 'chat' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="footer-nav-label">Chat</span>
          </button>

          <button
            className={`footer-nav-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <svg className="footer-nav-icon" fill={activeTab === 'requests' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span className="footer-nav-label">Requests</span>
            {incoming.length > 0 && (
              <div className="footer-nav-badge">
                {incoming.length}
              </div>
            )}
          </button>

          <button
            className={`footer-nav-item ${activeTab === 'packs' ? 'active' : ''}`}
            onClick={() => setActiveTab('packs')}
          >
            <svg className="footer-nav-icon" fill={activeTab === 'packs' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <span className="footer-nav-label">Packs</span>
          </button>
        </nav>
      )}

      {/* Beautiful Success Animation */}
      {showSuccessAnimation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '24px',
            padding: '40px',
            textAlign: 'center',
            color: 'white',
            boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)',
            animation: 'slideInUp 0.5s ease-out',
            position: 'relative',
            overflow: 'hidden',
            maxWidth: '90%',
            width: '400px'
          }}>
            {/* Animated Background */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              animation: 'float 6s ease-in-out infinite',
              pointerEvents: 'none'
            }} />
            
            {/* Success Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              animation: 'pulse 2s ease-in-out infinite',
              position: 'relative',
              zIndex: 1
            }}>
              <svg 
                width="40" 
                height="40" 
                fill="white" 
                viewBox="0 0 24 24"
                style={{
                  animation: 'checkmark 0.6s ease-out 0.3s both'
                }}
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>

            {/* Success Message */}
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '24px',
              fontWeight: '700',
              position: 'relative',
              zIndex: 1,
              animation: 'slideInUp 0.6s ease-out 0.2s both'
            }}>
              🎉 Request Sent!
            </h3>
            
            <p style={{
              margin: '0 0 24px 0',
              fontSize: '16px',
              opacity: 0.9,
              lineHeight: 1.5,
              position: 'relative',
              zIndex: 1,
              animation: 'slideInUp 0.6s ease-out 0.4s both'
            }}>
              Your message has been sent successfully!<br/>
              They'll receive your request soon.
            </p>

            {/* Floating Hearts */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              fontSize: '24px',
              animation: 'float 3s ease-in-out infinite',
              opacity: 0.6
            }}>💕</div>
            <div style={{
              position: 'absolute',
              top: '30px',
              right: '30px',
              fontSize: '20px',
              animation: 'float 4s ease-in-out infinite 1s',
              opacity: 0.7
            }}>✨</div>
            <div style={{
              position: 'absolute',
              bottom: '25px',
              left: '30px',
              fontSize: '18px',
              animation: 'float 3.5s ease-in-out infinite 0.5s',
              opacity: 0.5
            }}>💫</div>
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '25px',
              fontSize: '22px',
              animation: 'float 4.5s ease-in-out infinite 1.5s',
              opacity: 0.6
            }}>💖</div>

            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '2px',
              overflow: 'hidden',
              marginTop: '20px',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '2px',
                animation: 'progress 3s linear'
              }} />
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInUp {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes checkmark {
          from { 
            opacity: 0; 
            transform: scale(0.5) rotate(-45deg); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) rotate(0deg); 
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes progress {
          from { transform: translateX(-100%); }
          to { transform: translateX(0%); }
        }
      `}</style>

      {upgradeModal.visible && (
        <div style={{position:'fixed', inset:0, display:'grid', placeItems:'center', background:'rgba(0,0,0,0.5)', zIndex:1000}} onClick={()=> setUpgradeModal(prev=>({...prev, visible:false}))}>
          <div onClick={e=>e.stopPropagation()} style={{width:'92%', maxWidth:420, borderRadius:16, background:'#fff', padding:20, border:'1px solid #e9ecef', boxShadow:'0 10px 30px rgba(0,0,0,0.15)', transform:'scale(1)', transition:'transform .2s ease'}}>
            <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:8}}>
              <div style={{width:40, height:40, borderRadius:12, background:'#ffedd5', display:'grid', placeItems:'center'}}>
                <span style={{fontSize:20}}>⚠️</span>
              </div>
              <div style={{fontWeight:700, fontSize:18, color:'#111827'}}>{upgradeModal.title}</div>
            </div>
            <div style={{color:'#4b5563', fontSize:14, lineHeight:1.6, marginBottom:16}}>{upgradeModal.subtitle}</div>
            <div style={{display:'flex', gap:12, justifyContent:'flex-end'}}>
              <button onClick={()=> setUpgradeModal(prev=>({...prev, visible:false}))} style={{border:'1px solid #e5e7eb', background:'#fff', color:'#111827', borderRadius:10, padding:'10px 14px', cursor:'pointer'}}>Close</button>
              <button onClick={()=> { setUpgradeModal(prev=>({...prev, visible:false})); setActiveTab('packs'); }} style={{border:'none', background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', borderRadius:10, padding:'10px 14px', cursor:'pointer', boxShadow:'0 6px 16px rgba(16,185,129,0.35)'}}>{upgradeModal.cta}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Dating Zone Component
function DatingZone({ feed, filters, setFilters, filtersVisible, setFiltersVisible, onSendRequest, onViewProfile, onRequireUpgrade }: {
  feed: Profile[];
  filters: any;
  setFilters: (filters: any) => void;
  filtersVisible: boolean;
  setFiltersVisible: (visible: boolean) => void;
  onSendRequest: (id: string, message: string) => void;
  onViewProfile: (profile: Profile) => void;
  onRequireUpgrade: (info:{title:string; subtitle:string; cta:string; reason:'no-pack'|'requests-limit'|'matches-limit'}) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showMessagePrompt, setShowMessagePrompt] = useState(false)
  const [message, setMessage] = useState('')
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'exiting' | 'entering'>('idle')
  const [skipButtonRipple, setSkipButtonRipple] = useState(false)

  const calculateAge = (dateOfBirth: string | undefined, age: number | undefined): number => {
    // First priority: Use server-calculated age if available
    if (age && age > 0) return age
    
    // Fallback: Calculate age from date_of_birth if available
    if (dateOfBirth) {
      const today = new Date()
      const birthDate = new Date(dateOfBirth)
      
      // Check if birthDate is valid
      if (isNaN(birthDate.getTime())) return 0
      
      let calculatedAge = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      // Adjust age if birthday hasn't occurred this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--
      }
      
      return calculatedAge > 0 ? calculatedAge : 0
    }
    
    return 0
  }

  // Apply filters to feed
  const filteredFeed = feed.filter(profile => {
    const age = calculateAge(profile.date_of_birth, profile.age)
    
    // Age filter
    if (age < filters.ageRange[0] || age > filters.ageRange[1]) {
      return false
    }
    
    // Gender filter
    if (filters.gender && profile.gender !== filters.gender) {
      return false
    }
    
    // Relationship status filter
    if (filters.relationshipStatus && profile.relationship_status !== filters.relationshipStatus) {
      return false
    }
    
    // Location filter
    if (filters.location && profile.location && !profile.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false
    }
    
    return true
  })

  const currentProfile = filteredFeed[currentIndex]

  // Reset index when filters change to ensure valid index
  useEffect(() => {
    setCurrentIndex(0)
  }, [filters])

  const handleSkip = () => {
    if (isAnimating) return
    
    // Start ripple effect
    setSkipButtonRipple(true)
    setTimeout(() => setSkipButtonRipple(false), 600)
    
    setIsAnimating(true)
    setAnimationPhase('exiting')
    
    // Card exit animation
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % filteredFeed.length)
      setAnimationPhase('entering')
      
      // Card entrance animation
      setTimeout(() => {
        setAnimationPhase('idle')
        setIsAnimating(false)
      }, 200)
    }, 400)
  }

  const handleMatch = async () => {
    if (isAnimating || !currentProfile) return
    
    // Check pack status directly without making a probe request
    try {
      const packResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/user/pack?userId=${localStorage.getItem('userId') || ''}`)
      if (packResponse.ok) {
        const packData = await packResponse.json()
        
        if (!packData) {
          onRequireUpgrade({
            title: 'Unlock Matching',
            subtitle: 'Purchase a pack to start sending match requests.',
            cta: 'View Packs',
            reason: 'no-pack'
          })
          return
        }
        
        if (packData.requests_remaining !== -1 && packData.requests_remaining <= 0) {
          onRequireUpgrade({
            title: "You've reached your request limit",
            subtitle: `Your plan allows up to ${packData.requests_total} requests. Upgrade to continue.`,
            cta: 'Upgrade Plan',
            reason: 'requests-limit'
          })
          return
        }
        
        // Pack is valid and has remaining requests, show message prompt
        setShowMessagePrompt(true)
      } else {
        // If we can't check pack status, still show prompt and let sendRequest handle errors
    setShowMessagePrompt(true)
      }
    } catch (error) {
      // On error, show prompt and let sendRequest handle
      setShowMessagePrompt(true)
    }
  }

  const handleSendMessage = () => {
    if (!message.trim()) {
      alert('Please enter a message')
      return
    }
    
    // Send the request with the custom message
    onSendRequest(currentProfile?.id || '', message)
    setMessage('')
    setShowMessagePrompt(false)
    handleSkip() // Move to next profile after sending request
  }

  const handleCancelMessage = () => {
    setMessage('')
    setShowMessagePrompt(false)
  }

  const getGenderIcon = (gender: string) => {
    return (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4"/>
      </svg>
    )
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <button 
          onClick={() => setFiltersVisible(!filtersVisible)}
          style={{
            background: '#FAF7F3',
            color: '#5B6068',
            border: '1px solid #E6DFD4',
            borderRadius: '999px',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F5EFE3'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FAF7F3'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#D6EFEA'
            e.currentTarget.style.boxShadow = '0 0 0 2px #D6EFEA'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#E6DFD4'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          {filtersVisible ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Active Filter Chips */}
      {filtersVisible && (filters.gender || filters.relationshipStatus || filters.location || filters.ageRange[0] !== 18 || filters.ageRange[1] !== 50) && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '16px',
          alignItems: 'center'
        }}>
          {filters.ageRange[0] !== 18 || filters.ageRange[1] !== 50 ? (
            <span style={{
              background: '#EFE8DE',
              color: '#5B6068',
              borderRadius: '999px',
              padding: '6px 10px',
              fontSize: '12px',
              cursor: 'pointer'
            }} onClick={() => setFilters({...filters, ageRange: [18, 50]})}>
              Age: {filters.ageRange[0]}–{filters.ageRange[1]}
            </span>
          ) : null}
          {filters.gender && (
            <span style={{
              background: '#EFE8DE',
              color: '#5B6068',
              borderRadius: '999px',
              padding: '6px 10px',
              fontSize: '12px',
              cursor: 'pointer'
            }} onClick={() => setFilters({...filters, gender: ''})}>
              Gender: {filters.gender.charAt(0).toUpperCase() + filters.gender.slice(1)}
            </span>
          )}
          {filters.relationshipStatus && (
            <span style={{
              background: '#EFE8DE',
              color: '#5B6068',
              borderRadius: '999px',
              padding: '6px 10px',
              fontSize: '12px',
              cursor: 'pointer'
            }} onClick={() => setFilters({...filters, relationshipStatus: ''})}>
              Status: {filters.relationshipStatus.charAt(0).toUpperCase() + filters.relationshipStatus.slice(1)}
            </span>
          )}
          {filters.location && (
            <span style={{
              background: '#EFE8DE',
              color: '#5B6068',
              borderRadius: '999px',
              padding: '6px 10px',
              fontSize: '12px',
              cursor: 'pointer'
            }} onClick={() => setFilters({...filters, location: ''})}>
              Location: {filters.location}
            </span>
          )}
          <span style={{
            color: '#8A4B2A',
            fontSize: '12px',
            cursor: 'pointer',
            textDecoration: 'underline'
          }} onClick={() => setFilters({
            ageRange: [18, 50],
            gender: '',
            relationshipStatus: '',
            location: ''
          })}>
            Clear all
          </span>
        </div>
      )}

      {/* Collapsible Filters */}
      {filtersVisible && (
        <div style={{
          background: '#F7F3EC',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px',
          border: '1px solid #E6DFD4',
          boxShadow: '0 2px 8px rgba(17,24,39,0.06)',
          transition: 'all 0.15s ease'
        }}>
          <h3 style={{
            margin: '0 0 24px 0',
            fontSize: '17px',
            fontWeight: '600',
            color: '#8A4B2A'
          }}>
            Filters
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '24px'
          }} className="filter-grid">
            {/* Age Range Slider */}
            <div style={{ gridColumn: 'span 1' }}>
              <label style={{
                display: 'block',
                marginBottom: '12px',
                fontWeight: '500',
                color: '#1F2937',
                fontSize: '14px'
              }}>
                Age Range
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  flex: 1,
                  position: 'relative',
                  height: '20px'
                }}>
                  {/* Background track */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: '#E6DFD4',
                    borderRadius: '2px',
                    transform: 'translateY(-50%)'
                  }} />
                  
                  {/* Selected range track */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: `${((filters.ageRange[0] - 18) / (70 - 18)) * 100}%`,
                    right: `${((70 - filters.ageRange[1]) / (70 - 18)) * 100}%`,
                    height: '4px',
                    background: 'rgba(138, 75, 42, 0.3)',
                    borderRadius: '2px',
                    transform: 'translateY(-50%)'
                  }} />
                  
                  {/* Max range input - Higher z-index so it's on top */}
                  <input 
                    type="range" 
                    min="18" 
                    max="70" 
                    value={filters.ageRange[1]} 
                    onChange={(e) => {
                      const newMax = parseInt(e.target.value)
                      if (newMax >= filters.ageRange[0]) {
                        setFilters({...filters, ageRange: [filters.ageRange[0], newMax]})
                      }
                    }}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '20px',
                      background: 'transparent',
                      outline: 'none',
                      appearance: 'none',
                      zIndex: 3,
                      margin: 0,
                      padding: 0,
                      pointerEvents: 'auto'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        e.preventDefault()
                        const step = e.shiftKey ? 5 : 1
                        const newMax = e.key === 'ArrowLeft' 
                          ? Math.max(filters.ageRange[0], filters.ageRange[1] - step)
                          : Math.min(70, filters.ageRange[1] + step)
                        setFilters({...filters, ageRange: [filters.ageRange[0], newMax]})
                      }
                    }}
                  />
                  
                  {/* Min range input - Lower z-index */}
                  <input 
                    type="range" 
                    min="18" 
                    max="70" 
                    value={filters.ageRange[0]} 
                    onChange={(e) => {
                      const newMin = parseInt(e.target.value)
                      if (newMin <= filters.ageRange[1]) {
                        setFilters({...filters, ageRange: [newMin, filters.ageRange[1]]})
                      }
                    }}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '20px',
                      background: 'transparent',
                      outline: 'none',
                      appearance: 'none',
                      zIndex: 2,
                      margin: 0,
                      padding: 0,
                      pointerEvents: 'auto'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        e.preventDefault()
                        const step = e.shiftKey ? 5 : 1
                        const newMin = e.key === 'ArrowLeft' 
                          ? Math.max(18, filters.ageRange[0] - step)
                          : Math.min(filters.ageRange[1], filters.ageRange[0] + step)
                        setFilters({...filters, ageRange: [newMin, filters.ageRange[1]]})
                      }
                    }}
                  />
                </div>
                <span style={{
                  minWidth: '60px',
                  color: '#1F2937',
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'center'
                }}>
                  {filters.ageRange[0]}–{filters.ageRange[1]}
                </span>
              </div>
            </div>
            
            {/* Gender Dropdown */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#1F2937',
                fontSize: '14px'
              }}>
                Gender
              </label>
              <div style={{ position: 'relative' }}>
                <select 
                  value={filters.gender} 
                  onChange={(e) => setFilters({...filters, gender: e.target.value})}
                  style={{
                    width: '100%',
                    height: '44px',
                    background: '#FAF7F3',
                    border: '1px solid #E6DFD4',
                    borderRadius: '12px',
                    padding: '0 16px',
                    color: filters.gender ? '#1F2937' : '#5B6068',
                    fontSize: '14px',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#D6EFEA'
                    e.currentTarget.style.boxShadow = '0 0 0 2px #D6EFEA'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E6DFD4'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F5EFE3'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FAF7F3'
                  }}
                >
                  <option value="">All genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="trans">Trans</option>
                </select>
                <div style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: '#8A4B2A',
                  transition: 'transform 0.2s ease'
                }}>
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Relationship Status Dropdown */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#1F2937',
                fontSize: '14px'
              }}>
                Relationship Status
              </label>
              <div style={{ position: 'relative' }}>
                <select 
                  value={filters.relationshipStatus} 
                  onChange={(e) => setFilters({...filters, relationshipStatus: e.target.value})}
                  style={{
                    width: '100%',
                    height: '44px',
                    background: '#FAF7F3',
                    border: '1px solid #E6DFD4',
                    borderRadius: '12px',
                    padding: '0 16px',
                    color: filters.relationshipStatus ? '#1F2937' : '#5B6068',
                    fontSize: '14px',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#D6EFEA'
                    e.currentTarget.style.boxShadow = '0 0 0 2px #D6EFEA'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E6DFD4'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F5EFE3'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FAF7F3'
                  }}
                >
                  <option value="">All statuses</option>
                  <option value="single">Single</option>
                  <option value="in a relationship">In a relationship</option>
                  <option value="recent breakup">Recent breakup</option>
                  <option value="its complicated">It's complicated</option>
                  <option value="divorced">Divorced</option>
                </select>
                <div style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: '#8A4B2A',
                  transition: 'transform 0.2s ease'
                }}>
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Location Input - Full Width */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#1F2937',
              fontSize: '14px'
            }}>
              Location
            </label>
            <input 
              type="text" 
              placeholder="Enter location…"
              value={filters.location} 
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              style={{
                width: '100%',
                height: '44px',
                background: '#FAF7F3',
                border: '1px solid #E6DFD4',
                borderRadius: '12px',
                padding: '0 16px',
                color: '#1F2937',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#D6EFEA'
                e.currentTarget.style.boxShadow = '0 0 0 2px #D6EFEA'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E6DFD4'
                e.currentTarget.style.boxShadow = 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F5EFE3'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FAF7F3'
              }}
            />
          </div>
          
          {/* Clear Filters Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => setFilters({
                ageRange: [18, 50],
                gender: '',
                relationshipStatus: '',
                location: ''
              })}
              style={{
                background: '#FAF7F3',
                color: '#8A4B2A',
                border: '1.5px solid #8A4B2A',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F3EBDD'
                e.currentTarget.style.borderColor = '#6E3E22'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FAF7F3'
                e.currentTarget.style.borderColor = '#8A4B2A'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.borderColor = '#6E3E22'
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.borderColor = '#8A4B2A'
              }}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Show no profiles message if no matches */}
      {filteredFeed.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: '#FAF7F3',
          borderRadius: '16px',
          border: '1px solid #E6DFD4',
          marginTop: '16px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💔</div>
          <h3 style={{
            margin: '0 0 8px 0',
            color: '#1F2937',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            {feed.length === 0 ? 'No profiles available' : 'No matches found'}
          </h3>
          <p style={{
            margin: '0 0 16px 0',
            color: '#5B6068',
            fontSize: '14px'
          }}>
            {feed.length === 0 ? 'Check back later for new profiles!' : 'No matches. Try widening the age range or clearing a filter.'}
          </p>
          {feed.length > 0 && (
            <button
              onClick={() => setFilters({
                ageRange: [18, 50],
                gender: '',
                relationshipStatus: '',
                location: ''
              })}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8A4B2A',
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '4px 0'
              }}
            >
              Reset filters
            </button>
          )}
        </div>
      ) : !currentProfile ? (
        <div className="text-center py-10">
          <div className="text-5xl mb-4">💔</div>
          <h3 className="m-0 mb-2 text-card-foreground font-heading text-xl font-bold">
            No profile available
          </h3>
          <p className="text-muted-foreground m-0">
            Please try adjusting your filter settings
          </p>
        </div>
      ) : (
        <>
          {/* Single Profile Display */}
          {currentProfile ? (
        <div className="max-w-md mx-auto relative">
        {/* Animation styles */}
        <style>{`
          @keyframes ripple {
            0% {
              width: 0;
              height: 0;
              opacity: 1;
            }
            100% {
              width: 120px;
              height: 120px;
              opacity: 0;
            }
          }
          @keyframes particleFloat {
            0% {
              transform: translateY(0) rotate(0deg) scale(1);
              opacity: 1;
            }
            50% {
              transform: translateY(-50px) rotate(180deg) scale(1.2);
              opacity: 0.8;
            }
            100% {
              transform: translateY(-100px) rotate(360deg) scale(0.5);
              opacity: 0;
            }
          }
          @keyframes cardGlow {
            0% {
              box-shadow: 0 0 0 rgba(139, 69, 19, 0);
            }
            50% {
              box-shadow: 0 0 20px rgba(139, 69, 19, 0.3);
            }
            100% {
              box-shadow: 0 0 0 rgba(139, 69, 19, 0);
            }
          }
        `}</style>
        <div 
          className={`bg-card rounded-3xl shadow-2xl cursor-pointer flex flex-col responsive-dating-card`}
          style={{
            background: 'linear-gradient(135deg, #FAF7F3 0%, #FFFFFF 100%)',
            border: '1px solid rgba(166, 124, 82, 0.15)',
            padding: '32px',
            minHeight: '600px',
            borderRadius: '32px',
            boxShadow: '0 25px 50px -12px rgba(166, 124, 82, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            transform: animationPhase === 'exiting' 
              ? 'translateX(-100%) rotate(-15deg) scale(0.8)' 
              : animationPhase === 'entering' 
                ? 'translateX(100%) rotate(15deg) scale(0.8)' 
                : 'translateX(0) rotate(0deg) scale(1)',
            opacity: animationPhase === 'exiting' ? 0 : animationPhase === 'entering' ? 0 : 1,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: animationPhase === 'exiting' ? 'blur(2px)' : 'blur(0px)',
            animation: animationPhase === 'exiting' ? 'cardGlow 0.4s ease-out' : 'none',
            position: 'relative',
            overflow: 'hidden'
          }}
          onClick={() => onViewProfile(currentProfile)}
        >
          {/* Background decorative elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255, 182, 193, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            zIndex: 0,
            filter: 'blur(20px)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(255, 218, 185, 0.06) 0%, transparent 70%)',
            borderRadius: '50%',
            zIndex: 0,
            filter: 'blur(15px)'
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(166, 124, 82, 0.03) 0%, transparent 70%)',
            borderRadius: '50%',
            zIndex: 0,
            filter: 'blur(25px)'
          }} />
          
          {/* Particle effect during transition */}
          {animationPhase === 'exiting' && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 10
            }}>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: `${4 + Math.random() * 4}px`,
                    height: `${4 + Math.random() * 4}px`,
                    background: i % 2 === 0 ? '#8B4513' : '#107980',
                    borderRadius: '50%',
                    left: `${Math.cos(i * 45 * Math.PI / 180) * (20 + Math.random() * 20)}px`,
                    top: `${Math.sin(i * 45 * Math.PI / 180) * (20 + Math.random() * 20)}px`,
                    animation: `particleFloat 0.8s ease-out ${i * 0.05}s forwards`,
                    opacity: 0,
                    boxShadow: '0 0 6px rgba(139, 69, 19, 0.5)'
                  }}
                />
              ))}
            </div>
          )}
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-8" style={{
            gap: '20px',
            marginBottom: '32px',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{ position: 'relative' }}>
              {/* Blurred background shape */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100px',
                height: '100px',
                background: 'radial-gradient(circle, rgba(255, 182, 193, 0.2) 0%, rgba(255, 218, 185, 0.1) 100%)',
                borderRadius: '50%',
                filter: 'blur(15px)',
                zIndex: 0
              }} />
              <div className="avatar" style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFB6C1 0%, #FFDAB9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#A67C52',
                fontSize: '32px',
                fontWeight: '700',
                fontFamily: 'Poppins, sans-serif',
                boxShadow: '0 8px 25px rgba(255, 182, 193, 0.3), 0 0 0 3px rgba(255, 255, 255, 0.8)',
                border: '2px solid rgba(166, 124, 82, 0.2)',
                position: 'relative',
                zIndex: 1
              }}>
                {currentProfile?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="m-0 mb-2 font-heading font-black text-card-foreground name" style={{
                fontSize: '28px',
                marginBottom: '8px',
                color: '#2E2E2E',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '700',
                letterSpacing: '-0.025em'
              }}>
                {currentProfile?.name || 'Unknown'}
                {(() => {
                  const age = calculateAge(currentProfile?.date_of_birth, currentProfile?.age);
                  // Show age if it's available, or show "Age not available" if it's 0
                  return (
                    <span style={{ 
                      color: '#A67C52', 
                      fontWeight: '500', 
                      fontSize: '20px',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      {age > 0 ? `, ${age}` : ', Age not available'}
                    </span>
                  );
                })()}
              </h2>
              <div className="flex items-center text-muted-foreground font-sans details" style={{
                gap: '8px',
                fontSize: '14px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(135, 206, 235, 0.3)',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  color: '#2E2E2E',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '500',
                  fontSize: '13px',
                  border: '1px solid rgba(135, 206, 235, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 8px rgba(135, 206, 235, 0.15)'
                }}>
                  <span>{currentProfile?.gender || 'Unknown'}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 182, 193, 0.3)',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  color: '#2E2E2E',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '500',
                  fontSize: '13px',
                  border: '1px solid rgba(255, 182, 193, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 8px rgba(255, 182, 193, 0.15)'
                }}>
                  <span>{currentProfile?.relationship_status || 'Unknown'}</span>
                </div>
                
                {currentProfile?.location && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(188, 227, 196, 0.3)',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    color: '#2E2E2E',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '500',
                    fontSize: '13px',
                    border: '1px solid rgba(188, 227, 196, 0.2)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 2px 8px rgba(188, 227, 196, 0.15)'
                  }}>
                    <span>{currentProfile?.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gradient Divider */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(166, 124, 82, 0.15) 50%, transparent 100%)',
            margin: '28px 0',
            position: 'relative',
            zIndex: 1
          }} />

          {/* Bio Section */}
          <div className="mb-8 flex-1" style={{
            marginBottom: '24px',
            position: 'relative',
            zIndex: 1
          }}>
            <h3 className="m-0 mb-4 font-heading font-bold text-card-foreground section-title" style={{
              fontSize: '16px',
              marginBottom: '12px',
              color: '#A67C52',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.02em'
            }}>
              About {currentProfile?.name || 'Unknown'}
            </h3>
            <div className="leading-relaxed text-card-foreground font-sans bio-text" style={{
              fontSize: '15px',
              lineHeight: '1.8',
              fontFamily: 'Inter, sans-serif',
              color: '#2E2E2E',
              fontWeight: '400'
            }}>
              {currentProfile?.bio || 'No bio available'}
            </div>
          </div>

          {/* Gradient Divider */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(166, 124, 82, 0.15) 50%, transparent 100%)',
            margin: '28px 0',
            position: 'relative',
            zIndex: 1
          }} />

          {/* Partner Expectations Section */}
          <div className="mb-8 flex-1" style={{
            marginBottom: '24px',
            position: 'relative',
            zIndex: 1
          }}>
            <h3 className="m-0 mb-4 font-heading font-bold text-card-foreground section-title" style={{
              fontSize: '16px',
              marginBottom: '12px',
              color: '#A67C52',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.02em'
            }}>
              Partner Expectations
            </h3>
            <div className="leading-relaxed text-card-foreground font-sans expectations-text" style={{
              fontSize: '15px',
              lineHeight: '1.8',
              fontFamily: 'Inter, sans-serif',
              color: '#2E2E2E',
              fontWeight: '400'
            }}>
              {currentProfile?.partner_expectations || 'No partner expectations available'}
            </div>
          </div>

          {/* Gradient Divider */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(166, 124, 82, 0.15) 50%, transparent 100%)',
            margin: '28px 0',
            position: 'relative',
            zIndex: 1
          }} />

          {/* Interests Section */}
          <div className="flex-1" style={{
            position: 'relative',
            zIndex: 1
          }}>
            <h3 className="m-0 mb-4 font-heading font-bold text-card-foreground section-title" style={{
              fontSize: '16px',
              marginBottom: '20px',
              color: '#A67C52',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.02em'
            }}>
              Interests
            </h3>
            <div style={{
              position: 'relative',
              height: '300px',
              overflow: 'hidden'
            }}>
              {/* Interest Bubble 1 */}
              <div style={{
                position: 'absolute',
                top: '40px',
                left: '24px',
                width: '75px',
                height: '75px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '11px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
                textAlign: 'center',
                padding: '6px',
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                animation: 'float 4s ease-in-out infinite',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}>
                {currentProfile?.interest_1 || 'Reading'}
              </div>

              {/* Interest Bubble 2 */}
              <div style={{
                position: 'absolute',
                top: '30px',
                left: '140px',
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '10px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
                textAlign: 'center',
                padding: '6px',
                boxShadow: '0 8px 25px rgba(236, 72, 153, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                animation: 'float 8s ease-in-out infinite 1s',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}>
                {currentProfile?.interest_2 || 'Travel'}
              </div>

              {/* Interest Bubble 3 */}
              <div style={{
                position: 'absolute',
                top: '50px',
                left: '230px',
                width: '75px',
                height: '75px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '11px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
                textAlign: 'center',
                padding: '6px',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                animation: 'float 7s ease-in-out infinite 2s',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}>
                {currentProfile?.interest_3 || 'Music'}
              </div>

              {/* Interest Bubble 4 */}
              <div style={{
                position: 'absolute',
                top: '130px',
                left: '80px',
                width: '65px',
                height: '65px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '10px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
                textAlign: 'center',
                padding: '5px',
                boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                animation: 'float 9s ease-in-out infinite 0.5s',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}>
                {currentProfile?.interest_4 || 'Cooking'}
              </div>

              {/* Interest Bubble 5 */}
              <div style={{
                position: 'absolute',
                top: '120px',
                left: '160px',
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '10px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
                textAlign: 'center',
                padding: '6px',
                boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                animation: 'float 6.5s ease-in-out infinite 1.5s',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}>
                {currentProfile?.interest_5 || 'Photography'}
              </div>

              {/* Interest Bubble 6 */}
              <div style={{
                position: 'absolute',
                top: '140px',
                left: '250px',
                width: '65px',
                height: '65px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '10px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
                textAlign: 'center',
                padding: '5px',
                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                animation: 'float 7.5s ease-in-out infinite 0.8s',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}>
                {currentProfile?.interest_6 || 'Gaming'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="responsive-actions" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginTop: '32px',
          marginBottom: '100px', // Space for footer navigation
          padding: '0 20px'
        }}>
          <button
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: '2px solid #8B4513',
              background: 'transparent',
              color: '#8B4513',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: isAnimating ? 0.5 : 1,
              position: 'relative',
              overflow: 'hidden',
              transform: skipButtonRipple ? 'scale(1.1)' : 'scale(1)',
              boxShadow: skipButtonRipple ? '0 8px 25px rgba(139, 69, 19, 0.4)' : 'none'
            }}
            onClick={handleSkip}
            disabled={isAnimating}
            onMouseEnter={(e) => {
              if (!isAnimating) {
                e.currentTarget.style.background = '#8B4513'
                e.currentTarget.style.color = 'white'
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 69, 19, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isAnimating) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#8B4513'
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
          >
            {/* Ripple effect overlay */}
            {skipButtonRipple && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '0',
                  height: '0',
                  borderRadius: '50%',
                  background: 'rgba(139, 69, 19, 0.3)',
                  transform: 'translate(-50%, -50%)',
                  animation: 'ripple 0.6s ease-out',
                  pointerEvents: 'none'
                }}
              />
            )}
            <svg 
              width="24" 
              height="24" 
              fill="currentColor" 
              viewBox="0 0 24 24"
              style={{
                transform: skipButtonRipple ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
          
          <button
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'white',
              color: '#107980',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              opacity: isAnimating ? 0.5 : 1,
              border: '2px solid #107980'
            }}
            onClick={handleMatch}
            disabled={isAnimating}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#107980'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.color = '#107980'
            }}
          >
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
        </div>
      </div>
      ) : (
        <div className="text-center py-10">
          <div className="text-5xl mb-4">💔</div>
          <h3 className="m-0 mb-2 text-card-foreground font-heading text-xl font-bold">
            No profile available
          </h3>
          <p className="text-muted-foreground m-0">
            Please try adjusting your filter settings
          </p>
        </div>
      )}

      {/* Message Prompt Modal */}
      {showMessagePrompt && (
        <AnimatedMessagePopup 
          isVisible={showMessagePrompt} 
          onClose={handleCancelMessage} 
          onSend={handleSendMessage} 
          profileName={currentProfile?.name || 'Unknown'} 
          message={message} 
          setMessage={setMessage} 
        />
      )}
        </>
      )}
    </div>
  )
}

// Interest Dropdown Component
function InterestDropdown({ title }: { title: string }) {
  return (
    <div style={{
      background: '#FDD8D6', 
      borderRadius: '8px', 
      border: '1px solid #8B4513',
      padding: '12px',
      color: '#8B4513',
      fontWeight: 600,
      fontSize: '16px',
      textAlign: 'center'
    }}>
      {title}
    </div>
  )
}

// Profile Section Component
function ProfileSection({ me, onSaved }: { me: any; onSaved: () => void }) {
  return (
    <div>
      <div style={{maxWidth: 800, margin: '0 auto'}}>
        <ProfileDisplay me={me} />
      </div>
    </div>
  )
}

// Matches Section Component
function MatchesSection({ matches, onRefresh, onChatClick, onViewProfile }: {
  matches: MatchItem[];
  onRefresh: () => void;
  onChatClick: (userId: string) => void;
  onViewProfile: (matchItem: MatchItem) => void;
}) {
  return (
    <div style={{ background: '#F7F3EC', minHeight: '100vh', padding: '16px' }}>
      {/* Optional subtitle */}
      <div style={{
        fontSize: '12px',
        color: '#5B6068',
        marginBottom: '16px',
        fontWeight: 500,
        letterSpacing: '0.5px'
      }}>
        People you matched with
      </div>

      {matches.length === 0 ? (
        <div className="responsive-empty" style={{
          textAlign: 'center', 
          padding: '40px 20px',
          background: '#FAF7F3',
          borderRadius: '20px',
          border: '1px solid #E6DFD4',
          margin: '20px 0',
          boxShadow: '0 6px 18px rgba(17,24,39,0.06)'
        }}>
          <svg width="48" height="48" fill="#0F766E" viewBox="0 0 24 24" style={{marginBottom: 16}}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <h3 style={{
            margin: '0 0 8px 0', 
            color: '#1F2937', 
            fontSize: '18px', 
            fontWeight: 600
          }}>No matches yet</h3>
          <p style={{
            color: '#475569', 
            margin: 0, 
            fontSize: '14px', 
            lineHeight: 1.5
          }}>Start sending requests to find your perfect match!</p>
        </div>
      ) : (
        <div className="matches-grid" style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {matches.map(m => (
            <div key={m.id} className="match-item" style={{
              padding: '20px',
              background: '#FAF7F3',
              borderRadius: '20px',
              border: '1px solid #E6DFD4',
              boxShadow: '0 6px 18px rgba(17,24,39,0.06)',
              transition: 'all 0.18s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F8F4F0'
              e.currentTarget.style.boxShadow = '0 10px 24px rgba(17,24,39,0.12)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FAF7F3'
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(17,24,39,0.06)'
              e.currentTarget.style.transform = 'translateY(0px)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid #D6EFEA'
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none'
            }}
            tabIndex={0}>
              {/* Micro gradient hairline */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(to right, #E6D9C7, transparent)'
              }} />
              
              {/* Row 1: Avatar and Name/Meta */}
              <div style={{
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '16px',
                marginBottom: '12px'
              }}>
                <div className="match-avatar" style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F1E6D8, white)',
                  border: '1px solid #EDE6DC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1F2937',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  flexShrink: 0,
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}>
                  {m.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) || '?'}
                </div>
                <div style={{flex: 1, minWidth: 0}}>
                  <h4 className="match-name" style={{
                    margin: '0 0 4px 0', 
                    fontSize: '18px', 
                    fontWeight: 600, 
                    color: '#1F2937',
                    lineHeight: 1.4
                  }}>
                    {m.name || 'Match'}
                  </h4>
                  <div className="match-details" style={{
                    fontSize: '14px', 
                    color: '#475569',
                    lineHeight: 1.5
                  }}>
                    {m.location && (
                      <span style={{ marginRight: '8px' }}>
                        {m.location}
                      </span>
                    )}
                    {m.instagram_handle && (
                      <span style={{ color: '#5B6068' }}>
                        · @{m.instagram_handle}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{
                height: '1px',
                background: '#EDE6DC',
                margin: '12px 0'
              }} />

              {/* Row 2: Badges and Action Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    padding: '6px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#5B6068',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    lineHeight: 1.2
                  }}>
                    Verified
                  </span>
                </div>
                <button 
                  className="view-profile-btn"
                  style={{
                    background: '#FAF7F3',
                    color: '#0F766E',
                    border: '1.5px solid #0F766E',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                  onClick={() => {
                    onViewProfile(m)
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#E6F2F1'
                    e.currentTarget.style.borderColor = '#0B5C56'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FAF7F3'
                    e.currentTarget.style.borderColor = '#0F766E'
                  }}
                >
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style={{flexShrink: 0}}>
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span style={{whiteSpace: 'nowrap'}}>View Profile</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Requests Section Component
function RequestsSection({ incoming, onAccepted, userId, onViewProfile }: {
  incoming: any[];
  onAccepted: (id: string) => void;
  userId: string;
  onViewProfile: (requestItem: any) => void;
}) {
  return (
    <div>
          {incoming.length === 0 ? (
        <div className="responsive-empty" style={{
          textAlign: 'center', 
          padding: '40px 20px',
          background: '#F5F1E8',
          borderRadius: '16px',
          border: '1px solid #107980',
          margin: '20px 0'
        }}>
          <svg width="48" height="48" fill="#107980" viewBox="0 0 24 24" style={{marginBottom: 16}}>
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          <h3 style={{margin: '0 0 8px 0', color: '#000000', fontSize: '18px', fontWeight: 600}}>No pending requests</h3>
          <p style={{color: '#000000', margin: 0, fontSize: '14px', opacity: 0.8}}>When someone sends you a request, it will appear here.</p>
        </div>
          ) : (
        <div className="responsive-matches" style={{display: 'grid', gap: 12}}>
          {incoming.map(r => (
              <RequestRow key={r.id} item={r} me={userId} onAccepted={() => onAccepted(r.id)} onViewProfile={() => onViewProfile(r)} />
          ))}
        </div>
      )}
    </div>
  )
}

// Packs Section Component
function PacksSection({ userId }: { userId: string }) {
  const [currentPack, setCurrentPack] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrData, setQrData] = useState<any>(null)
  const [qrLoading, setQrLoading] = useState(false)

  const packs = [
    {
      id: 'starter',
      name: 'Starter',
      price: 400,
      matches: 5,
      requests: 50,
      color: '#10b981',
      popular: false,
      description: 'Perfect for beginners'
    },
    {
      id: 'intermediate',
      name: 'Intermediate', 
      price: 600,
      matches: 8,
      requests: 100,
      color: '#3b82f6',
      popular: true,
      description: 'Most popular choice'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 1000,
      matches: 15,
      requests: 'Unlimited',
      color: '#8b5cf6',
      popular: false,
      description: 'For serious daters'
    }
  ]

  useEffect(() => {
    fetchCurrentPack()
  }, [userId])

  const fetchCurrentPack = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/pack?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setCurrentPack(data)
      }
    } catch (error) {
      console.error('Error fetching current pack:', error)
    }
  }

  const handlePackPurchase = async (pack: any) => {
    setLoading(true)
    try {
      // Create order on server
      const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          packId: pack.id,
          amount: pack.price
        })
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        console.error('Order creation failed:', errorData)
        throw new Error(errorData.error || `Failed to create order (${orderResponse.status})`)
      }

      const { orderId, amount, currency, key } = await orderResponse.json()

      // Use Razorpay payment gateway - Try simple configuration first
      const options = {
        key: key, // Razorpay key from server
        amount: amount,
        currency: currency,
        name: 'VibeText',
        description: `${pack.name} Pack Purchase`,
        order_id: orderId,
        handler: async (response: any) => {
          // Verify payment on server
          const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              packId: pack.id,
              orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            })
          })

          if (verifyResponse.ok) {
            alert(`${pack.name} pack purchased successfully!`)
            fetchCurrentPack()
          } else {
            const errorData = await verifyResponse.json()
            alert(`Payment verification failed: ${errorData.error}`)
          }
        },
        prefill: {
          name: 'User',
          email: 'user@example.com'
        },
        theme: {
          color: pack.color
        }
      }

      if ((window as any).Razorpay) {
        console.log('Razorpay options:', JSON.stringify(options, null, 2))
        const rzp = new (window as any).Razorpay(options)
        rzp.on('payment.failed', function (response: any) {
          console.error('Payment failed:', response.error)
          alert(`Payment failed: ${response.error.description}`)
        })
        rzp.open()
      } else {
        throw new Error('Razorpay script not loaded')
      }
    } catch (error) {
      console.error('Error initiating payment:', error)
      alert('Failed to initiate payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle QR Code Payment with proper UPI VPA
  const handleQRPayment = async (pack: any) => {
    if (!userId) {
      alert('Please login first')
      return
    }

    setQrLoading(true)
    try {
      // Create QR payment with ₹1 test amount
      const testAmount = 1; // ₹1 for testing
      const upiVPA = "rishiagrawal117-3@okicici"; // Your UPI ID
      
      // Create UPI payment string
      const upiString = `upi://pay?pa=${upiVPA}&pn=Whispyr&am=${testAmount}&cu=INR&tn=${pack.name} Pack Test Payment`;
      
      // Generate QR code using external service
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;
      
      // Create a simple order ID for tracking
      const orderId = `qr_${Date.now()}_${userId.slice(-8)}`;
      
      setQrData({
        orderId,
        qrCodeUrl,
        amount: testAmount * 100, // Store in paisa for consistency
        packName: pack.name,
        packId: pack.id,
        upiString,
        upiVPA
      })
      setShowQRModal(true)

      console.log('QR Payment initiated:', { orderId, pack: pack.name, amount: testAmount, upiVPA });

      // Start automatic payment verification polling
      startPaymentVerification(orderId, pack, testAmount);

    } catch (error) {
      console.error('Error creating QR payment:', error)
      alert('Failed to create QR payment. Please try again.')
    } finally {
      setQrLoading(false)
    }
  }

  // Automatic payment verification polling
  const startPaymentVerification = (orderId: string, pack: any, amount: number) => {
    console.log('Starting payment verification polling for order:', orderId);
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/check-qr-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            userId,
            expectedAmount: amount,
            upiVPA: "rishiagrawal117-3@okicici"
          })
        });

        if (response.ok) {
          const { paymentDetected, transactionId } = await response.json();
          
          if (paymentDetected) {
            clearInterval(pollInterval);
            console.log('Payment detected! Transaction ID:', transactionId);
            
            // Automatically activate the pack
            await activatePackAutomatically(pack.id, pack.name, transactionId);
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 5000); // Check every 5 seconds

    // Stop polling after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      console.log('Payment verification polling stopped after 10 minutes');
    }, 600000);

    // Store interval ID so we can clear it if modal is closed
    (window as any).qrPollingInterval = pollInterval;
  }

  // Automatic pack activation when payment is detected
  const activatePackAutomatically = async (packId: string, packName: string, transactionId?: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/activate-pack-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          packId,
          amount: 100, // ₹1 in paisa
          transactionId: transactionId || 'auto_detected'
        })
      })

      if (response.ok) {
        setShowQRModal(false)
        alert(`🎉 Payment Successful!\n${packName} pack activated automatically!`)
        fetchCurrentPack()
      } else {
        const errorData = await response.json()
        alert(`Failed to activate pack: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error activating pack:', error)
      alert('Payment detected but failed to activate pack. Please contact support.')
    }
  }

  // Manual pack activation for QR payments (backup option)
  const activatePackManually = async (packId: string, packName: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/activate-pack-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          packId,
          amount: 100 // ₹1 in paisa
        })
      })

      if (response.ok) {
        setShowQRModal(false)
        alert(`${packName} pack activated successfully! 🎉`)
        fetchCurrentPack()
      } else {
        const errorData = await response.json()
        alert(`Failed to activate pack: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error activating pack:', error)
      alert('Failed to activate pack. Please try again.')
    }
  }

  return (
    <div>
      {currentPack && (
        <div style={{padding: '16px', marginBottom: 16, background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', borderRadius: '8px'}}>
          <h3 style={{margin: '0 0 6px 0', fontSize: 16, fontWeight: 600}}>Current Pack: {currentPack.pack_name}</h3>
          <div style={{display: 'flex', gap: 16, marginTop: 8}}>
            <div>
              <div style={{fontSize: 12, opacity: 0.9}}>Matches Remaining</div>
              <div style={{fontSize: 20, fontWeight: 700}}>{currentPack.matches_remaining || 0}</div>
            </div>
            <div>
              <div style={{fontSize: 12, opacity: 0.9}}>Requests Remaining</div>
              <div style={{fontSize: 20, fontWeight: 700}}>
                {currentPack.requests_remaining === -1 ? 'Unlimited' : (currentPack.requests_remaining || 0)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16}}>
        {packs.map(pack => (
          <div 
            key={pack.id}
            style={{
              padding: '16px',
              background: '#ffffff',
              borderRadius: '12px',
              border: pack.popular ? `2px solid ${pack.color}` : '1px solid #e9ecef',
              transform: pack.popular ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            {pack.popular && (
              <div style={{
                position: 'absolute',
                top: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                background: pack.color,
                color: 'white',
                padding: '4px 16px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600
              }}>
                MOST POPULAR
              </div>
            )}

            <div style={{textAlign: 'center', marginBottom: 16}}>
              <h3 style={{margin: '0 0 6px 0', fontSize: 20, fontWeight: 700, color: pack.color}}>
                {pack.name}
              </h3>
              <p style={{margin: '0 0 12px 0', color: '#6c757d', fontSize: '12px'}}>
                {pack.description}
              </p>
              <div style={{fontSize: 28, fontWeight: 700, color: '#212529', marginBottom: 6}}>
                ₹{pack.price}
              </div>
              <div style={{color: '#6c757d', fontSize: '12px'}}>one-time payment</div>
            </div>

            <div style={{marginBottom: 16}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8}}>
                <span style={{color: pack.color, fontSize: '14px'}}>✓</span>
                <span style={{color: '#212529', fontSize: '12px'}}>
                  <strong>{pack.matches}</strong> matches
                </span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8}}>
                <span style={{color: pack.color, fontSize: '14px'}}>✓</span>
                <span style={{color: '#212529', fontSize: '12px'}}>
                  <strong>{pack.requests}</strong> connection requests
                </span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8}}>
                <span style={{color: pack.color, fontSize: '14px'}}>✓</span>
                <span style={{color: '#212529', fontSize: '12px'}}>Premium support</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                <span style={{color: pack.color, fontSize: '14px'}}>✓</span>
                <span style={{color: '#212529', fontSize: '12px'}}>Advanced matching</span>
              </div>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
              <button
                style={{
                  ...btnPrimary,
                  width: '100%',
                  background: `linear-gradient(135deg, ${pack.color}, ${pack.color}dd)`,
                  opacity: loading ? 0.7 : 1,
                  fontSize: '14px',
                  fontWeight: 600,
                  padding: '10px 16px'
                }}
                onClick={() => handlePackPurchase(pack)}
                disabled={loading}
              >
                {loading ? 'Processing...' : `💳 Pay ₹${pack.price}`}
              </button>
              
              <button
                style={{
                  ...btnPrimary,
                  width: '100%',
                  background: 'linear-gradient(135deg, #00C853, #00A843)',
                  opacity: qrLoading ? 0.7 : 1,
                  fontSize: '14px',
                  fontWeight: 600,
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
                onClick={() => handleQRPayment(pack)}
                disabled={qrLoading}
              >
                {qrLoading ? '⏳ Creating QR...' : '📱 Pay ₹1 (Test QR)'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* QR Payment Modal */}
      {showQRModal && qrData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '450px',
            width: '90%',
            textAlign: 'center',
            position: 'relative'
          }}>
            <button
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: 'var(--muted)'
              }}
              onClick={() => {
                setShowQRModal(false)
                // Clear polling interval when modal is closed
                if ((window as any).qrPollingInterval) {
                  clearInterval((window as any).qrPollingInterval)
                  console.log('QR polling stopped - modal closed')
                }
              }}
            >
              ×
            </button>

            <h3 style={{margin: '0 0 16px 0', color: 'var(--text)'}}>
              📱 Scan QR to Pay ₹1
            </h3>
            
            <div style={{
              background: '#f8f9fa',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <div style={{fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '8px'}}>
                {qrData.packName} Pack (Test Mode)
              </div>
              <div style={{fontSize: '24px', fontWeight: 700, color: '#00C853'}}>
                ₹1 Only
              </div>
              <div style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>
                UPI: {qrData.upiVPA}
              </div>
            </div>

            {qrData.qrCodeUrl && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <img 
                  src={qrData.qrCodeUrl} 
                  alt="Payment QR Code"
                  style={{
                    width: '250px',
                    height: '250px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px'
                  }}
                />
              </div>
            )}

            <div style={{
              background: '#e8f5e8',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              color: '#2e7d2e'
            }}>
              <div style={{fontWeight: 600, marginBottom: '8px'}}>
                📱 How to pay:
              </div>
              <div style={{textAlign: 'left', lineHeight: '1.5'}}>
                1. Open GooglePay, PhonePe, or Paytm<br/>
                2. Tap "Scan QR" or "Pay"<br/>
                3. Scan this QR code<br/>
                4. Pay exactly ₹1<br/>
                5. Pack will activate automatically! ⚡
              </div>
            </div>

            <div style={{
              background: '#d1ecf1',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              color: '#0c5460'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                marginBottom: '8px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #17a2b8',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <strong>Auto-Verification Active</strong>
              </div>
              <div style={{textAlign: 'center', lineHeight: '1.4'}}>
                We're automatically checking for your ₹1 payment.<br/>
                The window will close and pack will activate once payment is detected.
              </div>
            </div>

            <div style={{
              background: '#fff3cd',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#856404',
              textAlign: 'center'
            }}>
              <strong>Backup Option:</strong> If auto-verification fails, use the button below after payment.
            </div>

            <button
              style={{
                ...btnPrimary,
                width: '100%',
                background: 'linear-gradient(135deg, #6c757d, #5a6268)',
                fontSize: '14px',
                fontWeight: 600,
                padding: '12px 20px',
                marginBottom: '8px'
              }}
              onClick={() => activatePackManually(qrData.packId, qrData.packName)}
            >
              🔄 Manual Activation (If needed)
            </button>

            <div style={{
              fontSize: '11px',
              color: 'var(--muted)',
              lineHeight: '1.4',
              textAlign: 'center'
            }}>
              Only use manual activation if auto-verification doesn't work within 2-3 minutes
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Chat Section Component
function ChatSection({ matches, userId, selectedChatUser, setSelectedChatUser }: {
  matches: MatchItem[];
  userId: string;
  selectedChatUser: string | null;
  setSelectedChatUser: (id: string | null) => void;
}) {
  // Find the selected match at the top of the function
  const selectedMatch = selectedChatUser ? matches.find(m => m.other_user_id === selectedChatUser) : null;
  
  // If no chat user is selected, show the chat list (WhatsApp-like home page)
  if (!selectedChatUser) {
    return (
      <div className="chat-section" style={{
        display: 'flex', 
        flexDirection: 'column',
        height: 'calc(100vh - 80px)', // Full viewport height minus header
        background: '#F7F3EC',
        position: 'fixed',
        top: '80px', // Start below the main header
        left: '0',
        right: '0',
        bottom: '0', // Extend to very bottom
        overflow: 'hidden'
      }}>
        {/* Chat Header */}
        <div className="chat-header" style={{
          background: '#FAF7F3',
          padding: '16px 20px',
          borderBottom: '1px solid #E6DFD4',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#0F766E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          </div>
          <div>
            <h3 style={{margin: 0, fontSize: 18, fontWeight: 600, color: '#1F2937'}}>Chats</h3>
            <p style={{margin: '2px 0 0 0', color: '#7C7C7C', fontSize: '13px'}}>
              {matches.length} {matches.length === 1 ? 'match' : 'matches'}
            </p>
          </div>
        </div>

        {/* Chat List */}
        <div className="chat-list" style={{flex: 1, overflow: 'auto'}}>
          {matches.length === 0 ? (
            <div className="responsive-empty chat-empty" style={{
              textAlign: 'center', 
              color: '#5B6068', 
              padding: '48px 24px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              background: '#FAF7F3',
              borderRadius: '14px',
              border: '1px solid #EDE6DC',
              margin: '20px',
              boxShadow: '0 2px 8px rgba(17, 24, 39, 0.05)'
            }}>
              <svg width="48" height="48" fill="#0F766E" viewBox="0 0 24 24" style={{marginBottom: 16}}>
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
              <div style={{fontSize: '18px', fontWeight: 600, color: '#1F2937', marginBottom: '8px'}}>No matches yet</div>
              <div style={{fontSize: '14px', color: '#5B6068'}}>Start matching to begin chatting!</div>
            </div>
          ) : (
            <div className="responsive-matches" style={{padding: '16px'}}>
              {matches.map(match => (
                <div 
                  key={match.id}
                  className="match-item chat-item"
                  onClick={() => setSelectedChatUser(match.other_user_id)}
                  style={{
                    background: '#FAF7F3',
                    padding: '16px',
                    marginBottom: '8px',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid #EDE6DC',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    boxShadow: 'none',
                    minHeight: '72px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FAF7F3'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(17, 24, 39, 0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FAF7F3'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Left: Avatar */}
                  <div className="match-avatar chat-avatar" style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: '#0F766E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {match.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  
                  {/* Middle: Name and Meta */}
                  <div style={{flex: 1, minWidth: 0}}>
                    <h4 className="match-name chat-name" style={{
                      margin: '0 0 3px 0',
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#1F2937',
                      lineHeight: 1.2
                    }}>
                      {match.name || 'Your Match'}
                    </h4>
                    <div className="match-details chat-details" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '13px',
                      color: '#5B6068',
                      flexWrap: 'wrap'
                    }}>
                      {match.location && (
                        <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                          <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          {match.location}
                        </span>
                      )}
                      {match.location && match.instagram_handle && (
                        <span style={{color: '#5B6068', opacity: 0.6}}>•</span>
                      )}
                      {match.instagram_handle && (
                        <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                          <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          @{match.instagram_handle}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Right: Chat Button */}
                  <button
                    className="view-profile-btn chat-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedChatUser(match.other_user_id)
                    }}
                    style={{
                      background: 'transparent',
                      color: '#0F766E',
                      border: '1.5px solid #0F766E',
                      borderRadius: '10px',
                      padding: '8px 14px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                      minHeight: '36px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#E6F2F1'
                      e.currentTarget.style.borderColor = '#0F766E'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderColor = '#0F766E'
                    }}
                  >
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                    Chat
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // If a chat user is selected, show the individual chat interface
  return (
      <div style={{
        display: 'flex', 
        flexDirection: 'column',
        height: 'calc(100vh - 80px)', // Full viewport height minus header
        background: '#f0f2f5',
        position: 'fixed',
        top: '80px', // Start below the main header
        left: '0',
        right: '0',
        bottom: '0', // Extend to very bottom
        overflow: 'hidden'
      }}>
      {/* Chat Header */}
      <div style={{
        background: 'white',
        padding: '12px 16px',
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <button 
          onClick={() => setSelectedChatUser(null)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#6c757d',
            padding: '6px'
          }}
        >
          ◀ Back
        </button>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {selectedMatch?.bio.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <h3 style={{margin: 0, fontSize: 16, fontWeight: 600, color: '#212529'}}>Chat with your match</h3>
          {selectedMatch?.instagram_handle && (
            <p style={{margin: '2px 0 0 0', color: '#6c757d', fontSize: '12px'}}>
              📸 @{selectedMatch.instagram_handle}
            </p>
          )}
        </div>
      </div>

      {/* Chat Messages and Input Container */}
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
        <ChatPanel me={userId} other={selectedChatUser} />
      </div>
    </div>
  )
}

function RequestRow({item,me,onAccepted,onViewProfile}:{item:{id:string;from_user_id:string;message:string;bio:string;name?:string;created_at:string;location?:string;custom_location?:string};me:string;onAccepted:()=>void;onViewProfile:()=>void}){
  const [isAccepting, setIsAccepting] = useState(false)
  
  async function accept(){
    if (isAccepting) return
    setIsAccepting(true)
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/requests/${item.id}/accept`,{method:'POST'})
      onAccepted()
      alert('Accepted — a match has been created! You can now chat with this person.')
    } catch (error) {
      alert('Failed to accept request. Please try again.')
    } finally {
      setIsAccepting(false)
    }
  }
  
  return (
    <div className="match-item" style={{
      padding: '16px', 
      background: '#F5F1E8',
      borderBottom: '1px solid #107980', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }}
    onClick={(e) => {
      // Only trigger profile view if the click is not on the Accept button
      const target = e.target as HTMLElement
      if (!target.closest('button')) {
        onViewProfile()
      }
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = '#EDE8D0'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = '#F5F1E8'
    }}>
      <div style={{flex: 1}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8}}>
          <div className="match-avatar" style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#107980',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(16, 121, 128, 0.2)'
          }}>
            {item.name?.charAt(0).toUpperCase() || item.from_user_id.charAt(0).toUpperCase()}
          </div>
        <div>
            <div className="match-name" style={{fontWeight: 600, color: '#000000', fontSize: '16px', marginBottom: '4px'}}>
              {item.name || `User ${item.from_user_id.slice(0,8)}…`}
        </div>
            <div style={{color: '#000000', fontSize: '12px', opacity: 0.7}}>
              {new Date(item.created_at).toLocaleDateString()}
      </div>
          </div>
        </div>
        <div style={{color: '#000000', lineHeight: 1.4, marginBottom: 8, fontSize: '13px', opacity: 0.8}}>
          "{item.message || 'No message'}"
        </div>
        {item.bio && (
          <div style={{color: '#000000', fontSize: '12px', lineHeight: 1.4, marginBottom: '6px'}}>
            {item.bio.length > 80 ? item.bio.substring(0, 80) + '...' : item.bio}
          </div>
        )}
        {item.location && (
          <div className="match-tag" style={{
            color: '#000000', 
            fontSize: '11px', 
            marginTop: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: '#EDE8D0',
            padding: '2px 6px',
            borderRadius: '6px'
          }}>
            <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {item.location}
          </div>
        )}
      </div>
      <button 
        className="view-profile-btn"
        style={{
          background: '#107980',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          minWidth: '80px',
          padding: '8px 12px',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          opacity: isAccepting ? 0.7 : 1
        }} 
        onClick={accept}
        disabled={isAccepting}
        onMouseEnter={(e) => {
          if (!isAccepting) e.currentTarget.style.background = '#0d6b71'
        }}
        onMouseLeave={(e) => {
          if (!isAccepting) e.currentTarget.style.background = '#107980'
        }}
      >
        {isAccepting ? 'Accepting...' : 'Accept'}
      </button>
    </div>
  )
}

function ProfileDisplay({ me }: { me: any }) {
  if (!me) {
    return (
      <div className="responsive-empty" style={{
        textAlign: 'center', 
        padding: '40px 20px',
        background: '#F5F1E8',
        borderRadius: '16px',
        border: '1px solid #107980',
        margin: '20px 0'
      }}>
        <svg width="48" height="48" fill="#107980" viewBox="0 0 24 24" style={{marginBottom: 16}}>
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        <h3 style={{margin: '0 0 8px 0', color: '#000000', fontSize: '18px', fontWeight: 600}}>Loading profile...</h3>
      </div>
    )
  }
  
  return (
    <div className="responsive-dating-card" style={{
      padding: '32px',
      background: 'linear-gradient(135deg, #FAF7F3 0%, #FFFFFF 100%)',
      borderRadius: '32px',
      border: '1px solid rgba(166, 124, 82, 0.15)',
      boxShadow: '0 25px 50px -12px rgba(166, 124, 82, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(255, 182, 193, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0,
        filter: 'blur(20px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30px',
        left: '-30px',
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(255, 218, 185, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0,
        filter: 'blur(15px)'
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(166, 124, 82, 0.03) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0,
        filter: 'blur(25px)'
      }} />
      {/* Profile Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '32px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ position: 'relative' }}>
          {/* Blurred background shape */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(255, 182, 193, 0.2) 0%, rgba(255, 218, 185, 0.1) 100%)',
            borderRadius: '50%',
            filter: 'blur(15px)',
            zIndex: 0
          }} />
          <div className="avatar" style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFB6C1 0%, #FFDAB9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#A67C52',
            fontSize: '32px',
            fontWeight: '700',
            fontFamily: 'Poppins, sans-serif',
            boxShadow: '0 8px 25px rgba(255, 182, 193, 0.3), 0 0 0 3px rgba(255, 255, 255, 0.8)',
            border: '2px solid rgba(166, 124, 82, 0.2)',
            position: 'relative',
            zIndex: 1
          }}>
            {me.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
        <div>
          <h2 className="name" style={{
            margin: '0 0 8px 0', 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#2E2E2E',
            fontFamily: 'Poppins, sans-serif',
            letterSpacing: '-0.025em'
          }}>
            {me.name || 'User'}
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(135, 206, 235, 0.3)',
              padding: '8px 12px',
              borderRadius: '20px',
              color: '#2E2E2E',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500',
              fontSize: '13px',
              border: '1px solid rgba(135, 206, 235, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 2px 8px rgba(135, 206, 235, 0.15)'
            }}>
              {me.gender || 'Not specified'}
            </span>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 182, 193, 0.3)',
              padding: '8px 12px',
              borderRadius: '20px',
              color: '#2E2E2E',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500',
              fontSize: '13px',
              border: '1px solid rgba(255, 182, 193, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 2px 8px rgba(255, 182, 193, 0.15)'
            }}>
              {me.relationship_status || 'Not specified'}
            </span>
            {me.location && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(188, 227, 196, 0.3)',
                padding: '8px 12px',
                borderRadius: '20px',
                color: '#2E2E2E',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500',
                fontSize: '13px',
                border: '1px solid rgba(188, 227, 196, 0.2)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 8px rgba(188, 227, 196, 0.15)'
              }}>
                {me.location}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Gradient Divider */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(30, 41, 59, 0.1) 50%, transparent 100%)',
        margin: '24px 0',
        position: 'relative',
        zIndex: 1
      }} />

      {/* Bio Section */}
      <div style={{
        marginBottom: '32px',
        position: 'relative',
        zIndex: 1
      }}>
        <h3 className="section-title" style={{
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#A67C52',
          fontFamily: 'Poppins, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.02em'
        }}>
          About Me
        </h3>
        <div className="bio-text" style={{
          padding: '20px',
          lineHeight: '1.8',
          color: '#2E2E2E',
          fontSize: '15px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: '400',
          background: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '16px',
          border: '1px solid rgba(166, 124, 82, 0.1)',
          boxShadow: '0 4px 6px rgba(166, 124, 82, 0.05)'
        }}>
          {me.bio || 'No bio available'}
        </div>
      </div>

      {/* Gradient Divider */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(30, 41, 59, 0.1) 50%, transparent 100%)',
        margin: '24px 0',
        position: 'relative',
        zIndex: 1
      }} />

      {/* Partner Expectations Section */}
      <div style={{
        marginBottom: '32px',
        position: 'relative',
        zIndex: 1
      }}>
        <h3 className="section-title" style={{
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#A67C52',
          fontFamily: 'Poppins, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.02em'
        }}>
          Partner Expectations
        </h3>
        <div className="partner-expectations-text" style={{
          padding: '20px',
          lineHeight: '1.8',
          color: '#2E2E2E',
          fontSize: '15px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: '400',
          background: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '16px',
          border: '1px solid rgba(166, 124, 82, 0.1)',
          boxShadow: '0 4px 6px rgba(166, 124, 82, 0.05)'
        }}>
          {me.partner_expectations || 'No partner expectations specified'}
        </div>
      </div>

      {/* Gradient Divider */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(30, 41, 59, 0.1) 50%, transparent 100%)',
        margin: '24px 0',
        position: 'relative',
        zIndex: 1
      }} />

      {/* Interests Section */}
      <div style={{
        position: 'relative',
        zIndex: 1
      }}>
        <h3 className="section-title" style={{
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#A67C52',
          fontFamily: 'Poppins, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.02em'
        }}>
          My Interests
        </h3>
        <div style={{display: 'grid', gap: '16px'}}>
          {/* Interests Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginTop: '16px'
          }}>
            {me.interest_1 && (
              <div className="interest-item" style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '16px',
                border: '1px solid rgba(30, 41, 59, 0.1)',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
              }}>
                <span className="interest-tag" style={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)'
                }}>
                  {me.interest_1}
                </span>
              </div>
            )}

            {me.interest_2 && (
              <div className="interest-item" style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '16px',
                border: '1px solid rgba(30, 41, 59, 0.1)',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
              }}>
                <span className="interest-tag" style={{
                  background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 2px 4px rgba(236, 72, 153, 0.2)'
                }}>
                  {me.interest_2}
                </span>
              </div>
            )}

            {me.interest_3 && (
              <div className="interest-item" style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '16px',
                border: '1px solid rgba(30, 41, 59, 0.1)',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
              }}>
                <span className="interest-tag" style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                }}>
                  {me.interest_3}
                </span>
              </div>
            )}

            {me.interest_4 && (
              <div className="interest-item" style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '16px',
                border: '1px solid rgba(30, 41, 59, 0.1)',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
              }}>
                <span className="interest-tag" style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)'
                }}>
                  {me.interest_4}
                </span>
              </div>
            )}

            {me.interest_5 && (
              <div className="interest-item" style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '16px',
                border: '1px solid rgba(30, 41, 59, 0.1)',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
              }}>
                <span className="interest-tag" style={{
                  background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
                }}>
                  {me.interest_5}
                </span>
              </div>
            )}

            {me.interest_6 && (
              <div className="interest-item" style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '16px',
                border: '1px solid rgba(30, 41, 59, 0.1)',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
              }}>
                <span className="interest-tag" style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)'
                }}>
                  {me.interest_6}
                </span>
              </div>
            )}
          </div>

          {/* No interests message */}
          {!me.interest_1 && !me.interest_2 && !me.interest_3 && !me.interest_4 && !me.interest_5 && !me.interest_6 && (
            <div className="responsive-empty" style={{
              padding: '32px 20px',
              textAlign: 'center',
              background: '#EDE8D0',
              borderRadius: '12px',
              border: '1px solid #107980',
              margin: '20px 0'
            }}>
              <svg width="48" height="48" fill="#107980" viewBox="0 0 24 24" style={{marginBottom: 16}}>
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              <p style={{margin: 0, fontSize: '16px', color: '#000000', fontWeight: 600}}>No interests added yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



type Msg = {
  id: string
  sender_id: string
  content: string
  created_at: string
  isOptimistic?: boolean
}

function ChatPanel({ me, other }: { me: string; other: string }) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  // Scroll refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Stickiness (auto-scroll only when user is at bottom)
  const [autoStick, setAutoStick] = useState(true)

  // Guard to avoid reacting to our own programmatic scrolls
  const programmaticScrollRef = useRef(false)

  // Touch start position (for swipe-down = scroll up)
  const touchStartYRef = useRef<number | null>(null)

  // Bottom detection — make it *tight* so tiny moves break stickiness
  const BOTTOM_EPS = 1

  const bottomDelta = () => {
    const el = messagesContainerRef.current
    if (!el) return 0
    return el.scrollHeight - el.clientHeight - el.scrollTop
  }

  const isAtBottomTight = () => bottomDelta() <= BOTTOM_EPS

  // Two flavors of scroll
  const scrollToBottom = (smooth = false) => {
    const el = messagesContainerRef.current
    if (!el) return
    programmaticScrollRef.current = true
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
    requestAnimationFrame(() => {
      programmaticScrollRef.current = false
    })
  }

  // ===== Scroll event handlers =====
  const handleScroll: React.UIEventHandler<HTMLDivElement> = () => {
    if (programmaticScrollRef.current) return
    // Immediate update: at bottom => stick, else => unstick
    setAutoStick(isAtBottomTight())
  }

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    if (programmaticScrollRef.current) return
    // Any upward wheel breaks stickiness instantly
    if (e.deltaY < 0 && autoStick) setAutoStick(false)
  }

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = () => {
    // As soon as the user grabs the list, stop sticking
    if (autoStick && !isAtBottomTight()) setAutoStick(false)
  }

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    touchStartYRef.current = e.touches[0].clientY
    // Break right away if not exactly at bottom
    if (autoStick && !isAtBottomTight()) setAutoStick(false)
  }

  const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (programmaticScrollRef.current) return
    const start = touchStartYRef.current
    if (start == null) return
    const current = e.touches[0].clientY
    // Finger moves down => content scrolls up => viewing older messages
    if (current - start > 2 && autoStick) setAutoStick(false)
  }

  // ===== Effects =====

  // Auto-scroll on new messages:
  // - Always for my own outgoing messages (smooth)
  // - For received messages only if user was already at bottom (jump, no smooth)
  useLayoutEffect(() => {
    if (messages.length === 0) return
    if (autoStick) {
      // smooth is fine here; change to false if you prefer instant
      requestAnimationFrame(() => scrollToBottom(true))
    }
  }, [messages, autoStick])

  // Initial stick and scroll on mount
  useEffect(() => {
    requestAnimationFrame(() => {
      setAutoStick(true)
      scrollToBottom(false)
    })
  }, [])

  // WebSocket setup + history
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const convResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/chat/history?userA=${me}&userB=${other}`
        )
        if (convResponse.ok) {
          const convData: Msg[] = await convResponse.json()
          setMessages(convData || [])
          requestAnimationFrame(() => {
            setAutoStick(isAtBottomTight())
            scrollToBottom(false)
          })
        } else {
          setMessages([])
        }
      } catch (error) {
        console.error('Error loading chat history:', error)
        setMessages([])
      }
    }

    const socket = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true
    })
    socketRef.current = socket

    socket.on('new_message', (message: Msg) => {
      // Were we at bottom before appending?
      const wasAtBottom = isAtBottomTight()

      setMessages(prev => {
        const exists = prev.some(m =>
          m.id === message.id ||
          (m.content === message.content && m.sender_id === message.sender_id)
        )
        if (exists) {
          return prev.map(m =>
            m.isOptimistic &&
            m.content === message.content &&
            m.sender_id === message.sender_id
              ? message
              : m
          )
        }
        return [...prev, message]
      })

      // Ensure receiver sees the newest message if they were at bottom
      if (wasAtBottom) requestAnimationFrame(() => scrollToBottom(false))
    })

    socket.on('connect', () => console.log('✅ WebSocket connected for ChatPanel'))
    socket.on('disconnect', () => console.log('❌ WebSocket disconnected from ChatPanel'))
    socket.on('connect_error', (err) => console.log('❌ WebSocket connection failed:', err))

    loadChatHistory()

    return () => { socketRef.current?.disconnect(); }
  }, [me, other])

  // ===== Send message =====
  async function send() {
    if (!text.trim() || isSending) return
    const messageContent = text.trim()
    setText('')
    setIsSending(true)

    const optimisticMessage: Msg = {
      id: `temp-${Date.now()}-${Math.random()}`,
      sender_id: me,
      content: messageContent,
      created_at: new Date().toISOString(),
      isOptimistic: true
    }
    setMessages(prev => [...prev, optimisticMessage])

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/send`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ fromUserId: me, toUserId: other, content: messageContent })
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }
      await response.json()
      // Server emits real message over WS; no client emit to avoid dupes
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
      setMessages(prev => prev.filter(m => !m.isOptimistic))
      setText(messageContent)
    } finally {
      setIsSending(false)
    }
  }

  // ===== UI =====
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#f0f2f5'
    }}>
      {/* Messages Area - Scrollable */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none'  /* IE and Edge */
          // WebKit scrollbar hiding requires CSS ::-webkit-scrollbar rules
        }}
      >
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#6c757d',
            padding: '40px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>💬</div>
            <div style={{ fontSize: '16px', fontWeight: 500 }}>No messages yet</div>
            <div style={{ fontSize: '14px', marginTop: 4, opacity: 0.7 }}>Start the conversation!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map(m => (
              <div key={m.id} style={{
                display: 'flex',
                justifyContent: m.sender_id === me ? 'flex-end' : 'flex-start',
                marginBottom: '8px'
              }}>
                <div style={{
                  maxWidth: '70%',
                  background: m.sender_id === me ? 'linear-gradient(135deg, #ff6b6b, #ee5a52)' : '#ffffff',
                  color: m.sender_id === me ? 'white' : '#212529',
                  padding: '12px 16px',
                  borderRadius: m.sender_id === me ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  fontSize: '14px',
                  lineHeight: 1.4,
                  wordBreak: 'break-word'
                }}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Anchor kept for layout parity */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        background: '#ffffff',
        borderTop: '1px solid #e9ecef',
        padding: '12px 16px',
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end'
      }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            border: '1px solid #e9ecef',
            borderRadius: '20px',
            padding: '10px 16px',
            fontSize: '14px',
            outline: 'none',
            resize: 'none',
            minHeight: '40px',
            maxHeight: '120px',
            background: '#f8f9fa'
          }}
          onKeyDown={(e) =>
            e.key === 'Enter' && !e.shiftKey ? (e.preventDefault(), send()) : undefined
          }
          disabled={isSending}
        />
        <button
          onClick={send}
          style={{
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '16px',
            opacity: isSending || !text.trim() ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
          disabled={!text.trim() || isSending}
        >
          {isSending ? '⏳' : '💬'}
        </button>
      </div>
    </div>
  )
}

export default ChatPanel



function Modal({children,onClose}:{children:React.ReactNode;onClose:()=>void}){
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',display:'grid',placeItems:'center',padding:'16px',zIndex:1000}} onClick={onClose}>
      <div style={{
        background:'var(--card)',
        border:'1px solid #2f2f40',
        borderRadius:12,
        padding:16,
        width:'100%',
        maxWidth:520,
        maxHeight:'90vh',
        overflow:'auto',
        position:'relative'
      }} onClick={e=>e.stopPropagation()}>
        <div style={{
          display:'flex',
          justifyContent:'space-between',
          alignItems:'center',
          position:'sticky',
          top:0,
          background:'var(--card)',
          paddingBottom:'8px',
          zIndex:1
        }}>
          <div style={{fontWeight:800}}>Details</div>
          <button onClick={onClose} style={{
            ...btnGhost,
            minWidth:'60px',
            fontSize:'14px',
            padding:'8px 12px'
          }}>Close</button>
        </div>
        <div style={{marginTop:8}}>{children}</div>
      </div>
    </div>
  )
}

// Styles
const sidebarNavBtn: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--border)',
  color: 'var(--muted)',
  padding: '12px 16px',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '14px',
  transition: 'all 0.2s ease'
}

const activeSidebarNavBtn: React.CSSProperties = {
  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
  color: 'white',
  border: 'none',
  boxShadow: 'var(--shadow)'
}

const navBtn: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--border)',
  color: 'var(--muted)',
  padding: '12px 20px',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '14px'
}

const activeNavBtn: React.CSSProperties = {
  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
  color: 'white',
  border: 'none',
  boxShadow: 'var(--shadow)'
}

const card: React.CSSProperties = { 
  background:'var(--card)',
  border:'1px solid var(--border)',
  borderRadius:16,
  padding:20,
  boxShadow: 'var(--shadow)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
}

const btnPrimary: React.CSSProperties = { 
  background:'linear-gradient(135deg,var(--accent),var(--accent2))', 
  padding:'12px 20px', 
  borderRadius:12, 
  color:'white', 
  fontWeight:600,
  border: 'none',
  cursor: 'pointer',
  boxShadow: 'var(--shadow)'
}

const btnSecondary: React.CSSProperties = { 
  background:'var(--card)', 
  padding:'12px 20px', 
  borderRadius:12, 
  color:'var(--text)', 
  fontWeight:500,
  border: '1px solid var(--border)',
  cursor: 'pointer',
  boxShadow: 'var(--shadow)'
}

const btnGhost: React.CSSProperties = { 
  padding:'10px 16px', 
  borderRadius:10, 
  color:'var(--text)', 
  border:'1px solid var(--border)',
  background: 'transparent',
  cursor: 'pointer'
}

const input: React.CSSProperties = { 
  background:'var(--card)', 
  border:'1px solid var(--border)', 
  borderRadius:12, 
  padding:'12px 16px', 
  color:'var(--text)', 
  flex:1,
  fontSize: '14px',
  width: '100%'
}

// Animated Message Popup Component with Paper Folding Effect
function AnimatedMessagePopup({ 
  isVisible, 
  onClose, 
  onSend, 
  profileName, 
  message, 
  setMessage 
}: {
  isVisible: boolean;
  onClose: () => void;
  onSend: () => void;
  profileName: string;
  message: string;
  setMessage: (message: string) => void;
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [foldStage, setFoldStage] = useState(0); // 0: closed, 1: unfolding, 2: open, 3: folding

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      setFoldStage(1); // Start unfolding
      const timer = setTimeout(() => {
        setFoldStage(2); // Fully open
        setIsAnimating(false);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(true);
      setFoldStage(3); // Start folding
      const timer = setTimeout(() => {
        setFoldStage(0); // Fully closed
        setIsAnimating(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (foldStage === 0 && !isVisible) return null;

  const getTransformStyle = () => {
    switch (foldStage) {
      case 0: return { transform: 'scale(0) rotateX(90deg)', opacity: 0 };
      case 1: return { transform: 'scale(0.8) rotateX(45deg)', opacity: 0.8 };
      case 2: return { transform: 'scale(1) rotateX(0deg)', opacity: 1 };
      case 3: return { transform: 'scale(0.8) rotateX(-45deg)', opacity: 0.8 };
      default: return { transform: 'scale(1) rotateX(0deg)', opacity: 1 };
    }
  };

  const handleSend = () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }
    onSend();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(4px)',
        transition: 'all 0.3s ease'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isAnimating) {
          onClose();
        }
      }}
    >
      {/* Paper Container with Folding Animation */}
      <div
        style={{
          background: '#F5F1E8',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: '2px solid #8B4513',
          position: 'relative',
          transformOrigin: 'center center',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          ...getTransformStyle(),
          perspective: '1000px'
        }}
      >
        {/* Decorative Corner Folds */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '0',
          height: '0',
          borderStyle: 'solid',
          borderWidth: '0 20px 20px 0',
          borderColor: 'transparent #8B4513 transparent transparent',
          borderRadius: '0 0 20px 0'
        }} />
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          width: '0',
          height: '0',
          borderStyle: 'solid',
          borderWidth: '0 0 20px 20px',
          borderColor: 'transparent transparent #8B4513 transparent',
          borderRadius: '0 0 0 20px'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          width: '0',
          height: '0',
          borderStyle: 'solid',
          borderWidth: '20px 20px 0 0',
          borderColor: '#8B4513 transparent transparent transparent',
          borderRadius: '20px 0 0 0'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '0',
          right: '0',
          width: '0',
          height: '0',
          borderStyle: 'solid',
          borderWidth: '20px 0 0 20px',
          borderColor: 'transparent transparent transparent #8B4513',
          borderRadius: '0 20px 0 0'
        }} />

        {/* Header with Heart Icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            background: 'linear-gradient(135deg, #FF6B9D, #FF8EAB)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 2s infinite'
          }}>
            <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <h3 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '700',
            color: '#8B4513',
            textAlign: 'center'
          }}>
            Send a message to {profileName}
          </h3>
        </div>

        {/* Instructions */}
        <p style={{
          margin: '0 0 20px 0',
          fontSize: '14px',
          color: '#8B4513',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          Write a short message to introduce yourself (max 200 characters)
        </p>

        {/* Message Input */}
        <div style={{
          position: 'relative',
          marginBottom: '20px'
        }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi! I'd love to get to know you better..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '16px',
              border: '2px solid #107980',
              borderRadius: '12px',
              background: '#FFFFFF',
              color: '#8B4513',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box'
            }}
            maxLength={200}
            onFocus={(e) => {
              e.target.style.borderColor = '#0d6b71';
              e.target.style.boxShadow = '0 0 0 3px rgba(16, 121, 128, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#107980';
              e.target.style.boxShadow = 'none';
            }}
          />
          
          {/* Character Counter */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '12px',
            fontSize: '12px',
            color: message.length > 180 ? '#FF6B6B' : '#8B4513',
            background: 'rgba(245, 241, 232, 0.9)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: '500'
          }}>
            {message.length}/200
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            disabled={isAnimating}
            style={{
              flex: 1,
              padding: '14px 20px',
              background: '#F5F1E8',
              border: '2px solid #8B4513',
              borderRadius: '12px',
              color: '#8B4513',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isAnimating ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: isAnimating ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isAnimating) {
                e.currentTarget.style.background = '#8B4513';
                e.currentTarget.style.color = '#F5F1E8';
              }
            }}
            onMouseLeave={(e) => {
              if (!isAnimating) {
                e.currentTarget.style.background = '#F5F1E8';
                e.currentTarget.style.color = '#8B4513';
              }
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSend}
            disabled={!message.trim() || isAnimating}
            style={{
              flex: 1,
              padding: '14px 20px',
              background: message.trim() ? 'linear-gradient(135deg, #107980, #0d6b71)' : '#E0E0E0',
              border: '2px solid',
              borderColor: message.trim() ? '#107980' : '#E0E0E0',
              borderRadius: '12px',
              color: message.trim() ? '#FFFFFF' : '#999999',
              fontSize: '14px',
              fontWeight: '600',
              cursor: message.trim() && !isAnimating ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              opacity: isAnimating ? 0.6 : 1,
              transform: message.trim() ? 'scale(1)' : 'scale(0.98)'
            }}
            onMouseEnter={(e) => {
              if (message.trim() && !isAnimating) {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 121, 128, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (message.trim() && !isAnimating) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            Send Request
          </button>
        </div>

        {/* Decorative Paper Texture */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: `
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 1px, transparent 1px),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          pointerEvents: 'none',
          borderRadius: '18px'
        }} />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}



