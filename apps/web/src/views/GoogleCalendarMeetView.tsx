import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Video, Clock, User, Plus, RefreshCw, 
  ExternalLink, Trash2, CheckCircle2, AlertCircle, Sparkles, 
  Copy, Check, BookOpen, Link, Users, Share2, Layers, ShieldCheck,
  ChevronRight, CalendarDays, Globe, Info, X
} from 'lucide-react';
import { UserProfile, DiscipleshipSession, LifeSphere } from '../types';
import {
  getWorkspaceStatus,
  connectGoogleWorkspace,
  disconnectGoogleWorkspace,
} from '../services/googleAuth';
import {
  listGoogleCalendarEvents,
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  getMeetLinkFromEvent,
  GoogleCalendarEvent
} from '../services/googleCalendarService';
import { createGoogleMeetSpace, GoogleMeetSpace } from '../services/googleMeetService';

interface GoogleCalendarMeetViewProps {
  currentUser: UserProfile;
  sessions: DiscipleshipSession[];
  mentors: UserProfile[];
}

export const GoogleCalendarMeetView: React.FC<GoogleCalendarMeetViewProps> = ({
  currentUser,
  sessions,
  mentors,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [googleUser, setGoogleUser] = useState<{ email: string } | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isFetchingEvents, setIsFetchingEvents] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'UPCOMING' | 'THIS_WEEK' | 'THIS_MONTH' | 'ALL'>('UPCOMING');

  // Status & Toasts
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Modals & Forms
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<GoogleCalendarEvent | null>(null);
  const [isInstantMeetModalOpen, setIsInstantMeetModalOpen] = useState(false);
  const [createdMeetSpace, setCreatedMeetSpace] = useState<GoogleMeetSpace | null>(null);
  const [isCreatingInstantMeet, setIsCreatingInstantMeet] = useState(false);

  // New Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [sphereFocus, setSphereFocus] = useState<LifeSphere>('PERSONAL_GROWTH');
  const [mentorEmail, setMentorEmail] = useState('');
  const [mentorName, setMentorName] = useState('');
  const [eventStartDate, setEventStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [scriptureAnchor, setScriptureAnchor] = useState('Romans 12:1-2 - Living Sacrifices');
  const [eventAgenda, setEventAgenda] = useState('');
  const [includeGoogleMeet, setIncludeGoogleMeet] = useState(true);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  // 1-Click Sync Platform Session to Calendar
  const [syncingSessionId, setSyncingSessionId] = useState<string | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(text);
    showToast('Link copied to clipboard!');
    setTimeout(() => setCopiedLink(null), 3000);
  };

  // Check Google Workspace connection status on mount.
  useEffect(() => {
    getWorkspaceStatus()
      .then((status) => {
        setIsConnected(status.connected);
        if (status.connected) {
          setGoogleUser({ email: status.google_account_email });
          fetchEvents();
        }
      })
      .catch(() => setIsConnected(false));
  }, []);

  // Default the "Senior Mentor" picker to the first real mentor once loaded.
  useEffect(() => {
    if (!mentorName && mentors.length > 0) {
      setMentorName(mentors[0].name);
      setMentorEmail(mentors[0].email);
    }
  }, [mentors, mentorName]);

  const handleGoogleSignIn = () => {
    setIsLoadingAuth(true);
    connectGoogleWorkspace(); // full-page redirect; component unmounts here
  };

  const handleGoogleSignOut = async () => {
    try {
      await disconnectGoogleWorkspace();
    } catch (err: any) {
      showToast(err.message || 'Failed to disconnect Google Workspace.', 'error');
      return;
    }
    setIsConnected(false);
    setGoogleUser(null);
    setCalendarEvents([]);
    showToast('Disconnected from Google Workspace.');
  };

  const fetchEvents = async () => {
    setIsFetchingEvents(true);
    try {
      const now = new Date();
      let timeMin = now.toISOString();
      let timeMax: string | undefined = undefined;

      if (dateFilter === 'THIS_WEEK') {
        const weekEnd = new Date();
        weekEnd.setDate(now.getDate() + 7);
        timeMax = weekEnd.toISOString();
      } else if (dateFilter === 'THIS_MONTH') {
        const monthEnd = new Date();
        monthEnd.setDate(now.getDate() + 30);
        timeMax = monthEnd.toISOString();
      } else if (dateFilter === 'ALL') {
        const past = new Date();
        past.setDate(now.getDate() - 30);
        timeMin = past.toISOString();
      }

      const events = await listGoogleCalendarEvents({
        timeMin,
        timeMax,
        searchQuery: searchQuery.trim() || undefined,
        maxResults: 50
      });

      setCalendarEvents(events || []);
    } catch (err: any) {
      console.error(err);
      showToast('Error loading Google Calendar events: ' + err.message, 'error');
    } finally {
      setIsFetchingEvents(false);
    }
  };

  // Create Discipleship Calendar Event with Google Meet
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !eventTitle.trim()) return;

    setIsSubmittingEvent(true);
    try {
      const startDateTime = new Date(eventStartDate);
      const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

      const description = `=====================================================
PHRONESIS DISCIPLESHIP COVENANT APPOINTMENT
=====================================================
Focus Life Sphere: ${sphereFocus.replace('_', ' ')}
Elder / Mentor: ${mentorName}
Disciple: ${currentUser.name}

Scripture Anchor:
${scriptureAnchor}

Agenda & Counsel Notes:
${eventAgenda || '1. Opening Intercession & Prayer\n2. Life Sphere Progress Review\n3. Biblical Guidance\n4. Action Items Commitment'}

=====================================================
Scheduled via Phronesis Mentorship Platform`;

      const attendees = [];
      if (mentorEmail && mentorEmail.includes('@')) {
        attendees.push({ email: mentorEmail.trim(), displayName: mentorName });
      }

      const createdEvent = await createGoogleCalendarEvent({
        summary: `[Phronesis] ${eventTitle.trim()}`,
        description,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        attendees,
        enableGoogleMeet: includeGoogleMeet,
        colorId: '6' // Tangerine / Gold
      });

      showToast(`Discipleship appointment added to Google Calendar with Google Meet!`);
      setIsCreateEventModalOpen(false);
      setEventTitle('');
      setEventAgenda('');
      fetchEvents();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  // Sync Existing Platform Session to Google Calendar
  const handleSyncSessionToCalendar = async (session: DiscipleshipSession) => {
    if (!isConnected) {
      showToast('Please sign in to Google Workspace first.', 'error');
      return;
    }

    setSyncingSessionId(session.id);
    try {
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + 2);
      startTime.setHours(19, 0, 0, 0);
      const endTime = new Date(startTime.getTime() + (session.durationMinutes || 45) * 60000);

      const description = `=====================================================
PHRONESIS DISCIPLESHIP SESSION
=====================================================
Topic: ${session.topic}
Life Sphere: ${session.sphereFocus.replace('_', ' ')}
Mentor: ${session.mentorName}
Disciple: ${session.menteeName}

Scripture Foundation:
${session.scriptureText}

Meeting Notes:
${session.meetingNotes}

Agreed Commitments:
${session.actionItems.map(a => `• ${a}`).join('\n')}

=====================================================
Synced from Phronesis Mentorship Platform`;

      await createGoogleCalendarEvent({
        summary: `[Phronesis Discipleship] ${session.topic}`,
        description,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        enableGoogleMeet: true,
        colorId: '5' // Banana / Gold
      });

      showToast(`Session "${session.topic}" synced to Google Calendar with Google Meet link!`);
      fetchEvents();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSyncingSessionId(null);
    }
  };

  // Instant Google Meet Creation
  const handleCreateInstantMeet = async () => {
    if (!isConnected) {
      showToast('Please sign in with Google first.', 'error');
      return;
    }

    setIsCreatingInstantMeet(true);
    try {
      const space = await createGoogleMeetSpace();
      setCreatedMeetSpace(space);
      setIsInstantMeetModalOpen(true);
      fetchEvents();
      showToast('Google Meet Room created successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to create Google Meet space.', 'error');
    } finally {
      setIsCreatingInstantMeet(false);
    }
  };

  // Confirm delete calendar event
  const handleConfirmDeleteEvent = async () => {
    if (!isConnected || !eventToDelete) return;

    try {
      await deleteGoogleCalendarEvent(eventToDelete.id);
      showToast(`Calendar event "${eventToDelete.summary}" was removed.`);
      setEventToDelete(null);
      fetchEvents();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 animate-bounce ${
          toastMessage.type === 'error' ? 'bg-red-900 text-white border-red-500' : 'bg-stone-900 text-white border-amber-500/40'
        }`}>
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Main Header / Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" /> Google Calendar & Google Meet
            </span>
            <span className="text-xs text-stone-500 font-medium">Live Discipleship Synchronizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-display text-stone-900">
            Discipleship Calendar & Video Conference Center
          </h1>
          <p className="text-xs text-stone-600 leading-relaxed">
            Schedule 1-on-1 mentor appointments with auto-generated Google Meet video rooms, synchronize discipleship milestones with your personal Google Calendar, and join live video sessions with one click.
          </p>
        </div>

        {/* Authentication Controls */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 shrink-0 space-y-3 min-w-[280px]">
          {isConnected && googleUser ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                  {googleUser.email?.charAt(0).toUpperCase() || 'G'}
                </div>
                <div className="truncate">
                  <div className="font-bold text-xs text-stone-900 truncate">
                    Connected Account
                  </div>
                  <div className="text-[10px] text-stone-500 truncate">{googleUser.email}</div>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Calendar & Meet Active
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => fetchEvents()}
                  disabled={isFetchingEvents}
                  className="flex-1 py-2 px-3 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingEvents ? 'animate-spin' : ''}`} /> Refresh
                </button>

                <button
                  onClick={handleGoogleSignOut}
                  className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-600 text-xs font-bold transition"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 text-center">
              <p className="text-[11px] text-stone-600 font-medium">
                Connect your Google Account to manage Calendar events & Google Meet rooms.
              </p>
              
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoadingAuth}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-stone-50 text-stone-700 font-semibold border border-stone-300 px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition text-xs active:scale-98"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span>{isLoadingAuth ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Action 1: Instant Google Meet Room */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Video className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 pt-1">Instant Google Meet Discipleship Room</h3>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Generate an immediate HD Google Meet video room for impromptu prayer or urgent counsel.
            </p>
          </div>

          <div className="pt-2 border-t border-stone-100">
            <button
              onClick={handleCreateInstantMeet}
              disabled={isCreatingInstantMeet}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Video className="w-3.5 h-3.5" />
              {isCreatingInstantMeet ? 'Creating Space...' : 'Launch Instant Meet Room'}
            </button>
          </div>
        </div>

        {/* Action 2: Schedule Discipleship Appointment */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 pt-1">Schedule Discipleship Session</h3>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Book a calendar appointment complete with Google Meet video link, scripture anchor, and email invitations.
            </p>
          </div>

          <div className="pt-2 border-t border-stone-100">
            <button
              onClick={() => setIsCreateEventModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              Schedule with Google Meet
            </button>
          </div>
        </div>

        {/* Action 3: Sync Existing Platform Sessions to Calendar */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 pt-1">Sync Phronesis Sessions</h3>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Push your platform discipleship sessions into Google Calendar with auto-attached Google Meet conferencing.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-stone-100">
            {sessions.slice(0, 2).map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2 text-xs bg-stone-50 p-2 rounded-xl">
                <div className="truncate">
                  <div className="font-bold text-stone-800 truncate">{s.topic}</div>
                  <div className="text-[10px] text-stone-500">{s.scheduledTime}</div>
                </div>
                <button
                  onClick={() => handleSyncSessionToCalendar(s)}
                  disabled={syncingSessionId === s.id}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] whitespace-nowrap transition flex items-center gap-1"
                >
                  <CalendarIcon className="w-3 h-3" />
                  {syncingSessionId === s.id ? 'Syncing...' : 'Sync to Cal'}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Google Calendar Agenda & Live Video Events */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-5">
        
        {/* Filter & Search Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-stone-900">Your Google Calendar Discipleship Schedule</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            
            {/* Filter Pills */}
            <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'UPCOMING', label: 'Upcoming' },
                { id: 'THIS_WEEK', label: 'Next 7 Days' },
                { id: 'THIS_MONTH', label: 'Next 30 Days' },
                { id: 'ALL', label: 'All (Inc. Past)' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setDateFilter(f.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition text-xs ${
                    dateFilter === f.id
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Filter calendar events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchEvents();
                }}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

        </div>

        {/* Calendar Events List */}
        {!isConnected ? (
          <div className="text-center py-16 space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-800 mx-auto flex items-center justify-center">
              <CalendarIcon className="w-8 h-8 text-amber-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-stone-900">Connect Google Calendar</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Connect your account to view your live schedule, book discipleship calls, and automatically attach Google Meet conference links.
              </p>
            </div>
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoadingAuth}
              className="inline-flex items-center gap-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md shadow-amber-950/20 transition"
            >
              <span>Connect Google Calendar & Meet</span>
            </button>
          </div>
        ) : isFetchingEvents ? (
          <div className="text-center py-16 space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-stone-600">Retrieving events from Google Calendar...</p>
          </div>
        ) : calendarEvents.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <CalendarDays className="w-12 h-12 text-stone-300 mx-auto" />
            <p className="text-xs font-semibold text-stone-600">No appointments found for the selected timeframe.</p>
            <button
              onClick={() => setIsCreateEventModalOpen(true)}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 underline"
            >
              Schedule your first discipleship session with Google Meet
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {calendarEvents.map((event) => {
              const meetUrl = getMeetLinkFromEvent(event);
              const startDate = event.start.dateTime ? new Date(event.start.dateTime) : (event.start.date ? new Date(event.start.date) : null);
              const endDate = event.end.dateTime ? new Date(event.end.dateTime) : (event.end.date ? new Date(event.end.date) : null);
              const isPhronesisEvent = event.summary?.includes('[Phronesis]') || event.description?.includes('Phronesis');

              return (
                <div
                  key={event.id}
                  className={`p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isPhronesisEvent
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                      : 'bg-stone-50 hover:bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {/* Left Info */}
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      {isPhronesisEvent && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-200/70 text-amber-900">
                          Discipleship Appointment
                        </span>
                      )}
                      
                      {meetUrl ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <Video className="w-3 h-3" /> Google Meet Attached
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400">Standard Event</span>
                      )}

                      <span className="text-xs text-stone-500 font-mono">
                        {startDate ? startDate.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'All Day'}
                        {endDate && ` - ${endDate.toLocaleTimeString([], { timeStyle: 'short' })}`}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-stone-900">{event.summary || '(Untitled Event)'}</h3>
                      {event.description && (
                        <p className="text-xs text-stone-600 line-clamp-2 mt-1 whitespace-pre-line font-sans">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {/* Attendees */}
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-stone-500">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        <span>Attendees:</span>
                        {event.attendees.map((att, aIdx) => (
                          <span key={aIdx} className="bg-white px-2 py-0.5 rounded-md border border-stone-200 text-stone-700 font-medium">
                            {att.displayName || att.email}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                    
                    {/* Google Meet Button */}
                    {meetUrl && (
                      <a
                        href={meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Google Meet
                      </a>
                    )}

                    {/* Copy Meet Link */}
                    {meetUrl && (
                      <button
                        onClick={() => copyToClipboard(meetUrl)}
                        title="Copy Google Meet Link"
                        className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-600 transition"
                      >
                        {copiedLink === meetUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}

                    {/* View in Google Calendar Web */}
                    {event.htmlLink && (
                      <a
                        href={event.htmlLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in Google Calendar"
                        className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-600 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    {/* Delete Event */}
                    <button
                      onClick={() => setEventToDelete(event)}
                      title="Delete Calendar Event"
                      className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-red-50 hover:text-red-600 text-stone-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL 1: SCHEDULE WITH GOOGLE MEET & CALENDAR */}
      {isCreateEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Calendar & Meet Creator
                </span>
                <h2 className="text-base font-bold text-stone-900">
                  Book Discipleship Appointment
                </h2>
              </div>
              <button
                onClick={() => setIsCreateEventModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Session Focus / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Romans 8: Mind of the Spirit in Daily Walk"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Senior Mentor</label>
                  <select
                    value={mentorName}
                    onChange={(e) => {
                      const selected = mentors.find((m) => m.name === e.target.value);
                      setMentorName(e.target.value);
                      setMentorEmail(selected?.email ?? '');
                    }}
                    disabled={mentors.length === 0}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                  >
                    {mentors.length === 0 ? (
                      <option value="">No mentors available</option>
                    ) : (
                      mentors.map((m) => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Life Sphere Focus</label>
                  <select
                    value={sphereFocus}
                    onChange={(e) => setSphereFocus(e.target.value as LifeSphere)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                  >
                    <option value="PERSONAL_GROWTH">Personal Growth</option>
                    <option value="ACADEMIA_CAREER">Academia & Career</option>
                    <option value="RELATIONSHIPS">Relationships & Family</option>
                    <option value="FINANCES">Finances & Stewardship</option>
                    <option value="PHYSICAL_WELLBEING">Physical Wellbeing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Duration (Minutes)</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes (Standard)</option>
                    <option value={60}>60 Minutes (In-depth)</option>
                    <option value={90}>90 Minutes (Cohort Intensive)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Scripture Anchor</label>
                <input
                  type="text"
                  value={scriptureAnchor}
                  onChange={(e) => setScriptureAnchor(e.target.value)}
                  placeholder="e.g., Philippians 4:6-7"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Agenda & Pre-Session Questions</label>
                <textarea
                  rows={3}
                  value={eventAgenda}
                  onChange={(e) => setEventAgenda(e.target.value)}
                  placeholder="Specific topics, life questions, or spiritual burdens to address..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900">
                  <Video className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold">Attach Google Meet Video Conferencing</span>
                </div>
                <input
                  type="checkbox"
                  checked={includeGoogleMeet}
                  onChange={(e) => setIncludeGoogleMeet(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreateEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition flex items-center gap-1.5"
                >
                  {isSubmittingEvent ? 'Booking Session...' : 'Confirm Discipleship Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INSTANT GOOGLE MEET SPACE CREATED */}
      {isInstantMeetModalOpen && createdMeetSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 animate-fade-in text-center">
            
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <Video className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-stone-900">Google Meet Discipleship Room Ready</h2>
              <p className="text-xs text-stone-600">
                Share this link with your mentee or elder to begin your video counseling session immediately.
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-2 text-xs">
              <span className="font-mono text-emerald-700 font-bold truncate">
                {createdMeetSpace.meetingUri}
              </span>
              <button
                onClick={() => copyToClipboard(createdMeetSpace.meetingUri)}
                className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold shrink-0 flex items-center gap-1"
              >
                {copiedLink === createdMeetSpace.meetingUri ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href={createdMeetSpace.meetingUri}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-950/20"
              >
                <Video className="w-4 h-4" /> Enter Google Meet Room Now
              </a>

              <button
                onClick={() => setIsInstantMeetModalOpen(false)}
                className="w-full py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRM DELETE CALENDAR EVENT */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-fade-in">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Delete Calendar Event?</h3>
                <p className="text-[11px] text-stone-500">Explicit confirmation required</p>
              </div>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs text-stone-700 space-y-1">
              <span className="font-bold block text-stone-900">{eventToDelete.summary}</span>
              <p className="text-[11px] text-stone-500">
                This will permanently delete this appointment and its associated Google Meet room from your Google Calendar.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteEvent}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
