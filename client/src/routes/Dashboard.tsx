import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type Profile = { id:string; name:string; gender:string; location?:string; custom_location?:string; bio:string; relationship_status:string; interest_1:string; interest_1_desc:string; interest_2:string; interest_2_desc:string; interest_3:string; interest_3_desc:string }
type MatchItem = { id:string; other_user_id:string; bio:string; relationship_status:string; interest_1:string; interest_1_desc:string; interest_2:string; interest_2_desc:string; interest_3:string; interest_3_desc:string; instagram_handle?: string; location?:string; custom_location?:string }

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

  // Real-time updates for incoming requests
  useEffect(() => {
    fetchData()
    
    // Set up polling for real-time updates every 10 seconds
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [userId])

  async function sendRequest(toUserId:string){
    const msg = prompt('Write a short message (max 200 chars)')||''
    try {
      await fetch(import.meta.env.VITE_API_URL + '/api/requests',{
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({fromUserId:userId,toUserId,message:msg})
      })
      alert('Request sent successfully!')
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
        background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
        color: 'white',
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
          <span style={{fontSize: '32px'}}>💕</span>
          <h1 style={{margin: 0, fontSize: 28, fontWeight: 800}}>Whispyr</h1>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: '14px', opacity: 0.9}}>Welcome back</div>
            <div style={{fontSize: '16px', fontWeight: 600}}>{me?.name || 'User'}</div>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
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

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid #e9ecef',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '12px 0',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
      }}>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 12px',
            borderRadius: '12px',
            color: activeTab === 'dating' ? '#ff6b6b' : '#6c757d',
            fontSize: '12px',
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
          onClick={() => setActiveTab('dating')}
        >
          <span style={{fontSize: '24px'}}>💖</span>
          Discover
        </button>

        <button
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 12px',
            borderRadius: '12px',
            color: activeTab === 'matches' ? '#ff6b6b' : '#6c757d',
            fontSize: '12px',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
          onClick={() => setActiveTab('matches')}
        >
          <span style={{fontSize: '24px'}}>💕</span>
          Matches
          {matches.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '4px',
              right: '8px',
              background: '#ff6b6b',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
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
            gap: '4px',
            padding: '8px 12px',
            borderRadius: '12px',
            color: activeTab === 'chat' ? '#ff6b6b' : '#6c757d',
            fontSize: '12px',
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
          onClick={() => setActiveTab('chat')}
        >
          <span style={{fontSize: '24px'}}>💬</span>
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
            gap: '4px',
            padding: '8px 12px',
            borderRadius: '12px',
            color: activeTab === 'requests' ? '#ff6b6b' : '#6c757d',
            fontSize: '12px',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
          onClick={() => setActiveTab('requests')}
        >
          <span style={{fontSize: '24px'}}>📩</span>
          Requests
          {incoming.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '4px',
              right: '8px',
              background: '#ff6b6b',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
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
            gap: '4px',
            padding: '8px 12px',
            borderRadius: '12px',
            color: activeTab === 'packs' ? '#ff6b6b' : '#6c757d',
            fontSize: '12px',
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
          onClick={() => setActiveTab('packs')}
        >
          <span style={{fontSize: '24px'}}>💎</span>
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
            gap: '4px',
            padding: '8px 12px',
            borderRadius: '12px',
            color: activeTab === 'profile' ? '#ff6b6b' : '#6c757d',
            fontSize: '12px',
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
          onClick={() => setActiveTab('profile')}
        >
          <span style={{fontSize: '24px'}}>👤</span>
          Profile
        </button>
      </nav>
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
              <div style={{textAlign: 'center', padding: 40}}>
          <div style={{fontSize: 48, marginBottom: 16}}>💔</div>
          <h3 style={{margin: '0 0 8px 0', color: '#212529'}}>No profiles available</h3>
          <p style={{color: '#6c757d', margin: 0}}>Check back later for new profiles!</p>
        </div>
    )
  }

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
        <div>
          <span style={{color: '#6c757d', fontSize: '12px'}}>
            Profile {currentIndex + 1} of {feed.length}
          </span>
        </div>
        <button 
          style={{
            ...btnSecondary,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            padding: '8px 12px'
          }}
          onClick={() => setFiltersVisible(!filtersVisible)}
        >
          🔍 {filtersVisible ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {/* Collapsible Filters */}
      {filtersVisible && (
        <div style={{...card, marginBottom: 16, padding: '16px'}}>
          <h3 style={{margin: '0 0 12px 0', fontSize: 16, color: '#212529'}}>🔍 Filters</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12}}>
            <div>
              <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#212529', fontSize: '12px'}}>Age Range</label>
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <input 
                  type="range" 
                  min="18" 
                  max="70" 
                  value={filters.ageRange[0]} 
                  onChange={(e) => setFilters({...filters, ageRange: [parseInt(e.target.value), filters.ageRange[1]]})}
                  style={{flex: 1}}
                />
                <span style={{minWidth: 50, color: '#212529', fontSize: '12px'}}>{filters.ageRange[0]}-{filters.ageRange[1]}</span>
              </div>
              <input 
                type="range" 
                min="18" 
                max="70" 
                value={filters.ageRange[1]} 
                onChange={(e) => setFilters({...filters, ageRange: [filters.ageRange[0], parseInt(e.target.value)]})}
                style={{width: '100%', marginTop: 8}}
              />
            </div>
            
            <div>
              <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#212529', fontSize: '12px'}}>Gender</label>
              <select 
                value={filters.gender} 
                onChange={(e) => setFilters({...filters, gender: e.target.value})}
                style={input}
              >
                <option value="">All genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="trans">Trans</option>
              </select>
            </div>

            <div>
              <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#212529', fontSize: '12px'}}>Relationship Status</label>
              <select 
                value={filters.relationshipStatus} 
                onChange={(e) => setFilters({...filters, relationshipStatus: e.target.value})}
                style={input}
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
              <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#212529', fontSize: '12px'}}>Location</label>
              <input 
                type="text" 
                placeholder="Enter location..."
                value={filters.location} 
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                style={input}
              />
            </div>
          </div>
        </div>
      )}

      {/* Single Profile Display */}
      <div style={{
        maxWidth: '100%',
        margin: '0 auto',
        position: 'relative'
      }}>
        <div style={{
          padding: '16px',
          transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onClick={() => onViewProfile(currentProfile)}
        >
          {/* Profile Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
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
              {currentProfile.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 style={{margin: '0 0 4px 0', fontSize: '20px', fontWeight: 700, color: '#212529'}}>
                {currentProfile.name}
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#6c757d',
                fontSize: '12px'
              }}>
                <span>{getGenderIcon(currentProfile.gender)} {currentProfile.gender}</span>
                <span>💕 {currentProfile.relationship_status}</span>
                {currentProfile.location && (
                  <span>📍 {currentProfile.location}</span>
                )}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div style={{marginBottom: '16px'}}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              fontWeight: 600,
              color: '#212529',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              📝 About {currentProfile.name}
            </h3>
            <div style={{
              padding: '12px',
              lineHeight: '1.5',
              color: '#212529',
              fontSize: '14px'
            }}>
              {currentProfile.bio || 'No bio available'}
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
              ⭐ Interests
            </h3>
            <div style={{display: 'grid', gap: '12px'}}>
              {currentProfile.interest_1 && (
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
                      {currentProfile.interest_1}
                    </span>
                  </div>
                  <p style={{
                    margin: 0,
                    color: '#212529',
                    lineHeight: '1.4',
                    fontSize: '12px'
                  }}>
                    {currentProfile.interest_1_desc || 'No description available'}
                  </p>
                </div>
              )}

              {currentProfile.interest_2 && (
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
                      {currentProfile.interest_2}
                    </span>
                  </div>
                  <p style={{
                    margin: 0,
                    color: '#212529',
                    lineHeight: '1.4',
                    fontSize: '12px'
                  }}>
                    {currentProfile.interest_2_desc || 'No description available'}
                  </p>
                </div>
              )}

              {currentProfile.interest_3 && (
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
                      {currentProfile.interest_3}
                    </span>
                  </div>
                  <p style={{
                    margin: 0,
                    color: '#212529',
                    lineHeight: '1.4',
                    fontSize: '12px'
                  }}>
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
          gap: '16px',
          marginTop: '16px'
        }}>
          <button
            style={{
              ...btnSecondary,
              width: '100px',
              height: '50px',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              border: '2px solid #e9ecef',
              color: '#6c757d'
            }}
            onClick={handleSkip}
            disabled={isAnimating}
          >
            Skip
          </button>
          
          <button
            style={{
              ...btnPrimary,
              width: '100px',
              height: '50px',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
              border: 'none'
            }}
            onClick={handleMatch}
            disabled={isAnimating}
          >
            Match
          </button>
        </div>
      </div>

      {/* Message Prompt Modal */}
      {showMessagePrompt && (
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
            background: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '450px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{margin: '0 0 16px 0', color: '#212529'}}>
              💌 Send a message to {currentProfile.name}
            </h3>
            <p style={{margin: '0 0 20px 0', color: '#6c757d', fontSize: '14px'}}>
              Write a short message to introduce yourself (max 200 characters)
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'd love to get to know you better..."
              style={{
                ...input,
                width: '100%',
                minHeight: '100px',
                resize: 'vertical',
                marginBottom: '20px'
              }}
              maxLength={200}
            />
            <div style={{fontSize: '12px', color: '#6c757d', marginBottom: '20px'}}>
              {message.length}/200 characters
            </div>
            <div style={{display: 'flex', gap: '12px'}}>
              <button
                style={{
                  ...btnSecondary,
                  flex: 1,
                  padding: '12px 20px'
                }}
                onClick={handleCancelMessage}
              >
                Cancel
              </button>
              <button
                style={{
                  ...btnPrimary,
                  flex: 1,
                  padding: '12px 20px',
                  opacity: !message.trim() ? 0.5 : 1
                }}
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
function MatchesSection({ matches, onRefresh, onChatClick }: {
  matches: MatchItem[];
  onRefresh: () => void;
  onChatClick: (userId: string) => void;
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
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div style={{flex: 1}}>
                    <h4 style={{margin: '0 0 6px 0', fontSize: 16, fontWeight: 600, color: '#212529'}}>Your Match</h4>
                    <p style={{margin: '0 0 6px 0', color: '#6c757d', lineHeight: 1.4, fontSize: '12px'}}>{m.bio}</p>
                    <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px'}}>
                      {m.location && (
                        <span style={{color: '#212529', fontWeight: 500, fontSize: '11px'}}>📍 {m.location}</span>
                      )}
                      {m.instagram_handle && (
                        <>
                          <span style={{color: '#212529', fontWeight: 500, fontSize: '11px'}}>•</span>
                          <span style={{color: '#212529', fontWeight: 500, fontSize: '11px'}}>📸 Instagram:</span>
                          <span style={{color: '#ff6b6b', fontWeight: 600, fontSize: '11px'}}>@{m.instagram_handle}</span>
                        </>
                      )}
                    </div>
                  </div>
                <button 
                  style={{
                    ...btnPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                  onClick={() => onChatClick(m.other_user_id)}
                >
                  💬 Start Chat
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
  // If no chat user is selected, show the chat list (WhatsApp-like home page)
  if (!selectedChatUser) {
  return (
    <div>
      {matches.length === 0 ? (
        <div style={{textAlign: 'center', padding: 20}}>
          <div style={{fontSize: 32, marginBottom: 12}}>💬</div>
          <h3 style={{margin: '0 0 6px 0', color: '#212529', fontSize: '16px'}}>No conversations yet</h3>
          <p style={{color: '#6c757d', margin: 0, fontSize: '12px'}}>Start matching with people to begin chatting!</p>
        </div>
      ) : (
          <div style={{display: 'grid', gap: 8}}>
          {matches.map(m => (
              <div 
                key={m.id} 
                style={{
                  padding: '12px',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                onClick={() => setSelectedChatUser(m.other_user_id)}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    {m.bio.charAt(0).toUpperCase()}
                  </div>
                <div style={{flex: 1}}>
                    <h4 style={{margin: '0 0 3px 0', fontSize: 14, fontWeight: 600, color: '#212529'}}>
                      Chat with your match
                    </h4>
                    <p style={{margin: 0, color: '#6c757d', fontSize: '12px', lineHeight: 1.3}}>
                      {m.bio.length > 50 ? m.bio.substring(0, 50) + '...' : m.bio}
                    </p>
                    <div style={{display: 'flex', alignItems: 'center', gap: '3px', marginTop: '3px'}}>
                      {m.location && (
                        <span style={{color: '#6c757d', fontSize: '10px'}}>📍 {m.location}</span>
                      )}
                      {m.instagram_handle && (
                        <>
                          {m.location && <span style={{color: '#6c757d', fontSize: '10px'}}>•</span>}
                          <span style={{color: '#ff6b6b', fontSize: '10px'}}>📸 @{m.instagram_handle}</span>
                        </>
                      )}
                    </div>
                </div>
                  <div style={{color: '#6c757d', fontSize: '10px'}}>▶</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

  // If a chat user is selected, show the individual chat interface
  const selectedMatch = matches.find(m => m.other_user_id === selectedChatUser)
  
  return (
    <div style={{height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column'}}>
            {/* Chat Header */}
      <div style={{
        background: 'white',
        padding: '12px 16px',
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        margin: '-16px -16px 16px -16px'
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

      {/* Chat Messages */}
      <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
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
function ChatPanel({me, other}: {me: string; other: string}) {
  const [messages, setMessages] = useState<{
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
  }[]>([])
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const r = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/history?userA=${me}&userB=${other}`)
        if (!r.ok) {
          console.error('Failed to fetch messages:', r.status, r.statusText)
          return
        }
        const data = await r.json()
        console.log('Fetched messages:', data)
        setMessages(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching messages:', error)
        setMessages([])
      }
    }
    
    fetchMessages()
    // Set up polling to fetch new messages every 3 seconds for real-time updates
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [me, other])

  async function send() {
    if (!text.trim() || isSending) return
    
    setIsSending(true)
    console.log('Sending message:', { fromUserId: me, toUserId: other, content: text })
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/send`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({fromUserId: me, toUserId: other, content: text})
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Send message failed:', errorData)
        throw new Error(errorData.error || 'Failed to send message')
      }
      
      const result = await response.json()
      console.log('Message sent successfully:', result)
      setText('')
      
      // Fetch updated messages immediately
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/history?userA=${me}&userB=${other}`)
      if (r.ok) {
      const data = await r.json()
        console.log('Updated messages after send:', data)
      setMessages(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', gap: 12}}>
      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        background: 'var(--bg)',
        padding: 16,
        borderRadius: 12,
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minHeight: '300px'
      }}>
        {messages.length === 0 ? (
                  <div style={{textAlign: 'center', color: '#6c757d', padding: 20, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div>
            <div style={{fontSize: 32, marginBottom: 12}}>💬</div>
            <div style={{fontSize: '14px'}}>No messages yet. Start the conversation!</div>
          </div>
        </div>
        ) : (
          messages.map(m => (
            <div key={m.id} style={{textAlign: m.sender_id === me ? 'right' : 'left'}}>
              <span style={{
                display: 'inline-block',
                background: m.sender_id === me ? 'linear-gradient(135deg, #ff6b6b, #ee5a52)' : '#ffffff',
                color: m.sender_id === me ? 'white' : '#212529',
                padding: '8px 12px',
                borderRadius: 12,
                maxWidth: '75%',
                wordBreak: 'break-word',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                fontSize: '12px',
                lineHeight: 1.3
              }}>
                {m.content}
              </span>
            </div>
          ))
        )}
      </div>
      
      {/* Input Area */}
      <div style={{display: 'flex', gap: 8, alignItems: 'flex-end'}}>
        <input 
          value={text} 
          onChange={e => setText(e.target.value)} 
          placeholder="Type a message..." 
          style={{
            ...input,
            flex: 1,
            resize: 'none',
            minHeight: '36px',
            maxHeight: '100px',
            fontSize: '12px'
          }}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={isSending}
        />
        <button 
          onClick={send} 
          style={{
            ...btnPrimary,
            minHeight: '36px',
            minWidth: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isSending ? 0.7 : 1,
            fontSize: '14px'
          }}
          disabled={!text.trim() || isSending}
        >
          {isSending ? '⏳' : '💬'}
        </button>
      </div>
    </div>
  )
}

function Modal({children,onClose}:{children:React.ReactNode;onClose:()=>void}){
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',display:'grid',placeItems:'center'}} onClick={onClose}>
      <div style={{background:'var(--card)',border:'1px solid #2f2f40',borderRadius:12,padding:16,width:520}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontWeight:800}}>Details</div>
          <button onClick={onClose} style={btnGhost}>Close</button>
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


