const countSlider = document.getElementById('count');
const countValue = document.getElementById('countValue');
const dateInput = document.getElementById('date');
const entryList = document.getElementById('entryList');
const totalPushupsEl = document.getElementById('totalPushups');
const sessionCountEl = document.getElementById('sessionCount');
const averageEl = document.getElementById('average');
const nextSuggestionEl = document.getElementById('nextSuggestion');
const suggestionBox = document.getElementById('suggestion');

let entries = JSON.parse(localStorage.getItem('pushup_entries')) || [];

function updateCountValue() {
  countValue.textContent = countSlider.value;
}

function updateStats() {
  const total = entries.reduce((sum, e) => sum + e.count, 0);
  const avg = entries.length ? Math.round(total / entries.length) : 0;
  const suggestion = Math.min(avg + 5, 200);

  totalPushupsEl.textContent = total;
  sessionCountEl.textContent = entries.length;
  averageEl.textContent = avg;
  nextSuggestionEl.textContent = suggestion;

  suggestionBox.classList.toggle('hidden', entries.length === 0);
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
  const count = parseInt(countSlider.value);
  const date = dateInput.value;
  if (!date || count < 1) return;

  const newEntry = {
    id: Date.now().toString(),
    count,
    date
  };

  entries.push(newEntry);
  localStorage.setItem('pushup_entries', JSON.stringify(entries));
  renderEntries();
  updateStats();
  countSlider.value = 10;
  updateCountValue();
  dateInput.value = new Date().toISOString().split('T')[0];
}

function deleteEntry(id) {
  entries = entries.filter(e => e.id !== id);
  localStorage.setItem('pushup_entries', JSON.stringify(entries));
  renderEntries();
  updateStats();
}

countSlider.addEventListener('input', updateCountValue);
document.addEventListener('DOMContentLoaded', () => {
  updateCountValue();
  dateInput.value = new Date().toISOString().split('T')[0];
  renderEntries();
  updateStats();
});
