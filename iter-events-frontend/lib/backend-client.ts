export interface ClubSummary {
  id: string;
  clubId: string;
  name: string;
  emoji: string;
  category: string;
  eventCount?: number;
}

export interface EventRecord {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: string;
  date: string;
  venue: string;
  maxSeats: number;
  filled: number;
  seatsLeft: number;
  status: string;
  trending: boolean;
  prizePool: string | null;
  isFree: boolean;
  club: ClubSummary | null;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface LoginResponse {
  token: string;
  club: ClubSummary;
}

interface EventListResponse {
  events: EventRecord[];
  total: number;
}

interface ClubsResponse {
  clubs: ClubSummary[];
}

interface EventResponse {
  event: EventRecord;
}

interface RegistrationCheckResponse {
  registered: boolean;
  status: string | null;
}

interface RegistrationResponse {
  registration: {
    id: string;
    eventId: string;
    name: string;
    email: string;
    rollNumber: string | null;
    teamName: string | null;
    status: string;
    createdAt: string;
  };
}

interface BookmarksResponse {
  bookmarks: Array<{ eventId: string; event: EventRecord }>;
}

interface BookmarkToggleResponse {
  bookmarked: boolean;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

async function request<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<ApiEnvelope<T>> {
  const headers = new Headers(init.headers);

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      cache: 'no-store',
    });

    const raw = await response.text();
    const payload = raw ? JSON.parse(raw) : {};

    if (!response.ok) {
      throw new Error(payload.message || 'Request failed.');
    }

    return payload as ApiEnvelope<T>;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('The backend returned an invalid JSON response.');
    }

    if (error instanceof TypeError) {
      throw new Error(
        `Cannot reach the backend at ${API_BASE_URL}. Start iter-events-backend first.`,
      );
    }

    throw error;
  }
}

export interface EventFilters {
  category?: string;
  search?: string;
  sort?: string;
  status?: string;
}

export interface CreateEventInput {
  title: string;
  description: string;
  category: string;
  date: string;
  venue: string;
  maxSeats: number;
  emoji?: string;
}

export interface RegistrationInput {
  eventId: string;
  name: string;
  email: string;
  rollNumber?: string;
  teamName?: string;
}

function withQuery(path: string, query: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value && value !== 'all') {
      params.set(key, value);
    }
  });

  const suffix = params.toString();
  return suffix ? `${path}?${suffix}` : path;
}

export const backendApi = {
  apiBaseUrl: API_BASE_URL,
  login(clubId: string, password: string) {
    return request<LoginResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ clubId, password }),
      },
    );
  },
  me(token: string) {
    return request<{ club: ClubSummary }>('/auth/me', {}, token);
  },
  getEvents(filters: EventFilters = {}) {
    return request<EventListResponse>(
      withQuery('/events', {
        category: filters.category,
        search: filters.search,
        sort: filters.sort,
        status: filters.status,
      }),
    );
  },
  getClubs() {
    return request<ClubsResponse>('/clubs');
  },
  createEvent(input: CreateEventInput, token: string) {
    return request<EventResponse>(
      '/events',
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
      token,
    );
  },
  deleteEvent(eventId: string, token: string) {
    return request<{}>(`/events/${eventId}`, { method: 'DELETE' }, token);
  },
  register(input: RegistrationInput) {
    return request<RegistrationResponse>('/registrations', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  checkRegistration(email: string, eventId: string) {
    return request<RegistrationCheckResponse>(
      withQuery('/registrations/check', { email, eventId }),
    );
  },
  getBookmarks(email: string) {
    return request<BookmarksResponse>(withQuery('/bookmarks', { email }));
  },
  toggleBookmark(email: string, eventId: string) {
    return request<BookmarkToggleResponse>('/bookmarks/toggle', {
      method: 'POST',
      body: JSON.stringify({ email, eventId }),
    });
  },
};
