import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Navbar from '../components/AppNavbar';

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    ),
    title: 'Rich Articles & Posts', 
    description: 'Share knowledge through beautifully formatted posts with code, images, and rich media.',
    color: 'from-cyan-500 to-blue-500',
    glow: 'rgba(6, 182, 212, 0.3)'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
    title: 'Learning Paths',
    description: 'Curate step-by-step journeys to guide your team through complex technical topics.',
    color: 'from-purple-500 to-pink-500',
    glow: 'rgba(168, 85, 247, 0.3)'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
    title: 'Live Community Rooms',
    description: 'Join real-time topic-based chat rooms for focused discussions and collaboration.',
    color: 'from-emerald-500 to-cyan-500',
    glow: 'rgba(16, 185, 129, 0.3)'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: 'Polls & Insights',
    description: 'Gather team opinions with interactive polls and visualization of results in real-time.',
    color: 'from-orange-500 to-red-500',
    glow: 'rgba(249, 115, 22, 0.3)'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
      </svg>
    ),
    title: 'Project Gallery',
    description: 'Showcase your work, get feedback, and find collaborators across the platform.',
    color: 'from-violet-500 to-purple-500',
    glow: 'rgba(139, 92, 246, 0.3)'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    ),
    title: 'Leaderboard & Reputation',
    description: 'Earn points for contributions. Rise through the ranks and build your expert profile.',
    color: 'from-yellow-500 to-orange-500',
    glow: 'rgba(234, 179, 8, 0.3)'
  },
];

const stats = [
  { value: '2,400+', label: 'Active Members', icon: '👥' },
  { value: '12,500+', label: 'Posts Shared', icon: '📝' },
  { value: '340+', label: 'Learning Paths', icon: '🗺️' },
  { value: '900+', label: 'Projects', icon: '🚀' },
];

