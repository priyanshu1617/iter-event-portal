'use client';

import { useEffect, useState } from 'react';
import { backendApi, type ClubSummary, type CreateEventInput, type EventRecord } from '@/lib/backend-client';

const CBGMAP: Record<string, string> = {
  'CSE Tech Club': 'linear-gradient(to top, #0c0618 0%, rgba(12,6,24,0.1) 100%), url("https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop") center/cover no-repeat',
  'Robotics Club': 'linear-gradient(to top, #0c0618 0%, rgba(12,6,24,0.1) 100%), url("https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop") center/cover no-repeat',
  'Music Society': 'linear-gradient(to top, #0c0618 0%, rgba(12,6,24,0.1) 100%), url("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop") center/cover no-repeat',
  'Cultural Committee': 'linear-gradient(to top, #0c0618 0%, rgba(12,6,24,0.1) 100%), url("https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop") center/cover no-repeat',
  'Photography Club': 'linear-gradient(to top, #0c0618 0%, rgba(12,6,24,0.1) 100%), url("https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop") center/cover no-repeat',
  'Gaming Club': 'linear-gradient(to top, #0c0618 0%, rgba(12,6,24,0.1) 100%), url("/valorant.jpg") center/cover no-repeat',
  'E-Cell ITER': 'linear-gradient(to top, #0c0618 0%, rgba(12,6,24,0.1) 100%), url("https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop") center/cover no-repeat',
  'GDG Cloud BBSR': 'linear-gradient(to top, #0c0618 0%, rgba(12,6,24,0.1) 100%), url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop") center/cover no-repeat',
  'GeeksforGeeks ITER': 'linear-gradient(to top, #0c0618 0%, rgba(12,6,24,0.1) 100%), url("https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop") center/cover no-repeat',
  'IEEE ITER': 'linear-gradient(to top, #0c0618 0%, rgba(12,6,24,0.1) 100%), url("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop") center/cover no-repeat'
};

const CAROUSEL_SLIDES = [
  {bg:'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%), url("https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1740&auto=format&fit=crop") center/cover no-repeat',emoji:'💻',bc:'rgba(255,77,28,.14)',bbc:'rgba(255,77,28,.28)',bcc:'var(--acc2)',bt:'Live Registration',club:'CSE Tech Club',title:'HackITER<br>2025',desc:'36-hour national hackathon with ₹1,00,000 prize pool.',meta:'📅 Mar 15–16 · 📍 Main Auditorium · 🏆 ₹1L Prize',seats:'47',sl:'Seats',btn:'Register Now →'},
  {bg:'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%), url("https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1740&auto=format&fit=crop") center/cover no-repeat',emoji:'🎭',bc:'rgba(168,85,247,.13)',bbc:'rgba(168,85,247,.26)',bcc:'var(--violet)',bt:'Upcoming',club:'Cultural Committee',title:'Rhythm<br>Fiesta',desc:'Annual cultural night — dance, drama, live music & fashion showcase.',meta:'📅 Mar 22 · 📍 Open Ground · 🎟️ Free Entry',seats:'320',sl:'Seats',btn:'Reserve Spot →'},
  {bg:'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%), url("https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1740&auto=format&fit=crop") center/cover no-repeat',emoji:'🤖',bc:'rgba(34,212,107,.1)',bbc:'rgba(34,212,107,.24)',bcc:'var(--green)',bt:'Workshop',club:'Robotics Club',title:'AI & ML<br>Workshop',desc:'Hands-on PyTorch & Keras. Certificate of completion.',meta:'📅 Mar 18 · 📍 Lab 301 · 📜 Certificate',seats:'18',sl:'Seats',btn:'Enroll Now →'},
  {bg:'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%), url("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1740&auto=format&fit=crop") center/cover no-repeat',emoji:'🎸',bc:'rgba(255,77,28,.13)',bbc:'rgba(255,77,28,.26)',bcc:'var(--acc2)',bt:'Auditions Open',club:'Music Society',title:'Strings &<br>Beats',desc:'Open mic for singing, beatboxing, guitar & poetry.',meta:'📅 Mar 20 · 📍 Seminar Hall · 🎵 All Welcome',seats:'90',sl:'Slots',btn:'Sign Up →'},
  {bg:'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%), url("https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1638&auto=format&fit=crop") center/cover no-repeat',emoji:'📸',bc:'rgba(251,191,36,.1)',bbc:'rgba(251,191,36,.22)',bcc:'#fbbf24',bt:'Competition',club:'Photography Club',title:'SnapITER<br>PhotoWalk',desc:'Capture the soul of ITER campus. Top 10 in annual magazine.',meta:'📅 Mar 25 · 📍 Campus Wide · 📖 Magazine',seats:'200',sl:'Spots',btn:'Join Walk →'},
  {bg:'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%), url("/valorant.jpg") center/cover no-repeat',emoji:'🏆',bc:'rgba(168,85,247,.12)',bbc:'rgba(168,85,247,.24)',bcc:'var(--violet)',bt:'Tournament',club:'Gaming Club',title:'VALORANT<br>Clash',desc:'5v5 esports. Form your squad, compete for ₹25,000.',meta:'📅 Mar 28–29 · 📍 Computer Lab · 🎮 ₹25k',seats:'8',sl:'Teams',btn:'Register Team →'},
];

function pad(n: number) { return String(Math.max(0, n)).padStart(2, '0'); }
function fmtDate(d: string) { return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); }
function seatColor(s: number, f: number) { const p = f / s; return p >= 1 ? '#f43f5e' : p >= .7 ? 'var(--acc)' : 'var(--green)'; }

