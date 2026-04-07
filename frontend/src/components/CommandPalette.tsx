import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_ACTIONS = [
  { id: 'write', icon: '✏️', label: 'Write a new post', shortcut: 'N', to: '/create-post', group: 'Create' },
  { id: 'project', icon: '🚀', label: 'Submit a project', shortcut: '', to: '/submit-project', group: 'Create' },
  { id: 'dashboard', icon: '🏠', label: 'Go to Dashboard', shortcut: 'D', to: '/dashboard', group: 'Navigate' },
  { id: 'community', icon: '💬', label: 'Community Hub', shortcut: 'C', to: '/community', group: 'Navigate' },
  { id: 'leaderboard', icon: '🏆', label: 'Leaderboard', shortcut: 'L', to: '/leaderboard', group: 'Navigate' },
  { id: 'bookmarks', icon: '🔖', label: 'My Bookmarks', shortcut: 'B', to: '/bookmarks', group: 'Navigate' },
  { id: 'paths', icon: '🗺️', label: 'Learning Paths', shortcut: '', to: '/learning-paths', group: 'Navigate' },
  { id: 'projects', icon: '📦', label: 'Project Gallery', shortcut: '', to: '/projects', group: 'Navigate' },
  { id: 'events', icon: '📅', label: 'Upcoming Events', shortcut: '', to: '/events', group: 'Navigate' },
  { id: 'settings', icon: '⚙️', label: 'Settings', shortcut: 'S', to: '/settings/profile', group: 'Account' },
  { id: 'profile', icon: '👤', label: 'My Profile', shortcut: 'P', to: '/profile', group: 'Account' },
];

const CommandPalette = ({ isOpen, onClose }: CommandPaletteProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? QUICK_ACTIONS.filter(
        a =>
          a.label.toLowerCase().includes(query.toLowerCase()) ||
          a.group.toLowerCase().includes(query.toLowerCase())
      )
    : QUICK_ACTIONS;

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof QUICK_ACTIONS>);

  const flatList = Object.values(grouped).flat();

  const handleSelect = useCallback(
    (to: string) => {
      onClose();
      setQuery('');
      navigate(to);
    },
    [navigate, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, flatList.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && flatList[activeIndex]) {
        e.preventDefault();
        handleSelect(flatList[activeIndex].to);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, activeIndex, flatList, handleSelect, onClose]);


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(2, 6, 23, 0.85)',
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', top: '12vh', left: '50%',
              transform: 'translateX(-50%)',
              width: '100%', maxWidth: 560,
              zIndex: 201,
              background: 'rgba(10, 15, 30, 0.98)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(100, 160, 255, 0.15)',
              borderRadius: '1.25rem',
              overflow: 'hidden',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(6,182,212,0.1)',
            }}
          >
            {/* Search input */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.875rem',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid rgba(100,160,255,0.08)',
            }}>
              <svg style={{ width: 20, height: 20, color: '#06b6d4', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search commands, pages, actions..."
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: '#f1f5f9', fontSize: '1rem', fontFamily: '"Inter", sans-serif',
                }}
              />
              <kbd style={{
                padding: '0.2rem 0.5rem',
                background: 'rgba(100,160,255,0.08)',
                border: '1px solid rgba(100,160,255,0.15)',
                borderRadius: '0.375rem',
                fontSize: '0.7rem', color: '#475569', fontFamily: 'monospace',
                flexShrink: 0
              }}>ESC</kbd>
            </div>

            {/* Results */}
            <div style={{ maxHeight: 380, overflowY: 'auto', padding: '0.5rem' }} className="custom-scroll">
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: '#334155' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
                  <p style={{ fontSize: '0.875rem' }}>No results for "<span style={{ color: '#64748b' }}>{query}</span>"</p>
                </div>
              ) : (
                Object.entries(grouped).map(([group, items]) => (
                  <div key={group}>
                    <div style={{
                      fontSize: '0.65rem', fontWeight: 800, color: '#334155',
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      padding: '0.625rem 0.75rem 0.375rem',
                    }}>{group}</div>
                    {items.map(item => {
                      const idx = flatList.indexOf(item);
                      const isActive = idx === activeIndex;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item.to)}
                          onMouseEnter={() => setActiveIndex(idx)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.875rem',
                            width: '100%', padding: '0.625rem 0.75rem',
                            borderRadius: '0.625rem', border: 'none', cursor: 'pointer',
                            background: isActive ? 'rgba(6,182,212,0.1)' : 'transparent',
                            transition: 'background 0.15s ease', textAlign: 'left',
                          }}
                        >
                          <span style={{
                            width: 32, height: 32, borderRadius: '0.5rem', flexShrink: 0,
                            background: isActive ? 'rgba(6,182,212,0.15)' : 'rgba(30,41,59,0.8)',
                            border: `1px solid ${isActive ? 'rgba(6,182,212,0.25)' : 'rgba(100,160,255,0.08)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1rem', transition: 'all 0.15s ease',
                          }}>{item.icon}</span>
                          <span style={{
                            flex: 1, fontSize: '0.9rem', fontWeight: 500,
                            color: isActive ? '#f1f5f9' : '#94a3b8',
                            transition: 'color 0.15s ease',
                          }}>{item.label}</span>
                          {item.shortcut && (
                            <kbd style={{
                              padding: '0.15rem 0.45rem',
                              background: 'rgba(100,160,255,0.06)',
                              border: '1px solid rgba(100,160,255,0.12)',
                              borderRadius: '0.3rem',
                              fontSize: '0.65rem', color: '#334155', fontFamily: 'monospace',
                              flexShrink: 0
                            }}>{item.shortcut}</kbd>
                          )}
                          {isActive && (
                            <svg style={{ width: 14, height: 14, color: '#06b6d4', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1.25rem',
              padding: '0.625rem 1.25rem',
              borderTop: '1px solid rgba(100,160,255,0.08)',
              color: '#1e293b', fontSize: '0.72rem', fontWeight: 600,
            }}>
              {[
                { keys: ['↑', '↓'], label: 'Navigate' },
                { keys: ['↵'], label: 'Select' },
                { keys: ['ESC'], label: 'Close' },
              ].map(hint => (
                <div key={hint.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  {hint.keys.map(k => (
                    <kbd key={k} style={{ padding: '0.15rem 0.4rem', background: 'rgba(100,160,255,0.06)', border: '1px solid rgba(100,160,255,0.1)', borderRadius: '0.3rem', fontFamily: 'monospace', fontSize: '0.7rem', color: '#334155' }}>{k}</kbd>
                  ))}
                  <span>{hint.label}</span>
                </div>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ width: 16, height: 16, borderRadius: '3px', background: 'linear-gradient(135deg, #06b6d4, #6366f1)', display: 'inline-block' }} />
                <span style={{ color: '#1e293b' }}>KnowledgePortal</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
