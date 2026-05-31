'use strict';

/* ─── AGENT RUNTIME CANVAS ──────────────────────────────────────
   Fixed infrastructure on the margins (engine · pub/sub · memory |
   tools · mcp · logging) + autonomous 🤖 agents floating between,
   calling into the infra. Status bubbles + message pulses.
────────────────────────────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* fixed infra — anchored in the left & right margins */
  const INFRA = [
    { emoji:'⚙️', label:'engine',  side:'L', fy:.20, size:40, color:'#E8670A', spin:true,
      says:['orchestrating', 'routing task', 'scheduling', 'dispatching'] },
    { emoji:'📡', label:'pub/sub', side:'L', fy:.50, size:34, color:'#DB2777',
      says:['publish →', 'broadcast', 'ack ✓', 'emit event'] },
    { emoji:'💾', label:'memory',  side:'L', fy:.80, size:34, color:'#0284C7',
      says:['mem.read', 'mem.write', 'cache hit', 'recall'] },
    { emoji:'🛠️', label:'tools',   side:'R', fy:.20, size:34, color:'#16A34A',
      says:['tool_call()', 'exec bash', '200 OK', 'fetch()'] },
    { emoji:'🔌', label:'mcp',     side:'R', fy:.50, size:34, color:'#7C3AED',
      says:['mcp.invoke', 'tools/list', 'SSE open', 'resource read'] },
    { emoji:'📊', label:'logging', side:'R', fy:.80, size:32, color:'#059669',
      says:['+ trace', 'new span', 'metric', 'observe'] },
  ];
  const AGENT_SAYS = [
    'thinking…', 'reflecting…', 'reasoning…', 'planning…',
    'pondering…', 'noodling…', 'cogitating…', 'ruminating…',
    'percolating…', 'marinating…', 'simmering…', 'brewing…',
    'conjuring…', 'finagling…', 'wrangling…', 'tinkering…',
    'manifesting…', 'vibing…', 'deliberating…', 'synthesizing…',
    'spelunking…', 'computing…', 'mulling…', 'scheming…',
  ];

  let W, H, infra = [], agents = [], bubbles = [], pulses = [], obstacles = [];

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = canvas.offsetWidth; H = canvas.offsetHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    placeInfra();
    computeObstacles();
  }

  function placeInfra() {
    const lx = Math.max(46, W * .045), rx = W - Math.max(46, W * .045);
    infra = INFRA.map(d => ({
      ...d,
      x: d.side === 'L' ? lx : rx,
      y: H * d.fy,
      phase: Math.random() * Math.PI * 2,
      rot: 0, pulse: 0, nextSay: 1200 + Math.random() * 3000,
    }));
  }

  function computeObstacles() {
    const cr = canvas.getBoundingClientRect();
    const sels = ['.agent-loop', '.hero-mission', '.hero-block', '.hero-term', '.hero-scroll-label'];
    obstacles = [];
    sels.forEach(s => document.querySelectorAll(s).forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width) obstacles.push({ x: r.left - cr.left, y: r.top - cr.top, w: r.width, h: r.height });
    }));
  }

  function avoid(e) {
    const m = e.size * .45 + 10;
    for (const o of obstacles) {
      if (e.x > o.x - m && e.x < o.x + o.w + m && e.y > o.y - m && e.y < o.y + o.h + m) {
        const dl = e.x - (o.x - m), dr = (o.x + o.w + m) - e.x;
        const dt = e.y - (o.y - m), db = (o.y + o.h + m) - e.y;
        const min = Math.min(dl, dr, dt, db);
        if (min === dl)      { e.x = o.x - m;       e.vx = -Math.abs(e.vx); }
        else if (min === dr) { e.x = o.x + o.w + m; e.vx =  Math.abs(e.vx); }
        else if (min === dt) { e.y = o.y - m;       e.vy = -Math.abs(e.vy); }
        else                 { e.y = o.y + o.h + m; e.vy =  Math.abs(e.vy); }
      }
    }
  }

  function init() {
    agents = [
      /* the hub — a single 🤖 hovering in place at the cross centre (most active) */
      { emoji:'🤖', size:32, color:'#F97316', pulse:0,
        homeX:W/2, homeY:H*.55, x:W/2, y:H*.55,
        t: Math.random() * 10, phase: Math.random() * Math.PI * 2,
        nextSay: 800 + Math.random() * 2000, nextCall: 700 + Math.random() * 1400 },
      /* two calmer agents flanking the mission line */
      { emoji:'🤖', size:30, color:'#F97316', pulse:0, side:'L',
        homeX:W*.18, homeY:H*.28, x:W*.18, y:H*.28,
        t: Math.random() * 10, phase: Math.random() * Math.PI * 2,
        nextSay: 1800 + Math.random() * 2200, nextCall: 1700 + Math.random() * 1800 },
      { emoji:'🤖', size:30, color:'#F97316', pulse:0, side:'R',
        homeX:W*.82, homeY:H*.28, x:W*.82, y:H*.28,
        t: Math.random() * 10, phase: Math.random() * Math.PI * 2,
        nextSay: 1900 + Math.random() * 2200, nextCall: 1900 + Math.random() * 1800 },
    ];
    bubbles = []; pulses = [];
    agentsPlaced = false;
    placeAgents();
  }

  /* ghost → DOM node · flanking (side) → mission edges · hub → cross centre */
  function placeAgents() {
    const cr = canvas.getBoundingClientRect();
    const m = document.getElementById('heroMission');
    const mr = m && m.getBoundingClientRect();
    const sep = document.querySelector('.hero-sep');
    const sr = sep && sep.getBoundingClientRect();
    agents.forEach(a => {
      if (a.dom) {
        const el = document.querySelector(a.dom);
        if (el) {
          const er = el.getBoundingClientRect();
          a.homeX = a.x = er.left - cr.left + er.width / 2;
          a.homeY = a.y = er.top - cr.top + er.height / 2;
        }
      } else if (a.side && mr) {
        a.homeY = mr.top - cr.top + mr.height / 2;
        a.homeX = a.side === 'L'
          ? Math.max(46, mr.left - cr.left - 44)
          : Math.min(W - 46, mr.right - cr.left + 44);
      } else if (sr) {
        a.homeX = sr.left - cr.left + sr.width / 2;
        a.homeY = sr.top - cr.top + sr.height / 2;
      }
    });
  }

  function spawnBubble(e, pool) {
    bubbles.push({ x: e.x, y: e.y - e.size * .7,
                   text: pool[Math.floor(Math.random() * pool.length)], color: e.color, t: 0 });
  }
  /* straight message: agent → a uniformly-chosen infra node */
  function spawnCall(agent) {
    if (pulses.length > 18 || !infra.length) return;
    const target = infra[Math.floor(Math.random() * infra.length)];
    pulses.push({ from: agent, to: target, t: 0, spd: .0055 + Math.random() * .0015, color: agent.color, bow: 0 });
  }
  /* pub/sub fans out to one or both agents — only after it receives input.
     queued (not pushed) because broadcast() is called mid-filter on `pulses` */
  let castQueue = [];
  function broadcast(node, publisher) {
    node.pulse = 1;
    const others = agents.filter(a => a !== publisher);   // never echo to the publisher
    if (!others.length) return;
    const both = Math.random() < .5;                       // deliver to two subs, or one
    const subs = both
      ? others.sort(() => Math.random() - .5).slice(0, 2)
      : [others[Math.floor(Math.random() * others.length)]];
    subs.forEach(a => castQueue.push({
      from: node, to: a, t: 0, spd: .006, color: node.color,
      bow: (a.side === 'L' ? -1 : a.side === 'R' ? 1 : (a.homeY < node.y ? -1 : 1)) * 60,
      arc: true, notify: true,
    }));
    spawnBubble(node, subs.length > 1 ? ['broadcast →', 'notify subs', 'publish →'] : ['notify →', 'deliver', 'push msg']);
  }

  const ease = t => t * t * (3 - 2 * t);
  /* point along a pulse path (straight, or vertically-bowed bezier) */
  function ptOn(p, t) {
    const e = ease(Math.min(1, Math.max(0, t)));
    if (p.bow) {
      const cx = (p.from.x + p.to.x) / 2, cy = (p.from.y + p.to.y) / 2 + p.bow;
      const m = 1 - e;
      return [m * m * p.from.x + 2 * m * e * cx + e * e * p.to.x,
              m * m * p.from.y + 2 * m * e * cy + e * e * p.to.y];
    }
    return [p.from.x + (p.to.x - p.from.x) * e, p.from.y + (p.to.y - p.from.y) * e];
  }
  let last = 0;

  function drawNode(e, spin, am = 1) {
    const bob = e.ghost ? 0 : Math.sin(performance.now() / 1000 * 1.1 + e.phase) * 3;
    /* pulse ring */
    if (e.pulse > 0) {
      ctx.beginPath(); ctx.arc(e.x, e.y + bob, e.size * .7 + 20 * (1 - e.pulse), 0, Math.PI * 2);
      ctx.strokeStyle = e.color; ctx.globalAlpha = e.pulse * .55 * am; ctx.lineWidth = 2; ctx.stroke();
      e.pulse = Math.max(0, e.pulse - .03); ctx.globalAlpha = 1;
    }
    if (e.ghost) return;   // DOM already renders the 🤖 / hub node — canvas only adds the pulse ring
    ctx.save();
    ctx.translate(e.x, e.y + bob);
    if (spin) { e.rot += .009; ctx.rotate(e.rot); }
    ctx.globalAlpha = .92 * am;
    ctx.font = `${e.size}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(e.emoji, 0, 0);
    ctx.restore();
    ctx.globalAlpha = 1;
  }
  let agentReveal = 0;   // ramps 0→1 once the mission animation finishes
  let agentsPlaced = false;

  function frame(ts) {
    const dt = Math.min(40, ts - last); last = ts;
    ctx.clearRect(0, 0, W, H);
    const now = ts / 1000;

    /* whole agent system (infra + agents) materializes after the mission */
    if (window.__agentsOn) {
      if (!agentsPlaced) { placeAgents(); agentsPlaced = true; }
      agentReveal = Math.min(1, agentReveal + .03);
    }
    if (agentReveal <= 0) { requestAnimationFrame(frame); return; }

    /* side rails connecting the infra stacks */
    ctx.globalAlpha = agentReveal;
    ['L', 'R'].forEach(side => {
      const col = infra.filter(n => n.side === side);
      ctx.beginPath();
      col.forEach((n, i) => i ? ctx.lineTo(n.x, n.y) : ctx.moveTo(n.x, n.y));
      ctx.strokeStyle = 'rgba(180,90,20,0.10)'; ctx.lineWidth = 1; ctx.stroke();
    });
    ctx.globalAlpha = 1;

    /* message pulses (straight → infra, arced ↔ between agents) */
    pulses = pulses.filter(p => {
      p.t += p.spd;
      if (p.arc) {
        /* long curved streak — alternating arcs trace an ellipse over the mission */
        const TAIL = .55, N = 12;
        ctx.beginPath();
        for (let k = 0; k <= N; k++) {
          const tt = p.t - TAIL + TAIL * (k / N);
          const [px, py] = ptOn(p, tt);
          k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.strokeStyle = p.color; ctx.globalAlpha = .45; ctx.lineWidth = 1.8;
        ctx.lineCap = 'round'; ctx.stroke(); ctx.lineCap = 'butt';
        const [hx, hy] = ptOn(p, p.t);
        ctx.beginPath(); ctx.arc(hx, hy, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = .9; ctx.fill(); ctx.globalAlpha = 1;
        if (p.t >= 1) { if (p.notify) { p.to.pulse = 1; spawnBubble(p.to, AGENT_SAYS); } return false; }
        return true;
      }
      const [x, y] = ptOn(p, p.t);
      const [tx, ty] = ptOn(p, p.t - .14);
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y);
      ctx.strokeStyle = p.color; ctx.globalAlpha = .4; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.color; ctx.globalAlpha = .85; ctx.fill();
      ctx.globalAlpha = 1;
      if (p.t >= 1) {
        p.to.pulse = 1;
        if (p.to.label === 'pub/sub') broadcast(p.to, p.from);   // deliver to the OTHER agent, not the publisher
        else spawnBubble(p.to, p.to.says || AGENT_SAYS);
        return false;
      }
      return true;
    });
    if (castQueue.length) { pulses.push(...castQueue); castQueue.length = 0; }

    /* fixed infra */
    infra.forEach(n => {
      drawNode(n, n.spin, agentReveal);
      /* label under node */
      ctx.font = `600 9px 'JetBrains Mono',monospace`;
      ctx.fillStyle = '#1C1917'; ctx.globalAlpha = .5 * agentReveal; ctx.textAlign = 'center';
      ctx.fillText(n.label, n.x, n.y + n.size * .62 + 13); ctx.globalAlpha = 1;
      /* infra speaks only when it receives a message (reactive) */
    });

    /* agents */
    {
      agents.forEach(a => {
        if (a.dom) {
          a.x = a.homeX; a.y = a.homeY;            // anchored, no hover
        } else {
          const amp = a.side ? 10 : 4;             // flanking drift more; hub stays on the cross
          a.t += .016;
          a.x = a.homeX + Math.cos(a.t * .9 + a.phase) * amp;
          a.y = a.homeY + Math.sin(a.t * 1.3 + a.phase) * amp * .8;
        }
        drawNode(a, false, agentReveal);

        if (agentReveal < 1) return;   // hold off activity until fully present
        if (!a.dom) {                  // hub + flanking "think" aloud (flanking calmer)
          a.nextSay -= dt;
          if (a.nextSay <= 0) { spawnBubble(a, AGENT_SAYS); a.nextSay = (a.side ? 2200 : 1300) + Math.random() * 2000; }
        }
        a.nextCall -= dt;
        if (a.nextCall <= 0) { spawnCall(a); a.nextCall = (a.dom ? 1400 : a.side ? 1900 : 550) + Math.random() * 1500; }
      });
    }

    /* status bubbles float up + fade */
    bubbles = bubbles.filter(b => {
      b.t += .011;
      if (b.t >= 1) return false;
      const a = b.t < .15 ? b.t / .15 : (1 - (b.t - .15) / .85);
      const y = b.y - b.t * 32;
      ctx.font = `600 12px 'JetBrains Mono',monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const w = ctx.measureText(b.text).width + 18;
      /* rounded pill box */
      ctx.globalAlpha = a * .9;
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      roundRect(b.x - w / 2, y - 11, w, 22, 11); ctx.fill();
      ctx.strokeStyle = b.color; ctx.globalAlpha = a * .55; ctx.lineWidth = 1; ctx.stroke();
      /* label */
      ctx.globalAlpha = a; ctx.fillStyle = b.color;
      ctx.fillText(b.text, b.x, y);
      ctx.globalAlpha = 1;
      return true;
    });

    requestAnimationFrame(frame);
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  window.addEventListener('resize', () => { resize(); init(); });
  window.addEventListener('load', () => { placeInfra(); placeAgents(); computeObstacles(); });
  setTimeout(() => { placeAgents(); computeObstacles(); }, 600);
  resize(); init(); requestAnimationFrame(frame);
})();


