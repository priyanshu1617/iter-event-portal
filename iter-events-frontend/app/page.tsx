'use client';

import { useDeferredValue, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  backendApi,
  type ClubSummary,
  type CreateEventInput,
  type EventRecord,
} from '@/lib/backend-client';

type NoticeTone = 'success' | 'error' | 'info';
type SortOrder = 'date' | 'trending' | 'seats';
type StatusFilter = 'all' | 'OPEN' | 'LIVE' | 'SOON' | 'FULL';

interface NoticeState {
  tone: NoticeTone;
  message: string;
}

interface AttendeeProfile {
  name: string;
  email: string;
  rollNumber: string;
  teamName: string;
}

const TOKEN_STORAGE_KEY = 'iter-events-token';
const CLUB_STORAGE_KEY = 'iter-events-club';
const ATTENDEE_STORAGE_KEY = 'iter-events-attendee-profile';

const defaultAttendeeProfile: AttendeeProfile = {
  name: '',
  email: '',
  rollNumber: '',
  teamName: '',
};

const defaultEventDraft = {
  title: '',
  description: '',
  category: 'Technical',
  date: '',
  venue: '',
  maxSeats: '100',
};

const defaultCategoryOptions = [
  'all',
  'Arts',
  'Competition',
  'Cultural',
  'Esports',
  'Startup',
  'Technical',
  'Workshop',
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(
    new Date(date),
  );
}

function noticeClasses(tone: NoticeTone) {
  if (tone === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-900';
  }

  if (tone === 'error') {
    return 'border-rose-200 bg-rose-50 text-rose-900';
  }

  return 'border-amber-200 bg-amber-50 text-amber-900';
}

function statusVariant(status: string) {
  if (status === 'LIVE' || status === 'OPEN') {
    return 'default' as const;
  }

  if (status === 'FULL') {
    return 'destructive' as const;
  }

  return 'secondary' as const;
}

