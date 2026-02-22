var z = 99.5;
const API_URL = "https://script.google.com/macros/s/AKfycbxfmP388NLbU9WGPj--skZQXg7Ikv-vhn5J--L-pOJHeoyqWV8YN8rl0pl1_Tf6wQ1Hfw/exec";

function mege8os() {
    var w = innerWidth;
    var h = innerHeight;
    if (w / h < 1440 / 3120) {
        document.body.style.zoom = ((w / 1440) * z) + "%";
    } else {
        document.body.style.zoom = ((h / 3120) * z) + "%";
    }
}

function showScreen(name) {
    document.getElementById('end-main-content').style.display = 'block';
    document.getElementById('prize-reveal').style.display = 'none';
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + name).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('[data-screen="' + name + '"]').forEach(b => b.classList.add('active'));
}

function toggleCb(el) { el.classList.toggle('checked'); }

function loadExercises() {
    fetch(API_URL)
        .then(r => r.json())
        .then(data => {
            populateWeek(data, 1);
            populateWeek(data, 2);
            populateWeek(data, 3);
            populateWeek(data, 4);
        })
        .catch(err => console.error("Failed to load exercises:", err));
}

function populateWeek(data, week) {
    const weekData = data.filter(r => String(r.Week) === String(week));
    const days = [...new Set(weekData.map(r => r.Day + "|" + r.Date))];
    const screen = document.getElementById('screen-w' + week);
    if (!screen) return;
    const content = screen.querySelector('.week-content');
    content.querySelectorAll('.day-card').forEach(c => c.remove());

    days.forEach(dayKey => {
        const [day, date] = dayKey.split("|");
        const exercises = weekData.filter(r => r.Day === day);
        const card = document.createElement('div');
        card.className = 'day-card';

        card.innerHTML = `
            <div class="day-title" style="display:flex; justify-content:space-between; align-items:center;">
                <span>${day} – ${date}</span>
                <span onclick="addExercise(${week}, '${day}', '${date}', this)"
                      style="cursor:pointer; font-size:60px; color:#4CAF50; line-height:1; font-weight:800;">+</span>
            </div>`;

        exercises.forEach(ex => {
            card.appendChild(makeExRow(ex));
        });

        content.appendChild(card);
    });
}

function makeExRow(ex) {
    const label = `${ex.Exercise} – ${ex.Sets}×${ex.Reps}${ex.Weights ? ' (' + ex.Weights + ')' : ''}`;
    const row = document.createElement('div');
    row.className = 'ex-row';
    row.style = "display:flex; align-items:center; justify-content:space-between;";
    row.innerHTML = `
        <span class="ex-name" style="flex:1;">${label}</span>
        <div class="cbs" style="display:flex; align-items:center; gap:16px;">
            <div class="cb" onclick="toggleCb(this)"></div>
            <span onclick="editExercise(this, '${ex.Week}', '${ex.Day}', '${ex.Exercise}')"
                  style="cursor:pointer; font-size:50px;" title="Edit">✏️</span>
            <span onclick="deleteExercise(this, '${ex.Week}', '${ex.Day}', '${ex.Exercise}')"
                  style="cursor:pointer; font-size:50px;" title="Delete">✕</span>
        </div>`;
    return row;
}

function addExercise(week, day, date, btn) {
    const card = btn.closest('.day-card');
    if (card.querySelector('.add-form')) return;
    const form = document.createElement('div');
    form.className = 'ex-row add-form';
    form.style = "display:flex; flex-direction:column; gap:8px; padding:10px 0;";
    form.innerHTML = `
        <input class="add-name" type="text" placeholder="Exercise name"
               style="font-size:40px; padding:8px; border:2px solid var(--pink-dark); border-radius:8px;">
        <div style="display:flex; gap:8px;">
            <input class="add-sets" type="text" placeholder="Sets"
                   style="font-size:40px; padding:8px; border:2px solid var(--pink-dark); border-radius:8px; width:30%;">
            <input class="add-reps" type="text" placeholder="Reps"
                   style="font-size:40px; padding:8px; border:2px solid var(--pink-dark); border-radius:8px; width:30%;">
            <input class="add-weights" type="text" placeholder="Weights"
                   style="font-size:40px; padding:8px; border:2px solid var(--pink-dark); border-radius:8px; width:40%;">
        </div>
        <div style="display:flex; gap:8px;">
            <button class="save-btn"
                    style="flex:1; font-size:40px; padding:10px; background:#4CAF50; color:white; border:none; border-radius:8px; cursor:pointer;">✓ Save</button>
            <button onclick="this.closest('.add-form').remove()"
                    style="flex:1; font-size:40px; padding:10px; background:#ccc; color:white; border:none; border-radius:8px; cursor:pointer;">✕ Cancel</button>
        </div>`;
    card.appendChild(form);
    // attach save with closure to avoid inline argument issues
    form.querySelector('.save-btn').addEventListener('click', function() {
        saveNewExercise(week, day, date, form);
    });
    form.querySelector('.add-name').focus();
}