export default function Home() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [clubs, setClubs] = useState<ClubSummary[]>([]);
  const [clubSession, setClubSession] = useState<ClubSummary | null>(null);
  const [authToken, setAuthToken] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date');
  const [notifOn, setNotifOn] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  // Carousel
  const [carIdx, setCarIdx] = useState(0);

  // Modal states
  const [adminOpen, setAdminOpen] = useState(false);
  const [cevOpen, setCevOpen] = useState(false);
  const [activeClubId, setActiveClubId] = useState<string | null>(null);

  // Forms
  const [clubIdInput, setClubIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('demo123');
  const [toastMsg, setToastMsg] = useState<{ title: string, msg: string, ico: string } | null>(null);

  const [eventDraft, setEventDraft] = useState({
    title: '', club: '', date: '', time: '', venue: '', cat: 'Technical', seats: '200', desc: ''
  });

  // Refs

  useEffect(() => {
    async function load() {
      const eRes = await backendApi.getEvents({ status: 'all' });
      const cRes = await backendApi.getClubs();
      setEvents(eRes.data.events);
      setClubs(cRes.data.clubs);
      const bms = JSON.parse(localStorage.getItem('iter_bm') || '[]');
      setBookmarks(new Set(bms));

      const t = localStorage.getItem('iter-events-token');
      if (t) {
        setAuthToken(t);
        try {
          const m = await backendApi.me(t);
          setClubSession(m.data.club);
        } catch {
          localStorage.removeItem('iter-events-token');
        }
      }
    }
    load();
  }, []);

  // Toast
  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 3800);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  // Carousel auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCarIdx(prev => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  // Keyboard Animation & Scroll Reveal
  useEffect(() => {
    const KBS = [{t:'type',s:'post-event --login',sp:60},{t:'enter',d:350},{t:'out',ls:[{tx:'● Authenticating...',cl:'t-dim',d:100},{tx:'✓ Logged in as CSE_TECH_CLUB',cl:'t-ok',d:450},{tx:'→ Type "help" for commands',cl:'t-dim',d:680}]},{t:'clear',d:800},{t:'type',s:'create-event',sp:66},{t:'enter',d:320},{t:'out',ls:[{tx:'→ Enter event details:',cl:'t-info',d:80}]},{t:'clear',d:600},{t:'type',s:'title: "HackITER 2025"',sp:54},{t:'enter',d:280},{t:'out',ls:[{tx:'✓ Title set',cl:'t-ok',d:100},{tx:'✓ Date: Mar 15–16',cl:'t-ok',d:340},{tx:'✓ Venue: Main Auditorium',cl:'t-ok',d:570}]},{t:'clear',d:900},{t:'type',s:'publish --notify-all',sp:60},{t:'enter',d:400},{t:'out',ls:[{tx:'⠿ Publishing...',cl:'t-dim',d:80},{tx:'📢 Notifying 5,200+ students',cl:'t-info',d:500},{tx:'✅ LIVE on ITER Portal!',cl:'t-ok',d:940}]}];
    let kbReady = false;
    let kbActive = true;

    // Scroll reveal
    const ro = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('vis');
          ro.unobserve(e.target);
        }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -28px 0px' });
    document.querySelectorAll('.sr, .metric').forEach(el => ro.observe(el));

    // Keyboard trigger
    const kObs = new IntersectionObserver(([e]) => {
      if(e.isIntersecting && !kbReady) {
        kbReady = true;
        runKb();
      }
    }, { threshold: 0.2 });
    const howSec = document.getElementById('how-sec');
    if (howSec) kObs.observe(howSec);

    function litKey(ch: string){
      document.querySelectorAll('.kb-keys .key').forEach((k: any) => {
        if(k.dataset.k && k.dataset.k.toLowerCase() === ch.toLowerCase()){
          k.classList.add('lit');
          setTimeout(() => k.classList.remove('lit'), 140);
        }
      });
    }

    async function runKb() {
      const txt = document.getElementById('tTxt');
      const out = document.getElementById('tOut');
      if(!txt || !out) return;
      const sl = (ms: number) => new Promise(r => setTimeout(r, ms));
      
      async function typeStr(s: string, sp: number) {
        for(const c of s) {
          if(!kbActive) return;
          txt!.textContent += c;
          litKey(c);
          await sl(sp + Math.random() * 14);
        }
      }
      function addLine(tx: string, cl: string, d: number) {
        return new Promise(r => setTimeout(() => {
          if(!kbActive) return r(null);
          const l = document.createElement('div');
          l.className = 't-line ' + cl;
          l.textContent = tx;
          out!.appendChild(l);
          requestAnimationFrame(() => l.classList.add('on'));
          r(null);
        }, d));
      }
      
      while(kbActive) {
        for(const s of KBS) {
          if(!kbActive) break;
          if(s.t === 'type') await typeStr(s.s as string, s.sp as number);
          else if(s.t === 'enter') { litKey('Enter'); await sl(s.d as number); }
          else if(s.t === 'out') { await Promise.all((s.ls as any[]).map(l => addLine(l.tx, l.cl, l.d))); await sl(1000); }
          else if(s.t === 'clear') { await sl(s.d as number); txt!.textContent = ''; out!.innerHTML = ''; await sl(230); }
        }
        if(kbActive) { txt!.textContent = ''; out!.innerHTML = ''; await sl(1400); }
      }
    }

    // Manual key clicks
    const keyNodes = document.querySelectorAll('.kb-keys .key');
    const keyHandler = (e: Event) => {
      const k = e.currentTarget as HTMLElement;
      k.classList.add('lit');
      setTimeout(() => k.classList.remove('lit'), 180);
    };
    keyNodes.forEach(k => k.addEventListener('click', keyHandler));

    // Steps interval
    let si = 0;
    const stepInterval = setInterval(() => {
      document.querySelectorAll('.kb-step').forEach(s => s.classList.remove('on'));
      const ss = document.querySelectorAll('.kb-step');
      if(ss[si % ss.length]) ss[si % ss.length].classList.add('on');
      si++;
    }, 2600);

    return () => {
      kbActive = false;
      ro.disconnect();
      kObs.disconnect();
      keyNodes.forEach(k => k.removeEventListener('click', keyHandler));
      clearInterval(stepInterval);
    };
  }, []);

  // YouTube logic
  useEffect(() => {
    if (!document.getElementById('yt-script')) {
      const t = document.createElement('script');
      t.id = 'yt-script';
      t.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(t);
    }
    
    (window as any).onYouTubeIframeAPIReady = () => {
      new (window as any).YT.Player('ytPlayer', {
        events: {
          onReady: (e: any) => { e.target.mute(); e.target.playVideo(); },
          onStateChange: (e: any) => { 
            if ([0, 2, -1].includes(e.data)) setTimeout(() => e.target.playVideo(), 200); 
          }
        }
      });
    };
  }, []);


  function showToast(title: string, msg: string, ico = '📢') {
    setToastMsg({ title, msg, ico });
  }

  function toggleBm(id: string) {
    const next = new Set(bookmarks);
    if (next.has(id)) { next.delete(id); showToast('Removed', 'Bookmark removed', '🔖'); }
    else { next.add(id); showToast('Bookmarked!', 'Saved to your list', '🔖'); }
    setBookmarks(next);
    localStorage.setItem('iter_bm', JSON.stringify([...next]));
  }

  async function handleLogin() {
    if (!clubIdInput || !passwordInput) return showToast('Missing', 'Fill Club ID and Password', '⚠️');
    try {
      const res = await backendApi.login(clubIdInput.trim(), passwordInput);
      setClubSession(res.data.club);
      setAuthToken(res.data.token);
      localStorage.setItem('iter-events-token', res.data.token);
      showToast('Logged in!', 'Welcome, ' + res.data.club.id, '✅');
      setAdminOpen(false);
    } catch {
      showToast('Invalid', 'Check your credentials', '❌');
    }
  }

  async function handlePublish() {
    if (!eventDraft.title || !eventDraft.date) return showToast('Incomplete', 'Title and Date required', '⚠️');
    try {
      const payload: CreateEventInput = {
        title: eventDraft.title,
        description: eventDraft.desc,
        category: eventDraft.cat,
        date: eventDraft.date,
        venue: eventDraft.venue,
        maxSeats: parseInt(eventDraft.seats) || 100,
        emoji: '🎉'
      };
      await backendApi.createEvent(payload, authToken);
      const eRes = await backendApi.getEvents({ status: 'all' });
      setEvents(eRes.data.events);
      setAdminOpen(false);
      showToast('Published! 🚀', `"${eventDraft.title}" is now LIVE`, '✅');
    } catch (e: any) {
      showToast('Error', e.message || 'Failed to publish', '❌');
    }
  }

  const filteredEvents = events.filter(e => {
    if (activeCat !== 'all' && e.category !== activeCat) return false;
    if (search && !(e.title + e.club?.name + e.category + e.description + e.venue).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sort === 'date') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sort === 'seats') return (a.maxSeats - a.filled) - (b.maxSeats - b.filled);
    if (sort === 'trending') return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
    return 0;
  });

  const activeClub = clubs.find(c => c.id === activeClubId);
  const activeClubEvents = events.filter(e => e.club?.id === activeClubId);

  return (
    <div className="min-h-screen">
      {/* NAV */}
      <nav id="nav">
        <a href="#hero" className="logo">
          <div className="logo-mark">IE</div>
          <span className="logo-txt">ITER <em>Events</em></span>
        </a>
        <div className="nav-links">
          <a href="#events-sec">Events</a><a href="#clubs">Clubs</a><a href="#upcoming">Upcoming</a><a href="#vid-sec">Watch</a>
        </div>
        <div className="nav-r">
          <div className="live-badge"><span className="live-dot"></span>LIVE</div>
          {clubSession ? (
             <button className="btn-admin" onClick={() => setAdminOpen(true)}>Post Event</button>
          ) : (
             <button className="btn-admin" onClick={() => setAdminOpen(true)}>Club Admin</button>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid"></div>
        <div className="hero-fade"></div>
        <div className="hero-inner">
          <div>
            <div className="hero-pill">⚡ Live — ITER Campus, Bhubaneswar</div>
            <h1>
              <span className="l1">Your Campus,</span>
              <span className="l2">Every Event,</span>
              <span className="l3">One Place.</span>
            </h1>
            <p className="hero-p">Stay plugged into every event across ITER. Tech fests, cultural nights, hackathons, workshops — all in one place. Built by students, for students.</p>
            <div className="hero-btns">
              <a href="#events-sec" className="btn-pri">Explore Events →</a>
              <button className="btn-ghost" onClick={() => setAdminOpen(true)}>🔐 Club Login</button>
            </div>
            <div className="hero-stats">
              <div className="h-stat"><div className="hs-n">25<span className="a">+</span></div><div className="hs-l">Clubs</div></div>
              <div className="h-stat"><div className="hs-n">80<span className="a">+</span></div><div className="hs-l">Events/Sem</div></div>
              <div className="h-stat"><div className="hs-n">5k<span className="a">+</span></div><div className="hs-l">Students</div></div>
              <div className="h-stat"><div className="hs-n">3.8k<span className="a">+</span></div><div className="hs-l">Registered</div></div>
            </div>
          </div>
        </div>
      </section>

      <div className="mq">
        <div className="mq-track">
           {[...Array(24)].map((_, i) => (
             <span key={i} className="mq-item"><span className="mq-dot"></span>HackITER 2025</span>
           ))}
        </div>
      </div>

      {/* CAROUSEL */}
      <div id="carousel-sec">
        <div className="car-header">
          <div className="tag or sr" style={{ display: 'inline-flex' }}>🎆 Live Now</div>
          <h2 className="sec-h sr" data-d="1">What&apos;s Happening <span className="a">Now</span></h2>
          <p className="sec-p sr" data-d="2" style={{ margin: '0 auto', maxWidth: '320px', fontSize: '13px' }}>Auto-advances every 4s. Swipe on mobile.</p>
        </div>
        <div className="car-wrap">
          <div className="car-track" id="carTrack" style={{ transform: `translateX(-${carIdx * 100}%)` }}>
            {CAROUSEL_SLIDES.map((s, i) => (
              <div key={i} className="car-slide" style={{ flexShrink: 0 }}>
                <div className="cs-bg" style={{ background: s.bg }}></div>
                <div className="cs-fog"></div>
                <div className="cs-emoji">{s.emoji}</div>
                <div className="cs-body">
                  <div className="cs-badge" style={{ background: s.bc, border: `1px solid ${s.bbc}`, color: s.bcc }}>{s.bt}</div>
                  <div className="cs-club">{s.club}</div>
                  <div className="cs-title" dangerouslySetInnerHTML={{ __html: s.title }}></div>
                  <div className="cs-desc">{s.desc}</div>
                  <div className="cs-meta">{s.meta}</div>
                  <div className="cs-actions">
                    <button className="btn-pri" style={{ fontSize: '12px', padding: '9px 18px' }} onClick={() => window.open('https://iter.ac.in','_blank')}>{s.btn}</button>
                    <div className="cs-seats">{s.sl}: <strong>{s.seats}</strong> left</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="car-nav">
            <div className="car-dots" id="carDots">
              {CAROUSEL_SLIDES.map((_, i) => (
                <div key={i} className={`car-dot ${i === carIdx ? 'on' : ''}`} onClick={() => setCarIdx(i)}></div>
              ))}
            </div>
            <div className="car-prog-wrap">
               {/* Resetting animation per slide change using a unique key */}
               <div key={carIdx} className="car-prog" id="carProg" style={{ animation: 'carProgFill 4.2s linear forwards' }}></div>
            </div>
            <div className="car-count" id="carCount">{carIdx + 1}/{CAROUSEL_SLIDES.length}</div>
            <div className="car-arrows">
              <button className="car-arr" onClick={() => setCarIdx(prev => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)}>←</button>
              <button className="car-arr" onClick={() => setCarIdx(prev => (prev + 1) % CAROUSEL_SLIDES.length)}>→</button>
            </div>
          </div>
        </div>
      </div>

      {/* EVENTS */}
      <section id="events-sec" className="sec">
        <div className="wrap">
          <div className="sec-center">
            <div className="tag or sr" style={{ display: 'inline-flex' }}>🎆 All Events</div>
            <h2 className="sec-h sr" data-d="1">Browse &amp; <span className="a">Discover</span></h2>
            <p className="sec-p sr" data-d="2">Search, filter, and register for events across all ITER clubs.</p>
          </div>
          <div className="filter-bar sr" data-d="3">
            <div className="search-wrap">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" id="evSearch" placeholder="Search events, clubs, topics…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="filter-pills">
              {['all', 'Technical', 'Cultural', 'Workshop', 'Esports', 'Arts', 'Competition'].map(cat => (
                <button key={cat} className={`fp ${activeCat === cat ? 'active' : ''}`} onClick={() => setActiveCat(cat)}>{cat}</button>
              ))}
            </div>
            <div className="filter-r">
              <select className="sort-sel" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="date">Soonest</option>
                <option value="seats">Seats Left</option>
                <option value="trending">Trending</option>
              </select>
              <button className={`notif-btn ${notifOn ? 'on' : ''}`} onClick={() => { setNotifOn(!notifOn); showToast(notifOn ? 'Notifications OFF' : 'Notifications ON', notifOn ? 'Alerts disabled' : 'You will get alerts for new events', notifOn ? '🔕' : '🔔') }}>
                <span>🔔</span>
                <div className="notif-pill"><div className="notif-knob"></div></div>
                <span>Notify me</span>
              </button>
              <span className="ev-count">{filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          <div className="ev-grid">
            {filteredEvents.length === 0 ? (
               <div className="no-ev"><div className="no-ev-ico">🔍</div><p>No events found</p><small>Try a different search or filter</small></div>
            ) : filteredEvents.map(ev => {
              const left = Math.max(0, ev.maxSeats - ev.filled);
              const pct = Math.round(ev.filled / ev.maxSeats * 100);
              const bm = bookmarks.has(ev.id);
              const filling = ev.status === 'LIVE' && pct >= 65 && pct < 100;
              return (
                <div key={ev.id} className={`ev-card ${bm ? 'bm' : ''}`}>
                  <div className="ev-img" style={{ background: CBGMAP[ev.club?.name || ''] || 'linear-gradient(135deg,#1c0d30,#0c0618)' }}>
                    <div className={`ev-status ${ev.status.toLowerCase()}`}>{ev.status}</div>
                    <div className="ev-badges">{ev.trending && <span className="badge-trend">🔥 Trending</span>}</div>
                    <button className={`bm-btn ${bm ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); toggleBm(ev.id); }}>🔖</button>
                  </div>
                  <div className="ev-body">
                    <div className="ev-club">{ev.club?.name}</div>
                    <div className="ev-title">{ev.title}</div>
                    <div className="ev-desc">{ev.description}</div>
                    <div className="ev-meta"><span>📅 {fmtDate(ev.date)}</span><span>📍 {ev.venue}</span></div>
                    <div className="attendees">
                      <span className="attend-lbl">{ev.filled} attending</span>
                      {filling && <span className="filling-tag">🔥 Filling fast</span>}
                    </div>
                    <div className="seats-wrap">
                      <div className="seats-row"><span>Seats</span><span className="seats-val" style={{ color: seatColor(ev.maxSeats, ev.filled) }}>{left} left</span></div>
                      <div className="seats-bar"><div className="seats-fill" style={{ width: `${pct}%`, background: seatColor(ev.maxSeats, ev.filled) }}></div></div>
                    </div>
                  </div>
                  <div className="ev-foot">
                    <span className="ev-cat-lbl">{ev.category}</span>
                    <button className="ev-btn" onClick={(e) => { e.stopPropagation(); showToast('Registered!', 'You are in for "' + ev.title + '"', '✅') }}>
                      {ev.status === 'FULL' ? 'Waitlist' : 'Register'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HIGHLIGHTED EVENTS / UPCOMING */}
      <section id="upcoming" className="sec">
        <div className="wrap">
          <div className="sec-center">
            <div className="tag or sr" style={{ display: 'inline-flex' }}>Don&apos;t Miss</div>
            <h2 className="sec-h sr" data-d="1">Highlighted <span className="a">Events</span></h2>
            <p className="sec-p sr" data-d="2">Hand-picked highlights from across all ITER clubs.</p>
          </div>
          <div className="hl-grid">
            <div className="hl-big sr fl" onClick={() => window.open('https://iter.ac.in','_blank')}>
              <div className="hl-bg"><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#0c1d38,#060c18)' }}></div><div className="hl-grid-lines"></div><div className="hl-bg-grad"></div></div>
              <div className="hl-big-emoji">💻</div>
              <div className="hl-badge"><span className="hlb-n" id="hlSeats">47</span><span className="hlb-l">Seats Left</span></div>
              <div className="hl-content">
                <div className="hl-live-pill"><span className="hl-dot"></span>Live Registration</div>
                <div className="hl-club">CSE Tech Club</div>
                <div className="hl-title">HackITER<br/>2025</div>
                <div className="hl-desc">36-hour national hackathon. Build what&apos;s next — AI, Web3, embedded systems.</div>
                <div className="cd"><div className="cdu"><span className="cdu-n" id="cdD">00</span><span className="cdu-l">Days</span></div><div className="cdu"><span className="cdu-n" id="cdH">00</span><span className="cdu-l">Hrs</span></div><div className="cdu"><span className="cdu-n" id="cdM">00</span><span className="cdu-l">Min</span></div><div className="cdu"><span className="cdu-n" id="cdS">00</span><span className="cdu-l">Sec</span></div></div>
                <div className="hl-meta"><span>📅 Mar 15–16, 2025</span><span>📍 Main Auditorium</span><span>👥 Teams 2–4</span></div>
                <div className="hl-ctas">
                  <button className="btn-pri" style={{ fontSize: '12px', padding: '8px 15px' }} onClick={(e) => { e.stopPropagation(); window.open('https://iter.ac.in','_blank'); }}>Register Now →</button>
                  <div className="hl-prize">🏆 ₹1,00,000 Prize Pool</div>
                </div>
              </div>
            </div>
            <div className="hl-smalls">
              <div className="hl-sm sr fr" data-d="1"><div className="hl-stripe" style={{ background: 'linear-gradient(180deg,var(--violet),#6d28d9)' }}></div><div className="hl-sm-ico" style={{ background: 'rgba(168,85,247,.14)' }}>🎭</div><div className="hl-sm-body"><div className="hl-sm-club">Cultural Committee</div><div className="hl-sm-title">Rhythm Fiesta 2025</div><div className="hl-sm-meta">📅 Mar 22 · 📍 Open Ground · 🎟️ Free</div><div className="hl-sm-tags"><span className="hlst" style={{ background: 'rgba(168,85,247,.09)', borderColor: 'rgba(168,85,247,.22)', color: 'var(--violet)' }}>Dance</span><span className="hlst" style={{ background: 'rgba(168,85,247,.09)', borderColor: 'rgba(168,85,247,.22)', color: 'var(--violet)' }}>Drama</span></div><div className="hl-sm-foot"><span className="hl-sm-seats">Seats: <strong>320</strong></span><button className="hl-sm-btn">Reserve →</button></div></div></div>
              <div className="hl-sm sr fr" data-d="2"><div className="hl-stripe" style={{ background: 'linear-gradient(180deg,var(--green),#16a34a)' }}></div><div className="hl-sm-ico" style={{ background: 'rgba(34,212,107,.1)' }}>🤖</div><div className="hl-sm-body"><div className="hl-sm-club">Robotics Club</div><div className="hl-sm-title">AI &amp; ML Workshop</div><div className="hl-sm-meta">📅 Mar 18 · 📍 Lab 301 · 📜 Certificate</div><div className="hl-sm-tags"><span className="hlst" style={{ background: 'rgba(34,212,107,.07)', borderColor: 'rgba(34,212,107,.2)', color: 'var(--green)' }}>PyTorch</span><span className="hlst" style={{ background: 'rgba(34,212,107,.07)', borderColor: 'rgba(34,212,107,.2)', color: 'var(--green)' }}>Hands-On</span></div><div className="hl-sm-foot"><span className="hl-sm-seats">Seats: <strong style={{ color: '#f43f5e' }}>18</strong> — hurry!</span><button className="hl-sm-btn">Enroll →</button></div></div></div>
              <div className="hl-sm sr fr" data-d="3"><div className="hl-stripe" style={{ background: 'linear-gradient(180deg,#f43f5e,#be123c)' }}></div><div className="hl-sm-ico" style={{ background: 'rgba(244,63,94,.1)' }}>🏆</div><div className="hl-sm-body"><div className="hl-sm-club">Gaming Club</div><div className="hl-sm-title">VALORANT Clash</div><div className="hl-sm-meta">📅 Mar 28–29 · 📍 Computer Lab</div><div className="hl-sm-tags"><span className="hlst" style={{ background: 'rgba(244,63,94,.08)', borderColor: 'rgba(244,63,94,.2)', color: '#f43f5e' }}>Esports</span><span className="hlst" style={{ background: 'rgba(244,63,94,.08)', borderColor: 'rgba(244,63,94,.2)', color: '#f43f5e' }}>₹25k</span></div><div className="hl-sm-foot"><span className="hl-sm-seats">Teams: <strong>8</strong> spots</span><button className="hl-sm-btn">Register →</button></div></div></div>
              <div className="hl-sm sr fr" data-d="4"><div className="hl-stripe" style={{ background: 'linear-gradient(180deg,#fbbf24,#d97706)' }}></div><div className="hl-sm-ico" style={{ background: 'rgba(251,191,36,.1)' }}>📸</div><div className="hl-sm-body"><div className="hl-sm-club">Photography Club</div><div className="hl-sm-title">SnapITER Photo Walk</div><div className="hl-sm-meta">📅 Mar 25 · 📍 Campus Wide</div><div className="hl-sm-tags"><span className="hlst" style={{ background: 'rgba(251,191,36,.08)', borderColor: 'rgba(251,191,36,.2)', color: '#fbbf24' }}>Photography</span></div><div className="hl-sm-foot"><span className="hl-sm-seats">Spots: <strong>200</strong></span><button className="hl-sm-btn">Join →</button></div></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* CLUBS */}
      <section id="clubs" className="sec" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="clubs-glow"></div>
        <div className="wrap" style={{ position: 'relative', zIndex: 2 }}>
          <div className="sec-center">
            <div className="tag go sr" style={{ display: 'inline-flex' }}>🎪 Campus Clubs</div>
            <h2 className="sec-h sr" data-d="1">Every Club Has Its <span className="a">Own Stage</span></h2>
            <p className="sec-p sr" data-d="2">Click any club to explore all its events.</p>
          </div>
          <div className="clubs-grid sr fs">
            {clubs.map(c => (
              <div key={c.id} className="club-card">
                <div className="club-top" style={{ background: CBGMAP[c.name] || 'linear-gradient(135deg,#0c1d38,#060c18)' }}>
                </div>
                <div className="club-info">
                  <div className="club-nm">{c.name}</div>
                  <div className="club-count">🗓️ {events.filter(e => e.club?.id === c.id).length} Events</div>
                  <button className="club-btn" onClick={() => { setActiveClubId(c.id); setCevOpen(true); }}>Explore Events →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KB ANIMATION SECTION */}
      <section className="kb-sec" id="how-sec">
        <div className="wrap">
          <div className="kb-grid">
            <div>
              <div className="tag cy sr">How It Works</div>
              <h2 className="sec-h sr" data-d="1">Club admins<br/><span className="a">type it once.</span><br/>Everyone knows.</h2>
              <p className="sec-p sr" data-d="2" style={{ marginBottom: '18px' }}>Log in, fill the form, publish — all 5,000+ ITER students see your event instantly.</p>
              <div className="kb-steps">
                <div className="kb-step sr" data-d="1" id="kstep0"><div className="kbs-n">01</div><div><div className="kbs-title">Login with Club ID</div><div className="kbs-desc">Secure credentials from Student Union</div></div></div>
                <div className="kb-step sr" data-d="2" id="kstep1"><div className="kbs-n">02</div><div><div className="kbs-title">Fill Event Details</div><div className="kbs-desc">Title, date, venue, banner — under 2 minutes</div></div></div>
                <div className="kb-step sr" data-d="3" id="kstep2"><div className="kbs-n">03</div><div><div className="kbs-title">Publish &amp; Notify All</div><div className="kbs-desc">Every ITER student sees it instantly</div></div></div>
              </div>
            </div>
            <div className="sr fr fs">
              <div className="term">
                <div className="term-bar"><div className="tdots"><span className="td r"></span><span className="td y"></span><span className="td g"></span></div><span className="term-title">iter-events — bash</span></div>
                <div className="term-screen">
                  <div className="t-cmd"><span className="t-pr">❯</span>&nbsp;<span className="t-inp" id="tTxt"></span><span className="t-cur">▌</span></div>
                  <div className="t-out" id="tOut"></div>
                </div>
                <div className="kb-keys" id="kbody">
                  <div className="kb-row"><div className="key k1" data-k="`">~</div><div className="key k1" data-k="1">1</div><div className="key k1" data-k="2">2</div><div className="key k1" data-k="3">3</div><div className="key k1" data-k="4">4</div><div className="key k1" data-k="5">5</div><div className="key k1" data-k="6">6</div><div className="key k1" data-k="7">7</div><div className="key k1" data-k="8">8</div><div className="key k1" data-k="9">9</div><div className="key k1" data-k="0">0</div><div className="key k1" data-k="-">−</div><div className="key k1" data-k="=">=</div><div className="key k2" data-k="Backspace">⌫</div></div>
                  <div className="kb-row"><div className="key k15" data-k="Tab">Tab</div><div className="key k1" data-k="q">Q</div><div className="key k1" data-k="w">W</div><div className="key k1" data-k="e">E</div><div className="key k1" data-k="r">R</div><div className="key k1" data-k="t">T</div><div className="key k1" data-k="y">Y</div><div className="key k1" data-k="u">U</div><div className="key k1" data-k="i">I</div><div className="key k1" data-k="o">O</div><div className="key k1" data-k="p">P</div><div className="key k1" data-k="[">[</div><div className="key k1" data-k="]">]</div><div className="key k15" data-k="\">\</div></div>
                  <div className="kb-row"><div className="key k17" data-k="CapsLock">Caps</div><div className="key k1" data-k="a">A</div><div className="key k1" data-k="s">S</div><div className="key k1" data-k="d">D</div><div className="key k1" data-k="f">F</div><div className="key k1" data-k="g">G</div><div className="key k1" data-k="h">H</div><div className="key k1" data-k="j">J</div><div className="key k1" data-k="k">K</div><div className="key k1" data-k="l">L</div><div className="key k1" data-k=";">;</div><div className="key k1" data-k="'">&apos;</div><div className="key k22" data-k="Enter">Enter ↵</div></div>
                  <div className="kb-row"><div className="key k25" data-k="Shift">⇧</div><div className="key k1" data-k="z">Z</div><div className="key k1" data-k="x">X</div><div className="key k1" data-k="c">C</div><div className="key k1" data-k="v">V</div><div className="key k1" data-k="b">B</div><div className="key k1" data-k="n">N</div><div className="key k1" data-k="m">M</div><div className="key k1" data-k=",">,</div><div className="key k1" data-k=".">.</div><div className="key k1" data-k="/">/</div><div className="key k25" data-k="Shift">⇧</div></div>
                  <div className="kb-row"><div className="key k15" data-k="Ctrl">Ctrl</div><div className="key k15" data-k="Alt">Alt</div><div className="key ksp" data-k=" ">SPACE</div><div className="key k15" data-k="Alt">Alt</div><div className="key k15" data-k="Ctrl">Ctrl</div></div>
                </div>
                <div className="kb-glow"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YOUTUBE VIDEO SECTION */}
      <section id="vid-sec" className="vid-sec">
        <div className="vid-orb"></div>
        <div className="wrap" style={{ position: 'relative', zIndex: 2 }}>
          <div className="sec-center sr">
            <div className="tag pk" style={{ display: 'inline-flex' }}>🎬 Campus Spotlight</div>
            <h2 className="sec-h sr" data-d="1">See ITER in <span className="a">Action</span></h2>
            <p className="sec-p sr" data-d="2">Relive the energy — hackathons, cultural nights, and more.</p>
          </div>
          <div className="vid-frame sr fs" data-d="3">
            <div className="vid-bar"><div className="vdots"><span className="vd r"></span><span className="vd y"></span><span className="vd g"></span></div><span className="vid-lbl">ITER Campus — Highlight Reel</span><div className="vid-feat">Featured</div></div>
            <div className="vid-ratio">
              <iframe id="ytPlayer" src="https://www.youtube-nocookie.com/embed/YSkHkinjTq0?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&loop=1&playlist=YSkHkinjTq0&playsinline=1&disablekb=1&fs=0&iv_load_policy=3&enablejsapi=1" title="ITER Campus" allow="autoplay;encrypted-media" frameBorder="0"></iframe>
            </div>
          </div>
          <div className="vid-strip sr" data-d="4">
            <div className="vid-meta"><span>🎬 <strong>ITER Campus</strong> Highlight</span><span>📅 <strong>2025</strong> Edition</span><span>🎓 <strong>SOA University</strong></span></div>
            <div className="vid-ctas">
              <a href="https://www.youtube.com/watch?v=YSkHkinjTq0" target="_blank" className="btn-ghost" style={{ fontSize: '14px', padding: '9px 16px' }}>Watch on YouTube ↗</a>
              <a href="#events-sec" className="btn-pri" style={{ fontSize: '14px', padding: '9px 16px' }}>Explore Events →</a>
            </div>
          </div>
        </div>
      </section>

      <div className="cta-sec">
        <div className="wrap cta-inner">
          <div className="tag or sr" style={{ display: 'inline-flex', marginBottom: '11px' }}>For Club Admins</div>
          <h2 className="cta-h sr" data-d="1">Post your event in<br/><span className="a">under 2 minutes.</span></h2>
          <p className="cta-p sr" data-d="2">Log in, fill the form, hit publish — all ITER students notified instantly.</p>
          <button className="btn-pri sr" data-d="3" onClick={() => setAdminOpen(true)}>Login as Club Admin →</button>
        </div>
      </div>

      <footer>
        <div className="ft-logo"><div className="ft-logo-ic">IE</div><span className="ft-logo-t">ITER <em>Events</em></span></div>
        <div className="ft-copy" style={{ textAlign: 'center' }}>
          <span>© 2026 ITER Event Portal · Siksha O Anusandhan, Bhubaneswar</span>
          <br />
          <span style={{ opacity: 0.7, fontSize: '0.9em', marginTop: '6px', display: 'inline-block' }}>Powered by Priyanshu Chandra</span>
        </div>
        <div className="ft-links"><a href="#">Privacy</a><a href="#">Contact</a><a href="#">Help</a></div>
      </footer>

      {/* ADMIN MODAL */}
      <div className={`ov ${adminOpen ? 'on' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setAdminOpen(false) }}>
        <div className="modal">
          <button className="modal-x" onClick={() => setAdminOpen(false)}>✕</button>
          <div className="m-icon">🔐</div>
          <div className="m-title">Club Admin Portal</div>
          <div className="m-sub">ITER Event Management System</div>
          
          {!clubSession ? (
             <div className="m-pnl on">
                <div className="fg"><label className="fl">Club ID</label><input type="text" className="fi" placeholder="e.g. ITER_CSE_TECH" value={clubIdInput} onChange={e => setClubIdInput(e.target.value)} /></div>
                <div className="fg"><label className="fl">Password</label><input type="password" className="fi" placeholder="Enter your club password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} /></div>
                <div style={{ fontSize: '10px', color: 'var(--muted2)', marginBottom: '10px', padding: '7px 10px', background: 'rgba(255,77,28,.04)', border: '1px solid rgba(255,77,28,.1)', borderRadius: '6px' }}>💡 Demo: any Club ID + password &quot;demo123&quot;</div>
                <button className="btn-submit" onClick={handleLogin}>Sign In to Dashboard →</button>
             </div>
          ) : (
             <div className="m-pnl on">
                <div className="post-prev">
                   <div className="pp-live">Live Preview</div>
                   <div className="pp-title">{eventDraft.title || 'Event title will appear here...'}</div>
                   <div className="pp-meta"><span>📅 {eventDraft.date || 'Date'}</span><span>📍 {eventDraft.venue || 'Venue'}</span><span>👥 {eventDraft.seats || 'Seats'}</span></div>
                </div>
                <div className="fg"><label className="fl">Event Title</label><input type="text" className="fi" placeholder="e.g. Annual Hackathon 2025" value={eventDraft.title} onChange={e => setEventDraft({...eventDraft, title: e.target.value})} /></div>
                <div className="frow">
                  <div className="fg"><label className="fl">Date</label><input type="date" className="fi" value={eventDraft.date} onChange={e => setEventDraft({...eventDraft, date: e.target.value})} /></div>
                  <div className="fg"><label className="fl">Time</label><input type="time" className="fi" value={eventDraft.time} onChange={e => setEventDraft({...eventDraft, time: e.target.value})} /></div>
                </div>
                <div className="fg"><label className="fl">Venue</label><input type="text" className="fi" placeholder="e.g. Main Auditorium" value={eventDraft.venue} onChange={e => setEventDraft({...eventDraft, venue: e.target.value})} /></div>
                <div className="frow">
                  <div className="fg">
                    <label className="fl">Category</label>
                    <select className="fi" value={eventDraft.cat} onChange={e => setEventDraft({...eventDraft, cat: e.target.value})}>
                      <option>Technical</option><option>Cultural</option><option>Sports</option><option>Workshop</option><option>Competition</option><option>Esports</option>
                    </select>
                  </div>
                  <div className="fg"><label className="fl">Max Seats</label><input type="number" className="fi" placeholder="200" value={eventDraft.seats} onChange={e => setEventDraft({...eventDraft, seats: e.target.value})} /></div>
                </div>
                <div className="fg"><label className="fl">Description</label><textarea className="fi" rows={2} placeholder="Brief description..." style={{ resize: 'vertical', lineHeight: 1.5 }} value={eventDraft.desc} onChange={e => setEventDraft({...eventDraft, desc: e.target.value})}></textarea></div>
                <button className="btn-submit" onClick={handlePublish}>🚀 Publish Event Live</button>
             </div>
          )}
        </div>
      </div>

      {/* CEV MODAL */}
      <div className={`cev-ov ${cevOpen ? 'on' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setCevOpen(false) }}>
        <div className="cev-box">
          <div className="cev-head">
            <div className="cev-head-l">
               <div className="cev-ico" style={{ background: CBGMAP[activeClub?.name || ''] }}>{activeClub?.emoji}</div>
               <div><div className="cev-name">{activeClub?.name}</div><div className="cev-sub">Events</div></div>
            </div>
            <button className="cev-x" onClick={() => setCevOpen(false)}>✕</button>
          </div>
          <div className="cev-grid">
             {activeClubEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '44px 18px', color: 'var(--muted)', gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div><p>No events yet.</p>
                </div>
             ) : activeClubEvents.map(ev => (
                <div key={ev.id} className="cev-card">
                  <div className="cev-img" style={{ background: CBGMAP[ev.club?.name || ''] }}>
                    <span style={{ position: 'relative', zIndex: 2 }}>{ev.emoji}</span>
                    <div className="cev-cat">{ev.category}</div>
                  </div>
                  <div className="cev-body">
                    <div className="cev-title">{ev.title}</div>
                    <div className="cev-desc">{ev.description}</div>
                    <div className="cev-meta"><span>📅 {fmtDate(ev.date)}</span><span>📍 {ev.venue}</span></div>
                    <div className="cev-foot">
                      <span className="cev-seats">Seats: <strong>{Math.max(0, ev.maxSeats - ev.filled)}</strong></span>
                      <button className="cev-reg" onClick={() => showToast('Registered!', `You are in for "${ev.title}"`, '✅')}>Register</button>
                    </div>
                  </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* TOAST */}
      <div className={`toast ${toastMsg ? 'on' : ''}`}>
        <div className="toast-ico">{toastMsg?.ico}</div>
        <div>
           <div className="toast-tt">{toastMsg?.title}</div>
           <div className="toast-mg">{toastMsg?.msg}</div>
        </div>
      </div>

    </div>
  );
}
