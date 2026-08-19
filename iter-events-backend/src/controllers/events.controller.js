// src/controllers/events.controller.js
const { events, findEvent, formatEvent, deleteEventData, newId } = require('../data/store');
 
// GET /api/events?category=&search=&sort=&status=
/**
 * Fetches a list of all events, applying optional query filters.
 * Supports filtering by category, status, search string, and sorting.
 * @param {import('express').Request} req - The Express request object containing query parameters.
 * @param {import('express').Response} res - The Express response object.
 */
function getEvents(req, res) {
  const { category, search, sort = 'date', status } = req.query;
 
  let result = [...events];
 
  if (category && category !== 'all') {
    result = result.filter(e => e.category.toLowerCase() === category.toLowerCase());
  }
  if (status && status !== 'all') {
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
/**
 * Fetches details for a single specific event by its ID.
 * @param {import('express').Request} req - The Express request object with eventId param.
 * @param {import('express').Response} res - The Express response object.
 */
function getEvent(req, res) {
  const event = findEvent(req.params.eventId);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
  res.json({ success: true, data: { event: formatEvent(event) } });
}
 
// POST /api/events  (protected)
/**
 * Creates a new event for the currently authenticated club.
 * Validates required fields and inserts the new event into the store.
 * @param {import('express').Request} req - The Express request object with event body and req.club.
 * @param {import('express').Response} res - The Express response object.
 */
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
/**
 * Updates an existing event. Protected by ownership middleware.
 * Only allows modification of specific fields to prevent data corruption.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
function updateEvent(req, res) {
  const event = req.event; // set by requireOwnership middleware
  const allowed = ['title','description','emoji','category','date','venue','maxSeats','status','trending','prizePool','isFree'];
 
  for (const key of allowed) {
    if (req.body[key] !== undefined) event[key] = req.body[key];
  }
 
  res.json({ success: true, message: 'Event updated.', data: { event: formatEvent(event) } });
}
 
// DELETE /api/events/:eventId  (protected + ownership)
/**
 * Deletes an event and all its associated data (registrations, bookmarks).
 * Protected by ownership middleware.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
function deleteEvent(req, res) {
  deleteEventData(req.params.eventId);
  res.json({ success: true, message: 'Event removed.' });
}
 
module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent };
