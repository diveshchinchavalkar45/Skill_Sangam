import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Compass,
  PlusCircle,
  Inbox,
  Send,
  MessageSquare,
  Shield,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  BookOpen
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isOrganizer, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                Skill<span className="text-brand-600">Sangam</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider -mt-1 hidden sm:inline">
                Team Formation AI
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            <Link
              to="/projects"
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive('/projects') ? 'text-brand-600 bg-brand-50/70 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore Projects</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive('/dashboard') ? 'text-brand-600 bg-brand-50/70 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <span>Dashboard</span>
                </Link>

                {user?.user_type === 'student' && (
                  <Link
                    to="/student/assignments"
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                      isActive('/student/assignments') || location.pathname.startsWith('/student/assignments') ? 'text-brand-600 bg-brand-50/70 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-brand-600" />
                    <span>Assignments</span>
                  </Link>
                )}

                <Link
                  to="/projects/new"
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive('/projects/new') ? 'text-brand-600 bg-brand-50/70 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-brand-600" />
                  <span>Create Project</span>
                </Link>

                <Link
                  to="/requests"
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive('/requests') ? 'text-brand-600 bg-brand-50/70 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Inbox className="w-4 h-4" />
                  <span>Requests</span>
                </Link>

                <Link
                  to="/invitations"
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive('/invitations') ? 'text-brand-600 bg-brand-50/70 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Invitations</span>
                </Link>

                <Link
                  to="/messages"
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive('/messages') ? 'text-brand-600 bg-brand-50/70 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Messages</span>
                </Link>

                {isOrganizer && (
                  <Link
                    to="/organizer"
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-semibold`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Organizer Hub</span>
                  </Link>
                )}
              </>
            ) : (
              <Link
                to="/about"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isActive('/about') ? 'text-brand-600 bg-brand-50/70 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                About Platform
              </Link>
            )}
          </nav>

          {/* Right Action / Profile Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all focus:outline-none"
                >
                  <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-brand-100 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                    {user?.profile_image_url ? (
                      <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0) || 'U'
                    )}
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {user?.user_type}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-600/30 transition-all hover:shadow"
                >
                  Find My Team
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="pb-3 mb-2 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm uppercase">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{user?.name}</div>
                  <div className="text-xs text-slate-500">{user?.email}</div>
                </div>
              </div>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </Link>
              {user?.user_type === 'student' && (
                <Link
                  to="/student/assignments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-brand-600 font-semibold hover:bg-brand-50"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Assignments & Communities</span>
                </Link>
              )}
              <Link
                to="/projects"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Explore Projects
              </Link>
              <Link
                to="/projects/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-brand-600 font-semibold hover:bg-brand-50"
              >
                + Create Project
              </Link>
              <Link
                to="/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Join Requests
              </Link>
              <Link
                to="/invitations"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Invitations
              </Link>
              <Link
                to="/messages"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Messages
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                My Profile
              </Link>
              {isOrganizer && (
                <Link
                  to="/organizer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-indigo-700 bg-indigo-50 font-semibold"
                >
                  Organizer Hub
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left block px-3 py-2 rounded-lg text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/projects"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Explore Projects
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                About Platform
              </Link>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-brand-600 text-white font-semibold shadow"
                >
                  Find My Team
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
