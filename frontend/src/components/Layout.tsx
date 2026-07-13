import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { logoutUser } from '../store/authSlice';
import { notificationApi } from '../api/rentalApi';
import type { Notification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Fetch notifications if user is logged in
    const fetchNotifications = async () => {
      if (user) {
        try {
          // Mock or real call depending on data
          const response = await notificationApi.getAll();
          setUnreadNotifications(response.data.filter(n => !n.isRead));
        } catch (err) {
          console.error("Failed to load notifications", err);
        }
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setUnreadNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const isCustomer = user?.role === 'ROLE_CUSTOMER';

  const menuItems = isCustomer
    ? [
        { path: '/dashboard', label: 'Cổng khách thuê', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
        { path: '/bookings', label: 'Đặt chỗ của tôi', icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z' },
        { path: '/contracts', label: 'Hợp đồng của tôi', icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z' },
        { path: '/payments', label: 'Thanh toán & Hóa đơn', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z' },
        { path: '/maintenance', label: 'Yêu cầu hỗ trợ', icon: 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.3C.5 6.7.9 9.8 2.9 11.8c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.1z' },
      ]
    : [
        { path: '/dashboard', label: 'Tổng quan (Dashboard)', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
        { path: '/booths', label: 'Gian hàng & Khu vực', icon: 'M4 4h7v7H4V4zm6 2H6v3h4V6zm-6 8h7v7H4v-7zm6 2H6v3h4v-3zm8-12h7v7h-7V4zm6 2h-4v3h4V6zm-6 8h7v7h-7v-7zm6 2h-4v3h4v-3z' },
        { path: '/customers', label: 'Khách thuê', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
        { path: '/bookings', label: 'Đặt chỗ & Báo giá', icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z' },
        { path: '/contracts', label: 'Hợp đồng thuê', icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z' },
        { path: '/payments', label: 'Tài chính & Công nợ', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z' },
        { path: '/maintenance', label: 'Yêu cầu vận hành', icon: 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.3C.5 6.7.9 9.8 2.9 11.8c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.1z' },
      ];

  return (
    <div className="layout-root">
      {/* Sidebar */}
      <aside className="layout-sidebar">
        <div className="sidebar-brand" style={{ justifyContent: 'center' }}>
          <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '1.5px', background: 'linear-gradient(to right, #1e40af, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center' }}>
            STALL RENTAL
          </span>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link to={item.path} className={`nav-link ${isActive ? 'active' : ''}`}>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout-sidebar" style={{ justifyContent: 'center' }}>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="layout-main-container">
        {/* Header */}
        <header className="layout-header">
          <div className="header-title">
            <h1>Hệ thống quản lý thuê gian hàng</h1>
          </div>
          
          <div className="header-actions">
            {/* Notification icon */}
            <div className="notification-bell-container">
              <button className="icon-btn-header" onClick={() => setShowNotifications(!showNotifications)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                {unreadNotifications.length > 0 && (
                  <span className="notification-badge">{unreadNotifications.length}</span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <h3>Thông báo mới</h3>
                    <button className="text-btn" onClick={() => setShowNotifications(false)}>Đóng</button>
                  </div>
                  <div className="dropdown-body">
                    {unreadNotifications.length === 0 ? (
                      <p className="no-notifications">Không có thông báo mới.</p>
                    ) : (
                      unreadNotifications.map(notification => (
                        <div key={notification.id} className="notification-item">
                          <div>
                            <h4>{notification.title}</h4>
                            <p>{notification.content}</p>
                            <span className="time">{notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : ''}</span>
                          </div>
                          <button className="mark-read-btn" onClick={() => notification.id && handleMarkAsRead(notification.id)}>✓</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="user-profile-header">
              <div className="user-avatar">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.fullName}</span>
                <span className="user-role">{user?.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
}
