// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { findClub } = require('../data/store');
 
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }
 
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const club = findClub(decoded.clubId);
    if (!club) return res.status(401).json({ success: false, message: 'Club not found.' });
    req.club = club;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}
 
// After requireAuth — ensure the club owns the event they're trying to modify
function requireOwnership(req, res, next) {
  const { events, findEvent } = require('../data/store');
  const event = findEvent(req.params.eventId);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
  if (event.clubId !== req.club.id) {
    return res.status(403).json({ success: false, message: "You can only modify your own club's events." });
  }
  req.event = event;
  next();
}
 
module.exports = { requireAuth, requireOwnership };