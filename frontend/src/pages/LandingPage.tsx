import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/AppNavbar';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = ['For You', 'Technology', 'Design', 'Productivity'] as const;
type Tab = typeof TABS[number];

const FEED_CONTENT: Record<Tab, Array<{ author: string; title: string; desc: string; tag: string; date: string; img: string }>> = {
    'For You': [
        { author: "Will Larson", title: "Writing an Engineering Strategy", desc: "Strategies are about tradeoffs. Good strategies make those tradeoffs explicit and help teams move faster by reducing decision paralysis.", tag: "Management", date: "Dec 4", img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop" },
        { author: "Addy Osmani", title: "Image Optimization in 2025", desc: "New formats like AVIF, proper sizing attributes, and lazy loading strategies can cut your LCP in half.", tag: "Performance", date: "Dec 3", img: "https://images.unsplash.com/photo-1550439062-609e1531270e?w=400&h=300&fit=crop" },
        { author: "Kent C. Dodds", title: "Full Stack Components with RSC", desc: "The lines between client and server are blurring. Here is how to think about component composition in a RSC world.", tag: "React", date: "Dec 1", img: "https://images.unsplash.com/photo-1633356122102-3fe601e15fae?w=400&h=300&fit=crop" },
    ],
    'Technology': [
        { author: "Tech Crunch", title: "The Rise of Quantum Computing", desc: "Quantum supremacy is closer than we think. Here's a look at the latest breakthroughs from IBM and Google.", tag: "Future Tech", date: "Dec 10", img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop" },
        { author: "Verge Science", title: "AI in Healthcare: A Revolution", desc: "From diagnosing rare diseases to personalized medicine, artificial intelligence is reshaping the medical landscape.", tag: "AI", date: "Dec 9", img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop" },
        { author: "Wired", title: "Cybersecurity in 2025", desc: "As threats evolve, so must our defenses. Zero trust architecture is becoming the new standard.", tag: "Security", date: "Dec 8", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop" },
    ],
    'Design': [
        { author: "Smashing Mag", title: "Typography Trends for 2025", desc: "Serifs are back, neon colors are out. A look at what's defining the visual language of the web next year.", tag: "Typography", date: "Dec 11", img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop" },
        { author: "A List Apart", title: "Accessible Color Palettes", desc: "Designing for everyone means ensuring high contrast and readable combinations for all visual abilities.", tag: "Accessibility", date: "Dec 7", img: "https://images.unsplash.com/photo-1586717791821-3f44a5638d28?w=400&h=300&fit=crop" },
    ],
    'Productivity': [
        { author: "James Clear", title: "Atomic Habits for Developers", desc: "Small changes in your coding workflow can lead to massive improvements in output and code quality over time.", tag: "Habits", date: "Dec 12", img: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop" },
        { author: "Tim Ferriss", title: "Deep Work vs. Shallow Work", desc: "How to carve out 4-hour blocks of uninterrupted time in a world of constant notifications.", tag: "Focus", date: "Dec 5", img: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=300&fit=crop" },
    ],
};

const TRENDING = [
    { num: "01", title: "The End of Front-End Deployment?", author: "Sarah Drasner", date: "Oct 24", time: "5 min", img: "https://i.pravatar.cc/40?img=12" },
    { num: "02", title: "Why I'm leaving Microservices", author: "DHH", date: "Oct 22", time: "8 min", img: "https://i.pravatar.cc/40?img=13" },
    { num: "03", title: "React Server Components: A deep dive", author: "Dan Abramov", date: "Oct 20", time: "12 min", img: "https://i.pravatar.cc/40?img=14" },
    { num: "04", title: "Understanding AI Agents", author: "Andrej Karpathy", date: "Oct 19", time: "6 min", img: "https://i.pravatar.cc/40?img=15" },
    { num: "05", title: "CSS Container Queries are here", author: "Una Kravets", date: "Oct 18", time: "4 min", img: "https://i.pravatar.cc/40?img=16" },
    { num: "06", title: "Mastering TypeScript Generics", author: "Matt Pocock", date: "Oct 16", time: "9 min", img: "https://i.pravatar.cc/40?img=17" },
];

const TAG_COLORS: Record<string, string> = {
    Management: '#06b6d4', Performance: '#a855f7', React: '#3b82f6', 'Future Tech': '#f97316',
    AI: '#ec4899', Security: '#ef4444', Typography: '#eab308', Accessibility: '#10b981', Habits: '#8b5cf6', Focus: '#14b8a6',
};

const LandingPage = () => {
    const [activeTab, setActiveTab] = useState<Tab>('For You');

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#e2e8f0', fontFamily: '"Inter", sans-serif' }}>
            <div className="cosmic-bg">
                <div className="cosmic-orb cosmic-orb-1" style={{ opacity: 0.08 }} />
                <div className="cosmic-orb cosmic-orb-2" style={{ opacity: 0.06 }} />
                <div className="grid-texture" />
            </div>
            
            <Navbar forceWhite={false} />

            {/* ─── HERO ─── */}
            <div style={{ position: 'relative', paddingTop: '10rem', paddingBottom: '6rem', overflow: 'hidden', zIndex: 10 }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        {/* Badge */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem',
                            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                            borderRadius: '999px', padding: '0.375rem 1rem',
                            fontSize: '0.8rem', color: '#a5b4fc', fontWeight: 700, letterSpacing: '0.05em'
                        }}>
                            ✦ The Knowledge Platform for Engineering Teams
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900,
                            lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '1.5rem',
                            fontFamily: '"Space Grotesk", sans-serif'
                        }}>
                            Knowledge{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #67e8f9 0%, #a5b4fc 50%, #f9a8d4 100%)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                backgroundSize: '200% auto', animation: 'gradient-flow 4s ease infinite'
                            }}>Evolved.</span>
                        </h1>

                        <p style={{ fontSize: '1.15rem', color: '#475569', maxWidth: '540px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
                            The collaborative platform where engineering teams share context, document decisions, and scale their culture.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/signup" className="btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem', borderRadius: '1rem' }}>
                                <span>Start for free →</span>
                            </Link>
                            <Link to="/login" className="btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem', borderRadius: '1rem' }}>
                                Sign In
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ─── MAIN CONTENT ─── */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 6rem', position: 'relative', zIndex: 10 }}>

                {/* Trending section */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>📈</div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#06b6d4' }}>Trending on Knowledge</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
                        {TRENDING.map(item => (
                            <div key={item.num} style={{
                                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                                padding: '1rem', borderRadius: '1rem', cursor: 'pointer',
                                background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(100,160,255,0.08)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.2)'; e.currentTarget.style.background = 'rgba(22,33,62,0.7)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(100,160,255,0.08)'; e.currentTarget.style.background = 'rgba(15,23,42,0.5)'; }}>
                                <span style={{ fontSize: '2rem', fontWeight: 900, color: 'rgba(100,116,139,0.3)', lineHeight: 1, flexShrink: 0, fontFamily: '"Space Grotesk", sans-serif' }}>{item.num}</span>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                                        <img src={item.img} style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{item.author}</span>
                                    </div>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#cbd5e1', lineHeight: 1.35, margin: '0 0 0.25rem' }}>{item.title}</h3>
                                    <span style={{ fontSize: '0.725rem', color: '#334155' }}>{item.date} · {item.time} read</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(100,160,255,0.15), transparent)', marginTop: '2.5rem' }} />
                </motion.div>

                {/* Main grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '4rem', alignItems: 'start' }}>

                    {/* Left Feed */}
                    <div>
                        {/* Tab bar */}
                        <div style={{
                            display: 'flex', gap: '0.25rem', marginBottom: '2.5rem',
                            background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(100,160,255,0.08)',
                            borderRadius: '0.875rem', padding: '0.375rem'
                        }}>
                            {TABS.map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                    flex: 1, padding: '0.625rem 0.75rem', borderRadius: '0.625rem',
                                    border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem',
                                    transition: 'all 0.2s ease',
                                    background: activeTab === tab ? 'rgba(6,182,212,0.12)' : 'transparent',
                                    color: activeTab === tab ? '#06b6d4' : '#475569',
                                    borderBottom: activeTab === tab ? '2px solid #06b6d4' : '2px solid transparent'
                                }}>
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Featured article */}
                        <motion.div style={{ marginBottom: '3rem', cursor: 'pointer' }}
                            whileHover={{ y: -2 }}
                            className="glass-card"
                        >
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ aspectRatio: '16/9', borderRadius: '0.875rem', overflow: 'hidden', marginBottom: '1.25rem', position: 'relative' }}>
                                    <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                                    <div style={{
                                        position: 'absolute', top: '0.875rem', left: '0.875rem',
                                        background: 'rgba(6,182,212,0.85)', backdropFilter: 'blur(8px)',
                                        color: '#fff', fontSize: '0.7rem', fontWeight: 800,
                                        padding: '0.25rem 0.75rem', borderRadius: '999px',
                                        letterSpacing: '0.08em', textTransform: 'uppercase'
                                    }}>Editor's Choice</div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
                                    <img src="https://i.pravatar.cc/40?img=12" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Elena Fisher</span>
                                    <span style={{ color: '#1e293b' }}>·</span>
                                    <span style={{ fontSize: '0.8rem', color: '#334155' }}>Dec 12</span>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.02em', fontFamily: '"Space Grotesk", sans-serif' }}>
                                    The Future of Distributed Systems: Beyond Microservices
                                </h3>
                                <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1rem' }}>
                                    As infrastructure complexity grows, we need to rethink our approach to modularity. It's not just about splitting services anymore...
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {['Architecture', 'Backend', 'System Design'].map(tag => (
                                        <span key={tag} className="tag-chip">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Article list */}
                        <AnimatePresence mode="wait">
                            <motion.div key={activeTab}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.3 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '0' }}
                            >
                                {FEED_CONTENT[activeTab].map((post, i) => (
                                    <div key={i} style={{
                                        display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
                                        padding: '1.5rem 0', cursor: 'pointer',
                                        borderBottom: '1px solid rgba(100,160,255,0.08)'
                                    }}
                                    className="article-row">
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
                                                <img src={`https://i.pravatar.cc/40?img=${i + 20}`} style={{ width: 22, height: 22, borderRadius: '50%' }} />
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>{post.author}</span>
                                            </div>
                                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', lineHeight: 1.3, marginBottom: '0.5rem', letterSpacing: '-0.01em', fontFamily: '"Space Grotesk", sans-serif', transition: 'color 0.2s ease' }}
                                                onMouseEnter={e => e.currentTarget.style.color = '#67e8f9'}
                                                onMouseLeave={e => e.currentTarget.style.color = '#e2e8f0'}>
                                                {post.title}
                                            </h2>
                                            <p style={{ color: '#334155', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>{post.desc}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                                                <span style={{
                                                    fontSize: '0.725rem', fontWeight: 700, padding: '0.2rem 0.625rem',
                                                    borderRadius: '999px', letterSpacing: '0.05em',
                                                    background: `rgba(${post.tag in TAG_COLORS ? '6,182,212' : '100,116,139'},0.1)`,
                                                    color: TAG_COLORS[post.tag] || '#64748b',
                                                    border: `1px solid rgba(${post.tag in TAG_COLORS ? '6,182,212' : '100,116,139'},0.15)`
                                                }}>{post.tag}</span>
                                                <span style={{ color: '#1e293b', fontSize: '0.8rem' }}>4 min read</span>
                                                <span style={{ color: '#1e293b', fontSize: '0.8rem' }}>· {post.date}</span>
                                                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.875rem' }}>
                                                    {/* Bookmark icon */}
                                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e293b', padding: '0.25rem', transition: 'color 0.2s' }}
                                                        onMouseEnter={e => e.currentTarget.style.color = '#06b6d4'}
                                                        onMouseLeave={e => e.currentTarget.style.color = '#1e293b'}>
                                                        <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ width: 120, height: 80, flexShrink: 0, borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(100,160,255,0.08)' }}>
                                            <img src={post.img} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right Sidebar */}
                    <div style={{ position: 'sticky', top: '5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Discover topics */}
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                                Discover Topics
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {['JavaScript', 'React', 'Python', 'AI', 'DevOps', 'System Design', 'Career', 'Design', 'Go', 'Rust'].map(tag => (
                                    <Link key={tag} to={`/search?q=${tag}`}
                                        style={{ textDecoration: 'none' }}
                                        className="tag-chip">
                                        {tag}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Recommended users */}
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
                                Top Contributors
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[1, 2, 3].map(i => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                                        <img src={`https://i.pravatar.cc/64?img=${i + 40}`}
                                            style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(6,182,212,0.2)', flexShrink: 0 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {['Alex Chen', 'Priya Sharma', 'Marcus Webb'][i-1]}
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {['AI & ML · 248 followers', 'Frontend Dev · 512 followers', 'DevOps · 189 followers'][i-1]}
                                            </p>
                                        </div>
                                        <button style={{
                                            padding: '0.3rem 0.75rem', borderRadius: '999px',
                                            border: '1px solid rgba(6,182,212,0.25)',
                                            background: 'rgba(6,182,212,0.08)', color: '#06b6d4',
                                            fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                                            transition: 'all 0.2s ease', flexShrink: 0
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.2)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.08)'; }}>
                                            Follow
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer links */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {['Help', 'Status', 'Writers', 'Blog', 'Privacy', 'Terms'].map(link => (
                                <a key={link} href="#" style={{ fontSize: '0.75rem', color: '#1e293b', textDecoration: 'none', transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#06b6d4'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#1e293b'}>
                                    {link}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
