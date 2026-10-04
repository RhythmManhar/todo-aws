const STORAGE_KEY = "todoProTasks-v3";

let tasks = [];
let currentView = "all";

const $ = (id) => document.getElementById(id);

const els = {
  taskList: $("taskList"),
  modalOverlay: $("modalOverlay"),
  taskForm: $("taskForm"),
  taskId: $("taskId"),
  taskTitle: $("taskTitle"),
  taskDescription: $("taskDescription"),
  taskDueDate: $("taskDueDate"),
  taskPriority: $("taskPriority"),
  taskCategory: $("taskCategory"),
  taskImportant: $("taskImportant"),
  modalTitle: $("modalTitle"),
  submitTaskBtn: $("submitTaskBtn"),
  searchInput: $("searchInput"),
  sortSelect: $("sortSelect"),
  toastContainer: $("toastContainer"),
  themeToggle: $("themeToggle")
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeTask(raw) {
  return {
    id: String(raw.id || uid()),
    title: String(raw.title || "").trim(),
    description: String(raw.description || ""),
    dueDate: raw.dueDate || "",
    priority: ["low", "medium", "high"].includes(raw.priority) ? raw.priority : "medium",
    category: String(raw.category || "General"),
    important: Boolean(raw.important),
    completed: Boolean(raw.completed),
    createdAt: Number(raw.createdAt) || Date.now()
  };
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      tasks = [];
      return;
    }
    const parsed = JSON.parse(raw);
    tasks = Array.isArray(parsed) ? parsed.map(normalizeTask).filter(t => t.title) : [];
    saveTasks();
  } catch (error) {
    console.error("Could not load tasks:", error);
    tasks = [];
    showToast("Could not load saved tasks", "error");
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function todayString() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "No due date";
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function priorityRank(p) {
  return ({ high: 3, medium: 2, low: 1 })[p] || 0;
}

function getVisibleTasks() {
  const query = els.searchInput.value.trim().toLowerCase();

  let result = tasks.filter(task => {
    if (currentView === "pending" && task.completed) return false;
    if (currentView === "completed" && !task.completed) return false;
    if (currentView === "important" && !task.important) return false;
    if (currentView === "today" && task.dueDate !== todayString()) return false;

    if (query) {
      const haystack = `${task.title} ${task.description} ${task.category} ${task.priority}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const sort = els.sortSelect.value;
  result.sort((a, b) => {
    if (sort === "due") return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
    if (sort === "priority") return priorityRank(b.priority) - priorityRank(a.priority);
    if (sort === "title") return a.title.localeCompare(b.title);
    return b.createdAt - a.createdAt;
  });
  return result;
}

function render() {
  updateStats();
  renderTasks();
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const important = tasks.filter(t => t.important).length;
  const rate = total ? Math.round((completed / total) * 100) : 0;

  $("totalCount").textContent = total;
  $("completedCount").textContent = completed;
  $("pendingCount").textContent = pending;
  $("importantCount").textContent = important;
  $("completionRate").textContent = `${rate}% complete`;
  $("progressBar").style.width = `${rate}%`;

  const visible = getVisibleTasks().length;
  $("taskSummary").textContent = `${visible} ${visible === 1 ? "task" : "tasks"}`;
}

function renderTasks() {
  const visible = getVisibleTasks();
  const titles = {
    all: "All Tasks", pending: "Pending", completed: "Completed",
    important: "Important", today: "Today"
  };
  $("viewTitle").textContent = titles[currentView];

  if (!visible.length) {
    els.taskList.innerHTML = `<div class="empty"><div style="font-size:42px">📝</div><h3>No Tasks Found</h3><p>Add a task or change your search/filter.</p></div>`;
    return;
  }

  els.taskList.innerHTML = visible.map(task => `
    <article class="task-card ${task.completed ? "completed" : ""}" data-id="${escapeHtml(task.id)}">
      <input class="task-check" type="checkbox" ${task.completed ? "checked" : ""} data-action="complete" aria-label="Complete task">
      <div class="task-main">
        <h3 class="task-title">${escapeHtml(task.title)} ${task.important ? "⭐" : ""}</h3>
        ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ""}
        <div class="task-meta">
          <span class="badge ${task.priority}">${capitalize(task.priority)}</span>
          <span class="badge">${escapeHtml(task.category)}</span>
          <span class="badge">📅 ${escapeHtml(formatDate(task.dueDate))}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="icon-btn" data-action="important" title="Toggle important">${task.important ? "★" : "☆"}</button>
        <button class="icon-btn" data-action="edit" title="Edit">✏️</button>
        <button class="icon-btn" data-action="delete" title="Delete">🗑️</button>
      </div>
    </article>
  `).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[c]));
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function openAddModal() {
  els.taskForm.reset();
  els.taskId.value = "";
  els.taskPriority.value = "medium";
  els.modalTitle.textContent = "Add Task";
  els.submitTaskBtn.textContent = "Add Task";
  els.modalOverlay.classList.remove("hidden");
  setTimeout(() => els.taskTitle.focus(), 0);
}

function openEditModal(id) {
  const task = tasks.find(t => t.id === String(id));
  if (!task) {
    showToast("Task not found", "error");
    return;
  }

  els.taskId.value = task.id;
  els.taskTitle.value = task.title;
  els.taskDescription.value = task.description;
  els.taskDueDate.value = task.dueDate;
  els.taskPriority.value = task.priority;
  els.taskCategory.value = task.category;
  els.taskImportant.checked = task.important;

  els.modalTitle.textContent = "Edit Task";
  els.submitTaskBtn.textContent = "Update Task";
  els.modalOverlay.classList.remove("hidden");
  setTimeout(() => els.taskTitle.focus(), 0);
}

function closeModal() {
  els.modalOverlay.classList.add("hidden");
  els.taskForm.reset();
  els.taskId.value = "";
}

function handleSubmit(event) {
  event.preventDefault();

  const title = els.taskTitle.value.trim();
  if (!title) {
    showToast("Task title is required", "error");
    els.taskTitle.focus();
    return;
  }

  const id = els.taskId.value.trim();
  const payload = {
    title,
    description: els.taskDescription.value.trim(),
    dueDate: els.taskDueDate.value,
    priority: els.taskPriority.value,
    category: els.taskCategory.value.trim() || "General",
    important: els.taskImportant.checked
  };

  if (id) {
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      showToast("Task could not be found", "error");
      return;
    }
    tasks[index] = { ...tasks[index], ...payload };
    saveTasks();
    closeModal();
    render();
    showToast("Task updated successfully", "success");
  } else {
    tasks.unshift({
      id: uid(),
      ...payload,
      completed: false,
      createdAt: Date.now()
    });
    saveTasks();
    closeModal();
    render();
    showToast("Task added successfully", "success");
  }
}

function handleTaskListClick(event) {
  const card = event.target.closest(".task-card");
  if (!card) return;
  const id = card.dataset.id;
  const actionEl = event.target.closest("[data-action]");
  if (!actionEl) return;

  const action = actionEl.dataset.action;
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  if (action === "edit") openEditModal(id);
  if (action === "delete") {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
    showToast("Task deleted", "success");
  }
  if (action === "important") {
    task.important = !task.important;
    saveTasks();
    render();
  }
}

function handleComplete(event) {
  if (!event.target.matches('[data-action="complete"]')) return;
  const card = event.target.closest(".task-card");
  const task = tasks.find(t => t.id === card.dataset.id);
  if (!task) return;
  task.completed = event.target.checked;
  saveTasks();
  render();
  showToast(task.completed ? "Task completed" : "Task marked pending", "success");
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  els.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function setupEvents() {
  $("openAddBtn").addEventListener("click", openAddModal);
  $("closeModalBtn").addEventListener("click", closeModal);
  $("cancelModalBtn").addEventListener("click", closeModal);
  els.taskForm.addEventListener("submit", handleSubmit);
  els.taskList.addEventListener("click", handleTaskListClick);
  els.taskList.addEventListener("change", handleComplete);
  els.searchInput.addEventListener("input", render);
  els.sortSelect.addEventListener("change", render);

  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      currentView = btn.dataset.view;
      document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      render();
      $("sidebar").classList.remove("open");
    });
  });

  $("clearCompletedBtn").addEventListener("click", () => {
    const before = tasks.length;
    tasks = tasks.filter(t => !t.completed);
    if (tasks.length !== before) {
      saveTasks();
      render();
      showToast("Completed tasks cleared", "success");
    } else {
      showToast("No completed tasks to clear", "info");
    }
  });

  $("menuBtn").addEventListener("click", () => $("sidebar").classList.toggle("open"));

  els.themeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark", els.themeToggle.checked);
    localStorage.setItem("todoProTheme", els.themeToggle.checked ? "dark" : "light");
  });

  els.modalOverlay.addEventListener("click", (e) => {
    if (e.target === els.modalOverlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !els.modalOverlay.classList.contains("hidden")) closeModal();
  });
}

function initTheme() {
  const saved = localStorage.getItem("todoProTheme");
  const dark = saved === "dark";
  document.body.classList.toggle("dark", dark);
  els.themeToggle.checked = dark;
}

function init() {
  // Important: modal is hidden in HTML and is NEVER opened during initialization.
  loadTasks();
  initTheme();
  setupEvents();
  render();
}

init();
