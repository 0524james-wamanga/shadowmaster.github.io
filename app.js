const KEY = 'shadowmaster_dashboard_v5';
const MENU = [
  { id: 'rice-beans', name: 'Rice & beans', price: 2500, emoji: '🍚' },
  { id: 'posho-beef', name: 'Posho & beef stew', price: 3500, emoji: '🥩' },
  { id: 'chapati-beans', name: 'Chapati & beans', price: 2000, emoji: '🫓' },
  { id: 'matooke', name: 'Matooke & groundnut sauce', price: 3000, emoji: '🍌' },
  { id: 'chips-chicken', name: 'Chips & chicken', price: 4500, emoji: '🍟' },
  { id: 'fruit-salad', name: 'Fresh fruit salad', price: 1500, emoji: '🥗' },
  { id: 'soda', name: 'Soda / juice', price: 1000, emoji: '🥤' },
  { id: 'tea-snack', name: 'Tea & snack pack', price: 1200, emoji: '☕' }
];
const DEFAULTS = {
  profile: {
    name: 'James Wamanga',
    role: 'ShadowMaster workspace',
    email: '',
    location: '',
    bio: '',
    initials: 'JW',
    joined: new Date().toISOString().slice(0, 10)
  },
  tasks: [
    { text: 'Finish dashboard design', meta: 'Priority · Today', done: false },
    { text: 'Review project files', meta: 'Work · 10:30 AM', done: false },
    { text: 'Study physics notes', meta: 'School · 2:00 PM', done: false },
    { text: "Plan tomorrow's work", meta: 'Personal · 7:00 PM', done: false }
  ],
  dark: false,
  notif: 'on',
  activity: ['Dashboard workspace opened'],
  orders: [],
  scores: { clicker: 0, guess: 0 },
  library: null,
  scienceBookings: [],
  pcReservations: []
};
let state = JSON.parse(localStorage.getItem(KEY) || 'null');
if (!state || !state.profile) {
  const old = JSON.parse(localStorage.getItem('shadowmaster_dashboard_v4') || localStorage.getItem('shadowmaster_dashboard_v3') || localStorage.getItem('shadowmaster_dashboard_v2') || 'null');
  state = {
    ...DEFAULTS,
    tasks: (old && old.tasks) || DEFAULTS.tasks,
    dark: (old && old.dark) || false,
    activity: (old && old.activity) || DEFAULTS.activity,
    profile: (old && old.profile) || { ...DEFAULTS.profile },
    orders: (old && old.orders) || [],
    scores: (old && old.scores) || { clicker: 0, guess: 0 }
  };
}
if (!state.orders) state.orders = [];
if (!state.scores) state.scores = { clicker: 0, guess: 0 };
if (!state.scienceBookings) state.scienceBookings = [];
if (!state.pcReservations) state.pcReservations = [];
if (!state.library) {
  state.library = [
    { id: 'b1', type: 'book', title: 'Introduction to Physics', author: 'Halliday & Resnick', status: 'available' },
    { id: 'b2', type: 'book', title: 'Organic Chemistry', author: 'Morrison & Boyd', status: 'available' },
    { id: 'b3', type: 'book', title: 'Things Fall Apart', author: 'Chinua Achebe', status: 'available' },
    { id: 'b4', type: 'book', title: 'Mathematics for Secondary', author: 'Backhouse', status: 'available' },
    { id: 'a1', type: 'article', title: 'Climate Change in East Africa', author: 'Journal of Environment', status: 'available' },
    { id: 'a2', type: 'article', title: 'AI in Education', author: 'Tech Review', status: 'available' },
    { id: 'a3', type: 'article', title: 'History of Uganda', author: 'African Studies', status: 'available' },
    { id: 'b5', type: 'book', title: 'Animal Farm', author: 'George Orwell', status: 'available' }
  ];
}
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function log(msg) {
  state.activity.unshift(msg);
  state.activity = state.activity.slice(0, 12);
}
function initialsFromName(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'SM';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function renderProfileUI() {
  const p = state.profile;
  const init = p.initials || initialsFromName(p.name);
  $('#avatar').textContent = init;
  $('#profileAvatarLg').textContent = init;
  $('#profileNameDisplay').textContent = p.name || 'User';
  $('#profileRoleDisplay').textContent = p.role || 'Workspace member';
  $('#profileEmailDisplay').textContent = p.email || '—';
  $('#profileLocationDisplay').textContent = p.location || '—';
  $('#profileBioDisplay').textContent = p.bio || '—';
  $('#profileJoined').textContent = p.joined || '—';
  const first = (p.name || 'there').split(/\s+/)[0];
  $('#welcomeText').textContent = `Welcome back, ${first} 👋`;
}
function taskHTML(t, i) {
  return `<div class="task ${t.done ? 'done' : ''}">
    <input type="checkbox" data-i="${i}" ${t.done ? 'checked' : ''}>
    <span>${esc(t.text)}<small>${esc(t.meta)}</small></span>
    <div class="task-actions">
      <button type="button" data-edit="${i}" title="Edit">Edit</button>
      <button type="button" data-del="${i}" title="Delete">✕</button>
    </div>
  </div>`;
}
function renderTasks() {
  const done = state.tasks.filter(t => t.done).length;
  const total = state.tasks.length;
  const pct = total ? Math.round(done / total * 100) : 0;
  $('#tasks').innerHTML = state.tasks.map((t, i) => taskHTML(t, i)).join('') || '<p class="label">No tasks yet. Add one!</p>';
  $('#tasksFull').innerHTML = state.tasks.map((t, i) => taskHTML(t, i)).join('') || '<p class="label">No tasks yet.</p>';
  $('#progressText').textContent = done + ' / ' + total;
  $('#progressBar').style.width = pct + '%';
  $('#progressText2').textContent = done + ' / ' + total;
  $('#progressBar2').style.width = pct + '%';
  $('#completed').textContent = done;
  $('#overall').textContent = pct + '%';
  $('#profileTasksDone').textContent = done;
}
function renderActivity() {
  $('#activity').innerHTML = state.activity.slice(0, 6).map((a, i) =>
    `<div class="activity-item"><div class="dot"></div><div><p>${esc(a)}</p><small>${!i ? 'Just now' : 'Recently'}</small></div></div>`
  ).join('') || '<p class="label">No recent activity.</p>';
}
function renderCalendar() {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const startDay = first.getDay();
  const days = last.getDate();
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  $('#calMonth').textContent = months[m] + ' ' + y;
  let html = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => `<div class="cal-day header">${d}</div>`).join('');
  for (let i = 0; i < startDay; i++) html += '<div class="cal-day empty"></div>';
  for (let d = 1; d <= days; d++) {
    html += `<div class="cal-day${d === now.getDate() ? ' today' : ''}">${d}</div>`;
  }
  $('#calendar').innerHTML = html;
}
function renderAnalytics() {
  const done = state.tasks.filter(t => t.done).length;
  const total = state.tasks.length;
  const pct = total ? Math.round(done / total * 100) : 0;
  $('#analyticsBody').innerHTML = `
    <div class="stat-row"><span>Daily completion</span><b>${pct}%</b></div>
    <div class="stat-row"><span>Completed tasks</span><b>${done}</b></div>
    <div class="stat-row"><span>Open tasks</span><b>${total - done}</b></div>
    <div class="stat-row"><span>Dining orders today</span><b>${state.orders.length}</b></div>
    <div class="stat-row"><span>Clicker high score</span><b>${state.scores.clicker || 0}</b></div>
    <div class="progress-wrap"><div class="progress-line"><span style="width:${pct}%"></span></div></div>
  `;
}
function renderDining() {
  $('#menuList').innerHTML = MENU.map(item => `
    <div class="menu-item">
      <div><span style="margin-right:8px">${item.emoji}</span><b>${esc(item.name)}</b><br><small class="label">UGX ${item.price.toLocaleString()}</small></div>
      <div style="display:flex;align-items:center;gap:12px">
        <span class="price">${item.price.toLocaleString()}</span>
        <button type="button" data-order="${item.id}">Order</button>
      </div>
    </div>
  `).join('');
  if (!state.orders.length) {
    $('#ordersList').innerHTML = '<p class="label">No orders yet. Pick something from the menu.</p>';
    $('#ordersTotal').textContent = '';
    return;
  }
  let total = 0;
  $('#ordersList').innerHTML = state.orders.map((o, i) => {
    total += o.price;
    return `<div class="menu-item">
      <div>${o.emoji} ${esc(o.name)}</div>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="price">${o.price.toLocaleString()}</span>
        <button type="button" data-remove-order="${i}">Remove</button>
      </div>
    </div>`;
  }).join('');
  $('#ordersTotal').textContent = 'Total: UGX ' + total.toLocaleString();
}
const SCIENCE_EQUIP = [
  { name: 'Microscopes', emoji: '🔬', status: 'Ready', detail: '12 units available' },
  { name: 'Bunsen burners', emoji: '🔥', status: 'Ready', detail: '8 stations' },
  { name: 'Chemicals cabinet', emoji: '🧪', status: 'Locked', detail: 'Teacher key required' },
  { name: 'Lab coats', emoji: '🥼', status: 'Ready', detail: '20 coats' }
];
const ADMIN_OFFICES = [
  { name: 'Headteacher', emoji: '👔', detail: 'Open 8am–4pm' },
  { name: 'Bursar', emoji: '💰', detail: 'Fees & receipts' },
  { name: 'Academic office', emoji: '📋', detail: 'Results & reports' },
  { name: 'Discipline', emoji: '⚖️', detail: 'Student affairs' }
];
const ADMIN_NOTICES = [
  'Mid-term exams start next Monday',
  'Parents meeting: Friday 2:00 PM',
  'Library closed Saturday for inventory',
  'Sports day registration open'
];
const CLASSROOMS = [
  { name: 'Room A1', emoji: '🏫', detail: 'S1 · Capacity 40' },
  { name: 'Room A2', emoji: '🏫', detail: 'S2 · Capacity 40' },
  { name: 'Room B1', emoji: '🏫', detail: 'S3 · Capacity 45' },
  { name: 'Room B2', emoji: '🏫', detail: 'S4 · Capacity 45' },
  { name: 'Room C1', emoji: '🏫', detail: 'S5 · Capacity 35' },
  { name: 'Room C2', emoji: '🏫', detail: 'S6 · Capacity 35' }
];
const TIMETABLE = [
  { time: '8:00–9:20', subject: 'Mathematics', room: 'A1' },
  { time: '9:30–10:50', subject: 'Physics', room: 'Science Lab' },
  { time: '11:10–12:30', subject: 'English', room: 'B2' },
  { time: '2:00–3:20', subject: 'Computer Studies', room: 'Computer Lab' },
  { time: '3:30–4:30', subject: 'History', room: 'C1' }
];
const PCS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: 'PC-' + String(i + 1).padStart(2, '0'),
  software: i % 3 === 0 ? 'Office + Python' : (i % 3 === 1 ? 'Office + Scratch' : 'Office + Browser')
}));
function renderLibrary() {
  const filter = ($('#libFilter') && $('#libFilter').value) || 'all';
  const items = state.library.filter(x => filter === 'all' || x.type === filter);
  $('#libraryList').innerHTML = items.map(item => {
    const read = item.status === 'read';
    return `<div class="menu-item">
      <div>
        <span style="margin-right:8px">${item.type === 'book' ? '📖' : '📄'}</span>
        <b>${esc(item.title)}</b>
        <br><small class="label">${esc(item.author)} · ${item.type}</small>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <span class="badge">${read ? 'Read' : 'Available'}</span>
        <button type="button" data-lib-toggle="${item.id}">${read ? 'Unread' : 'Mark read'}</button>
      </div>
    </div>`;
  }).join('') || '<p class="label">No items match this filter.</p>';
  const total = state.library.length;
  const readCount = state.library.filter(x => x.status === 'read').length;
  $('#libraryStats').textContent = `${readCount} of ${total} items marked as read`;
}
function renderScienceLab() {
  $('#scienceEquip').innerHTML = SCIENCE_EQUIP.map(e =>
    `<div class="tile"><div class="emoji">${e.emoji}</div><b>${esc(e.name)}</b><small class="label">${esc(e.status)} · ${esc(e.detail)}</small></div>`
  ).join('');
  if (!state.scienceBookings.length) {
    $('#scienceSessions').innerHTML = '<p class="label">No sessions booked yet.</p>';
  } else {
    $('#scienceSessions').innerHTML = state.scienceBookings.map((s, i) =>
      `<div class="menu-item"><div><b>${esc(s.topic)}</b><br><small class="label">${esc(s.when)}</small></div>
        <button type="button" data-cancel-science="${i}">Cancel</button></div>`
    ).join('');
  }
}
function renderComputerLab() {
  const reservedIds = new Set(state.pcReservations.map(r => r.pcId));
  $('#pcGrid').innerHTML = PCS.map(pc => {
    const taken = reservedIds.has(pc.id);
    return `<div class="tile" style="${taken ? 'opacity:.65' : ''}">
      <div class="emoji">💻</div><b>${pc.name}</b>
      <small class="label">${taken ? 'Reserved' : 'Free'} · ${esc(pc.software)}</small>
    </div>`;
  }).join('');
  if (!state.pcReservations.length) {
    $('#pcReservations').innerHTML = '<p class="label">No PC reservations.</p>';
  } else {
    $('#pcReservations').innerHTML = state.pcReservations.map((r, i) =>
      `<div class="menu-item"><div><b>${esc(r.pcName)}</b><br><small class="label">${esc(r.when)}</small></div>
        <button type="button" data-cancel-pc="${i}">Release</button></div>`
    ).join('');
  }
}
function renderAdmin() {
  $('#adminOffices').innerHTML = ADMIN_OFFICES.map(o =>
    `<button class="tile" data-admin-office="${esc(o.name)}"><div class="emoji">${o.emoji}</div><b>${esc(o.name)}</b><small class="label">${esc(o.detail)}</small></button>`
  ).join('');
  $('#adminNotices').innerHTML = ADMIN_NOTICES.map(n =>
    `<div class="menu-item"><div>📌 ${esc(n)}</div></div>`
  ).join('');
}
function renderClassroom() {
  $('#classroomGrid').innerHTML = CLASSROOMS.map(c =>
    `<div class="tile"><div class="emoji">${c.emoji}</div><b>${esc(c.name)}</b><small class="label">${esc(c.detail)}</small></div>`
  ).join('');
  $('#timetableList').innerHTML = TIMETABLE.map(t =>
    `<div class="menu-item"><div><b>${esc(t.subject)}</b><br><small class="label">${esc(t.time)} · ${esc(t.room)}</small></div></div>`
  ).join('');
}
function render() {
  document.body.classList.toggle('dark', !!state.dark);
  $('#darkToggleSettings').checked = !!state.dark;
  $('#notifToggle').value = state.notif || 'on';
  renderProfileUI();
  renderTasks();
  renderActivity();
  renderCalendar();
  renderAnalytics();
  renderDining();
  if ($('#libraryList')) renderLibrary();
  if ($('#scienceEquip')) renderScienceLab();
  if ($('#pcGrid')) renderComputerLab();
  if ($('#adminOffices')) renderAdmin();
  if ($('#classroomGrid')) renderClassroom();
  save();
}
function showView(name) {
  $$('.view').forEach(v => v.classList.remove('active'));
  const el = $('#view-' + name);
  if (el) el.classList.add('active');
  $$('#nav button').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  const titles = {
    Dashboard: ['Home Dashboard', 'Your personal command center.'],
    Tasks: ['Tasks', 'Manage and complete your work.'],
    Calendar: ['Calendar', 'Plan your days.'],
    Analytics: ['Analytics', 'Track progress over time.'],
    Entertainment: ['Entertainment', 'Movies, music, and downtime.'],
    Playground: ['Playground', 'Mini-games and fun breaks.'],
    Dining: ['School Dining', 'Today’s menu and your orders.'],
    Library: ['Library', 'Books, articles, and reading progress.'],
    ScienceLab: ['Science Lab', 'Equipment and practical sessions.'],
    ComputerLab: ['Computer Lab', 'Workstations and reservations.'],
    Admin: ['Admin Block', 'Offices and school notices.'],
    Classroom: ['Classroom Block', 'Rooms and today’s timetable.'],
    Profile: ['Profile', 'Your account and identity.'],
    Settings: ['Settings', 'Customize your workspace.'],
    Help: ['Help Center', 'Tips to get the most out of ShadowMaster.']
  };
  const t = titles[name] || titles.Dashboard;
  $('#pageTitle').textContent = t[0];
  $('#pageSubtitle').textContent = t[1];
  if (name === 'Analytics') renderAnalytics();
  if (name === 'Calendar') renderCalendar();
  if (name === 'Dining') renderDining();
  if (name === 'Library') renderLibrary();
  if (name === 'ScienceLab') renderScienceLab();
  if (name === 'ComputerLab') renderComputerLab();
  if (name === 'Admin') renderAdmin();
  if (name === 'Classroom') renderClassroom();
  if (name === 'Profile') renderProfileUI();
  if (name !== 'Playground') {
    $('#gameArea').style.display = 'none';
  }
}
function modal(title, body, buttons) {
  $('#modalBox').innerHTML = `<h2>${title}</h2>${body}<div class="modal-actions">${buttons || ''}</div>`;
  $('#modal').classList.add('show');
  const first = $('#modalBox button, #modalBox input');
  if (first) first.focus();
}
function closeModal() { $('#modal').classList.remove('show'); }
function openProfileEditor() {
  const p = state.profile;
  modal('Edit profile', `
    <div class="form-row"><label for="pfName">Full name</label><input id="pfName" value="${esc(p.name)}" placeholder="Your name"></div>
    <div class="form-row"><label for="pfRole">Role / title</label><input id="pfRole" value="${esc(p.role)}" placeholder="e.g. Student"></div>
    <div class="form-row"><label for="pfEmail">Email</label><input id="pfEmail" type="email" value="${esc(p.email)}" placeholder="you@example.com"></div>
    <div class="form-row"><label for="pfLocation">Location</label><input id="pfLocation" value="${esc(p.location)}" placeholder="City, Country"></div>
    <div class="form-row"><label for="pfBio">Bio</label><textarea id="pfBio" placeholder="A short intro…">${esc(p.bio)}</textarea></div>
    <div class="form-row"><label for="pfInitials">Avatar initials</label><input id="pfInitials" maxlength="3" value="${esc(p.initials)}" placeholder="JW"></div>
  `, `
    <button class="secondary" type="button" onclick="closeModal()">Cancel</button>
    <button class="primary" type="button" id="saveProfileBtn">Save profile</button>
  `);
  $('#saveProfileBtn').onclick = () => {
    const name = $('#pfName').value.trim() || 'User';
    let initials = $('#pfInitials').value.trim().toUpperCase().slice(0, 3);
    if (!initials) initials = initialsFromName(name);
    state.profile = {
      ...state.profile,
      name,
      role: $('#pfRole').value.trim() || 'Workspace member',
      email: $('#pfEmail').value.trim(),
      location: $('#pfLocation').value.trim(),
      bio: $('#pfBio').value.trim(),
      initials
    };
    log('Profile updated: ' + name);
    render();
    closeModal();
    showView('Profile');
  };
}
function addTask(prefill) {
  modal('Add task', `
    <div class="form-row"><label for="taskText">Task name</label><input id="taskText" value="${esc(prefill || '')}" placeholder="What needs doing?"></div>
    <div class="form-row"><label for="taskMeta">Category / time</label><input id="taskMeta" value="New · Today" placeholder="e.g. Work · 3:00 PM"></div>
  `, `
    <button class="secondary" type="button" onclick="closeModal()">Cancel</button>
    <button class="primary" type="button" id="confirmAddTask">Add task</button>
  `);
  $('#confirmAddTask').onclick = () => {
    const text = $('#taskText').value.trim();
    if (!text) return;
    state.tasks.push({ text, meta: $('#taskMeta').value.trim() || 'New · Today', done: false });
    log('Added task: ' + text);
    render();
    closeModal();
  };
  $('#taskText').focus();
}
function editTask(i) {
  const t = state.tasks[i];
  if (!t) return;
  modal('Edit task', `
    <div class="form-row"><label for="taskText">Task name</label><input id="taskText" value="${esc(t.text)}"></div>
    <div class="form-row"><label for="taskMeta">Category / time</label><input id="taskMeta" value="${esc(t.meta)}"></div>
  `, `
    <button class="secondary" type="button" onclick="closeModal()">Cancel</button>
    <button class="primary" type="button" id="confirmEditTask">Save</button>
  `);
  $('#confirmEditTask').onclick = () => {
    const text = $('#taskText').value.trim();
    if (!text) return;
    state.tasks[i].text = text;
    state.tasks[i].meta = $('#taskMeta').value.trim() || t.meta;
    log('Edited task: ' + text);
    render();
    closeModal();
  };
}
function deleteTask(i) {
  const t = state.tasks[i];
  if (!t) return;
  modal('Delete task', `<p>Remove <b>${esc(t.text)}</b>?</p>`, `
    <button class="secondary" type="button" onclick="closeModal()">Cancel</button>
    <button class="danger" type="button" id="confirmDel">Delete</button>
  `);
  $('#confirmDel').onclick = () => {
    state.tasks.splice(i, 1);
    log('Deleted task: ' + t.text);
    render();
    closeModal();
  };
}
let clickerCount = 0, clickerTimer = null;
function startClicker() {
  clickerCount = 0;
  $('#gameArea').style.display = 'block';
  $('#gameTitle').textContent = 'Clicker — 10 seconds';
  $('#gameBody').innerHTML = `<div class="score" id="clickScore">0</div>
    <button class="primary" id="clickBtn" style="font-size:18px;padding:16px 28px">CLICK!</button>
    <p class="label" id="clickMsg">Get ready…</p>`;
  let left = 10;
  $('#clickMsg').textContent = 'Go! ' + left + 's left';
  const btn = $('#clickBtn');
  btn.onclick = () => {
    clickerCount++;
    $('#clickScore').textContent = clickerCount;
  };
  clearInterval(clickerTimer);
  clickerTimer = setInterval(() => {
    left--;
    if (left <= 0) {
      clearInterval(clickerTimer);
      btn.disabled = true;
      const best = Math.max(state.scores.clicker || 0, clickerCount);
      state.scores.clicker = best;
      log('Clicker score: ' + clickerCount + (clickerCount >= best ? ' (new best!)' : ''));
      $('#clickMsg').textContent = 'Done! Score: ' + clickerCount + ' · Best: ' + best;
      render();
    } else {
      $('#clickMsg').textContent = 'Go! ' + left + 's left';
    }
  }, 1000);
}
function startGuess() {
  const secret = Math.floor(Math.random() * 20) + 1;
  let tries = 0;
  $('#gameArea').style.display = 'block';
  $('#gameTitle').textContent = 'Guess the number (1–20)';
  $('#gameBody').innerHTML = `
    <div class="form-row"><input id="guessInput" type="number" min="1" max="20" placeholder="Your guess"></div>
    <button class="primary" id="guessBtn">Guess</button>
    <p class="label" id="guessMsg">Make a guess!</p>`;
  $('#guessBtn').onclick = () => {
    const g = parseInt($('#guessInput').value, 10);
    if (isNaN(g) || g < 1 || g > 20) { $('#guessMsg').textContent = 'Enter 1–20'; return; }
    tries++;
    if (g === secret) {
      const best = state.scores.guess ? Math.min(state.scores.guess, tries) : tries;
      state.scores.guess = best;
      log('Number guess won in ' + tries + ' tries');
      $('#guessMsg').textContent = 'Correct! It was ' + secret + '. Tries: ' + tries + ' · Best: ' + best;
      render();
    } else if (g < secret) {
      $('#guessMsg').textContent = 'Too low. Try again.';
    } else {
      $('#guessMsg').textContent = 'Too high. Try again.';
    }
  };
}
function startDice() {
  const a = Math.floor(Math.random() * 6) + 1;
  const b = Math.floor(Math.random() * 6) + 1;
  $('#gameArea').style.display = 'block';
  $('#gameTitle').textContent = 'Dice roll';
  $('#gameBody').innerHTML = `<div class="score">${a} + ${b} = ${a + b}</div>
    <button class="primary" id="diceAgain">Roll again</button>`;
  log('Rolled dice: ' + a + ' + ' + b);
  $('#diceAgain').onclick = startDice;
  render();
}
function startCoin() {
  const side = Math.random() < 0.5 ? 'Heads' : 'Tails';
  $('#gameArea').style.display = 'block';
  $('#gameTitle').textContent = 'Coin flip';
  $('#gameBody').innerHTML = `<div class="score">${side === 'Heads' ? '🪙 Heads' : '🪙 Tails'}</div>
    <button class="primary" id="coinAgain">Flip again</button>`;
  log('Coin flip: ' + side);
  $('#coinAgain').onclick = startCoin;
  render();
}
$('#nav').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (b && b.dataset.view) showView(b.dataset.view);
});
function onTaskContainer(e) {
  if (e.target.matches('input[type=checkbox]')) {
    const i = +e.target.dataset.i;
    state.tasks[i].done = e.target.checked;
    log((e.target.checked ? 'Completed: ' : 'Reopened: ') + state.tasks[i].text);
    render();
  }
  if (e.target.dataset.edit != null) editTask(+e.target.dataset.edit);
  if (e.target.dataset.del != null) deleteTask(+e.target.dataset.del);
}
$('#tasks').addEventListener('click', onTaskContainer);
$('#tasks').addEventListener('change', onTaskContainer);
$('#tasksFull').addEventListener('click', onTaskContainer);
$('#tasksFull').addEventListener('change', onTaskContainer);
$('#addTaskBtn').onclick = () => addTask();
$('#addTaskBtn2').onclick = () => addTask();
$('#addScheduleBtn').onclick = () => addTask('Schedule item');
$('#quickAdd').onclick = () => addTask();
$('#quickCalendar').onclick = () => showView('Calendar');
$('#quickEntertain').onclick = () => showView('Entertainment');
$('#quickPlay').onclick = () => showView('Playground');
$('#quickDining').onclick = () => showView('Dining');
$('#quickWorkspace').onclick = () => {
  state.dark = !state.dark;
  log('Workspace theme changed');
  render();
};
$('#activityBtn').onclick = () => modal('Recent activity', state.activity.map(x => `<p>• ${esc(x)}</p>`).join('') || '<p class="label">None</p>', `<button class="secondary" onclick="closeModal()">Close</button>`);
$('#notifyBtn').onclick = () => {
  if (state.notif === 'off') {
    modal('Notifications', '<p class="label">Notifications are turned off in Settings.</p>', `<button class="primary" onclick="closeModal()">OK</button>`);
  } else {
    modal('Notifications', '<p>🔔 You are all caught up.</p><p class="label">No new notifications right now.</p>', `<button class="primary" onclick="closeModal()">Done</button>`);
  }
};
$('#avatar').onclick = () => showView('Profile');
$('#avatar').onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showView('Profile'); } };
$('#editProfileBtn').onclick = openProfileEditor;
$('#editProfileBtn2').onclick = openProfileEditor;
$('#resetProfileBtn').onclick = () => {
  modal('Reset profile', '<p>Reset name, role, email, location, bio and initials to defaults?</p>', `
    <button class="secondary" onclick="closeModal()">Cancel</button>
    <button class="danger" id="confirmReset">Reset</button>
  `);
  $('#confirmReset').onclick = () => {
    state.profile = { ...DEFAULTS.profile, joined: state.profile.joined || DEFAULTS.profile.joined };
    log('Profile reset to defaults');
    render();
    closeModal();
  };
};
$('#saveSettingsBtn').onclick = () => {
  state.dark = $('#darkToggleSettings').checked;
  state.notif = $('#notifToggle').value;
  log('Settings saved');
  render();
  modal('Settings', '<p>Settings saved successfully.</p>', `<button class="primary" onclick="closeModal()">OK</button>`);
};
$('#entertainGrid').addEventListener('click', e => {
  const t = e.target.closest('[data-ent]');
  if (!t) return;
  const name = t.dataset.ent;
  log('Entertainment: ' + name);
  render();
  modal(name, `<p>Enjoy your <b>${esc(name)}</b> break! This was logged to your activity.</p>`, `<button class="primary" onclick="closeModal()">Nice</button>`);
});
$('#logCustomEnt').onclick = () => {
  modal('Custom activity', `
    <div class="form-row"><label for="entCustom">What are you doing?</label><input id="entCustom" placeholder="e.g. Walk outside"></div>
  `, `
    <button class="secondary" onclick="closeModal()">Cancel</button>
    <button class="primary" id="saveEntCustom">Log it</button>
  `);
  $('#saveEntCustom').onclick = () => {
    const v = $('#entCustom').value.trim();
    if (!v) return;
    log('Entertainment: ' + v);
    render();
    closeModal();
  };
};
$('#gameClicker').onclick = startClicker;
$('#gameGuess').onclick = startGuess;
$('#gameDice').onclick = startDice;
$('#gameCoin').onclick = startCoin;
$('#menuList').addEventListener('click', e => {
  const btn = e.target.closest('[data-order]');
  if (!btn) return;
  const item = MENU.find(m => m.id === btn.dataset.order);
  if (!item) return;
  state.orders.push({ ...item });
  log('Ordered: ' + item.name);
  render();
});
$('#ordersList').addEventListener('click', e => {
  const btn = e.target.closest('[data-remove-order]');
  if (!btn) return;
  const i = +btn.dataset.removeOrder;
  const removed = state.orders.splice(i, 1)[0];
  if (removed) log('Removed order: ' + removed.name);
  render();
});
$('#clearOrdersBtn').onclick = () => {
  if (!state.orders.length) return;
  state.orders = [];
  log('Cleared all dining orders');
  render();
};
$('#quickLibrary').onclick = () => showView('Library');
$('#quickScience').onclick = () => showView('ScienceLab');
$('#quickComputer').onclick = () => showView('ComputerLab');
$('#quickAdmin').onclick = () => showView('Admin');
$('#quickClassroom').onclick = () => showView('Classroom');
$('#libFilter').onchange = () => renderLibrary();
$('#libraryList').addEventListener('click', e => {
  const btn = e.target.closest('[data-lib-toggle]');
  if (!btn) return;
  const item = state.library.find(x => x.id === btn.dataset.libToggle);
  if (!item) return;
  item.status = item.status === 'read' ? 'available' : 'read';
  log((item.status === 'read' ? 'Read: ' : 'Unread: ') + item.title);
  render();
});
$('#addLibItemBtn').onclick = () => {
  modal('Add to library', `
    <div class="form-row"><label for="libTitle">Title</label><input id="libTitle" placeholder="Book or article title"></div>
    <div class="form-row"><label for="libAuthor">Author / source</label><input id="libAuthor" placeholder="Author name"></div>
    <div class="form-row"><label for="libType">Type</label>
      <select id="libType"><option value="book">Book</option><option value="article">Article</option></select>
    </div>
  `, `
    <button class="secondary" onclick="closeModal()">Cancel</button>
    <button class="primary" id="saveLibItem">Add</button>
  `);
  $('#saveLibItem').onclick = () => {
    const title = $('#libTitle').value.trim();
    if (!title) return;
    const author = $('#libAuthor').value.trim() || 'Unknown';
    const type = $('#libType').value;
    state.library.push({ id: 'c' + Date.now(), type, title, author, status: 'available' });
    log('Added to library: ' + title);
    render();
    closeModal();
  };
};
$('#bookScienceBtn').onclick = () => {
  modal('Book science session', `
    <div class="form-row"><label for="sciTopic">Topic / experiment</label><input id="sciTopic" placeholder="e.g. Titration practical"></div>
    <div class="form-row"><label for="sciWhen">When</label><input id="sciWhen" placeholder="e.g. Tomorrow 2:00 PM"></div>
  `, `
    <button class="secondary" onclick="closeModal()">Cancel</button>
    <button class="primary" id="saveSci">Book</button>
  `);
  $('#saveSci').onclick = () => {
    const topic = $('#sciTopic').value.trim();
    if (!topic) return;
    const when = $('#sciWhen').value.trim() || 'TBD';
    state.scienceBookings.push({ topic, when });
    log('Science lab booked: ' + topic);
    render();
    closeModal();
  };
};
$('#scienceSessions').addEventListener('click', e => {
  const btn = e.target.closest('[data-cancel-science]');
  if (!btn) return;
  const i = +btn.dataset.cancelScience;
  const s = state.scienceBookings.splice(i, 1)[0];
  if (s) log('Cancelled science session: ' + s.topic);
  render();
});
$('#reservePcBtn').onclick = () => {
  const reserved = new Set(state.pcReservations.map(r => r.pcId));
  const free = PCS.filter(p => !reserved.has(p.id));
  if (!free.length) {
    modal('Computer lab', '<p>All PCs are reserved right now.</p>', '<button class="primary" onclick="closeModal()">OK</button>');
    return;
  }
  const opts = free.map(p => `<option value="${p.id}">${p.name} — ${p.software}</option>`).join('');
  modal('Reserve a PC', `
    <div class="form-row"><label for="pcSelect">Workstation</label><select id="pcSelect">${opts}</select></div>
    <div class="form-row"><label for="pcWhen">When</label><input id="pcWhen" placeholder="e.g. Today 3:00–4:00 PM"></div>
  `, `
    <button class="secondary" onclick="closeModal()">Cancel</button>
    <button class="primary" id="savePc">Reserve</button>
  `);
  $('#savePc').onclick = () => {
    const id = +$('#pcSelect').value;
    const pc = PCS.find(p => p.id === id);
    if (!pc) return;
    const when = $('#pcWhen').value.trim() || 'Next free period';
    state.pcReservations.push({ pcId: pc.id, pcName: pc.name, when });
    log('Reserved ' + pc.name);
    render();
    closeModal();
  };
};
$('#pcReservations').addEventListener('click', e => {
  const btn = e.target.closest('[data-cancel-pc]');
  if (!btn) return;
  const i = +btn.dataset.cancelPc;
  const r = state.pcReservations.splice(i, 1)[0];
  if (r) log('Released ' + r.pcName);
  render();
});
$('#adminOffices').addEventListener('click', e => {
  const t = e.target.closest('[data-admin-office]');
  if (!t) return;
  const name = t.dataset.adminOffice;
  log('Visited admin: ' + name);
  render();
  modal(name, `<p>You opened the <b>${esc(name)}</b> office desk.</p><p class="label">For real school matters, visit the physical office during working hours.</p>`,
    '<button class="primary" onclick="closeModal()">Got it</button>');
});
$('#modal').onclick = e => { if (e.target.id === 'modal') closeModal(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
$('#search').oninput = e => {
  const q = e.target.value.toLowerCase();
  $$('.task').forEach(t => { t.style.display = t.innerText.toLowerCase().includes(q) ? 'flex' : 'none'; });
};
$('#date').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
render();
showView('Dashboard');
