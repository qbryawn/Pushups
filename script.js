let currentUser = localStorage.getItem("currentUser") || "jonas";
let entries = [];

const $ = id => document.getElementById(id);
const getKey = () => `pushup_entries_${currentUser}`;

function loadEntries() {
  entries = JSON.parse(localStorage.getItem(getKey())) || [];
}

function saveEntries() {
  localStorage.setItem(getKey(), JSON.stringify(entries));
}

function renderEntries() {
  $("entryList").innerHTML = entries
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(e => `
      <div class="entry">
        <span>${e.date}: ${e.count}</span>
        <button onclick="deleteEntry('${e.id}')">✖</button>
      </div>`
    ).join('');
}

function updateStats() {
  const total = entries.reduce((acc, e) => acc + e.count, 0);
  const avg = entries.length ? Math.round(total / entries.length) : 0;
  $("totalPushups").textContent = total;
  $("sessionCount").textContent = entries.length;
  $("streak").textContent = `${calcStreak()} 🔥`;
  $("nextSuggestion").textContent = avg + 5;
  $("suggestion").classList.toggle("hidden", entries.length === 0);
  updateChart();
}

function calcStreak() {
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

function addEntry() {
  const count = parseInt($("count").value);
  const date = $("date").value;
  if (!date || isNaN(count) || count < 1) return;
  entries.push({ id: Date.now(), date, count });
  saveEntries();
  renderEntries();
  updateStats();
  $("count").value = 10;
}

function deleteEntry(id) {
  entries = entries.filter(e => e.id != id);
  saveEntries();
  renderEntries();
  updateStats();
}

function updateChart() {
  const range = $("rangeSelect").value;
  const now = new Date();
  let from = new Date(0);
  if (range === "week") from.setDate(now.getDate() - 7);
  if (range === "month") from.setMonth(now.getMonth() - 1);

  const grouped = {};
  entries.filter(e => new Date(e.date) >= from).forEach(e => {
    grouped[e.date] = (grouped[e.date] || 0) + e.count;
  });

  const labels = Object.keys(grouped).sort();
  const data = labels.map(d => grouped[d]);

  if (window.chart) window.chart.destroy();
  window.chart = new Chart($("progressChart"), {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data, backgroundColor: '#007aff' }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function switchUser(id) {
  currentUser = id;
  localStorage.setItem("currentUser", id);
  $("currentUserLabel").textContent = id === "jonas" ? "Jonas" : "Marija";
  $("userSelect").value = id;
  loadEntries();
  renderEntries();
  updateStats();
}

function toggleMenu() {
  document.querySelector(".side-menu").classList.toggle("open");
}

document.addEventListener("DOMContentLoaded", () => {
  $("date").value = new Date().toISOString().split("T")[0];
  $("userSelect").value = currentUser;
  $("currentUserLabel").textContent = currentUser === "jonas" ? "Jonas" : "Marija";
  loadEntries();
  renderEntries();
  updateStats();
});