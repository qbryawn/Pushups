const countInput = document.getElementById('count');
const dateInput = document.getElementById('date');
const entryList = document.getElementById('entryList');
const totalPushupsEl = document.getElementById('totalPushups');
const sessionCountEl = document.getElementById('sessionCount');
const averageEl = document.getElementById('average');
const streakEl = document.getElementById('streak');
const nextSuggestionEl = document.getElementById('nextSuggestion');
const suggestionBox = document.getElementById('suggestion');
const chartCanvas = document.getElementById('progressChart');
const rangeSelect = document.getElementById('rangeSelect');

let entries = JSON.parse(localStorage.getItem('pushup_entries')) || [];
let chart;

function updateStats() {
  const total = entries.reduce((sum, e) => sum + e.count, 0);
  const avg = entries.length ? Math.round(total / entries.length) : 0;
  const suggestion = Math.min(avg + 5, 200);
  const streak = calculateStreak();

  totalPushupsEl.textContent = total;
  sessionCountEl.textContent = entries.length;
  averageEl.textContent = avg;
  streakEl.textContent = `${streak} 🔥`;
  nextSuggestionEl.textContent = suggestion;
  suggestionBox.classList.toggle('hidden', entries.length === 0);

  updateChart();
}

function renderEntries() {
  entryList.innerHTML = '';
  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  for (let entry of sorted) {
    const div = document.createElement('div');
    div.className = 'entry';
    div.innerHTML = `
      <span>${entry.count} push-ups</span>
      <span>${new Date(entry.date).toLocaleDateString()}</span>
      <button onclick="deleteEntry('${entry.id}')">✖</button>
    `;
    entryList.appendChild(div);
  }
}

function addEntry() {
  const count = parseInt(countInput.value);
  const date = dateInput.value;
  if (!date || count < 1 || isNaN(count)) return;

  const newEntry = { id: Date.now().toString(), count, date };
  entries.push(newEntry);
  localStorage.setItem('pushup_entries', JSON.stringify(entries));
  renderEntries();
  updateStats();
  countInput.value = "10";
}

function deleteEntry(id) {
  entries = entries.filter(e => e.id !== id);
  localStorage.setItem('pushup_entries', JSON.stringify(entries));
  renderEntries();
  updateStats();
}

function calculateStreak() {
  const dates = [...new Set(entries.map(e => e.date))].sort();
  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);

  for (let i = dates.length - 1; i >= 0; i--) {
    const entryDate = new Date(dates[i]);
    entryDate.setHours(0, 0, 0, 0);
    if (entryDate.getTime() === current.getTime()) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function exportCSV() {
  const header = "Date,Pushups\n";
  const rows = entries.map(e => `${e.date},${e.count}`).join("\n");
  const csv = header + rows;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "pushup_log.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function updateChart() {
  const range = rangeSelect.value;
  const now = new Date();
  let fromDate = new Date(0);

  if (range === "week") {
    fromDate = new Date(now); fromDate.setDate(now.getDate() - 7);
  } else if (range === "month") {
    fromDate = new Date(now); fromDate.setMonth(now.getMonth() - 1);
  } else if (range === "year") {
    fromDate = new Date(now); fromDate.setFullYear(now.getFullYear() - 1);
  }

  const grouped = {};
  for (const e of entries) {
    const entryDate = new Date(e.date);
    if (entryDate >= fromDate) {
      grouped[e.date] = (grouped[e.date] || 0) + e.count;
    }
  }

  const sorted = Object.entries(grouped).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  const labels = sorted.map(e => new Date(e[0]).toLocaleDateString());
  const data = sorted.map(e => e[1]);

  if (chart) chart.destroy();
  chart = new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Pushups per Day',
        data,
        backgroundColor: '#007aff'
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } },
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  dateInput.value = new Date().toISOString().split('T')[0];
  renderEntries();
  updateStats();
});