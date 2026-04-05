import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
    forceWhite?: boolean;
}

const Navbar = ({ forceWhite }: NavbarProps) => {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const logout = auth?.logout || (() => { });
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isModerator = user && (user.role === 'admin' || user.role === 'moderator');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinkClass = "relative group hover:text-slate-900 transition-colors";
    const underlineClass = "absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 group-hover:w-full transition-all duration-300";

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || forceWhite
                ? 'bg-white/80 backdrop-blur-xl h-16 shadow-xl shadow-slate-300/30 border-b border-slate-200/50'
                : 'bg-white/40 backdrop-blur-sm h-20'}`}
        >
            {/* gradient top bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`} />

            <div className="w-full px-4 sm:px-6 lg:px-10 h-full flex items-center justify-between relative">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2 group">
                    <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="relative z-10">K</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-900">
                        Knowledge<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600">Portal</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center space-x-8">
                    <div className="flex items-center space-x-6 text-sm font-semibold text-slate-600">
                        <Link to="/learning-paths" className={navLinkClass}><span className="relative z-10">Learning Paths</span><span className={underlineClass} /></Link>
                        <Link to="/projects" className={navLinkClass}><span className="relative z-10">Projects</span><span className={underlineClass} /></Link>
                        <Link to="/community" className={navLinkClass}><span className="relative z-10">Community</span><span className={underlineClass} /></Link>
                        {isModerator && (
                            <Link to="/moderation" className={navLinkClass}><span className="relative z-10">Moderation</span><span className={underlineClass} /></Link>
                        )}
                    </div>

                    <div className="h-6 w-px bg-slate-200" />

                    {user ? (
                        <div className="flex items-center space-x-4">
                            <Link to="/create-post" className="p-2.5 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all group">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </Link>

                            {/* Avatar + Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center focus:outline-none">
                                    <div className="relative">
                                        <img
                                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e2e8f0&color=0f172a`}
                                            alt={user.name}
                                            className="w-9 h-9 rounded-full border-2 border-slate-200 group-hover:ring-2 group-hover:ring-cyan-500 group-hover:ring-offset-2 shadow-sm transition-all duration-300"
                                        />
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                                    </div>
                                </button>

                                <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3 shadow-xl invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 origin-top-right scale-95 group-hover:scale-100">
                                    <div className="px-3 py-2 text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600 uppercase tracking-wider border-b border-slate-100 mb-2">My Account</div>
                                    {[
                                        { to: `/users/${user._id}`, label: 'Profile' },
                                        { to: '/settings/profile', label: 'Settings' },
                                        { to: '/dashboard', label: 'Dashboard' },
                                        { to: '/collections', label: 'Collections' },
                                    ].map(item => (
                                        <Link key={item.to} to={item.to} className="block px-3 py-2.5 text-sm text-slate-700 hover:bg-cyan-50 hover:text-slate-900 rounded-xl transition-all">
                                            {item.label}
                                        </Link>
                                    ))}
                                    {isModerator && (
                                        <Link to="/moderation" className="block px-3 py-2.5 text-sm text-slate-700 hover:bg-cyan-50 hover:text-slate-900 rounded-xl transition-all">
                                            Moderation
                                        </Link>
                                    )}
                                    <div className="my-2 border-t border-slate-100" />
                                    <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Log in</Link>
                            <Link to="/signup" className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-xl hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group">
                                <span className="relative z-10">Get Started</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile burger */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"} />
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {['Learning Paths:/learning-paths', 'Projects:/projects', 'Community:/community'].map(item => {
                                const [label, to] = item.split(':');
                                return (
                                    <Link key={to} to={to} onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-cyan-600 rounded-lg transition-colors">
                                        {label}
                                    </Link>
                                );
                            })}
                            {isModerator && (
                                <Link to="/moderation" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-cyan-600 rounded-lg transition-colors">
                                    Moderation
                                </Link>
                            )}
                            {user ? (
                                <>
                                    <div className="border-t border-slate-200 my-2" />
                                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-cyan-600 rounded-lg transition-colors">Dashboard</Link>
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">Logout</button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex justify-center px-4 py-3 text-base font-bold text-slate-700 bg-slate-100 rounded-lg">Log in</Link>
                                    <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="flex justify-center px-4 py-3 text-base font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg">Sign up</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
