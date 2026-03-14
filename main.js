/* ═══════════════════════════════════════════════════════════
   CampusIQ — Main Application Logic
   ═══════════════════════════════════════════════════════════ */

// ── DOM References ──
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ═══════════════ THEME TOGGLE ═══════════════
const themeToggle = $('#themeToggle');
const html = document.documentElement;

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('campusiq-theme', theme);
}
function initTheme() {
  const saved = localStorage.getItem('campusiq-theme') || 'light';
  setTheme(saved);
}
themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  setTheme(current === 'light' ? 'dark' : 'light');
});
initTheme();

// ═══════════════ CURSOR GLOW EFFECT ═══════════════
const cursorGlow = document.createElement('div');
cursorGlow.className = 'cursor-glow visible';
document.body.appendChild(cursorGlow);

document.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top = e.clientY + 'px';
});

// ═══════════════ TAB SWITCHING + GOOEY NAV ═══════════════
const tabBtns = $$('.tab-btn');
const tabPanels = $$('.tab-panel');
const tabIndicator = $('#tabIndicator');
const gooeyPill = $('#gooeyPill');
const gooeyContainer = $('#gooeyContainer');
const navCenter = $('#navCenter');

function updateIndicator(btn) {
  const rect = btn.getBoundingClientRect();
  const parentRect = navCenter.getBoundingClientRect();
  tabIndicator.style.left = (rect.left - parentRect.left) + 'px';
  tabIndicator.style.width = rect.width + 'px';
}

function updateGooeyPill(btn) {
  const rect = btn.getBoundingClientRect();
  const containerRect = gooeyContainer.getBoundingClientRect();
  const left = rect.left - containerRect.left;
  gooeyPill.style.left = left + 'px';
  gooeyPill.style.width = rect.width + 'px';
}

// Spawn radial droplets that burst outward from the destination pill
function spawnDroplets(targetBtn) {
  const containerRect = gooeyContainer.getBoundingClientRect();
  const btnRect = targetBtn.getBoundingClientRect();

  // Center of the destination pill (relative to gooey container)
  const cx = btnRect.left + btnRect.width / 2 - containerRect.left;
  const cy = btnRect.top + btnRect.height / 2 - containerRect.top;

  const dropletCount = 7;

  for (let i = 0; i < dropletCount; i++) {
    const droplet = document.createElement('span');
    droplet.className = 'gooey-droplet';

    // Random size: 10-20px
    const size = 10 + Math.random() * 12;
    droplet.style.width = size + 'px';
    droplet.style.height = size + 'px';

    // Position at pill center
    droplet.style.left = (cx - size / 2) + 'px';
    droplet.style.top = (cy - size / 2) + 'px';

    // Random angle around full circle
    const angle = (Math.PI * 2 / dropletCount) * i + (Math.random() - 0.5) * 0.8;
    // Random burst distance: 40-90px
    const peakDist = 40 + Math.random() * 50;
    // End distance (pull back closer to pill)
    const endDist = 5 + Math.random() * 15;
    // Peak scale
    const peakScale = 0.8 + Math.random() * 0.6;

    const peakX = Math.cos(angle) * peakDist;
    const peakY = Math.sin(angle) * peakDist;
    const endX = Math.cos(angle) * endDist;
    const endY = Math.sin(angle) * endDist;

    const duration = 500 + Math.random() * 250;

    droplet.style.setProperty('--tx-start', '0px');
    droplet.style.setProperty('--ty-start', '0px');
    droplet.style.setProperty('--tx-peak', `${peakX}px`);
    droplet.style.setProperty('--ty-peak', `${peakY}px`);
    droplet.style.setProperty('--tx-end', `${endX}px`);
    droplet.style.setProperty('--ty-end', `${endY}px`);
    droplet.style.setProperty('--peak-scale', peakScale);
    droplet.style.setProperty('--duration', `${duration}ms`);

    gooeyContainer.appendChild(droplet);

    // Cleanup after animation
    setTimeout(() => droplet.remove(), duration + 50);
  }
}

function getPanelId(tabId) {
  const map = { academic: 'panelAcademic', whatsdue: 'panelWhatsDue', asksenior: 'panelAskSenior' };
  return map[tabId];
}

let activeTabBtn = $('.tab-btn.active');

