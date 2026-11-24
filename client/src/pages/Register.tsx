import { useMemo, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../Components/AuthLayout';
import AuthInput from '../Components/AuthInput';
import AuthError from '../Components/AuthError';
import SubmitButton from '../Components/SubmitButton';

const strengthLabels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-500'];

function getStrength(pw: string) {
  if (pw.length < 6) return 0;
  let score = 1;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getStrength(password), [password]);

  if (user) return <Navigate to={from} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ?? 'Signup failed. Please try again.'
          : 'Signup failed. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Create an account to enroll in courses."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </>
      }
    >
      <AuthError message={error} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          label="Full name"
          icon={<User size={18} />}
          placeholder="Your name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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

        <div>
          <AuthInput
            label="Password"
            type="password"
            icon={<Lock size={18} />}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {password && (
            <div className="mt-2">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= strength ? strengthColors[strength] : 'bg-surface-2'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-muted">
                Strength: <span className="font-medium text-fg">{strengthLabels[strength]}</span>
              </p>
            </div>
          )}
        </div>

        <SubmitButton loading={loading} idleText="Create account" loadingText="Creating account..." />
      </form>
    </AuthLayout>
  );
}