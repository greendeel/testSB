import React, { useState, useEffect } from 'react';
import { CardEvent, EventStatus, GameType, Table } from './types';
import { LIST_A, LIST_B } from './constants';
import DashboardView from './components/DashboardView';
import RegistrationView from './components/RegistrationView';
import RoundView from './components/RoundView';
import ResultsView from './components/ResultsView';
import Navigation from './components/Navigation';
import TableAssignmentView from './components/TableAssignmentView';
import LoginView from './components/LoginView';
import { getEvents, saveEvent, deleteEvent as deleteEventFromDB } from './services/storage';
import { generateId } from './services/storage';

const CLUB_CODE = '26091976';

const App: React.FC = () => {
  const [events, setEvents] = useState<CardEvent[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('REGISTRATION');
  const [isScoring, setIsScoring] = useState(false);
  const [editingRound, setEditingRound] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('kajuit_auth') === 'true');

  // 🔄 EVENTS LADEN VAN SUPABASE
  const loadEvents = async () => {
    const data = await getEvents();
    setEvents(data);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // 🔄 OPSLAAN IN SUPABASE
  const updateEvent = async (updatedEvent: CardEvent) => {
    await saveEvent(updatedEvent);
    await loadEvents();
  };

  const createEvent = async (title: string) => {
    const newEvent: CardEvent = {
      id: generateId(),
      title,
      date: new Date().toLocaleDateString('nl-NL'),
      status: EventStatus.REGISTRATION,
      participants: [],
      rounds: []
    };
    await updateEvent(newEvent);
    setActiveEventId(newEvent.id);
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Wilt u deze middag definitief verwijderen?')) return;
    await deleteEventFromDB(id);
    await loadEvents();
    if (activeEventId === id) setActiveEventId(null);
  };

  const activeEvent = events.find(e => e.id === activeEventId);
  if (!isAuthenticated) return <LoginView onUnlock={(code) => {
    if (code === CLUB_CODE) {
      setIsAuthenticated(true);
      localStorage.setItem('kajuit_auth', 'true');
    } else alert('Onjuiste clubcode.');
  }} />;

  if (!activeEventId) {
    return (
      <DashboardView
        events={events}
        onSelectEvent={(id) => {
          const ev = events.find(e => e.id === id);
          if (ev) { setActiveEventId(id); setActiveTab(ev.status); }
        }}
        onCreateEvent={createEvent}
        onDeleteEvent={deleteEvent}
        onExport={() => alert("Export komt later terug indien nodig")}
        onImport={() => alert("Import niet meer nodig met centrale opslag")}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navigation
        currentStatus={activeEvent.status}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onExit={() => setActiveEventId(null)}
        title={activeEvent.title}
      />
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'REGISTRATION' && (
          <RegistrationView
            participants={activeEvent.participants}
            customNames={{ Jokeren: [], Rikken: [] }}
            onAddParticipant={() => {}}
            onRemoveParticipant={() => {}}
            onUpdateParticipantGame={() => {}}
            onStartRound={() => {}}
            isLocked={false}
          />
        )}
        {/* De rest laten we nu even zoals het was, volgende stap doen we rondes */}
      </main>
    </div>
  );
};
