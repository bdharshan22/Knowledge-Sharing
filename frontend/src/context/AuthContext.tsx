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
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  // ── Auto Logout Logic (2 minutes) ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    let logoutTimer: any;

    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      // Set timer to 2 minutes (120,000ms)
      logoutTimer = setTimeout(() => {
        console.log('Inactivity detected. Logging out...');
        logout();
      }, 120000); 
    };

    // Events to track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Initialize timer
    resetTimer();

    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
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

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
