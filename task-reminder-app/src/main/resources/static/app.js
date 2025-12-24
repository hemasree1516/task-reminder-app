const API = "http://localhost:8080/api/tasks";
let tasks = [];
let filteredTasks = [];
let editingTaskId = null;
let currentView = 'table';

// Pagination State
let currentPage = 1;
let itemsPerPage = 10;

// Pomodoro State
let pomoTimeLeft = 1500;
let pomoInterval = null;
let isPomoRunning = false;

const quotes = ["Focus on being productive instead of busy.", "Action is the foundational key to all success.", "Your future is created by what you do today."];

const tableView = document.getElementById("tableView");
const cardView = document.getElementById("cardView");
const calendarView = document.getElementById("calendarView");
const modal = document.getElementById("taskModal");

/* ================= INITIALIZATION ================= */
fetchTasks();
startClock();
setRandomQuote();

async function fetchTasks() {
    try {
        const res = await fetch(API);
        tasks = await res.json();
        updateDashboardStats();
        applyFilters();
    } catch (e) { showToast("Backend connection failed", "error"); }
}

function updateDashboardStats() {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'DONE').length;
    document.getElementById('countTotal').innerText = total;
    document.getElementById('countPending').innerText = tasks.filter(t => t.status === 'PENDING').length;
    document.getElementById('countDone').innerText = done;

    const progress = total === 0 ? 0 : Math.round((done / total) * 100);
    const circle = document.getElementById('progressCircle');
    circle.style.strokeDashoffset = 157 - (progress / 100) * 157;
    document.getElementById('progressText').innerText = `${progress}%`;
}

/* ================= POMODORO LOGIC ================= */
function openPomodoro() {
    const overlay = document.getElementById("pomoOverlay");
    overlay.classList.remove("hidden");
    if (overlay.requestFullscreen) overlay.requestFullscreen();
}

function closePomodoro() {
    document.getElementById("pomoOverlay").classList.add("hidden");
    if (document.exitFullscreen) document.exitFullscreen();
    resetPomoTimer();
}

function togglePomoTimer() {
    const btn = document.getElementById("pomoStartBtn");
    const setup = document.getElementById("pomoSetup");
    const timerDisplay = document.getElementById("pomoTimer");
    const input = document.getElementById("pomoInput");

    if (isPomoRunning) {
        clearInterval(pomoInterval);
        btn.innerText = "Resume";
    } else {
        if (timerDisplay.classList.contains("hidden")) {
            pomoTimeLeft = (parseInt(input.value) || 25) * 60;
            displayPomoTime();
        }
        setup.classList.add("hidden");
        timerDisplay.classList.remove("hidden");
        pomoInterval = setInterval(() => {
            if (pomoTimeLeft <= 0) { clearInterval(pomoInterval); resetPomoTimer(); }
            else { pomoTimeLeft--; displayPomoTime(); }
        }, 1000);
        btn.innerText = "Pause";
    }
    isPomoRunning = !isPomoRunning;
}

