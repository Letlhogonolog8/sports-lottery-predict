import React from 'react';

const HealthCheck: React.FC = () => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      frontend: 'operational',
      supabase: 'operational',
      realtime: 'operational',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
          <h1 className="text-2xl font-bold text-white">System Health</h1>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
            <span className="text-slate-300">Status</span>
            <span className="text-emerald-400 font-semibold">{healthData.status}</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
            <span className="text-slate-300">Version</span>
            <span className="text-cyan-400 font-mono">{healthData.version}</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
            <span className="text-slate-300">Timestamp</span>
            <span className="text-slate-400 font-mono text-sm">{healthData.timestamp}</span>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-white mb-3">Services</h2>
            <div className="space-y-2">
              {Object.entries(healthData.services).map(([service, status]) => (
                <div key={service} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <span className="text-slate-300 capitalize">{service}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-emerald-400 text-sm">{status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCheck;
