import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Types
type PendingUser = { 
  id: string; 
  name: string; 
  gender: string; 
  date_of_birth: string; 
  whatsapp_number: string; 
  instagram_handle: string; 
  bio: string; 
  relationship_status: string; 
  interest_1: string; 
  interest_1_desc: string; 
  interest_2: string; 
  interest_2_desc: string; 
  interest_3: string; 
  interest_3_desc: string;
  location: string;
  custom_location: string;
  partner_expectations: string;
  interest_4: string;
  interest_5: string;
  interest_6: string;
}

type User = {
  id: string;
  name: string;
  gender: string;
  date_of_birth: string;
  whatsapp_number: string;
  instagram_handle: string;
  location: string;
  custom_location: string;
  status: string;
  login_id: string;
  created_at: string;
  updated_at: string;
  bio: string;
  relationship_status: string;
  partner_expectations: string;
  interest_1: string;
  interest_2: string;
  interest_3: string;
  interest_4: string;
  interest_5: string;
  interest_6: string;
  is_visible: boolean;
  profile_created_at: string;
  profile_updated_at: string;
}

type PackData = {
  activePacks: Array<{
    id: string;
    user_id: string;
    user_name: string;
    user_whatsapp: string;
    user_instagram: string;
    user_login_id: string;
    pack_id: string;
    pack_name: string;
    matches_total: number;
    matches_remaining: number;
    requests_total: number;
    requests_remaining: number;
    amount_paid: number;
    purchased_at: string;
    expires_at: string;
    created_at: string;
    updated_at: string;
    type: string;
  }>;
  paymentOrders: Array<{
    id: string;
    user_id: string;
    user_name: string;
    user_whatsapp: string;
    user_instagram: string;
    user_login_id: string;
    pack_id: string;
    amount: number;
    currency: string;
    status: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    created_at: string;
    updated_at: string;
    type: string;
  }>;
  legacyPurchases: Array<{
    id: string;
    user_id: string;
    user_name: string;
    user_whatsapp: string;
    user_instagram: string;
    user_login_id: string;
    pack_size: number;
    amount_rupees: number;
    status: string;
    created_at: string;
    type: string;
  }>;
}

type UserProfile = {
  id: string;
  name: string;
  gender: string;
  age: number;
  date_of_birth: string;
  whatsapp_number: string;
  instagram_handle: string;
  location: string;
  custom_location: string;
  status: string;
  login_id: string;
  created_at: string;
  updated_at: string;
  bio: string;
  relationship_status: string;
  partner_expectations: string;
  interest_1: string;
  interest_2: string;
  interest_3: string;
  interest_4: string;
  interest_5: string;
  interest_6: string;
  is_visible: boolean;
  profile_created_at: string;
  profile_updated_at: string;
}

