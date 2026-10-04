// ========================================
// TodoPro - Modern Todo Application Logic
// ========================================

// DOM Elements
const sidebar = document.querySelector('.sidebar');
const sidebarToggleBtn = document.getElementById('sidebar-toggle');
const themeToggle = document.getElementById('theme-toggle');
const openAddTaskModalBtn = document.getElementById('open-add-task-modal');
const openAddTaskModalFromEmptyBtn = document.getElementById('open-add-task-modal-from-empty');
const addTaskModal = document.getElementById('add-task-modal');
const editTaskModal = document.getElementById('edit-task-modal');
const closeAddTaskModalBtn = document.getElementById('close-add-task-modal');
const closeEditTaskModalBtn = document.getElementById('close-edit-task-modal');
const closeAddTaskModalFooterBtn = document.getElementById('close-add-task-modal-btn');
const closeEditTaskModalFooterBtn = document.getElementById('close-edit-task-modal-btn');
const taskForm = document.getElementById('task-form');
const editTaskForm = document.getElementById('edit-task-form');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const filterSelect = document.getElementById('filter-select');
const sortSelect = document.getElementById('sort-select');
const tasksList = document.getElementById('tasks-list');
const emptyState = document.getElementById('empty-state');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const toastContainer = document.getElementById('toast-container');
const totalTasksEl = document.getElementById('total-tasks');
const completedTasksEl = document.getElementById('completed-tasks');
const pendingTasksEl = document.getElementById('pending-tasks');
const importantTasksEl = document.getElementById('important-tasks');
const completionRateEl = document.getElementById('completion-rate');
const progressBarEl = document.getElementById('progress-bar');
const tasksTitleEl = document.getElementById('tasks-title');
const navItems = document.querySelectorAll('.nav-item');

// Task Data Structure
let tasks = [];
const STORAGE_KEY = 'todoProTasks-v2';

// Initialize Application
console.log('Debug: Initializing application');
loadTasks();
renderTasks();
updateStats();
setupEventListeners();
checkThemePreference();

// Load tasks from localStorage
function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);
  console.log('Debug: Loading tasks from localStorage:', savedTasks);
  if (savedTasks) {
    try {
      tasks = JSON.parse(savedTasks);
      // Ensure backward compatibility with old task format
      tasks = tasks.map(task => ({
        id: task.id || Date.now() + Math.random(),
        text: task.text || '',
        description: task.description || '',
        completed: task.completed || false,
        dueDate: task.dueDate || null,
        priority: task.priority || 'medium',
        category: task.category || '',
        important: task.important || false,
        createdAt: task.createdAt || Date.now()
      }));
      console.log('Debug: Loaded tasks:', tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      tasks = [];
    }
  } else {
    tasks = [];
    console.log('Debug: No tasks found in localStorage, using empty array');
  }
}

// Save tasks to localStorage
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    console.log('Debug: Tasks saved to localStorage:', tasks);
  } catch (error) {
    console.error('Error saving tasks:', error);
    showToast('Error saving tasks', 'error');
  }
}