function switchTab(tabId) {
  const newBtn = $(`.gooey-text-layer [data-tab="${tabId}"]`);
  if (!newBtn || newBtn === activeTabBtn) return;

  // Spawn gooey droplets bursting from the destination pill
  spawnDroplets(newBtn);

  tabBtns.forEach(b => b.classList.remove('active'));
  tabPanels.forEach(p => { p.classList.remove('active'); p.style.animation = 'none'; });

  newBtn.classList.add('active');
  updateIndicator(newBtn);
  updateGooeyPill(newBtn);
  activeTabBtn = newBtn;

  const panel = $(`#${getPanelId(tabId)}`);
  requestAnimationFrame(() => {
    panel.style.animation = '';
    panel.classList.add('active');
  });
  if (tabId === 'academic') {
    cursorGlow.classList.add('visible');
  } else {
    cursorGlow.classList.remove('visible');
  }
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// Init gooey pill + indicator position
requestAnimationFrame(() => {
  const activeBtn = $('.tab-btn.active');
  updateIndicator(activeBtn);
  updateGooeyPill(activeBtn);
});
window.addEventListener('resize', () => {
  const activeBtn = $('.tab-btn.active');
  updateIndicator(activeBtn);
  updateGooeyPill(activeBtn);
});

// ═══════════════ SUB-TABS (Academic) ═══════════════
const subTabs = $$('.sub-tab');
const subPanels = $$('.sub-panel');

subTabs.forEach(st => {
  st.addEventListener('click', () => {
    subTabs.forEach(s => s.classList.remove('active'));
    subPanels.forEach(p => { p.classList.remove('active'); p.style.animation = 'none'; });
    st.classList.add('active');
    const panel = $(`#subPanel${st.dataset.subtab.charAt(0).toUpperCase() + st.dataset.subtab.slice(1)}`);
    requestAnimationFrame(() => {
      panel.style.animation = '';
      panel.classList.add('active');
    });
  });
});

// ═══════════════ DROP ZONES ═══════════════
function setupDropZone(zoneId, inputId, previewId, contentId) {
  const zone = $(`#${zoneId}`);
  const input = $(`#${inputId}`);
  const preview = $(`#${previewId}`);
  const content = $(`#${contentId}`);

  ['dragenter', 'dragover'].forEach(ev => {
    zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
  });
  ['dragleave', 'drop'].forEach(ev => {
    zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove('drag-over'); });
  });

  zone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file, preview, content, zone);
  });

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file, preview, content, zone);
  });
}

function handleFile(file, preview, content, zone) {
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.classList.remove('hidden');
    content.classList.add('hidden');
    zone.classList.add('has-file');
    preview._base64 = e.target.result;
  };
  reader.readAsDataURL(file);
}

setupDropZone('attendanceDropZone', 'attendanceFileInput', 'attendancePreview', 'attendanceDropContent');
setupDropZone('marksDropZone', 'marksFileInput', 'marksPreview', 'marksDropContent');

// ═══════════════ MOCK DATA ═══════════════

const mockAttendance = {
  overall: 72,
  dangerCount: 2,
  totalClasses: 186,
  subjects: [
    { code: 'CS201', name: 'Data Structures & Algorithms', attended: 28, total: 34, percentage: 82, verdict: 'Can bunk 3 more' },
    { code: 'CS202', name: 'Python Programming', attended: 22, total: 30, percentage: 73, verdict: 'Attend next 2 to be safe' },
    { code: 'PH101', name: 'Engineering Physics', attended: 18, total: 28, percentage: 64, verdict: 'Need 5 more to recover' },
    { code: 'MA201', name: 'Probability & Statistics', attended: 26, total: 32, percentage: 81, verdict: 'Can bunk 2 more' },
    { code: 'ME101', name: 'Joy of Engineering', attended: 14, total: 22, percentage: 64, verdict: 'Need 4 more to recover' },
    { code: 'HS201', name: 'Understanding Business', attended: 30, total: 40, percentage: 75, verdict: 'Right on the edge — attend all' }
  ]
};

