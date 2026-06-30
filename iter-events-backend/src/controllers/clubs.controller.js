// src/controllers/clubs.controller.js
const { clubs, events, formatEvent } = require('../data/store');
 
// GET /api/clubs
function getClubs(req, res) {
  const result = clubs.map(({ password, ...c }) => ({
    ...c,
    eventCount: events.filter(e => e.clubId === c.id).length,
  }));
  res.json({ success: true, data: { clubs: result } });
}
 
// GET /api/clubs/:clubId/events
function getClubEvents(req, res) {
  const club = clubs.find(c => c.clubId === req.params.clubId.toUpperCase());
  if (!club) return res.status(404).json({ success: false, message: 'Club not found.' });
 
  const { password, ...safeClub } = club;
  const clubEvents = events.filter(e => e.clubId === club.id).map(formatEvent);
 
  res.json({ success: true, data: { club: safeClub, events: clubEvents } });
}
 
// GET /api/clubs/me/events  (protected)
function getMyEvents(req, res) {
  const myEvents = events.filter(e => e.clubId === req.club.id).map(formatEvent);
  res.json({ success: true, data: { events: myEvents } });
}
 
module.exports = { getClubs, getClubEvents, getMyEvents };