// Event Listeners Setup
function setupEventListeners() {
  console.log('Debug: Setting up event listeners');
  // Sidebar toggle
  sidebarToggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });

  // Theme toggle
  themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', themeToggle.checked);
  });

  // Open Add Task modal
  openAddTaskModalBtn.addEventListener('click', openAddTaskModal);
  openAddTaskModalFromEmptyBtn.addEventListener('click', openAddTaskModal);

  // Close modals
  closeAddTaskModalBtn.addEventListener('click', closeAddTaskModal);
  closeEditTaskModalBtn.addEventListener('click', closeEditTaskModal);
  closeAddTaskModalFooterBtn.addEventListener('click', closeAddTaskModal);
  closeEditTaskModalFooterBtn.addEventListener('click', closeEditTaskModal);

  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === addTaskModal) closeAddTaskModal();
    if (e.target === editTaskModal) closeEditTaskModal();
  });

  // Close modals with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (addTaskModal.classList.contains('show')) closeAddTaskModal();
      if (editTaskModal.classList.contains('show')) closeEditTaskModal();
    }
  });

  // Form submissions
  console.log('Debug: Adding form submit listeners');
  taskForm.addEventListener('submit', handleAddTaskSubmit);
  editTaskForm.addEventListener('submit', handleEditTaskSubmit);

  // Search functionality
  searchBtn.addEventListener('click', () => renderTasks());
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') renderTasks();
  });

  // Filter and sort
  filterSelect.addEventListener('change', renderTasks);
  sortSelect.addEventListener('change', renderTasks);

  // Clear completed tasks
  clearCompletedBtn.addEventListener('click', clearCompletedTasks);

  // Navigation
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      renderTasks();
    });
  });
}

// Open Add Task Modal
function openAddTaskModal() {
  addTaskModal.classList.add('show');
  document.getElementById('task-title').focus();
  taskForm.reset();
  document.getElementById('task-priority').value = 'medium';
  document.getElementById('task-important').checked = false;
}

// Close Add Task Modal
function closeAddTaskModal() {
  addTaskModal.classList.remove('show');
}

// Open Edit Task Modal
function openEditTaskModal(index) {
  const task = tasks[index];
  document.getElementById('edit-task-index').value = index;

  document.getElementById('edit-task-title').value = task.text;
  document.getElementById('edit-task-description').value = task.description;
  document.getElementById('edit-task-due-date').value = task.dueDate || '';
  document.getElementById('edit-task-priority').value = task.priority;
  document.getElementById('edit-task-category').value = task.category;
  document.getElementById('edit-task-important').checked = task.important;

  editTaskModal.classList.add('show');
  document.getElementById('edit-task-title').focus();
}

// Close Edit Task Modal
function closeEditTaskModal() {
  editTaskModal.classList.remove('show');
}

// Handle Add Task Form Submission
function handleAddTaskSubmit(e) {
  console.log('Debug: handleAddTaskSubmit called');
  e.preventDefault();

  const title = document.getElementById('task-title').value.trim();
  console.log('Debug: Task title:', title);
  if (!title) {
    showToast('Please enter a task title', 'error');
    return;
  }

  const newTask = {
    id: Date.now() + Math.random(),
    text: title,
    description: document.getElementById('task-description').value.trim(),
    completed: false,
    dueDate: document.getElementById('task-due-date').value || null,
    priority: document.getElementById('task-priority').value,
    category: document.getElementById('task-category').value.trim(),
    important: document.getElementById('task-important').checked,
    createdAt: Date.now()
  };

  console.log('Debug: New task object:', newTask);
  tasks.push(newTask);
  console.log('Debug: Tasks array after push:', tasks);
  saveTasks();
  renderTasks();
  updateStats();
  closeAddTaskModal();
  showToast('Task added successfully', 'success');

  // Clear form
  taskForm.reset();
  document.getElementById('task-priority').value = 'medium';
  document.getElementById('task-important').checked = false;
}

// Handle Edit Task Form Submission
function handleEditTaskSubmit(e) {
  e.preventDefault();

  const index = parseInt(document.getElementById('edit-task-index').value);
  if (isNaN(index) || index < 0 || index >= tasks.length) {
    showToast('Error editing task', 'error');
    return;
  }

  const title = document.getElementById('edit-task-title').value.trim();
  if (!title) {
    showToast('Please enter a task title', 'error');
    return;
  }

  tasks[index] = {
    ...tasks[index],
    text: title,
    description: document.getElementById('edit-task-description').value.trim(),
    dueDate: document.getElementById('edit-task-due-date').value || null,
    priority: document.getElementById('edit-task-priority').value,
    category: document.getElementById('edit-task-category').value.trim(),
    important: document.getElementById('edit-task-important').checked
  };

  saveTasks();
  renderTasks();
  updateStats();
  closeEditTaskModal();
  showToast('Task updated successfully', 'success');
}

