import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAppContext } from '@/src/context/AppContext';
import { LogOut, LayoutDashboard, FileText, Settings } from 'lucide-react';

export default function Layout() {
  const { role, setRole } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    setRole(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-slate-950/50 backdrop-blur-xl flex flex-col hidden md:flex">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white tracking-tight">
            QP <span className="text-blue-500">Analyzer</span>
          </h2>
          <div className="mt-2 text-xs font-medium px-2 py-1 bg-white/10 rounded-full inline-block text-slate-300 capitalize">
            {role} Portal
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-600/10 text-blue-400 font-medium transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors">
            <FileText className="w-5 h-5" />
            <span>Question Bank</span>
          </button>
          {role === 'lecturer' && (
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors">
              <Settings className="w-5 h-5" />
              <span>Paper Generator</span>
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Switch Role</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden border-b border-white/10 p-4 flex justify-between items-center bg-slate-950/50 backdrop-blur-xl">
          <h2 className="text-lg font-bold text-white">QP Analyzer</h2>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