/* ─── CURSOR ───────────────────────────────────────────────────── */
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mx = 0, my = 0, fx = 0, fy = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; });
(function tick() { fx += (mx-fx)*.12; fy += (my-fy)*.12; follower.style.left = fx+'px'; follower.style.top = fy+'px'; requestAnimationFrame(tick); })();
document.querySelectorAll('a,button').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.classList.add('grow'); follower.classList.add('grow'); });
  el.addEventListener('mouseleave', () => { cursor.classList.remove('grow'); follower.classList.remove('grow'); });
});


/* ─── TERMINAL TABS (Bash / MCP switcher) ──────────────────────────── */
(function initTermTabs() {
  const tabs = [...document.querySelectorAll('.term-tab')];
  const panels = [...document.querySelectorAll('.term-panel')];
  const status = document.getElementById('termStatus');
  if (!tabs.length) return;
  const meta = { bash: { txt: 'LIVE', cls: 'st-live' }, mcp: { txt: 'SSE', cls: 'st-sse' } };

  tabs.forEach(t => t.addEventListener('click', () => {
    const name = t.dataset.tab;
    tabs.forEach(x => x.classList.toggle('active', x === t));
    panels.forEach(p => { p.hidden = p.dataset.panel !== name; });
    status.className = 'term-status ' + meta[name].cls;
    status.innerHTML = '<span class="live-dot"></span>' + meta[name].txt;
    const inp = document.querySelector(`.term-panel[data-panel="${name}"] input`);
    if (inp) setTimeout(() => inp.focus(), 0);
  }));
})();


