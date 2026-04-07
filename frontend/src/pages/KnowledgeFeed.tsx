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
    const [showLeftSidebar, setShowLeftSidebar] = useState(false);
    const [showRightSidebar, setShowRightSidebar] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await api.get('/posts/feed', { params: { limit: 24 } });
                let next = res.data;
                if (!Array.isArray(next) || next.length === 0) {
                    const fb = await api.get('/posts', { params: { limit: 24 } });
                    next = fb.data;
                }
                setPosts(Array.isArray(next) ? next : []);
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
        if (!window.confirm('Delete this post?')) return;
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

    // Design Tokens
    const bg = '#f8fafc';
    const card = '#ffffff';
    const border = '#e2e8f0';
    const txt1 = '#0f172a';
    const txt2 = '#475569';
    const txt3 = '#94a3b8';
    const accent = '#6366f1';

    const sidebarVariants = {
        hidden: { x: -300, opacity: 0 },
        visible: { x: 0, opacity: 1 },
        hiddenRight: { x: 300, opacity: 0 }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: bg, fontFamily: '"Inter", sans-serif', overflowX: 'hidden' }}>
            <Navbar />

            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '7rem 1.5rem 4rem' }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent, marginBottom: '0.375rem' }}>Dashboard</p>
                            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: txt1, letterSpacing: '-0.03em', margin: 0 }}>
                                Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
                            </h1>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Link to="/create-post" style={{
                                padding: '0.7rem 1.5rem', borderRadius: '0.75rem', fontWeight: 700,
                                fontSize: '0.875rem', textDecoration: 'none', color: '#fff',
                                background: 'linear-gradient(135deg, #6366f1, #06b6d4)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                                transition: 'all 0.2s ease'
                            }}>Create Post</Link>
                        </div>
                    </div>

                    {/* Stat cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        {STAT_CARDS.map(s => (
                            <motion.div key={s.key} whileHover={{ y: -4 }}
                                style={{ background: card, border: `1px solid ${border}`, borderRadius: '1rem', padding: '1.25rem', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                                onClick={() => s.key !== 'total' && s.key !== 'recent' && setFilter(s.key.replace('announcements', 'announcement'))}
                            >
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(to right, ${s.from}, ${s.to})` }} />
                                <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: txt1, lineHeight: 1 }}>{stats[s.key as keyof typeof stats]}</div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: txt3, textTransform: 'uppercase', marginTop: '0.375rem' }}>{s.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Search bar */}
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '1rem', background: card, border: `1px solid ${border}`, marginBottom: '1rem' }}>
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search knowledge..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem', background: 'transparent' }} />
                        <button type="submit" style={{ padding: '0.5rem 1.25rem', borderRadius: '0.625rem', background: accent, color: '#fff', fontWeight: 700, border: 'none' }}>Search</button>
                    </form>

                    {/* Filters UI */}
                    <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '1rem', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: accent }}>Feed Filters</span>
                                {activeFilterCount > 0 && (
                                    <span style={{ padding: '0.15rem 0.625rem', background: accent, color: '#fff', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800 }}>{activeFilterCount}</span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {activeFilterCount > 0 && <button onClick={clearAll} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Reset</button>}
                                <button onClick={() => setShowFilters(!showFilters)} style={{ background: 'none', border: 'none', color: txt2, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                                    {showFilters ? 'Hide' : 'Show'} Filters
                                </button>
                            </div>
                        </div>
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden', borderTop: `1px solid ${border}`, padding: '1rem 1.25rem' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                                        <div>
                                            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: txt3, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Type</p>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {['article', 'question', 'resource', 'tutorial'].map(t => (
                                                    <button key={t} onClick={() => toggleFilter(selectedTypes, setSelectedTypes, t)} style={{
                                                        padding: '0.35rem 0.875rem', borderRadius: '0.5rem', border: `1px solid ${selectedTypes.includes(t) ? accent : border}`,
                                                        background: selectedTypes.includes(t) ? '#eff6ff' : 'transparent', color: selectedTypes.includes(t) ? accent : txt2,
                                                        fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                                                    }}>{t}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: txt3, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Sort</p>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {['newest', 'popular'].map(s => (
                                                    <button key={s} onClick={() => setSortBy(s)} style={{
                                                        padding: '0.35rem 0.875rem', borderRadius: '0.5rem', border: `1px solid ${sortBy === s ? accent : border}`,
                                                        background: sortBy === s ? accent : 'transparent', color: sortBy === s ? '#fff' : txt2,
                                                        fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                                                    }}>{s}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Mobile Sidebar Toggles ── */}
                <div style={{ display: 'none', gap: '1rem', marginBottom: '1.5rem', position: 'relative' }} className="mobile-only-flex">
                    <button onClick={() => setShowLeftSidebar(true)} style={{ flex: 1, padding: '0.9rem', background: card, border: `1px solid ${border}`, borderRadius: '1rem', fontWeight: 700, color: txt1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            👤 Profile
                            <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} style={{ fontSize: '0.9rem' }}>👆</motion.span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: '#f1f5f9', padding: '0.2rem 0.625rem', borderRadius: '99px', border: `1px solid ${border}` }}>
                             <motion.div animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
                             <span style={{ fontSize: '0.6rem', fontWeight: 800, color: txt2, letterSpacing: '0.04em' }}>LIVE</span>
                        </div>
                    </button>
                    <button onClick={() => setShowRightSidebar(true)} style={{ flex: 1, padding: '0.9rem', background: card, border: `1px solid ${border}`, borderRadius: '1rem', fontWeight: 700, color: txt1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            📊 Stats
                            <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.8, delay: 0.5 }} style={{ fontSize: '0.8rem' }}>👆</motion.span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: '#f1f5f9', padding: '0.2rem 0.625rem', borderRadius: '99px', border: `1px solid ${border}` }}>
                             <motion.div animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 8px rgba(99,102,241,0.5)' }} />
                             <span style={{ fontSize: '0.6rem', fontWeight: 800, color: txt2, letterSpacing: '0.04em' }}>ACTIVE</span>
                        </div>
                    </button>
                </div>

                {/* ── 3-col layout ── */}
                <div className="dashboard-grid">

                    {/* Left Sidebar */}
                    <AnimatePresence>
                        {showLeftSidebar && (
                            <>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLeftSidebar(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', zIndex: 999 }} />
                                <motion.div initial="hidden" animate="visible" exit="hidden" variants={sidebarVariants} transition={{ type: 'spring', damping: 25 }} className="left-sidebar-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 1000 }}>
                                    <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '1rem', overflow: 'hidden' }}>
                                        <div style={{ height: 48, background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }} />
                                        <div style={{ padding: '0 1rem 1rem' }}>
                                            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&bold=true`}
                                                style={{ width: 52, height: 52, borderRadius: '50%', border: `3px solid ${card}`, marginTop: -26, display: 'block' }} alt="Avatar" />
                                            <div style={{ fontWeight: 800, color: txt1, fontSize: '0.95rem', marginTop: '0.5rem' }}>{user?.name || 'Guest'}</div>
                                            <p style={{ fontSize: '0.75rem', color: txt3 }}>Knowledge Sharer</p>
                                            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                {[
                                                    { label: 'My Feed', to: '/dashboard', icon: '🏠' },
                                                    { label: 'Bookmarks', to: '/bookmarks', icon: '🔖' },
                                                    { label: 'Collections', to: '/collections', icon: '📚' }
                                                ].map(l => (
                                                    <Link key={l.label} to={l.to} style={{
                                                        textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', textDecoration: 'none',
                                                        background: l.label === 'My Feed' ? '#eff6ff' : 'transparent', color: l.label === 'My Feed' ? accent : txt2,
                                                        fontWeight: 600, fontSize: '0.85rem'
                                                    }}><span>{l.icon}</span> {l.label}</Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '1rem', padding: '1.25rem' }}>
                                        <p style={{ fontSize: '0.7rem', fontWeight: 800, color: accent, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Pick Tags</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                            {allTags.slice(0, 10).map(t => (
                                                <button key={t} onClick={() => toggleFilter(selectedTags, setSelectedTags, t)} style={{
                                                    padding: '0.25rem 0.625rem', borderRadius: '0.4rem', border: `1px solid ${selectedTags.includes(t) ? accent : border}`,
                                                    background: selectedTags.includes(t) ? '#eff6ff' : '#f8fafc', color: selectedTags.includes(t) ? accent : txt3,
                                                    fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer'
                                                }}>#{t}</button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                        {window.innerWidth >= 1101 && (
                            <div className="left-sidebar-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '1rem', overflow: 'hidden' }}>
                                    <div style={{ height: 48, background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }} />
                                    <div style={{ padding: '0 1rem 1rem' }}>
                                        <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&bold=true`}
                                            style={{ width: 52, height: 52, borderRadius: '50%', border: `3px solid ${card}`, marginTop: -26, display: 'block' }} alt="Avatar" />
                                        <div style={{ fontWeight: 800, color: txt1, fontSize: '0.95rem', marginTop: '0.5rem' }}>{user?.name || 'Guest'}</div>
                                        <p style={{ fontSize: '0.75rem', color: txt3 }}>Knowledge Sharer</p>
                                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            {[
                                                { label: 'My Feed', to: '/dashboard', icon: '🏠' },
                                                { label: 'Bookmarks', to: '/bookmarks', icon: '🔖' },
                                                { label: 'Collections', to: '/collections', icon: '📚' }
                                            ].map(l => (
                                                <Link key={l.label} to={l.to} style={{
                                                    textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', textDecoration: 'none',
                                                    background: l.label === 'My Feed' ? '#eff6ff' : 'transparent', color: l.label === 'My Feed' ? accent : txt2,
                                                    fontWeight: 600, fontSize: '0.85rem'
                                                }}><span>{l.icon}</span> {l.label}</Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '1rem', padding: '1.25rem' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: accent, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Pick Tags</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                        {allTags.slice(0, 10).map(t => (
                                            <button key={t} onClick={() => toggleFilter(selectedTags, setSelectedTags, t)} style={{
                                                padding: '0.25rem 0.625rem', borderRadius: '0.4rem', border: `1px solid ${selectedTags.includes(t) ? accent : border}`,
                                                background: selectedTags.includes(t) ? '#eff6ff' : '#f8fafc', color: selectedTags.includes(t) ? accent : txt3,
                                                fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer'
                                            }}>#{t}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Main Feed */}
                    <div style={{ minWidth: 0 }}>
                        {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}>Loading posts...</div> : (
                            <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {filteredPosts.map((post, i) => {
                                    const typeStyle = TYPE_STYLES[post.type] || TYPE_STYLES.article;
                                    const isLiked = user ? post.likes?.includes(user._id) : false;
                                    const isSaved = user ? post.bookmarks?.includes(user._id) : false;
                                    const isAuthor = user && post.author?._id === user._id;

                                    return (
                                        <motion.div key={post._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                            style={{ background: card, border: `1px solid ${border}`, borderRadius: '1.25rem', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                                            <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: typeStyle.dot }} />
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <img src={post.author?.avatar || 'https://ui-avatars.com/api/?name=U'} style={{ width: 36, height: 36, borderRadius: '50%' }} alt="Author" />
                                                    <div>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: txt1 }}>{post.author?.name}</div>
                                                        <div style={{ fontSize: '0.7rem', color: txt3 }}>{new Date(post.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.625rem', borderRadius: '1rem', background: typeStyle.bg, color: typeStyle.text, textTransform: 'uppercase' }}>{post.type}</span>
                                                    {!isAuthor && (
                                                        <button onClick={() => handleFollow(post.author._id)} style={{ padding: '0.2rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', color: post.isFollowingAuthor ? accent : txt3 }}>
                                                            {post.isFollowingAuthor ? 'Following' : '+ Follow'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <Link to={`/posts/${post._id}`} style={{ textDecoration: 'none' }}>
                                                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: txt1, marginBottom: '0.5rem' }}>{post.title}</h2>
                                                <p style={{ color: txt2, fontSize: '0.9rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {post.excerpt || post.content?.slice(0, 150)}...
                                                </p>
                                            </Link>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '1rem', borderTop: `1px solid ${border}` }}>
                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                    <button onClick={() => handleLike(post._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', color: isLiked ? '#ef4444' : txt3, fontWeight: 600, fontSize: '0.8rem' }}>
                                                        <span>❤️</span> {post.likes?.length || 0}
                                                    </button>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: txt3, fontWeight: 600, fontSize: '0.8rem' }}>
                                                        <span>💬</span> {post.comments?.length || 0}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => handleSave(post._id)} style={{ background: 'none', border: `1px solid ${isSaved ? accent : border}`, borderRadius: '0.5rem', padding: '0.25rem 0.625rem', cursor: 'pointer', color: isSaved ? accent : txt3, fontSize: '0.75rem', fontWeight: 600 }}>
                                                        {isSaved ? 'Saved' : 'Save'}
                                                    </button>
                                                    {isAuthor && <button onClick={() => handleDelete(post._id)} style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: '0.5rem', padding: '0.25rem 0.625rem', cursor: 'pointer', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>Delete</button>}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <AnimatePresence>
                        {showRightSidebar && (
                            <>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRightSidebar(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', zIndex: 999 }} />
                                <motion.div initial="hiddenRight" animate="visible" exit="hiddenRight" variants={sidebarVariants} transition={{ type: 'spring', damping: 25 }} className="right-sidebar-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 1000 }}>
                                    <div style={{ borderRadius: '1.25rem', padding: '1.5rem', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: '#fff' }}>
                                        <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem' }}>Weekly Goal 🎯</h3>
                                        <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>Contribute 3 posts to master your domain.</p>
                                        <div style={{ height: 6, background: 'rgba(0,0,0,0.2)', borderRadius: 10, marginTop: '1rem' }}>
                                            <div style={{ width: '33%', height: '100%', background: '#fff', borderRadius: 10 }} />
                                        </div>
                                    </div>
                                    <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '1.25rem', padding: '1.25rem' }}>
                                        <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: accent, marginBottom: '0.75rem' }}>Trending Now</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {['System Design', 'React Performance', 'AI Ethics', 'Rust Lang'].map(t => (
                                                <div key={t} style={{ fontSize: '0.85rem', fontWeight: 600, color: txt2, cursor: 'pointer' }}>#{t}</div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                        {window.innerWidth >= 1101 && (
                            <div className="right-sidebar-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ borderRadius: '1.25rem', padding: '1.5rem', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: '#fff' }}>
                                    <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem' }}>Weekly Goal 🎯</h3>
                                    <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>Contribute 3 posts to master your domain.</p>
                                    <div style={{ height: 6, background: 'rgba(0,0,0,0.2)', borderRadius: 10, marginTop: '1rem' }}>
                                        <div style={{ width: '33%', height: '100%', background: '#fff', borderRadius: 10 }} />
                                    </div>
                                </div>
                                <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '1.25rem', padding: '1.25rem' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: accent, marginBottom: '0.75rem' }}>Trending Now</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {['System Design', 'React Performance', 'AI Ethics', 'Rust Lang'].map(t => (
                                            <div key={t} style={{ fontSize: '0.85rem', fontWeight: 600, color: txt2, cursor: 'pointer' }}>#{t}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style>{`
                .dashboard-grid { display: grid; grid-template-columns: 240px 1fr 280px; gap: 2rem; align-items: start; }
                @media (max-width: 1100px) {
                    .dashboard-grid { grid-template-columns: 1fr; }
                    .left-sidebar-container, .right-sidebar-container { 
                        position: fixed !important; top: 0; bottom: 0; width: 280px !important; z-index: 1000; 
                        background: ${card} !important; padding: 1.5rem !important; box-shadow: 0 0 40px rgba(0,0,0,0.3) !important; overflow-y: auto; 
                    }
                    .left-sidebar-container { left: 0; }
                    .right-sidebar-container { right: 0; }
                    .mobile-only-flex { display: flex !important; }
                }
                @media (min-width: 1101px) {
                    .left-sidebar-container, .right-sidebar-container { position: sticky !important; top: 6rem; }
                }
            `}</style>
        </div>
    );
};

export default KnowledgeFeed;