// Render Tasks based on filters and search
function renderTasks() {
  const navItem = document.querySelector('.nav-item.active');
  const view = navItem ? navItem.dataset.view : 'all';
  const searchTerm = searchInput.value.trim().toLowerCase();
  const filterValue = filterSelect.value;
  const sortValue = sortSelect.value;

  // Filter tasks based on view
  let filteredTasks = tasks.filter(task => {
    switch (view) {
      case 'all': return true;
      case 'pending': return !task.completed;
      case 'completed': return task.completed;
      case 'important': return task.important;
      case 'today': {
        if (!task.dueDate) return false;
        const today = new Date().toISOString().split('T')[0];
        return task.dueDate === today;
      }
      default: return true;
    }
  });

  // Apply additional filter
  if (filterValue !== 'all') {
    filteredTasks = filteredTasks.filter(task => {
      switch (filterValue) {
        case 'pending': return !task.completed;
        case 'completed': return task.completed;
        case 'important': return task.important;
        default: return true;
      }
    });
  }

  // Apply search
  if (searchTerm) {
    filteredTasks = filteredTasks.filter(task => {
      return task.text.toLowerCase().includes(searchTerm) ||
             task.description.toLowerCase().includes(searchTerm) ||
             task.category.toLowerCase().includes(searchTerm);
    });
  }

  // Sort tasks
  filteredTasks.sort((a, b) => {
    switch (sortValue) {
      case 'created-asc': return a.createdAt - b.createdAt;
      case 'created-desc': return b.createdAt - a.createdAt;
      case 'due-date': {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      case 'priority-high': {
        const priorityValues = { high: 3, medium: 2, low: 1 };
        return priorityValues[b.priority] - priorityValues[a.priority];
      }
      case 'priority-low': {
        const priorityValues = { high: 3, medium: 2, low: 1 };
        return priorityValues[a.priority] - priorityValues[b.priority];
      }
      default: return 0;
    }
  });

  // Render tasks
  if (filteredTasks.length === 0) {
    tasksList.innerHTML = '';
    emptyState.classList.remove('hidden');
    tasksTitleEl.textContent = 'No Tasks Found';
  } else {
    emptyState.classList.add('hidden');
    tasksList.innerHTML = '';
    tasksTitleEl.textContent = `${view.charAt(0).toUpperCase() + view.slice(1)} Tasks (${filteredTasks.length})`;

    filteredTasks.forEach((task, index) => {
      const taskElement = createTaskElement(task, index);
      tasksList.appendChild(taskElement);
    });
  }
}

// Create Task Element
function createTaskElement(task, index) {
  const li = document.createElement('li');
  li.className = `task-item ${task.completed ? 'completed' : ''} ${task.important ? 'important' : ''}`;
  if (task.dueDate && isOverdue(task.dueDate)) {
    li.classList.add('overdue');
  }

  // Priority indicator
  const priorityColors = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high'
  };

  li.innerHTML = `
    <div class="task-checkbox">
      <input type="checkbox" ${task.completed ? 'checked' : ''}>
    </div>
    <div class="task-content">
      <div class="task-header">
        <h3 class="task-title">${escapeHtml(task.text)}</h3>
        <div class="task-meta">
          <span class="priority-badge ${priorityColors[task.priority]}">${task.priority}</span>
          ${task.dueDate ? `<span class="due-date ${isOverdue(task.dueDate) ? 'overdue' : ''}">${formatDate(task.dueDate)}</span>` : ''}
        </div>
      </div>
      ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
      <div class="task-footer">
        ${task.category ? `<span class="category-tag">${escapeHtml(task.category)}</span>` : ''}
        <div class="task-actions">
          <button class="action-btn edit" title="Edit Task" onclick="openEditTaskModal(${index})">
            <span>✏️</span>
          </button>
          <button class="action-btn important" title="Toggle Important" onclick="toggleImportant(${index})">
            <span>${task.important ? '⭐' : '☆'}</span>
          </button>
          <button class="action-btn delete" title="Delete Task" onclick="deleteTask(${index})">
            <span>🗑️</span>
          </button>
        </div>
      </div>
    </div>
  `;

  // Add checkbox event listener
  const checkbox = li.querySelector('.task-checkbox input');
  checkbox.addEventListener('change', () => {
    toggleComplete(index);
  });

  // Add click-to-toggle functionality
  li.querySelector('.task-title').addEventListener('click', () => {
    toggleComplete(index);
  });

  // Add drag and drop functionality (simplified)
  li.setAttribute('draggable', 'true');
  li.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', index);
    li.classList.add('dragging');
  });

  li.addEventListener('dragend', () => {
    li.classList.remove('dragging');
  });

  li.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  li.addEventListener('drop', (e) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (fromIndex !== index && fromIndex >= 0 && fromIndex < tasks.length) {
      moveTask(fromIndex, index);
    }
  });

  return li;
}

