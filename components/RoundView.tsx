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

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-24">
      <h2 className="text-2xl font-bold mb-6">Ronde {round.number}</h2>

      {round.tables.map(table => (
        <div key={table.id} className="mb-8 border-4 rounded-2xl overflow-hidden">
          <div
            className={`text-white text-xl font-bold px-4 py-3 ${
              table.game === 'Jokeren' ? 'bg-purple-600' : 'bg-orange-500'
            }`}
          >
            Tafel {table.id} — {table.game}
          </div>

          <div className="bg-gray-100 p-3 space-y-2">
            {table.participantIds.map(pid => {
              const participant = participants.find(p => p.id === pid);
              if (!participant) return null;

              return (
                <div
                  key={pid}
                  className="flex items-center justify-between bg-white rounded-xl border-2 px-4 py-2"
                >
                  <span className="text-lg font-semibold">{participant.name}</span>

                  <input
                    type="number"
                    inputMode="numeric"
                    value={localScores[pid] ?? round.scores[pid] ?? ''}
                    onChange={e => handleScoreInput(pid, e.target.value)}
                    className="w-24 text-center text-lg border-2 rounded-lg py-1"
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
