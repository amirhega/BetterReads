import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function SignUpPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signUp(email, password, username);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-3xl font-bold font-display text-center mb-8">Create Account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-accent-warm/10 border border-accent-warm/30 text-accent-warm rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm text-text-secondary mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-surface-input text-text-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            required
            minLength={3}
          />
        </div>

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
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent-primary text-surface py-3 rounded-lg font-medium hover:bg-accent-primary/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className="text-center text-text-muted text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-primary hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
