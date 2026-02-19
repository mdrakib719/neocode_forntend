import React, { useEffect, useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../controllers/auth.controller';
import { useNotificationStore } from '../../controllers/notification.controller';
import './Layout.css';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const CUSTOMER_NAV: NavItem[] = [
  { path: '/dashboard',    label: 'Dashboard',     icon: '◫' },
  { path: '/accounts',     label: 'Accounts',      icon: '🏦' },
  { path: '/transactions', label: 'Transactions',  icon: '↕' },
  { path: '/loans',        label: 'Loans',         icon: '📋' },
  { path: '/statements',   label: 'Statements',    icon: '📄' },
  { path: '/notifications',label: 'Notifications', icon: '🔔' },
  { path: '/profile',      label: 'Profile',       icon: '◉' },
];

const EMPLOYEE_NAV: NavItem[] = [
  { path: '/dashboard',     label: 'Dashboard',     icon: '◫' },
  { path: '/staff',         label: 'Staff Panel',   icon: '🏦' },
  { path: '/loan-officers', label: 'Loan Officer',  icon: '📋' },
  { path: '/notifications', label: 'Notifications', icon: '🔔' },
  { path: '/profile',       label: 'Profile',       icon: '◉' },
];

const ADMIN_NAV: NavItem[] = [
  { path: '/dashboard',     label: 'Dashboard',     icon: '◫' },
  { path: '/staff',         label: 'Staff Panel',   icon: '🏦' },
  { path: '/loan-officers', label: 'Loan Officer',  icon: '📋' },
  { path: '/admin',         label: 'Admin',         icon: '⚙' },
  { path: '/notifications', label: 'Notifications', icon: '🔔' },
  { path: '/profile',       label: 'Profile',       icon: '◉' },
];

export const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30_000);
    return () => clearInterval(interval);
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems =
    user?.role === 'ADMIN'
      ? ADMIN_NAV
      : user?.role === 'EMPLOYEE'
      ? EMPLOYEE_NAV
      : CUSTOMER_NAV;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const pageName =
    navItems.find((n) => isActive(n.path))?.label ?? 'Dashboard';

  return (
    <div className="layout-root">
      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/dashboard" className="sidebar-brand" onClick={() => setSidebarOpen(false)}>
            <span className="sidebar-brand-icon">🏦</span>
            <span className="sidebar-brand-name">NeoBank</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link${isActive(item.path) ? ' sidebar-link-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
              {item.path === '/notifications' && unreadCount > 0 && (
                <span className="sidebar-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name}</span>
              <span className="sidebar-user-role">{user?.role}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm sidebar-logout" onClick={handleLogout} title="Sign out">
            ⏻
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="layout-main">
        {/* Top header bar */}
        <header className="topbar">
          <button
            className="topbar-menu-btn btn btn-ghost btn-sm"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <h1 className="topbar-title">{pageName}</h1>
          <div className="topbar-right">
            <span className={`role-badge role-${user?.role?.toLowerCase()}`}>
              {user?.role}
            </span>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

