import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Helper to simulate a more deliberate loading experience (min-delay for animations)
const lazyWithDelay = (componentImport: () => Promise<any>) => 
  lazy(() => Promise.all([componentImport(), new Promise(resolve => setTimeout(resolve, 2000))]).then(([module]) => module));

// ── Core Pages (with deliberate loading delay) ───────────────────────────────────
// ── Core Pages (with deliberate loading delay) ───────────────────────────────────
const Home            = lazyWithDelay(() => import('./pages/Home'));
const Login           = lazyWithDelay(() => import('./pages/Login'));
const Register        = lazyWithDelay(() => import('./pages/Register'));
const Signup          = lazyWithDelay(() => import('./pages/Signup'));
const KnowledgeFeed   = lazyWithDelay(() => import('./pages/KnowledgeFeed'));
const LandingPage     = lazyWithDelay(() => import('./pages/LandingPage'));

// ── Secondary Pages (standard lazy load) ─────────────────────────────────────────
const PostDetail      = lazy(() => import('./pages/PostDetail'));
const CreatePost      = lazy(() => import('./pages/CreatePost'));
const Profile         = lazy(() => import('./pages/Profile'));
const EditProfile     = lazy(() => import('./pages/EditProfile'));
const SearchPage      = lazy(() => import('./pages/SearchPage'));
const LearningPaths   = lazy(() => import('./pages/LearningPaths'));
const PathDetail      = lazy(() => import('./pages/PathDetail'));
const ProjectGallery  = lazy(() => import('./pages/ProjectGallery'));
const ProjectDetail   = lazy(() => import('./pages/ProjectDetail'));
const SubmitProject   = lazy(() => import('./pages/SubmitProject'));
const Events          = lazy(() => import('./pages/Events'));
const ChatRoom        = lazy(() => import('./pages/ChatRoom'));
const Community       = lazy(() => import('./pages/Community'));
const Bookmarks       = lazy(() => import('./pages/Bookmarks'));
const Collections     = lazy(() => import('./pages/Collections'));
const MyPosts         = lazy(() => import('./pages/MyPosts'));
const Leaderboard     = lazy(() => import('./pages/Leaderboard'));
const ModerationQueue = lazy(() => import('./pages/ModerationQueue'));
const TermsOfService  = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy   = lazy(() => import('./pages/PrivacyPolicy'));

// ── Creative Page Loading Screen ─────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a1a',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glowing orbs */}
      <div style={{ position: 'absolute', top: '30%', left: '30%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'float 8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: '35vw', height: '35vw', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'float 10s ease-in-out infinite reverse' }} />

      <div style={{ textAlign: 'center', zIndex: 10 }}>
        {/* Animated logo container */}
        <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 2.5rem' }}>
          {/* Outer rotating rings */}
          <div style={{ position: 'absolute', inset: 0, border: '2px solid transparent', borderTopColor: '#06b6d4', borderBottomColor: '#6366f1', borderRadius: '50%', animation: 'spin 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite' }} />
          <div style={{ position: 'absolute', inset: 8, border: '2px dashed transparent', borderLeftColor: '#ec4899', borderRightColor: '#a855f7', borderRadius: '50%', animation: 'spin 2.5s linear infinite reverse', opacity: 0.5 }} />
          <div style={{ position: 'absolute', inset: 16, border: '2px solid transparent', borderLeftColor: '#06b6d4', borderRightColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite reverse' }} />
          
          {/* Center glowing element */}
          <div style={{ 
            position: 'absolute', 
            inset: 32, 
            background: 'linear-gradient(135deg, #06b6d4, #6366f1)', 
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(99,102,241,0.8), inset 0 0 10px rgba(255,255,255,0.4)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '2px' }}>KS</span>
          </div>
        </div>

        {/* Loading text with loading dots */}
        <div style={{ position: 'relative' }}>
          <h2 style={{ 
            color: '#e2e8f0', 
            fontSize: '1.4rem', 
            fontWeight: 800,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            margin: 0,
            background: 'linear-gradient(90deg, #67e8f9, #a5b4fc, #f9a8d4, #67e8f9)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradientFlow 3s linear infinite'
          }}>
            Loading
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
            <div style={{ width: '8px', height: '8px', background: '#06b6d4', borderRadius: '50%', boxShadow: '0 0 10px #06b6d4', animation: 'bounce 1.4s infinite ease-in-out both' }} />
            <div style={{ width: '8px', height: '8px', background: '#6366f1', borderRadius: '50%', boxShadow: '0 0 10px #6366f1', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.16s' }} />
            <div style={{ width: '8px', height: '8px', background: '#ec4899', borderRadius: '50%', boxShadow: '0 0 10px #ec4899', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.32s' }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { 
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); } 
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 25px rgba(99,102,241,0.6), inset 0 0 10px rgba(255,255,255,0.4); }
          50% { transform: scale(1.08); box-shadow: 0 0 40px rgba(99,102,241,0.9), inset 0 0 15px rgba(255,255,255,0.6); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes gradientFlow {
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}

import ProtectedRoute from './components/ProtectedRoute';

// ── Root App ────────────────────────────────────────────────────────────────────
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/"            element={<Home />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/register"    element={<Register />} />
            <Route path="/signup"      element={<Signup />} />

            {/* Main App - Protected */}
            <Route path="/dashboard"   element={<ProtectedRoute><KnowledgeFeed /></ProtectedRoute>} />
            <Route path="/feed"        element={<ProtectedRoute><KnowledgeFeed /></ProtectedRoute>} />
            <Route path="/home"        element={<LandingPage />} />
            <Route path="/search"      element={<SearchPage />} />

            {/* Posts */}
            <Route path="/posts/:id"       element={<PostDetail />} />
            <Route path="/create-post"     element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
            <Route path="/my-posts"        element={<ProtectedRoute><MyPosts /></ProtectedRoute>} />

            {/* Users */}
            <Route path="/users/:id"       element={<Profile />} />
            <Route path="/profile"         element={<Profile />} />
            <Route path="/settings/profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

            {/* Learning */}
            <Route path="/learning-paths"  element={<LearningPaths />} />
            <Route path="/paths/:id"       element={<PathDetail />} />

            {/* Projects */}
            <Route path="/projects"        element={<ProjectGallery />} />
            <Route path="/projects/:id"    element={<ProjectDetail />} />
            <Route path="/submit-project"  element={<SubmitProject />} />

            {/* Community */}
            <Route path="/events"          element={<Events />} />
            <Route path="/community/rooms/:id" element={<ChatRoom />} />
            <Route path="/community"       element={<Community />} />
            <Route path="/leaderboard"     element={<Leaderboard />} />

            {/* User content - Protected */}
            <Route path="/bookmarks"       element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
            <Route path="/collections"     element={<ProtectedRoute><Collections /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/moderation"      element={<ModerationQueue />} />

            {/* Legal */}
            <Route path="/terms"           element={<TermsOfService />} />
            <Route path="/privacy"         element={<PrivacyPolicy />} />

            {/* Fallback */}
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
