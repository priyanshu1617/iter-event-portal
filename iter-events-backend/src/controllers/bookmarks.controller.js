// src/controllers/bookmarks.controller.js
const { bookmarks, findEvent, formatEvent } = require('../data/store');
 
// GET /api/bookmarks?email=
function getBookmarks(req, res) {
  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, message: 'email required.' });
 
  const userBookmarks = bookmarks
    .filter(b => b.email === email.toLowerCase())
    .map(b => {
      const event = findEvent(b.eventId);
      return event ? { eventId: b.eventId, event: formatEvent(event) } : null;
    })
    .filter(Boolean);
 
  res.json({ success: true, data: { bookmarks: userBookmarks } });
}
 
// POST /api/bookmarks/toggle  — body: { email, eventId }
function toggle(req, res) {
  const { email, eventId } = req.body;
  if (!email || !eventId) {
    return res.status(400).json({ success: false, message: 'email and eventId required.' });
  }
 
  if (!findEvent(eventId)) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }
 
  const key = email.toLowerCase();
  const idx = bookmarks.findIndex(b => b.email === key && b.eventId === eventId);
 
  if (idx !== -1) {
    bookmarks.splice(idx, 1);
    return res.json({ success: true, data: { bookmarked: false }, message: 'Bookmark removed.' });
  }
 
  bookmarks.push({ email: key, eventId });
  res.json({ success: true, data: { bookmarked: true }, message: 'Event bookmarked!' });
}
 
module.exports = { getBookmarks, toggle };