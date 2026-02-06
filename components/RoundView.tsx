import React, { useState } from 'react';
import { Round, Participant } from '../types';

interface RoundViewProps {
  round: Round;
  participants: Participant[];
  onScoreChange: (participantId: string, score: number) => void;
}

export default function RoundView({ round, participants, onScoreChange }: RoundViewProps) {
  const [localScores, setLocalScores] = useState<Record<string, string>>({});

  const handleScoreInput = (participantId: string, value: string) => {
    setLocalScores(prev => ({ ...prev, [participantId]: value }));
    const parsed = parseInt(value);
    onScoreChange(participantId, isNaN(parsed) ? 0 : parsed);
  };

  const getParticipantsForTable = (ids: string[]) =>
    ids.map(id => participants.find(p => p.id === id)).filter(Boolean) as Participant[];

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-8 pb-40">

      <div className="bg-blue-100 p-6 rounded-[2.5rem] border-4 border-blue-300 text-center">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
          Scores invoeren — Ronde {round.number}
        </h2>
        <p className="text-xl text-slate-600 font-bold italic mt-1">
          Vul per speler de behaalde score in.
        </p>
      </div>

      <div className="grid gap-6">
        {round.tables.map(table => {
          const tablePlayers = getParticipantsForTable(table.participantIds);
          const isJokeren = table.game === 'Jokeren';

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
                      value={localScores[player.id] ?? round.scores[player.id] ?? ''}
                      onChange={e => handleScoreInput(player.id, e.target.value)}
                      className="w-24 h-16 text-center text-3xl font-black text-slate-900 rounded-xl border-4 border-slate-100 focus:border-blue-500 outline-none bg-slate-50"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
