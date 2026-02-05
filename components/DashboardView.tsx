import React, { useState } from 'react';
import { CardEvent } from '../types';
import { PlusCircle, Calendar, Trash2, Play } from 'lucide-react';

interface DashboardViewProps {
  events: CardEvent[];
  onSelectEvent: (id: string) => void;
  onCreateEvent: (name: string) => void;
  onDeleteEvent: (id: string) => void;
  onExport: () => void;   // blijft staan voor compatibiliteit maar wordt niet gebruikt
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void; // idem
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
  events, 
  onSelectEvent, 
  onCreateEvent, 
  onDeleteEvent
}) => {
  const [newName, setNewName] = useState('');
  
  const handleCreate = () => {
    if (newName.trim()) {
      onCreateEvent(newName.trim());
      setNewName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newName.trim()) {
      handleCreate();
    }
  };

  const isNameEmpty = !newName.trim();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12 pb-24">
      
      {/* Nieuwe Kaartmiddag */}
      <div className="bg-white p-8 md:p-12 pt-44 md:pt-16 rounded-[3rem] border-4 border-blue-200 shadow-xl space-y-8 relative overflow-hidden">
        
        <div className="absolute top-6 right-6 md:top-10 md:right-10 w-44 md:w-60 z-50 flex justify-end items-start pointer-events-none">
          <img 
            src="logo.jpg" 
            alt="Senioren Boschweg Logo" 
            className="w-full h-auto object-contain drop-shadow-2xl"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.getAttribute('data-tried') === 'full') return;
              if (target.src.includes('logo.jpg') && !target.src.includes('logo.JPG')) {
                target.src = 'logo.JPG';
              } else if (!target.src.startsWith('/')) {
                target.src = '/logo.jpg';
                target.setAttribute('data-tried', 'full');
              }
            }}
          />
        </div>

        <div className="text-center space-y-4 pt-16 md:pt-0">
          <div className="inline-flex p-4 bg-blue-100 rounded-full text-blue-600">
            <PlusCircle size={48} />
          </div>
          <h2 className="text-4xl font-black text-slate-800 uppercase">Nieuwe Kaartmiddag</h2>
          <p className="text-2xl text-slate-500 font-bold">Hoe noemen we deze middag?</p>
        </div>
        
        <div className="space-y-6 max-w-4xl mx-auto">
          <input 
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bijv: 15 Februari"
            className="w-full text-4xl p-8 border-4 border-slate-100 rounded-3xl outline-none focus:border-blue-500 text-center font-black bg-slate-50 text-slate-900 shadow-inner"
          />
          
          <button
            onClick={handleCreate}
            disabled={isNameEmpty}
            className={`w-full py-10 rounded-3xl text-4xl font-black shadow-2xl transition-all border-b-[12px] flex items-center justify-center gap-4 ${
              isNameEmpty 
              ? 'bg-slate-200 text-slate-400 border-slate-300' 
              : 'bg-green-600 text-white border-green-800 hover:bg-green-700 active:translate-y-2 active:border-b-4'
            }`}
          >
            <Play size={40} fill="currentColor" />
            STARTEN
          </button>
        </div>
      </div>

      {/* Eerdere Middagen */}
      <div className="space-y-6">
        <div className="flex justify-between items-end px-4">
          <h3 className="text-2xl font-black text-slate-600 uppercase tracking-widest">Eerdere Middagen</h3>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[3rem] border-4 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold text-2xl">Nog geen middagen opgeslagen.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice().reverse().map(event => (
              <div 
                key={event.id}
                className="bg-white border-4 border-slate-200 rounded-[2.5rem] px-8 py-4 flex flex-col justify-between shadow-lg hover:border-blue-400 transition-all"
              >
                <button 
                  onClick={() => onSelectEvent(event.id)}
                  className="flex-1 text-left w-full"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <Calendar className="text-blue-500 shrink-0" size={24} />
                    <p className="text-2xl font-black text-slate-800 truncate leading-tight">{event.title || event.date}</p>
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className="text-lg font-bold text-slate-500 leading-none">{event.participants.length} spelers</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase leading-none ${event.status === 'RESULTS' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {event.status === 'RESULTS' ? 'Klaar' : 'Bezig'}
                    </span>
                  </div>
                </button>
                <div className="mt-2 flex justify-end border-t-2 border-slate-50 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if(confirm('Zeker weten verwijderen?')) onDeleteEvent(event.id);
                    }}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
