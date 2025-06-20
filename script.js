let entries = JSON.parse(localStorage.getItem('pushup_entries')) || [];
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
let chart;

function renderEntries(){
  entries.sort((a,b)=>new Date(b.date)-new Date(a.date));
  entryList.innerHTML = entries.map(e=>`
    <div class="entry"><span>${e.date}: ${e.count}</span>
    <button onclick="del('${e.id}')">✖</button></div>`).join('');
}
function updateStats(){
  const total=entries.reduce((a,e)=>a+e.count,0);
  const avg = entries.length?Math.round(total/entries.length):0;
  const suggestion=avg+5;
  totalEl.textContent=total; sessionEl.textContent=entries.length;
  streakEl.textContent=`${calcStreak()} 🔥`; nextEl.textContent=suggestion;
  suggBox.classList.toggle('hidden',!entries.length);
  updateChart();
}
function addEntry(){
  const d=dateEl.value, c=parseInt(countEl.value);
  if(!d||c<1) return;
  entries.push({id:Date.now(),date:d,count:c});
  localStorage.setItem('pushup_entries',JSON.stringify(entries));
  renderEntries(); updateStats();
}
function del(id){
  entries=entries.filter(e=>e.id!=id);
  localStorage.setItem('pushup_entries',JSON.stringify(entries));
  renderEntries(); updateStats();
}
function calcStreak(){
  const days=[...new Set(entries.map(e=>e.date))].sort();
  let curr=new Date(),st=0;
  curr.setHours(0,0,0,0);
  for(let i=days.length-1;i>=0;i--){
    const d=new Date(days[i]);d.setHours(0,0,0,0);
    if(d.getTime()===curr.getTime()){st++;curr.setDate(curr.getDate()-1);} else break;
  }
  return st;
}
function exportCSV(){
  const csv='Date,Count\n'+entries.map(e=>`${e.date},${e.count}`).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv]));a.download='log.csv';a.click();
}
function updateChart(){
  const range=rangeEl.value;
  const now=new Date();
  let from=new Date();
  if(range==='week') from.setDate(now.getDate()-7);
  else if(range==='month') from.setMonth(now.getMonth()-1);
  else from=new Date(0);
  const data=entries.filter(e=>new Date(e.date)>=from).reduce((o,e)=>{o[e.date]=(o[e.date]||0)+e.count;return o;},{});
  const labels=Object.keys(data).sort();
  const vals=labels.map(d=>data[d]);
  if(chart) chart.destroy();
  chart=new Chart(ctx,{type:'bar',data:{labels, datasets:[{data:vals,backgroundColor:'#007aff'}]},options:{scales:{y:{beginAtZero:true}},plugins:{legend:{display:false}}}});
}
function toggleMenu(){
  document.body.querySelector('.side-menu').classList.toggle('open');
  document.querySelector('.app').classList.toggle('dimmed');
}
function toggleDarkMode(){
  document.body.classList.toggle('dark-mode');
}

document.addEventListener('DOMContentLoaded',()=>{
  dateEl.value=new Date().toISOString().split('T')[0];
  renderEntries(); updateStats();
});