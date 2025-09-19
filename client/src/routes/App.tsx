import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export function App() {
  return (
    <>
      <Helmet>
        <title>Snift — Character Finds Connection | No Photo Dating App</title>
        <meta name="description" content="Snift is a unique dating app where character finds connection. No photos, just meaningful conversations and emotional connections. Join thousands finding authentic relationships through words, not appearances." />
        <meta name="keywords" content="conversation first dating, no photo dating app, emotional connections, character based dating, meaningful relationships, authentic dating, personality dating, text based dating, intellectual dating, deep connections" />
        <link rel="canonical" href="https://thesnift.com/" />
        
        <meta property="og:title" content="Snift — Character Finds Connection | No Photo Dating App" />
        <meta property="og:description" content="Experience authentic connections in a photo-free environment. Share your story, discover others, and connect when hearts align. Join Snift for meaningful relationships." />
        <meta property="og:url" content="https://thesnift.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://thesnift.com/og-image.jpg" />
        
        <meta property="twitter:title" content="Snift — Character Finds Connection | No Photo Dating App" />
        <meta property="twitter:description" content="Experience authentic connections in a photo-free environment. Share your story, discover others, and connect when hearts align." />
        <meta property="twitter:url" content="https://thesnift.com/" />
        <meta property="twitter:image" content="https://thesnift.com/og-image.jpg" />
      </Helmet>
      <div className="bg-background min-h-screen">
      <div className="container">
        <Hero />
        <Features />
        <Benefits />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </div>
      </div>
    </>
  )
}

function Hero() {
  return (
    <section className="text-center py-20 px-5 animate-fade-in">
      <div className="flex items-center justify-center gap-4 mb-8">
        <span className="text-6xl">💕</span>
        <h1 className="font-heading text-6xl md:text-7xl font-black text-primary m-0">
          Snift
        </h1>
      </div>
      
      <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6 max-w-4xl mx-auto">
        Character Finds Connection
      </h2>
      
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
        Experience authentic connections in a photo-free environment. Share your story, discover others, and connect when hearts align. ✨
      </p>
      
      <div className="flex gap-5 justify-center flex-wrap">
        <Link 
          to="/register" 
          className="bg-primary text-primary-foreground font-bold px-8 py-4 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          💖 Start Your Journey
        </Link>
        <Link 
          to="/login" 
          className="border-2 border-primary text-primary font-bold px-8 py-4 rounded-lg text-lg bg-transparent hover:bg-primary hover:text-primary-foreground transition-all duration-300"
        >
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
    <section className="py-20 px-5 bg-card rounded-3xl my-10 animate-slide-up">
      <div className="text-center mb-15">
        <h2 className="font-heading text-4xl md:text-5xl font-black text-card-foreground mb-4">
          Why Choose Snift?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience dating the way it should be - authentic, meaningful, and focused on what really matters.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="bg-background p-8 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
          >
            <div className="text-5xl mb-5">{feature.icon}</div>
            <h3 className="font-heading text-2xl font-bold text-card-foreground mb-4">
              {feature.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
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
    <section className="py-20 px-5 bg-gradient-to-br from-primary to-secondary rounded-3xl my-10 text-primary-foreground animate-scale-in">
      <div className="text-center mb-15">
        <h2 className="font-heading text-4xl md:text-5xl font-black mb-4">
          The Snift Difference
        </h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          Join thousands who've found meaningful connections through our unique approach to online dating.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="font-heading text-2xl font-bold mb-2">Quality Over Quantity</h3>
          <p className="opacity-90">Focus on meaningful connections, not endless swiping</p>
        </div>
        
        <div className="text-center">
          <div className="text-6xl mb-4">🧠</div>
          <h3 className="font-heading text-2xl font-bold mb-2">Intellectual Connection</h3>
          <p className="opacity-90">Connect minds first, hearts follow naturally</p>
        </div>
        
        <div className="text-center">
          <div className="text-6xl mb-4">🌟</div>
          <h3 className="font-heading text-2xl font-bold mb-2">Authentic Relationships</h3>
          <p className="opacity-90">Build genuine bonds based on personality and values</p>
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
    <section className="py-20 px-5 bg-card rounded-3xl my-10 animate-slide-up">
      <div className="text-center mb-15">
        <h2 className="font-heading text-4xl md:text-5xl font-black text-card-foreground mb-4">
          How Snift Works
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Four simple steps to finding your perfect match through authentic connections.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {steps.map((step, index) => (
          <div key={index} className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg">
              {step.step}
            </div>
            <h3 className="font-heading text-2xl font-bold text-card-foreground mb-4">
              {step.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
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
    <section className="py-20 px-5 bg-gradient-to-br from-primary to-secondary rounded-3xl my-10 text-primary-foreground animate-scale-in">
      <div className="text-center mb-15">
        <h2 className="font-heading text-4xl md:text-5xl font-black mb-4">
          Success Stories
        </h2>
        <p className="text-lg opacity-90">
          Real people, real connections, real love stories ✨
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div 
            key={index} 
            className="bg-white bg-opacity-10 p-8 rounded-2xl backdrop-blur-lg border border-white border-opacity-20"
          >
            <p className="text-base leading-relaxed mb-5 italic">
              "{testimonial.text}"
            </p>
            <div className="flex justify-between items-center">
              <strong className="text-base">{testimonial.name}</strong>
              <span className="text-sm opacity-80">{testimonial.location}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="text-center py-20 px-5 animate-fade-in">
      <h2 className="font-heading text-5xl md:text-6xl font-black text-foreground mb-6">
        Ready to Find Your Perfect Match?
      </h2>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
        Join Snift today and start building meaningful connections that go beyond the surface. Your soulmate is waiting! 💕
      </p>
      
      <div className="flex gap-5 justify-center flex-wrap mb-15">
        <Link 
          to="/register" 
          className="bg-primary text-primary-foreground font-bold px-10 py-5 rounded-lg text-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          💖 Join Snift Now
        </Link>
      </div>
      
      <div className="bg-card p-10 rounded-2xl shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          <div>
            <div className="font-heading text-3xl font-black text-primary mb-2">10K+</div>
            <div className="text-sm text-muted-foreground">Happy Members</div>
          </div>
          <div>
            <div className="font-heading text-3xl font-black text-primary mb-2">500+</div>
            <div className="text-sm text-muted-foreground">Success Stories</div>
          </div>
          <div>
            <div className="font-heading text-3xl font-black text-primary mb-2">95%</div>
            <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
          </div>
          <div>
            <div className="font-heading text-3xl font-black text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Support Available</div>
          </div>
        </div>
      </div>
    </section>
  )
}



