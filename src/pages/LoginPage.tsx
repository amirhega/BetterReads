import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-3xl font-bold font-display text-center mb-8">Sign In</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-accent-warm/10 border border-accent-warm/30 text-accent-warm rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm text-text-secondary mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface-input text-text-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface-input text-text-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent-primary text-surface py-3 rounded-lg font-medium hover:bg-accent-primary/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-center text-text-muted text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-accent-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
