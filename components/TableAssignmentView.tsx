import React, { useState, useEffect } from 'react';
import { Participant, Table, GameType } from '../types';
import { CheckCircle2, ArrowLeftRight } from 'lucide-react';

interface TableAssignmentViewProps {
  participants: Participant[];
  initialTables?: Table[];
  onConfirm: (tables: Table[]) => void;
  onUpdateParticipantGame: (id: string, newGame: GameType) => void;
  roundNumber: number;
}

const TableAssignmentView: React.FC<TableAssignmentViewProps> = ({ 
  participants, 
  initialTables,
  onConfirm, 
  onUpdateParticipantGame,
  roundNumber 
}) => {
  const [assignments, setAssignments] = useState<Record<string, number>>({});

  useEffect(() => {
    if (initialTables && initialTables.length > 0) {
      const initial: Record<string, number> = {};
      const jokerenTables = initialTables.filter(t => t.game === 'Jokeren');
      const rikkenTables = initialTables.filter(t => t.game === 'Rikken');
      
      jokerenTables.forEach((t, idx) => {
        t.participantIds.forEach(pid => initial[pid] = idx + 1);
      });
      rikkenTables.forEach((t, idx) => {
        t.participantIds.forEach(pid => initial[pid] = idx + 1);
      });
      setAssignments(initial);
    }
  }, [initialTables]);
  
  const handleTableChange = (pid: string, val: string) => {
    const num = parseInt(val);
    setAssignments(prev => ({ ...prev, [pid]: isNaN(num) ? 0 : num }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const inputs = Array.from(document.querySelectorAll('input[type="number"]')) as HTMLInputElement[];
      const currentIndex = inputs.indexOf(e.currentTarget);
      if (currentIndex > -1 && currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus();
        inputs[currentIndex + 1].select();
      } else if (validate()) {
        handleConfirmAction();
      }
    }
  };

  const getTableStats = (game: GameType) => {
    const gameParticipants = participants.filter(p => p.game === game);
    const tableCounts: Record<number, number> = {};
    gameParticipants.forEach(p => {
      const table = assignments[p.id];
      if (table && table > 0) tableCounts[table] = (tableCounts[table] || 0) + 1;
    });
    return tableCounts;
  };

  const validate = () => {
    if (participants.length === 0) return false;
    return participants.every(p => assignments[p.id] && assignments[p.id] > 0);
  };

  const handleConfirmAction = () => {
    if (!validate()) return;

    const statsJ = getTableStats('Jokeren');
    const statsR = getTableStats('Rikken');
    const invalid = [
      ...Object.entries(statsJ).filter(([_, count]) => count !== 4).map(([num]) => `Jokeren Tafel ${num}`),
      ...Object.entries(statsR).filter(([_, count]) => count !== 4).map(([num]) => `Rikken Tafel ${num}`)
    ];

    if (invalid.length > 0) {
      if (!window.confirm("Let op: Sommige tafels hebben geen 4 spelers. Wilt u toch doorgaan?")) return;
    }

    const tables: Table[] = [];
    ['Jokeren', 'Rikken'].forEach((game: any) => {
      const gameParticipants = participants.filter(p => p.game === game);
      const uniqueTableNums = Array.from(new Set(gameParticipants.map(p => assignments[p.id])))
        .filter((n: any) => n > 0)
        .sort((a: any, b: any) => a - b);
        
      uniqueTableNums.forEach(num => {
        tables.push({ 
          id: crypto.randomUUID(), 
          game, 
          participantIds: gameParticipants.filter(p => assignments[p.id] === num).map(p => p.id) 
        });
      });
    });
    onConfirm(tables);
  };

  const renderGameList = (game: GameType, color: string, bg: string) => {
    const players = participants.filter(p => p.game === game);
    const stats = getTableStats(game);
    if (players.length === 0) return null;

    return (
      <div className={`p-6 rounded-[2.5rem] border-4 ${bg} space-y-4 shadow-md`}>
        <div className="flex justify-between items-center border-b-2 border-slate-200 pb-3">
          <h3 className={`text-2xl font-black uppercase ${color}`}>{game}</h3>
          <span className="text-lg font-bold text-slate-500 uppercase">{players.length} Spelers</span>
        </div>

        <div className="grid gap-2">
          {players.map(p => (
            <div key={p.id} className="bg-white p-2 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button 
                  onClick={() => onUpdateParticipantGame(p.id, game === 'Jokeren' ? 'Rikken' : 'Jokeren')}
                  className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all shrink-0"
                >
                  <ArrowLeftRight size={18} />
                </button>
                <span className="text-2xl font-black text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis leading-none">{p.name}</span>
              </div>
              <input 
                type="number"
                inputMode="numeric"
                value={assignments[p.id] || ''}
                onChange={(e) => handleTableChange(p.id, e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="?"
                className="w-16 h-16 text-center text-3xl font-black text-slate-900 rounded-xl border-4 border-slate-100 focus:border-blue-500 outline-none bg-slate-50"
              />
            </div>
          ))}
        </div>

        <div className="pt-4 border-t-2 border-slate-200 flex flex-wrap gap-2">
           {Object.keys(stats).map(Number).sort((a,b)=>a-b).map(num => (
             <div key={num} className={`p-2 px-3 rounded-xl border-2 flex items-center gap-2 ${stats[num] === 4 ? 'bg-green-50 border-green-500 text-green-700' : 'bg-yellow-50 border-yellow-500 text-yellow-700'}`}>
               <span className="font-black text-sm">T{num}:</span>
               <span className="text-xl font-black">{stats[num]}</span>
             </div>
           ))}
        </div>
      </div>
    );
  };

  const isValid = validate();

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-8 pb-64">
      <div className="bg-yellow-100 p-6 rounded-[2.5rem] border-4 border-yellow-400 text-center">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Tafelindeling {initialTables ? 'Aanpassen' : 'Invullen'}</h2>
        <p className="text-xl text-slate-600 font-bold italic mt-1">Vul per persoon het getrokken tafelnummer in.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {renderGameList('Jokeren', 'text-purple-700', 'bg-purple-50')}
        {renderGameList('Rikken', 'text-orange-700', 'bg-orange-50')}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-100 to-transparent z-50 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button
            onClick={handleConfirmAction}
            disabled={!isValid}
            className="w-full py-8 rounded-[2rem] text-3xl font-black border-b-[10px] shadow-xl transition-all uppercase flex items-center justify-center gap-4 bg-green-600 border-green-900 text-white active:translate-y-1 active:border-b-4 disabled:bg-slate-300 disabled:border-slate-400 disabled:text-slate-500 disabled:opacity-50"
          >
            {isValid && <CheckCircle2 size={36} />}
            BEVESTIG INDELING
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableAssignmentView;