const mockMarks = {
  cgpa: 8.24,
  subjects: [
    { name: 'Data Structures & Algorithms', marks: 88, credits: 4, grade: 'A', points: 9 },
    { name: 'Python Programming', marks: 76, credits: 4, grade: 'B+', points: 8 },
    { name: 'Engineering Physics', marks: 71, credits: 3, grade: 'B', points: 7 },
    { name: 'Probability & Statistics', marks: 82, credits: 4, grade: 'A-', points: 8.5 },
    { name: 'Joy of Engineering', marks: 90, credits: 2, grade: 'A+', points: 10 },
    { name: 'Understanding Business', marks: 68, credits: 3, grade: 'B-', points: 6.5 }
  ]
};

// ═══════════════ ATTENDANCE EXTRACTION ═══════════════
$('#attendanceExtractBtn').addEventListener('click', async () => {
  const loading = $('#attendanceLoading');
  const results = $('#attendanceResults');
  const preview = $('#attendancePreview');

  loading.classList.remove('hidden');
  results.classList.add('hidden');

  let data = null;
  if (!preview._base64) {
    loading.classList.add('hidden');
    results.classList.add('hidden');
    showToast('Please upload an attendance screenshot first');
    return;
  }

  try {
    const resp = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: preview._base64, type: 'attendance' })
    });
    
    if (!resp.ok) {
      throw new Error('API extraction failed');
    }
    
    data = await resp.json();
    
    if (data.isValid === false) {
      throw new Error('Invalid image uploaded');
    }

    loading.classList.add('hidden');
    renderAttendance(data);
    results.classList.remove('hidden');
    showToast('Attendance data extracted successfully ✓');
  } catch (e) {
    loading.classList.add('hidden');
    if (e.message === 'Invalid image uploaded') {
      showToast('Please upload a valid attendance screenshot. This image doesn\'t seem right.');
    } else {
      showToast('Error extracting attendance data. Please try again.');
    }
    console.error(e);
  }
});

function getPercentColor(pct) {
  if (pct >= 75) return 'safe';
  if (pct >= 65) return 'warning';
  return 'danger';
}

function renderAttendance(data) {
  const strip = $('#attendanceStatStrip');
  strip.innerHTML = `
    <div class="stat-pill">
      <div class="stat-pill-label">Overall %</div>
      <div class="stat-pill-value ${getPercentColor(data.overall)}">${data.overall}%</div>
    </div>
    <div class="stat-pill">
      <div class="stat-pill-label">Subjects in Danger</div>
      <div class="stat-pill-value ${data.dangerCount > 0 ? 'danger' : 'safe'}">${data.dangerCount}</div>
    </div>
    <div class="stat-pill">
      <div class="stat-pill-label">Total Classes</div>
      <div class="stat-pill-value">${data.totalClasses}</div>
    </div>
  `;

  const grid = $('#attendanceSubjectGrid');
  grid.innerHTML = data.subjects.map(s => {
    const color = getPercentColor(s.percentage);
    const colorVar = color === 'safe' ? 'var(--safe)' : color === 'warning' ? 'var(--warning)' : 'var(--danger)';
    return `
      <div class="subject-card">
        <div class="subject-code">${s.code}</div>
        <div class="subject-name">${s.name}</div>
        <div class="subject-stats">
          <span class="subject-percent" style="color:${colorVar}">${s.percentage}%</span>
          <span class="subject-fraction">${s.attended}/${s.total}</span>
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" style="width:${s.percentage}%;background:${colorVar}"></div>
        </div>
        <div class="subject-verdict">${s.verdict}</div>
      </div>
    `;
  }).join('');
}

// ═══════════════ MARKS EXTRACTION ═══════════════
$('#marksExtractBtn').addEventListener('click', async () => {
  const loading = $('#marksLoading');
  const results = $('#marksResults');
  const preview = $('#marksPreview');

  loading.classList.remove('hidden');
  results.classList.add('hidden');

  let data = null;
  if (!preview._base64) {
    loading.classList.add('hidden');
    results.classList.add('hidden');
    showToast('Please upload a marks screenshot first');
    return;
  }

  try {
    const resp = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: preview._base64, type: 'marks' })
    });
    
    if (!resp.ok) {
      throw new Error('API extraction failed');
    }
    
    data = await resp.json();
    
    if (data.isValid === false) {
      throw new Error('Invalid image uploaded');
    }

    loading.classList.add('hidden');
    renderMarks(data);
    results.classList.remove('hidden');
    showToast('Marks data extracted successfully ✓');
  } catch (e) {
    loading.classList.add('hidden');
    if (e.message === 'Invalid image uploaded') {
      showToast('Please upload a valid marks screenshot. This image doesn\'t seem right.');
    } else {
      showToast('Error extracting marks data. Please try again.');
    }
    console.error(e);
  }
});

