import { useState, useContext } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const { login } = useContext(AuthContext)!;
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      const { token, ...userData } = data;
      login(token, userData);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      backgroundColor: '#020617', fontFamily: '"Inter", sans-serif',
      overflow: 'hidden', position: 'relative'
    }}>
      {/* ─── Background ─── */}
      <div className="cosmic-bg">
        <div className="cosmic-orb cosmic-orb-1" />
        <div className="cosmic-orb cosmic-orb-2" />
        <div className="grid-texture" />
      </div>

      {/* ─── Left decorative panel (desktop only) ─── */}
      <div style={{
        display: 'none', // Hidden on mobile via media query (inline style workaround)
        flex: '0 0 45%', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, rgba(99,102,241,0.08) 50%, rgba(236,72,153,0.05) 100%)'
      }} className="login-left-panel">
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '3rem'
        }}>
          {/* Animated logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: 'center', marginBottom: '3rem' }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: '24px', margin: '0 auto 1.5rem',
              background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, color: '#fff', fontSize: '2rem',
              boxShadow: '0 0 40px rgba(6,182,212,0.4), 0 0 80px rgba(99,102,241,0.2)',
              fontFamily: '"Space Grotesk", sans-serif'
            }}>KS</div>
            <h2 style={{
              fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #67e8f9, #a5b4fc, #f9a8d4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontFamily: '"Space Grotesk", sans-serif', marginBottom: '0.75rem'
            }}>KnowledgeShare</h2>
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, maxWidth: 300 }}>
              The collaborative platform where teams share knowledge and scale their culture.
            </p>
          </motion.div>

          {/* Feature list */}
          {[
            { icon: '📝', label: 'Rich posts & articles' },
            { icon: '🗺️', label: 'Curated learning paths' },
            { icon: '💬', label: 'Live community rooms' },
            { icon: '🏆', label: 'Reputation & leaderboard' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1.25rem', borderRadius: '0.75rem', marginBottom: '0.5rem',
                background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(100,160,255,0.08)',
                width: '100%', maxWidth: 300
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>{item.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Border glow */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 1,
          background: 'linear-gradient(to bottom, transparent, rgba(6,182,212,0.2), rgba(168,85,247,0.2), transparent)'
        }} />
      </div>

      {/* ─── Right: Login Form ─── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', position: 'relative', zIndex: 10
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          {/* Logo (mobile) */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '2rem' }}>
              <div style={{
                width: 42, height: 42, borderRadius: '12px',
                background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, color: '#fff', boxShadow: '0 0 20px rgba(6,182,212,0.4)',
                fontFamily: '"Space Grotesk", sans-serif'
              }}>KS</div>
              <span style={{
                fontWeight: 800, fontSize: '1.3rem',
                background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                fontFamily: '"Space Grotesk", sans-serif'
              }}>KnowledgeShare</span>
            </Link>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: '0.5rem', fontFamily: '"Space Grotesk", sans-serif' }}>
              Welcome back
            </h1>
            <p style={{ color: '#475569', fontSize: '0.95rem' }}>
              Sign in to continue to your workspace
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(100,160,255,0.12)',
            borderRadius: '1.5rem',
            padding: '2.25rem',
            boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
          }}>
            {/* Error alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginBottom: '1.5rem', padding: '0.875rem 1rem',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: '0.875rem', color: '#fca5a5', fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                <span>⚠️</span> {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#334155' }}>
                    <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="form-input"
                    style={{ paddingLeft: '2.75rem' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.01em' }}>Password</label>
                  <button type="button" style={{ background: 'none', border: 'none', color: '#06b6d4', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#334155' }}>
                    <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="form-input"
                    style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#334155', cursor: 'pointer', padding: '0.25rem', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                    onMouseLeave={e => e.currentTarget.style.color = '#334155'}
                  >
                    {showPassword ? (
                      <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%', marginTop: '0.5rem', padding: '0.875rem',
                  fontSize: '1rem', borderRadius: '0.875rem',
                  opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', position: 'relative', zIndex: 1 }}>
                  {loading ? (
                    <>
                      <svg style={{ width: 18, height: 18, animation: 'spin-slow 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                        <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Signing in...
                    </>
                  ) : 'Sign In →'}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(100,160,255,0.08)' }} />
              <span style={{ color: '#334155', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>New here?</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(100,160,255,0.08)' }} />
            </div>

            <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.9rem' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#06b6d4', fontWeight: 700, textDecoration: 'none' }}>
                Create one free →
              </Link>
            </p>
          </div>

          <p style={{ textAlign: 'center', color: '#1e293b', fontSize: '0.75rem', marginTop: '1.5rem' }}>
            © {new Date().getFullYear()} KnowledgeShare. All rights reserved.
          </p>
        </motion.div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .login-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;
