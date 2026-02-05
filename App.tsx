import React, { useState, useEffect } from 'react';
import { CardEvent, EventStatus, GameType } from './types';
import DashboardView from './components/DashboardView';
import RegistrationView from './components/RegistrationView';
import LoginView from './components/LoginView';
import { getEvents, saveEvent, deleteEvent as deleteEventFromDB, generateId } from './services/storage';
import { supabase } from './services/supabaseClient';

const CLUB_CODE = '26091976';

const App: React.FC = () => {
  const [events, setEvents] = useState<CardEvent[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('kajuit_auth') === 'true');

  const loadEvents = async () => {
    const data = await getEvents();
    setEvents(data);
  };

  // 📡 Realtime sync
  useEffect(() => {
    loadEvents();

    const channel = supabase
      .channel('events-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => loadEvents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateEvent = async (updatedEvent: CardEvent) => {
    await saveEvent(updatedEvent);
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
    alert("Nieuwe kaartmiddag aangemaakt!");
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Wilt u deze middag definitief verwijderen?')) return;
    await deleteEventFromDB(id);
  };

  const activeEvent = events.find(e => e.id === activeEventId);

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
    return (
      <LoginView
        onUnlock={(code) => {
          if (code === CLUB_CODE) {
            setIsAuthenticated(true);
            localStorage.setItem('kajuit_auth', 'true');
          } else alert('Onjuiste clubcode.');
        }}
      />
    );
  }

  // 📋 Dashboard blijft hoofdscherm
  if (!activeEventId) {
    return (
      <DashboardView
        events={events}
        onSelectEvent={() => alert("Binnenkant van middagen komt hierna 👌")}
        onCreateEvent={createEvent}
        onDeleteEvent={deleteEvent}
        onExport={() => alert('Niet meer nodig')}
        onImport={() => alert('Niet meer nodig')}
      />
    );
  }

  return (
    <RegistrationView
      participants={activeEvent!.participants}
      customNames={{ Jokeren: [], Rikken: [] }}
      onAddParticipant={addParticipant}
      onRemoveParticipant={removeParticipant}
      onUpdateParticipantGame={() => {}}
      onStartRound={() => {}}
      isLocked={false}
    />
  );
};

export default App;
