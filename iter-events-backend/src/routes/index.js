// src/routes/index.js
const router = require('express').Router();
const { requireAuth, requireOwnership } = require('../middleware/auth');
 
const auth   = require('../controllers/auth.controller');
const events = require('../controllers/events.controller');
const clubs  = require('../controllers/clubs.controller');
const regs   = require('../controllers/registrations.controller');
const bmarks = require('../controllers/bookmarks.controller');
 
// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post('/auth/login', auth.login);
router.get ('/auth/me',    requireAuth, auth.me);
 
// ─── Events ───────────────────────────────────────────────────────────────────
router.get   ('/events',              events.getEvents);
router.get   ('/events/:eventId',     events.getEvent);
router.post  ('/events',              requireAuth, events.createEvent);
router.patch ('/events/:eventId',     requireAuth, requireOwnership, events.updateEvent);
router.delete('/events/:eventId',     requireAuth, requireOwnership, events.deleteEvent);
 
// ─── Clubs ────────────────────────────────────────────────────────────────────
router.get('/clubs',                  clubs.getClubs);
router.get('/clubs/me/events',        requireAuth, clubs.getMyEvents);  // before /:clubId
router.get('/clubs/:clubId/events',   clubs.getClubEvents);
 
// ─── Registrations ────────────────────────────────────────────────────────────
router.post  ('/registrations',       regs.register);
router.get   ('/registrations/check', regs.check);
router.get   ('/registrations',       requireAuth, regs.getForEvent);
router.delete('/registrations/:id',   regs.cancel);
 
// ─── Bookmarks ────────────────────────────────────────────────────────────────
router.get ('/bookmarks',         bmarks.getBookmarks);
router.post('/bookmarks/toggle',  bmarks.toggle);
 
module.exports = router;