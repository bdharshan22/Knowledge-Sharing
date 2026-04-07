import { useContext, useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/AppNavbar';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Post {
    _id: string;
    title: string;
    content: string;
    excerpt?: string;
    createdAt: string;
    likes: string[];
    comments: any[];
    type: string;
    tags?: string[];
    views?: number;
    bookmarks?: string[];
}

const TYPE_COLOR: Record<string, { bg: string; text: string; border: string }> = {
    question:     { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
    article:      { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    tutorial:     { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
    discussion:   { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
    resource:     { bg: '#fefce8', text: '#854d0e', border: '#fef08a' },
    announcement: { bg: '#fdf2f8', text: '#9d174d', border: '#fbcfe8' },
};

const C = { bg: '#f8fafc', card: '#ffffff', border: '#e2e8f0', t1: '#0f172a', t2: '#475569', t3: '#94a3b8', accent: '#6366f1' };

const MyPosts = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const navigate = useNavigate();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'views'>('newest');
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/posts', { params: { author: 'me' } });
            setPosts(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to load posts', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(); }, []);

    const handleDelete = async (postId: string) => {
        if (!user) { navigate('/login'); return; }
        if (!window.confirm('Delete this post? This cannot be undone.')) return;
        setDeleting(postId);
        try {
            await api.delete(`/posts/${postId}`);
            setPosts(prev => prev.filter(p => p._id !== postId));
        } catch (err) {
            console.error('Error deleting post:', err);
        } finally {
            setDeleting(null);
        }
    };

    const displayed = useMemo(() => {
        let r = filter === 'all' ? [...posts] : posts.filter(p => p.type === filter);
        if (sortBy === 'newest') r.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        else if (sortBy === 'popular') r.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
        else if (sortBy === 'views') r.sort((a, b) => (b.views || 0) - (a.views || 0));
        return r;
    }, [posts, filter, sortBy]);

    const stats = {
        total: posts.length,
        totalLikes: posts.reduce((s, p) => s + (p.likes?.length || 0), 0),
        totalViews: posts.reduce((s, p) => s + (p.views || 0), 0),
        totalComments: posts.reduce((s, p) => s + (p.comments?.length || 0), 0),
    };

    const STAT_ITEMS = [
        { label: 'Total Posts', value: stats.total, icon: '📝', color: '#6366f1' },
        { label: 'Total Likes', value: stats.totalLikes, icon: '❤️', color: '#e11d48' },
        { label: 'Total Views', value: stats.totalViews, icon: '👁️', color: '#0284c7' },
        { label: 'Comments', value: stats.totalComments, icon: '💬', color: '#7c3aed' },
    ];

    const types = [...new Set(posts.map(p => p.type))];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: C.bg, fontFamily: '"Inter", sans-serif' }}>
            <Navbar />
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(to right, #6366f1, #06b6d4, #ec4899)', zIndex: 99 }} />

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '7rem 1.5rem 4rem' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.accent, marginBottom: '0.25rem' }}>Content Studio</p>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: C.t1, letterSpacing: '-0.03em', fontFamily: '"Space Grotesk", sans-serif', margin: 0 }}>My Posts ✏️</h1>
                        <p style={{ color: C.t2, marginTop: '0.4rem', fontSize: '0.95rem' }}>Manage everything you've published to the community.</p>
                    </div>
                    <Link to="/create-post" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', color: '#fff', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
                        <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        New Post
                    </Link>
                </div>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
                    {STAT_ITEMS.map(s => (
                        <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
                            <div style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>{s.icon}</div>
                            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: C.t1, fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.3rem' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem', background: C.card, border: `1px solid ${C.border}`, borderRadius: '0.875rem', padding: '0.625rem 0.875rem' }}>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {['all', ...types].map(t => (
                            <button key={t} onClick={() => setFilter(t)} style={{
                                padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
                                fontWeight: 700, fontSize: '0.78rem', textTransform: 'capitalize', transition: 'all 0.2s',
                                background: filter === t ? C.accent : 'transparent',
                                color: filter === t ? '#fff' : C.t2,
                            }}>{t === 'all' ? '📋 All' : t}</button>
                        ))}
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: C.t3 }}>Sort:</span>
                        {(['newest', 'popular', 'views'] as const).map(o => (
                            <button key={o} onClick={() => setSortBy(o)} style={{
                                padding: '0.35rem 0.75rem', borderRadius: '0.5rem', border: `1px solid ${sortBy === o ? C.accent : C.border}`,
                                background: sortBy === o ? '#eff6ff' : 'transparent', color: sortBy === o ? C.accent : C.t2,
                                fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', textTransform: 'capitalize'
                            }}>{o}</button>
                        ))}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: C.t3, fontWeight: 600, marginLeft: '0.5rem' }}>
                        {displayed.length} post{displayed.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Posts List */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[1,2,3].map(i => (
                            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '1.5rem', animation: 'pulse 1.5s infinite' }}>
                                <div style={{ height: 18, background: '#e2e8f0', borderRadius: 6, width: '60%', marginBottom: 10 }} />
                                <div style={{ height: 12, background: '#f1f5f9', borderRadius: 6, width: '100%', marginBottom: 6 }} />
                                <div style={{ height: 12, background: '#f1f5f9', borderRadius: 6, width: '80%' }} />
                            </div>
                        ))}
                    </div>
                ) : displayed.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: C.card, border: `1px solid ${C.border}`, borderRadius: '1.25rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✍️</div>
                        <h3 style={{ color: C.t1, fontWeight: 700, marginBottom: '0.5rem' }}>No posts yet</h3>
                        <p style={{ color: C.t2, fontSize: '0.9rem', marginBottom: '1.25rem' }}>Start sharing your knowledge with the community.</p>
                        <Link to="/create-post" style={{ padding: '0.65rem 1.75rem', borderRadius: '0.75rem', background: C.accent, color: '#fff', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
                            Write your first post →
                        </Link>
                    </div>
                ) : (
                    <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                        <AnimatePresence>
                            {displayed.map((post, i) => {
                                const ts = TYPE_COLOR[post.type] || TYPE_COLOR.article;
                                return (
                                    <motion.div key={post._id}
                                        layout
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.97 }}
                                        transition={{ delay: i * 0.04 }}
                                        style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '1.25rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', position: 'relative', overflow: 'hidden' }}
                                    >
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: ts.text }} />
                                        <div style={{ flex: 1, minWidth: 0, paddingLeft: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.06em', background: ts.bg, color: ts.text, border: `1px solid ${ts.border}` }}>
                                                    {post.type}
                                                </span>
                                                <span style={{ fontSize: '0.78rem', color: C.t3, fontWeight: 500 }}>
                                                    {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <Link to={`/posts/${post._id}`} style={{ textDecoration: 'none' }}>
                                                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: C.t1, marginBottom: '0.375rem', fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '-0.01em', cursor: 'pointer', transition: 'color 0.15s' }}
                                                    onMouseEnter={e => e.currentTarget.style.color = C.accent}
                                                    onMouseLeave={e => e.currentTarget.style.color = C.t1}>
                                                    {post.title}
                                                </h3>
                                            </Link>
                                            <p style={{ color: C.t2, fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '0.875rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                {post.excerpt || post.content?.replace(/[#*`]/g, '').slice(0, 150)}
                                            </p>
                                            {/* Metrics row */}
                                            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.82rem', color: C.t3, fontWeight: 600 }}>
                                                {[
                                                    { icon: '❤️', val: post.likes?.length || 0, label: 'likes' },
                                                    { icon: '💬', val: post.comments?.length || 0, label: 'comments' },
                                                    { icon: '👁️', val: post.views || 0, label: 'views' },
                                                    { icon: '🔖', val: post.bookmarks?.length || 0, label: 'saves' },
                                                ].map(m => (
                                                    <span key={m.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                        <span>{m.icon}</span>{m.val} {m.label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Actions */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', flexShrink: 0 }}>
                                            <Link to={`/posts/${post._id}`} style={{ padding: '0.4rem 0.875rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', color: C.accent, background: '#eff6ff', border: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>
                                                View / Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(post._id)}
                                                disabled={deleting === post._id}
                                                style={{ padding: '0.4rem 0.875rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.78rem', color: '#dc2626', background: '#fff5f5', border: '1px solid #fecaca', cursor: 'pointer', whiteSpace: 'nowrap', opacity: deleting === post._id ? 0.5 : 1 }}>
                                                {deleting === post._id ? '...' : 'Delete'}
                                            </button>
                                            {post.tags && post.tags.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', justifyContent: 'flex-end' }}>
                                                    {post.tags.slice(0, 2).map(t => (
                                                        <span key={t} style={{ fontSize: '0.68rem', fontWeight: 600, color: C.t3, background: C.bg, border: `1px solid ${C.border}`, padding: '0.15rem 0.5rem', borderRadius: '0.25rem' }}>#{t}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
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

export default MyPosts;
