<h1 style={{color: 'red'}}>ROUNDVIEW ACTIEF</h1>
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
    <div className="p-4 max-w-7xl mx-auto space-y-8 pb-64">

      {/* ================= TAFEL OVERZICHT ================= */}
      {!isScoring && (
        <>
          <div className="bg-yellow-100 p-6 rounded-[2.5rem] border-4 border-yellow-400 text-center">
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
              Tafelindeling
            </h2>
            <p className="text-xl text-slate-600 font-bold italic mt-1">
              Controleer of iedereen aan de juiste tafel zit.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {round.tables.map((table, index) => (
              <div
                key={table.id}
                className="p-6 rounded-[2.5rem] border-4 bg-white space-y-4 shadow-md"
              >
                <div className="flex justify-between items-center border-b-2 border-slate-200 pb-3">
                  <h3 className="text-2xl font-black uppercase text-slate-800">
                    Tafel {index + 1}
                  </h3>
                  <span className="text-lg font-bold text-slate-500 uppercase">
                    {table.game}
                  </span>
                </div>

                <div className="grid gap-2">
                  {table.participantIds.map(pid => (
                    <div
                      key={pid}
                      className="bg-slate-100 p-3 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm"
                    >
                      <span className="text-2xl font-black text-slate-800 leading-none">
                        {getName(pid)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 justify-center pt-6">
            <button
              onClick={() => setIsScoring(true)}
              className="py-8 px-12 rounded-[2rem] text-3xl font-black border-b-[10px] shadow-xl transition-all uppercase bg-green-600 border-green-900 text-white active:translate-y-1 active:border-b-4"
            >
              Scores invullen
            </button>

            <button
              onClick={onResetTables}
              className="text-xl text-slate-600 underline"
            >
              Tafels opnieuw indelen
            </button>
          </div>
        </>
      )}

      {/* ================= SCORE INVOER ================= */}
      {isScoring && (
        <>
          <div className="bg-green-100 p-6 rounded-[2.5rem] border-4 border-green-400 text-center">
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
              Scores invoeren
            </h2>
          </div>

          <div className="grid gap-3">
            {participants.map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow p-4 flex justify-between items-center">
                <span className="text-2xl font-black">{p.name}</span>
                <input
                  type="number"
                  className="w-24 h-14 text-center text-2xl font-black border-4 border-slate-200 rounded-xl"
                  value={round.scores?.[p.id] ?? ''}
                  onChange={(e) => onScoreChange(p.id, Number(e.target.value))}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-4 justify-center pt-6">
            <button
              onClick={() => setIsScoring(false)}
              className="py-4 px-6 rounded-xl text-lg font-bold bg-slate-400 text-white"
            >
              Terug
            </button>

            <button
              onClick={onFinishRound}
              className="py-4 px-6 rounded-xl text-lg font-bold bg-green-600 text-white"
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
