import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import Navbar from '../components/AppNavbar';
import { motion } from 'framer-motion';

interface LeaderboardUser {
    _id: string;
    name: string;
    avatar: string;
    reputation: number;
    badges: { name: string; icon: string }[];
    stats: { postsCount: number; answersCount: number };
    rank: number;
}

const C = { bg: '#f8fafc', card: '#ffffff', border: '#e2e8f0', t1: '#0f172a', t2: '#475569', t3: '#94a3b8', accent: '#6366f1' };

const RANK_STYLE = [
    { bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)', border: '#fde68a', shadow: 'rgba(251,191,36,0.4)', icon: '🥇', label: 'Gold' },
    { bg: 'linear-gradient(135deg, #94a3b8, #64748b)', border: '#cbd5e1', shadow: 'rgba(148,163,184,0.4)', icon: '🥈', label: 'Silver' },
    { bg: 'linear-gradient(135deg, #f97316, #ea580c)', border: '#fed7aa', shadow: 'rgba(249,115,22,0.4)', icon: '🥉', label: 'Bronze' },
];

const Leaderboard = () => {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('all');

    useEffect(() => { fetchLeaderboard(); }, [period]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/users/leaderboard?period=${period}`);
            setUsers(res.data.leaderboard || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const top3 = users.slice(0, 3);
    const rest = users.slice(3);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: C.bg, fontFamily: '"Inter", sans-serif' }}>
            <Navbar />
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(to right, #fbbf24, #6366f1, #ec4899)', zIndex: 99 }} />

            <div style={{ maxWidth: 860, margin: '0 auto', padding: '7rem 1.5rem 4rem' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.accent, marginBottom: '0.5rem' }}>Hall of Fame</p>
                    <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', fontWeight: 900, color: C.t1, letterSpacing: '-0.03em', fontFamily: '"Space Grotesk", sans-serif', margin: '0 0 0.625rem' }}>
                        Community Leaderboard 🏆
                    </h1>
                    <p style={{ color: C.t2, fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
                        Top contributors making this community awesome. Keep sharing to climb the ranks!
                    </p>
                </div>

                {/* Period Tabs */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', background: C.card, border: `1px solid ${C.border}`, borderRadius: '0.875rem', padding: '0.375rem' }}>
                        {[
                            { key: 'week', label: 'This Week' },
                            { key: 'month', label: 'This Month' },
                            { key: 'all', label: 'All Time' },
                        ].map(p => (
                            <button key={p.key} onClick={() => setPeriod(p.key)} style={{
                                padding: '0.5rem 1.5rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer',
                                fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s',
                                background: period === p.key ? C.accent : 'transparent',
                                color: period === p.key ? '#fff' : C.t2,
                                boxShadow: period === p.key ? '0 2px 8px rgba(99,102,241,0.3)' : 'none'
                            }}>{p.label}</button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[1,2,3,4,5].map(i => (
                            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '1.25rem', animation: 'pulse 1.5s infinite', height: 80 }} />
                        ))}
                    </div>
                ) : users.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: C.card, border: `1px solid ${C.border}`, borderRadius: '1.25rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
                        <h3 style={{ color: C.t1, fontWeight: 700 }}>No data yet</h3>
                        <p style={{ color: C.t2, fontSize: '0.9rem' }}>Start posting and engaging to earn reputation!</p>
                    </div>
                ) : (
                    <>
                        {/* Top 3 Podium */}
                        {top3.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
                                {/* Reorder: 2nd, 1st, 3rd */}
                                {[top3[1], top3[0], top3[2]].map((u, visualIdx) => {
                                    if (!u) return null;
                                    const rankIdx = u === top3[0] ? 0 : u === top3[1] ? 1 : 2;
                                    const rs = RANK_STYLE[rankIdx];
                                    const heights = [180, 220, 160];
                                    const h = heights[visualIdx];
                                    return (
                                        <motion.div key={u._id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: visualIdx * 0.1 }}
                                            style={{ flex: 1, maxWidth: 220, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            {/* Crown for #1 */}
                                            {rankIdx === 0 && (
                                                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2 }} style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>👑</motion.div>
                                            )}
                                            <Link to={`/users/${u._id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff&bold=true`}
                                                        style={{ width: rankIdx === 0 ? 72 : 60, height: rankIdx === 0 ? 72 : 60, borderRadius: '50%', border: `3px solid ${rs.border}`, objectFit: 'cover', boxShadow: `0 0 20px ${rs.shadow}` }} />
                                                    <div style={{ position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, borderRadius: '50%', background: rs.bg, border: `2px solid ${C.card}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>
                                                        {rankIdx + 1}
                                                    </div>
                                                </div>
                                                <div style={{ fontWeight: 800, color: C.t1, fontSize: '0.9rem', textAlign: 'center' }}>{u.name}</div>
                                            </Link>
                                            {/* Pedestal */}
                                            <div style={{ width: '100%', height: h, background: rs.bg, borderRadius: '0.875rem 0.875rem 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '1rem', boxShadow: `0 -4px 20px ${rs.shadow}` }}>
                                                <div style={{ fontSize: rs.icon === '🥇' ? '1.5rem' : '1.25rem' }}>{rs.icon}</div>
                                                <div style={{ fontWeight: 900, color: '#fff', fontSize: '1.25rem', fontFamily: '"Space Grotesk", sans-serif', marginTop: '0.5rem' }}>{u.reputation.toLocaleString()}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>pts</div>
                                                <div style={{ marginTop: '0.625rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                                                    {u.stats?.postsCount || 0} posts · {u.stats?.answersCount || 0} answers
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Rest of leaderboard */}
                        {rest.length > 0 && (
                            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', overflow: 'hidden' }}>
                                <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 800, color: C.t1, fontSize: '0.9rem' }}>Runners Up</span>
                                    <span style={{ fontSize: '0.8rem', color: C.t3, fontWeight: 600 }}>{rest.length} more contributors</span>
                                </div>
                                {rest.map((u, i) => (
                                    <motion.div key={u._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: (i + 3) * 0.03 }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderBottom: i < rest.length - 1 ? `1px solid ${C.border}` : 'none', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = C.bg}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {/* Rank number */}
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: C.t2 }}>
                                            {i + 4}
                                        </div>

                                        {/* Avatar */}
                                        <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=e2e8f0&color=475569&bold=true`}
                                            style={{ width: 42, height: 42, borderRadius: '50%', border: `2px solid ${C.border}`, objectFit: 'cover', flexShrink: 0 }} />

                                        {/* Name & stats */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <Link to={`/users/${u._id}`} style={{ fontWeight: 700, color: C.t1, fontSize: '0.9rem', textDecoration: 'none' }}
                                                onMouseEnter={e => e.currentTarget.style.color = C.accent}
                                                onMouseLeave={e => e.currentTarget.style.color = C.t1}>
                                                {u.name}
                                            </Link>
                                            <div style={{ fontSize: '0.75rem', color: C.t3, marginTop: '0.125rem' }}>
                                                {u.stats?.postsCount || 0} posts · {u.stats?.answersCount || 0} answers
                                            </div>
                                        </div>

                                        {/* Badges */}
                                        {u.badges && u.badges.length > 0 && (
                                            <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                                                {u.badges.slice(0, 3).map((b, bi) => (
                                                    <span key={bi} title={b.name} style={{ width: 26, height: 26, borderRadius: '50%', background: C.bg, border: `1px solid ${C.border}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>
                                                        {b.icon}
                                                    </span>
                                                ))}
                                                {u.badges.length > 3 && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: C.t3, alignSelf: 'center' }}>+{u.badges.length - 3}</span>}
                                            </div>
                                        )}

                                        {/* Points */}
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontWeight: 900, color: C.accent, fontSize: '1rem', fontFamily: '"Space Grotesk", sans-serif' }}>
                                                {u.reputation.toLocaleString()}
                                            </div>
                                            <div style={{ fontSize: '0.68rem', color: C.t3, fontWeight: 600 }}>pts</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Call to action */}
                        <div style={{ marginTop: '2rem', textAlign: 'center', padding: '2rem', background: 'linear-gradient(135deg, #eff6ff, #faf5ff)', border: '1px solid #e0e7ff', borderRadius: '1rem' }}>
                            <div style={{ fontSize: '1.75rem', marginBottom: '0.625rem' }}>⚡</div>
                            <h3 style={{ fontWeight: 800, color: C.t1, marginBottom: '0.5rem', fontFamily: '"Space Grotesk", sans-serif' }}>Climb the ranks!</h3>
                            <p style={{ color: C.t2, fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                                Write articles, answer questions, and engage with the community to earn reputation points.
                            </p>
                            <Link to="/create-post" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.75rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', color: '#fff', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', boxShadow: '0 4px 14px rgba(99,102,241,0.25)' }}>
                                Start Contributing →
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
