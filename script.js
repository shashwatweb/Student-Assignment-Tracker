const $ = s => document.querySelector(s);
const STATUS = ["Pending", "In Progress", "Completed"];
const esc = s => s.replace(/[&<>"']/g, c => "&#" + c.charCodeAt(0) + ";");
const fmt = d => new Date(d + "T00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

let items = JSON.parse(localStorage.getItem("tasks") || "null") || [
  { id: 1, title: "Calculus Homework 5", subject: "Calculus", date: "2026-11-25", status: "Pending" },
  { id: 2, title: "Physics Lab Report", subject: "Physics", date: "2026-11-28", status: "In Progress" },
  { id: 3, title: "Web Dev Project Draft", subject: "Web Development", date: "2026-12-01", status: "Pending" },
  { id: 4, title: "Digital Design Quiz", subject: "Digital Design", date: "2026-12-03", status: "Completed" },
  { id: 5, title: "AI Ethics Essay", subject: "AI & ML", date: "2026-12-05", status: "Completed" }
];
let view = "dashboard";
let cal = new Date(); cal.setDate(1);

const save = () => localStorage.setItem("tasks", JSON.stringify(items));

function render() {
  const done = items.filter(i => i.status === "Completed").length;
  const pct = items.length ? Math.round(done / items.length * 100) : 0;
  $("#total").textContent = items.length;
  $("#pending").textContent = items.length - done;
  $("#completed").textContent = done;
  $("#ring").style.setProperty("--p", pct);
  $("#ring").textContent = pct + "%";
  $("#bar").style.width = pct + "%";
  $("#ofText").textContent = `${done} of ${items.length}`;

  // Subject filter (rebuilt from data)
  const subs = [...new Set(items.map(i => i.subject))];
  let sub = subs.includes($("#subject").value) ? $("#subject").value : "";
  $("#subject").innerHTML = '<option value="">All Subjects</option>' +
    subs.map(s => `<option ${s === sub ? "selected" : ""}>${esc(s)}</option>`).join("");

  // Assignment list
  const q = $("#search").value.toLowerCase(), st = $("#status").value;
  const rows = items
    .filter(i => (view === "completed" ? i.status === "Completed" : !st || i.status === st)
      && (!sub || i.subject === sub)
      && (i.title + i.subject).toLowerCase().includes(q))
    .sort((a, b) => $("#sort").value === "title" ? a.title.localeCompare(b.title) : a.date.localeCompare(b.date));

  $("#list").innerHTML = rows.map(i => `
    <div class="row">
      <span class="ico">📘</span>
      <div><b>${esc(i.title)}</b><small>${esc(i.subject)}</small></div>
      <span>📅 ${fmt(i.date)}</span>
      <button class="pill ${i.status.replace(" ", "")}" data-act="status" data-id="${i.id}" title="Click to change status">${i.status}</button>
      <span class="acts">
        <button data-act="edit" data-id="${i.id}" title="Edit">✏️</button>
        <button data-act="del" data-id="${i.id}" title="Delete">🗑️</button>
      </span>
    </div>`).join("") || '<p class="empty">No assignments found. Click "+ Add Assignment" to create one.</p>';

  // Upcoming deadlines
  $("#upcoming").innerHTML = items.filter(i => i.status !== "Completed")
    .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3)
    .map(i => `<div class="up"><b>${new Date(i.date + "T00:00").toLocaleDateString("en-US", { month: "short" })}<br>${i.date.slice(8)}</b>
      <div>${esc(i.title)}<small>(${esc(i.subject)})</small></div></div>`).join("")
    || '<p class="empty">Nothing due. 🎉</p>';

  // Calendar
  const y = cal.getFullYear(), m = cal.getMonth();
  $("#month").textContent = cal.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  let h = [..."SMTWTFS"].map(d => `<b>${d}</b>`).join("") + "<i></i>".repeat(cal.getDay());
  for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) {
    const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const due = items.filter(i => i.date === iso);
    h += `<div class="day ${iso === today ? "today" : ""} ${due.length ? "due" : ""}">${d}${due.map(i => `<small>${esc(i.title)}</small>`).join("")}</div>`;
  }
  $("#days").innerHTML = h;
}

// Switch between Dashboard / Assignments / Calendar / Completed
function setView(v) {
  view = v;
  document.body.dataset.view = v;
  document.querySelectorAll("nav button").forEach(b => b.classList.toggle("active", b.dataset.view === v));
  $("#listTitle").textContent = v === "completed" ? "✅ Completed Tasks" : "📋 My Assignments";
  render();
}

// Add / edit (same prompts for both)
function ask(t = {}) {
  const title = prompt("Assignment name:", t.title || "");
  if (!title || !title.trim()) return;
  const subject = prompt("Subject:", t.subject || "");
  if (!subject || !subject.trim()) return;
  const date = prompt("Due date (YYYY-MM-DD):", t.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return alert("Please use the YYYY-MM-DD format.");
  Object.assign(t, { title: title.trim(), subject: subject.trim(), date });
  if (!t.id) { t.id = Date.now(); t.status = "Pending"; items.push(t); }
  save(); render();
}

// Theme
function setTheme(dark) {
  document.body.classList.toggle("dark", dark);
  $("#theme").textContent = dark ? "☀️ Light Mode" : "🌙 Dark Mode";
  localStorage.setItem("dark", dark ? "1" : "");
}

// Events
document.addEventListener("click", e => {
  const v = e.target.closest("[data-view]");
  if (v) setView(v.dataset.view);
});
$("#list").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  const t = items.find(i => i.id == b.dataset.id);
  if (b.dataset.act === "status") t.status = STATUS[(STATUS.indexOf(t.status) + 1) % 3];
  if (b.dataset.act === "edit") return ask(t);
  if (b.dataset.act === "del") {
    if (!confirm("Delete this assignment?")) return;
    items = items.filter(i => i !== t);
  }
  save(); render();
});
document.querySelectorAll("#search, select").forEach(el => el.addEventListener("input", render));
$("#add").onclick = () => ask();
$("#prev").onclick = () => { cal.setMonth(cal.getMonth() - 1); render(); };
$("#next").onclick = () => { cal.setMonth(cal.getMonth() + 1); render(); };
$("#theme").onclick = () => setTheme(!document.body.classList.contains("dark"));
$("#profile").onclick = () => $("#about").showModal();

// Start
const hr = new Date().getHours();
$("#greeting").textContent = `Good ${hr < 5 ? "Night" : hr < 12 ? "Morning" : hr < 17 ? "Afternoon" : hr < 21 ? "Evening" : "Night"}, Student! ✨`;
setTheme(!!localStorage.getItem("dark"));
render();
