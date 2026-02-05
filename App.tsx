import React, { useState, useEffect } from 'react';
import { CardEvent, EventStatus, GameType } from './types';
import DashboardView from './components/DashboardView';
import RegistrationView from './components/RegistrationView';
import Navigation from './components/Navigation';
import LoginView from './components/LoginView';
import { getEvents, saveEvent, deleteEvent as deleteEventFromDB, generateId } from './services/storage';

const CLUB_CODE = '26091976';

const App: React.FC = () => {
  const [events, setEvents] = useState<CardEvent[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('REGISTRATION');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('kajuit_auth') === 'true');

  const loadEvents = async () => {
    const data = await getEvents();
    setEvents(data);
  };

  useEffect(() => { loadEvents(); }, []);

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

  // 👇 NIEUW: deelnemer toevoegen
  const addParticipant = async (name: string, game: GameType) => {
    if (!activeEvent) return;
    const updated = {
      ...activeEvent,
      participants: [...activeEvent.participants, { id: generateId(), name, game }]
    };
    await updateEvent(updated);
  };

  const removeParticipant = async (id: string) => {
    if (!activeEvent) return;
    const updated = {
      ...activeEvent,
      participants: activeEvent.participants.filter(p => p.id !== id)
    };
    await updateEvent(updated);
  };

  if (!isAuthenticated) {
    return <LoginView onUnlock={(code) => {
      if (code === CLUB_CODE) {
        setIsAuthenticated(true);
        localStorage.setItem('kajuit_auth', 'true');
      } else alert('Onjuiste clubcode.');
    }} />;
  }

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
        onExport={() => alert('Niet meer nodig')}
        onImport={() => alert('Niet meer nodig')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navigation
        currentStatus={activeEvent!.status}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onExit={() => setActiveEventId(null)}
        title={activeEvent!.title}
      />
      {activeTab === 'REGISTRATION' && (
        <RegistrationView
          participants={activeEvent!.participants}
          customNames={{ Jokeren: [], Rikken: [] }}
          onAddParticipant={addParticipant}
          onRemoveParticipant={removeParticipant}
          onUpdateParticipantGame={() => {}}
          onStartRound={() => {}}
          isLocked={false}
        />
      )}
    </div>
  );
};

export default App;