export default function Home() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [clubsLoading, setClubsLoading] = useState(false);
  const [actionKey, setActionKey] = useState<string | null>(null);

  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [clubSession, setClubSession] = useState<ClubSummary | null>(null);
  const [authToken, setAuthToken] = useState('');
  const [clubDirectory, setClubDirectory] = useState<ClubSummary[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [bookmarkedEventIds, setBookmarkedEventIds] = useState<string[]>([]);
  const [registrationStatusByEvent, setRegistrationStatusByEvent] = useState<
    Record<string, string>
  >({});

  const [clubIdInput, setClubIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('demo123');
  const [attendeeProfile, setAttendeeProfile] = useState(defaultAttendeeProfile);
  const [eventDraft, setEventDraft] = useState(defaultEventDraft);

  const [searchInput, setSearchInput] = useState('');
  const deferredSearch = useDeferredValue(searchInput);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date');

  const categoryOptions = Array.from(
    new Set([...defaultCategoryOptions, ...events.map((event) => event.category)]),
  );

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        const storedAttendee = window.localStorage.getItem(ATTENDEE_STORAGE_KEY);
        const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
        const storedClub = window.localStorage.getItem(CLUB_STORAGE_KEY);

        if (storedAttendee) {
          setAttendeeProfile({
            ...defaultAttendeeProfile,
            ...JSON.parse(storedAttendee),
          });
        }

        if (storedToken) {
          setAuthToken(storedToken);

          try {
            const response = await backendApi.me(storedToken);

            if (!isMounted) {
              return;
            }

            setClubSession(response.data.club);
            window.localStorage.setItem(
              CLUB_STORAGE_KEY,
              JSON.stringify(response.data.club),
            );
          } catch (error) {
            if (!isMounted) {
              return;
            }

            window.localStorage.removeItem(TOKEN_STORAGE_KEY);
            window.localStorage.removeItem(CLUB_STORAGE_KEY);
            setAuthToken('');
            setClubSession(null);

            if (storedClub) {
              setNotice({
                tone: 'info',
                message:
                  error instanceof Error
                    ? `${error.message} Please log in again.`
                    : 'Session expired. Please log in again.',
              });
            }
          }
        } else if (storedClub) {
          window.localStorage.removeItem(CLUB_STORAGE_KEY);
        }
      } catch {
        if (isMounted) {
          setNotice({
            tone: 'error',
            message: 'Stored browser data could not be restored. Starting fresh.',
          });
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    window.localStorage.setItem(
      ATTENDEE_STORAGE_KEY,
      JSON.stringify(attendeeProfile),
    );
  }, [attendeeProfile, isBootstrapping]);

  useEffect(() => {
    let isMounted = true;

    async function loadClubs() {
      setClubsLoading(true);

      try {
        const response = await backendApi.getClubs();

        if (isMounted) {
          setClubDirectory(response.data.clubs);
        }
      } catch (error) {
        if (isMounted) {
          setNotice({
            tone: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Unable to load the club directory.',
          });
        }
      } finally {
        if (isMounted) {
          setClubsLoading(false);
        }
      }
    }

    loadClubs();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      setEventsLoading(true);

      try {
        const response = await backendApi.getEvents({
          category: categoryFilter,
          search: deferredSearch.trim(),
          sort: sortOrder,
          status: statusFilter,
        });

        if (isMounted) {
          setEvents(response.data.events);
        }
      } catch (error) {
        if (isMounted) {
          setNotice({
            tone: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Unable to load events from the backend.',
          });
        }
      } finally {
        if (isMounted) {
          setEventsLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, [categoryFilter, deferredSearch, sortOrder, statusFilter]);

  useEffect(() => {
    let isMounted = true;

    async function loadAttendeeData() {
      const attendeeEmail = attendeeProfile.email.trim().toLowerCase();

      if (!attendeeEmail || events.length === 0) {
        if (isMounted) {
          setBookmarkedEventIds([]);
          setRegistrationStatusByEvent({});
        }
        return;
      }

      try {
        const [bookmarkResponse, registrationChecks] = await Promise.all([
          backendApi.getBookmarks(attendeeEmail),
          Promise.all(
            events.map((event) =>
              backendApi.checkRegistration(attendeeEmail, event.id),
            ),
          ),
        ]);

        if (!isMounted) {
          return;
        }

        setBookmarkedEventIds(
          bookmarkResponse.data.bookmarks.map((bookmark) => bookmark.eventId),
        );

        const nextStatusMap: Record<string, string> = {};

        registrationChecks.forEach((response, index) => {
          if (response.data.registered && response.data.status) {
            nextStatusMap[events[index].id] = response.data.status;
          }
        });

        setRegistrationStatusByEvent(nextStatusMap);
      } catch (error) {
        if (isMounted) {
          setNotice({
            tone: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Unable to load registration and bookmark status.',
          });
        }
      }
    }

    loadAttendeeData();

    return () => {
      isMounted = false;
    };
  }, [attendeeProfile.email, events]);

  async function refreshEvents() {
    const response = await backendApi.getEvents({
      category: categoryFilter,
      search: deferredSearch.trim(),
      sort: sortOrder,
      status: statusFilter,
    });

    setEvents(response.data.events);
  }

  async function refreshClubs() {
    const response = await backendApi.getClubs();
    setClubDirectory(response.data.clubs);
  }

  async function handleClubLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionKey('club-login');
    setNotice(null);

    try {
      const response = await backendApi.login(
        clubIdInput.trim(),
        passwordInput.trim(),
      );

      setClubSession(response.data.club);
      setAuthToken(response.data.token);

      window.localStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
      window.localStorage.setItem(
        CLUB_STORAGE_KEY,
        JSON.stringify(response.data.club),
      );

      setClubIdInput('');
      setPasswordInput('demo123');
      setNotice({
        tone: 'success',
        message: `${response.data.club.name} is connected to the backend.`,
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Club login failed.',
      });
    } finally {
      setActionKey(null);
    }
  }

  function handleLogout() {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(CLUB_STORAGE_KEY);
    setAuthToken('');
    setClubSession(null);
    setNotice({
      tone: 'info',
      message: 'Club session cleared on this device.',
    });
  }

  async function handleCreateEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!clubSession || !authToken) {
      setNotice({
        tone: 'error',
        message: 'Log in with a club account before publishing an event.',
      });
      return;
    }

    const payload: CreateEventInput = {
      title: eventDraft.title.trim(),
      description: eventDraft.description.trim(),
      category: eventDraft.category.trim(),
      date: eventDraft.date,
      venue: eventDraft.venue.trim(),
      maxSeats: Number(eventDraft.maxSeats) || 100,
      emoji: '🎉',
    };

    setActionKey('create-event');
    setNotice(null);

    try {
      await backendApi.createEvent(payload, authToken);
      setEventDraft(defaultEventDraft);
      await Promise.all([refreshEvents(), refreshClubs()]);
      setNotice({
        tone: 'success',
        message: 'Event published through the Express backend.',
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Event creation failed.',
      });
    } finally {
      setActionKey(null);
    }
  }

  async function handleDeleteEvent(eventId: string) {
    if (!clubSession || !authToken) {
      return;
    }

    if (!window.confirm('Delete this event from the backend?')) {
      return;
    }

    setActionKey(`delete-${eventId}`);
    setNotice(null);

    try {
      await backendApi.deleteEvent(eventId, authToken);
      await Promise.all([refreshEvents(), refreshClubs()]);
      setNotice({
        tone: 'success',
        message: 'Event deleted successfully.',
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Event deletion failed.',
      });
    } finally {
      setActionKey(null);
    }
  }

  async function handleRegister(eventId: string) {
    const attendeeName = attendeeProfile.name.trim();
    const attendeeEmail = attendeeProfile.email.trim().toLowerCase();

    if (!attendeeName || !attendeeEmail) {
      setNotice({
        tone: 'error',
        message: 'Enter attendee name and email before registering.',
      });
      return;
    }

    setActionKey(`register-${eventId}`);
    setNotice(null);

    try {
      const response = await backendApi.register({
        eventId,
        name: attendeeName,
        email: attendeeEmail,
        rollNumber: attendeeProfile.rollNumber.trim() || undefined,
        teamName: attendeeProfile.teamName.trim() || undefined,
      });

      setRegistrationStatusByEvent((current) => ({
        ...current,
        [eventId]: response.data.registration.status,
      }));

      await refreshEvents();

      setNotice({
        tone: 'success',
        message: `Registration saved with status ${response.data.registration.status}.`,
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Registration failed.',
      });
    } finally {
      setActionKey(null);
    }
  }

  async function handleBookmark(eventId: string) {
    const attendeeEmail = attendeeProfile.email.trim().toLowerCase();

    if (!attendeeEmail) {
      setNotice({
        tone: 'error',
        message: 'Enter attendee email before bookmarking events.',
      });
      return;
    }

    setActionKey(`bookmark-${eventId}`);
    setNotice(null);

    try {
      const response = await backendApi.toggleBookmark(attendeeEmail, eventId);

      setBookmarkedEventIds((current) => {
        if (response.data.bookmarked) {
          return Array.from(new Set([...current, eventId]));
        }

        return current.filter((id) => id !== eventId);
      });

      setNotice({
        tone: 'success',
        message: response.data.bookmarked
          ? 'Event bookmarked for this attendee email.'
          : 'Bookmark removed.',
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Bookmark update failed.',
      });
    } finally {
      setActionKey(null);
    }
  }

  if (isBootstrapping) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6efe2]">
        <div className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm">
          Loading renamed project...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(20,184,166,0.18),_transparent_28%),linear-gradient(180deg,#f8f1e4_0%,#f9f5ef_45%,#fcfbf8_100%)] text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:px-6">
        <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge variant="outline" className="border-amber-300 bg-amber-50">
                Connected workspace
              </Badge>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  ITER Events Control Room
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                  The renamed frontend now talks directly to the provided Express
                  backend and its in-memory data store. Browse clubs, publish
                  events, register attendees, and manage bookmarks from one page.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="border-slate-200 bg-slate-950 p-4 text-slate-50">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  Backend
                </p>
                <p className="mt-2 text-sm font-medium">{backendApi.apiBaseUrl}</p>
              </Card>
              <Card className="border-teal-200 bg-teal-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-teal-800">
                  Active club
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {clubSession ? `${clubSession.emoji} ${clubSession.name}` : 'Not logged in'}
                </p>
              </Card>
            </div>
          </div>
        </header>

        {notice && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${noticeClasses(
              notice.tone,
            )}`}
          >
            {notice.message}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-[1.75rem] border-slate-200 bg-white/85 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Total events
            </p>
            <p className="mt-3 text-3xl font-semibold">{events.length}</p>
          </Card>
          <Card className="rounded-[1.75rem] border-slate-200 bg-white/85 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Trending now
            </p>
            <p className="mt-3 text-3xl font-semibold">
              {events.filter((event) => event.trending).length}
            </p>
          </Card>
          <Card className="rounded-[1.75rem] border-slate-200 bg-white/85 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Clubs loaded
            </p>
            <p className="mt-3 text-3xl font-semibold">
              {clubsLoading ? '...' : clubDirectory.length}
            </p>
          </Card>
          <Card className="rounded-[1.75rem] border-slate-200 bg-white/85 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Attendee email
            </p>
            <p className="mt-3 truncate text-lg font-semibold">
              {attendeeProfile.email || 'Not set'}
            </p>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-6">
            {!clubSession ? (
              <Card className="rounded-[2rem] border-slate-200 bg-white/85 p-6 shadow-sm">
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Club login
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Connect a club account
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    All seeded clubs use the password <strong>demo123</strong>.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleClubLogin}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Club ID
                    </label>
                    <Input
                      value={clubIdInput}
                      onChange={(event) => setClubIdInput(event.target.value)}
                      placeholder="ITER_CSE_TECH"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={passwordInput}
                      onChange={(event) => setPasswordInput(event.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={actionKey === 'club-login'}
                    type="submit"
                  >
                    {actionKey === 'club-login' ? 'Connecting...' : 'Connect club'}
                  </Button>
                </form>
              </Card>
            ) : (
              <Card className="rounded-[2rem] border-slate-200 bg-white/85 p-6 shadow-sm">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Publisher
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">
                      Create a new event
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Logged in as {clubSession.name}. New events are written to the
                      backend data store immediately.
                    </p>
                  </div>
                  <Button onClick={handleLogout} type="button" variant="outline">
                    Logout
                  </Button>
                </div>

                <form className="space-y-4" onSubmit={handleCreateEvent}>
                  <Input
                    value={eventDraft.title}
                    onChange={(event) =>
                      setEventDraft((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Event title"
                  />
                  <Textarea
                    value={eventDraft.description}
                    onChange={(event) =>
                      setEventDraft((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Event description"
                    rows={4}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      value={eventDraft.category}
                      onChange={(event) =>
                        setEventDraft((current) => ({
                          ...current,
                          category: event.target.value,
                        }))
                      }
                      placeholder="Category"
                    />
                    <Input
                      type="date"
                      value={eventDraft.date}
                      onChange={(event) =>
                        setEventDraft((current) => ({
                          ...current,
                          date: event.target.value,
                        }))
                      }
                    />
                    <Input
                      value={eventDraft.venue}
                      onChange={(event) =>
                        setEventDraft((current) => ({
                          ...current,
                          venue: event.target.value,
                        }))
                      }
                      placeholder="Venue"
                    />
                    <Input
                      min="1"
                      type="number"
                      value={eventDraft.maxSeats}
                      onChange={(event) =>
                        setEventDraft((current) => ({
                          ...current,
                          maxSeats: event.target.value,
                        }))
                      }
                      placeholder="Max seats"
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={actionKey === 'create-event'}
                    type="submit"
                  >
                    {actionKey === 'create-event' ? 'Publishing...' : 'Publish event'}
                  </Button>
                </form>
              </Card>
            )}

            <Card className="rounded-[2rem] border-slate-200 bg-white/85 p-6 shadow-sm">
              <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Attendee profile
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Registration and bookmark identity
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  The backend uses attendee email for bookmarks and duplicate
                  registration checks.
                </p>
              </div>

              <div className="space-y-3">
                <Input
                  value={attendeeProfile.name}
                  onChange={(event) =>
                    setAttendeeProfile((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Attendee name"
                />
                <Input
                  type="email"
                  value={attendeeProfile.email}
                  onChange={(event) =>
                    setAttendeeProfile((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="attendee@email.com"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    value={attendeeProfile.rollNumber}
                    onChange={(event) =>
                      setAttendeeProfile((current) => ({
                        ...current,
                        rollNumber: event.target.value,
                      }))
                    }
                    placeholder="Roll number"
                  />
                  <Input
                    value={attendeeProfile.teamName}
                    onChange={(event) =>
                      setAttendeeProfile((current) => ({
                        ...current,
                        teamName: event.target.value,
                      }))
                    }
                    placeholder="Team name"
                  />
                </div>
              </div>
            </Card>

            <Card className="rounded-[2rem] border-slate-200 bg-white/85 p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Club directory
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Seeded club IDs</h2>
                </div>
                <Badge variant="outline">{clubDirectory.length}</Badge>
              </div>

              <div className="space-y-3">
                {clubDirectory.map((club) => (
                  <div
                    key={club.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {club.emoji} {club.name}
                        </p>
                        <p className="text-sm text-slate-600">{club.clubId}</p>
                      </div>
                      <Badge variant="secondary">{club.category}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[2rem] border-slate-200 bg-white/85 p-6 shadow-sm">
              <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Event filters
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Query the backend</h2>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search title or venue"
                />
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  value={categoryFilter}
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === 'all' ? 'All categories' : option}
                    </option>
                  ))}
                </select>
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  value={statusFilter}
                >
                  <option value="all">All status</option>
                  <option value="OPEN">OPEN</option>
                  <option value="LIVE">LIVE</option>
                  <option value="SOON">SOON</option>
                  <option value="FULL">FULL</option>
                </select>
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                  onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                  value={sortOrder}
                >
                  <option value="date">Sort by date</option>
                  <option value="trending">Sort by trending</option>
                  <option value="seats">Sort by seats left</option>
                </select>
              </div>
            </Card>

            <div className="space-y-4">
              {eventsLoading ? (
                <Card className="rounded-[2rem] border-slate-200 bg-white/85 p-8 text-center text-sm text-slate-600 shadow-sm">
                  Refreshing events from the backend...
                </Card>
              ) : null}

              {!eventsLoading && events.length === 0 ? (
                <Card className="rounded-[2rem] border-slate-200 bg-white/85 p-8 text-center text-sm text-slate-600 shadow-sm">
                  No events matched the current filters.
                </Card>
              ) : null}

              {events.map((event) => {
                const isOwner = clubSession?.id === event.club?.id;
                const isBookmarked = bookmarkedEventIds.includes(event.id);
                const registrationState = registrationStatusByEvent[event.id];
                const isRegistered = Boolean(registrationState);

                return (
                  <Card
                    key={event.id}
                    className="rounded-[2rem] border-slate-200 bg-white/90 p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={statusVariant(event.status)}>
                            {event.status}
                          </Badge>
                          <Badge variant="outline">{event.category}</Badge>
                          {event.trending ? (
                            <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                              Trending
                            </Badge>
                          ) : null}
                          {registrationState ? (
                            <Badge variant="secondary">
                              You are {registrationState}
                            </Badge>
                          ) : null}
                        </div>

                        <div>
                          <h3 className="text-2xl font-semibold tracking-tight">
                            {event.emoji} {event.title}
                          </h3>
                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                            {event.description}
                          </p>
                        </div>

                        <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Club
                            </p>
                            <p className="mt-2 font-medium">
                              {event.club ? `${event.club.emoji} ${event.club.name}` : 'Unknown club'}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Date
                            </p>
                            <p className="mt-2 font-medium">{formatDate(event.date)}</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Venue
                            </p>
                            <p className="mt-2 font-medium">{event.venue}</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Seats
                            </p>
                            <p className="mt-2 font-medium">
                              {event.filled}/{event.maxSeats} filled
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                          <span>{event.seatsLeft} seats left</span>
                          <span>{event.isFree ? 'Free entry' : 'Paid entry'}</span>
                          {event.prizePool ? <span>Prize pool: {event.prizePool}</span> : null}
                        </div>
                      </div>

                      <div className="flex min-w-[220px] flex-col gap-3">
                        <Button
                          disabled={actionKey === `register-${event.id}` || isRegistered}
                          onClick={() => handleRegister(event.id)}
                          type="button"
                        >
                          {actionKey === `register-${event.id}`
                            ? 'Submitting...'
                            : isRegistered
                              ? `Already ${registrationState}`
                              : event.status === 'FULL'
                                ? 'Join waitlist'
                                : 'Register attendee'}
                        </Button>
                        <Button
                          disabled={actionKey === `bookmark-${event.id}`}
                          onClick={() => handleBookmark(event.id)}
                          type="button"
                          variant={isBookmarked ? 'secondary' : 'outline'}
                        >
                          {actionKey === `bookmark-${event.id}`
                            ? 'Saving...'
                            : isBookmarked
                              ? 'Bookmarked'
                              : 'Bookmark'}
                        </Button>
                        {isOwner ? (
                          <Button
                            disabled={actionKey === `delete-${event.id}`}
                            onClick={() => handleDeleteEvent(event.id)}
                            type="button"
                            variant="destructive"
                          >
                            {actionKey === `delete-${event.id}`
                              ? 'Deleting...'
                              : 'Delete owned event'}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
