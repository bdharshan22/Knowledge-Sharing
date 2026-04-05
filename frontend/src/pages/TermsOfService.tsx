import { useNavigate } from 'react-router-dom';
import Navbar from '../components/AppNavbar';

const TermsOfService = () => {
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
          <h1 className="text-4xl font-extrabold text-slate-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
            <p className="text-lg">Welcome to KnowledgeShare. By using our platform, you agree to the following terms and conditions.</p>
            
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Acceptance of Terms</h2>
              <p>By accessing or using the KnowledgeShare portal, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you may not use the platform.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">2. User Accounts</h2>
              <p>To access most features of the platform, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">3. Content Ownership</h2>
              <p>You retain ownership of the content you post on KnowledgeShare. However, by posting content, you grant KnowledgeShare a worldwide, non-exclusive, royalty-free license to use, reproduce, and display that content for the purpose of providing the service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Prohibited Conduct</h2>
              <p>You agree not to use the service for any illegal purpose or to post any content that is offensive, harmful, or violates the rights of others. We reserve the right to remove any content or terminate accounts that violate these terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Limitation of Liability</h2>
              <p>KnowledgeShare is provided "as is" without any warrants. KnowledgeShare shall not be liable for any indirect, incidental, or consequential damages resulting from the use of the platform.</p>
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

export default TermsOfService;