// Particle component
function Particle({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `rgba(6, 182, 212, ${Math.random() * 0.5 + 0.1})`,
        boxShadow: `0 0 ${size * 2}px rgba(6, 182, 212, 0.5)`,
        animation: `float ${8 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

function Home() {
  const auth = React.useContext(AuthContext);
  const user = auth?.user ?? null;
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 8,
    }))
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#f1f5f9', fontFamily: '"Inter", sans-serif', overflowX: 'hidden' }}>
      
      {/* ─── Cosmic Background ─── */}
      <div className="cosmic-bg">
        <div className="cosmic-orb cosmic-orb-1" />
        <div className="cosmic-orb cosmic-orb-2" />
        <div className="cosmic-orb cosmic-orb-3" />
        <div className="grid-texture" />
        {/* Particles */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {particles.map(p => <Particle key={p.id} {...p} />)}
        </div>
      </div>

      {/* ─── NAVBAR ─── */}
      <Navbar links={[
          { to: '#features', label: 'Features', isAnchor: true, icon: '⚡' },
          { to: '#stats', label: 'Impact', isAnchor: true, icon: '📈' },
      ]} />

      {/* ─── HERO SECTION ─── */}
      <section ref={heroRef} style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '6rem 1.5rem 4rem', position: 'relative', zIndex: 10 }}>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Pill badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
            borderRadius: '999px', padding: '0.375rem 1rem',
            fontSize: '0.8rem', color: '#67e8f9', fontWeight: 700,
            letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '2.5rem'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 8px #06b6d4', animation: 'glow-pulse 2s ease-in-out infinite', display: 'inline-block' }} />
            Platform v2.0 — Now Live
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 900, lineHeight: 1.05,
            letterSpacing: '-0.03em',
            maxWidth: '900px', margin: '0 auto 1.5rem',
            fontFamily: '"Space Grotesk", sans-serif'
          }}>
            Your team's intelligence,{' '}
            <span className="text-gradient-hero">finally unified.</span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: '#64748b', maxWidth: '600px', lineHeight: 1.7,
            margin: '0 auto 3.5rem', fontWeight: 400
          }}>
            Create, discover, and share knowledge across your engineering org — with posts, learning paths, live community, and powerful search.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <motion.button
              onClick={() => navigate(user ? '/dashboard' : '/register')}
              className="btn-primary"
              style={{ padding: '0.9rem 2.5rem', fontSize: '1rem', borderRadius: '1rem' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>{user ? '🚀 Open Workspace' : '✨ Get Started Free'}</span>
            </motion.button>
            <motion.button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary"
              style={{ padding: '0.9rem 2.5rem', fontSize: '1rem', borderRadius: '1rem' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              See How It Works
            </motion.button>
          </div>

          {/* Social proof */}
          <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex' }}>
              {[1,2,3,4,5].map(i => (
                <img key={i} src={`https://i.pravatar.cc/40?img=${i + 20}`}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(6,182,212,0.3)', marginLeft: i > 1 ? -8 : 0 }} />
              ))}
            </div>
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Joined by <strong style={{ color: '#67e8f9' }}>2,400+</strong> engineers
            </span>
          </div>
        </motion.div>
      </section>

      {/* ─── MOCK DASHBOARD PREVIEW ─── */}
      <section style={{ padding: '0 1.5rem 6rem', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: '1000px', margin: '0 auto' }}
        >
          {/* Browser chrome */}
          <div style={{
            borderRadius: '1.25rem', overflow: 'hidden',
            border: '1px solid rgba(100,160,255,0.15)',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(6,182,212,0.1)',
          }}>
            {/* Chrome header */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)', height: 44,
              display: 'flex', alignItems: 'center', padding: '0 1.25rem', gap: '0.5rem',
              borderBottom: '1px solid rgba(100,160,255,0.1)'
            }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(239,68,68,0.7)' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(251,191,36,0.7)' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(52,211,153,0.7)' }} />
              <div style={{
                flex: 1, marginLeft: '1rem', height: 26, borderRadius: 6,
                background: 'rgba(30,41,59,0.8)', display: 'flex', alignItems: 'center',
                padding: '0 0.75rem', gap: '0.5rem'
              }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(6,182,212,0.5)' }} />
                <span style={{ color: '#475569', fontSize: '0.75rem' }}>knowledgeshare.app/dashboard</span>
              </div>
            </div>
            {/* Dashboard mock content */}
            <div style={{ background: 'rgba(10, 15, 30, 0.95)', padding: '1.5rem', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', minHeight: 280 }}>
              {/* Sidebar mock */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { w: '70%', c: 'rgba(6,182,212,0.8)' },
                  { w: '55%', c: 'rgba(100,160,255,0.3)' },
                  { w: '80%', c: 'rgba(100,160,255,0.3)' },
                  { w: '60%', c: 'rgba(100,160,255,0.3)' },
                  { w: '75%', c: 'rgba(100,160,255,0.3)' },
                ].map((item, i) => (
                  <div key={i} style={{ height: 10, width: item.w, background: item.c, borderRadius: 999, opacity: 0.7 }} />
                ))}
              </div>
              {/* Main content mock */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
                  {['rgba(6,182,212,0.1)', 'rgba(168,85,247,0.1)', 'rgba(16,185,129,0.1)'].map((bg, i) => (
                    <div key={i} style={{ height: 50, borderRadius: 10, background: bg, border: `1px solid ${bg.replace('0.1', '0.3')}` }} />
                  ))}
                </div>
                {[1,2,3].map(i => (
                  <div key={i} style={{ height: 52, borderRadius: 10, background: 'rgba(22, 33, 62, 0.6)', border: '1px solid rgba(100,160,255,0.08)', padding: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `rgba(${i===1?'6,182,212':i===2?'168,85,247':'16,185,129'},0.4)`, flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ height: 8, width: `${55 + i * 10}%`, background: 'rgba(148,163,184,0.4)', borderRadius: 4 }} />
                      <div style={{ height: 6, width: `${40 + i * 5}%`, background: 'rgba(100,116,139,0.3)', borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section id="stats" style={{ position: 'relative', zIndex: 10, padding: '4rem 1.5rem', borderTop: '1px solid rgba(100,160,255,0.08)', borderBottom: '1px solid rgba(100,160,255,0.08)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2.5rem', textAlign: 'center' }}>
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div style={{
                fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em',
                background: 'linear-gradient(135deg, #67e8f9, #a5b4fc)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                fontFamily: '"Space Grotesk", sans-serif', marginBottom: '0.25rem'
              }}>{s.value}</div>
              <div style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" style={{ padding: '8rem 1.5rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '5rem' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)',
            borderRadius: '999px', padding: '0.375rem 1rem',
            fontSize: '0.8rem', color: '#c084fc', fontWeight: 700,
            letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1.5rem'
          }}>
            ⚡ Everything You Need
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900,
            letterSpacing: '-0.03em', marginBottom: '1.5rem',
            fontFamily: '"Space Grotesk", sans-serif'
          }}>
            Built for highly effective teams
          </h2>
          <p style={{ color: '#475569', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
            Our suite of tools ensures important information is never lost and always discoverable by the people who need it.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="glass-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              style={{ padding: '2rem', cursor: 'default' }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: '1rem', marginBottom: '1.25rem',
                background: `linear-gradient(135deg, ${f.glow.replace('0.3', '0.15')}, transparent)`,
                border: `1px solid ${f.glow.replace('0.3', '0.2')}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: f.glow.includes('6, 182') ? '#06b6d4' : f.glow.includes('168, 85') ? '#a855f7' : f.glow.includes('16, 185') ? '#10b981' : f.glow.includes('249, 115') ? '#f97316' : f.glow.includes('139, 92') ? '#8b5cf6' : '#eab308'
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#e2e8f0' }}>{f.title}</h3>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section style={{ padding: '6rem 1.5rem 8rem', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}
        >
          <div style={{
            position: 'absolute', inset: -30,
            background: 'conic-gradient(from 180deg at 50% 50%, #6366f1 0deg, #06b6d4 72deg, #ec4899 144deg, #a855f7 216deg, #6366f1 360deg)',
            filter: 'blur(60px)', opacity: 0.12, borderRadius: '50%'
          }} />

          <div className="glass-premium" style={{ padding: '4rem 3rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative rings */}
            <div style={{
              position: 'absolute', top: -50, right: -50,
              width: 200, height: 200, borderRadius: '50%',
              border: '1px solid rgba(6,182,212,0.15)',
              animation: 'spin-slow 20s linear infinite'
            }} />
            <div style={{
              position: 'absolute', bottom: -30, left: -30,
              width: 140, height: 140, borderRadius: '50%',
              border: '1px solid rgba(168,85,247,0.15)',
              animation: 'spin-slow 15s linear infinite reverse'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
              <h2 style={{
                fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1rem',
                fontFamily: '"Space Grotesk", sans-serif'
              }}>
                Ready to elevate your team?
              </h2>
              <p style={{ color: '#64748b', lineHeight: 1.7, fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
                Join the platform engineered to turn your organization's scattered information into a unified, searchable knowledge engine.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.button
                  onClick={() => navigate('/register')}
                  className="btn-primary"
                  style={{ padding: '0.9rem 2.5rem', fontSize: '1rem', borderRadius: '1rem' }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span>Start for Free →</span>
                </motion.button>
                <motion.button
                  onClick={() => navigate('/login')}
                  className="btn-secondary"
                  style={{ padding: '0.9rem 2rem', fontSize: '1rem', borderRadius: '1rem' }}
                  whileHover={{ scale: 1.03 }}
                >
                  Sign In
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        borderTop: '1px solid rgba(100,160,255,0.08)',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        color: '#334155',
        fontSize: '0.85rem',
        position: 'relative', zIndex: 10
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {['Terms of Service', 'Privacy Policy', 'Help Center', 'Contact'].map(link => (
              <Link key={link} to={`/${link.toLowerCase().replace(/ /g, '-')}`}
                style={{ color: '#334155', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#67e8f9'}
                onMouseLeave={e => e.currentTarget.style.color = '#334155'}>
                {link}
              </Link>
            ))}
          </div>
          <p>© {new Date().getFullYear()} Knowledge Share Portal — Engineered for teams that win.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