// Toggle Task Complete Status
function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
  updateStats();
  showToast(tasks[index].completed ? 'Task completed' : 'Task reopened', 'success');
}

// Toggle Task Important Status
function toggleImportant(index) {
  tasks[index].important = !tasks[index].important;
  saveTasks();
  renderTasks();
  updateStats();
  showToast(tasks[index].important ? 'Task marked as important' : 'Important removed', 'success');
}

// Delete Task
function deleteTask(index) {
  if (confirm('Are you sure you want to delete this task?')) {
    const deletedTask = tasks.splice(index, 1)[0];
    saveTasks();
    renderTasks();
    updateStats();
    showToast('Task deleted', 'success');
  }
}

// Clear Completed Tasks
function clearCompletedTasks() {
  const completedCount = tasks.filter(task => task.completed).length;
  if (completedCount === 0) {
    showToast('No completed tasks to clear', 'info');
    return;
  }

  if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
    updateStats();
    showToast(`${completedCount} completed task(s) cleared`, 'success');
  }
}

// Move Task (for drag and drop)
function moveTask(fromIndex, toIndex) {
  const [movedTask] = tasks.splice(fromIndex, 1);
  tasks.splice(toIndex, 0, movedTask);
  saveTasks();
  renderTasks();
  updateStats();
}

// Search Tasks
function searchTasks() {
  renderTasks();
}

// Update Statistics Dashboard
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const pending = total - completed;
  const important = tasks.filter(task => task.important).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  totalTasksEl.textContent = total;
  completedTasksEl.textContent = completed;
  pendingTasksEl.textContent = pending;
  importantTasksEl.textContent = important;
  completionRateEl.textContent = `${completionRate}%`;
  progressBarEl.style.width = `${completionRate}%`;
}

// Check System Theme Preference
function checkThemePreference() {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
    themeToggle.checked = true;
  }
}

// Show Toast Notification
function showToast(message, type = 'info') {
  // Remove existing toasts
  const existingToasts = toastContainer.querySelectorAll('.toast');
  existingToasts.forEach(toast => toast.remove());

  // Create new toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
    </div>
    <div class="toast-content">
      <div class="toast-title">${type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info'}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="close-toast" onclick="this.parentElement.remove()">&times;</div>
    <div class="toast-progress"></div>
  `;

  toastContainer.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 5000);

  // Add progress bar animation
  const progressBar = toast.querySelector('.toast-progress');
  let width = 100;
  const interval = setInterval(() => {
    if (width <= 0 || !toast.parentElement) {
      clearInterval(interval);
      return;
    }
    width -= 2;
    progressBar.style.width = `${width}%`;
  }, 50);
}

// Utility Functions
function isOverdue(dateString) {
  if (!dateString) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateString < today;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

