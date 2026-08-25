import React from 'react';
import { Activity, Cpu, CalendarCheck, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 py-8 mt-auto text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <span className="font-bold text-slate-200 text-sm">PulseCare Clinical Platform</span>
              <span className="text-xs text-slate-500 block">AI Triage • Double-Booking Prevention • OAuth Calendar Sync</span>
            </div>
          </div>

          {/* System Health Indicators */}
          <div className="flex items-center space-x-6 text-xs text-slate-400">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>API Gateway: <strong className="text-emerald-400 font-semibold">Operational</strong></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-teal-400" />
              <span>Gemini AI: <strong className="text-teal-400 font-semibold">v3.6-Flash</strong></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Google Calendar: <strong className="text-cyan-400 font-semibold">OAuth 2.0</strong></span>
            </div>
          </div>

          <div className="text-xs text-slate-500 text-center md:text-right">
            <p>© {new Date().getFullYear()} PulseCare Inc. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