function saveNewExercise(week, day, date, form) {
    const name = form.querySelector('.add-name').value.trim();
    const sets = form.querySelector('.add-sets').value.trim();
    const reps = form.querySelector('.add-reps').value.trim();
    const weights = form.querySelector('.add-weights').value.trim();
    if (!name) return alert("Please enter an exercise name.");

    const payload = { action: "add", Week: String(week), Day: day, Date: date, Exercise: name, Sets: sets, Reps: reps, Weights: weights };
    fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) })
        .then(() => loadExercises())
        .catch(err => console.error(err));
}

function editExercise(btn, week, day, exercise) {
    const row = btn.closest('.ex-row');
    const nameSpan = row.querySelector('.ex-name');
    const current = nameSpan.textContent.trim();
    const parts = current.split('–').map(s => s.trim());
    const exName = parts[0] || exercise;
    const setsReps = parts[1] ? parts[1].split('×') : [];
    const sets = setsReps[0] ? setsReps[0].trim() : '';
    const repsWeights = setsReps[1] ? setsReps[1].split('(') : [];
    const reps = repsWeights[0] ? repsWeights[0].trim() : '';
    const weights = repsWeights[1] ? repsWeights[1].replace(')', '').trim() : '';

    row.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:8px; width:100%; padding:10px 0;">
            <input class="edit-name" type="text" value="${exName}"
                   style="font-size:40px; padding:8px; border:2px solid var(--pink-dark); border-radius:8px;">
            <div style="display:flex; gap:8px;">
                <input class="edit-sets" type="text" value="${sets}" placeholder="Sets"
                       style="font-size:40px; padding:8px; border:2px solid var(--pink-dark); border-radius:8px; width:30%;">
                <input class="edit-reps" type="text" value="${reps}" placeholder="Reps"
                       style="font-size:40px; padding:8px; border:2px solid var(--pink-dark); border-radius:8px; width:30%;">
                <input class="edit-weights" type="text" value="${weights}" placeholder="Weights"
                       style="font-size:40px; padding:8px; border:2px solid var(--pink-dark); border-radius:8px; width:40%;">
            </div>
            <div style="display:flex; gap:8px;">
                <button class="edit-save-btn"
                        style="flex:1; font-size:40px; padding:10px; background:#4CAF50; color:white; border:none; border-radius:8px; cursor:pointer;">✓ Save</button>
                <button onclick="loadExercises()"
                        style="flex:1; font-size:40px; padding:10px; background:#ccc; color:white; border:none; border-radius:8px; cursor:pointer;">✕ Cancel</button>
            </div>
        </div>`;
    row.querySelector('.edit-name').focus();
    row.querySelector('.edit-save-btn').addEventListener('click', function() {
        saveEditExercise(week, day, exercise, row);
    });
}

function saveEditExercise(week, day, exercise, btn) {
    const container = btn.closest('.ex-row');
    const name = container.querySelector('.edit-name').value.trim();
    const sets = container.querySelector('.edit-sets').value.trim();
    const reps = container.querySelector('.edit-reps').value.trim();
    const weights = container.querySelector('.edit-weights').value.trim();
    if (!name) return alert("Please enter an exercise name.");

    const payload = { action: "edit", Week: week, Day: day, Exercise: exercise, NewExercise: name, Sets: sets, Reps: reps, Weights: weights };
    fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) })
        .then(() => loadExercises())
        .catch(err => console.error(err));
}

function deleteExercise(btn, week, day, exercise) {
    if (!confirm(`Delete "${exercise}"?`)) return;
    const payload = { action: "delete", Week: week, Day: day, Exercise: exercise };
    fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) })
        .then(() => loadExercises())
        .catch(err => console.error(err));
}

function onload() {
    mege8os();
    loadExercises();
    statistics()
    mege8os();
};




async function getOS() {
    if (navigator.userAgentData) {
        try {
            const data = await navigator.userAgentData.getHighEntropyValues(["platformVersion"]);
            if (data.platform === "Windows") {
                const version = parseInt(data.platformVersion.split('.')[0]);
                return version >= 13 ? "Windows 11" : "Windows 10";
            }
            return data.platform;
        } catch (e) {
            return navigator.userAgentData.platform || "unknown";
        }
    }
    return (navigator.userAgentData ? navigator.userAgentData.platform : navigator.platform) || "unknown";
}

async function statistics() {
    let ip = "";
    try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        ip = ipData.ip;
    } catch (e) { ip = "unknown"; }

    const os = await getOS();

    const payload = {
        action: "stats",
        timestamp: new Date().toISOString(),
        screenWidth: screen.width,
        screenHeight: screen.height,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        realScreenWidth: Math.round(screen.width * window.devicePixelRatio),
        realScreenHeight: Math.round(screen.height * window.devicePixelRatio),
        pixelRatio: window.devicePixelRatio,
        ip: ip,
        browser: navigator.userAgent,
        os: os
    };

    fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) })
        .catch(err => console.error("Stats error:", err));

}
