import React, { useState } from 'react';
import { Round, Participant } from '../types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface RoundViewProps {
  round: Round;
  participants: Participant[];
  onScoreChange: (participantId: string, score: number) => void;
  onFinishRound: () => void;
  onResetTables: () => void;
  onUpdateParticipantTable: () => void;
  isScoring: boolean;
  setIsScoring: (v: boolean) => void;
  isEventFinished: boolean;
}

export default function RoundView({
  round,
  participants,
  onScoreChange,
  onFinishRound,
  isEventFinished
}: RoundViewProps) {
  const [localScores, setLocalScores] = useState<Record<string, string>>({});

  const handleScoreInput = (participantId: string, value: string) => {
    if (isEventFinished) return;
    setLocalScores(prev => ({ ...prev, [participantId]: value }));
    const parsed = parseInt(value);
    onScoreChange(participantId, isNaN(parsed) ? 0 : parsed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isEventFinished) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      const inputs = Array.from(document.querySelectorAll('input[type="number"]')) as HTMLInputElement[];
      const currentIndex = inputs.indexOf(e.currentTarget);
      if (currentIndex > -1 && currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus();
        inputs[currentIndex + 1].select();
      }
    }
  };

  const getParticipantsForTable = (ids: string[]) =>
    ids.map(id => participants.find(p => p.id === id)).filter(Boolean) as Participant[];

  const getTableSum = (ids: string[]) =>
    ids.reduce((total, pid) => {
      const raw = localScores[pid] ?? round.scores[pid] ?? 0;
      const parsed = parseInt(raw as any);
      return total + (isNaN(parsed) ? 0 : parsed);
    }, 0);

  const allScoresFilled = round.tables.every(t =>
    t.participantIds.every(pid => localScores[pid] !== undefined && localScores[pid] !== '')
  );

  const allTablesZero = round.tables.every(t => getTableSum(t.participantIds) === 0);
  const allValid = allScoresFilled && allTablesZero;

  const buttonText = round.number === 1 ? 'VERDER NAAR RONDE 2' : 'NAAR EINDUITSLAG';

  const jokerenTables = round.tables.filter(t => t.game === 'Jokeren');
  const rikkenTables = round.tables.filter(t => t.game === 'Rikken');
  const sideBySide = jokerenTables.length === 1 && rikkenTables.length === 1;

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-8 pb-56">

      <div className="bg-blue-100 p-6 rounded-[2.5rem] border-4 border-blue-300 text-center">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
          Scores invoeren — Ronde {round.number}
        </h2>
        <p className="text-xl text-slate-600 font-bold italic mt-1">
          Vul per speler de behaalde score in.
        </p>
      </div>

      <div className={`grid gap-6 ${sideBySide ? 'lg:grid-cols-2' : ''}`}>
        {round.tables.map(table => {
          const tablePlayers = getParticipantsForTable(table.participantIds);
          const isJokeren = table.game === 'Jokeren';
          const sum = getTableSum(table.participantIds);

          return (
            <div
              key={table.id}
              className={`p-6 rounded-[2.5rem] border-4 shadow-md space-y-4 ${
                isJokeren ? 'bg-purple-50 border-purple-200' : 'bg-orange-50 border-orange-200'
              }`}
            >
              <div className="flex justify-between items-center border-b-2 border-slate-200 pb-3">
                <h3 className={`text-2xl font-black uppercase ${isJokeren ? 'text-purple-700' : 'text-orange-700'}`}>
                  {table.game} – Tafel
                </h3>
                <span className="text-lg font-bold text-slate-500 uppercase">
                  {tablePlayers.length} Spelers
                </span>
              </div>

              <div className="grid gap-2">
                {tablePlayers.map(player => (
                  <div
                    key={player.id}
                    className="bg-white p-3 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm gap-3"
                  >
                    <span className="text-2xl font-black text-slate-800 leading-none">
                      {player.name}
                    </span>

                    <input
                      type="number"
                      inputMode="numeric"
                      disabled={isEventFinished}
                      value={localScores[player.id] ?? round.scores[player.id] ?? ''}
                      onChange={e => handleScoreInput(player.id, e.target.value)}
                      onKeyDown={handleKeyDown}
                      className={`w-24 h-16 text-center text-3xl font-black rounded-xl border-4 outline-none ${
                        isEventFinished
                          ? 'bg-slate-200 border-slate-200 text-slate-500'
                          : 'text-slate-900 border-slate-100 focus:border-blue-500 bg-slate-50'
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className={`p-3 rounded-xl border-2 flex items-center gap-3 ${
                sum === 0 ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'
              }`}>
                <AlertCircle size={24} />
                <span className="text-lg font-black">
                  Totaal tafel = {sum}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-100 to-transparent z-50 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button
            onClick={onFinishRound}
            disabled={!allValid || isEventFinished}
            className={`w-full py-6 rounded-[2rem] text-3xl font-black border-b-[10px] shadow-xl uppercase flex items-center justify-center gap-3 transition-all ${
              allValid && !isEventFinished
                ? 'bg-green-600 border-green-900 text-white active:translate-y-2 active:border-b-4'
                : 'bg-slate-300 border-slate-400 text-slate-500 opacity-50'
            }`}
          >
            {allValid && !isEventFinished && <CheckCircle2 size={32} />}
            {buttonText}
          </button>
        </div>
      </div>

    </div>
  );
}
