import React from 'react';
import { Participant } from '../types';

interface TableAssignmentViewProps {
  tables: {
    id: string;
    game: 'Jokeren' | 'Rikken';
    participants: Participant[];
  }[];
  tableAssignments: Record<string, number>;
  onAssignTable: (participantId: string, table: number) => void;
}

const TableAssignmentView: React.FC<TableAssignmentViewProps> = ({
  tables,
  tableAssignments,
  onAssignTable,
}) => {
  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <div className="bg-blue-100 p-5 rounded-[2.5rem] border-4 border-blue-300 text-center">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
          Tafels indelen
        </h2>
        <p className="text-xl text-slate-600 font-bold italic mt-1">
          Vul per speler het tafelnummer in.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`p-5 rounded-[2.5rem] border-4 shadow-md space-y-3 ${
              table.game === 'Jokeren'
                ? 'bg-purple-50 border-purple-200'
                : 'bg-orange-50 border-orange-200'
            }`}
          >
            {/* Tafel kop */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3
                className={`text-2xl font-black uppercase ${
                  table.game === 'Jokeren'
                    ? 'text-purple-700'
                    : 'text-orange-700'
                }`}
              >
                {table.game} – Tafel
              </h3>
              <span className="text-lg font-bold text-slate-500 uppercase">
                {table.participants.length} Spelers
              </span>
            </div>

            {/* Spelers */}
            <div className="grid gap-2">
              {table.participants.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-2 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm gap-2"
                >
                  <span className="text-2xl font-black text-slate-800 leading-none">
                    {p.name}
                  </span>

                  <input
                    type="number"
                    inputMode="numeric"
                    className="w-20 h-14 text-center text-2xl font-black rounded-xl border-4 outline-none text-slate-900 border-slate-100 focus:border-blue-500 bg-slate-50"
                    value={tableAssignments[p.id] ?? ''}
                    onChange={(e) =>
                      onAssignTable(p.id, parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableAssignmentView;