/* ─── NAVBAR ─────────────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  document.getElementById('btt').classList.toggle('show', window.scrollY > 500);
});


/* ─── MOBILE MENU ──────────────────────────────────────────────────── */
const mm = document.getElementById('mobileMenu');
document.getElementById('hamburger').addEventListener('click', () => mm.classList.add('open'));
document.getElementById('mobileClose').addEventListener('click', () => mm.classList.remove('open'));
document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => mm.classList.remove('open')));


/* ─── HERO SKILL PILLS (Claude-style spinner + rotating skills) ────── */
const verbs = [
  'Agentic AI 🤖',
  'Harness Engineering ⚙️',
  'AI Observability 👁️',
  'LLM Orchestration 🧠',
  'Causal Inference 📐',
  'Computational Oncology 🧬',
  'Signal Processing 📡',
];
const pillEls = [...document.querySelectorAll('.hero-status-verb[data-pill]')];
if (pillEls.length) {
  // initialise with distinct skills
  const shown = [];
  pillEls.forEach((el, i) => { shown[i] = i % verbs.length; el.textContent = verbs[shown[i]]; });

  function rotatePill(i) {
    const el = pillEls[i];
    el.classList.add('swap-out');
    setTimeout(() => {
      // pick an index not currently shown by any pill
      let next;
      do { next = Math.floor(Math.random() * verbs.length); }
      while (shown.includes(next));
      shown[i] = next;
      el.textContent = verbs[next];
      el.classList.remove('swap-out');
      el.classList.add('swap-in');
      setTimeout(() => el.classList.remove('swap-in'), 320);
    }, 300);
  }

  // each pill on its own staggered cadence
  pillEls.forEach((_, i) => {
    setTimeout(() => setInterval(() => rotatePill(i), 2800 + i * 600), 900 * i);
  });
}


