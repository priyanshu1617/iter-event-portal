// src/controllers/registrations.controller.js
const { registrations, findEvent, newId } = require('../data/store');
 
// POST /api/registrations
function register(req, res) {
  const { eventId, name, email } = req.body;
 
  if (!eventId || !name || !email) {
    return res.status(400).json({ success: false, message: 'eventId, name, and email are required.' });
  }
 
  const event = findEvent(eventId);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
 
  if (event.status === 'CANCELLED') {
    return res.status(400).json({ success: false, message: 'This event has been cancelled.' });
  }
 
  // Check duplicate
  const existing = registrations.find(
    r => r.eventId === eventId && r.email.toLowerCase() === email.toLowerCase() && r.status !== 'CANCELLED'
  );
  if (existing) {
    return res.status(409).json({
      success: false,
      message: `You're already registered for "${event.title}".`,
      data: { status: existing.status },
    });
  }
 
  const status = event.filled < event.maxSeats ? 'CONFIRMED' : 'WAITLISTED';
 
  const reg = {
    id:        newId(),
    eventId,
    name:      name.trim(),
    email:     email.toLowerCase().trim(),
    rollNumber: req.body.rollNumber || null,
    teamName:  req.body.teamName   || null,
    status,
    createdAt: new Date().toISOString(),
  };
 
  registrations.push(reg);
 
  // Update filled count
  if (status === 'CONFIRMED') {
    event.filled += 1;
    if (event.filled >= event.maxSeats) event.status = 'FULL';
  }
 
  res.status(201).json({
    success: true,
    message: status === 'CONFIRMED'
      ? `You're registered for "${event.title}"! 🎉`
      : `You're on the waitlist for "${event.title}".`,
    data: { registration: reg },
  });
}
 
// GET /api/registrations/check?email=&eventId=
function check(req, res) {
  const { email, eventId } = req.query;
  if (!email || !eventId) {
    return res.status(400).json({ success: false, message: 'email and eventId are required.' });
  }
 
  const reg = registrations.find(
    r => r.eventId === eventId && r.email === email.toLowerCase() && r.status !== 'CANCELLED'
  );
 
  res.json({ success: true, data: { registered: !!reg, status: reg?.status || null } });
}
 
// DELETE /api/registrations/:id  — body: { email }
function cancel(req, res) {
  const reg = registrations.find(r => r.id === req.params.id && r.email === req.body.email?.toLowerCase());
  if (!reg) return res.status(404).json({ success: false, message: 'Registration not found.' });
  if (reg.status === 'CANCELLED') {
    return res.status(400).json({ success: false, message: 'Already cancelled.' });
  }
 
  const event = findEvent(reg.eventId);
 
  if (reg.status === 'CONFIRMED' && event) {
    event.filled = Math.max(0, event.filled - 1);
    if (event.status === 'FULL') event.status = 'OPEN';
 
    // Promote first waitlisted person
    const waitlisted = registrations.find(r => r.eventId === reg.eventId && r.status === 'WAITLISTED');
    if (waitlisted) {
      waitlisted.status = 'CONFIRMED';
      event.filled += 1;
    }
  }
 
  reg.status = 'CANCELLED';
  const eventTitle = event?.title || 'the event';
  res.json({ success: true, message: `Registration for "${eventTitle}" cancelled.` });
}
 
// GET /api/registrations?eventId=  (protected — club sees their own event's list)
function getForEvent(req, res) {
  const { eventId } = req.query;
  if (!eventId) return res.status(400).json({ success: false, message: 'eventId required.' });
 
  const event = findEvent(eventId);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
  if (event.clubId !== req.club.id) {
    return res.status(403).json({ success: false, message: "You can only view your own club's registrations." });
  }
 
  const list = registrations.filter(r => r.eventId === eventId);
  res.json({ success: true, data: { registrations: list, total: list.length } });
}
 
module.exports = { register, check, cancel, getForEvent };