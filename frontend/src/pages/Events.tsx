import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/AppNavbar';
import { AuthContext } from '../context/AuthContext';

interface Event {
    _id: string;
    title: string;
    description: string;
    date: string;
    link: string;
    type: string;
    host: { name: string; avatar: string };
    attendees: string[];
}

const C = { bg: '#f8fafc', card: '#ffffff', border: '#e2e8f0', t1: '#0f172a', t2: '#475569', t3: '#94a3b8', accent: '#6366f1' };

const TYPE_COLOR: Record<string, { bg: string; text: string }> = {
    Workshop:  { bg: '#eff6ff', text: '#1d4ed8' },
    Webinar:   { bg: '#faf5ff', text: '#7e22ce' },
    Hackathon: { bg: '#fff7ed', text: '#c2410c' },
    Talk:      { bg: '#f0fdf4', text: '#166534' },
    AMA:       { bg: '#fdf2f8', text: '#9d174d' },
};

const Events = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [registering, setRegistering] = useState<string | null>(null);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchEvents(); }, []);

    const handleRegister = async (id: string, isReg: boolean) => {
        if (!user) return alert('Please login to register');
        setRegistering(id);
        try {
            await api({ method: isReg ? 'delete' : 'post', url: `/events/${id}/register` });
            fetchEvents();
        } catch (err) { console.error(err); }
        finally { setRegistering(null); }
    };

    const types = ['All', ...Array.from(new Set(events.map(e => e.type).filter(Boolean)))];
    const now = new Date();
    const upcoming = events.filter(e => new Date(e.date) > now).length;
    const filtered = filter === 'All' ? events : events.filter(e => e.type === filter);

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '"Inter", sans-serif' }}>
            <Navbar />
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(to right, #6366f1, #06b6d4, #10b981)', zIndex: 99 }} />

            {/* Hero */}
            <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', padding: '7rem 1.5rem 3.5rem', textAlign: 'center', borderBottom: `1px solid ${C.border}` }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.accent, marginBottom: '0.5rem' }}>Community Events</p>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900, color: C.t1, letterSpacing: '-0.03em', fontFamily: '"Space Grotesk", sans-serif', marginBottom: '1rem' }}>
                    Connect. Learn. <span style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Grow Together.</span> 📅
                </h1>
                <p style={{ color: C.t2, fontSize: '1.05rem', maxWidth: 480, margin: '0 auto 2rem', lineHeight: 1.7 }}>
                    Live workshops, AMA sessions, and hackathons hosted by our expert community.
                </p>
                {/* Stat chips */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    {[
                        { label: 'Total Events', value: events.length, icon: '📅', color: C.accent },
                        { label: 'Upcoming', value: upcoming, icon: '🔜', color: '#10b981' },
                        { label: 'Total Attendees', value: events.reduce((s, e) => s + e.attendees.length, 0), icon: '👥', color: '#6366f1' },
                    ].map(s => (
                        <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '0.875rem', padding: '0.875rem 1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: s.color, fontFamily: '"Space Grotesk", sans-serif' }}>{s.icon} {s.value}</div>
                            <div style={{ fontSize: '0.72rem', color: C.t3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.15rem' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
                {/* Type filter */}
                <div style={{ display: 'inline-flex', gap: '0.3rem', background: C.card, border: `1px solid ${C.border}`, borderRadius: '0.875rem', padding: '0.375rem' }}>
                    {types.map(t => (
                        <button key={t} onClick={() => setFilter(t)} style={{ padding: '0.4rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.2s', background: filter === t ? C.accent : 'transparent', color: filter === t ? '#fff' : C.t2 }}>{t}</button>
                    ))}
                </div>
            </div>

            {/* Events List */}
            <div style={{ maxWidth: 860, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
                {loading ? (
                    [1,2,3].map(i => <div key={i} style={{ background: C.card, borderRadius: '1rem', height: 140, marginBottom: '1rem', animation: 'pulse 1.5s infinite', border: `1px solid ${C.border}` }} />)
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', background: C.card, borderRadius: '1.25rem', border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                        <h3 style={{ color: C.t1, fontWeight: 700 }}>No events found</h3>
                        <p style={{ color: C.t2, fontSize: '0.9rem', marginTop: '0.5rem' }}>Check back soon — events are added regularly.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filtered.map((event, i) => {
                            const isReg = !!user && event.attendees.includes(user._id);
                            const eDate = new Date(event.date);
                            const isPast = eDate < now;
                            const isLive = !isPast && eDate.getTime() - now.getTime() < 2 * 3600 * 1000;
                            const tc = TYPE_COLOR[event.type] || { bg: '#f1f5f9', text: '#475569' };
                            return (
                                <motion.div key={event._id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}
                                    style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '1.5rem', marginBottom: '1rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
                                    {/* Status strip */}
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: isPast ? '#e2e8f0' : isLive ? '#ef4444' : 'linear-gradient(to right, #6366f1, #06b6d4)' }} />

                                    {/* Date box */}
                                    <div style={{ flexShrink: 0, width: 64, height: 64, borderRadius: '0.875rem', background: isPast ? C.bg : 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px solid ${isPast ? C.border : 'transparent'}` }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: isPast ? C.t3 : 'rgba(255,255,255,0.8)', letterSpacing: '0.08em' }}>{eDate.toLocaleString('default', { month: 'short' })}</span>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: isPast ? C.t2 : '#fff', lineHeight: 1.1 }}>{eDate.getDate()}</span>
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                            {isLive && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '999px', animation: 'pulse 1.5s infinite' }}>● LIVE</span>}
                                            {isPast && <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '999px', background: '#f1f5f9', color: C.t3 }}>Past</span>}
                                            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', background: tc.bg, color: tc.text }}>{event.type}</span>
                                            <span style={{ fontSize: '0.78rem', color: C.t3, fontWeight: 500 }}>
                                                {eDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · {eDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <h3 style={{ fontWeight: 800, color: C.t1, fontSize: '1.1rem', marginBottom: '0.5rem', fontFamily: '"Space Grotesk", sans-serif' }}>{event.title}</h3>
                                        <p style={{ color: C.t2, fontSize: '0.875rem', lineHeight: 1.65, marginBottom: '1rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{event.description}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem', color: C.t3, fontWeight: 600 }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                <img src={event.host?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.host?.name || 'Host')}&background=e2e8f0&color=475569&bold=true`}
                                                    style={{ width: 20, height: 20, borderRadius: '50%', border: `1px solid ${C.border}` }} />
                                                {event.host?.name || 'Anonymous'}
                                            </span>
                                            <span>📍 Virtual</span>
                                            <span>👥 {event.attendees.length} attending</span>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {!isPast && (
                                            <button onClick={() => handleRegister(event._id, isReg)} disabled={registering === event._id} style={{
                                                padding: '0.6rem 1.25rem', borderRadius: '0.625rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', border: 'none', minWidth: 120, transition: 'all 0.2s', opacity: registering === event._id ? 0.7 : 1,
                                                background: isReg ? '#f0fdf4' : 'linear-gradient(135deg, #6366f1, #06b6d4)',
                                                color: isReg ? '#166534' : '#fff',
                                                boxShadow: isReg ? 'none' : '0 4px 12px rgba(99,102,241,0.25)',
                                            }}>
                                                {registering === event._id ? '...' : isReg ? '✓ Registered' : 'Register Now'}
                                            </button>
                                        )}
                                        {event.link && isReg && !isPast && (
                                            <a href={event.link} target="_blank" rel="noopener noreferrer" style={{ textAlign: 'center', padding: '0.5rem', borderRadius: '0.625rem', fontSize: '0.78rem', fontWeight: 700, color: C.accent, background: '#eff6ff', textDecoration: 'none' }}>
                                                Join Link →
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default Events;
