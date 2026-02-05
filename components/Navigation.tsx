import React from 'react';
import { EventStatus } from '../types';

interface Props {
  currentStatus: EventStatus;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExit: () => void;
  title: string;
  onRename: (newTitle: string) => void;
}

const Navigation: React.FC<Props> = ({
  currentStatus,
  activeTab,
  onTabChange,
  onExit,
  title,
  onRename
}) => {

  const handleRename = () => {
    const newTitle = prompt('Nieuwe naam voor deze kaartmiddag:', title);
    if (newTitle && newTitle.trim() !== '' && newTitle !== title) {
      onRename(newTitle.trim());
    }
  };

  const tabStyle = (tab: string) =>
    `px-4 py-2 rounded-lg font-medium transition ${
      activeTab === tab
        ? 'bg-blue-600 text-white shadow'
        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
    }`;

  return (
    <div className="bg-white shadow-md p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1
          className="text-2xl font-bold text-slate-800 cursor-pointer hover:underline"
          onClick={handleRename}
          title="Klik om naam te wijzigen"
        >
          {title}
        </h1>

        <button
          onClick={onExit}
          className="px-3 py-2 bg-slate-300 hover:bg-slate-400 rounded-lg text-slate-800 font-medium"
        >
          Terug naar overzicht
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button onClick={() => onTabChange('REGISTRATION')} className={tabStyle('REGISTRATION')}>
          Registratie
        </button>

        {currentStatus !== EventStatus.REGISTRATION && (
          <>
            <button onClick={() => onTabChange('ROUND1')} className={tabStyle('ROUND1')}>
              Ronde 1
            </button>
            <button onClick={() => onTabChange('ROUND2')} className={tabStyle('ROUND2')}>
              Ronde 2
            </button>
            <button onClick={() => onTabChange('RESULTS')} className={tabStyle('RESULTS')}>
              Uitslag
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Navigation;
