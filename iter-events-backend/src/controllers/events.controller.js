// src/controllers/events.controller.js
const { events, findEvent, formatEvent, deleteEventData, newId } = require('../data/store');
 
// GET /api/events?category=&search=&sort=&status=
function getEvents(req, res) {
  const { category, search, sort = 'date', status } = req.query;
 
  let result = [...events];
 
  if (category && category !== 'all') {
    result = result.filter(e => e.category.toLowerCase() === category.toLowerCase());
  }
  if (status) {
    result = result.filter(e => e.status.toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q)
    );
  }
 
  if (sort === 'trending') result.sort((a, b) => b.trending - a.trending);
  else if (sort === 'seats') result.sort((a, b) => (a.maxSeats - a.filled) - (b.maxSeats - b.filled));
  else result.sort((a, b) => new Date(a.date) - new Date(b.date));
 
  res.json({ success: true, data: { events: result.map(formatEvent), total: result.length } });
}
 
// GET /api/events/:eventId
function getEvent(req, res) {
  const event = findEvent(req.params.eventId);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
  res.json({ success: true, data: { event: formatEvent(event) } });
}
 
// POST /api/events  (protected)
function createEvent(req, res) {
  const { title, description, emoji, category, date, venue, maxSeats, prizePool, isFree } = req.body;
 
  if (!title || !category || !date || !venue) {
    return res.status(400).json({ success: false, message: 'title, category, date, and venue are required.' });
  }
 
  const event = {
    id:          newId(),
    clubId:      req.club.id,
    title,
    description: description || '',
    emoji:       emoji || '🎉',
    category,
    date,
    venue,
    maxSeats:    Number(maxSeats) || 100,
    filled:      0,
    status:      'OPEN',
    trending:    false,
    prizePool:   prizePool || null,
    isFree:      isFree !== false,
  };
 
  events.unshift(event); // add to front so it shows up first
 
  res.status(201).json({
    success: true,
    message: `"${event.title}" is now LIVE on ITER Events! 🚀`,
    data: { event: formatEvent(event) },
  });
}
 
// PATCH /api/events/:eventId  (protected + ownership)
function updateEvent(req, res) {
  const event = req.event; // set by requireOwnership middleware
  const allowed = ['title','description','emoji','category','date','venue','maxSeats','status','trending','prizePool','isFree'];
 
  for (const key of allowed) {
    if (req.body[key] !== undefined) event[key] = req.body[key];
  }
 
  res.json({ success: true, message: 'Event updated.', data: { event: formatEvent(event) } });
}
 
// DELETE /api/events/:eventId  (protected + ownership)
function deleteEvent(req, res) {
  deleteEventData(req.params.eventId);
  res.json({ success: true, message: 'Event removed.' });
}
 
module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent };
