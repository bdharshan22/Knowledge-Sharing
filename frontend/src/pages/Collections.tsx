import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/AppNavbar';
import { motion, AnimatePresence } from 'framer-motion';

interface Collection {
    _id: string;
    name: string;
    description?: string;
    posts?: any[];
    isPublic?: boolean;
    createdAt?: string;
}

const C = { bg: '#f8fafc', card: '#ffffff', border: '#e2e8f0', t1: '#0f172a', t2: '#475569', t3: '#94a3b8', accent: '#6366f1' };

const COLLECTION_EMOJIS = ['📚', '🗂️', '✨', '🔬', '🎯', '🚀', '💡', '🧠', '🌟', '⚡'];

const Collections = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selected, setSelected] = useState<Collection | null>(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [createMode, setCreateMode] = useState(false);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editIsPublic, setEditIsPublic] = useState(false);
    const [editDirty, setEditDirty] = useState(false);

    const fetchCollections = async () => {
        try {
            const res = await api.get('/users/collections');
            setCollections(res.data.collections || []);
        } catch (err) {
            console.error('Failed to load collections', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCollectionDetail = async (id: string) => {
        setDetailLoading(true);
        try {
            const res = await api.get(`/users/collections/${id}`);
            const col = res.data.collection;
            setSelected(col);
            setEditName(col.name || '');
            setEditDescription(col.description || '');
            setEditIsPublic(!!col.isPublic);
            setEditDirty(false);
        } catch (err) {
            console.error('Failed to load collection', err);
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => { fetchCollections(); }, []);
    useEffect(() => {
        if (selectedId) fetchCollectionDetail(selectedId);
        else setSelected(null);
    }, [selectedId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setSaving(true);
        try {
            const res = await api.post('/users/collections', { name: name.trim(), description, isPublic });
            setCollections(res.data.collections || []);
            setName(''); setDescription(''); setIsPublic(false);
            setCreateMode(false);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleUpdate = async () => {
        if (!selectedId) return;
        setSaving(true);
        try {
            const res = await api.put(`/users/collections/${selectedId}`, { name: editName, description: editDescription, isPublic: editIsPublic });
            const updated = res.data.collection;
            setSelected(prev => prev ? { ...prev, ...updated } : updated);
            setCollections(prev => prev.map(c => c._id === updated._id ? { ...c, ...updated } : c));
            setEditDirty(false);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleDelete = async (collectionId: string) => {
        if (!window.confirm('Delete this collection?')) return;
        try {
            const res = await api.delete(`/users/collections/${collectionId}`);
            setCollections(res.data.collections || []);
            if (selectedId === collectionId) { setSelectedId(null); setSelected(null); }
        } catch (err) { console.error(err); }
    };

    const handleRemovePost = async (postId: string) => {
        if (!selectedId) return;
        try {
            await api.delete(`/users/collections/${selectedId}/posts/${postId}`);
            await fetchCollectionDetail(selectedId);
        } catch (err) { console.error(err); }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: C.bg, fontFamily: '"Inter", sans-serif' }}>
            <Navbar />
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(to right, #6366f1, #06b6d4, #ec4899)', zIndex: 99 }} />

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '7rem 1.5rem 4rem' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.accent, marginBottom: '0.25rem' }}>Knowledge Library</p>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: C.t1, letterSpacing: '-0.03em', fontFamily: '"Space Grotesk", sans-serif', margin: 0 }}>Collections 📚</h1>
                        <p style={{ color: C.t2, marginTop: '0.4rem', fontSize: '0.95rem' }}>Organize your saved posts into curated learning playlists.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.6rem 1.25rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', color: C.t2, border: `1px solid ${C.border}`, background: C.card }}>
                            ← Feed
                        </Link>
                        <button onClick={() => { setCreateMode(!createMode); setSelectedId(null); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.875rem', color: '#fff', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', border: 'none', cursor: 'pointer' }}>
                            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                            New Collection
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
                    {[
                        { label: 'Collections', value: collections.length, icon: '📚', color: '#6366f1' },
                        { label: 'Total Posts', value: collections.reduce((s, c) => s + (c.posts?.length || 0), 0), icon: '📝', color: '#0284c7' },
                        { label: 'Public', value: collections.filter(c => c.isPublic).length, icon: '🌐', color: '#22c55e' },
                    ].map(s => (
                        <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '1rem', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
                            <div style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: C.t1, fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '1.5rem', alignItems: 'start' }}>

                    {/* Left: list + create form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Create Form */}
                        <AnimatePresence>
                            {createMode && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 16px rgba(99,102,241,0.1)', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(to right, #6366f1, #06b6d4)' }} />
                                    <h2 style={{ fontWeight: 800, color: C.t1, fontSize: '1rem', marginBottom: '1rem', fontFamily: '"Space Grotesk", sans-serif' }}>Create a Collection</h2>
                                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Collection name..." required
                                            style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '0.625rem', border: `1px solid ${C.border}`, fontSize: '0.9rem', color: C.t1, outline: 'none', fontFamily: '"Inter", sans-serif', boxSizing: 'border-box' }}
                                            onFocus={e => e.target.style.borderColor = C.accent}
                                            onBlur={e => e.target.style.borderColor = C.border} />
                                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" rows={2}
                                            style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '0.625rem', border: `1px solid ${C.border}`, fontSize: '0.875rem', color: C.t1, outline: 'none', resize: 'none', fontFamily: '"Inter", sans-serif', boxSizing: 'border-box' }}
                                            onFocus={e => e.target.style.borderColor = C.accent}
                                            onBlur={e => e.target.style.borderColor = C.border} />
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', fontSize: '0.875rem', color: C.t2, userSelect: 'none' }}>
                                            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} style={{ width: 16, height: 16, accentColor: C.accent }} />
                                            Make this collection public
                                        </label>
                                        <div style={{ display: 'flex', gap: '0.625rem' }}>
                                            <button type="submit" disabled={saving || !name.trim()} style={{ flex: 1, padding: '0.7rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: '#fff', opacity: saving || !name.trim() ? 0.7 : 1 }}>
                                                {saving ? 'Creating...' : 'Create Collection'}
                                            </button>
                                            <button type="button" onClick={() => setCreateMode(false)} style={{ padding: '0.7rem 1rem', borderRadius: '0.625rem', border: `1px solid ${C.border}`, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', background: 'transparent', color: C.t2 }}>
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Collections List */}
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', overflow: 'hidden' }}>
                            <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontWeight: 800, color: C.t1, fontSize: '0.95rem', margin: 0, fontFamily: '"Space Grotesk", sans-serif' }}>Your Collections</h2>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: C.t3 }}>{collections.length} total</span>
                            </div>
                            {loading ? (
                                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {[1,2,3].map(i => <div key={i} style={{ height: 60, background: C.bg, borderRadius: '0.625rem', animation: 'pulse 1.5s infinite' }} />)}
                                </div>
                            ) : collections.length === 0 ? (
                                <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
                                    <p style={{ color: C.t2, fontSize: '0.9rem', marginBottom: '0.875rem', fontWeight: 600 }}>No collections yet</p>
                                    <button onClick={() => setCreateMode(true)} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.625rem', background: C.accent, color: '#fff', fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer' }}>
                                        Create your first →
                                    </button>
                                </div>
                            ) : (
                                <div style={{ padding: '0.625rem' }}>
                                    {collections.map((col, i) => {
                                        const emoji = COLLECTION_EMOJIS[i % COLLECTION_EMOJIS.length];
                                        const isActive = selectedId === col._id;
                                        return (
                                            <motion.button key={col._id}
                                                whileHover={{ x: 2 }}
                                                onClick={() => { setSelectedId(col._id); setCreateMode(false); }}
                                                style={{
                                                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.875rem',
                                                    padding: '0.875rem 1rem', borderRadius: '0.75rem', border: 'none',
                                                    background: isActive ? '#eff6ff' : 'transparent', cursor: 'pointer',
                                                    textAlign: 'left', transition: 'all 0.15s ease', marginBottom: '0.25rem'
                                                }}
                                            >
                                                <div style={{ width: 42, height: 42, borderRadius: '0.75rem', flexShrink: 0, background: isActive ? 'rgba(99,102,241,0.1)' : C.bg, border: `1px solid ${isActive ? C.accent : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', transition: 'all 0.15s' }}>
                                                    {emoji}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700, color: isActive ? C.accent : C.t1, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: C.t3, marginTop: '0.125rem' }}>
                                                        {(col.posts || []).length} posts {col.isPublic ? '· 🌐 Public' : '· 🔒 Private'}
                                                    </div>
                                                </div>
                                                <svg style={{ width: 14, height: 14, color: isActive ? C.accent : C.t3, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: detail panel */}
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem', overflow: 'hidden', minHeight: 300 }}>
                        {!selectedId ? (
                            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👈</div>
                                <h3 style={{ color: C.t1, fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>Select a collection</h3>
                                <p style={{ color: C.t3, fontSize: '0.875rem' }}>Click any collection on the left to view and edit its details.</p>
                            </div>
                        ) : detailLoading ? (
                            <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[1,2,3].map(i => <div key={i} style={{ height: 40, background: C.bg, borderRadius: '0.625rem', animation: 'pulse 1.5s infinite' }} />)}
                            </div>
                        ) : selected ? (
                            <>
                                {/* Detail header */}
                                <div style={{ padding: '1.25rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #f8fafc, #eff6ff)' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.accent, marginBottom: '0.2rem' }}>Collection Details</div>
                                        <h2 style={{ fontWeight: 800, color: C.t1, fontSize: '1rem', margin: 0, fontFamily: '"Space Grotesk", sans-serif' }}>{selected.name}</h2>
                                    </div>
                                    <button onClick={() => handleDelete(selected._id)} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', background: '#fff5f5', border: '1px solid #fecaca', padding: '0.35rem 0.875rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
                                        🗑 Delete
                                    </button>
                                </div>

                                {/* Edit fields */}
                                <div style={{ padding: '1.25rem', borderBottom: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <input value={editName} onChange={e => { setEditName(e.target.value); setEditDirty(true); }}
                                        style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', border: `1px solid ${C.border}`, fontSize: '0.9rem', color: C.t1, outline: 'none', fontFamily: '"Inter", sans-serif', boxSizing: 'border-box' }}
                                        onFocus={e => e.target.style.borderColor = C.accent}
                                        onBlur={e => e.target.style.borderColor = C.border} />
                                    <textarea value={editDescription} onChange={e => { setEditDescription(e.target.value); setEditDirty(true); }} rows={2} placeholder="Description..."
                                        style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', border: `1px solid ${C.border}`, fontSize: '0.875rem', color: C.t1, outline: 'none', resize: 'none', fontFamily: '"Inter", sans-serif', boxSizing: 'border-box' }}
                                        onFocus={e => e.target.style.borderColor = C.accent}
                                        onBlur={e => e.target.style.borderColor = C.border} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: C.t2, userSelect: 'none' }}>
                                            <input type="checkbox" checked={editIsPublic} onChange={e => { setEditIsPublic(e.target.checked); setEditDirty(true); }} style={{ accentColor: C.accent }} />
                                            Public collection
                                        </label>
                                        {editDirty && (
                                            <button onClick={handleUpdate} disabled={saving} style={{ padding: '0.4rem 1rem', borderRadius: '0.5rem', background: C.accent, color: '#fff', fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Posts in collection */}
                                <div style={{ padding: '1.25rem' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.t3, marginBottom: '0.875rem' }}>
                                        Posts ({(selected.posts || []).length})
                                    </div>
                                    {(selected.posts || []).length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '2rem', color: C.t3, fontSize: '0.875rem' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
                                            No posts in this collection yet.<br />
                                            <span style={{ fontSize: '0.8rem' }}>Save posts from the feed and add them here.</span>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                            {(selected.posts || []).map((post: any) => (
                                                <div key={post._id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem', background: C.bg, borderRadius: '0.75rem', border: `1px solid ${C.border}` }}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <Link to={`/posts/${post._id}`} style={{ fontWeight: 700, color: C.t1, fontSize: '0.875rem', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                            onMouseEnter={e => e.currentTarget.style.color = C.accent}
                                                            onMouseLeave={e => e.currentTarget.style.color = C.t1}>
                                                            {post.title}
                                                        </Link>
                                                        <div style={{ fontSize: '0.72rem', color: C.t3, marginTop: '0.2rem', textTransform: 'capitalize' }}>
                                                            {post.type} · {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleRemovePost(post._id)} style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, padding: '0.2rem 0.5rem' }}>
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Collections;
