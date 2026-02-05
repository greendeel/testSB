import React, { useState, useEffect } from 'react';
import { CardEvent, EventStatus, GameType, Table } from './types';
import DashboardView from './components/DashboardView';
import RegistrationView from './components/RegistrationView';
import TableAssignmentView from './components/TableAssignmentView';
import Navigation from './components/Navigation';
import LoginView from './components/LoginView';
import { getEvents, saveEvent, deleteEvent as deleteEventFromDB, generateId } from './services/storage';
import { supabase } from './services/supabaseClient';

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

  useEffect(() => {
    loadEvents();
    const channel = supabase
      .channel('events-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => loadEvents())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateEvent = async (updatedEvent: CardEvent) => {
    await saveEvent(updatedEvent);
  };

  const activeEvent = events.find(e => e.id === activeEventId);

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
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Wilt u deze middag definitief verwijderen?')) return;
    await deleteEventFromDB(id);
  };

  const addParticipant = async (name: string, game: GameType) => {
    if (!activeEvent) return;
    await updateEvent({ ...activeEvent, participants: [...activeEvent.participants, { id: generateId(), name, game }] });
  };

  const removeParticipant = async (id: string) => {
    if (!activeEvent) return;
    await updateEvent({ ...activeEvent, participants: activeEvent.participants.filter(p => p.id !== id) });
  };

  const startRound = async () => {
    if (!activeEvent) return;
    await updateEvent({ ...activeEvent, status: EventStatus.ROUND1, rounds: [{ number: 1, tables: [], scores: {} }] });
    setActiveTab('ROUND1');
  };

  // 🪑 Tafels opslaan
  const setRoundTables = async (tables: Table[]) => {
    if (!activeEvent) return;
    const updatedRounds = [...activeEvent.rounds];
    updatedRounds[0] = { ...updatedRounds[0], tables };
    await updateEvent({ ...activeEvent, rounds: updatedRounds });
    setActiveTab('ROUND1_PLAY');
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
          onStartRound={startRound}
          isLocked={false}
        />
      )}

      {activeTab === 'ROUND1' && activeEvent!.rounds[0] && activeEvent!.rounds[0].tables.length === 0 && (
        <TableAssignmentView
          participants={activeEvent!.participants}
          initialTables={[]}
          onConfirm={setRoundTables}
          onUpdateParticipantGame={() => {}}
          roundNumber={1}
        />
      )}
    </div>
  );
};

export default App;