function getGradeClass(grade) {
  if (grade.startsWith('A')) return 'grade-A';
  if (grade.startsWith('B')) return 'grade-B';
  if (grade.startsWith('C')) return 'grade-C';
  return 'grade-D';
}

function renderMarks(data) {
  const tableWrap = $('#marksTableWrap');
  tableWrap.innerHTML = `
    <table class="marks-table">
      <thead>
        <tr><th>Subject</th><th>Marks</th><th>Credits</th><th>Grade</th><th>Points</th></tr>
      </thead>
      <tbody>
        ${data.subjects.map(s => `
          <tr>
            <td>${s.name}</td>
            <td class="td-mono">${s.marks}</td>
            <td class="td-mono">${s.credits}</td>
            <td><span class="grade-pill ${getGradeClass(s.grade)}">${s.grade}</span></td>
            <td class="td-mono">${s.points}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // CGPA display
  const cgpaDisp = $('#cgpaDisplay');
  cgpaDisp.innerHTML = `
    <div class="cgpa-label">Current CGPA</div>
    <div class="cgpa-value">${data.cgpa.toFixed(2)}</div>
  `;

  // What-If Simulator
  renderWhatIfSliders(data);
}

function renderWhatIfSliders(data) {
  const container = $('#whatifSliders');
  container.innerHTML = data.subjects.map((s, i) => `
    <div class="whatif-slider-row">
      <span class="whatif-slider-label">${s.name}</span>
      <input type="range" class="whatif-slider" min="0" max="10" step="0.5" value="${s.points}" data-index="${i}" data-credits="${s.credits}" />
      <span class="whatif-slider-val" id="sliderVal${i}">${s.points}</span>
    </div>
  `).join('');

  // Live CGPA updates
  const sliders = container.querySelectorAll('.whatif-slider');
  function updateProjectedCGPA() {
    let totalPoints = 0, totalCredits = 0;
    sliders.forEach(sl => {
      const credits = parseFloat(sl.dataset.credits);
      totalPoints += parseFloat(sl.value) * credits;
      totalCredits += credits;
    });
    const cgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    $('#whatifCgpa').textContent = cgpa.toFixed(2);
  }
  sliders.forEach(sl => {
    sl.addEventListener('input', () => {
      $(`#sliderVal${sl.dataset.index}`).textContent = sl.value;
      updateProjectedCGPA();
    });
  });
  updateProjectedCGPA();
}

// ═══════════════ WHAT'S DUE ═══════════════
const taskData = [
  { id: 1, name: 'Python Programming — Lab Assignment 3', tag: 'Assignment', tagClass: 'tag-assignment', due: 'Due today', dueClass: 'due-today', source: 'Classroom', overdue: false },
  { id: 2, name: 'Engineering Physics — Unit 2 Quiz', tag: 'Quiz', tagClass: 'tag-quiz', due: 'Overdue', dueClass: 'due-overdue', source: 'Classroom', overdue: true },
  { id: 3, name: 'Joy of Engineering — Project submission', tag: 'Assignment', tagClass: 'tag-assignment', due: 'In 2 days', dueClass: 'due-future', source: 'WhatsApp', overdue: false },
  { id: 4, name: 'Probability and Statistics — Tutorial sheet 4', tag: 'Assignment', tagClass: 'tag-assignment', due: 'In 4 days', dueClass: 'due-future', source: 'Classroom', overdue: false },
  { id: 5, name: 'Understanding Business — Case study presentation', tag: 'Event', tagClass: 'tag-event', due: 'In 6 days', dueClass: 'due-future', source: 'WhatsApp', overdue: false }
];

let tasks = [...taskData];
let nextId = 6;

