import { createContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  points: number;
  badges: string[];
  avatar?: string;
  title?: string;
  jobTitle?: string;
  company?: string;
  website?: string;
  username?: string;
  bio?: string;
  location?: string;
  socials?: {
    github?: string;
    linkedin?: string;
    leetcode?: string;
    stackoverflow?: string;
    medium?: string;
    twitter?: string;
  };
  skills?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  secondsRemaining: number | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData && userData !== 'undefined') {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data from localStorage', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  // ── Auto Logout Logic (Throttled Timer) ───────────────────────────────────
  useEffect(() => {
    if (!user) {
      setSecondsRemaining(null);
      return;
    }

    const LIMIT = 120; // 2 minutes
    let lastActivity = Date.now();
    let logoutTimer: any;
    let countdownInterval: any;

    const resetActivity = () => {
      // Throttle reset to avoid excessive state updates/timers
      if (Date.now() - lastActivity < 1000) return;
      lastActivity = Date.now();
      
      setSecondsRemaining(LIMIT);
      
      if (logoutTimer) clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        logout();
        window.location.href = '/'; // Global redirect to landing on auto-logout
      }, LIMIT * 1000);
    };

    const countdown = () => {
      const elapsed = Math.floor((Date.now() - lastActivity) / 1000);
      const remaining = Math.max(0, LIMIT - elapsed);
      setSecondsRemaining(remaining);
      if (remaining === 0) {
        logout();
        window.location.href = '/'; // Global redirect
      }
    };

    countdownInterval = setInterval(countdown, 1000);
    logoutTimer = setTimeout(() => {
        logout();
        window.location.href = '/';
    }, LIMIT * 1000);
    setSecondsRemaining(LIMIT);

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetActivity));

    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      if (countdownInterval) clearInterval(countdownInterval);
      events.forEach(e => window.removeEventListener(e, resetActivity));
    };
  }, [user]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, secondsRemaining }}>
      {children}
    </AuthContext.Provider>
  );
};
