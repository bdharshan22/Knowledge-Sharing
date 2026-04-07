import { useEffect, useMemo, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/AppNavbar';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Post {
    _id: string;
    title: string;
    content: string;
    excerpt?: string;
    author: { _id: string; name: string; avatar?: string };
    createdAt: string;
    likes: string[];
    bookmarks?: string[];
    comments: any[];
    type: string;
    tags?: string[];
    views?: number;
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

const Bookmarks = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const navigate = useNavigate();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'recent' | 'liked' | 'type'>('recent');
    const [selectedType, setSelectedType] = useState('all');

    const fetchBookmarks = async () => {
        try {
            const res = await api.get('/users/bookmarks');
            const next = res.data.bookmarks || [];
            setPosts(next);
            sessionStorage.setItem('ksp_bookmarks_cache_v1', JSON.stringify({ ts: Date.now(), data: next }));
        } catch (error) {
            console.error('Failed to load bookmarks', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const cached = sessionStorage.getItem('ksp_bookmarks_cache_v1');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed?.data) && Date.now() - parsed.ts < 1000 * 60 * 5) {
                    setPosts(parsed.data);
                    setLoading(false);
                }
            } catch { /**/ }
        }
        fetchBookmarks();
    }, []);

    const handleLike = async (postId: string) => {
        if (!user) { navigate('/login'); return; }
        try {
            const { data } = await api.put(`/posts/${postId}/like`);
            setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: data } : p));
        } catch { /**/ }
    };

    const handleRemove = async (postId: string) => {
        if (!user) { navigate('/login'); return; }
        try {
            const { data } = await api.put(`/posts/${postId}/bookmark`);
            if (data?.isBookmarked === false) {
                setPosts(prev => prev.filter(p => p._id !== postId));
                sessionStorage.removeItem('ksp_bookmarks_cache_v1');
            }
        } catch { /**/ }
    };

    const types = [...new Set(posts.map(p => p.type))];

    const displayed = useMemo(() => {
        let r = selectedType === 'all' ? [...posts] : posts.filter(p => p.type === selectedType);
        if (sortBy === 'liked') r.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
        else if (sortBy === 'type') r.sort((a, b) => a.type.localeCompare(b.type));
        else r = r.reverse();
        return r;
    }, [posts, sortBy, selectedType]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: C.bg, fontFamily: '"Inter", sans-serif' }}>
            <Navbar />
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(to right, #6366f1, #06b6d4, #ec4899)', zIndex: 99 }} />

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '7rem 1.5rem 4rem' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.accent, marginBottom: '0.25rem' }}>Reading List</p>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: C.t1, letterSpacing: '-0.03em', fontFamily: '"Space Grotesk", sans-serif', margin: 0 }}>Bookmarks 🔖</h1>
                        <p style={{ color: C.t2, marginTop: '0.4rem', fontSize: '0.95rem' }}>Posts you saved for later — {posts.length} item{posts.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', color: C.t2, border: `1px solid ${C.border}`, background: C.card }}>
                        ← Back to Feed
                    </Link>
                </div>

                {/* Stats strip */}
                {posts.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                        {[
                            { label: 'Saved Posts', value: posts.length, icon: '🔖', color: '#6366f1' },
                            { label: 'Total Likes', value: posts.reduce((s, p) => s + (p.likes?.length || 0), 0), icon: '❤️', color: '#e11d48' },
                            { label: 'Topics', value: types.length, icon: '📚', color: '#0284c7' },
                        ].map(s => (
                            <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '1rem', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
                                <div style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: C.t1, fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Controls */}
                <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem', background: C.card, border: `1px solid ${C.border}`, borderRadius: '0.875rem', padding: '0.625rem 0.875rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {['all', ...types].map(t => (
                            <button key={t} onClick={() => setSelectedType(t)} style={{ padding: '0.35rem 0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', textTransform: 'capitalize', background: selectedType === t ? C.accent : 'transparent', color: selectedType === t ? '#fff' : C.t2, transition: 'all 0.2s' }}>
                                {t === 'all' ? 'All types' : t}
                            </button>
                        ))}
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: C.t3 }}>Sort:</span>
                        {(['recent', 'liked', 'type'] as const).map(o => (
                            <button key={o} onClick={() => setSortBy(o)} style={{ padding: '0.3rem 0.625rem', borderRadius: '0.5rem', border: `1px solid ${sortBy === o ? C.accent : C.border}`, background: sortBy === o ? '#eff6ff' : 'transparent', color: sortBy === o ? C.accent : C.t2, fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', textTransform: 'capitalize' }}>
                                {o === 'recent' ? 'Newest' : o === 'liked' ? 'Most Liked' : 'By Type'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Posts */}
                {loading && posts.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[1,2,3].map(i => <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '1.5rem', height: 100, animation: 'pulse 1.5s infinite' }} />)}
                    </div>
                ) : displayed.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: C.card, border: `1px solid ${C.border}`, borderRadius: '1.25rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔖</div>
                        <h3 style={{ color: C.t1, fontWeight: 700, marginBottom: '0.5rem' }}>No saved posts yet</h3>
                        <p style={{ color: C.t2, fontSize: '0.9rem', marginBottom: '1.25rem' }}>Browse the feed and save posts you want to revisit.</p>
                        <Link to="/dashboard" style={{ padding: '0.65rem 1.75rem', borderRadius: '0.75rem', background: C.accent, color: '#fff', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
                            Explore Feed →
                        </Link>
                    </div>
                ) : (
                    <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                        <AnimatePresence>
                            {displayed.map((post, i) => {
                                const isLiked = user ? post.likes?.includes(user._id) : false;
                                const isAuthor = user && post.author?._id === user._id;
                                const ts = TYPE_COLOR[post.type] || TYPE_COLOR.article;
                                return (
                                    <motion.div key={post._id}
                                        layout
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20, scale: 0.97 }}
                                        transition={{ delay: i * 0.03 }}
                                        style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '1.25rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}
                                    >
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: ts.text }} />
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                            {/* Author avatar */}
                                            <img
                                                src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'U')}&background=e2e8f0&color=475569&bold=true`}
                                                style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${C.border}`, flexShrink: 0, marginTop: 2 }}
                                            />
                                            <div style={{ flex: 1, minWidth: 0, paddingLeft: '0.25rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.06em', background: ts.bg, color: ts.text, border: `1px solid ${ts.border}` }}>{post.type}</span>
                                                    <span style={{ fontSize: '0.78rem', color: C.t3 }}>by <strong style={{ color: C.t2 }}>{post.author?.name || 'Unknown'}</strong></span>
                                                    <span style={{ fontSize: '0.78rem', color: C.t3 }}>· {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                                <Link to={`/posts/${post._id}`} style={{ textDecoration: 'none' }}>
                                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: C.t1, marginBottom: '0.375rem', fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '-0.01em', transition: 'color 0.15s' }}
                                                        onMouseEnter={e => e.currentTarget.style.color = C.accent}
                                                        onMouseLeave={e => e.currentTarget.style.color = C.t1}>
                                                        {post.title}
                                                    </h3>
                                                </Link>
                                                <p style={{ color: C.t2, fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '0.75rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                    {post.excerpt || post.content?.replace(/[#*`]/g, '').slice(0, 160)}
                                                </p>
                                                {post.tags && post.tags.length > 0 && (
                                                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
                                                        {post.tags.slice(0, 3).map(t => (
                                                            <span key={t} style={{ fontSize: '0.72rem', fontWeight: 600, color: C.t3, background: C.bg, border: `1px solid ${C.border}`, padding: '0.15rem 0.5rem', borderRadius: '0.25rem' }}>#{t}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: `1px solid ${C.border}` }}>
                                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                                        <button onClick={() => handleLike(post._id)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: isLiked ? '#e11d48' : C.t3, transition: 'color 0.2s' }}>
                                                            <svg style={{ width: 16, height: 16 }} fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                                            {post.likes?.length || 0}
                                                        </button>
                                                        <Link to={`/posts/${post._id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: C.t3, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>
                                                            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                            {post.comments?.length || 0}
                                                        </Link>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => handleRemove(post._id)} style={{ padding: '0.3rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${C.border}`, background: C.bg, color: C.t2, cursor: 'pointer' }}>
                                                            🗑 Remove
                                                        </button>
                                                        {isAuthor && (
                                                            <Link to={`/posts/${post._id}`} style={{ padding: '0.3rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${C.border}`, background: '#eff6ff', color: C.accent, textDecoration: 'none' }}>
                                                                Edit
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
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

export default Bookmarks;
