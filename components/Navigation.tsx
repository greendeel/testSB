import React from 'react';
import { EventStatus } from '../types';
import { Users, Play, Trophy, ChevronLeft } from 'lucide-react';

interface NavigationProps {
  currentStatus: EventStatus;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExit: () => void;
  title: string;
}

const Navigation: React.FC<NavigationProps> = ({ 
  currentStatus, 
  activeTab, 
  onTabChange, 
  onExit, 
  title
}) => {
  const tabs = [
    { id: 'REGISTRATION', label: 'Deelnemers', icon: Users },
    { id: 'ROUND1', label: 'Ronde 1', icon: Play },
    { id: 'ROUND2', label: 'Ronde 2', icon: Play },
    { id: 'RESULTS', label: 'Uitslag', icon: Trophy },
  ];

  const isLocked = (status: string) => {
    const order = ['REGISTRATION', 'ROUND1', 'ROUND2', 'RESULTS'];
    const currentOrder = order.indexOf(currentStatus);
    const tabOrder = order.indexOf(status);
    return tabOrder > currentOrder;
  };

  return (
    <nav className="sticky top-0 z-[999] bg-slate-900 text-white shadow-xl print:hidden">
      
      {/* Bovenbalk */}
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-slate-950">
        <button 
          onClick={onExit}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg border border-slate-600 font-black transition-all active:scale-95 text-yellow-400 group cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span className="text-base uppercase tracking-wider">Menu</span>
        </button>

        <h1 className="m-0 leading-none text-base font-black uppercase tracking-tight truncate px-3 text-white max-w-[60%] text-center">
          {title || "Kaartavond"}
        </h1>

        <div className="w-16" />
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-800 overflow-x-auto no-scrollbar px-2 py-0.5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const locked = isLocked(tab.id);
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              disabled={locked}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 min-w-[120px] py-1.5 flex flex-col items-center gap-1 border-b-4 rounded-xl border-black transition-all ${
                active 
                  ? 'border-yellow-400 bg-blue-600 text-white'
                  : locked 
                    ? 'border-slate-600 text-slate-600 opacity-50 cursor-not-allowed bg-slate-800'
                    : 'border-slate-500 text-slate-400 hover:bg-slate-700 bg-slate-800'
              }`}
            >
              <Icon size={22} />
              <span className="text-sm font-black uppercase tracking-tighter">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
