import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const features = [
  { icon: '📝', title: 'Posts & Articles', description: 'Share knowledge through rich-text posts, articles, and tutorials with the community.' },
  { icon: '🗺️', title: 'Learning Paths', description: 'Curate step-by-step learning journeys to guide peers through complex topics.' },
  { icon: '📊', title: 'Polls & Surveys', description: 'Gather insights and opinions with interactive polls from your colleagues.' },
  { icon: '🏠', title: 'Rooms', description: 'Join topic-based rooms for focused discussions and real-time collaboration.' },
  { icon: '🚀', title: 'Projects', description: 'Showcase and collaborate on projects, share progress and invite contributors.' },
  { icon: '👥', title: 'Community', description: 'Connect with experts, mentors, and peers across your organization.' },
];
const stats = [
  { label: 'Active Users', value: '2,400+' },
  { label: 'Posts Shared', value: '12,500+' },
  { label: 'Learning Paths', value: '340+' },
  { label: 'Projects', value: '900+' },
];

import { useTheme } from '../context/ThemeContext';

function Home() {
  const auth = React.useContext(AuthContext);
  const user = auth?.user ?? null;
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: isDark ? '#020617' : '#fcfcfd', 
      color: isDark ? '#f1f5f9' : '#0f172a', 
      fontFamily: '"Inter", sans-serif', 
      overflowX: 'hidden',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      
      {/* Soft Pastel Animated Mesh Background (Light/Dark Theme) */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '50vw', height: '50vw', background: isDark ? 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'float 20s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '60vw', height: '60vw', background: isDark ? 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'float 25s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', top: '30%', right: '20%', width: '40vw', height: '40vw', background: isDark ? 'radial-gradient(circle, rgba(236,72,153,0.03) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'pulse 15s ease-in-out infinite' }} />
        
        {/* Subtle grid for professional feel */}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at center, transparent 0%, ${isDark ? '#020617' : '#fcfcfd'} 100%), url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='${isDark ? '%23ffffff' : '%23000000'}' fill-opacity='${isDark ? '0.01' : '0.02'}' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />
      </div>

      {/* NAVBAR */}
      <nav style={{ 
        background: isDark ? 'rgba(2, 6, 23, 0.8)' : 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(16px)', 
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, 
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        padding: '0 2rem',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '75px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>KS</div>
            <span style={{ fontWeight: 800, fontSize: '1.3rem', color: isDark ? '#f1f5f9' : '#0f172a', letterSpacing: '-0.5px' }}>KnowledgeShare</span>
          </Link>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a href="#features" style={{ color: isDark ? '#94a3b8' : '#475569', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = isDark ? '#fff' : '#0f172a'} onMouseLeave={e => e.currentTarget.style.color = isDark ? '#94a3b8' : '#475569'}>Features</a>
            <a href="#stats" style={{ color: isDark ? '#94a3b8' : '#475569', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = isDark ? '#fff' : '#0f172a'} onMouseLeave={e => e.currentTarget.style.color = isDark ? '#94a3b8' : '#475569'}>Impact</a>
            
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              style={{ 
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', 
                border: 'none', 
                borderRadius: '12px', 
                width: '40px', 
                height: '40px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                color: isDark ? '#fbbf24' : '#64748b'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
              )}
            </button>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: '1rem', borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, paddingLeft: '1.5rem' }}>
                <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.95rem', fontWeight: 600 }}>Hello, <span style={{ color: isDark ? '#fff' : '#0f172a' }}>{user.name.split(" ")[0]}</span></span>
                <button onClick={() => navigate('/dashboard')} style={{ background: isDark ? '#f8fafc' : '#0f172a', color: isDark ? '#020617' : '#fff', border: 'none', borderRadius: '10px', padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(0,0,0,0.15)', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)'; }}>App Dashboard</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', marginLeft: '1rem', borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, paddingLeft: '1.5rem' }}>
                <button onClick={() => navigate('/login')} style={{ background: 'transparent', color: isDark ? '#94a3b8' : '#475569', border: 'none', padding: '10px 16px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = isDark ? '#fff' : '#0f172a'} onMouseLeave={e => e.currentTarget.style.color = isDark ? '#94a3b8' : '#475569'}>Log in</button>
                <button onClick={() => navigate('/register')} style={{ background: isDark ? '#f8fafc' : '#0f172a', color: isDark ? '#020617' : '#fff', border: 'none', borderRadius: '10px', padding: '10px 28px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)'; }}>Sign Up</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem', position: 'relative', zIndex: 10 }}>
        
        {/* Release Pill */}
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          background: isDark ? 'rgba(255,255,255,0.03)' : '#fff', 
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`, 
          borderRadius: '999px', 
          padding: '6px 16px', 
          fontSize: '0.85rem', 
          color: isDark ? '#94a3b8' : '#475569', 
          marginBottom: '2.5rem', 
          boxShadow: '0 4px 14px rgba(0,0,0,0.03)', 
          fontWeight: 600, 
          cursor: 'pointer', 
          transition: 'all 0.3s' 
        }} onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : '#fff'}>
          <span style={{ width: 20, height: 20, background: isDark ? '#1e293b' : '#e0e7ff', color: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✦</span>
          Introducing KnowledgeShare 2.0
        </div>
        
        <h1 style={{ fontSize: 'clamp(3.5rem, 8vw, 5.5rem)', color: isDark ? '#f8fafc' : '#020617', fontWeight: 900, lineHeight: 1.05, maxWidth: '900px', marginBottom: '1.5rem', letterSpacing: '-2px', transition: 'color 0.3s' }}>
          Your team's intelligence, <br/>
          <span style={{ color: '#2563eb' }}>finally unified.</span>
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: isDark ? '#94a3b8' : '#475569', maxWidth: '650px', lineHeight: 1.6, marginBottom: '3rem', fontWeight: 500, transition: 'color 0.3s' }}>
          Create, organize, and discover documentation effortlessly. Say goodbye to scattered wiki pages and endless chat threads. 
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => navigate(user ? '/dashboard' : '/register')} style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '16px 36px', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 25px rgba(79,70,229,0.3)', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(79,70,229,0.4)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(79,70,229,0.3)'; }}>
            {user ? 'Open Workspace' : 'Get Started'}
          </button>
          
          <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: isDark ? 'transparent' : '#fff', color: isDark ? '#f1f5f9' : '#0f172a', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '12px', padding: '16px 36px', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', boxShadow: isDark ? 'none' : '0 4px 14px rgba(0,0,0,0.05)', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'transparent' : '#fff'; e.currentTarget.style.transform = 'none'; }}>
            See How It Works
          </button>
        </div>
      </section>

      {/* PREMIUM DASHBOARD PREVIEW ELEMENT */}
      <section style={{ padding: '0 2rem 6rem', position: 'relative', zIndex: 20 }}>
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto', 
          background: isDark ? '#0f172a' : '#fff', 
          borderRadius: '24px', 
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'}`, 
          boxShadow: isDark ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 25px 50px -12px rgba(0,0,0,0.1)', 
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}>
            <div style={{ height: '40px', background: isDark ? '#1e293b' : '#f8fafc', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: '8px' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f87171' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fbbf24' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#34d399' }} />
            </div>
            <div style={{ padding: '40px', display: 'flex', gap: '30px' }}>
                <div style={{ width: '25%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ height: 20, width: '80%', background: isDark ? '#1e293b' : '#f1f5f9', borderRadius: 4 }} />
                    <div style={{ height: 20, width: '60%', background: isDark ? '#1e293b' : '#f1f5f9', borderRadius: 4 }} />
                    <div style={{ height: 20, width: '90%', background: isDark ? '#1e293b' : '#f1f5f9', borderRadius: 4 }} />
                    <div style={{ height: 20, width: '50%', background: isDark ? '#1e293b' : '#f1f5f9', borderRadius: 4 }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ height: 40, width: '50%', background: isDark ? '#334155' : '#e2e8f0', borderRadius: 6 }} />
                    <div style={{ height: 100, width: '100%', background: isDark ? 'rgba(34, 197, 94, 0.05)' : '#f0fdf4', borderRadius: 12, border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.2)' : '#bbf7d0'}` }} />
                    <div style={{ height: 15, width: '100%', background: isDark ? '#1e293b' : '#f1f5f9', borderRadius: 4 }} />
                    <div style={{ height: 15, width: '100%', background: isDark ? '#1e293b' : '#f1f5f9', borderRadius: 4 }} />
                    <div style={{ height: 15, width: '80%', background: isDark ? '#1e293b' : '#f1f5f9', borderRadius: 4 }} />
                </div>
            </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section id="stats" style={{ padding: '4rem 2rem', background: isDark ? 'rgba(15, 23, 42, 0.5)' : '#fff', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, transition: 'all 0.3s ease' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '3rem', textAlign: 'center' }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: isDark ? '#f8fafc' : '#0f172a', marginBottom: '0.2rem', letterSpacing: '-1px' }}>{s.value}</div>
              <div style={{ color: isDark ? '#64748b' : '#64748b', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CLEAN FEATURES SECTION */}
      <section id="features" style={{ padding: '8rem 2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: isDark ? '#f8fafc' : '#020617', marginBottom: '1.5rem', letterSpacing: '-1px' }}>Built for highly effective teams</h2>
          <p style={{ color: isDark ? '#94a3b8' : '#475569', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>Our suite of tools ensures that important information is never lost and always easily accessible.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {features.map((f) => (
            <div key={f.title} style={{ background: isDark ? '#0f172a' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '20px', padding: '2.5rem', transition: 'all 0.3s', boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 6px -1px rgba(0,0,0,0.02)' }}
                 onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 20px 25px -5px rgba(0,0,0,0.05)'; }}
                 onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 6px -1px rgba(0,0,0,0.02)'; }}>
              <div style={{ width: 56, height: 56, borderRadius: '16px', background: isDark ? 'rgba(37, 99, 235, 0.1)' : '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '1.5rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: '1rem' }}>{f.title}</h3>
              <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '1rem', lineHeight: 1.6 }}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GLOWING CTA */}
      <section style={{ padding: '8rem 2rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: -20, background: 'linear-gradient(135deg, #0cebeb, #a855f7, #6366f1)', filter: 'blur(60px)', opacity: 0.15, borderRadius: '40px' }} />
          <div style={{ background: 'rgba(15,15,30,0.8)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px', padding: '5rem 2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: 'radial-gradient(circle at top right, rgba(168,85,247,0.15), transparent 70%)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '50%', height: '100%', background: 'radial-gradient(circle at bottom left, rgba(6,182,212,0.15), transparent 70%)' }} />
            
            <h2 style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-1px', position: 'relative', zIndex: 2 }}>Ready to elevate your team?</h2>
            <p style={{ color: '#cbd5e1', marginBottom: '3rem', lineHeight: 1.7, fontSize: '1.2rem', maxWidth: '500px', margin: '0 auto 3rem auto', position: 'relative', zIndex: 2 }}>Join the platform engineered to turn your organization's scattered information into a powerful, unified knowledge engine.</p>
            <button onClick={() => navigate('/register')} style={{ background: '#fff', color: '#000', border: 'none', borderRadius: '12px', padding: '18px 48px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', position: 'relative', zIndex: 2, transition: 'all 0.3s', boxShadow: '0 10px 30px rgba(255,255,255,0.2)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(255,255,255,0.3)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(255,255,255,0.2)'; }}>
              Initialize Workspace
            </button>
          </div>
        </div>
      </section>

      <footer style={{ 
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, 
        padding: '4rem 2rem', 
        textAlign: 'center', 
        color: isDark ? '#64748b' : '#64748b', 
        fontSize: '0.9rem', 
        position: 'relative', 
        zIndex: 10, 
        background: isDark ? 'rgba(2, 6, 23, 0.95)' : 'rgba(255, 255, 255, 0.8)', 
        transition: 'all 0.3s ease' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ marginBottom: '1.5rem', color: isDark ? '#94a3b8' : '#64748b' }}>© {new Date().getFullYear()} KnowledgeShare Portal. Engineered for teams that win.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <Link to="/terms" style={{ color: isDark ? '#6366f1' : '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = isDark ? '#818cf8' : '#0f172a'} onMouseLeave={e => e.currentTarget.style.color = isDark ? '#6366f1' : '#94a3b8'}>Terms of Service</Link>
            <Link to="/privacy" style={{ color: isDark ? '#6366f1' : '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = isDark ? '#818cf8' : '#0f172a'} onMouseLeave={e => e.currentTarget.style.color = isDark ? '#6366f1' : '#94a3b8'}>Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
