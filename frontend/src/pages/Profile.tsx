import { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/AppNavbar';
import ActivityTimeline from '../components/ActivityTimeline';
import { motion, AnimatePresence } from 'framer-motion';
import { CameraIcon, MapPinIcon, PencilSquareIcon, LinkIcon, AcademicCapIcon, BoltIcon, StarIcon, UsersIcon } from '@heroicons/react/24/outline';

type ProfileUser = {
    _id: string;
    name: string;
    username?: string;
    avatar?: string;
    bio?: string;
    title?: string;
    jobTitle?: string;
    company?: string;
    location?: string;
    website?: string;
    socials?: {
        github?: string;
        linkedin?: string;
        leetcode?: string;
        stackoverflow?: string;
        medium?: string;
        twitter?: string;
    };
    skills?: string[];
    expertise?: Array<{ topic: string; level: string; endorsements: number }>;
    followers?: Array<{ _id: string; name: string; username?: string; avatar?: string }>;
    following?: Array<{ _id: string; name: string; username?: string; avatar?: string }>;
    learningStreak?: { current: number; longest: number };
    points?: number;
    badges?: string[];
    stats?: {
        joinedDaysAgo?: number;
        totalPosts?: number;
        totalLikes?: number;
    };
};

type RecentPost = {
    _id: string;
    title?: string;
    content?: string;
    createdAt?: string;
    views?: number;
    likes?: string[];
};

type ProfileResponse = {
    user: ProfileUser;
    recentPosts: RecentPost[];
    isFollowing?: boolean;
};

const Profile = () => {
    const { id } = useParams();
    const auth = useContext(AuthContext);
    const viewer = auth?.user;
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [data, setData] = useState<ProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [followLoading, setFollowLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'posts' | 'activity' | 'about' | 'network'>('posts');

    const fetchProfile = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.get<ProfileResponse>(`/users/${id}`);
            setData(res.data);
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const user = data?.user;
    const recentPosts = data?.recentPosts ?? [];
    const isSelf = !!viewer && viewer._id === user?._id;
    const isFollowing = data?.isFollowing ?? (!!viewer && !!user?.followers?.some(f => f._id === viewer._id));

    const handleAvatarClick = () => {
        if (isSelf && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            setUploading(true);
            const res = await api.post('/users/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Update both local state and global auth context
            if (res.data.avatarUrl) {
                setData(prev => prev ? { ...prev, user: { ...prev.user, avatar: res.data.avatarUrl } } : null);
                if (auth?.updateUser) {
                    auth.updateUser({ avatar: res.data.avatarUrl });
                }
                toast.success('Profile picture updated!');
            }
        } catch (err) {
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleToggleFollow = async () => {
        if (!user || !viewer) return navigate('/login');
        try {
            setFollowLoading(true);
            const res = await api.put(`/users/${user._id}/follow`);
            const nowFollowing = res.data?.isFollowing;
            fetchProfile(); // Refresh for accurate counts
            toast.success(nowFollowing ? `Following ${user.name}` : `Unfollowed ${user.name}`);
        } catch (e) {
            toast.error('Failed to update follow status');
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full" />
        </div>
    );

    if (error || !user) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <h2 className="text-2xl font-bold text-white mb-4">Error loading profile</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <Link to="/dashboard" className="px-6 py-2 bg-cyan-600 text-white rounded-xl font-bold">Return Home</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-200 lg:pb-20 pb-10">
            <Navbar forceWhite={true} />

            {/* Premium Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-cyan-200/40 rounded-full blur-[120px]" />
                <motion.div animate={{ scale: [1, 1.1, 1], x: [0, -40, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute top-1/2 -right-24 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[120px]" />
            </div>

            {/* Profile Header Banner */}
            <div className="relative h-[25vh] lg:h-[35vh] w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <div className="w-[150%] h-[150%] border-[1px] border-white/5 rounded-full rotate-45 scale-150 animate-slow-spin" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/10" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 lg:-mt-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Essential Profile Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-4 space-y-6">
                        <div className="bg-white/90 backdrop-blur-3xl border border-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-8 text-center relative overflow-hidden group">
                            {/* Card Background Glow */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500" />
                            
                            {/* Avatar Section */}
                            <div className="relative inline-block mb-6">
                                <motion.div whileHover={{ scale: 1.02 }} className="relative">
                                    <img 
                                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0f172a&color=06b6d4&size=256&bold=true`} 
                                        alt={user.name} 
                                        className="w-40 h-40 rounded-[2.5rem] object-cover border-4 border-white shadow-2xl ring-4 ring-cyan-500/10"
                                    />
                                    {isSelf && (
                                        <button 
                                            onClick={handleAvatarClick}
                                            disabled={uploading}
                                            className="absolute bottom-2 right-2 p-3 bg-white text-slate-900 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border border-slate-100 group/upload overflow-hidden"
                                        >
                                            {uploading ? (
                                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full" />
                                            ) : (
                                                <CameraIcon className="w-5 h-5 text-indigo-600" />
                                            )}
                                        </button>
                                    )}
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                </motion.div>
                                <div className="absolute -top-2 -right-2 bg-gradient-to-br from-green-400 to-emerald-600 w-5 h-5 rounded-full border-4 border-white shadow-lg animate-pulse" />
                            </div>

                            <h1 className="text-3xl font-black text-slate-900 leading-tight mb-1 font-display tracking-tight">{user.name}</h1>
                            <p className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] mb-4">@{user.username || 'user'}</p>
                            
                            <p className="text-slate-600 font-medium mb-6 text-sm leading-relaxed px-2">
                                {user.bio || 'This innovator hasn\'t shared their story yet. Stay tuned for more insights.'}
                            </p>

                            <div className="flex gap-3 justify-center mb-8">
                                {isSelf ? (
                                    <Link to="/settings/profile" className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95">
                                        <PencilSquareIcon className="w-5 h-5" />
                                        Edit Profile
                                    </Link>
                                ) : (
                                    <button 
                                        onClick={handleToggleFollow}
                                        disabled={followLoading}
                                        className={`flex-1 py-3 px-6 rounded-2xl font-bold transition-all active:scale-95 shadow-xl ${isFollowing 
                                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-slate-200/20' 
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30'}`}
                                    >
                                        {isFollowing ? 'Following' : 'Connect +'}
                                    </button>
                                )}
                            </div>

                            {/* Essential Meta */}
                            <div className="space-y-3 pt-6 border-t border-slate-100">
                                {user.location && (
                                    <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                                        <div className="p-2 bg-slate-50 rounded-lg"><MapPinIcon className="w-4 h-4 text-indigo-500" /></div>
                                        {user.location}
                                    </div>
                                )}
                                {user.website && (
                                    <a href={user.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors">
                                        <div className="p-2 bg-slate-50 rounded-lg"><LinkIcon className="w-4 h-4 text-cyan-500" /></div>
                                        Personal Portfolio
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Achievements Mini-Panel */}
                        <div className="bg-white/90 backdrop-blur-2xl border border-white rounded-[2.5rem] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] p-8">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <BoltIcon className="w-4 h-4 text-amber-500" />
                                Milestone Track
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-amber-50/50 rounded-3xl border border-amber-100 text-center">
                                    <span className="text-3xl block mb-1">⭐</span>
                                    <span className="text-lg font-black text-slate-900 block">{user.points || 0}</span>
                                    <span className="text-[9px] font-bold text-amber-700 uppercase tracking-tighter">Points</span>
                                </div>
                                <div className="p-4 bg-cyan-50/50 rounded-3xl border border-cyan-100 text-center">
                                    <span className="text-3xl block mb-1">🔥</span>
                                    <span className="text-lg font-black text-slate-900 block">{user.learningStreak?.current || 0}</span>
                                    <span className="text-[9px] font-bold text-cyan-700 uppercase tracking-tighter">Days</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Advanced Details & Activity */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        
                        {/* Stats Dashboard */}
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-6">
                            {[
                                { label: 'Knowledge Base', value: recentPosts.length, icon: <AcademicCapIcon className="w-5 h-5 text-indigo-500" />, color: 'indigo' },
                                { label: 'Connectors', value: (user.followers?.length || 0) + (user.following?.length || 0), icon: <UsersIcon className="w-5 h-5 text-cyan-500" />, color: 'cyan' },
                                { label: 'Total Impact', value: user.stats?.totalLikes || 0, icon: <StarIcon className="w-5 h-5 text-rose-500" />, color: 'rose' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 bg-${stat.color}-500/10 rounded-2xl`}>{stat.icon}</div>
                                        <div>
                                            <span className="text-2xl font-black text-slate-900 block leading-none mb-1">{stat.value}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{stat.label}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        {/* Tabs & Content */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-2 p-1.5 bg-slate-200/50 backdrop-blur-md rounded-2xl w-fit">
                                {(['posts', 'activity', 'about', 'network'] as const).map((tab) => (
                                    <button 
                                        key={tab} 
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeTab === tab 
                                            ? 'bg-white text-slate-900 shadow-lg ring-1 ring-slate-900/5' 
                                            : 'text-slate-500 hover:text-slate-900'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={activeTab} 
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="min-h-[400px]"
                                >
                                    {activeTab === 'posts' && (
                                        <div className="grid grid-cols-1 gap-4">
                                            {recentPosts.length > 0 ? recentPosts.map((post, idx) => (
                                                <Link to={`/posts/${post._id}`} key={post._id} className="group flex bg-white/80 border border-white hover:border-indigo-200 rounded-[2rem] p-6 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all items-center gap-6">
                                                   <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl flex items-center justify-center text-2xl font-black text-indigo-400 group-hover:scale-110 transition-transform">
                                                       {idx + 1}
                                                   </div>
                                                   <div className="flex-1">
                                                       <h4 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{post.title}</h4>
                                                       <p className="text-sm text-slate-500 line-clamp-1">{post.content?.replace(/[#*`]/g, '')}</p>
                                                   </div>
                                                   <div className="text-right flex flex-col items-end gap-2">
                                                       <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(post.createdAt!).toLocaleDateString()}</span>
                                                       <div className="flex gap-2">
                                                           <div className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-400">👀 {post.views}</div>
                                                           <div className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-400">❤️ {post.likes?.length}</div>
                                                       </div>
                                                   </div>
                                                </Link>
                                            )) : (
                                                <div className="bg-white/60 rounded-[2.5rem] border border-dashed border-slate-300 p-20 text-center">
                                                    <div className="text-5xl mb-4 opacity-30">✍️</div>
                                                    <p className="text-slate-400 font-bold">No shared knowledge yet. Time to publish!</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'activity' && (
                                        <div className="bg-white/80 border border-white rounded-[2.5rem] p-8 shadow-sm">
                                            <ActivityTimeline userId={user._id} />
                                        </div>
                                    )}

                                    {activeTab === 'about' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-white/80 border border-white rounded-[2.5rem] p-8 shadow-sm">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Professional Context</h4>
                                                <div className="space-y-6">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">Status</span>
                                                        <span className="font-bold text-slate-700">{user.jobTitle || 'Active Member'}</span>
                                                    </div>
                                                    {user.company && (
                                                        <div>
                                                            <span className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">Company</span>
                                                            <span className="font-bold text-slate-700">{user.company}</span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">Member Since</span>
                                                        <span className="font-bold text-slate-700">Early 2024</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-white/80 border border-white rounded-[2.5rem] p-8 shadow-sm">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Stacks & Competencies</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {(user.skills || ['Innovation', 'Collaboration']).map(skill => (
                                                        <span key={skill} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider">{skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'network' && (
                                        <div className="space-y-8">
                                            <div className="bg-white/80 border border-white rounded-[2.5rem] p-8 shadow-sm">
                                                <h4 className="text-xs font-black text-slate-900 mb-6 flex items-center gap-3">
                                                    <UsersIcon className="w-5 h-5 text-cyan-500" />
                                                    Collaborators ({user.followers?.length || 0})
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {user.followers?.map(f => (
                                                        <Link to={`/users/${f._id}`} key={f._id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                                            <img src={f.avatar || `https://ui-avatars.com/api/?name=${f.name}&background=0f172a&color=06b6d4`} className="w-10 h-10 rounded-xl" />
                                                            <span className="text-sm font-bold text-slate-700 truncate">{f.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