function displayPomoTime() {
    const mins = Math.floor(pomoTimeLeft / 60);
    const secs = pomoTimeLeft % 60;
    document.getElementById("pomoTimer").innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function resetPomoTimer() {
    clearInterval(pomoInterval);
    isPomoRunning = false;
    document.getElementById("pomoSetup").classList.remove("hidden");
    document.getElementById("pomoTimer").classList.add("hidden");
    document.getElementById("pomoStartBtn").innerText = "Start";
}

/* ================= MODAL & EDIT LOGIC ================= */
function toggleAddTask() {
    modal.classList.toggle("hidden");
    if (!modal.classList.contains("hidden")) {
        document.getElementById("modalTitle").innerText = editingTaskId ? "Edit Task" : "Add New Task";
    } else {
        editingTaskId = null;
        clearForm();
    }
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    editingTaskId = id;
    document.getElementById("title").value = task.title;
    document.getElementById("description").value = task.description || "";
    document.getElementById("dueDate").value = task.dueDate || "";
    document.getElementById("priority").value = task.priority;
    toggleAddTask();
}

async function saveTask() {
    const title = document.getElementById("title").value.trim();
    if (!title) return showToast("Title required", "error");
    const payload = { title, description: document.getElementById("description").value, dueDate: document.getElementById("dueDate").value, priority: document.getElementById("priority").value, status: editingTaskId ? tasks.find(t => t.id === editingTaskId).status : "PENDING" };
    const method = editingTaskId ? "PUT" : "POST";
    const url = editingTaskId ? `${API}/${editingTaskId}` : API;
    const res = await fetch(url, { method, headers: {"Content-Type": "application/json"}, body: JSON.stringify(payload) });
    if (res.ok) { toggleAddTask(); fetchTasks(); }
}

/* ================= ACTIONS & RENDERING ================= */
function toggleDescription(id) {
    const descDiv = document.getElementById(`desc-${id}`);
    const isExpanded = descDiv.classList.contains('expanded');
    document.querySelectorAll('.desc-container').forEach(el => el.classList.remove('expanded'));
    if (!isExpanded) descDiv.classList.add('expanded');
}

async function markDone(id) { await fetch(`${API}/${id}/complete`, { method: "PUT" }); fetchTasks(); }
async function deleteTask(id) { if(confirm("Delete task?")) { await fetch(`${API}/${id}`, { method: "DELETE" }); fetchTasks(); } }

function applyFilters() {
    const s = document.getElementById("search").value.toLowerCase();
    const st = document.getElementById("statusFilter").value;
    const pr = document.getElementById("priorityFilter").value;
    filteredTasks = tasks.filter(t => (t.title.toLowerCase().includes(s)) && (!st || t.status === st) && (!pr || t.priority === pr));
    renderCurrentView();
}

function renderCurrentView() {
    const pagin = document.getElementById("pagination");
    pagin.classList.toggle('hidden', currentView === 'calendar');
    if (currentView === 'table') showTableView();
    else if (currentView === 'card') showCardView();
    else showCalendarView();
}

function paginate(data) {
    const start = (currentPage - 1) * itemsPerPage;
    const totalPages = Math.ceil(data.length / itemsPerPage);
    document.getElementById('pageInfo').innerText = `Page ${currentPage} of ${totalPages || 1}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages || totalPages === 0;
    return data.slice(start, start + itemsPerPage);
}

function changePage(dir) { currentPage += dir; renderCurrentView(); }
function updatePageSize() { itemsPerPage = parseInt(document.getElementById("itemsPerPageSelect").value); resetPaginationAndFilter(); }
function resetPaginationAndFilter() { currentPage = 1; applyFilters(); }

function showTableView() {
    currentView = 'table'; updateActiveUI('btnTable'); hideViews(); tableView.classList.remove("hidden");
    const pData = paginate(filteredTasks);
    let html = `<table><tr><th>Title (Click to expand)</th><th>Due Date</th><th>Status</th><th>Priority</th><th>Actions</th></tr>`;
    pData.forEach(t => {
        html += `<tr class="task-row fade-in" onclick="toggleDescription(${t.id})">
                <td><b>${t.title}</b></td><td>${t.dueDate || "-"}</td>
                <td><span class="badge ${t.status}">${t.status}</span></td><td><span class="badge ${t.priority}">${t.priority}</span></td>
                <td>${t.status==='PENDING'?`<button class="act-btn act-done" onclick="event.stopPropagation(); markDone(${t.id})">Done</button>`:''}
                    <button class="act-btn act-edit" onclick="event.stopPropagation(); editTask(${t.id})">Edit</button>
                    <button class="act-btn act-del" onclick="event.stopPropagation(); deleteTask(${t.id})">Delete</button></td></tr>
            <tr><td colspan="5" style="padding:0; border:none;"><div id="desc-${t.id}" class="desc-container"><div class="desc-text" style="padding:15px; font-size:1rem; border-left:4px solid #0d47a1;">${t.description||"No details."}</div></div></td></tr>`;
    });
    tableView.innerHTML = html + "</table>";
}

function showCardView() {
    currentView = 'card'; updateActiveUI('btnCards'); hideViews(); cardView.classList.remove("hidden");
    const pData = paginate(filteredTasks);
    let html = `<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:25px;">`;
    pData.forEach(t => {
        html += `<div class="stat-card fade-in" style="flex-direction:column; align-items:start;">
            <h3>${t.title}</h3><p style="color:#64748b; font-size:1rem; margin:10px 0;">${t.description||"No details."}</p>
            <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                <span class="badge ${t.priority}">${t.priority}</span>
                <div><button class="act-btn act-edit" onclick="editTask(${t.id})"><i class="fa-solid fa-pen"></i></button><button class="act-btn act-del" onclick="deleteTask(${t.id})"><i class="fa-solid fa-trash"></i></button></div>
            </div></div>`;
    });
    cardView.innerHTML = html + "</div>";
}

function showCalendarView() {
    currentView = 'calendar'; updateActiveUI('btnCalendar'); hideViews(); calendarView.classList.remove("hidden");
    const now = new Date(); const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    let html = `<div class="calendar-grid">`;
    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(w => html += `<div class="cal-header">${w}</div>`);
    for (let i = 0; i < firstDay; i++) html += `<div class="cal-day"></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const dayTasks = tasks.filter(t => t.dueDate === dateStr);
        html += `<div class="cal-day"><b>${d}</b>${dayTasks.map(t => `<div class="task-pill" style="background:#eff6ff; color:#1d4ed8; padding:4px 8px; border-radius:4px; font-size:12px; margin-top:5px; border-left:3px solid #1d4ed8;">${t.title}</div>`).join('')}</div>`;
    }
    calendarView.innerHTML = html + "</div>";
}

/* ================= HUB LOGIC & HELPERS ================= */
function startClock() { setInterval(() => { const now = new Date(); document.getElementById('liveClock').innerText = now.toLocaleTimeString(); const hrs = now.getHours(); document.getElementById('liveGreeting').innerText = `${hrs < 12 ? "Good Morning" : hrs < 17 ? "Good Afternoon" : "Good Evening"}, User!`; }, 1000); }
function setRandomQuote() { document.getElementById('dailyQuote').innerText = quotes[Math.floor(Math.random() * quotes.length)]; }
function updateActiveUI(id) { document.querySelectorAll('.view-switch button').forEach(b => b.classList.remove('active')); document.getElementById(id).classList.add('active'); }
function hideViews() { [tableView, cardView, calendarView].forEach(v => v.classList.add("hidden")); }
function clearForm() { document.getElementById("title").value = ""; document.getElementById("description").value = ""; document.getElementById("dueDate").value = ""; document.getElementById("priority").value = "LOW"; }
function clearFilters() { document.getElementById("search").value=""; document.getElementById("statusFilter").value=""; document.getElementById("priorityFilter").value=""; resetPaginationAndFilter(); }
function showToast(msg, type="success") { const t = document.getElementById("toast"); t.innerText = msg; t.className = `toast show ${type}`; setTimeout(() => t.className="toast hidden", 3000); }