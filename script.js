document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    let pushupData = JSON.parse(localStorage.getItem('pushupData')) || {
        sessions: [],
        lastEntryDate: null,
        currentStreak: 0
    };

    // DOM elements
    const pushupCountInput = document.getElementById('pushup-count');
    const logButton = document.getElementById('log-button');
    const historyList = document.getElementById('history-list');
    const totalPushupsEl = document.getElementById('total-pushups');
    const totalSessionsEl = document.getElementById('total-sessions');
    const currentStreakEl = document.getElementById('current-streak');

    // Update stats display
    function updateStats() {
        const totalPushups = pushupData.sessions.reduce((sum, session) => sum + session.count, 0);
        const totalSessions = pushupData.sessions.length;

        totalPushupsEl.textContent = totalPushups;
        totalSessionsEl.textContent = totalSessions;
        currentStreakEl.textContent = pushupData.currentStreak;
    }

    // Update history display
    function updateHistory() {
        if (pushupData.sessions.length === 0) {
            historyList.innerHTML = '<div class="empty-state">No sessions logged yet</div>';
            return;
        }

        historyList.innerHTML = '';
        pushupData.sessions.slice().reverse().forEach(session => {
            const item = document.createElement('div');
            item.className = 'history-item';
            
            const date = new Date(session.date);
            const dateStr = date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
            
            item.innerHTML = `
                <span class="history-date">${dateStr}</span>
                <span class="history-count">${session.count} push-ups</span>
            `;
            
            historyList.appendChild(item);
        });
    }

    // Check and update streak
    function updateStreak(newDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const newEntryDate = new Date(newDate);
        newEntryDate.setHours(0, 0, 0, 0);
        
        // If first entry
        if (!pushupData.lastEntryDate) {
            pushupData.currentStreak = 1;
        } 
        // If logged today, don't increase streak
        else if (newEntryDate.getTime() === today.getTime() && 
                 pushupData.lastEntryDate === today.toISOString()) {
            // Streak remains the same
        }
        // If logged yesterday or today (and previous was before yesterday)
        else {
            const lastEntryDate = new Date(pushupData.lastEntryDate);
            lastEntryDate.setHours(0, 0, 0, 0);
            
            const dayDifference = (newEntryDate - lastEntryDate) / (1000 * 60 * 60 * 24);
            
            if (dayDifference === 1) {
                // Consecutive day
                pushupData.currentStreak++;
            } else if (dayDifference > 1) {
                // Broken streak
                pushupData.currentStreak = 1;
            }
        }
        
        pushupData.lastEntryDate = newEntryDate.toISOString();
    }

    // Log a new session
    function logSession(count) {
        if (!count || count < 1) return;
        
        const now = new Date();
        pushupData.sessions.push({
            date: now.toISOString(),
            count: parseInt(count)
        });
        
        updateStreak(now);
        saveData();
        updateStats();
        updateHistory();
        
        // Clear input
        pushupCountInput.value = '';
        pushupCountInput.focus();
    }

    // Save data to localStorage
    function saveData() {
        localStorage.setItem('pushupData', JSON.stringify(pushupData));
    }

    // Event listeners
    logButton.addEventListener('click', function() {
        logSession(pushupCountInput.value);
    });

    pushupCountInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            logSession(pushupCountInput.value);
        }
    });

    // Initialize the app
    updateStats();
    updateHistory();
});