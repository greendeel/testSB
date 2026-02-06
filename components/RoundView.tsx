import React from 'react';
import { Round, Participant, GameType } from '../types';

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

  const getGameStyle = (game: GameType) =>
    game === 'Jokeren'
      ? {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          title: 'text-purple-700'
        }
      : {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          title: 'text-orange-700'
        };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-8 pb-64">

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
            {round.tables.map((table, index) => {
              const style = getGameStyle(table.game);

              return (
                <div
                  key={table.id}
                  className={`p-6 rounded-[2.5rem] border-4 ${style.border} ${style.bg} space-y-4 shadow-md`}
                >
                  <div className="flex justify-between items-center border-b-2 border-slate-200 pb-3">
                    <h3 className={`text-2xl font-black uppercase ${style.title}`}>
                      {table.game}
                    </h3>
                    <span className="text-lg font-bold text-slate-500 uppercase">
                      Tafel {index + 1}
                    </span>
                  </div>

                  <div className="grid gap-2">
                    {table.participantIds.map(pid => (
                      <div
                        key={pid}
                        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center"
                      >
                        <span className="text-2xl font-black text-slate-800 leading-none">
                          {getName(pid)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 justify-center pt-6">
            <button
              onClick={() => setIsScoring(true)}
              className="w-full max-w-md py-8 rounded-[2rem] text-3xl font-black border-b-[10px] shadow-xl transition-all uppercase flex items-center justify-center gap-4 bg-green-600 border-green-900 text-white active:translate-y-1 active:border-b-4"
            >
              SCORES INVULLEN
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

      {isScoring && (
        <>
          <div className="bg-green-100 p-6 rounded-[2.5rem] border-4 border-green-400 text-center">
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
              Scores invoeren
            </h2>
            <p className="text-xl text-slate-600 font-bold italic mt-1">
              Vul per speler de behaalde score in.
            </p>
          </div>

          <div className="grid gap-4">
            {participants.map(p => (
              <div
                key={p.id}
                className="bg-white p-5 rounded-[2rem] border-4 border-slate-100 shadow-md flex items-center justify-between"
              >
                <span className="text-3xl font-black text-slate-800">
                  {p.name}
                </span>

                <input
                  type="number"
                  inputMode="numeric"
                  className="w-28 h-20 text-center text-4xl font-black text-slate-900 rounded-2xl border-4 border-slate-200 focus:border-green-500 outline-none bg-slate-50"
                  value={round.scores?.[p.id] ?? ''}
                  onChange={(e) => onScoreChange(p.id, Number(e.target.value))}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-6 justify-center pt-8">
            <button
              onClick={() => setIsScoring(false)}
              className="py-5 px-8 rounded-[1.5rem] text-xl font-black bg-slate-400 text-white shadow-md"
            >
              Terug naar tafels
            </button>

            <button
              onClick={onFinishRound}
              className="py-5 px-8 rounded-[1.5rem] text-xl font-black bg-green-600 text-white border-b-[6px] border-green-900 shadow-lg active:translate-y-1 active:border-b-2"
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
