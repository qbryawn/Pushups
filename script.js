let currentUser = localStorage.getItem("currentUser") || "user1";
let entries = [];

const getKey = () => `pushup_entries_${currentUser}`;

const countEl = document.getElementById('count');
const dateEl = document.getElementById('date');
const totalEl = document.getElementById('totalPushups');
const sessionEl = document.getElementById('sessionCount');
const streakEl = document.getElementById('streak');
const nextEl = document.getElementById('nextSuggestion');
const suggBox = document.getElementById('suggestion');
const rangeEl = document.getElementById('rangeSelect');
const ctx = document.getElementById('progressChart');
const entryList = document.getElementById('entryList');
const currentUserLabel = document.getElementById('currentUserLabel');
const userSelect = document.getElementById('userSelect');

let chart;

function loadEntries() {
  entries = JSON.parse(localStorage.getItem(getKey())) || [];
}

function saveEntries() {
  localStorage.setItem(getKey(), JSON.stringify(entries));
}

function renderEntries() {
  entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  entryList.innerHTML = entries.map(e => `
    <div class="entry">
      <span>${e.date}: ${e.count}</span>
      <button onclick="deleteEntry('${e.id}')">✖</button>
    </div>`).join('');
}

function updateStats() {
  const total = entries.reduce((sum, e) => sum + e.count, 0);
  const avg = entries.length ? Math.round(total / entries.length) : 0;
  const suggestion = avg + 5;
  totalEl.textContent = total;
  sessionEl.textContent = entries.length;
  streakEl.textContent = `${calculateStreak()} 🔥`;
  nextEl.textContent = suggestion;
  suggBox.classList.toggle('hidden', entries.length === 0);
  updateChart();
}

function addEntry() {
  const date = dateEl.value;
  const count = parseInt(countEl.value);
  if (!date || isNaN(count) || count < 1) return;
  entries.push({ id: Date.now(), date, count });
  saveEntries();
  renderEntries();
  updateStats();
  countEl.value = "10";
}

function deleteEntry(id) {
  entries = entries.filter(e => e.id != id);
  saveEntries();
  renderEntries();
  updateStats();
}

function calculateStreak() {
  const days = [...new Set(entries.map(e => e.date))].sort();
  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);

  for (let i = days.length - 1; i >= 0; i--) {
    const d = new Date(days[i]);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === current.getTime()) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else break;
  }
  return streak;
}

function exportCSV() {
  const csv = 'Date,Count\n' + entries.map(e => `${e.date},${e.count}`).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv]));
  a.download = `${currentUser}_pushups.csv`;
  a.click();
}

function updateChart() {
  const range = rangeEl.value;
  const now = new Date();
  let from = new Date(0);
  if (range === 'week') from.setDate(now.getDate() - 7);
  else if (range === 'month') from.setMonth(now.getMonth() - 1);

  const filtered = entries.filter(e => new Date(e.date) >= from);
  const grouped = {};
  filtered.forEach(e => {
    grouped[e.date] = (grouped[e.date] || 0) + e.count;
  });

  const labels = Object.keys(grouped).sort();
  const data = labels.map(d => grouped[d]);

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ data, backgroundColor: '#007aff' }] },
    options: {
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { display: false } },
      responsive: true
    }
  });
}

function switchUser(userId) {
  currentUser = userId;
  localStorage.setItem("currentUser", currentUser);
  currentUserLabel.textContent = userId.replace("user", "User ");
  loadEntries();
  renderEntries();
  updateStats();
}

function toggleMenu() {
  document.querySelector('.side-menu').classList.toggle('open');
  document.querySelector('.app').classList.toggle('dimmed');
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

document.addEventListener('DOMContentLoaded', () => {
  currentUserLabel.textContent = currentUser.replace("user", "User ");
  userSelect.value = currentUser;
  dateEl.value = new Date().toISOString().split('T')[0];
  loadEntries();
  renderEntries();
  updateStats();
});