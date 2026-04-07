import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import favicon from '../assets/favicon.png';

interface NavbarProps {
    forceWhite?: boolean;
}

const NAV_LINKS = [
    { to: '/learning-paths', label: 'Learning Paths', icon: '🗺️' },
    { to: '/projects', label: 'Projects', icon: '🚀' },
    { to: '/events', label: 'Events', icon: '📅' },
    { to: '/community', label: 'Community', icon: '💬' },
];

const Navbar = (_props: NavbarProps) => {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const logout = auth?.logout || (() => { });
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const isModerator = user && (user.role === 'admin' || user.role === 'moderator');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => { setIsMenuOpen(false); }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (to: string) => location.pathname === to;

    return (
        <motion.nav
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0,
                zIndex: 100,
                background: scrolled
                    ? 'rgba(2, 6, 23, 0.92)'
                    : 'rgba(2, 6, 23, 0.6)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                borderBottom: `1px solid ${scrolled ? 'rgba(100, 160, 255, 0.12)' : 'rgba(100, 160, 255, 0.06)'}`,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
        >
            {/* Top accent line — only when scrolled */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: 'linear-gradient(to right, #06b6d4, #6366f1, #ec4899)',
                opacity: scrolled ? 1 : 0, transition: 'opacity 0.4s ease'
            }} />

            <div style={{
                maxWidth: '1400px', margin: '0 auto',
                padding: '0 1.5rem',
                height: 68,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                {/* ─── Logo ─── */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', flexShrink: 0 }}>
                    <img 
                        src={favicon} 
                        alt="KnowledgeShare" 
                        style={{ 
                            width: 38, height: 38, borderRadius: '10px',
                            boxShadow: '0 0 16px rgba(6,182,212,0.4)',
                            objectFit: 'cover'
                        }} 
                    />
                    <span style={{
                        fontWeight: 800, fontSize: '1.1rem',
                        background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        fontFamily: '"Space Grotesk", sans-serif',
                        letterSpacing: '-0.01em'
                    }}>
                        Knowledge<span style={{
                            background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>Portal</span>
                    </span>
                </Link>

                {/* ─── Desktop Nav ─── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden-mobile">
                    {NAV_LINKS.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                padding: '0.5rem 0.875rem',
                                borderRadius: '0.625rem',
                                fontSize: '0.875rem', fontWeight: 600,
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                color: isActive(link.to) ? '#06b6d4' : '#64748b',
                                background: isActive(link.to) ? 'rgba(6,182,212,0.1)' : 'transparent',
                            }}
                            onMouseEnter={e => {
                                if (!isActive(link.to)) {
                                    e.currentTarget.style.color = '#94a3b8';
                                    e.currentTarget.style.background = 'rgba(100,160,255,0.06)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isActive(link.to)) {
                                    e.currentTarget.style.color = '#64748b';
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {isModerator && (
                        <Link to="/moderation" style={{
                            display: 'flex', alignItems: 'center', gap: '0.375rem',
                            padding: '0.5rem 0.875rem', borderRadius: '0.625rem',
                            fontSize: '0.875rem', fontWeight: 600,
                            textDecoration: 'none', color: '#f472b6',
                            background: isActive('/moderation') ? 'rgba(236,72,153,0.1)' : 'transparent',
                            transition: 'all 0.2s ease'
                        }}>
                            🛡️ Moderation
                        </Link>
                    )}
                </div>

                {/* ─── Right Side ─── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="hidden-mobile">
                    {user ? (
                        <>
                            {/* Create post button */}
                            <Link to="/create-post" style={{
                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.75rem',
                                background: 'rgba(6,182,212,0.08)',
                                border: '1px solid rgba(6,182,212,0.15)',
                                color: '#06b6d4', fontWeight: 600, fontSize: '0.875rem',
                                textDecoration: 'none', transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.15)'; e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.08)'; e.currentTarget.style.borderColor = 'rgba(6,182,212,0.15)'; }}>
                                <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Write
                            </Link>

                            {/* User avatar dropdown */}
                            <div ref={dropdownRef} style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                                        background: 'none', border: 'none', padding: '0.25rem',
                                        borderRadius: '2rem'
                                    }}
                                >
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0f172a&color=06b6d4&bold=true`}
                                            alt={user.name}
                                            style={{
                                                width: 36, height: 36, borderRadius: '50%',
                                                border: `2px solid ${isDropdownOpen ? 'rgba(6,182,212,0.6)' : 'rgba(100,160,255,0.2)'}`,
                                                objectFit: 'cover', transition: 'border-color 0.2s ease'
                                            }}
                                        />
                                        <span style={{
                                            position: 'absolute', bottom: -1, right: -1,
                                            width: 10, height: 10, borderRadius: '50%',
                                            background: '#10b981', border: '2px solid #020617',
                                            boxShadow: '0 0 8px rgba(16,185,129,0.6)'
                                        }} />
                                    </div>
                                    <svg style={{ width: 14, height: 14, color: '#475569', transition: 'transform 0.2s ease', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown menu */}
                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                            style={{
                                                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                                width: 220,
                                                background: 'rgba(10, 15, 30, 0.97)',
                                                backdropFilter: 'blur(20px)',
                                                border: '1px solid rgba(100,160,255,0.15)',
                                                borderRadius: '1rem',
                                                padding: '0.5rem',
                                                boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(6,182,212,0.05)',
                                                zIndex: 200
                                            }}
                                        >
                                            {/* User info header */}
                                            <div style={{ padding: '0.75rem 0.875rem 0.875rem', borderBottom: '1px solid rgba(100,160,255,0.08)', marginBottom: '0.375rem' }}>
                                                <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>{user.name}</div>
                                                <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.125rem' }}>{user.email}</div>
                                            </div>

                                            {[
                                                { to: `/users/${user._id}`, label: 'My Profile', icon: '👤' },
                                                { to: '/settings/profile', label: 'Settings', icon: '⚙️' },
                                                { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
                                                { to: '/my-posts', label: 'My Posts', icon: '📝' },
                                                { to: '/collections', label: 'Collections', icon: '📚' },
                                                { to: '/bookmarks', label: 'Bookmarks', icon: '🔖' },
                                                { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
                                            ].map(item => (
                                                <Link
                                                    key={item.to}
                                                    to={item.to}
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                                                        padding: '0.5rem 0.875rem',
                                                        borderRadius: '0.625rem',
                                                        fontSize: '0.875rem', fontWeight: 500,
                                                        color: '#64748b', textDecoration: 'none',
                                                        transition: 'all 0.15s ease'
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.08)'; e.currentTarget.style.color = '#94a3b8'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                                                >
                                                    <span>{item.icon}</span>
                                                    {item.label}
                                                </Link>
                                            ))}

                                            {isModerator && (
                                                <Link to="/moderation" onClick={() => setIsDropdownOpen(false)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.875rem', borderRadius: '0.625rem', fontSize: '0.875rem', fontWeight: 500, color: '#f472b6', textDecoration: 'none', transition: 'all 0.15s ease' }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(236,72,153,0.08)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                                                    🛡️ Moderation
                                                </Link>
                                            )}

                                            <div style={{ height: 1, background: 'rgba(100,160,255,0.08)', margin: '0.375rem 0' }} />

                                            <button
                                                onClick={handleLogout}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%',
                                                    padding: '0.5rem 0.875rem', borderRadius: '0.625rem',
                                                    fontSize: '0.875rem', fontWeight: 600,
                                                    color: '#f87171', background: 'none', border: 'none',
                                                    cursor: 'pointer', transition: 'all 0.15s ease', textAlign: 'left'
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <svg style={{ width: 15, height: 15, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Sign Out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{
                                padding: '0.5rem 1rem', borderRadius: '0.75rem',
                                fontSize: '0.875rem', fontWeight: 600, color: '#64748b',
                                textDecoration: 'none', transition: 'color 0.2s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                            onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                                Log in
                            </Link>
                            <Link to="/signup" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                                <span>Get Started</span>
                            </Link>
                        </>
                    )}
                </div>

                {/* ─── Mobile Hamburger ─── */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{
                        display: 'none', // controlled via media query
                        padding: '0.5rem', borderRadius: '0.625rem',
                        background: isMenuOpen ? 'rgba(6,182,212,0.1)' : 'transparent',
                        border: '1px solid rgba(100,160,255,0.1)',
                        color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s ease'
                    }}
                    className="show-mobile"
                >
                    <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>
            </div>

            {/* ─── Mobile Menu ─── */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            background: 'rgba(5, 10, 25, 0.98)',
                            backdropFilter: 'blur(20px)',
                            borderTop: '1px solid rgba(100,160,255,0.08)',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ padding: '1rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                            {NAV_LINKS.map(link => (
                                <Link key={link.to} to={link.to}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                        fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none',
                                        color: isActive(link.to) ? '#06b6d4' : '#64748b',
                                        background: isActive(link.to) ? 'rgba(6,182,212,0.1)' : 'transparent',
                                        transition: 'all 0.2s ease'
                                    }}>
                                    <span>{link.icon}</span>
                                    {link.label}
                                </Link>
                            ))}

                            <div style={{ height: 1, background: 'rgba(100,160,255,0.08)', margin: '0.5rem 0' }} />

                            {user ? (
                                <>
                                    <Link to={`/users/${user._id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', color: '#64748b' }}>
                                        <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0f172a&color=06b6d4`} style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(6,182,212,0.3)' }} />
                                        {user.name}
                                    </Link>
                                    <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', color: '#64748b' }}>🏠 Dashboard</Link>
                                    <Link to="/create-post" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', color: '#06b6d4', background: 'rgba(6,182,212,0.08)', marginTop: '0.5rem' }}>✏️ Write a Post</Link>
                                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.95rem', fontWeight: 600, color: '#f87171', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                                        → Sign Out
                                    </button>
                                </>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <Link to="/login" style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none', color: '#64748b', border: '1px solid rgba(100,160,255,0.1)' }}>
                                        Log in
                                    </Link>
                                    <Link to="/signup" className="btn-primary" style={{ justifyContent: 'center', padding: '0.75rem' }}>
                                        <span>Sign up</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @media (min-width: 768px) {
                    .hidden-mobile { display: flex !important; }
                    .show-mobile { display: none !important; }
                }
                @media (max-width: 767px) {
                    .hidden-mobile { display: none !important; }
                    .show-mobile { display: flex !important; }
                }
            `}</style>
        </motion.nav>
    );
};

export default Navbar;
