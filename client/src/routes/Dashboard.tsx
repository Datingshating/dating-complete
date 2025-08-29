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
  interest_1:string; 
  interest_1_desc:string; 
  interest_2:string; 
  interest_2_desc:string; 
  interest_3:string; 
  interest_3_desc:string;
  is_visible?:boolean;
  profile_created_at?:string;
  profile_updated_at?:string;
}
type MatchItem = { id:string; other_user_id:string; name:string; bio:string; relationship_status:string; interest_1:string; interest_1_desc:string; interest_2:string; interest_2_desc:string; interest_3:string; interest_3_desc:string; instagram_handle?: string; location?:string; custom_location?:string }

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

  async function sendRequest(toUserId:string){
    const msg = prompt('Write a short message (max 200 chars)')||''
    if (!msg.trim()) return
    
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/requests',{
        method:'POST', 
        headers:{
          'Content-Type':'application/json',
          'Authorization': `Bearer ${token}`
        }, 
        body: JSON.stringify({fromUserId:userId,toUserId,message:msg})
      })
      
      if (response.ok) {
      alert('Request sent successfully!')
        // Immediately refresh data to show the sent request
        fetchData()
        
        // Server will emit WebSocket event automatically
        // No need to emit from client to prevent duplicates
        
        // Immediately refresh data to reduce latency
        setTimeout(() => {
          fetchData()
        }, 100) // Refresh after 100ms
      } else {
        alert('Failed to send request. Please try again.')
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
    <div style={{
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh', 
      background: '#f8f9fa',
      paddingBottom: '80px' // Space for bottom nav
    }}>
      {/* Top Header */}
      <header style={{
        background: '#FDD8D6',
        color: '#2D3748',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <h1 style={{margin: 0, fontSize: 28, fontWeight: 800}}>Whispyr</h1>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
        <div style={{textAlign: 'right'}}>
          <div style={{fontSize: '14px', opacity: 0.7}}>Welcome back</div>
          <div style={{fontSize: '16px', fontWeight: 600}}>{me?.name || 'User'}</div>
        </div>
          <button 
            onClick={handleLogout}
            style={{
              background: '#FDD8D6',
              border: '1px solid #E2E8F0',
              color: '#2D3748',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F7CAC9'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FDD8D6'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Logout
          </button>
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
                      interest_1_desc: matchItem.interest_1_desc,
                      interest_2: matchItem.interest_2,
                      interest_2_desc: matchItem.interest_2_desc,
                      interest_3: matchItem.interest_3,
                      interest_3_desc: matchItem.interest_3_desc
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
              <div style={{color:'var(--muted)',fontSize:14, marginTop: '4px'}}>{selected.interest_1_desc}</div>
            </div>
            <div>
              <div style={{color: 'var(--text)', fontWeight: 600}}>Interest 2: {selected.interest_2}</div>
              <div style={{color:'var(--muted)',fontSize:14, marginTop: '4px'}}>{selected.interest_2_desc}</div>
            </div>
            <div>
              <div style={{color: 'var(--text)', fontWeight: 600}}>Interest 3: {selected.interest_3}</div>
              <div style={{color:'var(--muted)',fontSize:14, marginTop: '4px'}}>{selected.interest_3_desc}</div>
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

          {/* Interests */}
          <div style={{display: 'grid', gap: '16px'}}>
            <div style={{color: '#8B4513', fontWeight: 600, fontSize: '16px', marginBottom: '8px'}}>Interests:</div>
            {selectedMatchProfile.interest_1 && (
              <InterestDropdown 
                title={selectedMatchProfile.interest_1}
                description={selectedMatchProfile.interest_1_desc}
              />
            )}
            {selectedMatchProfile.interest_2 && (
              <InterestDropdown 
                title={selectedMatchProfile.interest_2}
                description={selectedMatchProfile.interest_2_desc}
              />
            )}
            {selectedMatchProfile.interest_3 && (
              <InterestDropdown 
                title={selectedMatchProfile.interest_3}
                description={selectedMatchProfile.interest_3_desc}
              />
            )}
          </div>
        </Modal>
      )}

      {/* Bottom Navigation */}
      {!selectedChatUser && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#F9DED7',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '10px 12px',
          zIndex: 1000,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          maxWidth: '100%',
          margin: '0 auto'
        }}>
          <button
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '6px 8px',
              borderRadius: '12px',
              color: activeTab === 'dating' ? '#8B4513' : '#6B7280',
              fontSize: '10px',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveTab('dating')}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            Lover
          </button>

          <button
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '6px 8px',
              borderRadius: '12px',
              color: activeTab === 'matches' ? '#8B4513' : '#6B7280',
              fontSize: '10px',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            onClick={() => setActiveTab('matches')}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01 1l-1.7 2.26c-.19.25-.29.55-.29.85V16h-1.5v6h6zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1h1.5c.83 0 1.5-.67 1.5-1.5S11.33 5 10.5 5H9c-1.1 0-2 .9-2 2v6c0 .55.45 1 1 1h1.5v7h-3z"/>
            </svg>
            Matches
            {matches.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '2px',
                right: '6px',
                background: '#dc2626',
                color: 'white',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {matches.length}
              </div>
            )}
          </button>

          <button
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '6px 8px',
              borderRadius: '12px',
              color: activeTab === 'chat' ? '#8B4513' : '#6B7280',
              fontSize: '10px',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveTab('chat')}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
            Chat
          </button>

          <button
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '6px 8px',
              borderRadius: '12px',
              color: activeTab === 'requests' ? '#8B4513' : '#6B7280',
              fontSize: '10px',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            onClick={() => setActiveTab('requests')}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            Requests
            {incoming.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '2px',
                right: '6px',
                background: '#dc2626',
                color: 'white',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {incoming.length}
              </div>
            )}
          </button>

          <button
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '6px 8px',
              borderRadius: '12px',
              color: activeTab === 'packs' ? '#8B4513' : '#6B7280',
              fontSize: '10px',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveTab('packs')}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Packs
          </button>

          <button
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '6px 8px',
              borderRadius: '12px',
              color: activeTab === 'profile' ? '#8B4513' : '#6B7280',
              fontSize: '10px',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveTab('profile')}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            Profile
          </button>
        </nav>
      )}
    </div>
  )
}

