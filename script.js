
// Get HTML elements
const assignmentList = document.getElementById("assignmentList");
const searchInput = document.getElementById("searchInput");
const addAssignmentBtn = document.getElementById("addAssignmentBtn");

const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const dueCount = document.getElementById("dueCount");

const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");

// Update dashboard statistics
function updateDashboard() {
    const cards = [...assignmentList.querySelectorAll(".assignment-card")];

    const total = cards.length;
    const completed = cards.filter(card =>
        card.classList.contains("completed")
    ).length;
    const pending = total - completed;

    totalCount.textContent = total;
    pendingCount.textContent = pending;
    completedCount.textContent = completed;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueSoon = cards.filter(card => {
        const dateText = card.dataset.date;
        if (!dateText || card.classList.contains("completed")) return false;

        const dueDate = new Date(dateText + "T00:00:00");
        const daysLeft = Math.ceil((dueDate - today) / 86400000);

        return daysLeft >= 0 && daysLeft <= 3;
    }).length;

    dueCount.textContent = dueSoon;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    progressFill.style.width = percentage + "%";
    progressPercent.textContent = percentage + "%";
}

// Mark an assignment as completed
assignmentList.addEventListener("click", function(event) {
    const button = event.target.closest(".complete-btn");

    if (button) {
        const card = button.closest(".assignment-card");
        if (!card) return;

        card.classList.toggle("completed");

        button.textContent = card.classList.contains("completed")
            ? "Completed"
            : "Mark Complete";

        updateDashboard();
    }
});

// Search assignments
searchInput.addEventListener("input", function() {
    const searchText = searchInput.value.toLowerCase();

    document.querySelectorAll(".assignment-card").forEach(card => {
        const matches = card.textContent.toLowerCase().includes(searchText);
        card.style.display = matches ? "" : "none";
    });
});

// Add a new assignment
addAssignmentBtn.addEventListener("click", function() {
    const title = prompt("Enter assignment name:");
    if (!title || !title.trim()) return;

    const subject = prompt("Enter subject:");
    if (!subject || !subject.trim()) return;

    const date = prompt("Enter due date (YYYY-MM-DD):");
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        alert("Please enter the date in YYYY-MM-DD format.");
        return;
    }

    const card = document.createElement("div");
    card.className = "assignment-card";
    card.dataset.date = date;

    card.innerHTML = `
        <div>
            <h3>${escapeHTML(title.trim())}</h3>
            <p>${escapeHTML(subject.trim())}</p>
            <small>Due: ${escapeHTML(date)}</small>
        </div>
        <div class="assignment-actions">
        <button class="complete-btn">Mark Complete</button>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
    </div>
        <button class="complete-btn">Mark Complete</button>
    `;

    assignmentList.appendChild(card);
    updateDashboard();
});

// Safely display user-entered text
function escapeHTML(value) {
    return value.replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

// Calendar
const calendarGrid = document.getElementById("calendarGrid");
const monthLabel = document.getElementById("monthLabel");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

let calendarDate = new Date();

function renderCalendar() {
    if (!calendarGrid || !monthLabel) return;

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    monthLabel.textContent = calendarDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });

    calendarGrid.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement("div");
        calendarGrid.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement("div");
        dayElement.className = "calendar-day";
        dayElement.textContent = day;

        const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

        if (isToday) dayElement.classList.add("today");

        calendarGrid.appendChild(dayElement);
    }
}

prevMonth.addEventListener("click", function() {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar();
});

nextMonth.addEventListener("click", function() {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar();
});

// Start dashboard
updateDashboard();
renderCalendar();

assignmentList.addEventListener("click", function(event) {

    const card = event.target.closest(".assignment-card");
    if (!card) return;

    // Delete assignment
    if (event.target.classList.contains("delete-btn")) {
        const confirmDelete = confirm("Delete this assignment?");

        if (confirmDelete) {
            card.remove();
            updateDashboard();
        }
    }

    // Edit assignment
    if (event.target.classList.contains("edit-btn")) {
        const heading = card.querySelector("h3");
        const subjectText = card.querySelector("p");

        const newTitle = prompt("Edit assignment name:", heading.textContent);
        if (newTitle === null || !newTitle.trim()) return;

        const newSubject = prompt("Edit subject:", subjectText.textContent);
        if (newSubject === null || !newSubject.trim()) return;

        const newDate = prompt(
            "Edit due date (YYYY-MM-DD):",
            card.dataset.date
        );

        if (newDate === null || !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
            alert("Enter a valid date in YYYY-MM-DD format.");
            return;
        }

        heading.textContent = newTitle.trim();
        subjectText.textContent = newSubject.trim();
        card.dataset.date = newDate;

        updateDashboard();
    }
});

function updateGreeting() {
    const hour = new Date().getHours();
    const greeting = document.getElementById("greeting");

    if (!greeting) return;

    if (hour >= 5 && hour < 12) {
        greeting.textContent = "Good Morning!";
    } 
    else if (hour >= 12 && hour < 17) {
        greeting.textContent = "Good Afternoon!";
    } 
    else if (hour >= 17 && hour < 21) {
        greeting.textContent = "Good Evening!";
    } 
    else {
        greeting.textContent = "Good Night!";
    }
}

updateGreeting();

const profileBtn = document.getElementById("profileBtn");
const profileMenu = document.getElementById("profileMenu");
const aboutBtn = document.getElementById("aboutBtn");
const logoutBtn = document.getElementById("logoutBtn");

// Open and close profile menu
profileBtn.addEventListener("click", function(event) {
    event.stopPropagation();
    profileMenu.classList.toggle("show");
});

// Close menu when clicking outside
document.addEventListener("click", function(event) {
    if (!event.target.closest(".profile-container")) {
        profileMenu.classList.remove("show");
    }
});

// About section
aboutBtn.addEventListener("click", function() {
    profileMenu.classList.remove("show");

    alert(
        "Student Assignment Deadline Tracker\n\n" +
        "A dashboard to manage assignments, track deadlines, " +
        "and monitor academic progress."
    );
});

// Logout section
logoutBtn.addEventListener("click", function() {
    profileMenu.classList.remove("show");

    alert("You have been logged out.");
});

/* ===== SIDEBAR THEME SWITCHER ===== */

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeText = document.getElementById("themeText");

// Apply saved theme
let currentTheme = localStorage.getItem("dashboardTheme") || "light";

function applyTheme(theme) {
    currentTheme = theme;

    if (theme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }

    if (themeIcon) {
        themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
    }

    if (themeText) {
        themeText.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
    }

    localStorage.setItem("dashboardTheme", theme);
}

// Load saved theme
applyTheme(currentTheme);

// Toggle theme
if (themeToggle) {
    themeToggle.addEventListener("click", function(event) {
        event.preventDefault();

        const newTheme = currentTheme === "dark" ? "light" : "dark";

        applyTheme(newTheme);
    });
}
