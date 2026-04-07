import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/AppNavbar';
import { motion } from 'framer-motion';
import { CameraIcon, UserIcon, BriefcaseIcon, MapPinIcon, LinkIcon, PencilIcon, SparklesIcon } from '@heroicons/react/24/outline';

const EditProfile = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        jobTitle: '',
        company: '',
        bio: '',
        location: '',
        website: '',
        skills: '',
        github: '',
        linkedin: '',
        leetcode: '',
        stackoverflow: '',
        medium: '',
        twitter: ''
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                username: user.username || '',
                jobTitle: user.jobTitle || user.title || '',
                company: user.company || '',
                bio: user.bio || '',
                location: user.location || '',
                website: user.website || '',
                skills: user.skills ? user.skills.join(', ') : '',
                github: user.socials?.github || '',
                linkedin: user.socials?.linkedin || '',
                leetcode: user.socials?.leetcode || '',
                stackoverflow: user.socials?.stackoverflow || '',
                medium: user.socials?.medium || '',
                twitter: user.socials?.twitter || ''
            });
            setPreviewAvatar(user.avatar || null);
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setPreviewAvatar(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let avatarUrl = user?.avatar;
            if (avatarFile) {
                const uploadData = new FormData();
                uploadData.append('avatar', avatarFile);
                const res = await api.post('/users/avatar', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                avatarUrl = res.data.avatarUrl;
            }

            const updates = {
                ...formData,
                avatar: avatarUrl,
                skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
                socials: {
                    github: formData.github,
                    linkedin: formData.linkedin,
                    leetcode: formData.leetcode,
                    stackoverflow: formData.stackoverflow,
                    medium: formData.medium,
                    twitter: formData.twitter
                }
            };

            const { data } = await api.put('/users/profile', updates);

            if (auth?.updateUser && data.user) {
                auth.updateUser(data.user);
                toast.success('Profile modernized successfully!');
                navigate(`/users/${data.user._id}`);
            }
        } catch (err) {
            console.error('Failed to update profile', err);
            toast.error('Failed to preserve your changes. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-200">
            <Navbar forceWhite={true} />

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }} transition={{ duration: 15, repeat: Infinity }} className="absolute top-0 -right-24 w-[600px] h-[600px] bg-cyan-200/30 rounded-full blur-[120px]" />
                <motion.div animate={{ scale: [1, 1.1, 1], x: [0, -30, 0] }} transition={{ duration: 18, repeat: Infinity }} className="absolute bottom-0 -left-24 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-[120px]" />
            </div>

            <div className="relative pt-32 pb-20 px-4 sm:px-6 z-10">
                <div className="max-w-4xl mx-auto">
                    
                    {/* Floating Header */}
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
                        <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-600 text-[10px] font-black uppercase tracking-[0.2em] border border-cyan-500/20 mb-4 inline-block">
                            Account Settings
                        </span>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Refine Your Identity</h1>
                        <p className="text-slate-500 mt-2 font-medium">Elevate how the community sees your contributions.</p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* Main Glass Card */}
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/70 backdrop-blur-2xl border border-white rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] overflow-hidden">
                            
                            {/* Card Hero Section (Avatar) */}
                            <div className="p-8 md:p-12 bg-gradient-to-br from-slate-50/50 to-white/20 border-b border-slate-100/50 flex flex-col md:flex-row items-center gap-10">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                    <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <img
                                            src={previewAvatar || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            alt="Avatar Preview"
                                        />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <CameraIcon className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                </div>
                                
                                <div className="flex-1 text-center md:text-left space-y-3">
                                    <h3 className="text-xl font-bold text-slate-900">Portrait Identity</h3>
                                    <p className="text-sm text-slate-500 max-w-sm">Upload a high-fidelity image to stand out in discussions. JPG or PNG preferred.</p>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-white hover:bg-slate-50 text-slate-900 text-xs font-black uppercase px-6 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all"
                                    >
                                        Select New Media
                                    </button>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="p-8 md:p-12 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    
                                    {/* Name Field */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                            <UserIcon className="w-3 h-3" />
                                            Professional Name
                                        </label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50/50 border border-slate-200/60 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none"
                                            required
                                        />
                                    </div>

                                    {/* Username Field */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                            <SparklesIcon className="w-3 h-3" />
                                            Unique Handle
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-600 font-black">@</span>
                                            <input
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50/50 border border-slate-200/60 rounded-2xl pl-10 pr-5 py-4 font-bold text-slate-900 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Role Field */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                            <BriefcaseIcon className="w-3 h-3" />
                                            Current Vocation
                                        </label>
                                        <input
                                            name="jobTitle"
                                            value={formData.jobTitle}
                                            onChange={handleChange}
                                            placeholder="e.g. Lead Product Architect"
                                            className="w-full bg-slate-50/50 border border-slate-200/60 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none"
                                        />
                                    </div>

                                    {/* Location Field */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                            <MapPinIcon className="w-3 h-3" />
                                            Geo Base
                                        </label>
                                        <input
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="e.g. Remote, Earth"
                                            className="w-full bg-slate-50/50 border border-slate-200/60 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none"
                                        />
                                    </div>

                                    {/* Bio Field */}
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                            <PencilIcon className="w-3 h-3" />
                                            The Narrative
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full bg-slate-50/50 border border-slate-200/60 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none resize-none"
                                            placeholder="Synthesize your professional journey..."
                                        />
                                    </div>

                                    {/* Skills Field */}
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                            <SparklesIcon className="w-3 h-3" />
                                            Core Proficiencies
                                        </label>
                                        <input
                                            name="skills"
                                            value={formData.skills}
                                            onChange={handleChange}
                                            placeholder="React, Distributed Systems, Strategy (comma separated)"
                                            className="w-full bg-slate-50/50 border border-slate-200/60 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Social Connect Glass Card */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/70 backdrop-blur-2xl border border-white rounded-[2.5rem] shadow-xl p-8 md:p-12 space-y-8">
                            <div className="flex items-center gap-3 mb-2">
                                <LinkIcon className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-xl font-bold text-slate-900">Network Matrix</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    { name: 'github', label: 'GitHub Ecosystem', placeholder: 'https://github.com/...' },
                                    { name: 'linkedin', label: 'Professional Graph', placeholder: 'https://linkedin.com/in/...' },
                                    { name: 'leetcode', label: 'Algorithmic Profile', placeholder: 'https://leetcode.com/...' },
                                    { name: 'twitter', label: 'Social Echo (X)', placeholder: 'https://x.com/...' }
                                ].map((field) => (
                                    <div key={field.name} className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{field.label}</label>
                                        <input
                                            name={field.name}
                                            value={(formData as any)[field.name]}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            className="w-full bg-slate-50/50 border border-slate-200/60 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                        />
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-6 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                Abandon Changes
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-sm font-black uppercase tracking-[0.2em] px-12 py-5 rounded-2xl shadow-2xl shadow-cyan-500/25 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Saving Metadata...' : 'Finalize Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