function renderTasks(filter = 'all') {
  const list = $('#taskList');
  const filtered = filter === 'overdue' ? tasks.filter(t => t.overdue) : tasks;

  list.innerHTML = filtered.map(t => `
    <div class="task-item" data-id="${t.id}" id="task-${t.id}">
      <div class="task-check" onclick="completeTask(${t.id})"></div>
      <div class="task-body">
        <div class="task-name">${t.name}</div>
      </div>
      <div class="task-meta">
        <span class="task-tag ${t.tagClass}">${t.tag}</span>
        <span class="task-due ${t.dueClass}">${t.due}</span>
        <span class="task-source">${t.source}</span>
      </div>
    </div>
  `).join('');

  $('#pendingBadge').textContent = tasks.length;
}

window.completeTask = function(id) {
  const item = $(`#task-${id}`);
  const check = item.querySelector('.task-check');
  const name = item.querySelector('.task-name');

  check.classList.add('checked');
  name.classList.add('struck');

  setTimeout(() => {
    item.classList.add('completing');
    setTimeout(() => {
      tasks = tasks.filter(t => t.id !== id);
      renderTasks(currentFilter);
      showToast('Task completed — nice work! 🎉');
    }, 500);
  }, 400);
};

let currentFilter = 'all';
$$('.filter-pill').forEach(fp => {
  fp.addEventListener('click', () => {
    $$('.filter-pill').forEach(f => f.classList.remove('active'));
    fp.classList.add('active');
    currentFilter = fp.dataset.filter;
    renderTasks(currentFilter);
  });
});

$('#addTaskBtn').addEventListener('click', addNewTask);
$('#addTaskInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') addNewTask(); });

function addNewTask() {
  const input = $('#addTaskInput');
  const text = input.value.trim();
  if (!text) return;

  tasks.push({
    id: nextId++,
    name: text,
    tag: 'Assignment',
    tagClass: 'tag-assignment',
    due: 'No date',
    dueClass: 'due-future',
    source: 'Manual',
    overdue: false
  });
  input.value = '';
  renderTasks(currentFilter);
  showToast('Task added ✓');
}

renderTasks();

// ═══════════════ ASK A SENIOR ═══════════════
let questions = [
  {
    id: 1,
    author: '3rd Year CSE',
    anon: false,
    category: 'Placements',
    catClass: 'cat-placements',
    text: 'Which companies actually visited BMU last year with a CGPA cutoff below 7.5? The official list feels incomplete.',
    time: '2 hours ago',
    upvotes: 14,
    upvoted: false,
    replies: [
      { author: '4th Year CSE', text: 'TCS, Infosys, Capgemini all had 6.5+ cutoffs. Deloitte was 7.0. Goldman was 8.0 strict. DSA matters more than CGPA for most though.' }
    ]
  },
  {
    id: 2,
    author: '1st Year CSE',
    anon: false,
    category: 'Academics',
    catClass: 'cat-academics',
    text: 'Is the Python Programming prof in CSE-IV as strict about attendance as people say?',
    time: '5 hours ago',
    upvotes: 8,
    upvoted: false,
    replies: [
      { author: '2nd Year CSE', text: 'Yes, 75% is non-negotiable for him. But genuinely helpful if you show up and ask questions.' }
    ]
  }
];
let qNextId = 3;

function getCatClass(cat) {
  const map = {
    'Academics': 'cat-academics',
    'Placements': 'cat-placements',
    'Electives': 'cat-electives',
    'Campus Life': 'cat-campus-life',
    'Projects': 'cat-projects'
  };
  return map[cat] || 'cat-academics';
}

