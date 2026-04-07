import { useState, useEffect, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../components/AppNavbar';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Post {
    _id: string;
    title: string;
    content: string;
    excerpt?: string;
    author: { _id: string; name: string; avatar: string };
    createdAt: string;
    likes: string[];
    bookmarks?: string[];
    comments: any[];
    type: 'question' | 'article' | 'resource' | 'tutorial' | 'discussion' | 'announcement';
    tags?: string[];
    views?: number;
    feedReasons?: string[];
    isFollowingAuthor?: boolean;
}

const TYPE_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    question:     { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', dot: '#f97316' },
    article:      { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', dot: '#3b82f6' },
    tutorial:     { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0', dot: '#22c55e' },
    discussion:   { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff', dot: '#a855f7' },
    resource:     { bg: '#fefce8', text: '#854d0e', border: '#fef08a', dot: '#eab308' },
    announcement: { bg: '#fdf2f8', text: '#9d174d', border: '#fbcfe8', dot: '#ec4899' },
};

const STAT_CARDS = [
    { key: 'total',         label: 'Feed Items',   icon: '📚', from: '#6366f1', to: '#8b5cf6' },
    { key: 'questions',     label: 'Questions',    icon: '❓', from: '#f97316', to: '#ef4444' },
    { key: 'articles',      label: 'Articles',     icon: '📝', from: '#3b82f6', to: '#06b6d4' },
    { key: 'announcements', label: 'Announcements',icon: '📢', from: '#ec4899', to: '#f43f5e' },
    { key: 'recent',        label: 'New This Week', icon: '🆕', from: '#22c55e', to: '#10b981' },
];

const KnowledgeFeed = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const navigate = useNavigate();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('newest');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('ksp_filter_preferences');
        if (saved) {
            try {
                const p = JSON.parse(saved);
                setSelectedTypes(p.types || []);
                setSortBy(p.sortBy || 'newest');
            } catch { /* ignore */ }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('ksp_filter_preferences', JSON.stringify({ types: selectedTypes, sortBy }));
    }, [selectedTypes, sortBy]);

    useEffect(() => {
        const cacheKey = 'ksp_feed_cache_v1';
        const cacheTtlMs = 1000 * 60 * 5;
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('refresh') === 'true') {
            sessionStorage.removeItem(cacheKey);
            window.history.replaceState({}, '', window.location.pathname);
        }
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed?.data) && Date.now() - parsed.ts < cacheTtlMs) {
                    setPosts(parsed.data);
                    setLoading(false);
                }
            } catch { /* ignore */ }
        }
        const fetchPosts = async () => {
            try {
                const res = await api.get('/posts/feed', { params: { limit: 24 } });
                let next = res.data;
                if (!Array.isArray(next) || next.length === 0) {
                    const fb = await api.get('/posts', { params: { limit: 24 } });
                    next = fb.data;
                }
                setPosts(Array.isArray(next) ? next : []);
                sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: next }));
            } catch {
                try {
                    const fb = await api.get('/posts');
                    setPosts(Array.isArray(fb.data) ? fb.data : []);
                } catch { setPosts([]); }
            } finally { setLoading(false); }
        };
        fetchPosts();
    }, []);

    const handleLike = async (postId: string) => {
        if (!user) { navigate('/login'); return; }
        try {
            const { data } = await api.put(`/posts/${postId}/like`);
            setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: data } : p));
        } catch { /* silent */ }
    };

    const handleSave = async (postId: string) => {
        if (!user) { navigate('/login'); return; }
        try {
            const { data } = await api.put(`/posts/${postId}/bookmark`);
            const isBookmarked = data.isBookmarked;
            setPosts(prev => prev.map(p => {
                if (p._id !== postId) return p;
                const cur = p.bookmarks || [];
                return { ...p, bookmarks: isBookmarked ? [...cur, user._id] : cur.filter(id => id !== user._id) };
            }));
            toast.success(isBookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
        } catch { toast.error('Failed to update bookmark'); }
    };

    const handleDelete = async (postId: string) => {
        if (!user) { navigate('/login'); return; }
        if (!window.confirm('Delete this post? This cannot be undone.')) return;
        try {
            await api.delete(`/posts/${postId}`);
            setPosts(prev => prev.filter(p => p._id !== postId));
        } catch { /* ignore */ }
    };

    const handleFollow = async (authorId: string) => {
        if (!user) { navigate('/login'); return; }
        try {
            const { data } = await api.put(`/users/${authorId}/follow`);
            setPosts(prev => prev.map(p => p.author?._id === authorId ? { ...p, isFollowingAuthor: data?.isFollowing } : p));
        } catch { /* ignore */ }
    };

    const allTags = useMemo(() => {
        const s = new Set<string>();
        posts.forEach(p => p.tags?.forEach(t => s.add(t)));
        return Array.from(s);
    }, [posts]);

    const filteredPosts = useMemo(() => {
        let r = [...posts];
        if (filter !== 'all') r = r.filter(p => p.type === filter);
        if (selectedTypes.length > 0) r = r.filter(p => selectedTypes.includes(p.type));
        if (selectedTags.length > 0) r = r.filter(p => p.tags?.some(t => selectedTags.includes(t)));
        if (sortBy === 'newest') r.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        else if (sortBy === 'popular') r.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
        else if (sortBy === 'trending') r.sort((a, b) => {
            const score = (p: Post) => (p.likes?.length || 0) + (p.views || 0) * 0.1;
            const age = (p: Post) => (Date.now() - new Date(p.createdAt).getTime()) / 86400000 + 1;
            return score(b) / age(b) - score(a) / age(a);
        });
        return r;
    }, [posts, filter, selectedTypes, selectedTags, sortBy]);

    const stats = useMemo(() => ({
        total: posts.length,
        articles: posts.filter(p => p.type === 'article').length,
        questions: posts.filter(p => p.type === 'question').length,
        announcements: posts.filter(p => p.type === 'announcement').length,
        recent: posts.filter(p => Date.now() - new Date(p.createdAt).getTime() < 7 * 86400000).length,
    }), [posts]);

    const activeFilterCount = selectedTypes.length + selectedTags.length + (filter !== 'all' ? 1 : 0);

    const toggleFilter = (arr: string[], set: (v: string[]) => void, val: string) =>
        set(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);

    const clearAll = () => { setSelectedTypes([]); setSelectedTags([]); setSortBy('newest'); setFilter('all'); };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    };

    /* ─── LIGHT THEME VARIABLES ─── */
    const bg = '#f8fafc';
    const card = '#ffffff';
    const border = '#e2e8f0';
    const txt1 = '#0f172a';
    const txt2 = '#475569';
    const txt3 = '#94a3b8';
    const accent = '#6366f1';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: bg, fontFamily: '"Inter", sans-serif', overflowX: 'hidden' }}>
            <Navbar />

            {/* Subtle top gradient strip */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(to right, #6366f1, #06b6d4, #ec4899)', zIndex: 99 }} />

            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '7rem 1.5rem 4rem' }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent, marginBottom: '0.375rem' }}>Dashboard</p>
                            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: txt1, letterSpacing: '-0.03em', fontFamily: '"Space Grotesk", sans-serif', margin: 0 }}>
                                Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
                            </h1>
                            <p style={{ color: txt2, marginTop: '0.5rem', fontSize: '1rem' }}>Catch up on new knowledge and keep your momentum going.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <Link to="/create-post" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.7rem 1.5rem', borderRadius: '0.75rem', fontWeight: 700,
                                fontSize: '0.875rem', textDecoration: 'none', color: '#fff',
                                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                                transition: 'all 0.2s ease'
                            }}>
                                <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                Create Post
                            </Link>
                            {[{ to: '/collections', label: 'Collections' }, { to: '/bookmarks', label: 'Bookmarks' }].map(b => (
                                <Link key={b.to} to={b.to} style={{
                                    display: 'inline-flex', alignItems: 'center', padding: '0.7rem 1.25rem',
                                    borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem',
                                    textDecoration: 'none', color: txt2, backgroundColor: card,
                                    border: `1px solid ${border}`, transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = txt2; }}>
                                    {b.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Personalization alert */}
                    {!user?.skills?.length && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            padding: '1rem 1.25rem', borderRadius: '1rem', marginBottom: '1.5rem',
                            background: 'linear-gradient(135deg, #eff6ff, #faf5ff)',
                            border: '1px solid #c7d2fe'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>💡</span>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 700, color: '#312e81', fontSize: '0.9rem', margin: 0 }}>Personalize your feed</p>
                                <p style={{ color: '#6366f1', fontSize: '0.8rem', margin: '0.125rem 0 0' }}>Set your interests to see the most relevant content.</p>
                            </div>
                            <Link to="/settings/profile" style={{ padding: '0.5rem 1rem', borderRadius: '0.625rem', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                                Update Profile →
                            </Link>
                        </div>
                    )}

                    {/* Stat cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        {STAT_CARDS.map(s => (
                            <motion.div key={s.key}
                                whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.12)' }}
                                style={{
                                    background: card, border: `1px solid ${border}`, borderRadius: '1rem',
                                    padding: '1.25rem', cursor: 'pointer', transition: 'all 0.25s ease', position: 'relative', overflow: 'hidden'
                                }}
                                onClick={() => s.key !== 'total' && s.key !== 'recent' && setFilter(s.key.replace('announcements', 'announcement'))}
                            >
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(to right, ${s.from}, ${s.to})` }} />
                                <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: txt1, fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1 }}>
                                    {stats[s.key as keyof typeof stats]}
                                </div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: txt3, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.375rem' }}>{s.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Search bar */}
                    <form onSubmit={handleSearch} style={{
                        display: 'flex', gap: '0.75rem', alignItems: 'center',
                        padding: '0.75rem 1rem', borderRadius: '1rem',
                        background: card, border: `1px solid ${border}`,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: '1rem'
                    }}>
                        <svg style={{ width: 18, height: 18, color: txt3, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search posts, tags, or people..."
                            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem', color: txt1, background: 'transparent', fontFamily: '"Inter", sans-serif' }} />
                        <button type="submit" style={{
                            padding: '0.5rem 1.25rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: '#fff',
                            fontWeight: 700, fontSize: '0.85rem', flexShrink: 0
                        }}>Search</button>
                    </form>

                    {/* Filters panel */}
                    <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '1rem', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: accent }}>Filters</span>
                                {activeFilterCount > 0 && (
                                    <span style={{ padding: '0.15rem 0.625rem', background: accent, color: '#fff', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800 }}>{activeFilterCount}</span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                {activeFilterCount > 0 && (
                                    <button onClick={clearAll} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Clear All</button>
                                )}
                                <button onClick={() => setShowFilters(!showFilters)} style={{ background: 'none', border: 'none', color: txt2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 600 }}>
                                    {showFilters ? 'Hide' : 'Show'} Filters
                                    <svg style={{ width: 14, height: 14, transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Active chips */}
                        {activeFilterCount > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0 1.25rem 0.75rem' }}>
                                {selectedTypes.map(t => (
                                    <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', background: '#eff6ff', color: '#1d4ed8', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                                        {t}
                                        <button onClick={() => toggleFilter(selectedTypes, setSelectedTypes, t)} style={{ background: 'none', border: 'none', color: '#1d4ed8', cursor: 'pointer', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}>×</button>
                                    </span>
                                ))}
                                {selectedTags.map(t => (
                                    <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', background: '#faf5ff', color: '#7e22ce', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                                        #{t}
                                        <button onClick={() => toggleFilter(selectedTags, setSelectedTags, t)} style={{ background: 'none', border: 'none', color: '#7e22ce', cursor: 'pointer', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}>×</button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <AnimatePresence>
                            {showFilters && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                    style={{ overflow: 'hidden', borderTop: `1px solid ${border}`, padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                                        <div>
                                            <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: txt3, marginBottom: '0.625rem' }}>Sort By</p>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {['newest', 'popular', 'trending'].map(o => (
                                                    <button key={o} onClick={() => setSortBy(o)} style={{
                                                        padding: '0.4rem 1rem', borderRadius: '0.5rem', border: `1px solid ${sortBy === o ? accent : border}`,
                                                        background: sortBy === o ? accent : 'transparent',
                                                        color: sortBy === o ? '#fff' : txt2, fontWeight: 700,
                                                        fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s'
                                                    }}>{o.charAt(0).toUpperCase() + o.slice(1)}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: txt3, marginBottom: '0.625rem' }}>Post Type</p>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {['article', 'question', 'resource', 'tutorial', 'discussion'].map(t => (
                                                    <button key={t} onClick={() => toggleFilter(selectedTypes, setSelectedTypes, t)} style={{
                                                        padding: '0.4rem 1rem', borderRadius: '0.5rem',
                                                        border: `1px solid ${selectedTypes.includes(t) ? accent : border}`,
                                                        background: selectedTypes.includes(t) ? '#eff6ff' : 'transparent',
                                                        color: selectedTypes.includes(t) ? accent : txt2,
                                                        fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s'
                                                    }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                                                ))}
                                            </div>
                                        </div>
                                        {allTags.length > 0 && (
                                            <div>
                                                <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: txt3, marginBottom: '0.625rem' }}>Tags ({allTags.length})</p>
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', maxHeight: 80, overflowY: 'auto' }}>
                                                    {allTags.slice(0, 20).map(t => (
                                                        <button key={t} onClick={() => toggleFilter(selectedTags, setSelectedTags, t)} style={{
                                                            padding: '0.3rem 0.75rem', borderRadius: '0.5rem',
                                                            border: `1px solid ${selectedTags.includes(t) ? '#a855f7' : border}`,
                                                            background: selectedTags.includes(t) ? '#faf5ff' : 'transparent',
                                                            color: selectedTags.includes(t) ? '#7e22ce' : txt2,
                                                            fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s'
                                                        }}>#{t}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── 3-col layout ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 260px', gap: '2rem', alignItems: 'start' }}>

                    {/* Left sidebar */}
                    <div style={{ position: 'sticky', top: '5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* User card */}
                        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '1rem', overflow: 'hidden' }}>
                            <div style={{ height: 48, background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }} />
                            <div style={{ padding: '0 1rem 1rem' }}>
                                <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&bold=true`}
                                    style={{ width: 52, height: 52, borderRadius: '50%', border: `3px solid ${card}`, objectFit: 'cover', marginTop: -26, display: 'block' }} />
                                <div style={{ fontWeight: 800, color: txt1, fontSize: '0.95rem', marginTop: '0.5rem', fontFamily: '"Space Grotesk", sans-serif' }}>{user?.name || 'Guest'}</div>
                                <div style={{ fontSize: '0.75rem', color: txt3, marginBottom: '0.875rem' }}>{user?.bio || 'Knowledge Sharer'}</div>
                                <div style={{ borderTop: `1px solid ${border}`, paddingTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {[
                                        { to: '/dashboard', icon: '🏠', label: 'My Feed', active: true },
                                        { to: '/bookmarks', icon: '🔖', label: 'Bookmarks' },
                                        { to: '/collections', icon: '📚', label: 'Collections' },
                                        { to: '/my-posts', icon: '✏️', label: 'My Posts' },
                                        { to: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
                                    ].map(item => (
                                        <Link key={item.to} to={item.to} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.625rem',
                                            padding: '0.5rem 0.625rem', borderRadius: '0.5rem',
                                            textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
                                            color: item.active ? accent : txt2,
                                            background: item.active ? '#eff6ff' : 'transparent',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onMouseEnter={e => { if (!item.active) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = accent; } }}
                                        onMouseLeave={e => { if (!item.active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = txt2; } }}>
                                            <span>{item.icon}</span>{item.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Trending tags */}
                        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '1rem', padding: '1rem' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: accent, marginBottom: '0.75rem' }}>Trending Topics</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                {['JavaScript', 'React', 'Node.js', 'Python', 'AI', 'Design', 'Career', 'DevOps'].map(t => (
                                    <button key={t} onClick={() => toggleFilter(selectedTags, setSelectedTags, t)} style={{
                                        padding: '0.25rem 0.625rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600,
                                        border: `1px solid ${selectedTags.includes(t) ? accent : border}`,
                                        background: selectedTags.includes(t) ? '#eff6ff' : '#f8fafc',
                                        color: selectedTags.includes(t) ? accent : txt2, cursor: 'pointer', transition: 'all 0.15s'
                                    }}>{t}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Feed */}
                    <div>
                        {/* Type filter tabs */}
                        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', background: card, border: `1px solid ${border}`, borderRadius: '0.875rem', padding: '0.375rem' }}>
                            {['all', 'question', 'article', 'announcement'].map(f => (
                                <button key={f} onClick={() => setFilter(f)} style={{
                                    flex: 1, padding: '0.5rem 0.5rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer',
                                    fontWeight: 700, fontSize: '0.8rem', textTransform: 'capitalize', transition: 'all 0.2s',
                                    background: filter === f ? accent : 'transparent',
                                    color: filter === f ? '#fff' : txt2,
                                    boxShadow: filter === f ? '0 2px 8px rgba(99,102,241,0.3)' : 'none'
                                }}>{f === 'all' ? 'All Posts' : f + 's'}</button>
                            ))}
                            <Link to="/create-post" style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 36, height: 36, borderRadius: '0.625rem', flexShrink: 0, alignSelf: 'center',
                                background: 'linear-gradient(135deg, #6366f1, #06b6d4)', textDecoration: 'none'
                            }}>
                                <svg style={{ width: 16, height: 16, color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                            </Link>
                        </div>

                        {/* Posts */}
                        {loading && posts.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[1, 2, 3].map(i => (
                                    <div key={i} style={{ background: card, border: `1px solid ${border}`, borderRadius: '1rem', padding: '1.5rem', animation: 'pulse 1.5s infinite' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ height: 12, background: '#e2e8f0', borderRadius: 6, marginBottom: 6, width: '40%' }} />
                                                <div style={{ height: 10, background: '#f1f5f9', borderRadius: 6, width: '25%' }} />
                                            </div>
                                        </div>
                                        <div style={{ height: 18, background: '#e2e8f0', borderRadius: 6, marginBottom: 8, width: '75%' }} />
                                        <div style={{ height: 12, background: '#f1f5f9', borderRadius: 6, width: '100%' }} />
                                    </div>
                                ))}
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: card, border: `1px solid ${border}`, borderRadius: '1rem' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                                <h3 style={{ color: txt1, fontWeight: 700, marginBottom: '0.5rem' }}>No posts found</h3>
                                <p style={{ color: txt2, fontSize: '0.9rem', marginBottom: '1.25rem' }}>Try adjusting your filters or search terms.</p>
                                <button onClick={clearAll} style={{ padding: '0.6rem 1.5rem', borderRadius: '0.625rem', background: accent, color: '#fff', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {filteredPosts.map((post, i) => {
                                    const isLiked = user ? post.likes?.includes(user._id) : false;
                                    const isSaved = user ? post.bookmarks?.includes(user._id) : false;
                                    const isAuthor = user && post.author?._id === user._id;
                                    const typeStyle = TYPE_STYLES[post.type] || TYPE_STYLES.article;
                                    return (
                                        <motion.div key={post._id}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            whileHover={{ y: -2 }}
                                            style={{
                                                background: card, border: `1px solid ${border}`,
                                                borderRadius: '1rem', padding: '1.5rem',
                                                position: 'relative', overflow: 'hidden',
                                                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                                transition: 'box-shadow 0.25s ease'
                                            }}
                                        >
                                            {/* Type color accent */}
                                            <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: `linear-gradient(to bottom, ${typeStyle.dot}, transparent)` }} />

                                            {/* Author + meta row */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem', paddingLeft: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                                    <img src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'U')}&background=e2e8f0&color=475569&bold=true`}
                                                        style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${border}` }} />
                                                    <div>
                                                        {post.author?._id ? (
                                                            <Link to={`/users/${post.author._id}`} style={{ fontWeight: 700, color: txt1, fontSize: '0.875rem', textDecoration: 'none' }}
                                                                onMouseEnter={e => e.currentTarget.style.color = accent}
                                                                onMouseLeave={e => e.currentTarget.style.color = txt1}>
                                                                {post.author.name}
                                                            </Link>
                                                        ) : (
                                                            <span style={{ fontWeight: 700, color: txt1, fontSize: '0.875rem' }}>{post.author?.name || 'Unknown'}</span>
                                                        )}
                                                        <div style={{ fontSize: '0.75rem', color: txt3 }}>
                                                            {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.06em', background: typeStyle.bg, color: typeStyle.text, border: `1px solid ${typeStyle.border}` }}>
                                                        {post.type}
                                                    </span>
                                                    {!isAuthor && post.author?._id && (
                                                        <button onClick={() => handleFollow(post.author._id)} style={{
                                                            padding: '0.25rem 0.75rem', borderRadius: '999px', border: `1px solid ${post.isFollowingAuthor ? accent : border}`,
                                                            background: post.isFollowingAuthor ? '#eff6ff' : 'transparent',
                                                            color: post.isFollowingAuthor ? accent : txt2,
                                                            fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                                                        }}>
                                                            {post.isFollowingAuthor ? '✓ Following' : '+ Follow'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Title and excerpt */}
                                            <Link to={`/posts/${post._id}`} style={{ textDecoration: 'none', display: 'block', paddingLeft: '0.5rem' }}>
                                                <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: txt1, marginBottom: '0.5rem', lineHeight: 1.3, letterSpacing: '-0.01em', fontFamily: '"Space Grotesk", sans-serif', transition: 'color 0.2s' }}
                                                    onMouseEnter={e => e.currentTarget.style.color = accent}
                                                    onMouseLeave={e => e.currentTarget.style.color = txt1}>
                                                    {post.title}
                                                </h2>
                                                <p style={{ color: txt2, fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '0.875rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {post.excerpt || (post.content?.replace(/[#*`]/g, '').slice(0, 180) + '...')}
                                                </p>
                                            </Link>

                                            {/* Tags */}
                                            {post.tags && post.tags.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                                                    {post.tags.slice(0, 3).map(tag => (
                                                        <button key={tag} onClick={() => toggleFilter(selectedTags, setSelectedTags, tag)} style={{
                                                            padding: '0.2rem 0.625rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600,
                                                            border: `1px solid ${border}`, background: '#f8fafc', color: txt2, cursor: 'pointer', transition: 'all 0.15s'
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = accent; e.currentTarget.style.borderColor = accent; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = txt2; e.currentTarget.style.borderColor = border; }}>
                                                            #{tag}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Action bar */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.875rem', borderTop: `1px solid ${border}`, paddingLeft: '0.5rem' }}>
                                                <div style={{ display: 'flex', gap: '1.25rem' }}>
                                                    <button onClick={() => handleLike(post._id)} style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                        fontSize: '0.85rem', fontWeight: 600,
                                                        color: isLiked ? '#e11d48' : txt3, transition: 'color 0.2s'
                                                    }}>
                                                        <svg style={{ width: 17, height: 17 }} fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                                        {post.likes?.length || 0}
                                                    </button>
                                                    <Link to={`/posts/${post._id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: txt3, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                                                        <svg style={{ width: 17, height: 17 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                        {post.comments?.length || 0}
                                                    </Link>
                                                    {post.views !== undefined && (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: txt3, fontSize: '0.85rem', fontWeight: 600 }}>
                                                            <svg style={{ width: 17, height: 17 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                            {post.views}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <button onClick={() => handleSave(post._id)} style={{
                                                        padding: '0.3rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700,
                                                        border: `1px solid ${isSaved ? accent : border}`,
                                                        background: isSaved ? '#eff6ff' : 'transparent',
                                                        color: isSaved ? accent : txt2, cursor: 'pointer', transition: 'all 0.2s'
                                                    }}>{isSaved ? '✓ Saved' : 'Save'}</button>
                                                    {isAuthor && (
                                                        <button onClick={() => handleDelete(post._id)} style={{
                                                            padding: '0.3rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700,
                                                            border: '1px solid #fecaca', background: '#fff5f5', color: '#dc2626', cursor: 'pointer', transition: 'all 0.2s'
                                                        }}>Delete</button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div style={{ position: 'sticky', top: '5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Weekly Challenge */}
                        <div style={{ borderRadius: '1rem', padding: '1.25rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(20px)' }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>🎯</div>
                                <h3 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.375rem', fontFamily: '"Space Grotesk", sans-serif' }}>Weekly Challenge</h3>
                                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', marginBottom: '1rem', lineHeight: 1.5 }}>Complete 3 Learning Paths to earn the "Fast Learner" badge.</p>
                                <div style={{ height: 6, background: 'rgba(0,0,0,0.2)', borderRadius: 999, overflow: 'hidden', marginBottom: '0.375rem' }}>
                                    <div style={{ height: '100%', width: '33%', background: 'rgba(255,255,255,0.9)', borderRadius: 999 }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                                    <span>1 / 3 completed</span><span>33%</span>
                                </div>
                            </div>
                        </div>

                        {/* Top contributors */}
                        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '1rem', padding: '1.25rem' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: accent, marginBottom: '1rem' }}>Top Contributors</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                {[
                                    { name: 'Alex Chen', pts: '2.4k', role: 'AI & ML', rank: 1 },
                                    { name: 'Priya Sharma', pts: '1.9k', role: 'Frontend', rank: 2 },
                                    { name: 'Marcus Webb', pts: '1.6k', role: 'DevOps', rank: 3 },
                                ].map((c, i) => (
                                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                                            background: i === 0 ? '#fef3c7' : i === 1 ? '#f1f5f9' : '#fff7ed',
                                            border: `2px solid ${i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#f97316'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.65rem', fontWeight: 900,
                                            color: i === 0 ? '#92400e' : i === 1 ? '#475569' : '#7c2d12'
                                        }}>{c.rank}</div>
                                        <img src={`https://i.pravatar.cc/40?img=${i + 30}`}
                                            style={{ width: 34, height: 34, borderRadius: '50%', border: `2px solid ${border}`, objectFit: 'cover' }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, color: txt1, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                                            <div style={{ fontSize: '0.72rem', color: txt3 }}>{c.role}</div>
                                        </div>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: accent, background: '#eff6ff', padding: '0.2rem 0.5rem', borderRadius: '999px', flexShrink: 0 }}>{c.pts}</span>
                                    </div>
                                ))}
                                <Link to="/leaderboard" style={{ display: 'block', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: accent, textDecoration: 'none', paddingTop: '0.5rem', borderTop: `1px solid ${border}` }}>
                                    View Full Leaderboard →
                                </Link>
                            </div>
                        </div>

                        {/* Quick links */}
                        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '1rem', padding: '1.25rem' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: accent, marginBottom: '0.875rem' }}>Explore</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {[
                                    { to: '/learning-paths', icon: '🗺️', label: 'Learning Paths' },
                                    { to: '/projects', icon: '🚀', label: 'Project Gallery' },
                                    { to: '/events', icon: '📅', label: 'Upcoming Events' },
                                    { to: '/community', icon: '💬', label: 'Community Hub' },
                                ].map(item => (
                                    <Link key={item.to} to={item.to} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                                        padding: '0.5rem 0.625rem', borderRadius: '0.5rem',
                                        textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
                                        color: txt2, transition: 'all 0.15s ease'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = accent; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = txt2; }}>
                                        <span>{item.icon}</span>{item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KnowledgeFeed;
