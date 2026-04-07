import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/AppNavbar';

interface Project {
    _id: string;
    title: string;
    description: string;
    coverImage: string;
    tags: string[];
    author: { name: string; avatar: string };
    views: number;
    likes: string[];
    createdAt: string;
}

const C = { bg: '#f8fafc', card: '#ffffff', border: '#e2e8f0', t1: '#0f172a', t2: '#475569', t3: '#94a3b8', accent: '#6366f1' };
const FILTERS = ['All', 'Web', 'Mobile', 'AI', 'Game', 'Tool', 'Open Source'];

const ProjectGallery = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('popular');

    useEffect(() => {
        api.get('/projects')
            .then(r => setProjects(Array.isArray(r.data) ? r.data : []))
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, []);

    const filtered = projects
        .filter(p => {
            const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
            const matchFilter = activeFilter === 'All' || p.tags.some(t => t.toLowerCase().includes(activeFilter.toLowerCase()));
            return matchSearch && matchFilter;
        })
        .sort((a, b) => {
            if (sortBy === 'popular') return b.likes.length - a.likes.length || b.views - a.views;
            if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '"Inter", sans-serif' }}>
            <Navbar />
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(to right, #ec4899, #6366f1, #06b6d4)', zIndex: 99 }} />

            {/* Hero */}
            <div style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #eff6ff 60%, #f0fdf4 100%)', padding: '7rem 1.5rem 3.5rem', textAlign: 'center', borderBottom: `1px solid ${C.border}` }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ec4899', marginBottom: '0.5rem' }}>Community Showcase</p>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: C.t1, letterSpacing: '-0.03em', fontFamily: '"Space Grotesk", sans-serif', marginBottom: '1rem' }}>
                    Project <span style={{ background: 'linear-gradient(135deg, #ec4899, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Gallery</span> 🚀
                </h1>
                <p style={{ color: C.t2, fontSize: '1.05rem', maxWidth: 520, margin: '0 auto 2rem', lineHeight: 1.7 }}>
                    Explore what our community is building — open source, experimental, and inspiring.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {[
                        { label: 'Projects', value: projects.length, icon: '🚀' },
                        { label: 'Total Likes', value: projects.reduce((s, p) => s + p.likes.length, 0), icon: '❤️' },
                        { label: 'Total Views', value: projects.reduce((s, p) => s + (p.views || 0), 0), icon: '👁️' },
                    ].map(s => (
                        <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '0.875rem', padding: '0.875rem 1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: C.t1, fontFamily: '"Space Grotesk", sans-serif' }}>{s.icon} {s.value}</div>
                            <div style={{ fontSize: '0.72rem', color: C.t3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.15rem' }}>{s.label}</div>
                        </div>
                    ))}
                    <Link to="/submit-project" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1.75rem', borderRadius: '0.875rem', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', color: '#fff', background: 'linear-gradient(135deg, #ec4899, #6366f1)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)', alignSelf: 'center' }}>
                        <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        Submit Project
                    </Link>
                </div>
            </div>

            {/* Controls */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1.5rem 0' }}>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '0.75rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                    {/* Filter chips */}
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {FILTERS.map(f => (
                            <button key={f} onClick={() => setActiveFilter(f)} style={{ padding: '0.375rem 0.875rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', transition: 'all 0.2s', background: activeFilter === f ? C.accent : 'transparent', color: activeFilter === f ? '#fff' : C.t2 }}>{f}</button>
                        ))}
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: C.t3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ padding: '0.45rem 0.75rem 0.45rem 2rem', borderRadius: '0.5rem', border: `1px solid ${C.border}`, fontSize: '0.82rem', color: C.t1, background: C.bg, outline: 'none', width: 180, fontFamily: '"Inter", sans-serif' }} />
                        </div>
                        {/* Sort */}
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '0.45rem 0.75rem', borderRadius: '0.5rem', border: `1px solid ${C.border}`, fontSize: '0.82rem', color: C.t2, background: C.bg, fontWeight: 700, outline: 'none', cursor: 'pointer' }}>
                            <option value="popular">Popular</option>
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem' }}>
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {[1,2,3,4,5,6].map(i => <div key={i} style={{ background: C.card, borderRadius: '1.25rem', height: 320, animation: 'pulse 1.5s infinite', border: `1px solid ${C.border}` }} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem', background: C.card, borderRadius: '1.25rem', border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                        <h3 style={{ color: C.t1, fontWeight: 700 }}>No projects found</h3>
                        <button onClick={() => { setActiveFilter('All'); setSearch(''); }} style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', borderRadius: '0.625rem', background: C.accent, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Clear Filters</button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        <AnimatePresence>
                            {filtered.map((project, i) => (
                                <motion.div key={project._id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}>
                                    <Link to={`/projects/${project._id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%', background: C.card, borderRadius: '1.25rem', border: `1px solid ${C.border}`, overflow: 'hidden', transition: 'all 0.25s ease' }}
                                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                                        {/* Cover image */}
                                        <div style={{ height: 200, background: project.coverImage ? 'transparent' : 'linear-gradient(135deg, #e2e8f0, #f1f5f9)', position: 'relative', overflow: 'hidden' }}>
                                            {project.coverImage
                                                ? <img src={project.coverImage} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                                                : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #eff6ff, #faf5ff)' }}>
                                                    <span style={{ fontSize: '3rem', opacity: 0.5 }}>🚀</span>
                                                    <span style={{ fontSize: '0.7rem', color: C.t3, fontWeight: 700, marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>No Preview</span>
                                                </div>}
                                            {/* Overlay stats */}
                                            <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <img src={project.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.author?.name || 'U')}&background=6366f1&color=fff&bold=true`}
                                                    style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #fff', objectFit: 'cover' }} />
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <span style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>❤️ {project.likes.length}</span>
                                                    <span style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>👁️ {project.views || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Content */}
                                        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                                {project.tags.slice(0, 3).map(t => (
                                                    <span key={t} style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '0.25rem', background: '#eff6ff', color: '#3730a3', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t}</span>
                                                ))}
                                            </div>
                                            <h3 style={{ fontWeight: 800, color: C.t1, fontSize: '1rem', fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1.3, margin: 0 }}>{project.title}</h3>
                                            <p style={{ color: C.t2, fontSize: '0.85rem', lineHeight: 1.6, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: 0 }}>{project.description}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: `1px solid ${C.border}`, fontSize: '0.75rem', color: C.t3, fontWeight: 600 }}>
                                                <span>by {project.author?.name || 'Anonymous'}</span>
                                                <span>{new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectGallery;
