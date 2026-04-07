import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/AppNavbar';
import PollWidget from '../components/PollWidget';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const C = { bg: '#f8fafc', card: '#ffffff', border: '#e2e8f0', t1: '#0f172a', t2: '#475569', t3: '#94a3b8', accent: '#6366f1' };
const ROOM_ICONS = ['🚀', '💡', '🔬', '🛡️', '🎨', '📊', '💬', '⚡', '🌐', '🧠'];
const ROOM_GRADIENTS = [
    'linear-gradient(135deg, #eff6ff, #dbeafe)',
    'linear-gradient(135deg, #f0fdf4, #dcfce7)',
    'linear-gradient(135deg, #faf5ff, #ede9fe)',
    'linear-gradient(135deg, #fff7ed, #fed7aa)',
    'linear-gradient(135deg, #fdf2e8, #fbcfe8)',
    'linear-gradient(135deg, #fefce8, #fef08a)',
    'linear-gradient(135deg, #eff6ff, #bfdbfe)',
    'linear-gradient(135deg, #f0fdfa, #99f6e4)',
];

const Community = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const [rooms, setRooms] = useState<any[]>([]);
    const [polls, setPolls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchRoom, setSearchRoom] = useState('');
    const [creatingRoom, setCreatingRoom] = useState(false);
    const [showRightSidebar, setShowRightSidebar] = useState(false);

    const fetchData = async () => {
        try {
            const [roomsRes, pollsRes] = await Promise.all([
                api.get('/community/rooms'),
                api.get('/community/polls')
            ]);
            setRooms(roomsRes.data || []);
            setPolls(pollsRes.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDeleteRoom = async (e: React.MouseEvent, roomId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return;
        if (!window.confirm('Delete this community room? This action cannot be undone.')) return;
        try {
            await api.delete(`/community/rooms/${roomId}`);
            toast.success('Room deleted successfully');
            fetchData();
        } catch {
            toast.error('Failed to delete room. You may not have permission.');
        }
    };

    const handleCreatePoll = async () => {
        if (!user) return alert('Login required');
        const question = prompt('Poll Question:');
        if (!question) return;
        const optionsStr = prompt('Options (comma separated):');
        if (!optionsStr) return;
        try {
            await api.post('/community/polls', {
                question,
                options: optionsStr.split(',').map(s => s.trim()),
                expiresAt: new Date(Date.now() + 86400000 * 7)
            });
            fetchData();
        } catch { alert('Failed to create poll'); }
    };

    const handleCreateRoom = async () => {
        if (!user) return alert('Login required');
        const name = prompt('Room Name:');
        if (!name) return;
        const desc = prompt('Description (optional):');
        const topics = prompt('Topics (comma separated, optional):');
        setCreatingRoom(true);
        try {
            await api.post('/community/rooms', {
                name, description: desc || '',
                topics: topics ? topics.split(',').map(s => s.trim()) : [],
                icon: '💬'
            });
            fetchData();
        } catch { alert('Failed to create room'); }
        finally { setCreatingRoom(false); }
    };

    const filteredRooms = rooms.filter(r =>
        !searchRoom || r.name?.toLowerCase().includes(searchRoom.toLowerCase()) || r.description?.toLowerCase().includes(searchRoom.toLowerCase())
    );

    const sidebarVariants = {
        hidden: { x: 300, opacity: 0 },
        visible: { x: 0, opacity: 1 }
    };

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '"Inter", sans-serif', overflowX: 'hidden' }}>
            <Navbar />
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(to right, #06b6d4, #6366f1, #a855f7)', zIndex: 99 }} />

            {/* Hero */}
            <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #faf5ff 60%, #f0fdf4 100%)', padding: '7rem 1.5rem 3.5rem', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div>
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#06b6d4', marginBottom: '0.5rem' }}>
                                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#10b981', marginRight: '0.375rem', verticalAlign: 'middle', animation: 'pulse 2s infinite' }} />
                                Global Network · Live
                            </p>
                            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900, color: C.t1, letterSpacing: '-0.03em', fontFamily: '"Space Grotesk", sans-serif', marginBottom: '0.875rem' }}>
                                Community <span style={{ background: 'linear-gradient(135deg, #06b6d4, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hub</span> 🌐
                            </h1>
                            <p style={{ color: C.t2, fontSize: '1rem', maxWidth: 500, lineHeight: 1.7 }}>
                                Join thousands worldwide. Discuss, collaborate, and share knowledge in real-time topic rooms.
                            </p>
                        </div>
                        <button onClick={handleCreateRoom} disabled={creatingRoom} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1.75rem', borderRadius: '0.875rem', fontWeight: 700, fontSize: '0.925rem', color: '#fff', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.3)', opacity: creatingRoom ? 0.7 : 1 }}>
                            <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            {creatingRoom ? 'Creating...' : 'Create New Room'}
                        </button>
                    </div>

                    {/* Stat chips */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {[
                            { label: 'Active Rooms', value: rooms.length, icon: '💬', color: '#06b6d4' },
                            { label: 'Live Polls', value: polls.length, icon: '📊', color: '#a855f7' },
                            { label: 'Total Votes', value: polls.reduce((s: number, p: any) => s + (p.options?.reduce((ov: number, o: any) => ov + (o.votes?.length || 0), 0) || 0), 0), icon: '🗳️', color: '#6366f1' },
                            { label: 'Members', value: rooms.reduce((s: number, r: any) => s + (r.members?.length || 0), 0), icon: '👥', color: '#10b981' },
                        ].map(s => (
                            <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '0.875rem', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '1.25rem' }}>{s.icon}</span>
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: s.color, fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1 }}>{s.value}</div>
                                    <div style={{ fontSize: '0.7rem', color: C.t3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Toggle */}
            <div style={{ display: 'none', padding: '1rem 1.5rem 0' }} className="mobile-only-flex">
                <button onClick={() => setShowRightSidebar(true)} style={{ width: '100%', padding: '0.9rem', background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', fontWeight: 700, color: C.t1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        📊 Community Insights & Polls
                        <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} style={{ fontSize: '0.9rem' }}>👆</motion.span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: '#f0fdf4', padding: '0.2rem 0.625rem', borderRadius: '99px', border: '1px solid #bbf7d0' }}>
                         <motion.div animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.6)' }} />
                         <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#166534', letterSpacing: '0.04em' }}>LIVE NOW</span>
                    </div>
                </button>
            </div>

            {/* Main content */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }} className="community-grid">

                {/* Left — Rooms */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
                        <h2 style={{ fontWeight: 800, color: C.t1, fontSize: '1rem', fontFamily: '"Space Grotesk", sans-serif' }}>
                            💬 Active Discussion Rooms
                            <span style={{ marginLeft: '0.625rem', fontSize: '0.78rem', fontWeight: 600, color: C.t3, fontFamily: '"Inter", sans-serif' }}>{rooms.length} rooms</span>
                        </h2>
                        {/* Search rooms */}
                        <div style={{ position: 'relative' }}>
                            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: C.t3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input value={searchRoom} onChange={e => setSearchRoom(e.target.value)} placeholder="Search rooms..."
                                style={{ padding: '0.45rem 0.75rem 0.45rem 2.25rem', borderRadius: '0.625rem', border: `1px solid ${C.border}`, fontSize: '0.82rem', color: C.t1, background: C.card, outline: 'none', width: 200, fontFamily: '"Inter", sans-serif' }} />
                        </div>
                    </div>

                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} style={{ background: C.card, borderRadius: '1rem', height: 110, marginBottom: '1rem', animation: 'pulse 1.5s infinite', border: `1px solid ${C.border}` }} />)
                    ) : filteredRooms.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: C.card, borderRadius: '1.25rem', border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                            <h3 style={{ color: C.t1, fontWeight: 700, marginBottom: '0.5rem' }}>No rooms yet</h3>
                            <p style={{ color: C.t2, fontSize: '0.875rem', marginBottom: '1.25rem' }}>Be the first to create a discussion room!</p>
                            <button onClick={handleCreateRoom} style={{ padding: '0.65rem 1.5rem', borderRadius: '0.75rem', background: C.accent, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                                Create First Room →
                            </button>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredRooms.map((room, i) => (
                                <motion.div key={room._id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ delay: i * 0.04 }} style={{ marginBottom: '0.875rem' }}>
                                    <Link to={`/community/rooms/${room._id}`} style={{ textDecoration: 'none', display: 'block' }}
                                        onMouseEnter={e => { const c = e.currentTarget; c.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; c.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={e => { const c = e.currentTarget; c.style.boxShadow = 'none'; c.style.transform = 'none'; }}>
                                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1.25rem', transition: 'all 0.2s ease' }}>
                                            {/* Room icon */}
                                            <div style={{ width: 54, height: 54, borderRadius: '0.875rem', flexShrink: 0, background: ROOM_GRADIENTS[i % ROOM_GRADIENTS.length], border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
                                                {room.icon || ROOM_ICONS[i % ROOM_ICONS.length]}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                                                    <h3 style={{ fontWeight: 800, color: C.t1, fontSize: '1rem', fontFamily: '"Space Grotesk", sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</h3>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 700, color: C.t3, background: C.bg, border: `1px solid ${C.border}`, padding: '0.2rem 0.625rem', borderRadius: '999px', flexShrink: 0, marginLeft: '0.5rem' }}>
                                                        <svg style={{ width: 11, height: 11 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                        {room.members?.length || 0}
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: '0.875rem', color: C.t2, lineHeight: 1.6, marginBottom: '0.75rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                    {room.description || 'Join the discussion and share your insights.'}
                                                </p>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                                    {(room.topics || []).slice(0, 4).map((t: string) => (
                                                        <span key={t} style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '0.25rem', background: '#eff6ff', color: '#3730a3' }}>#{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', alignSelf: 'center' }}>
                                                {(user?.role === 'admin' || user?._id === room.creator) && (
                                                    <button onClick={(e) => handleDeleteRoom(e, room._id)} 
                                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.5rem', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                                        title="Delete Room">
                                                        <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                )}
                                                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: '#eff6ff', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent }}>
                                                    <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Right sidebar */}
                <AnimatePresence>
                    {showRightSidebar && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRightSidebar(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', zIndex: 999 }} />
                            <motion.div initial="hidden" animate="visible" exit="hidden" variants={sidebarVariants} transition={{ type: 'spring', damping: 25 }} className="right-sidebar-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', zIndex: 1000 }}>
                                <button className="mobile-only-flex" onClick={() => setShowRightSidebar(false)} style={{ width: '100%', padding: '0.875rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '0.5rem', fontWeight: 700, marginBottom: '0.5rem', display: 'none' }}>Close Insights</button>
                                
                                {/* Polls panel */}
                                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', overflow: 'hidden' }}>
                                    <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #faf5ff, #eff6ff)' }}>
                                        <h2 style={{ fontWeight: 800, color: C.t1, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            🔥 Hot Polls
                                        </h2>
                                        {user && (
                                            <button onClick={handleCreatePoll} style={{ background: 'none', border: 'none', color: C.accent, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>+ New</button>
                                        )}
                                    </div>
                                    <div style={{ padding: '1rem' }}>
                                        {polls.length === 0 ? (
                                            <p style={{ color: C.t2, fontSize: '0.875rem', textAlign: 'center' }}>No active polls.</p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                                {polls.slice(0, 3).map((poll: any) => (
                                                    <div key={poll._id} style={{ padding: '0.875rem', background: C.bg, borderRadius: '0.75rem', border: `1px solid ${C.border}` }}>
                                                        <PollWidget poll={poll} onVote={fetchData} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Community stats */}
                                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '1.25rem' }}>
                                    <h4 style={{ fontSize: '0.72rem', fontWeight: 800, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Community Stats</h4>
                                    {[
                                        { label: 'Active Rooms', value: rooms.length, icon: '💬', color: '#06b6d4' },
                                        { label: 'Live Polls', value: polls.length, icon: '📊', color: '#a855f7' },
                                        { label: 'Total Members', value: rooms.reduce((s: number, r: any) => s + (r.members?.length || 0), 0), icon: '👥', color: '#10b981' },
                                    ].map(stat => (
                                        <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.625rem 0', borderBottom: `1px solid ${C.border}` }}>
                                            <span style={{ fontSize: '1.1rem' }}>{stat.icon}</span>
                                            <span style={{ flex: 1, color: C.t2, fontSize: '0.875rem', fontWeight: 500 }}>{stat.label}</span>
                                            <span style={{ fontWeight: 900, color: stat.color, fontFamily: '"Space Grotesk", sans-serif', fontSize: '1rem' }}>{stat.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Pro upgrade card */}
                                <div style={{ borderRadius: '1rem', padding: '1.5rem', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ fontSize: '1.75rem', marginBottom: '0.625rem' }}>⚡</div>
                                        <h3 style={{ fontWeight: 800, color: '#fff', marginBottom: '0.375rem', fontSize: '0.975rem' }}>Pro Access</h3>
                                        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                                            Private channels & premium support.
                                        </p>
                                        <button style={{ width: '100%', padding: '0.625rem', borderRadius: '0.625rem', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>Upgrade →</button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                    {window.innerWidth >= 1101 && (
                        <div className="right-sidebar-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Polls panel */}
                            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', overflow: 'hidden' }}>
                                <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #faf5ff, #eff6ff)' }}>
                                    <h2 style={{ fontWeight: 800, color: C.t1, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        🔥 Hot Polls
                                    </h2>
                                    {user && (
                                        <button onClick={handleCreatePoll} style={{ background: 'none', border: 'none', color: C.accent, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>+ New</button>
                                    )}
                                </div>
                                <div style={{ padding: '1rem' }}>
                                    {polls.length === 0 ? (
                                        <p style={{ color: C.t2, fontSize: '0.875rem', textAlign: 'center' }}>No active polls.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                            {polls.slice(0, 3).map((poll: any) => (
                                                <div key={poll._id} style={{ padding: '0.875rem', background: C.bg, borderRadius: '0.75rem', border: `1px solid ${C.border}` }}>
                                                    <PollWidget poll={poll} onVote={fetchData} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Community stats */}
                            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '1.25rem' }}>
                                <h4 style={{ fontSize: '0.72rem', fontWeight: 800, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Community Stats</h4>
                                {[
                                    { label: 'Active Rooms', value: rooms.length, icon: '💬', color: '#06b6d4' },
                                    { label: 'Live Polls', value: polls.length, icon: '📊', color: '#a855f7' },
                                    { label: 'Total Members', value: rooms.reduce((s: number, r: any) => s + (r.members?.length || 0), 0), icon: '👥', color: '#10b981' },
                                ].map(stat => (
                                    <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.625rem 0', borderBottom: `1px solid ${C.border}` }}>
                                        <span style={{ fontSize: '1.1rem' }}>{stat.icon}</span>
                                        <span style={{ flex: 1, color: C.t2, fontSize: '0.875rem', fontWeight: 500 }}>{stat.label}</span>
                                        <span style={{ fontWeight: 900, color: stat.color, fontFamily: '"Space Grotesk", sans-serif', fontSize: '1rem' }}>{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                            {/* Pro upgrade card */}
                            <div style={{ borderRadius: '1rem', padding: '1.5rem', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                                <div style={{ position: 'relative' }}>
                                    <div style={{ fontSize: '1.75rem', marginBottom: '0.625rem' }}>⚡</div>
                                    <h3 style={{ fontWeight: 800, color: '#fff', marginBottom: '0.375rem', fontSize: '0.975rem' }}>Pro Access</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                                        Private channels & premium support.
                                    </p>
                                    <button style={{ width: '100%', padding: '0.625rem', borderRadius: '0.625rem', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>Upgrade →</button>
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                .community-grid { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; align-items: start; }
                @media (max-width: 1100px) {
                    .community-grid { grid-template-columns: 1fr; }
                    .right-sidebar-container { 
                        position: fixed !important; top: 0; bottom: 0; right: 0; width: 300px !important; z-index: 1000; 
                        background: ${C.card} !important; padding: 1.5rem !important; box-shadow: -10px 0 40px rgba(0,0,0,0.2) !important; overflow-y: auto; 
                    }
                    .mobile-only-flex { display: flex !important; }
                }
                @media (min-width: 1101px) {
                    .right-sidebar-container { position: sticky !important; top: 6rem; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

export default Community;
