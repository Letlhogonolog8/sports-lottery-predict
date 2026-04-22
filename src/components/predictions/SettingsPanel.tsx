import React, { useState } from 'react';
import { Bell, Moon, Sun, Globe, Shield, Zap, User, CreditCard, LogOut, ChevronRight, Check } from 'lucide-react';

const SettingsPanel: React.FC = () => {
  const [notifications, setNotifications] = useState({
    highConfidence: true,
    matchStart: true,
    predictionResults: true,
    modelUpdates: false,
    newsletter: true,
  });

  const [preferences, setPreferences] = useState({
    darkMode: true,
    autoRefresh: true,
    showOdds: true,
    defaultSport: 'football',
    language: 'en',
    timezone: 'UTC',
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePreference = (key: keyof typeof preferences) => {
    if (typeof preferences[key] === 'boolean') {
      setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">John Doe</h3>
              <p className="text-sm text-slate-400">john.doe@example.com</p>
              <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full text-xs font-medium text-amber-400">
                Premium Member
              </span>
            </div>
            <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-sm text-slate-300 transition-colors">
              Edit Profile
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-800/50 rounded-xl">
              <p className="text-2xl font-bold text-cyan-400">847</p>
              <p className="text-xs text-slate-500">Predictions Made</p>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-xl">
              <p className="text-2xl font-bold text-emerald-400">72.4%</p>
              <p className="text-xs text-slate-500">Success Rate</p>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-xl">
              <p className="text-2xl font-bold text-purple-400">156</p>
              <p className="text-xs text-slate-500">Days Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-700/30 flex items-center gap-3">
          <Bell className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Notifications</h3>
        </div>

        <div className="p-4 space-y-4">
          {[
            { key: 'highConfidence', label: 'High Confidence Alerts', desc: 'Get notified when predictions exceed 75% confidence' },
            { key: 'matchStart', label: 'Match Start Reminders', desc: 'Receive alerts 30 minutes before match kickoff' },
            { key: 'predictionResults', label: 'Prediction Results', desc: 'Get notified when your predictions are settled' },
            { key: 'modelUpdates', label: 'Model Updates', desc: 'Receive updates about AI model improvements' },
            { key: 'newsletter', label: 'Weekly Newsletter', desc: 'Get weekly insights and top predictions' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <button
                onClick={() => toggleNotification(item.key as keyof typeof notifications)}
                className={`w-12 h-6 rounded-full transition-all ${
                  notifications[item.key as keyof typeof notifications]
                    ? 'bg-cyan-500'
                    : 'bg-slate-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${
                  notifications[item.key as keyof typeof notifications]
                    ? 'translate-x-6'
                    : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-700/30 flex items-center gap-3">
          <Zap className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Preferences</h3>
        </div>

        <div className="p-4 space-y-4">
          {/* Dark Mode */}
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
            <div className="flex items-center gap-3">
              {preferences.darkMode ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
              <div>
                <p className="text-sm font-medium text-white">Dark Mode</p>
                <p className="text-xs text-slate-500">Use dark theme across the platform</p>
              </div>
            </div>
            <button
              onClick={() => togglePreference('darkMode')}
              className={`w-12 h-6 rounded-full transition-all ${
                preferences.darkMode ? 'bg-purple-500' : 'bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${
                preferences.darkMode ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* Auto Refresh */}
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-sm font-medium text-white">Auto Refresh</p>
                <p className="text-xs text-slate-500">Automatically update live match data</p>
              </div>
            </div>
            <button
              onClick={() => togglePreference('autoRefresh')}
              className={`w-12 h-6 rounded-full transition-all ${
                preferences.autoRefresh ? 'bg-cyan-500' : 'bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${
                preferences.autoRefresh ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-white">Language</p>
                <p className="text-xs text-slate-500">Select your preferred language</p>
              </div>
            </div>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          {/* Default Sport */}
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-sm font-medium text-white">Default Sport</p>
                <p className="text-xs text-slate-500">Sport to show on dashboard</p>
              </div>
            </div>
            <select
              value={preferences.defaultSport}
              onChange={(e) => setPreferences(prev => ({ ...prev, defaultSport: e.target.value }))}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
              <option value="tennis">Tennis</option>
              <option value="cricket">Cricket</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-700/30 flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">Subscription</h3>
        </div>

        <div className="p-4">
          <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-amber-400">Premium Plan</span>
              <span className="text-xs text-slate-400">Renews Jan 15, 2027</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">$29.99<span className="text-sm text-slate-400">/month</span></p>
            <div className="flex flex-wrap gap-2 mt-3">
              {['Unlimited Predictions', 'Real-time Updates', 'AI Insights', 'Priority Support'].map((feature) => (
                <span key={feature} className="flex items-center gap-1 text-xs text-slate-400">
                  <Check className="w-3 h-3 text-emerald-400" />
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 py-2.5 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-sm text-slate-300 transition-colors">
              Manage Subscription
            </button>
            <button className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-sm font-semibold text-white hover:from-amber-600 hover:to-orange-600 transition-all">
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-rose-500/20 overflow-hidden">
        <div className="p-4 border-b border-slate-700/30">
          <h3 className="text-lg font-bold text-rose-400">Danger Zone</h3>
        </div>

        <div className="p-4 space-y-3">
          <button className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors group">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-400" />
              <span className="text-sm text-slate-300 group-hover:text-rose-400">Sign Out</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
          <button className="w-full flex items-center justify-between p-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-colors">
            <span className="text-sm text-rose-400">Delete Account</span>
            <ChevronRight className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
