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
      </div>`).join('');
}

function updateStats() {
  const total = entries.reduce((sum, e) => sum + e.count, 0);
  const best = entries.sort((a, b) => b.count - a.count)[0]?.count || "-";
  const streak = calcStreak();

  $("totalPushups").textContent = total;
  $("sessionCount").textContent = entries.length;
  $("streak").textContent = `${streak} 🔥`;
  $("bestDay").textContent = best;
}

function calcStreak() {
  const dates = [...new Set(entries.map(e => e.date))].sort();
  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);

  for (let i = dates.length - 1; i >= 0; i--) {
    const d = new Date(dates[i]);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === current.getTime()) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else break;
  }
  return streak;
}

function addEntry() {
  const date = $("date").value;
  const count = parseInt($("count").value);
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

function switchUser(id) {
  currentUser = id;
  localStorage.setItem("currentUser", id);
  $("currentUserLabel").textContent = id === "jonas" ? "Jonas" : "Marija";
  $("userSelect").value = id;
  loadEntries();
  renderEntries();
  updateStats();
}

document.addEventListener("DOMContentLoaded", () => {
  $("date").value = new Date().toISOString().split("T")[0];
  $("userSelect").value = currentUser;
  $("currentUserLabel").textContent = currentUser === "jonas" ? "Jonas" : "Marija";
  loadEntries();
  renderEntries();
  updateStats();
});