/* ─── HERO AGENT LOOP (sentence fades in, then verbs resolve inline) ── */
(function initLoop() {
  const loop = document.getElementById('agentLoop');
  const mission = document.getElementById('heroMission');
  if (!loop || !mission) return;
  const steps = [...loop.querySelectorAll('.al-step')];

  /* 1) the sentence fades in, with the capability line just below it */
  setTimeout(() => { mission.classList.add('revealed'); loop.classList.add('show'); }, 250);

  /* 2) the agent loop resolves each verb inline (spinner → ✓) */
  let i = 0;
  function resolve() {
    if (i >= steps.length) {
      /* 3) stage in cards → cross → terminal → scroll, then agents */
      const stages = [...document.querySelectorAll('.hero-stage')];
      stages.forEach((el, k) => setTimeout(() => el.classList.add('show'), 400 + k * 360));
      setTimeout(() => { window.__agentsOn = true; }, 400 + stages.length * 360 + 350);
      return;
    }
    const s = steps[i];
    s.classList.add('active');           // spinner
    setTimeout(() => {
      s.classList.remove('active');
      s.classList.add('done');           // ✓
      i++;
      resolve();
    }, 460);
  }
  setTimeout(resolve, 1150);   // after the sentence has faded in
})();


/* ─── SCROLL REVEAL ────────────────────────────────────────────────── */
const revEls = document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right');
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); } });
}, { threshold: .1, rootMargin: '0px 0px -28px 0px' });
revEls.forEach(el => revObs.observe(el));


/* ─── 3D CARD TILT ─────────────────────────────────────────────────── */
const card = document.querySelector('.profile-card');
if (card) {
  const inner = card.querySelector('.profile-card-inner');
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    inner.style.transform = `perspective(800px) rotateY(${((e.clientX-r.left)/r.width-.5)*14}deg) rotateX(${-((e.clientY-r.top)/r.height-.5)*14}deg)`;
  });
  card.addEventListener('mouseleave', () => { inner.style.transform = ''; });
}


/* ─── GLITCH ───────────────────────────────────────────────────────── */
const heroName = document.getElementById('heroName');
function glitch() { if (!heroName) return; heroName.classList.add('is-glitching'); setTimeout(() => heroName.classList.remove('is-glitching'), 320); }
(function sched() { setTimeout(() => { glitch(); sched(); }, 9000 + Math.random() * 11000); })();


/* ─── BTT ──────────────────────────────────────────────────────────── */
document.getElementById('btt').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));


