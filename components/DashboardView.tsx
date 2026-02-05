import React from 'react';
import { CardEvent } from '../types';
import { PlusCircle, Calendar, Trash2, Play } from 'lucide-react';

interface DashboardViewProps {
  events: CardEvent[];
  onSelectEvent: (id: string) => void;
  onCreateEvent: (name: string) => void;
  onDeleteEvent: (id: string) => void;
  onExport: () => void;
  onImport: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  events,
  onSelectEvent,
  onCreateEvent,
  onDeleteEvent
}) => {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kaartmiddagen</h1>
        <button
          onClick={() => {
            const name = prompt('Naam van de nieuwe kaartmiddag');
            if (name) onCreateEvent(name);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition"
        >
          <PlusCircle size={20} />
          Nieuwe middag
        </button>
      </div>

      {events.length === 0 && (
        <p className="text-gray-500 text-center mt-10">
          Nog geen kaartmiddagen aangemaakt
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {events.map(event => (
          <div
            key={event.id}
            className="bg-white rounded-xl shadow border hover:shadow-md transition cursor-pointer
                       px-5 py-3 min-h-[72px] flex justify-between items-center"
            onClick={() => onSelectEvent(event.id)}
          >
            <div className="flex flex-col">
              <span className="font-semibold text-base">{event.title}</span>
              <span className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Calendar size={16} />
                {event.date}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEvent(event.id);
                }}
                className="text-green-600 hover:text-green-700"
                title="Open middag"
              >
                <Play size={20} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteEvent(event.id);
                }}
                className="text-red-500 hover:text-red-600"
                title="Verwijderen"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardView;
