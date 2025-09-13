import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

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
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'packs' | 'subscriptions'>('pending')
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [packData, setPackData] = useState<PackData | null>(null)
  const [credentials, setCredentials] = useState<{loginId: string; password: string; whatsappUrl?: string} | undefined>()
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null)
  const [selectedUserForPack, setSelectedUserForPack] = useState<User | null>(null)
  const [userPackDetails, setUserPackDetails] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [packActionLoading, setPackActionLoading] = useState(false)
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
      } else if (activeTab === 'subscriptions') {
        // Load users for subscription management
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
      }
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Failed to load data')
      // Set empty arrays on error to prevent map errors
      if (activeTab === 'pending') {
        setPendingUsers([])
      } else if (activeTab === 'users' || activeTab === 'subscriptions') {
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
        setCredentials({
          ...data.credentials,
          whatsappUrl: data.whatsappUrl
        })
        setPendingUsers(pendingUsers.filter(i => i.id !== userId))
        alert('User approved successfully! Credentials ready to send via WhatsApp.')
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

  // Subscription management functions
  async function loadUserPackDetails(userId: string) {
    try {
      const r = await fetch(import.meta.env.VITE_API_URL + `/api/admin/user-pack/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!r.ok) {
        throw new Error(`HTTP error! status: ${r.status}`)
      }
      const data = await r.json()
      setUserPackDetails(data.pack)
    } catch (error) {
      console.error('Error loading user pack details:', error)
      setUserPackDetails(null)
    }
  }

  async function assignPack(userId: string, packId: string, amount: number) {
    setPackActionLoading(true)
    try {
      const r = await fetch(import.meta.env.VITE_API_URL + '/api/admin/assign-pack', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, packId, amount })
      })
      const data = await r.json()
      if (r.ok) {
        alert(data.message)
        // Reload pack details
        await loadUserPackDetails(userId)
        // Reload packs data
        if (activeTab === 'packs') {
          loadData()
        }
      } else {
        alert(data?.error || 'Failed to assign pack')
      }
    } catch (error) {
      console.error('Error assigning pack:', error)
      alert('Failed to assign pack')
    } finally {
      setPackActionLoading(false)
    }
  }

  async function updatePack(userId: string, action: string, value: number) {
    setPackActionLoading(true)
    try {
      const r = await fetch(import.meta.env.VITE_API_URL + '/api/admin/update-pack', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, action, value })
      })
      const data = await r.json()
      if (r.ok) {
        alert(data.message)
        // Reload pack details
        await loadUserPackDetails(userId)
        // Reload packs data
        if (activeTab === 'packs') {
          loadData()
        }
      } else {
        alert(data?.error || 'Failed to update pack')
      }
    } catch (error) {
      console.error('Error updating pack:', error)
      alert('Failed to update pack')
    } finally {
      setPackActionLoading(false)
    }
  }

  function openPackManagement(user: User) {
    setSelectedUserForPack(user)
    loadUserPackDetails(user.id)
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel | Snift Management</title>
        <meta name="description" content="Snift admin panel for managing user profiles, approvals, and platform administration. Access restricted to authorized administrators only." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://thesnift.com/admin" />
      </Helmet>
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
            <button 
              style={{...tabButton, ...(activeTab === 'subscriptions' ? activeTabButton : {})}}
              onClick={() => setActiveTab('subscriptions')}
            >
              Manage Subscriptions
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

      {/* Subscription Management Section */}
      {activeTab === 'subscriptions' && !loading && (
        <div>
          <h3 style={{ marginBottom: '16px', color: 'var(--accent)' }}>Subscription Management</h3>
          <p style={{ marginBottom: '24px', color: 'var(--muted)', fontSize: '14px' }}>
            Manage user subscription packs manually. Assign new packs or modify existing ones.
          </p>
          
          <div style={tableContainer}>
            <table style={table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Login ID</th>
                  <th>WhatsApp</th>
                  <th>Instagram</th>
                  <th>Status</th>
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
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          style={btnSmall} 
                          onClick={() => viewProfile(user.id)}
                        >
                          View Profile
                        </button>
                        {user.status === 'approved' && (
                          <button 
                            style={{...btnSmall, background: 'var(--accent2)'}} 
                            onClick={() => openPackManagement(user)}
                          >
                            Manage Pack
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <div style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
                Share these credentials with the user via WhatsApp.
              </div>
              {credentials.whatsappUrl && (
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button 
                    style={{
                      ...btnPrimary,
                      background: 'linear-gradient(135deg, #25D366, #128C7E)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onClick={() => window.open(credentials.whatsappUrl, '_blank')}
                  >
                    <span>📱</span>
                    <span>Send via WhatsApp</span>
                  </button>
                  <button 
                    style={btnSecondary}
                    onClick={() => {
                      navigator.clipboard.writeText(`Login ID: ${credentials.loginId}\nPassword: ${credentials.password}`);
                      alert('Credentials copied to clipboard!');
                    }}
                  >
                    📋 Copy Credentials
                  </button>
                </div>
              )}
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

      {/* Pack Management Modal */}
      {selectedUserForPack && (
        <div style={modalOverlay}>
          <div style={{...modal, maxWidth: '800px'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: 'var(--accent)' }}>Manage Pack - {selectedUserForPack.name}</h3>
              <button style={closeButton} onClick={() => {
                setSelectedUserForPack(null)
                setUserPackDetails(null)
              }}>×</button>
            </div>
            
            <div style={profileContent}>
              {/* Current Pack Status */}
              <div style={profileSection}>
                <h4>Current Pack Status</h4>
                {userPackDetails ? (
                  <div style={profileGrid}>
                    <div><strong>Pack:</strong> {userPackDetails.pack_name}</div>
                    <div><strong>Matches:</strong> {userPackDetails.matches_remaining}/{userPackDetails.matches_total}</div>
                    <div><strong>Requests:</strong> {userPackDetails.requests_remaining === -1 ? '∞' : userPackDetails.requests_remaining}/{userPackDetails.requests_total === -1 ? '∞' : userPackDetails.requests_total}</div>
                    <div><strong>Amount Paid:</strong> ₹{userPackDetails.amount_paid}</div>
                    <div><strong>Purchased:</strong> {formatDate(userPackDetails.purchased_at)}</div>
                    <div><strong>Expires:</strong> {userPackDetails.expires_at ? formatDate(userPackDetails.expires_at) : 'Lifetime'}</div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
                    No active pack found for this user.
                  </div>
                )}
              </div>

              {/* Assign New Pack */}
              <div style={profileSection}>
                <h4>Assign New Pack</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Pack Type</label>
                    <select id="packSelect" style={{...inputStyle, width: '100%'}}>
                      <option value="starter">Starter (5 matches, 50 requests) - ₹99</option>
                      <option value="intermediate">Intermediate (8 matches, 100 requests) - ₹199</option>
                      <option value="pro">Pro (15 matches, unlimited requests) - ₹399</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Amount Paid (₹)</label>
                    <input 
                      type="number" 
                      id="amountInput" 
                      placeholder="0" 
                      style={{...inputStyle, width: '100%'}}
                    />
                  </div>
                </div>
                <button 
                  style={{...btnPrimary, marginBottom: '16px'}}
                  onClick={() => {
                    const packSelect = document.getElementById('packSelect') as HTMLSelectElement
                    const amountInput = document.getElementById('amountInput') as HTMLInputElement
                    const packId = packSelect.value
                    const amount = parseInt(amountInput.value) || 0
                    assignPack(selectedUserForPack.id, packId, amount)
                  }}
                  disabled={packActionLoading}
                >
                  {packActionLoading ? 'Assigning...' : 'Assign Pack'}
                </button>
              </div>

              {/* Update Existing Pack */}
              {userPackDetails && (
                <div style={profileSection}>
                  <h4>Update Current Pack</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Action</label>
                      <select id="updateAction" style={{...inputStyle, width: '100%'}}>
                        <option value="extend_matches">Extend Matches</option>
                        <option value="extend_requests">Extend Requests</option>
                        <option value="reset_matches">Reset Matches</option>
                        <option value="reset_requests">Reset Requests</option>
                        <option value="extend_expiry">Extend Expiry</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Value</label>
                      <input 
                        type="number" 
                        id="updateValue" 
                        placeholder="Enter value" 
                        style={{...inputStyle, width: '100%'}}
                      />
                    </div>
                  </div>
                  <button 
                    style={{...btnSecondary, marginBottom: '16px'}}
                    onClick={() => {
                      const actionSelect = document.getElementById('updateAction') as HTMLSelectElement
                      const valueInput = document.getElementById('updateValue') as HTMLInputElement
                      const action = actionSelect.value
                      const value = parseInt(valueInput.value) || 0
                      updatePack(selectedUserForPack.id, action, value)
                    }}
                    disabled={packActionLoading}
                  >
                    {packActionLoading ? 'Updating...' : 'Update Pack'}
                  </button>
                </div>
              )}

              {/* User Info */}
              <div style={profileSection}>
                <h4>User Information</h4>
                <div style={profileGrid}>
                  <div><strong>Name:</strong> {selectedUserForPack.name}</div>
                  <div><strong>WhatsApp:</strong> {selectedUserForPack.whatsapp_number}</div>
                  <div><strong>Instagram:</strong> @{selectedUserForPack.instagram_handle}</div>
                  <div><strong>Login ID:</strong> {selectedUserForPack.login_id || 'Not generated'}</div>
                  <div><strong>Status:</strong> {selectedUserForPack.status}</div>
                  <div><strong>Created:</strong> {formatDate(selectedUserForPack.created_at)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
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

const inputStyle: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid #26263a',
  borderRadius: '8px',
  padding: '8px 12px',
  color: 'var(--text)',
  fontSize: '14px',
  width: '100%'
}