/* ─── MCP WINDOW ───────────────────────────────────────────────────── */
(function initMCP() {
  const out = document.getElementById('mcpOut');
  const body = document.getElementById('mcpBody');
  if (!out) return;

  const TOOLS = [
    { name: 'get_profile',        desc: 'Return identity, role & status'    },
    { name: 'get_experience',     desc: 'Return full career history'        },
    { name: 'get_education',      desc: 'Return degrees & institutions'     },
    { name: 'list_publications',  desc: 'List peer-reviewed papers'         },
    { name: 'get_expertise',      desc: 'Return skills grouped by domain'   },
    { name: 'get_awards',         desc: 'Return honors & recognitions'      },
    { name: 'get_research',       desc: 'Return research focus & areas'     },
    { name: 'book_session',       desc: 'Open a Topmate booking link'       },
  ];

  const PROFILE = {
    name:    'Nishant Keni',
    role:    'Principal AI Engineer',
    company: 'CuePilot AI',
    domains: ['Agentic AI', 'Harness', 'Observability', 'EdTech'],
    h_index: 4,
    status:  'ACTIVE',
  };

  function emit(cls, text) {
    const el = document.createElement('div');
    el.className = 'mcp-line ' + cls;
    el.textContent = text;
    out.appendChild(el);
    if (body) body.scrollTop = body.scrollHeight;
  }
  function emitLines(lines) { lines.forEach(([c, t]) => emit(c, t)); }

  function line(cls, text, delayMs) {
    return new Promise(resolve => {
      setTimeout(() => { emit(cls, text); resolve(); }, delayMs);
    });
  }

  /* ── tool responses (also used interactively) ── */
  const handlers = {
    'tools/list': () => {
      emit('mcp-bracket', '{');
      emit('mcp-key', '  "tools": [');
      TOOLS.forEach(t => {
        emit('mcp-str', `    { "name": "${t.name}",`);
        emit('mcp-val', `      "desc": "${t.desc}" },`);
      });
      emit('mcp-bracket', '  ]');
      emit('mcp-bracket', '}');
    },
    'get_profile': () => emitLines([
      ['mcp-bracket', '{'],
      ['mcp-key', `  "name":    "${PROFILE.name}",`],
      ['mcp-key', `  "role":    "${PROFILE.role}",`],
      ['mcp-key', `  "company": "${PROFILE.company}",`],
      ['mcp-key', `  "domains": ${JSON.stringify(PROFILE.domains)},`],
      ['mcp-val', `  "status":  "● ${PROFILE.status}"`],
      ['mcp-bracket', '}'],
    ]),
    'get_experience': () => emitLines([
      ['mcp-bracket', '{'],
      ['mcp-key', '  "current":  '],
      ['mcp-str', '  "Principal AI Engineer · CuePilot AI · 2026–present",'],
      ['mcp-key', '  "previous": ['],
      ['mcp-str', '    "Research Scientist II · Amazon · 2022–2024",'],
      ['mcp-str', '    "Data Scientist II · Amazon · 2020–2022",'],
      ['mcp-str', '    "Visiting Researcher · UC Berkeley · 2018",'],
      ['mcp-str', '    "Applied Scientist Intern · Amazon.in · 2018"'],
      ['mcp-bracket', '  ]'],
      ['mcp-bracket', '}'],
    ]),
    'get_education': () => emitLines([
      ['mcp-bracket', '{'],
      ['mcp-str', '  "B.Tech Electrical Eng · VJTI Mumbai · Gold Medal",'],
      ['mcp-str', '  "M.S. Computer Eng · Georgia Tech",'],
      ['mcp-str', '  "AI Certificate · Stanford University",'],
      ['mcp-val', '  "PG CS & Engineering · IIT Bombay · ● active"'],
      ['mcp-bracket', '}'],
    ]),
    'list_publications': () => emitLines([
      ['mcp-bracket', '{'],
      ['mcp-key', '  "count": 10,  "citations": 55,  "h_index": 4,'],
      ['mcp-key', '  "top": ['],
      ['mcp-str', '    "Adaptive Containerization · IEEE CCNC 2020 · 27 cites",'],
      ['mcp-str', '    "Neural Leaf Identification · GTSP 2016 · 14 cites",'],
      ['mcp-str', '    "Convex Sparse Dictionary Learning · SPIN 2017 · 6 cites"'],
      ['mcp-bracket', '  ]'],
      ['mcp-bracket', '}'],
    ]),
    'get_awards': () => emitLines([
      ['mcp-bracket', '{'],
      ['mcp-str', '  "Institute Gold Medal · VJTI · 2017",'],
      ['mcp-str', '  "IEEE Best Paper Award · 2016",'],
      ['mcp-str', '  "JEE Mains AIR 695 · top 0.05%",'],
      ['mcp-str', '  "Dr. Homi Bhabha Young Scientist"'],
      ['mcp-bracket', '}'],
    ]),
    'get_expertise': () => emitLines([
      ['mcp-bracket', '{'],
      ['mcp-key', '  "Agentic AI": ["orchestration", "harness eng", "observability", "MCP"],'],
      ['mcp-key', '  "ML & Stats": ["causal inference", "signal processing", "computer vision"],'],
      ['mcp-val', '  "Oncology":   ["computational oncology", "cancer detection"]'],
      ['mcp-bracket', '}'],
    ]),
    'get_research': () => emitLines([
      ['mcp-bracket', '{'],
      ['mcp-key', '  "focus":   "Computational oncology × applied AI",'],
      ['mcp-key', '  "areas":   ['],
      ['mcp-str', '    "cancer detection via computational intelligence",'],
      ['mcp-str', '    "adversarial ML defense (UC Berkeley · D. Song)",'],
      ['mcp-str', '    "causal inference at Amazon scale"'],
      ['mcp-bracket', '  ]'],
      ['mcp-bracket', '}'],
    ]),
    'book_session': () => {
      emit('mcp-recv', '→ opening topmate.io/nishant_keni …');
      window.open('https://topmate.io/nishant_keni', '_blank', 'noopener');
    },
  };

  async function run() {
    let d = 0;
    const D = 220;

    await line('mcp-comment', '# nk-mcp server · Model Context Protocol v1.0', d); d += D;
    await line('mcp-comment', '', d); d += D * .5;
    await line('mcp-send', '← connecting to nk-profile-server...', d); d += D * 1.2;
    await line('mcp-recv', '→ handshake OK · session established', d); d += D;
    await line('mcp-recv', '→ 8 tools available · ready', d); d += D * 1.5;
    await line('mcp-comment', '', d); d += D * .3;

    await line('mcp-send', '← tools/list', d); d += D;
    await new Promise(r => setTimeout(() => { handlers['tools/list'](); r(); }, d ? 0 : 0));
    await new Promise(r => setTimeout(r, D * 1.5));

    await line('mcp-comment', '', 0);
    await line('mcp-send', '← tools/call  "get_profile"  {}', D);
    await new Promise(r => setTimeout(() => { handlers['get_profile'](); r(); }, D));
    await new Promise(r => setTimeout(r, D));

    await line('mcp-comment', '', 0);
    await line('mcp-comment', '# your turn → call a tool or type help', 0);

    // go interactive
    const row = document.getElementById('mcpRow');
    const input = document.getElementById('mcpInput');
    if (row && input) {
      row.style.display = 'flex';
      if (body) {
        body.addEventListener('click', () => input.focus());
        body.scrollTop = body.scrollHeight;
      }
      input.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        const raw = input.value.trim();
        input.value = '';
        if (!raw) return;
        const v = raw.toLowerCase();

        if (v === 'clear') { out.innerHTML = ''; return; }
        if (v === 'help') {
          emit('mcp-comment', '# tools: ' + TOOLS.map(t => t.name).join(', '));
          emit('mcp-comment', '# also: tools/list · clear');
          return;
        }
        // normalise "tools/call get_profile {}" or just "get_profile"
        const tool = v.replace(/^tools\/call\s*/, '').replace(/[{}"']/g, '').trim();
        if (tool === 'tools/list') { emit('mcp-send', '← tools/list'); handlers['tools/list'](); return; }
        emit('mcp-send', `← tools/call  "${tool}"  {}`);
        const h = handlers[tool];
        if (h) h();
        else emit('mcp-recv', `→ error: unknown tool "${tool}" · type help`);
        if (body) body.scrollTop = body.scrollHeight;
      });
    }
  }

  run();
})();


