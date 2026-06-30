// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { findClubByKey } = require('../data/store');
 
// POST /api/auth/login
function login(req, res) {
  const { clubId, password } = req.body;
 
  if (!clubId || !password) {
    return res.status(400).json({ success: false, message: 'clubId and password are required.' });
  }
 
  const club = findClubByKey(clubId);
  if (!club || !bcrypt.compareSync(password, club.password)) {
    return res.status(401).json({ success: false, message: 'Invalid Club ID or password.' });
  }
 
  const token = jwt.sign(
    { clubId: club.id, clubIdentifier: club.clubId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
 
  res.json({
    success: true,
    message: `Welcome back, ${club.name}!`,
    data: {
      token,
      club: { id: club.id, clubId: club.clubId, name: club.name, emoji: club.emoji, category: club.category },
    },
  });
}
 
// GET /api/auth/me  (protected)
function me(req, res) {
  const { password, ...safe } = req.club;
  res.json({ success: true, data: { club: safe } });
}
 
module.exports = { login, me };