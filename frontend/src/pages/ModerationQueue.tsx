import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/AppNavbar';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Flag { reason: string; description?: string; createdAt: string; }
interface Post {
    _id: string; title: string;
    author?: { name?: string; avatar?: string };
    flags?: Flag[];
    moderationStatus?: string;
    type?: string;
    category?: string;
    updatedAt?: string;
    createdAt?: string;
}

const C = { bg: '#f8fafc', card: '#ffffff', border: '#e2e8f0', t1: '#0f172a', t2: '#475569', t3: '#94a3b8', accent: '#6366f1' };
const FLAG_REASON_COLOR: Record<string, { bg: string; text: string }> = {
    spam:         { bg: '#fff7ed', text: '#c2410c' },
    inappropriate:{ bg: '#fdf2f8', text: '#9d174d' },
    misinformation:{bg:'#fefce8', text: '#854d0e' },
    'auto-flagged':{ bg: '#f1f5f9', text: '#475569' },
};

const ModerationQueue = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const isModerator = user && (user.role === 'admin' || user.role === 'moderator');

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [resolved, setResolved] = useState(0);

    const fetchQueue = async () => {
        try {
            const res = await api.get('/moderation/posts');
            setPosts(res.data || []);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load moderation queue');
        } finally { setLoading(false); }
    };

    useEffect(() => {
        if (isModerator) fetchQueue();
        else setLoading(false);
    }, [isModerator]);

    const handleResolve = async (postId: string, status: 'approved' | 'rejected') => {
        setActionLoading(prev => ({ ...prev, [postId]: true }));
        try {
            await api.put(`/moderation/posts/${postId}`, { status, note: notes[postId] || '' });
            setPosts(prev => prev.filter(p => p._id !== postId));
            setResolved(r => r + 1);
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Failed to resolve post');
        } finally {
            setActionLoading(prev => ({ ...prev, [postId]: false }));
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid #e2e8f0', borderTopColor: C.accent, animation: 'spin 0.8s linear infinite' }} />
        </div>
    );

    if (!isModerator) return (
        <div style={{ minHeight: '100vh', background: C.bg }}>
            <Navbar />
            <div style={{ maxWidth: 520, margin: '12rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1.25rem', padding: '3rem 2rem' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛡️</div>
                    <h2 style={{ color: C.t1, fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>Restricted Area</h2>
                    <p style={{ color: C.t2, fontSize: '0.9rem', marginBottom: '1.5rem' }}>You need moderator or admin role to access this page.</p>
                    <Link to="/dashboard" style={{ padding: '0.7rem 1.75rem', borderRadius: '0.75rem', background: C.accent, color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>Back to Dashboard</Link>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '"Inter", sans-serif' }}>
            <Navbar />
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(to right, #ef4444, #f97316, #6366f1)', zIndex: 99 }} />

            <div style={{ maxWidth: 960, margin: '0 auto', padding: '7rem 1.5rem 4rem' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ef4444', marginBottom: '0.25rem' }}>Admin Panel</p>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: C.t1, letterSpacing: '-0.03em', fontFamily: '"Space Grotesk", sans-serif', margin: 0 }}>Moderation Queue 🛡️</h1>
                        <p style={{ color: C.t2, marginTop: '0.4rem', fontSize: '0.9rem' }}>Review flagged content and keep the community safe.</p>
                    </div>
                    <button onClick={fetchQueue} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.875rem', color: C.accent, background: '#eff6ff', border: `1px solid ${C.border}`, cursor: 'pointer' }}>
                        <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Refresh
                    </button>
                </div>

                {/* Stat bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
                    {[
                        { label: 'In Queue', value: posts.length, icon: '📋', color: '#f97316' },
                        { label: 'Resolved Today', value: resolved, icon: '✅', color: '#10b981' },
                        { label: 'Total Flags', value: posts.reduce((s, p) => s + (p.flags?.length || 0), 0), icon: '🚩', color: '#ef4444' },
                        { label: 'Pending', value: posts.filter(p => p.moderationStatus === 'pending').length, icon: '⏳', color: '#f59e0b' },
                    ].map(s => (
                        <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '1.1rem', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
                            <div style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: C.t1, fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '1rem 1.25rem', color: '#dc2626', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Queue */}
                {posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', background: C.card, borderRadius: '1.25rem', border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
                        <h3 style={{ color: C.t1, fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Queue is Clear!</h3>
                        <p style={{ color: C.t2, fontSize: '0.9rem' }}>No posts need review right now. Great work moderating!</p>
                    </div>
                ) : (
                    <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <AnimatePresence>
                            {posts.map((post, i) => {
                                const reasons = post.flags?.length ? post.flags.map(f => f.reason) : ['auto-flagged'];
                                const isExpanded = expanded === post._id;
                                return (
                                    <motion.div key={post._id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20, scale: 0.97 }} transition={{ delay: i * 0.03 }}
                                        style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                                        {/* Card header */}
                                        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                            {/* Author avatar */}
                                            <img src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'U')}&background=e2e8f0&color=475569&bold=true`}
                                                style={{ width: 44, height: 44, borderRadius: '50%', border: `2px solid ${C.border}`, flexShrink: 0 }} />

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                {/* Badges row */}
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                                    {post.type && <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', background: '#eff6ff', color: '#3730a3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{post.type}</span>}
                                                    {post.moderationStatus && (
                                                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', background: post.moderationStatus === 'pending' ? '#fffbeb' : '#f0fdf4', color: post.moderationStatus === 'pending' ? '#b45309' : '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                            {post.moderationStatus}
                                                        </span>
                                                    )}
                                                    {reasons.map((r, ri) => {
                                                        const rc = FLAG_REASON_COLOR[r] || FLAG_REASON_COLOR['auto-flagged'];
                                                        return <span key={ri} style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', background: rc.bg, color: rc.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🚩 {r}</span>;
                                                    })}
                                                </div>
                                                <h2 style={{ fontWeight: 800, color: C.t1, fontSize: '1rem', fontFamily: '"Space Grotesk", sans-serif', marginBottom: '0.3rem', lineHeight: 1.3 }}>{post.title}</h2>
                                                <div style={{ fontSize: '0.78rem', color: C.t3, display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                    <span>by <strong style={{ color: C.t2 }}>{post.author?.name || 'Unknown'}</strong></span>
                                                    {post.flags && post.flags.length > 0 && <span>🚩 {post.flags.length} flag{post.flags.length !== 1 ? 's' : ''}</span>}
                                                    {post.updatedAt && <span>Updated {new Date(post.updatedAt).toLocaleDateString()}</span>}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                                <Link to={`/posts/${post._id}`} target="_blank" style={{ padding: '0.45rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.78rem', fontWeight: 700, color: C.t2, background: C.bg, border: `1px solid ${C.border}`, textDecoration: 'none' }}>
                                                    View Post ↗
                                                </Link>
                                                <button onClick={() => setExpanded(isExpanded ? null : post._id)} style={{ padding: '0.45rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.78rem', fontWeight: 700, color: C.accent, background: '#eff6ff', border: `1px solid ${C.border}`, cursor: 'pointer' }}>
                                                    {isExpanded ? 'Collapse' : 'Review'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Flag details */}
                                        {post.flags && post.flags.length > 0 && (
                                            <div style={{ margin: '0 1.5rem', marginBottom: '1rem', padding: '0.875rem', background: '#fff5f5', borderRadius: '0.75rem', border: '1px solid #fecaca' }}>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ef4444', marginBottom: '0.5rem' }}>Flag Details</div>
                                                {post.flags.map((f, fi) => (
                                                    <div key={fi} style={{ fontSize: '0.82rem', color: C.t2, marginBottom: '0.25rem' }}>
                                                        <strong style={{ color: '#dc2626' }}>{f.reason}</strong>{f.description ? ` — ${f.description}` : ''} <span style={{ color: C.t3 }}>({new Date(f.createdAt).toLocaleDateString()})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Review panel (expanded) */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                    style={{ padding: '0 1.5rem 1.5rem', borderTop: `1px solid ${C.border}`, paddingTop: '1.25rem' }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.t3, marginBottom: '0.75rem' }}>Moderator Note</div>
                                                    <textarea value={notes[post._id] || ''} onChange={e => setNotes(prev => ({ ...prev, [post._id]: e.target.value }))}
                                                        placeholder="Optional note (visible in edit history)..." rows={3}
                                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: `1px solid ${C.border}`, fontSize: '0.875rem', color: C.t1, outline: 'none', resize: 'vertical', fontFamily: '"Inter", sans-serif', boxSizing: 'border-box', marginBottom: '1rem' }} />
                                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                        <button onClick={() => handleResolve(post._id, 'approved')} disabled={actionLoading[post._id]}
                                                            style={{ flex: 1, padding: '0.7rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', opacity: actionLoading[post._id] ? 0.7 : 1, boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}>
                                                            {actionLoading[post._id] ? '...' : '✓ Approve'}
                                                        </button>
                                                        <button onClick={() => handleResolve(post._id, 'rejected')} disabled={actionLoading[post._id]}
                                                            style={{ flex: 1, padding: '0.7rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', opacity: actionLoading[post._id] ? 0.7 : 1, boxShadow: '0 4px 12px rgba(239,68,68,0.25)' }}>
                                                            {actionLoading[post._id] ? '...' : '✕ Reject'}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ModerationQueue;
