import React from 'react';
import { Round, Participant } from '../types';

interface Props {
  round: Round;
  participants: Participant[];
  onScoreChange: (participantId: string, score: number) => void;
  onFinishRound: () => void;
  onResetTables: () => void;
  onUpdateParticipantTable: (participantId: string, tableId: string) => void;
  isScoring: boolean;
  setIsScoring: (value: boolean) => void;
  isEventFinished: boolean;
}

const RoundView: React.FC<Props> = ({
  round,
  participants,
  onScoreChange,
  onFinishRound,
  onResetTables,
  isScoring,
  setIsScoring,
}) => {

  const getName = (id: string) =>
    participants.find(p => p.id === id)?.name || 'Onbekend';

  return (
    <div className="p-4">

      {/* ================= ORIGINELE TAFEL OVERZICHT ================= */}
      {!isScoring && (
        <>
          <h2 className="text-xl font-bold mb-4">Tafelindeling</h2>

          <div className="space-y-4">
            {round.tables.map((table, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-2">Tafel {index + 1}</h3>
                <ul className="space-y-1">
                  {table.playerIds.map((pid: string) => (
                    <li key={pid}>{getName(pid)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => setIsScoring(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Scores invullen
            </button>

            <button
              onClick={onResetTables}
              className="text-sm text-slate-600 underline"
            >
              Tafels opnieuw indelen
            </button>
          </div>
        </>
      )}

      {/* ================= ORIGINELE SCORE INVOER UI ================= */}
      {isScoring && (
        <>
          <h2 className="text-xl font-bold mb-4">Scores invoeren</h2>

          <div className="space-y-3">
            {participants.map(p => (
              <div key={p.id} className="flex justify-between items-center bg-white rounded-lg shadow p-3">
                <span>{p.name}</span>
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-24 text-right"
                  value={round.scores?.[p.id] ?? ''}
                  onChange={(e) => onScoreChange(p.id, Number(e.target.value))}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => setIsScoring(false)}
              className="bg-slate-400 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg"
            >
              Terug
            </button>

            <button
              onClick={onFinishRound}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Ronde afronden
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RoundView;
