// src/data/store.js
// All data lives in memory. Restarting the server resets dynamic data
// (registrations, bookmarks, new events) but clubs + seeded events persist
// because they're defined here at startup.
 
const bcrypt = require('bcryptjs');
 
// ─── Clubs ────────────────────────────────────────────────────────────────────
// Passwords are pre-hashed. All seeded clubs use "demo123".
// bcrypt.hashSync('demo123', 10) — computed once at build time.
const HASHED_DEMO = bcrypt.hashSync('demo123', 10);
 
const clubs = [
  { id: 'club_cse',      clubId: 'ITER_CSE_TECH',  name: 'CSE Tech Club',         emoji: '💻', category: 'Technical', tags: ['Hackathon','Coding'],       password: HASHED_DEMO },
  { id: 'club_robotics', clubId: 'ITER_ROBOTICS',   name: 'Robotics Club',          emoji: '🤖', category: 'Technical', tags: ['AI/ML','Hardware'],         password: HASHED_DEMO },
  { id: 'club_music',    clubId: 'ITER_MUSIC',      name: 'Music Society',           emoji: '🎸', category: 'Cultural',  tags: ['Open Mic','Talent'],        password: HASHED_DEMO },
  { id: 'club_cultural', clubId: 'ITER_CULTURAL',   name: 'Cultural Committee',      emoji: '🎭', category: 'Cultural',  tags: ['Dance','Drama'],            password: HASHED_DEMO },
  { id: 'club_photo',    clubId: 'ITER_PHOTO',      name: 'Photography Club',        emoji: '📸', category: 'Arts',      tags: ['Photography','Contest'],    password: HASHED_DEMO },
  { id: 'club_gaming',   clubId: 'ITER_GAMING',     name: 'Gaming Club',             emoji: '🎮', category: 'Esports',   tags: ['Esports','LAN'],            password: HASHED_DEMO },
  { id: 'club_gdg',      clubId: 'ITER_GDG',        name: 'GDG Cloud BBSR',          emoji: '☁️', category: 'Technical', tags: ['Cloud','Google'],           password: HASHED_DEMO },
  { id: 'club_gfg',      clubId: 'ITER_GFG',        name: 'GeeksforGeeks ITER',      emoji: '🟢', category: 'Technical', tags: ['DSA','Contest'],            password: HASHED_DEMO },
  { id: 'club_ieee',     clubId: 'ITER_IEEE',        name: 'IEEE ITER',               emoji: '⚡', category: 'Technical', tags: ['IEEE','Paper'],             password: HASHED_DEMO },
  { id: 'club_ecell',    clubId: 'ITER_ECELL',       name: 'E-Cell ITER',             emoji: '💡', category: 'Startup',   tags: ['Startup','Pitch'],          password: HASHED_DEMO },
];
 
