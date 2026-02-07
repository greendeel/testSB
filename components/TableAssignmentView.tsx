import React from 'react';
import { Participant } from '../types';

interface TableAssignmentViewProps {
  participants: Participant[];
  tableAssignments: Record<string, number>;
  onAssignTable: (participantId: string, table: number) => void;
}

const TableAssignmentView: React.FC<TableAssignmentViewProps> = ({
  participants,
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

      <div className="grid gap-4 md:grid-cols-2">
        {participants.map((p) => (
          <div
            key={p.id}
            className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-2"
          >
            <span className="text-2xl font-black text-slate-800 leading-none">
              {p.name}
            </span>

            <input
              type="number"
              inputMode="numeric"
              className="w-20 h-14 text-center text-2xl font-black rounded-xl border-4 border-slate-200 focus:border-blue-500 outline-none bg-slate-50"
              value={tableAssignments[p.id] ?? ''}
              onChange={(e) =>
                onAssignTable(p.id, parseInt(e.target.value) || 0)
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableAssignmentView;
