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
