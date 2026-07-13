import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { loginUser, clearError, setCredentialsFromOAuth } from '../store/authSlice';
import type { FormEvent } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const error = useAppSelector((state) => state.auth.error);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const oauthUsername = searchParams.get('username');
    const fullName = searchParams.get('fullName');
    const email = searchParams.get('email');
    const role = searchParams.get('role');

    if (accessToken && refreshToken && oauthUsername) {
      dispatch(setCredentialsFromOAuth({
        accessToken,
        refreshToken,
        user: {
          username: oauthUsername,
          fullName: fullName || '',
          email: email || '',
          role: role || 'ROLE_CUSTOMER',
        },
      }));
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, dispatch, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await dispatch(loginUser({ username, password })).unwrap();
      navigate('/dashboard');
    } catch {
      // error is handled by Redux slice
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_OAUTH2_BASE_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Stall Rental</h1>
          <p>Sign in to your account</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>{error}</span>
            <button onClick={() => dispatch(clearError())}>&times;</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="auth-btn primary" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button type="button" className="auth-btn google" onClick={handleGoogleLogin}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
