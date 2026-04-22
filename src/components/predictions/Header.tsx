import React, { useState } from 'react';
import { Bell, Search, User, Menu, X, Settings, LogOut, ChevronDown, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onMenuToggle?: () => void;
  menuOpen?: boolean;
  liveCount?: number;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, menuOpen, liveCount = 0 }) => {
  const { user, profile, signOut, isAuthenticated } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const displayName = profile?.username || user?.email?.split('@')[0] || 'Guest';
  const membershipLabel = isAuthenticated ? 'Member' : 'Guest';

  const notifications: Array<{ id: number; title: string; message: string; time: string; type: 'alert' | 'success' | 'info' | 'update' }> = [];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5 text-slate-300" /> : <Menu className="w-5 h-5 text-slate-300" />}
            </button>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  PredictAI
                </h1>
                <p className="text-[10px] text-slate-500 -mt-1">Sports Intelligence</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className={`${searchOpen ? 'flex' : 'hidden'} md:flex flex-1 max-w-xl mx-4`}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teams, leagues, or events..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                </button>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 transition-colors"
            >
              <Search className="w-5 h-5 text-slate-300" />
            </button>

            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-rose-400">{liveCount} Live</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                className="relative p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 transition-colors"
              >
                <Bell className="w-5 h-5 text-slate-300" />
                {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full" />}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2">
                  <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    <button className="text-xs text-cyan-400 hover:text-cyan-300">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500">No new notifications</div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="p-3 hover:bg-slate-700/50 transition-colors border-b border-slate-700/50 last:border-0">
                          <div className="flex items-start gap-3">
                            <div className={`p-1.5 rounded-lg ${
                              notif.type === 'alert' ? 'bg-amber-500/20' :
                              notif.type === 'success' ? 'bg-emerald-500/20' :
                              notif.type === 'update' ? 'bg-purple-500/20' : 'bg-cyan-500/20'
                            }`}>
                              {notif.type === 'alert' ? <Zap className="w-4 h-4 text-amber-400" /> :
                               notif.type === 'success' ? <TrendingUp className="w-4 h-4 text-emerald-400" /> :
                               <Bell className="w-4 h-4 text-cyan-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{notif.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{notif.message}</p>
                              <p className="text-[10px] text-slate-500 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 bg-slate-800/50 border-t border-slate-700">
                    <button className="w-full py-2 text-xs text-center text-cyan-400 hover:text-cyan-300">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{displayName}</p>
                        <p className="text-xs text-slate-400">{membershipLabel}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-300">My Profile</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-300">Settings</span>
                    </button>
                    <button
                      onClick={async () => {
                        if (isAuthenticated) {
                          await signOut();
                        } else {
                          window.location.href = '/auth';
                        }
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-rose-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">{isAuthenticated ? 'Sign Out' : 'Sign In'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Expanded */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teams, leagues, or events..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
