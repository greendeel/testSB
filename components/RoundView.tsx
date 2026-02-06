import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Participant, GameType, Round, Table } from '../types';
import { AlertCircle, CheckCircle2, Calculator, ArrowLeftRight, RefreshCw } from 'lucide-react';

interface RoundViewProps {
  round: Round;
  participants: Participant[];
  onScoreChange: (pid: string, score: number) => void;
  onFinishRound: () => void;
  onResetTables: () => void;
  onUpdateParticipantTable: (pid: string, newTableNum: number) => void;
  isScoring: boolean;
  setIsScoring: (val: boolean) => void;
  isEventFinished: boolean;
}

const RoundView: React.FC<RoundViewProps> = ({ 
  round, 
  participants, 
  onScoreChange, 
  onFinishRound,
  onResetTables,
  onUpdateParticipantTable,
  isScoring,
  setIsScoring,
  isEventFinished
}) => {
  const [localScores, setLocalScores] = useState<Record<string, string>>({});
  const tablesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isScoring && tablesContainerRef.current) {
      setTimeout(() => {
        const navHeight = 120;
        const elementPosition = tablesContainerRef.current!.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navHeight;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }, 50);
    }
  }, [isScoring]);

  const jokerenTables = useMemo(() => round.tables.filter(t => t.game === 'Jokeren'), [round.tables]);
  const rikkenTables = useMemo(() => round.tables.filter(t => t.game === 'Rikken'), [round.tables]);
  const isSideBySide = jokerenTables.length === 1 && rikkenTables.length === 1;

  const getTableSum = (table: Table) =>
    table.participantIds.reduce((sum, pid) => sum + (round.scores[pid] || 0), 0);

  const isTableFinished = (table: Table) =>
    table.participantIds.every(pid => localScores[pid] !== undefined && localScores[pid] !== "");

  const isTableInError = (table: Table) =>
    isTableFinished(table) && getTableSum(table) !== 0;

  const isRoundValid = useMemo(() => {
    const allFilled = participants.every(p => localScores[p.id] !== undefined && localScores[p.id] !== "");
    if (!allFilled) return false;
    return round.tables.every(table => getTableSum(table) === 0);
  }, [participants, localScores, round.tables, round.scores]);

  const handleInputChange = (pid: string, value: string) => {
    if (isEventFinished) return;
    setLocalScores(prev => ({ ...prev, [pid]: value }));
    const parsed = parseInt(value);
    onScoreChange(pid, isNaN(parsed) ? 0 : parsed);
  };

  const handleMovePlayer = (pid: string, playerName: string) => {
    const newTable = prompt(`Naar welke tafel moet ${playerName}?`);
    if (newTable) {
      const num = parseInt(newTable);
      if (!isNaN(num) && num > 0) onUpdateParticipantTable(pid, num);
    }
  };

  const renderGameSection = (game: GameType) => {
    const gameTables = game === 'Jokeren' ? jokerenTables : rikkenTables;
    if (gameTables.length === 0) return null;

    return (
      <div key={game} className="space-y-6">
        <h3 className={`text-2xl font-black px-8 py-3 rounded-2xl text-white inline-block shadow-md ${game === 'Jokeren' ? 'bg-purple-700' : 'bg-orange-600'}`}>
          {game}
        </h3>

        <div className={`grid grid-cols-1 ${isSideBySide ? '' : 'xl:grid-cols-2'} gap-8`}>
          {gameTables.map((table, idx) => {
            const sum = getTableSum(table);
            const tableFinished = isTableFinished(table);
            const tableInError = isTableInError(table);
            const tableIsPerfect = tableFinished && sum === 0;

            return (
              <div key={table.id} className={`bg-white border-4 rounded-[2.5rem] overflow-hidden shadow-xl transition-all ${isScoring && tableInError ? 'border-red-400 scale-[1.01]' : tableIsPerfect ? 'border-green-400' : 'border-slate-200'}`}>
                <div className="bg-slate-50 px-8 py-5 border-b-2 border-slate-200 flex justify-between items-center">
                  <h4 className="font-black text-3xl uppercase text-slate-700">Tafel {idx + 1}</h4>
                  {isScoring && tableFinished && (
                    <div className={`px-4 py-1.5 rounded-xl text-xl font-black uppercase flex items-center gap-2 ${tableIsPerfect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {tableIsPerfect ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                      <span>Saldo: {sum}</span>
                    </div>
                  )}
                </div>

                <div className="divide-y-2 divide-slate-100">
                  {table.participantIds.map(pid => {
                    const player = participants.find(p => p.id === pid);
                    const score = round.scores[pid];
                    const localValue = localScores[pid] !== undefined ? localScores[pid] : (score?.toString() || '');
                    if (!player) return null;

                    return (
                      <div key={pid} className={`flex items-center justify-between ${isScoring ? 'py-3' : 'py-6'} px-8 bg-white hover:bg-slate-50 transition-all gap-6`}>
                        <div className="flex-1 flex items-center gap-4 min-w-0">
                          {!isEventFinished && (
                            <button 
                              onClick={() => handleMovePlayer(pid, player.name)}
                              className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors shrink-0"
                            >
                              <ArrowLeftRight size={24} />
                            </button>
                          )}
                          <p className="font-black text-2xl text-slate-800 truncate">{player.name}</p>
                        </div>

                        {isScoring ? (
                          <input
                            type="number"
                            inputMode="numeric"
                            value={localValue}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleInputChange(pid, e.target.value)}
                            className="w-28 h-20 text-4xl font-black text-center border-4 rounded-2xl outline-none shadow-inner border-slate-100 focus:border-blue-400 bg-slate-50"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border-2 border-blue-100 shadow-inner">
                            <span className="text-2xl font-black">{score || 0}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const anyTableInError = round.tables.some(t => isTableInError(t));

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-10 pb-48">
      <div className="bg-white p-6 rounded-[2.5rem] border-4 border-blue-100 shadow-xl text-center space-y-3">
        <h2 className="text-4xl font-black text-blue-900 uppercase">Ronde {round.number}</h2>
        <div className="bg-blue-600 text-white py-2 px-8 rounded-full inline-block text-xl font-black uppercase tracking-widest shadow-md">
          {isScoring ? 'Scores Opschrijven' : 'Zoek uw tafel'}
        </div>

        <div className="pt-4 flex justify-center">
          <button 
            onClick={() => { if(confirm('Tafelindeling aanpassen?')) onResetTables(); }}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-2xl border-2 border-slate-200 font-black text-sm uppercase tracking-wider shadow-sm active:scale-95"
          >
            <RefreshCw size={18} />
            Tafel indeling aanpassen
          </button>
        </div>
      </div>

      <div ref={tablesContainerRef} className={isSideBySide ? "grid grid-cols-1 lg:grid-cols-2 gap-10" : "space-y-12"}>
        {renderGameSection('Jokeren')}
        {renderGameSection('Rikken')}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-100 to-transparent z-50 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          {!isScoring ? (
            <button
              onClick={() => setIsScoring(true)}
              className="w-full bg-blue-700 text-white py-4 rounded-[2rem] text-3xl font-black shadow-xl border-b-[8px] border-blue-950 active:translate-y-2 active:border-b-4 uppercase"
            >
              SCORES INVULLEN
            </button>
          ) : (
            <div className="space-y-4">
              {anyTableInError && (
                <div className="bg-white border-4 border-red-500 p-4 rounded-2xl shadow-xl flex items-center gap-4">
                  <Calculator className="text-red-500 shrink-0" size={40} />
                  <div className="text-left">
                    <p className="text-xl font-black text-red-700 uppercase">Saldo Fout!</p>
                    <p className="text-lg font-bold text-slate-600">Optelsom moet 0 zijn.</p>
                  </div>
                </div>
              )}
              <button
                onClick={onFinishRound}
                disabled={!isRoundValid}
                className={`w-full py-4 rounded-[2rem] text-3xl font-black shadow-xl border-b-[8px] uppercase ${isRoundValid ? 'bg-green-600 border-green-900 text-white active:translate-y-2 active:border-b-4' : 'bg-slate-300 border-slate-400 text-slate-500 opacity-50'}`}
              >
                VOLGENDE STAP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoundView;
