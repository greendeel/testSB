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
      ? { bg: 'bg-purple-50', border: 'border-purple-200', title: 'text-purple-700' }
      : { bg: 'bg-orange-50', border: 'border-orange-200', title: 'text-orange-700' };

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
              className="w-full max-w-md py-8 rounded-[2rem] text-3xl font-black border-b-[10px] shadow-xl transition-all uppercase bg-green-600 border-green-900 text-white active:translate-y-1 active:border-b-4"
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

      {/* ================= SCORE INVOER PER TAFEL ================= */}
      {isScoring && (
        <>
          <div className="bg-green-100 p-6 rounded-[2.5rem] border-4 border-green-400 text-center">
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
              Scores invoeren
            </h2>
            <p className="text-xl text-slate-600 font-bold italic mt-1">
              Vul per tafel de scores in. Totaal per tafel moet 0 zijn.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {round.tables.map((table, index) => {
              const style = getGameStyle(table.game);

              const tableTotal = table.participantIds.reduce((sum, pid) => {
                return sum + (Number(round.scores?.[pid]) || 0);
              }, 0);

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

                  <div className="grid gap-3">
                    {table.participantIds.map(pid => (
                      <div
                        key={pid}
                        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
                      >
                        <span className="text-2xl font-black text-slate-800">
                          {getName(pid)}
                        </span>

                        <input
                          type="text"
                          inputMode="numeric"
                          className="w-20 h-20 text-center text-3xl font-black text-slate-900 rounded-xl border-4 border-slate-200 focus:border-green-500 outline-none bg-slate-50"
                          value={round.scores?.[pid] ?? ''}
                          onChange={(e) => {
  const val = e.target.value.replace(',', '.');

  // Sta leeg veld en alleen "-" tijdelijk toe tijdens typen
  if (val === '' || val === '-') {
    onScoreChange(pid, 0);
    return;
  }

  // Sta geldige positieve en negatieve getallen toe
  if (/^-?\d+$/.test(val)) {
    onScoreChange(pid, Number(val));
  }
}}

                        />
                      </div>
                    ))}
                  </div>

                  <div className={`text-center font-black text-lg pt-2 ${tableTotal === 0 ? 'text-green-700' : 'text-red-600'}`}>
                    Totaal: {tableTotal}
                    {tableTotal !== 0 && ' (moet 0 zijn)'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-6 justify-center pt-10">
            <button
              onClick={() => setIsScoring(false)}
              className="py-5 px-10 rounded-[2rem] text-xl font-black bg-slate-400 text-white shadow-md"
            >
              Terug naar tafels
            </button>

            <button
              onClick={() => {
                const allValid = round.tables.every(table =>
                  table.participantIds.reduce((sum, pid) => sum + (Number(round.scores?.[pid]) || 0), 0) === 0
                );

                if (!allValid) {
                  alert('Niet alle tafels hebben totaal 0.');
                  return;
                }

                onFinishRound();
              }}
              className="py-5 px-10 rounded-[2rem] text-xl font-black bg-green-600 text-white border-b-[8px] border-green-900 shadow-lg active:translate-y-1 active:border-b-4"
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
