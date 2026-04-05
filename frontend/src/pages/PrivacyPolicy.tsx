import { useNavigate } from 'react-router-dom';
import Navbar from '../components/AppNavbar';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: '"Inter", sans-serif' }}>
      <Navbar />
      <div className="pt-24 pb-20 max-w-4xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-cyan-600 transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-3xl p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
            <div className="text-lg">Your privacy is important to us. Here's how we handle your data.</div>
            
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Data We Collect</h2>
              <p>When you sign up, we collect your name, email, and any profile metadata you choose to provide. We also collect usage data to help us improve the platform.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">2. How We Use Data</h2>
              <p>We use your information to provide our services, maintain your profile, and facilitate knowledge sharing between colleagues. We do not sell your personal data to third parties.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">3. Data Security</h2>
              <p>We use industry-standard security measures to protect your account and your content. This includes encrypted transmissions and secure database storage.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Cookies</h2>
              <p>KnowledgeShare uses cookies to keep you logged in and to analyze our traffic. You can choose to disable cookies in your browser settings, but some features of the service may be limited.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Your Rights</h2>
              <p>You have the right to request access to, correction of, or deletion of your personal data. Please contact us if you need assistance managing your information.</p>
            </section>

            <div className="pt-10 border-t border-slate-100 mt-10 text-sm italic">
              Last updated: April 5, 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
