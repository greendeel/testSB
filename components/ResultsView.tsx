import React from 'react';
import { Participant, GameType, Round } from '../types';
import { Gift, Printer, ChevronRight, Award } from 'lucide-react';

interface ResultsViewProps {
  participants: Participant[];
  rounds: Round[];
  title: string;
  onClose: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ participants, rounds, title, onClose }) => {
  const games: GameType[] = ['Jokeren', 'Rikken'];

  const getScore = (roundIndex: number, pid: string) => {
    return rounds[roundIndex]?.scores?.[pid] ?? 0;
  };

  const getSortedParticipants = (game: GameType) => {
    const list = participants
      .filter(p => p.game === game)
      .map(p => {
        const scoreR1 = getScore(0, p.id);
        const scoreR2 = getScore(1, p.id);
        return { ...p, total: scoreR1 + scoreR2 };
      })
      .sort((a, b) => b.total - a.total);

    if (list.length === 0) return [];

    const minScore = Math.min(...list.map(p => p.total));

    return list.map(p => ({
      ...p,
      hasPositivePrize: p.total > 0,
      isPoedelPrize: p.total === minScore
    }));
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-12 pb-48">
      <div className="text-center space-y-4 print:hidden">
        <h2 className="text-5xl font-black text-slate-900 uppercase">Einduitslag</h2>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-3 bg-white border-2 border-slate-300 px-8 py-4 rounded-[1.5rem] font-black text-2xl text-slate-700 shadow-lg hover:bg-slate-50 active:translate-y-1"
          >
            <Printer size={32} className="text-blue-600" />
            AFDRUKKEN
          </button>
        </div>
      </div>

      <div className="hidden print:block">
        <h1 className="text-4xl font-black border-b-8 border-black pb-4 mb-8 uppercase text-center">
          {title || 'Uitslag Kaartavond'}
        </h1>

        {games.map(game => {
          const sorted = getSortedParticipants(game);
          if (sorted.length === 0) return null;

          return (
            <div key={`print-${game}`} className="mb-12 break-after-page">
              <h2 className="text-3xl font-black border-b-4 border-black mb-6 uppercase">{game}</h2>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-4 border-slate-300">
                    <th className="py-2 text-xl uppercase">Nr</th>
                    <th className="py-2 text-xl uppercase">Naam</th>
                    <th className="py-2 text-xl uppercase text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((p, idx) => (
                    <tr key={p.id} className="border-b-2 border-slate-100">
                      <td className="py-2 text-xl font-bold">{idx + 1}</td>
                      <td className="py-2 text-2xl font-black">
                        {p.name}
                        {p.hasPositivePrize && " (PRIJS)"}
                        {p.isPoedelPrize && " (POEDELPRIJS)"}
                      </td>
                      <td className="py-2 text-3xl font-black text-right">{p.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <div className="print:hidden space-y-16">
        {games.map(game => {
          const sorted = getSortedParticipants(game);
          if (sorted.length === 0) return null;

          return (
            <div key={game} className="space-y-8">
              <div className={`text-white px-8 py-4 rounded-full inline-block text-2xl font-black uppercase shadow-xl ${game === 'Jokeren' ? 'bg-purple-700' : 'bg-orange-600'}`}>
                {game} Winnaars
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-200 shadow-lg space-y-3">
                <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3 mb-4">
                  <h4 className="text-xl font-black text-slate-800 uppercase">Volledige Lijst</h4>
                  <div className="flex gap-2 text-sm font-black">
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-xl">
                      <Gift size={18} /> Prijs
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-xl">
                      <Award size={18} /> Poedelprijs
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {sorted.map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <span className="bg-slate-800 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-black shrink-0">{idx + 1}</span>
                        <span className="text-2xl font-black text-slate-700 flex items-center gap-3 break-words leading-tight">
                          {p.name}
                          {p.hasPositivePrize && <Gift size={28} className="text-green-600 shrink-0" />}
                          {p.isPoedelPrize && <Award size={28} className="text-red-600 shrink-0" />}
                        </span>
                      </div>
                      <span className="text-3xl font-black text-slate-900 ml-4 shrink-0">{p.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-12 print:hidden">
        <button
          onClick={onClose}
          className="w-full bg-slate-900 text-white py-8 rounded-[2.5rem] text-3xl font-black hover:bg-black shadow-xl transition-all active:translate-y-2 border-b-[12px] border-slate-950 flex items-center justify-center gap-4"
        >
          KLAAR & AFSLUITEN <ChevronRight size={48} />
        </button>
      </div>
    </div>
  );
};

export default ResultsView;
