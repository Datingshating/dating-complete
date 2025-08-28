import { useEffect, useState } from 'react'

type Pending = { id:string; name:string; gender:string; date_of_birth:string; whatsapp_number:string; instagram_handle:string; bio:string; relationship_status:string; interest_1:string; interest_1_desc:string; interest_2:string; interest_2_desc:string; interest_3:string; interest_3_desc:string }

export function Admin(){
  const [items,setItems]=useState<Pending[]>([])
  const [cred,setCred]=useState<{loginId:string;password:string}|undefined>()
  const token = localStorage.getItem('authToken') || ''
  
  useEffect(()=>{ (async()=>{
    const r = await fetch(import.meta.env.VITE_API_URL + '/api/admin/pending', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    setItems(await r.json())
  })() },[token])

  async function approve(userId:string){
    const r = await fetch(import.meta.env.VITE_API_URL + '/api/admin/approve',{
      method:'POST', 
      headers:{
        'Authorization': `Bearer ${token}`,
        'Content-Type':'application/json'
      }, 
      body: JSON.stringify({userId})
    })
    const data = await r.json();
    if(r.ok){ setCred(data.credentials); setItems(items.filter(i=>i.id!==userId)) }
    else alert(data?.error||'Failed')
  }

  return (
    <div className="container">
      <h2>Admin Panel</h2>
      <div style={{display:'grid',gap:12}}>
        {items.map(p=> (
          <div key={p.id} style={card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontWeight:700}}>{p.name} (@{p.instagram_handle}) — {p.whatsapp_number}</div>
              <button style={btnPrimary} onClick={()=>approve(p.id)}>Approve & Generate Credentials</button>
            </div>
            <p style={{margin:'8px 0',color:'var(--muted)'}}>{p.bio}</p>
            <small style={{color:'var(--muted)'}}>Gender: {p.gender} | Status: {p.relationship_status} | Interests: {p.interest_1}, {p.interest_2}, {p.interest_3}</small>
          </div>
        ))}
      </div>

      {cred && (
        <div style={{marginTop:16,padding:12,border:'1px solid #2d2d3f',borderRadius:12,background:'var(--card)'}}>
          <div style={{fontWeight:700}}>Credentials generated</div>
          <div>Login ID: {cred.loginId}</div>
          <div>Password: {cred.password}</div>
          <div style={{color:'var(--muted)',marginTop:6}}>Share these via WhatsApp with the user.</div>
        </div>
      )}
    </div>
  )
}

const card: React.CSSProperties = { background:'var(--card)',border:'1px solid #26263a',borderRadius:16,padding:16 }
const btnPrimary: React.CSSProperties = { background:'linear-gradient(135deg,var(--accent),var(--accent2))', padding:'10px 14px', borderRadius:12, color:'white', fontWeight:700 }