function renderQuestions() {
  const feed = $('#questionsFeed');
  feed.innerHTML = questions.map(q => `
    <div class="question-card" id="qcard-${q.id}">
      <div class="question-header">
        <span class="author-badge ${q.anon ? 'anon' : ''}">${q.anon ? 'Anonymous' : q.author}</span>
        <span class="category-tag ${q.catClass}">${q.category}</span>
        <span class="question-time">${q.time}</span>
      </div>
      <p class="question-text">${q.text}</p>
      <div class="question-actions">
        <button class="upvote-btn ${q.upvoted ? 'upvoted' : ''}" onclick="toggleUpvote(${q.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          <span>${q.upvotes}</span>
        </button>
        <button class="expand-btn" onclick="toggleReplies(${q.id})">
          ${q.replies.length} ${q.replies.length === 1 ? 'reply' : 'replies'} — tap to ${$(`#replies-${q.id}`)?.classList?.contains('open') ? 'collapse' : 'expand'}
        </button>
      </div>
      <div class="replies-section" id="replies-${q.id}">
        ${q.replies.map(r => `
          <div class="reply-item">
            <div class="reply-avatar">${r.author.charAt(0)}</div>
            <div class="reply-body">
              <div class="reply-author">${r.author}</div>
              <div class="reply-text">${r.text}</div>
            </div>
          </div>
        `).join('')}
        <div class="reply-input-row">
          <input type="text" class="reply-input" placeholder="Write a reply..." id="replyInput-${q.id}" />
          <button class="reply-send-btn" onclick="sendReply(${q.id})">Reply</button>
        </div>
      </div>
    </div>
  `).join('');
}

window.toggleUpvote = function(id) {
  const q = questions.find(q => q.id === id);
  if (!q) return;
  q.upvoted = !q.upvoted;
  q.upvotes += q.upvoted ? 1 : -1;
  renderQuestions();
};

window.toggleReplies = function(id) {
  const section = $(`#replies-${id}`);
  if (section) section.classList.toggle('open');
};

window.sendReply = function(id) {
  const input = $(`#replyInput-${id}`);
  const text = input?.value?.trim();
  if (!text) return;

  const q = questions.find(q => q.id === id);
  if (!q) return;
  q.replies.push({ author: 'You', text });
  renderQuestions();
  // Re-open replies
  setTimeout(() => {
    const section = $(`#replies-${id}`);
    if (section) section.classList.add('open');
  }, 50);
  showToast('Reply posted ✓');
};

// Incognito toggle
$('#incognitoCheckbox').addEventListener('change', (e) => {
  const hint = $('#incognitoHint');
  if (e.target.checked) {
    hint.classList.remove('hidden');
  } else {
    hint.classList.add('hidden');
  }
});

// Post question
$('#postQuestionBtn').addEventListener('click', () => {
  const year = $('#yearSelect').value;
  const category = $('#categorySelect').value;
  const text = $('#questionTextarea').value.trim();
  const incognito = $('#incognitoCheckbox').checked;

  if (!year || !category || !text) {
    showToast('Please fill in all fields');
    return;
  }

  questions.unshift({
    id: qNextId++,
    author: year,
    anon: incognito,
    category,
    catClass: getCatClass(category),
    text,
    time: 'Just now',
    upvotes: 0,
    upvoted: false,
    replies: []
  });

  $('#yearSelect').selectedIndex = 0;
  $('#categorySelect').selectedIndex = 0;
  $('#questionTextarea').value = '';
  $('#incognitoCheckbox').checked = false;
  $('#incognitoHint').classList.add('hidden');

  renderQuestions();
  showToast('Question posted! Seniors will see it soon 🚀');
});

renderQuestions();

// ═══════════════ TOAST SYSTEM ═══════════════
function showToast(message) {
  const container = $('#toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ═══════════════ INIT ═══════════════
// Ensure tab indicator is correctly positioned after fonts load
document.fonts.ready.then(() => {
  updateIndicator($('.tab-btn.active'));
  updateGooeyPill($('.tab-btn.active'));
});

// ═══════════════ LANYARD PHYSICS ═══════════════
(() => {
  const container = $('#lanyardContainer');
  const card = $('#lanyardCard');
  const ropePath = $('#lanyardRopePath');
  const ropeSvg = $('#lanyardRopeSvg');
  if (!container || !card || !ropePath) return;

  // ── Configuration ──
  const NUM_SEGMENTS = 8;
  const SEGMENT_LENGTH = 18;
  const GRAVITY = 0.6;
  const DAMPING = 0.98;
  const ITERATIONS = 12; // constraint solver iterations
  const CARD_WIDTH = 100;
  const CARD_HEIGHT = 150;

  // ── Anchor point (top-right of viewport) ──
  // Pin position relative to the container
  const pinX = 250;
  const pinY = 0;

  // ── Rest position for the card (hanging straight down) ──
  const restX = pinX;
  const restY = pinY + NUM_SEGMENTS * SEGMENT_LENGTH;

  // ── Rope segments (verlet particles) ──
  const particles = [];
  for (let i = 0; i <= NUM_SEGMENTS; i++) {
    particles.push({
      x: pinX,
      y: pinY + i * SEGMENT_LENGTH,
      oldX: pinX,
      oldY: pinY + i * SEGMENT_LENGTH,
    });
  }

  // ── State ──
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  // ── Position the card initially ──
  function updateCardPosition() {
    const last = particles[particles.length - 1];
    const prev = particles[particles.length - 2];

    // Rotation based on rope angle at the card attachment
    const dx = last.x - prev.x;
    const dy = last.y - prev.y;
    const angle = Math.atan2(dx, dy) * (180 / Math.PI);
    const rotation = -angle * 0.8; // damped rotation

    card.style.left = (last.x - CARD_WIDTH / 2) + 'px';
    card.style.top = (last.y - 8) + 'px'; // slight offset for clip
    card.style.transform = `rotate(${rotation}deg)`;
  }

  // ── Draw SVG rope ──
  function drawRope() {
    if (particles.length < 2) return;

    // Build a smooth cubic Bézier path through all points
    let d = `M ${particles[0].x} ${particles[0].y}`;

    if (particles.length === 2) {
      d += ` L ${particles[1].x} ${particles[1].y}`;
    } else {
      // Use Catmull-Rom to Bézier conversion for smooth curve
      for (let i = 0; i < particles.length - 1; i++) {
        const p0 = particles[Math.max(0, i - 1)];
        const p1 = particles[i];
        const p2 = particles[Math.min(particles.length - 1, i + 1)];
        const p3 = particles[Math.min(particles.length - 1, i + 2)];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }
    }

    ropePath.setAttribute('d', d);
  }

  // ── Physics step ──
  function physicsStep() {
    // Verlet integration — apply gravity and velocity
    for (let i = 1; i <= NUM_SEGMENTS; i++) {
      const p = particles[i];
      const vx = (p.x - p.oldX) * DAMPING;
      const vy = (p.y - p.oldY) * DAMPING;

      p.oldX = p.x;
      p.oldY = p.y;

      p.x += vx;
      p.y += vy + GRAVITY;
    }

    // If dragging, move the last particle to follow the pointer
    if (isDragging) {
      const last = particles[particles.length - 1];
      last.x = last.oldX = dragTargetX;
      last.y = last.oldY = dragTargetY;
    }

    // Pin the first particle
    particles[0].x = pinX;
    particles[0].y = pinY;

    // Distance constraints (relaxation)
    for (let iter = 0; iter < ITERATIONS; iter++) {
      for (let i = 0; i < NUM_SEGMENTS; i++) {
        const a = particles[i];
        const b = particles[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) continue;

        const diff = (dist - SEGMENT_LENGTH) / dist;

        if (i === 0) {
          // Pin is fixed, only move b
          b.x -= dx * diff;
          b.y -= dy * diff;
        } else if (isDragging && i === NUM_SEGMENTS - 1) {
          // Card is being dragged, only move a
          a.x += dx * diff;
          a.y += dy * diff;
        } else {
          const halfDiff = diff * 0.5;
          a.x += dx * halfDiff;
          a.y += dy * halfDiff;
          b.x -= dx * halfDiff;
          b.y -= dy * halfDiff;
        }
      }

      // Re-pin first particle each iteration
      particles[0].x = pinX;
      particles[0].y = pinY;
    }
  }

  // ── Drag target ──
  let dragTargetX = 0;
  let dragTargetY = 0;

  // ── Animation loop ──
  function animate() {
    physicsStep();
    drawRope();
    updateCardPosition();
    requestAnimationFrame(animate);
  }
  animate();

  // ── Pointer events ──
  card.addEventListener('pointerdown', (e) => {
    isDragging = true;
    card.classList.add('dragging');

    const containerRect = container.getBoundingClientRect();
    const last = particles[particles.length - 1];

    // Calculate offset from pointer to particle center
    dragOffsetX = last.x - (e.clientX - containerRect.left);
    dragOffsetY = last.y - (e.clientY - containerRect.top);

    dragTargetX = last.x;
    dragTargetY = last.y;

    card.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;

    const containerRect = container.getBoundingClientRect();
    dragTargetX = (e.clientX - containerRect.left) + dragOffsetX;
    dragTargetY = (e.clientY - containerRect.top) + dragOffsetY;
  });

  window.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    card.classList.remove('dragging');
  });
})();
