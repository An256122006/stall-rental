import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>403</h1>
          <p>Access Denied</p>
        </div>
        <p>You don't have permission to access this page.</p>
        <Link to="/login" className="auth-btn primary" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>
          Back to Login
        </Link>
      </div>
    </div>
  );
}
