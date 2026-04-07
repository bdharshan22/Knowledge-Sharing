import { useState, useContext } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Register = () => {
  const { login } = useContext(AuthContext)!;
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const getPasswordStrength = (pw: string) => {
    if (pw.length === 0) return { label: '', score: 0, color: '' };
    if (pw.length < 6) return { label: 'Weak', score: 1, color: '#ef4444' };
    if (pw.length < 8 || !/[A-Z]/.test(pw)) return { label: 'Fair', score: 2, color: '#f97316' };
    if (!/[0-9]/.test(pw)) return { label: 'Good', score: 3, color: '#3b82f6' };
    return { label: 'Strong', score: 4, color: '#10b981' };
  };

  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (!agreed) { setError('Please agree to the Terms of Service.'); return; }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setSuccess('Account created! Redirecting to your workspace...');
      const { token, ...userData } = data;
      login(token, userData);
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
      {/* ─── Cosmic Background ─── */}
      <div className="cosmic-bg">
        <div className="cosmic-orb cosmic-orb-1" />
        <div className="cosmic-orb cosmic-orb-2" />
        <div className="cosmic-orb cosmic-orb-3" />
        <div className="grid-texture" />
      </div>

      {/* ─── Form panel ─── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.5rem', position: 'relative', zIndex: 10
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: 460 }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '1.75rem' }}>
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
            <h1 style={{
              fontSize: '1.875rem', fontWeight: 800, color: '#f1f5f9',
              letterSpacing: '-0.02em', marginBottom: '0.5rem',
              fontFamily: '"Space Grotesk", sans-serif'
            }}>Create your account</h1>
            <p style={{ color: '#475569', fontSize: '0.95rem' }}>
              Join thousands of knowledge sharers
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
            {/* Alerts */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '1.25rem', padding: '0.875rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.875rem', color: '#fca5a5', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚠️ {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '1.25rem', padding: '0.875rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '0.875rem', color: '#6ee7b7', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ✅ {success}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#334155' }}>
                    <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <input id="register-name" type="text" required value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe" className="form-input" style={{ paddingLeft: '2.75rem' }} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#334155' }}>
                    <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <input id="register-email" type="email" required autoComplete="email"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com" className="form-input" style={{ paddingLeft: '2.75rem' }} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#334155' }}>
                    <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input id="register-password" type={showPassword ? 'text' : 'password'} required
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters" className="form-input"
                    style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#334155', cursor: 'pointer', padding: '0.25rem' }}>
                    {showPassword ? (
                      <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
                {/* Strength bar */}
                {form.password && (
                  <div style={{ marginTop: '0.625rem' }}>
                    <div style={{ height: 4, background: 'rgba(100,116,139,0.2)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 999,
                        width: `${(strength.score / 4) * 100}%`,
                        background: strength.color,
                        transition: 'width 0.35s ease, background 0.35s ease'
                      }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                      Strength: <span style={{ color: strength.color, fontWeight: 700 }}>{strength.label}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: form.confirmPassword && form.password !== form.confirmPassword ? '#f87171' : '#334155' }}>
                    <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <input id="register-confirm-password"
                    type={showPassword ? 'text' : 'password'} required
                    value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Re-enter your password" className="form-input"
                    style={{
                      paddingLeft: '2.75rem',
                      borderColor: form.confirmPassword && form.password !== form.confirmPassword ? 'rgba(239,68,68,0.4)' : undefined
                    }} />
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.25rem' }}>Passwords don't match</p>
                )}
              </div>

              {/* Terms checkbox */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}>
                <div style={{ position: 'relative', marginTop: '0.125rem', flexShrink: 0 }}>
                  <input
                    id="register-terms" type="checkbox" checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    width: 18, height: 18, borderRadius: '5px',
                    border: `2px solid ${agreed ? '#06b6d4' : 'rgba(100,160,255,0.2)'}`,
                    background: agreed ? 'rgba(6,182,212,0.15)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}>
                    {agreed && <svg style={{ width: 11, height: 11, color: '#06b6d4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </div>
                <span style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
                  I agree to the{' '}
                  <Link to="/terms" style={{ color: '#06b6d4', fontWeight: 600, textDecoration: 'none' }}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" style={{ color: '#06b6d4', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</Link>
                </span>
              </label>

              {/* Submit */}
              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%', marginTop: '0.25rem', padding: '0.875rem',
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
                      Creating account...
                    </>
                  ) : 'Create Account →'}
                </span>
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(100,160,255,0.08)' }} />
              <span style={{ color: '#334155', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Already a member?</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(100,160,255,0.08)' }} />
            </div>

            <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.9rem' }}>
              Have an account?{' '}
              <Link to="/login" style={{ color: '#06b6d4', fontWeight: 700, textDecoration: 'none' }}>
                Sign in →
              </Link>
            </p>
          </div>

          <p style={{ textAlign: 'center', color: '#1e293b', fontSize: '0.75rem', marginTop: '1.5rem' }}>
            © {new Date().getFullYear()} KnowledgeShare. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
