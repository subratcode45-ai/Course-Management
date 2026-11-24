import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../Components/AuthLayout';
import AuthInput from '../Components/AuthInput';
import AuthError from '../Components/AuthError';
import SubmitButton from '../Components/SubmitButton';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const destination = (role: string) => (role === 'admin' && from === '/' ? '/admin' : from);

  // already logged in: no reason to see this page
  if (user) return <Navigate to={destination(user.role)} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      navigate(destination(loggedInUser.role), { replace: true });
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ?? 'Login failed. Please try again.'
          : 'Login failed. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to open your courses."
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/register" state={location.state} className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <AuthError message={error} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          label="Email"
          type="email"
          icon={<Mail size={18} />}
          placeholder="you@example.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthInput
          label="Password"
          type="password"
          icon={<Lock size={18} />}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <SubmitButton loading={loading} idleText="Login" loadingText="Logging in..." />
      </form>
    </AuthLayout>
  );
}