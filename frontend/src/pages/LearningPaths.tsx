import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/AppNavbar';
import { motion, AnimatePresence } from 'framer-motion';

interface LearningPath {
    _id: string;
    title: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    tags: string[];
    author: { name: string; avatar?: string };
    modules: { steps: any[] }[];
    enrolledCount?: number;
    completionRate?: number;
}

const DIFF = {
    Beginner:     { from: '#10b981', to: '#059669', badge: '#d1fae5', badgeText: '#065f46', icon: '🌱' },
    Intermediate: { from: '#6366f1', to: '#4f46e5', badge: '#e0e7ff', badgeText: '#3730a3', icon: '⚡' },
    Advanced:     { from: '#f97316', to: '#dc2626', badge: '#ffedd5', badgeText: '#9a3412', icon: '🔥' },
};

const C = { bg: '#f8fafc', card: '#ffffff', border: '#e2e8f0', t1: '#0f172a', t2: '#475569', t3: '#94a3b8', accent: '#6366f1' };

const LearningPaths = () => {
    const [paths, setPaths] = useState<LearningPath[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [level, setLevel] = useState('All');

    useEffect(() => {
        api.get('/learning-paths')
            .then(r => setPaths(Array.isArray(r.data) ? r.data : []))
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, []);

    const filtered = paths.filter(p => {
        const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
        const matchLevel = level === 'All' || p.difficulty === level;
        return matchSearch && matchLevel;
    });

    const stats = {
        total: paths.length,
        beginner: paths.filter(p => p.difficulty === 'Beginner').length,
        intermediate: paths.filter(p => p.difficulty === 'Intermediate').length,
        advanced: paths.filter(p => p.difficulty === 'Advanced').length,
    };

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '"Inter", sans-serif' }}>
            <Navbar />
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(to right, #10b981, #6366f1, #f97316)', zIndex: 99 }} />

            {/* Hero */}
            <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 50%, #faf5ff 100%)', padding: '7rem 1.5rem 4rem', textAlign: 'center', borderBottom: `1px solid ${C.border}` }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#10b981', marginBottom: '0.5rem' }}>Curated Roadmaps</p>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: C.t1, letterSpacing: '-0.03em', fontFamily: '"Space Grotesk", sans-serif', marginBottom: '1rem' }}>
                    Master Your <span style={{ background: 'linear-gradient(135deg, #6366f1, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Craft</span>
                </h1>
                <p style={{ color: C.t2, fontSize: '1.1rem', maxWidth: 560, margin: '0 auto 2rem', lineHeight: 1.7 }}>
                    Structured learning paths designed by experts to take you from beginner to pro.
                </p>

                {/* Stats row */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    {[
                        { label: 'Total Paths', value: stats.total, color: C.accent },
                        { label: '🌱 Beginner', value: stats.beginner, color: '#10b981' },
                        { label: '⚡ Intermediate', value: stats.intermediate, color: '#6366f1' },
                        { label: '🔥 Advanced', value: stats.advanced, color: '#f97316' },
                    ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color, fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: '0.75rem', color: C.t3, fontWeight: 700, marginTop: '0.25rem' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Search + level filter */}
                <div style={{ display: 'flex', gap: '0.75rem', maxWidth: 680, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
                        <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: C.t3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search paths..."
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '0.75rem', border: `1px solid ${C.border}`, fontSize: '0.9rem', color: C.t1, background: C.card, outline: 'none', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.375rem', background: C.card, border: `1px solid ${C.border}`, borderRadius: '0.75rem', padding: '0.375rem' }}>
                        {['All', 'Beginner', 'Intermediate', 'Advanced'].map(l => (
                            <button key={l} onClick={() => setLevel(l)} style={{ padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', transition: 'all 0.2s', background: level === l ? C.accent : 'transparent', color: level === l ? '#fff' : C.t2 }}>{l}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <span style={{ fontWeight: 700, color: C.t2, fontSize: '0.9rem' }}>{filtered.length} path{filtered.length !== 1 ? 's' : ''} {level !== 'All' ? `· ${level}` : ''}</span>
                    {(search || level !== 'All') && (
                        <button onClick={() => { setSearch(''); setLevel('All'); }} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Clear filters ×</button>
                    )}
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} style={{ background: C.card, borderRadius: '1.25rem', height: 340, animation: 'pulse 1.5s infinite', border: `1px solid ${C.border}` }} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', background: C.card, borderRadius: '1.25rem', border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
                        <h3 style={{ color: C.t1, fontWeight: 700, marginBottom: '0.5rem' }}>No paths found</h3>
                        <p style={{ color: C.t2, fontSize: '0.9rem' }}>Try different keywords or clear your filters.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        <AnimatePresence>
                            {filtered.map((path, i) => {
                                const d = DIFF[path.difficulty] || DIFF.Beginner;
                                const totalSteps = path.modules?.reduce((a, m) => a + (m.steps?.length || 0), 0) || 0;
                                return (
                                    <motion.div key={path._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}>
                                        <Link to={`/learning-paths/${path._id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%', background: C.card, borderRadius: '1.25rem', border: `1px solid ${C.border}`, overflow: 'hidden', transition: 'all 0.25s ease' }}
                                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                                            {/* Gradient banner */}
                                            <div style={{ height: 140, background: `linear-gradient(135deg, ${d.from}, ${d.to})`, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: '1.25rem' }}>
                                                <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                                                <div style={{ position: 'absolute', top: 16, right: 16, fontSize: '2.5rem', opacity: 0.8 }}>{d.icon}</div>
                                                <div>
                                                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.25)', color: '#fff', backdropFilter: 'blur(8px)' }}>
                                                        {path.difficulty}
                                                    </span>
                                                    <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem', marginTop: '0.5rem', fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1.3, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                                                        {path.title}
                                                    </h3>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                                <p style={{ color: C.t2, fontSize: '0.875rem', lineHeight: 1.65, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                                    {path.description}
                                                </p>
                                                {/* Tags */}
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                                    {path.tags?.slice(0, 3).map(t => (
                                                        <span key={t} style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '0.375rem', background: d.badge, color: d.badgeText }}>#{t}</span>
                                                    ))}
                                                    {(path.tags?.length || 0) > 3 && <span style={{ fontSize: '0.7rem', fontWeight: 600, color: C.t3 }}>+{(path.tags?.length || 0) - 3}</span>}
                                                </div>
                                                {/* Footer */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.875rem', borderTop: `1px solid ${C.border}` }}>
                                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: C.t3, fontWeight: 600 }}>
                                                        <span>📋 {totalSteps} steps</span>
                                                        {(path.enrolledCount || 0) > 0 && <span>👥 {path.enrolledCount} enrolled</span>}
                                                    </div>
                                                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: C.t3 }}>
                                                        by {path.author?.name || 'Expert'}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearningPaths;
