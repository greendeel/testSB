import React, { useState, useEffect } from 'react';
import { CardEvent, EventStatus, GameType, Table } from './types';
import DashboardView from './components/DashboardView';
import RegistrationView from './components/RegistrationView';
import TableAssignmentView from './components/TableAssignmentView';
import RoundView from './components/RoundView';
import ResultsView from './components/ResultsView';
import Navigation from './components/Navigation';
import LoginView from './components/LoginView';
import { getEvents, saveEvent, deleteEvent as deleteEventFromDB, generateId } from './services/storage';
import { supabase } from './services/supabaseClient';


const CLUB_CODE = '26091976';

const App: React.FC = () => {
  const [events, setEvents] = useState<CardEvent[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('REGISTRATION');
  const [isScoring, setIsScoring] = useState(false);
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

  const activeEvent = events.find(e => e.id === activeEventId) || null;

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
    setActiveTab('REGISTRATION');
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

  const updateParticipantGame = async (id: string, newGame: GameType) => {
    if (!activeEvent) return;
    await updateEvent({
      ...activeEvent,
      participants: activeEvent.participants.map(p =>
        p.id === id ? { ...p, game: newGame } : p
      )
    });
  };

  const startRound1 = async () => {
    if (!activeEvent) return;
    await updateEvent({ ...activeEvent, status: EventStatus.ROUND1, rounds: [{ number: 1, tables: [], scores: {} }] });
    setActiveTab('ROUND1');
  };

  const startRound2 = async () => {
    if (!activeEvent) return;
    const updatedRounds = [...activeEvent.rounds, { number: 2, tables: [], scores: {} }];
    await updateEvent({ ...activeEvent, status: EventStatus.ROUND2, rounds: updatedRounds });
    setActiveTab('ROUND2');
    setIsScoring(false);
  };

  const setRoundTables = async (roundIndex: number, tables: Table[]) => {
    if (!activeEvent) return;
    const updatedRounds = [...activeEvent.rounds];
    updatedRounds[roundIndex] = { ...updatedRounds[roundIndex], tables };
    await updateEvent({ ...activeEvent, rounds: updatedRounds });
    setIsScoring(false);
  };

  const updateScore = async (roundIndex: number, pid: string, score: number) => {
    if (!activeEvent) return;
    const updatedRounds = [...activeEvent.rounds];
    const currentRound = { ...updatedRounds[roundIndex] };
    currentRound.scores = { ...currentRound.scores, [pid]: score };
    updatedRounds[roundIndex] = currentRound;
    await updateEvent({ ...activeEvent, rounds: updatedRounds });
  };

  const finishEvent = async () => {
    if (!activeEvent) return;
    await updateEvent({ ...activeEvent, status: EventStatus.RESULTS });
    setActiveTab('RESULTS');
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
        onExport={() => {}}
        onImport={() => {}}
      />
    );
  }

  if (!activeEvent) return null; // voorkomt crash tijdens laden

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navigation
        currentStatus={activeEvent.status}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onExit={() => setActiveEventId(null)}
        title={activeEvent.title}
      />

      {activeTab === 'REGISTRATION' && (
        <RegistrationView
          participants={activeEvent.participants}
          customNames={{ Jokeren: [], Rikken: [] }}
          onAddParticipant={addParticipant}
          onRemoveParticipant={removeParticipant}
          onUpdateParticipantGame={updateParticipantGame}
          onStartRound={startRound1}
          isLocked={false}
        />
      )}

      {activeTab === 'ROUND1' && activeEvent.rounds[0]?.tables.length === 0 && (
        <TableAssignmentView
          participants={activeEvent.participants}
          initialTables={[]}
          onConfirm={(tables) => setRoundTables(0, tables)}
          onUpdateParticipantGame={updateParticipantGame}
          roundNumber={1}
        />
      )}

      {activeTab === 'ROUND1' && activeEvent.rounds[0]?.tables.length > 0 && (
        <RoundView
          round={activeEvent.rounds[0]}
          participants={activeEvent.participants}
          onScoreChange={(pid, score) => updateScore(0, pid, score)}
          onFinishRound={startRound2}
          onResetTables={() => {
            const updatedRounds = [...activeEvent.rounds];
            updatedRounds[0] = { ...updatedRounds[0], tables: [] };
            updateEvent({ ...activeEvent, rounds: updatedRounds });
            setIsScoring(false);
          }}
          onUpdateParticipantTable={() => {}}
          isScoring={isScoring}
          setIsScoring={setIsScoring}
          isEventFinished={false}
        />
      )}

      {activeTab === 'ROUND2' && activeEvent.rounds[1]?.tables.length === 0 && (
        <TableAssignmentView
          participants={activeEvent.participants}
          initialTables={[]}
          onConfirm={(tables) => setRoundTables(1, tables)}
          onUpdateParticipantGame={updateParticipantGame}
          roundNumber={2}
        />
      )}

      {activeTab === 'ROUND2' && activeEvent.rounds[1]?.tables.length > 0 && (
        <RoundView
          round={activeEvent.rounds[1]}
          participants={activeEvent.participants}
          onScoreChange={(pid, score) => updateScore(1, pid, score)}
          onFinishRound={finishEvent}
          onResetTables={() => {
            const updatedRounds = [...activeEvent.rounds];
            updatedRounds[1] = { ...updatedRounds[1], tables: [] };
            updateEvent({ ...activeEvent, rounds: updatedRounds });
            setIsScoring(false);
          }}
          onUpdateParticipantTable={() => {}}
          isScoring={isScoring}
          setIsScoring={setIsScoring}
          isEventFinished={false}
        />
      )}

      {activeTab === 'RESULTS' && (
        <ResultsView
          participants={activeEvent.participants}
          rounds={activeEvent.rounds}
          title={activeEvent.title}
          onClose={() => setActiveEventId(null)}
        />
      )}
    </div>
  );
};

export default App;