// ─── Events ───────────────────────────────────────────────────────────────────
const events = [
  { id: 'e1',  clubId: 'club_cse',      title: 'HackITER 2025',         emoji: '💻', category: 'Technical',   date: '2025-03-15', venue: 'Main Auditorium',  description: '36-hour national hackathon. ₹1,00,000 prize pool. AI, Web3, embedded systems.', maxSeats: 100, filled: 53, status: 'LIVE',  trending: true,  prizePool: '₹1,00,000',   isFree: true },
  { id: 'e2',  clubId: 'club_cultural', title: 'Rhythm Fiesta 2025',    emoji: '🎭', category: 'Cultural',    date: '2025-03-22', venue: 'Open Ground',      description: 'Annual cultural night — dance, drama, live music & fashion showcase.',          maxSeats: 400, filled: 80, status: 'OPEN',  trending: false, isFree: true },
  { id: 'e3',  clubId: 'club_robotics', title: 'AI & ML Workshop',      emoji: '🤖', category: 'Workshop',    date: '2025-03-18', venue: 'Lab 301',          description: 'Hands-on PyTorch & Keras. Certificate of completion included.',               maxSeats: 30,  filled: 12, status: 'LIVE',  trending: true,  isFree: true },
  { id: 'e4',  clubId: 'club_music',    title: 'Strings & Beats',       emoji: '🎸', category: 'Cultural',    date: '2025-03-20', venue: 'Seminar Hall',     description: 'Open mic — singing, beatboxing, guitar & poetry. All welcome.',               maxSeats: 100, filled: 10, status: 'OPEN',  trending: false, isFree: true },
  { id: 'e5',  clubId: 'club_photo',    title: 'SnapITER Photo Walk',   emoji: '📸', category: 'Arts',        date: '2025-03-25', venue: 'Campus Wide',      description: 'Capture the soul of ITER campus. Top 10 featured in annual magazine.',         maxSeats: 200, filled: 120,status: 'OPEN',  trending: true,  isFree: true },
  { id: 'e6',  clubId: 'club_gaming',   title: 'VALORANT Clash',        emoji: '🏆', category: 'Esports',     date: '2025-03-28', venue: 'Computer Lab',     description: '5v5 esports. Form your squad and compete for ₹25,000 prize pool.',            maxSeats: 40,  filled: 32, status: 'LIVE',  trending: true,  prizePool: '₹25,000',     isFree: true },
  { id: 'e7',  clubId: 'club_gdg',      title: 'Cloud Study Jam',       emoji: '☁️', category: 'Workshop',    date: '2025-04-05', venue: 'Lab 201',          description: 'Google Cloud fundamentals. Earn official Google Cloud badges.',                maxSeats: 60,  filled: 20, status: 'OPEN',  trending: false, isFree: true },
  { id: 'e8',  clubId: 'club_gfg',      title: 'GFG Hackathon ITER',    emoji: '💡', category: 'Technical',   date: '2025-04-12', venue: 'Auditorium',       description: '24-hour coding marathon. DSA, system design, product engineering.',            maxSeats: 120, filled: 40, status: 'SOON',  trending: false, isFree: true },
  { id: 'e9',  clubId: 'club_ieee',     title: 'Paper Presentation',    emoji: '📄', category: 'Technical',   date: '2025-04-04', venue: 'Seminar Hall',     description: 'Present your research to experts. Best paper gets published.',                 maxSeats: 60,  filled: 55, status: 'LIVE',  trending: false, isFree: true },
  { id: 'e10', clubId: 'club_ecell',    title: 'PitchFest 2025',        emoji: '💡', category: 'Competition', date: '2025-04-07', venue: 'Conference Hall',  description: 'Pitch your startup to investors and mentors. ₹50,000 funding at stake.',      maxSeats: 20,  filled: 12, status: 'OPEN',  trending: true,  prizePool: '₹50,000',     isFree: true },
  { id: 'e11', clubId: 'club_robotics', title: 'Robo Wars',             emoji: '🤖', category: 'Technical',   date: '2025-04-18', venue: 'Sports Ground',    description: 'Battle robots you build. Line followers, maze solvers, sumo bots.',           maxSeats: 50,  filled: 50, status: 'FULL',  trending: true,  isFree: true },
  { id: 'e12', clubId: 'club_cultural', title: 'Dance Battle League',   emoji: '💃', category: 'Cultural',    date: '2025-04-10', venue: 'Open Air Stage',   description: 'Solo and crew divisions. Hip-hop, freestyle, locking, breaking.',             maxSeats: 80,  filled: 25, status: 'SOON',  trending: false, isFree: true },
];
 
// ─── Dynamic data (resets on restart) ─────────────────────────────────────────
const registrations = []; // { id, eventId, name, email, status, createdAt }
const bookmarks     = []; // { email, eventId }
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
function findClub(id)     { return clubs.find(c => c.id === id); }
function findClubByKey(k) { return clubs.find(c => c.clubId === k.toUpperCase()); }
function findEvent(id)    { return events.find(e => e.id === id); }
 
function formatEvent(ev) {
  const club = findClub(ev.clubId);
  return {
    id:          ev.id,
    title:       ev.title,
    description: ev.description,
    emoji:       ev.emoji,
    category:    ev.category,
    date:        ev.date,
    venue:       ev.venue,
    maxSeats:    ev.maxSeats,
    filled:      ev.filled,
    seatsLeft:   Math.max(0, ev.maxSeats - ev.filled),
    status:      ev.filled >= ev.maxSeats ? 'FULL' : ev.status,
    trending:    ev.trending,
    prizePool:   ev.prizePool || null,
    isFree:      ev.isFree,
    club:        club ? { id: club.id, clubId: club.clubId, name: club.name, emoji: club.emoji } : null,
  };
}

function removeAllByEventId(collection, eventId) {
  for (let index = collection.length - 1; index >= 0; index -= 1) {
    if (collection[index].eventId === eventId) {
      collection.splice(index, 1);
    }
  }
}

function deleteEventData(eventId) {
  const eventIndex = events.findIndex(event => event.id === eventId);
  if (eventIndex === -1) {
    return false;
  }

  events.splice(eventIndex, 1);
  removeAllByEventId(registrations, eventId);
  removeAllByEventId(bookmarks, eventId);
  return true;
}
 
let _nextId = 100;
function newId() { return 'gen_' + (++_nextId); }
 
module.exports = {
  clubs,
  events,
  registrations,
  bookmarks,
  findClub,
  findClubByKey,
  findEvent,
  formatEvent,
  deleteEventData,
  newId,
};
