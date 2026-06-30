// browser-api-client.js — add <script src="browser-api-client.js"></script> to your HTML
// Replaces all hardcoded data and wires your existing functions to the backend.

const API = 'http://localhost:5000/api';

// ─── Token storage ────────────────────────────────────────────────────────────
const Auth = {
  token:    () => localStorage.getItem('iter_token'),
  club:     () => JSON.parse(localStorage.getItem('iter_club') || 'null'),
  save:     (token, club) => { localStorage.setItem('iter_token', token); localStorage.setItem('iter_club', JSON.stringify(club)); },
  clear:    () => { localStorage.removeItem('iter_token'); localStorage.removeItem('iter_club'); },
  loggedIn: () => !!localStorage.getItem('iter_token'),
};

// ─── Base fetch helper ────────────────────────────────────────────────────────
async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (Auth.token()) headers['Authorization'] = `Bearer ${Auth.token()}`;
  const res  = await fetch(`${API}${path}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'API error');
  return json;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
const IterAuth = {
  async login(clubId, password) {
    const { data } = await api('/auth/login', { method: 'POST', body: JSON.stringify({ clubId, password }) });
    Auth.save(data.token, data.club);
    return data.club;
  },
  logout() { Auth.clear(); },
  isLoggedIn: () => Auth.loggedIn(),
  currentClub: () => Auth.club(),
};

// ─── Events ───────────────────────────────────────────────────────────────────
const IterEvents = {
  async getAll({ category, search, sort, status } = {}) {
    const p = new URLSearchParams();
    if (category && category !== 'all') p.set('category', category);
    if (search)  p.set('search', search);
    if (sort)    p.set('sort', sort);
    if (status)  p.set('status', status);
    const { data } = await api(`/events?${p}`);
    return data.events; // same shape as your hardcoded EVENTS array
  },
  async create(eventData) {
    const { data, message } = await api('/events', { method: 'POST', body: JSON.stringify(eventData) });
    return { event: data.event, message };
  },
  async update(eventId, updates) {
    const { data } = await api(`/events/${eventId}`, { method: 'PATCH', body: JSON.stringify(updates) });
    return data.event;
  },
  async delete(eventId) {
    return api(`/events/${eventId}`, { method: 'DELETE' });
  },
};

// ─── Clubs ────────────────────────────────────────────────────────────────────
const IterClubs = {
  async getAll() {
    const { data } = await api('/clubs');
    return data.clubs;
  },
  async getEvents(clubId) {   // e.g. 'ITER_CSE_TECH'
    const { data } = await api(`/clubs/${clubId}/events`);
    return data; // { club, events }
  },
};

// ─── Registrations ────────────────────────────────────────────────────────────
const IterRegistrations = {
  async register({ eventId, name, email, rollNumber, teamName }) {
    return api('/registrations', { method: 'POST', body: JSON.stringify({ eventId, name, email, rollNumber, teamName }) });
  },
  async check(email, eventId) {
    const { data } = await api(`/registrations/check?email=${encodeURIComponent(email)}&eventId=${eventId}`);
    return data; // { registered: bool, status }
  },
  async cancel(registrationId, email) {
    return api(`/registrations/${registrationId}`, { method: 'DELETE', body: JSON.stringify({ email }) });
  },
};

// ─── Bookmarks ────────────────────────────────────────────────────────────────
const IterBookmarks = {
  async getAll(email) {
    const { data } = await api(`/bookmarks?email=${encodeURIComponent(email)}`);
    return data.bookmarks;
  },
  async toggle(email, eventId) {
    const { data, message } = await api('/bookmarks/toggle', { method: 'POST', body: JSON.stringify({ email, eventId }) });
    return { bookmarked: data.bookmarked, message };
  },
};

// ─── Replace your existing doLogin() with this ────────────────────────────────
async function doLogin() {
  const clubId = document.getElementById('clubId').value.trim();
  const pw     = document.getElementById('clubPw').value;
  if (!clubId || !pw) { toast('Missing', 'Fill Club ID and Password', '⚠️'); return; }
  try {
    const club = await IterAuth.login(clubId, pw);
    toast('Logged in!', 'Welcome, ' + club.name, '✅');
    closeAdmin();
  } catch (err) {
    toast('Error', err.message, '❌');
  }
}

// ─── Replace your existing doPublish() with this ─────────────────────────────
async function doPublish() {
  const title = document.getElementById('pTitle').value.trim();
  const date  = document.getElementById('pDate').value;
  const venue = document.getElementById('pVenue').value.trim();
  if (!title || !date) { toast('Incomplete', 'Title and Date required', '⚠️'); return; }
  try {
    const { event, message } = await IterEvents.create({
      title,
      category:    document.getElementById('pCat').value,
      date,
      venue:       venue || 'TBD',
      description: document.getElementById('pDesc').value,
      maxSeats:    Number(document.getElementById('pSeats').value) || 100,
      emoji:       '🎉',
    });
    toast('Published! 🚀', message, '✅');
    closeAdmin();
    // Re-render your event grid after publish:
    filterEvents();
  } catch (err) {
    toast('Error', err.message, '❌');
  }
}
