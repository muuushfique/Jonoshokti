import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  PlusCircle,
  CheckCheck,
  TrendingUp,
} from 'lucide-react';
import Logo from './Logo';
import StatusBadge from './StatusBadge';
import ReportIssueModal from './ReportIssueModal';
import { useTheme } from '../context/ThemeContext';
import { api } from '../lib/api';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/current-issues', label: 'Current Issues' },
  { to: '/govt-issues', label: 'Govt. Issues' },
  { to: '/solved-issues', label: 'Solved' },
  { to: '/reports', label: 'Reports' },
  { to: '/community-service', label: 'Community' },
  { to: '/contact-us', label: 'Contact' },
];

export default function Layout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    let active = true;
    api
      .get('/stats')
      .then(({ data }) => {
        if (active && Array.isArray(data.recentActivity)) {
          setNotifications(data.recentActivity);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 font-semibold'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-emerald-950/80 bg-white/85 dark:bg-[#0B1519]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/" onClick={() => setMobileOpen(false)}>
              <Logo />
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2 shadow-sm transition"
            >
              <PlusCircle className="h-4 w-4" />
              Raise Issue
            </button>

            {/* Notifications popover */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unread && notifications.length > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white dark:ring-[#0B1519]" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 surface-card shadow-xl p-3 z-50">
                  <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                      Trending Civic Updates
                    </span>
                    <button
                      type="button"
                      onClick={() => setUnread(false)}
                      className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark read
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No recent updates yet.</p>
                  ) : (
                    <ul className="space-y-1">
                      {notifications.map((n) => (
                        <li key={n.id}>
                          <Link
                            to={`/issues/${n.source}/${n.issue_id}`}
                            onClick={() => {
                              setNotifOpen(false);
                              setUnread(false);
                            }}
                            className="block p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition"
                          >
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
                              {n.title}
                            </p>
                            <div className="flex items-center justify-between mt-1.5">
                              <StatusBadge status={n.status} />
                              <span className="text-[11px] font-medium text-slate-500">
                                {n.upvotes} upvotes
                              </span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1519] px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setReportOpen(true);
              }}
              className="w-full mt-2 btn-civic"
            >
              <PlusCircle className="h-4 w-4" />
              Raise a Civic Issue
            </button>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t border-slate-200/80 dark:border-emerald-950/80 bg-white dark:bg-[#0B1519]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Logo size="sm" />
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm text-center md:text-left">
              Empowering Bangladeshi citizens to raise, prioritize, and track public and government
              issues transparently.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            <Link to="/current-issues" className="hover:text-emerald-700 dark:hover:text-emerald-400">
              Current Issues
            </Link>
            <Link to="/govt-issues" className="hover:text-emerald-700 dark:hover:text-emerald-400">
              Govt. Issues
            </Link>
            <Link to="/solved-issues" className="hover:text-emerald-700 dark:hover:text-emerald-400">
              Solved Issues
            </Link>
            <Link to="/reports" className="hover:text-emerald-700 dark:hover:text-emerald-400">
              Reports
            </Link>
            <Link to="/community-service" className="hover:text-emerald-700 dark:hover:text-emerald-400">
              Community Service
            </Link>
            <Link to="/contact-us" className="hover:text-emerald-700 dark:hover:text-emerald-400">
              Contact Us
            </Link>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} Jonoshokti. All rights reserved.
          </p>
        </div>
      </footer>

      <ReportIssueModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        onCreated={(created) => {
          navigate(`/issues/${created.source}/${created.issue_id}`);
        }}
      />
    </div>
  );
}
