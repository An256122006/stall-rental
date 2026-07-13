import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Stall Rental System</h1>
        <div className="user-info">
          <span>Welcome, {user?.fullName}</span>
          <span className="role-badge">{user?.role}</span>
          <button onClick={handleLogout} className="auth-btn logout">Logout</button>
        </div>
      </header>
      <main className="dashboard-main">
        <h2>Dashboard</h2>
        <p>You are logged in as <strong>{user?.role}</strong></p>
      </main>
    </div>
  );
}
