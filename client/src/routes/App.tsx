import { Link } from 'react-router-dom'

export function App() {
  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="container">
        <Hero />
        <Features />
        <Benefits />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section style={{
      textAlign: 'center',
      padding: '80px 20px',
      color: 'white'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <span style={{fontSize: '64px'}}>💕</span>
        <h1 style={{
          fontSize: '72px',
          margin: 0,
          fontWeight: 800,
          background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Whispyr
        </h1>
      </div>
      
      <h2 style={{
        fontSize: '32px',
        fontWeight: 700,
        margin: '0 0 24px 0',
        maxWidth: '800px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        Find Your Perfect Match Through Words, Not Photos
      </h2>
      
      <p style={{
        fontSize: '20px',
        color: 'rgba(255,255,255,0.9)',
        maxWidth: '600px',
        margin: '0 auto 40px',
        lineHeight: 1.6
      }}>
        Experience authentic connections in a photo-free environment. Share your story, discover others, and connect when hearts align. ✨
      </p>
      
      <div style={{display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap'}}>
        <Link to="/register" style={{
          ...btnPrimary,
          fontSize: '18px',
          padding: '16px 32px',
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
          boxShadow: '0 8px 24px rgba(255,107,107,0.3)',
          transform: 'translateY(0)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(255,107,107,0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,107,107,0.3)'
        }}>
          💖 Start Your Journey
        </Link>
        <Link to="/login" style={{
          ...btnGhost,
          fontSize: '18px',
          padding: '16px 32px',
          border: '2px solid rgba(255,255,255,0.3)',
          background: 'rgba(255,255,255,0.1)',
          color: 'white',
          backdropFilter: 'blur(10px)'
        }}>
          🔑 Login
        </Link>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    {
      icon: '💭',
      title: 'Words Over Photos',
      description: 'Connect through meaningful conversations, not superficial appearances'
    },
    {
      icon: '🛡️',
      title: 'Safe & Verified',
      description: 'Manual profile verification ensures authentic, genuine connections'
    },
    {
      icon: '💌',
      title: 'Thoughtful Requests',
      description: 'Send personalized connection requests that show your genuine interest'
    },
    {
      icon: '💕',
      title: 'Mutual Matching',
      description: 'Chat only opens when both hearts are interested - no unwanted messages'
    }
  ]

  return (
    <section style={{
      padding: '80px 20px',
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '24px',
      margin: '40px 0',
      backdropFilter: 'blur(20px)'
    }}>
      <div style={{textAlign: 'center', marginBottom: '60px'}}>
        <h2 style={{fontSize: '42px', fontWeight: 800, color: '#2d3748', margin: '0 0 16px 0'}}>
          Why Choose Whispyr?
        </h2>
        <p style={{fontSize: '18px', color: '#718096', maxWidth: '600px', margin: '0 auto'}}>
          Experience dating the way it should be - authentic, meaningful, and focused on what really matters.
        </p>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '32px'
      }}>
        {features.map((feature, index) => (
          <div key={index} style={{
            background: 'white',
            padding: '32px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{fontSize: '48px', marginBottom: '20px'}}>{feature.icon}</div>
            <h3 style={{fontSize: '24px', fontWeight: 700, color: '#2d3748', margin: '0 0 16px 0'}}>
              {feature.title}
            </h3>
            <p style={{fontSize: '16px', color: '#718096', lineHeight: 1.6, margin: 0}}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Benefits() {
  return (
    <section style={{
      padding: '80px 20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '24px',
      margin: '40px 0',
      color: 'white'
    }}>
      <div style={{textAlign: 'center', marginBottom: '60px'}}>
        <h2 style={{fontSize: '42px', fontWeight: 800, margin: '0 0 16px 0'}}>
          The Whispyr Difference
        </h2>
        <p style={{fontSize: '18px', opacity: 0.9, maxWidth: '600px', margin: '0 auto'}}>
          Join thousands who've found meaningful connections through our unique approach to online dating.
        </p>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px'
      }}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '64px', marginBottom: '16px'}}>🎯</div>
          <h3 style={{fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0'}}>Quality Over Quantity</h3>
          <p style={{fontSize: '16px', opacity: 0.9}}>Focus on meaningful connections, not endless swiping</p>
        </div>
        
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '64px', marginBottom: '16px'}}>🧠</div>
          <h3 style={{fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0'}}>Intellectual Connection</h3>
          <p style={{fontSize: '16px', opacity: 0.9}}>Connect minds first, hearts follow naturally</p>
        </div>
        
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '64px', marginBottom: '16px'}}>🌟</div>
          <h3 style={{fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0'}}>Authentic Relationships</h3>
          <p style={{fontSize: '16px', opacity: 0.9}}>Build genuine bonds based on personality and values</p>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      step: '1',
      title: 'Create Your Profile',
      description: 'Share your story, interests, and what makes you unique - no photos required!'
    },
    {
      step: '2',
      title: 'Discover & Connect',
      description: 'Browse profiles and send thoughtful connection requests to people who intrigue you'
    },
    {
      step: '3',
      title: 'Match & Chat',
      description: 'When someone accepts your request, start meaningful conversations that matter'
    },
    {
      step: '4',
      title: 'Build Something Real',
      description: 'Take your connection beyond the app and build lasting relationships'
    }
  ]

  return (
    <section style={{
      padding: '80px 20px',
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '24px',
      margin: '40px 0'
    }}>
      <div style={{textAlign: 'center', marginBottom: '60px'}}>
        <h2 style={{fontSize: '42px', fontWeight: 800, color: '#2d3748', margin: '0 0 16px 0'}}>
          How Whispyr Works
        </h2>
        <p style={{fontSize: '18px', color: '#718096', maxWidth: '600px', margin: '0 auto'}}>
          Four simple steps to finding your perfect match through authentic connections.
        </p>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px'
      }}>
        {steps.map((step, index) => (
          <div key={index} style={{textAlign: 'center'}}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 800,
              margin: '0 auto 24px',
              boxShadow: '0 8px 24px rgba(255,107,107,0.3)'
            }}>
              {step.step}
            </div>
            <h3 style={{fontSize: '24px', fontWeight: 700, color: '#2d3748', margin: '0 0 16px 0'}}>
              {step.title}
            </h3>
            <p style={{fontSize: '16px', color: '#718096', lineHeight: 1.6}}>
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah M.',
      text: "Finally, a dating app that values personality over photos! I found my partner here after months of meaningless swipes elsewhere. 💕",
      location: 'Mumbai'
    },
    {
      name: 'Rahul K.',
      text: "The connection requests feature is brilliant. No more awkward first messages - you actually get to know someone first!",
      location: 'Delhi'
    },
    {
      name: 'Priya S.',
      text: "I was skeptical about photo-free dating, but it's amazing how much deeper conversations become when looks don't matter.",
      location: 'Bangalore'
    }
  ]

  return (
    <section style={{
      padding: '80px 20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '24px',
      margin: '40px 0',
      color: 'white'
    }}>
      <div style={{textAlign: 'center', marginBottom: '60px'}}>
        <h2 style={{fontSize: '42px', fontWeight: 800, margin: '0 0 16px 0'}}>
          Success Stories
        </h2>
        <p style={{fontSize: '18px', opacity: 0.9}}>
          Real people, real connections, real love stories ✨
        </p>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '32px'
      }}>
        {testimonials.map((testimonial, index) => (
          <div key={index} style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '32px',
            borderRadius: '20px',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <p style={{
              fontSize: '16px',
              lineHeight: 1.6,
              margin: '0 0 20px 0',
              fontStyle: 'italic'
            }}>
              "{testimonial.text}"
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <strong style={{fontSize: '16px'}}>{testimonial.name}</strong>
              <span style={{fontSize: '14px', opacity: 0.8}}>{testimonial.location}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section style={{
      textAlign: 'center',
      padding: '80px 20px',
      color: 'white'
    }}>
      <h2 style={{
        fontSize: '48px',
        fontWeight: 800,
        margin: '0 0 24px 0'
      }}>
        Ready to Find Your Perfect Match?
      </h2>
      <p style={{
        fontSize: '20px',
        opacity: 0.9,
        maxWidth: '600px',
        margin: '0 auto 40px'
      }}>
        Join Whispyr today and start building meaningful connections that go beyond the surface. Your soulmate is waiting! 💕
      </p>
      
      <div style={{display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap'}}>
        <Link to="/register" style={{
          ...btnPrimary,
          fontSize: '20px',
          padding: '18px 36px',
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
          boxShadow: '0 8px 24px rgba(255,107,107,0.3)'
        }}>
          💖 Join Whispyr Now
        </Link>
      </div>
      
      <div style={{
        marginTop: '60px',
        padding: '40px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '20px',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '40px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{fontSize: '32px', fontWeight: 800, marginBottom: '8px'}}>10K+</div>
            <div style={{fontSize: '14px', opacity: 0.8}}>Happy Members</div>
          </div>
          <div>
            <div style={{fontSize: '32px', fontWeight: 800, marginBottom: '8px'}}>500+</div>
            <div style={{fontSize: '14px', opacity: 0.8}}>Success Stories</div>
          </div>
          <div>
            <div style={{fontSize: '32px', fontWeight: 800, marginBottom: '8px'}}>95%</div>
            <div style={{fontSize: '14px', opacity: 0.8}}>Satisfaction Rate</div>
          </div>
          <div>
            <div style={{fontSize: '32px', fontWeight: 800, marginBottom: '8px'}}>24/7</div>
            <div style={{fontSize: '14px', opacity: 0.8}}>Support Available</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Card({children}:{children:React.ReactNode}){
  return (
    <div style={{background:'var(--card)',border:'1px solid #26263a',borderRadius:16,padding:20,boxShadow:'0 10px 30px rgba(0,0,0,.3)'}}>
      {children}
    </div>
  )
}

const btnPrimary: React.CSSProperties = {
  background:'linear-gradient(135deg,var(--accent),var(--accent2))',
  padding:'12px 18px',
  borderRadius:12,
  color:'white',
  fontWeight:700
}
const btnGhost: React.CSSProperties = {
  padding:'12px 18px',
  borderRadius:12,
  color:'var(--text)',
  border:'1px solid #2e2e40'
}



