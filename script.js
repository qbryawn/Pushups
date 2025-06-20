document.addEventListener('DOMContentLoaded', function() {
    // Initialize data with sample data for demo
    let pushupData = JSON.parse(localStorage.getItem('pushupData')) || {
        sessions: [],
        lastEntryDate: null,
        currentStreak: 0,
        longestStreak: 0
    };

    // DOM elements
    const elements = {
        pushupInput: document.getElementById('pushup-count'),
        logButton: document.getElementById('log-button'),
        historyList: document.getElementById('history-list'),
        totalPushups: document.getElementById('total-pushups'),
        totalSessions: document.getElementById('total-sessions'),
        currentStreak: document.getElementById('current-streak'),
        streakDisplay: document.getElementById('streak-display')
    };

    // Initialize the app
    init();

    function init() {
        updateStats();
        updateHistory();
        setupEventListeners();
    }

    function setupEventListeners() {
        elements.logButton.addEventListener('click', logSession);
        elements.pushupInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') logSession();
        });
    }

    function logSession() {
        const count = parseInt(elements.pushupInput.value);
        if (!count || count < 1) {
            alert('Please enter a valid number of push-ups');
            return;
        }

        const now = new Date();
        pushupData.sessions.push({
            date: now.toISOString(),
            count: count
        });

        updateStreak(now);
        saveData();
        updateStats();
        updateHistory();
        
        // Reset input
        elements.pushupInput.value = '';
        elements.pushupInput.focus();
        
        // Visual feedback
        elements.logButton.innerHTML = '<i class="fas fa-check"></i> Logged!';
        setTimeout(() => {
            elements.logButton.innerHTML = '<i class="fas fa-save"></i> Log It';
        }, 1500);
    }

    function updateStreak(newDate) {
        const today = startOfDay(new Date());
        const newEntryDate = startOfDay(new Date(newDate));
        
        // If first entry ever
        if (!pushupData.lastEntryDate) {
            pushupData.currentStreak = 1;
        } 
        else {
            const lastEntryDate = startOfDay(new Date(pushupData.lastEntryDate));
            const dayDifference = (newEntryDate - lastEntryDate) / (1000 * 60 * 60 * 24);
            
            if (dayDifference === 1) {
                // Consecutive day
                pushupData.currentStreak++;
            } else if (dayDifference > 1) {
                // Broken streak
                pushupData.currentStreak = 1;
            }
            // If same day, streak remains unchanged
        }
        
        // Update longest streak if needed
        if (pushupData.currentStreak > pushupData.longestStreak) {
            pushupData.longestStreak = pushupData.currentStreak;
        }
        
        pushupData.lastEntryDate = newEntryDate.toISOString();
    }

    function startOfDay(date) {
        const newDate = new Date(date);
        newDate.setHours(0, 0, 0, 0);
        return newDate;
    }

    function updateStats() {
        const totalPushups = pushupData.sessions.reduce((sum, session) => sum + session.count, 0);
        const totalSessions = pushupData.sessions.length;

        elements.totalPushups.textContent = totalPushups;
        elements.totalSessions.textContent = totalSessions;
        elements.currentStreak.textContent = pushupData.currentStreak;
        
        // Update streak display
        let streakText = '';
        if (pushupData.currentStreak === 0) {
            streakText = 'Start your streak today!';
        } else if (pushupData.currentStreak === 1) {
            streakText = '🔥 1-day streak';
        } else {
            streakText = `🔥 ${pushupData.currentStreak}-day streak`;
        }
        elements.streakDisplay.textContent = streakText;
    }

    function updateHistory() {
        if (pushupData.sessions.length === 0) {
            elements.historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No sessions logged yet</p>
                    <p class="hint">Complete your first session to see data here</p>
                </div>
            `;
            return;
        }

        elements.historyList.innerHTML = '';
        
        // Show last 7 days by default
        const recentSessions = pushupData.sessions.slice().reverse().slice(0, 7);
        
        recentSessions.forEach(session => {
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
                <span class="history-count">${session.count} reps</span>
            `;
            
            elements.historyList.appendChild(item);
        });
    }

    function saveData() {
        localStorage.setItem('pushupData', JSON.stringify(pushupData));
    }
});