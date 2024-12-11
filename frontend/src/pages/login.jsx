import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        navigate('/', { replace: true }); // Redirect to chat if session exists
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate('/', { replace: true }); // Redirect to chat on login
      }
    });

    return () => subscription.unsubscribe(); // Cleanup on component unmount
  }, [navigate]);

  // Handle Login
  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { error, data } = await supabase.auth.signInWithSSO({
        domain: import.meta.env.VITE_SSO_DOMAIN,
      });
      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url; // Redirect to SSO
      }
    } catch (err) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Redirecting...' : 'Login with SSO'}
        </button>
      </div>
    </div>
  );
}