/* ─── TERMINAL ─────────────────────────────────────────────────────── */
(function () {
  const termOut   = document.getElementById('termOut');
  const termInput = document.getElementById('termInput');
  const termBody  = document.getElementById('termBody');
  if (!termOut || !termInput) return;

  const history = []; let histIdx = -1;

  /* ── Command definitions ── */
  const CMDS = {
    help: () => ({ type:'info', text:
`  COMMAND       DESCRIPTION
  ──────────────────────────────────────────────
  whoami        identity & current role
  skills        technical capabilities
  exp           career history
  edu           education background
  projects      notable builds
  awards        achievements
  research      publications & citations
  contact       get in touch
  cuepilot      about CuePilot AI
  ls            list directories
  ps            running processes
  uname         system information
  clear         clear the terminal

  ↑ / ↓  history  |  Tab  autocomplete`
    }),

    whoami: () => ({ type:'success', text:
`╔═════════════════════════════════════════════════════╗
║  IDENTITY    Nishant Keni                            ║
║  ROLE        Principal AI Research Engineer          ║
║  COMPANY     CuePilot AI                             ║
╠══════════════════════════════════════════════════════╣
║  WORK SPANS                                          ║ 
║  🤖 Agentic AI & LLM Systems                         ║
║  ⚙  Harness Engineering                              ║
║  👁  AI Observability                                ║
║  📚 EdTech                                           ║
╠══════════════════════════════════════════════════════╣
║  ALSO        Counseling Psychologist                 ║
║              Certified Cancer Coach                  ║
║              Computational Oncologist                ║
╠══════════════════════════════════════════════════════╣
║  MISSION     "Impacting lives with humanity,         ║
║               data, algorithms and the cloud"        ║
║  STATUS      ● ACTIVE  |  Mumbai → World             ║
╚══════════════════════════════════════════════════════╝`
    }),

    skills: () => ({ type:'info', text:
`AGENTIC AI STACK
├─ LLM Systems & Prompt Engineering
├─ Agent Orchestration & Multi-agent Pipelines
├─ Tool Use, Function Calling & MCP
└─ AI Observability, Eval & Harness Engineering

ML & DATA SCIENCE
├─ Causal Inference & Statistical Modeling
├─ Signal Processing & DSP
├─ Deep Learning & Neural Architectures
└─ Reinforcement Learning

ENGINEERING
├─ Harness Engineering & CI/CD for AI
├─ MLOps & Model Deployment
└─ Microservices & Cloud Infrastructure

DOMAIN
├─ Computational Oncology & Cancer Research
├─ Counseling Psychology
└─ Early Childhood Education AI`
    }),

    exp: () => ({ type:'info', text:
`CAREER TIMELINE
────────────────────────────────────────────────────
● 2024–NOW   🤖 Principal AI Engineer
             CuePilot AI
             Agentic AI · Harness · Observability · EdTech
             $1.8M raised · 2026 GSV Cup 50

● 2022–2024  Research Scientist II
             Amazon (Next Science)
             Causal Inference · Statistical Modeling

● 2020–2022  Data Scientist II
             Amazon
             Advertising Measurement · Recommenders

● 2018       Visiting Researcher
             UC Berkeley  (Prof. Dawn Song)
             Adversarial ML · Security

● 2018       Applied Scientist Intern
             Amazon.in
             Reinforcement Learning · Dynamic Pricing

● 2018–2019  Graduate Teaching Assistant
             Georgia Tech  |  Machine Learning`
    }),

    edu: () => ({ type:'info', text:
`EDUCATION
────────────────────────────────────────────────────
● IIT Bombay  (Aug 2025 – Present)  🟢 ACTIVE
  Postgraduate Degree, CS & Engineering

● Stanford University  (2019–2021)
  Professional Certificate in AI
  NLP · Statistical Modelling · Graph Learning

● Georgia Tech  (2017–2019)
  M.S. Electrical & Computer Engineering
  Digital Signal Processing

● VJTI Mumbai  (2013–2017)
  B.Tech Electronics Engineering
  🥇 Institute Gold Medal (Department Rank 1)`
    }),

    research: () => ({ type:'info', text:
`PUBLICATIONS  |  55 citations · h-index 4
────────────────────────────────────────────────────
01  Adaptive Containerization for Microservices
    IEEE CCNC 2020  |  27 citations

02  Neural Networks for Leaf ID via Structural Decomp.
    GTSP 2016  |  14 citations

03  Convex Opt. Sparse Dictionary Learning for Compression
    SPIN 2017  |  6 citations

04  Content Based Image Retrieval via Structural Features
    SPIN 2017  |  6 citations

05  Compressively Sensed Image Reconstruction
    IEEE ISM 2019  |  1 citation

06  Computational Intelligence for Cancer Detection
    CI Theories & Applications 2018  |  1 citation

07–10  Industry Research: Causal Inference, Ads ML
       Amazon MLC & Consumer Science Summit 2022

→  scholar.google.com/citations?user=MlaT-RgAAAAJ`
    }),

    projects: () => ({ type:'info', text:
`NOTABLE PROJECTS
────────────────────────────────────────────────────
01  🔬 Computational Oncology Framework
    Causal ML · Genomics · Biomarker Discovery

02  Cell Nuclei Detection
    Deep Learning · Medical Imaging

03  Adversarial ML Defense Toolkit
    Certified Robustness · Neural Nets

04  Autonomous Aerial Vehicles
    Control Theory · Computer Vision

05  🤖 Microservices ML Platform
    Docker · Kubernetes · MLOps  (27 citations)

→  github.com/nishkeni`
    }),

    awards: () => ({ type:'success', text:
`ACHIEVEMENTS
────────────────────────────────────────────────────
🥇  Institute Gold Medal — VJTI Mumbai (2017)
    Department Rank 1 in Electronics Engineering

🏆  IEEE Best Paper Award (2016)
    Signal processing & neural compression

⭐  JEE Mains AIR 695 (2013)
    Top 0.05% of 1.4M+ candidates nationally

🔭  Top 1%  National Astronomy Examination (2013)

⚛   Dr. Homi Bhabha Young Scientist — Silver (2009)

🎓  Maharashtra State Scholarships (2004–2008)`
    }),

    contact: () => ({ type:'info', text:
`CONTACT
────────────────────────────────────────────────────
✉   nishant.keni@outlook.com
🔗  linkedin.com/in/nishant-keni
⬡   github.com/nishkeni
📚  scholar.google.com/citations?user=MlaT-RgAAAAJ
🤝  topmate.io/nishant_keni
📅  calendly.com/nishant-keni

Open to: Research collab · Speaking · Mentoring`
    }),

    cuepilot: () => ({ type:'success', text:
`CUEPILOT AI
────────────────────────────────────────────────────
Product  The AI-native Preschool OS
         "There are some things only teachers can do.
          For everything else, there is Cue!"

Funding  $1.8M raised
Awards   2026 GSV Cup 50 — only Indian company

Stack    Voice-first AI · Agentic workflows · NLP
         Child development tracking
         Parent-teacher communication AI

My Role  🤖 Principal AI Engineer
         Agentic AI · Harness · Observability · EdTech`
    }),

    ls: () => ({ type:'info', text:
`total 8 directories

drwxr-xr-x  skills/
drwxr-xr-x  experience/
drwxr-xr-x  education/
drwxr-xr-x  projects/
drwxr-xr-x  publications/
drwxr-xr-x  awards/
-rw-r--r--  README.md       (try: cat README.md)
-rw-r--r--  resume.pdf
-rw-------  secrets.txt     Permission denied.`
    }),

    'cat README.md': () => CMDS.whoami(),

    ps: () => ({ type:'info', text:
`PID   CPU  MEM   COMMAND
──────────────────────────────────────────────────
001   18%  512M  cuepilot-agent-pipeline   [running]
002   11%  256M  ai-observability-daemon   [running]
003    8%  128M  harness-orchestrator      [running]
004    5%   64M  causal-inference-model    [running]
005    3%   32M  oncology-research         [sleeping]
006    2%   16M  llm-eval-harness          [running]
007    1%    8M  counseling-psych-bot      [standby]

7 processes · 6 agents active  |  uptime: 6+ yrs`
    }),

    uname: () => ({ type:'success', text:
`NK-OS 2026.1 LTS  x86_brain  POSIX-compliant
caffeine-powered · gold-medal-certified · IIT-Bombay-enrolled
build-VJTI-2017 · stanford-cert · georgia-tech-grad` }),

    sudo: () => ({ type:'error', text:
`[sudo] password for nk: ****
Sorry, user nk is not allowed to run sudo on this machine.
(Seriously though — let's connect: nishant.keni@outlook.com)` }),

    '42': () => ({ type:'success', text: 'The answer to life, the universe, and everything.\nAlso my target p50 latency on production LLM calls. 🤖' }),

    hello: () => ({ type:'info', text: 'Hey! 👋  Type whoami to start, or help to see all commands.' }),
    hi:    () => ({ type:'info', text: 'Hey! 👋  Type whoami to start, or help to see all commands.' }),

    clear: () => ({ type:'__clear__', text:'' }),
  };
  CMDS.about = CMDS.whoami;
  CMDS.experience = CMDS.exp;
  CMDS.education  = CMDS.edu;
  CMDS.publications = CMDS.research;

  /* ── Render helpers ── */
  function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function printBlock(raw, result) {
    const wrap = document.createElement('div'); wrap.className = 'term-out-block';
    wrap.innerHTML = `<div class="term-cmd-echo"><span style="color:#374151">nk<span style="color:#4ADE80">@</span>agent<span style="color:#4ADE80">:</span><span style="color:#38BDF8">~</span><span style="color:#4ADE80">$</span></span> ${esc(raw)}</div>`;
    termOut.appendChild(wrap);
    if (result.type === '__clear__') return;
    const pre = document.createElement('pre');
    pre.className = result.type === 'success' ? 'out-success' : result.type === 'error' ? 'out-error' : 'out-info';
    pre.textContent = ''; wrap.appendChild(pre);
    let i = 0;
    (function typeChar() {
      if (i < result.text.length) {
        pre.textContent += result.text[i++];
        termBody.scrollTop = termBody.scrollHeight;
        setTimeout(typeChar, result.text[i-1] === '\n' ? 5 : 1.8);
      }
    })();
  }

  /* ── Boot sequence ── */
  function runBoot() {
    const lines = [
      { t:'info', text:'Initializing NK Shell ...' },
      { t:'info', text:'Loading profile data ██████████ 100%' },
      { t:'success', text:'8 nodes registered\nObservability ACTIVE · Harness READY' },
      { t:'info', text:'\nWelcome, human. Type help or whoami to begin.' },
    ];
    let delay = 0;
    lines.forEach((l, idx) => {
      setTimeout(() => {
        const p = document.createElement('pre');
        p.className = l.t === 'success' ? 'out-success' : 'out-info';
        p.textContent = l.text;
        termOut.appendChild(p);
        termBody.scrollTop = termBody.scrollHeight;
      }, delay);
      delay += idx === 0 ? 300 : idx === 1 ? 700 : idx === 2 ? 400 : 300;
    });
    setTimeout(() => {
      const hint = document.createElement('div');
      hint.style.cssText = 'margin-top:10px;margin-bottom:4px;font-size:.74rem;color:#374151';
      hint.innerHTML = `Try: <span style="color:#4ADE80;cursor:pointer;text-decoration:underline" id="bootHint">whoami</span>`;
      termOut.appendChild(hint);
      termBody.scrollTop = termBody.scrollHeight;
      document.getElementById('bootHint')?.addEventListener('click', () => { execute('whoami'); });
    }, delay);
  }
  runBoot();

  /* ── Execute ── */
  function execute(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    history.unshift(raw.trim()); histIdx = -1;
    if (cmd === 'clear') { termOut.innerHTML = ''; runBoot(); return; }
    const fn = CMDS[cmd];
    if (fn) { printBlock(raw.trim(), fn()); }
    else { printBlock(raw.trim(), { type:'error', text: `nk-agent: command not found: ${cmd}\nType help for available commands.` }); }
    termBody.scrollTop = termBody.scrollHeight;
  }

  /* ── Input ── */
  termInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const v = termInput.value; termInput.value = ''; execute(v); }
    if (e.key === 'ArrowUp') { e.preventDefault(); if (histIdx < history.length-1) { histIdx++; termInput.value = history[histIdx]; } }
    if (e.key === 'ArrowDown') { e.preventDefault(); if (histIdx > 0) { histIdx--; termInput.value = history[histIdx]; } else { histIdx = -1; termInput.value = ''; } }
    if (e.key === 'Tab') { e.preventDefault(); const p = termInput.value.toLowerCase(); const m = Object.keys(CMDS).find(k => k.startsWith(p) && k !== p); if (m) termInput.value = m; }
  });
  termBody.addEventListener('click', () => termInput.focus());
})();