export function Admin(){
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'packs'>('pending')
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [packData, setPackData] = useState<PackData | null>(null)
  const [credentials, setCredentials] = useState<{loginId: string; password: string} | undefined>()
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('authToken') || ''

  // Admin logout function with extra security
  const handleAdminLogout = () => {
    // Clear all admin-related data
    localStorage.removeItem('authToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('isAdmin')
    sessionStorage.removeItem('userId')
    
    // Navigate to login page
    navigate('/login')
  }
  
  // Load data based on active tab
  useEffect(() => {
    loadData()
  }, [activeTab, token])

  async function loadData() {
    setLoading(true)
    try {
      if (activeTab === 'pending') {
        const r = await fetch(import.meta.env.VITE_API_URL + '/api/admin/pending', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`)
        }
        const data = await r.json()
        setPendingUsers(Array.isArray(data) ? data : [])
      } else if (activeTab === 'users') {
        const r = await fetch(import.meta.env.VITE_API_URL + '/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`)
        }
        const data = await r.json()
        setAllUsers(Array.isArray(data) ? data : [])
      } else if (activeTab === 'packs') {
        const r = await fetch(import.meta.env.VITE_API_URL + '/api/admin/packs', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`)
        }
        const data = await r.json()
        setPackData(data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Failed to load data')
      // Set empty arrays on error to prevent map errors
      if (activeTab === 'pending') {
        setPendingUsers([])
      } else if (activeTab === 'users') {
        setAllUsers([])
      } else if (activeTab === 'packs') {
        setPackData(null)
      }
    } finally {
      setLoading(false)
    }
  }

  async function approve(userId: string) {
    try {
      const r = await fetch(import.meta.env.VITE_API_URL + '/api/admin/approve', {
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({userId})
      })
      const data = await r.json()
      if (r.ok) { 
        setCredentials(data.credentials)
        setPendingUsers(pendingUsers.filter(i => i.id !== userId))
        alert('User approved successfully!')
      } else {
        alert(data?.error || 'Failed to approve user')
      }
    } catch (error) {
      console.error('Error approving user:', error)
      alert('Failed to approve user')
    }
  }

  async function viewProfile(userId: string) {
    try {
      const r = await fetch(import.meta.env.VITE_API_URL + `/api/admin/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await r.json()
      if (r.ok) {
        setSelectedProfile(data)
      } else {
        alert(data?.error || 'Failed to load profile')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      alert('Failed to load profile')
    }
  }

  function calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Admin Panel</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              style={{...tabButton, ...(activeTab === 'pending' ? activeTabButton : {})}}
              onClick={() => setActiveTab('pending')}
            >
              New Approvals ({pendingUsers.length})
            </button>
            <button 
              style={{...tabButton, ...(activeTab === 'users' ? activeTabButton : {})}}
              onClick={() => setActiveTab('users')}
            >
              All Users ({allUsers.length})
            </button>
            <button 
              style={{...tabButton, ...(activeTab === 'packs' ? activeTabButton : {})}}
              onClick={() => setActiveTab('packs')}
            >
              Packs & Purchases
            </button>
          </div>
          <button 
            style={{...btnSecondary, marginLeft: '16px'}}
            onClick={handleAdminLogout}
            title="Secure Admin Logout"
          >
            🔒 Logout
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
          Loading...
        </div>
      )}

      {/* New User Approvals Section */}
      {activeTab === 'pending' && !loading && (
        <div>
          <h3 style={{ marginBottom: '16px', color: 'var(--accent)' }}>New User Approvals</h3>
          {pendingUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
              No pending approvals
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {Array.isArray(pendingUsers) && pendingUsers.map(user => (
                <div key={user.id} style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '4px' }}>
                        {user.name} ({calculateAge(user.date_of_birth)} years)
                      </div>
                      <div style={{ color: 'var(--text)', fontSize: '14px', opacity: 0.8 }}>
                        @{user.instagram_handle} • {user.whatsapp_number}
                      </div>
                      <div style={{ color: 'var(--text)', fontSize: '14px', opacity: 0.8 }}>
                        {user.gender} • {user.relationship_status} • {user.location}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        style={btnSecondary} 
                        onClick={() => viewProfile(user.id)}
                      >
                        View Full Profile
                      </button>
                      <button 
                        style={btnPrimary} 
                        onClick={() => approve(user.id)}
                      >
                        Approve & Generate Credentials
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: '8px 0', color: 'var(--text)', lineHeight: '1.5' }}>
                    {user.bio}
                  </p>
                  <div style={{ fontSize: '14px', color: 'var(--text)', opacity: 0.8 }}>
                    <strong>Interests:</strong> {user.interest_1}, {user.interest_2}, {user.interest_3}
                    {user.interest_4 && `, ${user.interest_4}`}
                    {user.interest_5 && `, ${user.interest_5}`}
                    {user.interest_6 && `, ${user.interest_6}`}
                  </div>
                  {user.partner_expectations && (
                    <div style={{ fontSize: '14px', color: 'var(--text)', opacity: 0.8, marginTop: '8px' }}>
                      <strong>Partner Expectations:</strong> {user.partner_expectations}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Users Section */}
      {activeTab === 'users' && !loading && (
        <div>
          <h3 style={{ marginBottom: '16px', color: 'var(--accent)' }}>All Users</h3>
          <div style={tableContainer}>
            <table style={table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Login ID</th>
                  <th>WhatsApp</th>
                  <th>Instagram</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(allUsers) && allUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '600' }}>{user.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text)', opacity: 0.8 }}>
                          {user.gender} • {calculateAge(user.date_of_birth)} years
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                        {user.login_id || 'Not generated'}
                      </div>
                    </td>
                    <td>{user.whatsapp_number}</td>
                    <td>@{user.instagram_handle}</td>
                    <td>
                      <span style={{
                        ...statusBadge,
                        backgroundColor: user.status === 'approved' ? '#10b981' : 
                                        user.status === 'pending' ? '#f59e0b' : '#ef4444'
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text)' }}>
                      {formatDate(user.created_at)}
                    </td>
                    <td>
                      <button 
                        style={btnSmall} 
                        onClick={() => viewProfile(user.id)}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Packs Section */}
      {activeTab === 'packs' && !loading && packData && (
        <div>
          <h3 style={{ marginBottom: '16px', color: 'var(--accent)' }}>Packs & Purchases</h3>
          
          {/* Active Packs */}
          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ marginBottom: '12px', color: 'var(--text)' }}>Active Packs ({packData.activePacks.length})</h4>
            {packData.activePacks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
                No active packs
              </div>
            ) : (
              <div style={tableContainer}>
                <table style={table}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Pack</th>
                      <th>Matches</th>
                      <th>Requests</th>
                      <th>Amount</th>
                      <th>Purchased</th>
                      <th>Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(packData.activePacks) && packData.activePacks.map(pack => (
                      <tr key={pack.id}>
                        <td>
                          <div>
                            <div style={{ fontWeight: '600' }}>{pack.user_name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text)', opacity: 0.8 }}>
                              {pack.user_whatsapp} • @{pack.user_instagram}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={packBadge}>{pack.pack_name}</span>
                        </td>
                        <td>
                          <div style={{ fontSize: '14px' }}>
                            {pack.matches_remaining}/{pack.matches_total}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '14px' }}>
                            {pack.requests_remaining === -1 ? '∞' : pack.requests_remaining}/{pack.requests_total === -1 ? '∞' : pack.requests_total}
                          </div>
                        </td>
                        <td>₹{pack.amount_paid}</td>
                        <td style={{ fontSize: '12px', color: 'var(--text)' }}>
                          {formatDate(pack.purchased_at)}
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text)' }}>
                          {pack.expires_at ? formatDate(pack.expires_at) : 'Lifetime'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment Orders */}
          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ marginBottom: '12px', color: 'var(--text)' }}>Payment Orders ({packData.paymentOrders.length})</h4>
            {packData.paymentOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
                No payment orders
              </div>
            ) : (
              <div style={tableContainer}>
                <table style={table}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Pack</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Order ID</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(packData.paymentOrders) && packData.paymentOrders.map(order => (
                      <tr key={order.id}>
                        <td>
                          <div>
                            <div style={{ fontWeight: '600' }}>{order.user_name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text)', opacity: 0.8 }}>
                              {order.user_whatsapp} • @{order.user_instagram}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={packBadge}>{order.pack_id}</span>
                        </td>
                        <td>₹{order.amount}</td>
                        <td>
                          <span style={{
                            ...statusBadge,
                            backgroundColor: order.status === 'paid' ? '#10b981' : 
                                            order.status === 'created' ? '#f59e0b' : '#ef4444'
                          }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                          {order.razorpay_order_id}
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text)' }}>
                          {formatDate(order.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Legacy Purchases */}
          <div>
            <h4 style={{ marginBottom: '12px', color: 'var(--text)' }}>Legacy Purchases ({packData.legacyPurchases.length})</h4>
            {packData.legacyPurchases.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
                No legacy purchases
              </div>
            ) : (
              <div style={tableContainer}>
                <table style={table}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Pack Size</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(packData.legacyPurchases) && packData.legacyPurchases.map(purchase => (
                      <tr key={purchase.id}>
                        <td>
                          <div>
                            <div style={{ fontWeight: '600' }}>{purchase.user_name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text)', opacity: 0.8 }}>
                              {purchase.user_whatsapp} • @{purchase.user_instagram}
                            </div>
                          </div>
                        </td>
                        <td>{purchase.pack_size} matches</td>
                        <td>₹{purchase.amount_rupees}</td>
                        <td>
                          <span style={{
                            ...statusBadge,
                            backgroundColor: purchase.status === 'paid' ? '#10b981' : 
                                            purchase.status === 'pending' ? '#f59e0b' : '#ef4444'
                          }}>
                            {purchase.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text)' }}>
                          {formatDate(purchase.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {credentials && (
        <div style={modalOverlay}>
          <div style={modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: 'var(--accent)' }}>Credentials Generated</h3>
              <button style={closeButton} onClick={() => setCredentials(undefined)}>×</button>
            </div>
            <div style={credentialsBox}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Login ID:</strong> <span style={{ fontFamily: 'monospace' }}>{credentials.loginId}</span>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Password:</strong> <span style={{ fontFamily: 'monospace' }}>{credentials.password}</span>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '14px' }}>
                Share these credentials with the user via WhatsApp.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {selectedProfile && (
        <div style={modalOverlay}>
          <div style={modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: 'var(--accent)' }}>User Profile</h3>
              <button style={closeButton} onClick={() => setSelectedProfile(null)}>×</button>
            </div>
            <div style={profileContent}>
              <div style={profileSection}>
                <h4>Basic Information</h4>
                <div style={profileGrid}>
                  <div><strong>Name:</strong> {selectedProfile.name}</div>
                  <div><strong>Age:</strong> {selectedProfile.age} years</div>
                  <div><strong>Gender:</strong> {selectedProfile.gender}</div>
                  <div><strong>Status:</strong> {selectedProfile.status}</div>
                  <div><strong>WhatsApp:</strong> {selectedProfile.whatsapp_number}</div>
                  <div><strong>Instagram:</strong> @{selectedProfile.instagram_handle}</div>
                  <div><strong>Location:</strong> {selectedProfile.location}</div>
                  <div><strong>Login ID:</strong> {selectedProfile.login_id || 'Not generated'}</div>
                </div>
              </div>

              <div style={profileSection}>
                <h4>Profile Details</h4>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Bio:</strong>
                  <div style={{ marginTop: '4px', padding: '8px', background: 'var(--card)', borderRadius: '8px' }}>
                    {selectedProfile.bio}
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Relationship Status:</strong> {selectedProfile.relationship_status}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Partner Expectations:</strong>
                  <div style={{ marginTop: '4px', padding: '8px', background: 'var(--card)', borderRadius: '8px' }}>
                    {selectedProfile.partner_expectations}
                  </div>
                </div>
              </div>

              <div style={profileSection}>
                <h4>Interests</h4>
                <div style={profileGrid}>
                  <div><strong>Interest 1:</strong> {selectedProfile.interest_1}</div>
                  <div><strong>Interest 2:</strong> {selectedProfile.interest_2}</div>
                  <div><strong>Interest 3:</strong> {selectedProfile.interest_3}</div>
                  <div><strong>Interest 4:</strong> {selectedProfile.interest_4}</div>
                  <div><strong>Interest 5:</strong> {selectedProfile.interest_5}</div>
                  <div><strong>Interest 6:</strong> {selectedProfile.interest_6}</div>
                </div>
              </div>

              <div style={profileSection}>
                <h4>Account Information</h4>
                <div style={profileGrid}>
                  <div><strong>Profile Visible:</strong> {selectedProfile.is_visible ? 'Yes' : 'No'}</div>
                  <div><strong>Created:</strong> {formatDate(selectedProfile.created_at)}</div>
                  <div><strong>Last Updated:</strong> {formatDate(selectedProfile.updated_at)}</div>
                  <div><strong>Profile Created:</strong> {formatDate(selectedProfile.profile_created_at)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Styles
const card: React.CSSProperties = { 
  background: 'var(--card)', 
  border: '1px solid #26263a', 
  borderRadius: 16, 
  padding: 16 
}

const btnPrimary: React.CSSProperties = { 
  background: 'linear-gradient(135deg,var(--accent),var(--accent2))', 
  padding: '10px 14px', 
  borderRadius: 12, 
  color: 'white', 
  fontWeight: 700,
  border: 'none',
  cursor: 'pointer'
}

const btnSecondary: React.CSSProperties = { 
  background: 'var(--card)', 
  padding: '10px 14px', 
  borderRadius: 12, 
  color: 'var(--text)', 
  fontWeight: 600,
  border: '1px solid #26263a',
  cursor: 'pointer'
}

const btnSmall: React.CSSProperties = { 
  background: 'var(--accent)', 
  padding: '6px 10px', 
  borderRadius: 8, 
  color: 'white', 
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  fontSize: '12px'
}

const tabButton: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: '8px',
  border: '1px solid #26263a',
  background: 'var(--card)',
  color: 'var(--text)',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600'
}

const activeTabButton: React.CSSProperties = {
  background: 'var(--accent)',
  color: 'white',
  border: '1px solid var(--accent)'
}

const tableContainer: React.CSSProperties = {
  overflowX: 'auto',
  border: '1px solid #26263a',
  borderRadius: '12px',
  background: 'var(--card)'
}

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '14px'
}

const statusBadge: React.CSSProperties = {
  padding: '4px 8px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'capitalize'
}

const packBadge: React.CSSProperties = {
  padding: '4px 8px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '600',
  background: 'var(--accent)',
  color: 'white',
  textTransform: 'capitalize'
}

const modalOverlay: React.CSSProperties = {
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
}

const modal: React.CSSProperties = {
  background: 'var(--background)',
  border: '1px solid #26263a',
  borderRadius: '16px',
  padding: '24px',
  maxWidth: '600px',
  width: '90%',
  maxHeight: '80vh',
  overflowY: 'auto'
}

const closeButton: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '24px',
  color: 'var(--muted)',
  cursor: 'pointer',
  padding: '0',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const credentialsBox: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid #26263a',
  borderRadius: '12px',
  padding: '16px'
}

const profileContent: React.CSSProperties = {
  maxHeight: '60vh',
  overflowY: 'auto'
}

const profileSection: React.CSSProperties = {
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '1px solid #26263a'
}

const profileGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '12px',
  marginTop: '8px'
}