// Dating Zone Component
function DatingZone({ feed, filters, setFilters, filtersVisible, setFiltersVisible, onSendRequest, onViewProfile }: {
  feed: Profile[];
  filters: any;
  setFilters: (filters: any) => void;
  filtersVisible: boolean;
  setFiltersVisible: (visible: boolean) => void;
  onSendRequest: (id: string) => void;
  onViewProfile: (profile: Profile) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showMessagePrompt, setShowMessagePrompt] = useState(false)
  const [message, setMessage] = useState('')

  const currentProfile = feed[currentIndex]

  const handleSkip = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % feed.length)
      setIsAnimating(false)
    }, 300)
  }

  const handleMatch = () => {
    if (isAnimating || !currentProfile) return
    setShowMessagePrompt(true)
  }

  const handleSendMessage = () => {
    if (!message.trim()) {
      alert('Please enter a message')
      return
    }
    
    // Send the request with the custom message
    onSendRequest(currentProfile.id)
    setMessage('')
    setShowMessagePrompt(false)
    handleSkip() // Move to next profile after sending request
  }

  const handleCancelMessage = () => {
    setMessage('')
    setShowMessagePrompt(false)
  }

  const getGenderIcon = (gender: string) => {
    switch (gender?.toLowerCase()) {
      case 'male': return '👨'
      case 'female': return '👩'
      case 'non-binary': return '🧑'
      default: return '👤'
    }
  }

  if (feed.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-4">💔</div>
        <h3 className="m-0 mb-2 text-card-foreground font-heading text-xl font-bold">No profiles available</h3>
        <p className="text-muted-foreground m-0">Check back later for new profiles!</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-muted-foreground text-xs">
            Profile {currentIndex + 1} of {feed.length}
          </span>
        </div>
        <button 
          className="bg-secondary text-secondary-foreground font-bold px-3 py-2 rounded-lg text-xs shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-1.5"
          onClick={() => setFiltersVisible(!filtersVisible)}
        >
          🔍 {filtersVisible ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {/* Collapsible Filters */}
      {filtersVisible && (
        <div className="bg-card rounded-2xl p-4 mb-4 shadow-lg">
          <h3 className="m-0 mb-3 font-heading text-lg font-bold text-card-foreground">🔍 Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block mb-1.5 font-bold text-card-foreground text-xs">Age Range</label>
              <div className="flex items-center gap-2">
                <input 
                  type="range" 
                  min="18" 
                  max="70" 
                  value={filters.ageRange[0]} 
                  onChange={(e) => setFilters({...filters, ageRange: [parseInt(e.target.value), filters.ageRange[1]]})}
                  className="flex-1"
                />
                <span className="min-w-12 text-card-foreground text-xs">{filters.ageRange[0]}-{filters.ageRange[1]}</span>
              </div>
              <input 
                type="range" 
                min="18" 
                max="70" 
                value={filters.ageRange[1]} 
                onChange={(e) => setFilters({...filters, ageRange: [filters.ageRange[0], parseInt(e.target.value)]})}
                className="w-full mt-2"
              />
            </div>
            
            <div>
              <label className="block mb-1.5 font-bold text-card-foreground text-xs">Gender</label>
              <select 
                value={filters.gender} 
                onChange={(e) => setFilters({...filters, gender: e.target.value})}
                className="w-full bg-background border-2 border-border rounded-lg px-3 py-2 text-card-foreground focus:border-primary focus:outline-none transition-all duration-300"
              >
                <option value="">All genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="trans">Trans</option>
              </select>
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-card-foreground text-xs">Relationship Status</label>
              <select 
                value={filters.relationshipStatus} 
                onChange={(e) => setFilters({...filters, relationshipStatus: e.target.value})}
                className="w-full bg-background border-2 border-border rounded-lg px-3 py-2 text-card-foreground focus:border-primary focus:outline-none transition-all duration-300"
              >
                <option value="">All statuses</option>
                <option value="single">Single</option>
                <option value="in a relationship">In a relationship</option>
                <option value="recent breakup">Recent breakup</option>
                <option value="its complicated">It's complicated</option>
                <option value="divorced">Divorced</option>
              </select>
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-card-foreground text-xs">Location</label>
              <input 
                type="text" 
                placeholder="Enter location..."
                value={filters.location} 
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="w-full bg-background border-2 border-border rounded-lg px-3 py-2 text-card-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-all duration-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* Single Profile Display */}
      <div className="max-w-md mx-auto relative">
        <div 
          className={`bg-card rounded-3xl p-8 shadow-2xl transition-all duration-300 cursor-pointer min-h-[600px] flex flex-col ${
            isAnimating ? 'scale-95' : 'scale-100'
          }`}
          onClick={() => onViewProfile(currentProfile)}
        >
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-8">
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#F7CAC9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'black',
              fontSize: '32px',
              fontWeight: '900',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              {currentProfile.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="m-0 mb-2 font-heading text-2xl font-black text-card-foreground">
                {currentProfile.name}
              </h2>
              <div className="flex items-center gap-4 text-muted-foreground text-sm font-sans">
                <span>{currentProfile.gender}</span>
                <span>{currentProfile.relationship_status}</span>
                {currentProfile.location && (
                  <span>{currentProfile.location}</span>
                )}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mb-8 flex-1">
            <h3 className="m-0 mb-4 font-heading text-lg font-bold text-card-foreground">
              About {currentProfile.name}
            </h3>
            <div className="leading-relaxed text-card-foreground text-base font-sans">
              {currentProfile.bio || 'No bio available'}
            </div>
          </div>

          {/* Interests Section */}
          <div className="flex-1">
            <h3 className="m-0 mb-4 font-heading text-lg font-bold text-card-foreground">
              Interests
            </h3>
            <div className="space-y-4">
              {currentProfile.interest_1 && (
                <div>
                  <div className="mb-2">
                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold inline-block">
                      {currentProfile.interest_1}
                    </span>
                  </div>
                  <p className="m-0 text-card-foreground leading-relaxed text-sm font-sans">
                    {currentProfile.interest_1_desc || 'No description available'}
                  </p>
                </div>
              )}

              {currentProfile.interest_2 && (
                <div>
                  <div className="mb-2">
                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold inline-block">
                      {currentProfile.interest_2}
                    </span>
                  </div>
                  <p className="m-0 text-card-foreground leading-relaxed text-sm font-sans">
                    {currentProfile.interest_2_desc || 'No description available'}
                  </p>
                </div>
              )}

              {currentProfile.interest_3 && (
                <div>
                  <div className="mb-2">
                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold inline-block">
                      {currentProfile.interest_3}
                    </span>
                  </div>
                  <p className="m-0 text-card-foreground leading-relaxed text-sm font-sans">
                    {currentProfile.interest_3_desc || 'No description available'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginTop: '32px',
          marginBottom: '120px', // Space for footer navigation
          padding: '0 20px'
        }}>
          <button
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: '2px solid #dc2626',
              background: 'transparent',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              opacity: isAnimating ? 0.5 : 1
            }}
            onClick={handleSkip}
            disabled={isAnimating}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#dc2626'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#dc2626'
            }}
          >
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
          
          <button
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#FDD8D6',
              color: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              opacity: isAnimating ? 0.5 : 1,
              border: 'none'
            }}
            onClick={handleMatch}
            disabled={isAnimating}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F7CAC9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FDD8D6'
            }}
          >
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Message Prompt Modal */}
      {showMessagePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-8 max-w-lg w-full text-center shadow-xl">
            <h3 className="m-0 mb-4 font-heading text-xl font-bold text-card-foreground">
              💌 Send a message to {currentProfile.name}
            </h3>
            <p className="m-0 mb-5 text-muted-foreground text-sm">
              Write a short message to introduce yourself (max 200 characters)
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'd love to get to know you better..."
              className="w-full min-h-24 resize-vertical mb-5 bg-background border-2 border-border rounded-lg px-3 py-2 text-card-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-all duration-300"
              maxLength={200}
            />
            <div className="text-xs text-muted-foreground mb-5">
              {message.length}/200 characters
            </div>
            <div className="flex gap-3">
              <button
                className="flex-1 bg-background border-2 border-border text-card-foreground font-bold px-5 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                onClick={handleCancelMessage}
              >
                Cancel
              </button>
              <button
                className={`flex-1 font-bold px-5 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                  !message.trim() 
                    ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                    : 'bg-gradient-to-br from-primary to-secondary text-primary-foreground'
                }`}
                onClick={handleSendMessage}
                disabled={!message.trim()}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Interest Dropdown Component
function InterestDropdown({ title, description }: { title: string; description?: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <div style={{
      background: '#FDD8D6', 
      borderRadius: '8px', 
      border: '1px solid #8B4513',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '12px',
          background: 'transparent',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          color: '#8B4513',
          fontWeight: 600,
          fontSize: '16px'
        }}
      >
        <span>{title}</span>
        <svg 
          width="16" 
          height="16" 
          fill="#8B4513" 
          viewBox="0 0 24 24"
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}
        >
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>
      
      {isExpanded && description && (
        <div style={{
          padding: '0 12px 12px 12px',
          borderTop: '1px solid #8B4513',
          background: 'rgba(255,255,255,0.3)'
        }}>
          <div style={{
            color: '#8B4513',
            fontSize: '14px',
            lineHeight: 1.5,
            marginTop: '8px'
          }}>
            {description}
          </div>
        </div>
      )}
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
    <div>
          {matches.length === 0 ? (
        <div style={{textAlign: 'center', padding: 20}}>
          <div style={{fontSize: 32, marginBottom: 12}}>💔</div>
          <h3 style={{margin: '0 0 6px 0', color: '#212529', fontSize: '16px'}}>No matches yet</h3>
          <p style={{color: '#6c757d', margin: 0, fontSize: '12px'}}>Start sending requests to find your perfect match!</p>
            </div>
          ) : (
        <div style={{display: 'grid', gap: 12}}>
          {matches.map(m => (
              <div key={m.id} style={{padding: '12px', borderBottom: '1px solid #f0f0f0'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12}}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#FDD8D6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8B4513',
                    fontSize: '16px',
                    fontWeight: '900',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    {m.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) || '?'}
                  </div>
                  <div style={{flex: 1}}>
                    <h4 style={{margin: '0 0 4px 0', fontSize: 16, fontWeight: 700, color: '#8B4513'}}>
                      {m.name || 'Match'}
                    </h4>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: '12px', color: '#8B4513'}}>
                      {m.location && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          {m.location}
                        </span>
                      )}
                      {m.location && m.instagram_handle && (
                        <span style={{color: '#8B4513'}}>•</span>
                      )}
                      {m.instagram_handle && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          Instagram: @{m.instagram_handle}
                        </span>
                      )}
                    </div>
                  </div>
                <button 
                  style={{
                    background: '#8B4513',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => {
                    onViewProfile(m)
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#A0522D'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#8B4513'
                  }}
                >
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  View Profile
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
function RequestsSection({ incoming, onAccepted, userId }: {
  incoming: any[];
  onAccepted: (id: string) => void;
  userId: string;
}) {
  return (
    <div>
          {incoming.length === 0 ? (
        <div style={{textAlign: 'center', padding: 20}}>
          <div style={{fontSize: 32, marginBottom: 12}}>📭</div>
          <h3 style={{margin: '0 0 6px 0', color: '#212529', fontSize: '16px'}}>No pending requests</h3>
          <p style={{color: '#6c757d', margin: 0, fontSize: '12px'}}>When someone sends you a request, it will appear here.</p>
            </div>
          ) : (
        <div style={{display: 'grid', gap: 12}}>
          {incoming.map(r => (
              <RequestRow key={r.id} item={r} me={userId} onAccepted={() => onAccepted(r.id)} />
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

      // @ts-ignore
      if (window.Razorpay) {
        console.log('Razorpay options:', JSON.stringify(options, null, 2))
        const rzp = new window.Razorpay(options)
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
            💬
          </div>
          <div>
            <h3 style={{margin: 0, fontSize: 16, fontWeight: 600, color: '#212529'}}>Chats</h3>
            <p style={{margin: '2px 0 0 0', color: '#6c757d', fontSize: '12px'}}>
              {matches.length} {matches.length === 1 ? 'match' : 'matches'}
            </p>
          </div>
        </div>

        {/* Chat List */}
        <div style={{flex: 1, overflow: 'auto'}}>
          {matches.length === 0 ? (
            <div style={{
              textAlign: 'center', 
              color: '#6c757d', 
              padding: '40px 20px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column'
            }}>
              <svg width="48" height="48" fill="#8B4513" viewBox="0 0 24 24" style={{marginBottom: 16, opacity: 0.6}}>
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
              <div style={{fontSize: '16px', fontWeight: 600, color: '#8B4513'}}>No matches yet</div>
              <div style={{fontSize: '14px', marginTop: 4, opacity: 0.7, color: '#8B4513'}}>Start matching to begin chatting!</div>
            </div>
          ) : (
            <div style={{padding: '8px'}}>
              {matches.map(match => (
                <div 
                  key={match.id}
                  onClick={() => setSelectedChatUser(match.other_user_id)}
                  style={{
                    background: 'white',
                    padding: '12px 16px',
                    marginBottom: '8px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid #e9ecef',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#FDD8D6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8B4513',
                    fontSize: '16px',
                    fontWeight: '900',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    {match.bio.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div style={{flex: 1}}>
                    <h4 style={{
                      margin: '0 0 4px 0',
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#8B4513'
                    }}>
                      Your Match
                    </h4>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '12px',
                      color: '#8B4513'
                    }}>
                      {match.location && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          {match.location}
                        </span>
                      )}
                      {match.location && match.instagram_handle && (
                        <span style={{color: '#8B4513'}}>•</span>
                      )}
                      {match.instagram_handle && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          Instagram: @{match.instagram_handle}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedChatUser(match.other_user_id)}
                    style={{
                      background: '#8B4513',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#A0522D'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#8B4513'
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

function RequestRow({item,me,onAccepted}:{item:{id:string;from_user_id:string;message:string;bio:string;name?:string;created_at:string;location?:string;custom_location?:string};me:string;onAccepted:()=>void}){
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
    <div style={{padding: '12px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div style={{flex: 1}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6}}>
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
            {item.name?.charAt(0).toUpperCase() || item.from_user_id.charAt(0).toUpperCase()}
          </div>
        <div>
            <div style={{fontWeight: 600, color: '#212529', fontSize: '14px'}}>
              {item.name || `User ${item.from_user_id.slice(0,8)}…`}
        </div>
            <div style={{color: '#6c757d', fontSize: '11px'}}>
              {new Date(item.created_at).toLocaleDateString()}
      </div>
          </div>
        </div>
        <div style={{color: '#6c757d', lineHeight: 1.4, marginBottom: 8, fontSize: '12px'}}>
          "{item.message || 'No message'}"
        </div>
        {item.bio && (
          <div style={{color: '#212529', fontSize: '12px', lineHeight: 1.4}}>
            {item.bio.length > 80 ? item.bio.substring(0, 80) + '...' : item.bio}
          </div>
        )}
        {item.location && (
          <div style={{color: '#6c757d', fontSize: '11px', marginTop: '4px'}}>
            📍 {item.location}
          </div>
        )}
      </div>
      <button 
        style={{
          ...btnPrimary,
          minWidth: '60px',
          padding: '6px 10px',
          fontSize: '11px',
          opacity: isAccepting ? 0.7 : 1
        }} 
        onClick={accept}
        disabled={isAccepting}
      >
        {isAccepting ? 'Accepting...' : 'Accept'}
      </button>
    </div>
  )
}

function ProfileDisplay({ me }: { me: any }) {
  if (!me) {
    return (
      <div style={{textAlign: 'center', padding: 40}}>
        <div style={{fontSize: 48, marginBottom: 16}}>👤</div>
        <h3 style={{margin: '0 0 8px 0', color: 'var(--text)'}}>Loading profile...</h3>
      </div>
    )
  }
  
  return (
    <div style={{
      padding: '16px'
    }}>
      {/* Profile Header */}
                      <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: '1px solid #e9ecef'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            {me.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 style={{margin: '0 0 4px 0', fontSize: '20px', fontWeight: 700, color: '#212529'}}>
              {me.name || 'User'}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#6c757d',
              fontSize: '12px'
            }}>
              <span>👤 {me.gender || 'Not specified'}</span>
              <span>💕 {me.relationship_status || 'Not specified'}</span>
              {me.location && (
                <span>📍 {me.location}</span>
              )}
            </div>
          </div>
        </div>

            {/* Bio Section */}
      <div style={{marginBottom: '20px'}}>
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '16px',
          fontWeight: 600,
          color: '#212529',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          📝 About Me
        </h3>
        <div style={{
          padding: '12px',
          lineHeight: '1.5',
          color: '#212529',
          fontSize: '14px'
        }}>
          {me.bio || 'No bio available'}
        </div>
      </div>

            {/* Interests Section */}
      <div>
        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: 600,
          color: '#212529',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          ⭐ My Interests
        </h3>
        <div style={{display: 'grid', gap: '12px'}}>
          {/* Interest 1 */}
          {me.interest_1 && (
                            <div style={{
                  padding: '8px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 600
                    }}>
                      {me.interest_1}
                    </span>
                  </div>
                  <p style={{
                    margin: 0,
                    color: '#212529',
                    lineHeight: '1.4',
                    fontSize: '12px'
                  }}>
                    {me.interest_1_desc || 'No description available'}
                  </p>
                </div>
          )}

          {/* Interest 2 */}
          {me.interest_2 && (
                            <div style={{
                  padding: '8px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 600
                    }}>
                      {me.interest_2}
                    </span>
                  </div>
                  <p style={{
                    margin: 0,
                    color: '#212529',
                    lineHeight: '1.4',
                    fontSize: '12px'
                  }}>
                    {me.interest_2_desc || 'No description available'}
                  </p>
                </div>
          )}

          {/* Interest 3 */}
          {me.interest_3 && (
                            <div style={{
                  padding: '8px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 600
                    }}>
                      {me.interest_3}
                    </span>
                  </div>
                  <p style={{
                    margin: 0,
                    color: '#212529',
                    lineHeight: '1.4',
                    fontSize: '12px'
                  }}>
                    {me.interest_3_desc || 'No description available'}
                  </p>
                </div>
          )}

          {/* No interests message */}
          {!me.interest_1 && !me.interest_2 && !me.interest_3 && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#6c757d'
            }}>
              <div style={{fontSize: '32px', marginBottom: '12px'}}>⭐</div>
              <p style={{margin: 0, fontSize: '14px'}}>No interests added yet</p>
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

    socket.emit('authenticate', { userId: me })

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

    return () => socketRef.current?.disconnect()
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



