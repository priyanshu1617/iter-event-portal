require('dotenv').config();

const assert = require('node:assert/strict');

const { startServer } = require('../src/app');
const store = require('../src/data/store');

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function run() {
  const server = startServer(0);

  try {
    await new Promise((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });

    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;
    const smokeEmail = 'smoke@test.dev';

    const health = await request(baseUrl, '/health');
    assert.equal(health.status, 'ok');

    const eventListing = await request(baseUrl, '/api/events');
    assert.ok(Array.isArray(eventListing.data.events));
    assert.ok(eventListing.data.events.length > 0);

    const login = await request(baseUrl, '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clubId: 'ITER_CSE_TECH', password: 'demo123' }),
    });
    assert.equal(login.success, true);

    const token = login.data.token;
    const title = `Smoke Test Event ${Date.now()}`;

    const created = await request(baseUrl, '/api/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description: 'Temporary event created by database smoke test.',
        category: 'Technical',
        date: '2026-04-30',
        venue: 'Smoke Test Lab',
        maxSeats: 10,
        emoji: '🧪',
      }),
    });
    const eventId = created.data.event.id;
    assert.equal(typeof eventId, 'string');
    assert.ok(store.findEvent(eventId));

    const registration = await request(baseUrl, '/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId,
        name: 'Smoke Tester',
        email: smokeEmail,
        rollNumber: 'ITER001',
        teamName: 'Codex QA',
      }),
    });
    assert.equal(registration.data.registration.status, 'CONFIRMED');
    assert.equal(
      store.registrations.some(entry => entry.eventId === eventId && entry.email === smokeEmail),
      true,
    );

    const check = await request(
      baseUrl,
      `/api/registrations/check?email=${encodeURIComponent(smokeEmail)}&eventId=${eventId}`,
    );
    assert.equal(check.data.registered, true);
    assert.equal(check.data.status, 'CONFIRMED');

    const bookmark = await request(baseUrl, '/api/bookmarks/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: smokeEmail, eventId }),
    });
    assert.equal(bookmark.data.bookmarked, true);
    assert.equal(
      store.bookmarks.some(entry => entry.eventId === eventId && entry.email === smokeEmail),
      true,
    );

    const deleted = await request(baseUrl, `/api/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    assert.equal(deleted.success, true);
    assert.equal(store.findEvent(eventId), undefined);
    assert.equal(store.registrations.some(entry => entry.eventId === eventId), false);
    assert.equal(store.bookmarks.some(entry => entry.eventId === eventId), false);

    console.log('Database smoke test passed.');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
