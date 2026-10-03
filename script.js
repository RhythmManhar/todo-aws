// Select HTML elements
const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const clearAllBtn = document.getElementById("clear-all-btn");

// Retrieve tasks from browser localStorage (or empty array if none exist)
let tasks = JSON.parse(localStorage.getItem("todos")) || [];

// Save tasks array into localStorage
function saveTasks() {
  localStorage.setItem("todos", JSON.stringify(tasks));
}

// Update the task counter at the bottom
function updateCount() {
  const pendingCount = tasks.filter((t) => !t.completed).length;
  taskCount.textContent = `${pendingCount} ${pendingCount === 1 ? "task" : "tasks"} left`;
}

// Render all tasks onto the webpage
function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    // Create list item (li)
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;

    // Create task text span
    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;

    // Toggle completed when clicking on task text
    span.addEventListener("click", () => {
      toggleTask(index);
    });

    // Create delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";

    // Delete task when clicking delete button
    deleteBtn.addEventListener("click", () => {
      deleteTask(index);
    });

    // Append text and delete button to the list item
    li.appendChild(span);
    li.appendChild(deleteBtn);

    // Append list item to the main list
    taskList.appendChild(li);
  });

  updateCount();
}

// Add a new task
function addTask() {
  const text = taskInput.value.trim();

  // Don't add empty tasks
  if (text === "") {
    alert("Please enter a task name!");
    return;
  }

  // Create new task object
  const newTask = {
    text: text,
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  // Clear input box
  taskInput.value = "";
  taskInput.focus();
}

// Toggle task completed state
function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

// Delete a specific task
function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

// Clear all tasks
function clearAllTasks() {
  if (tasks.length === 0) return;
  if (confirm("Are you sure you want to delete all tasks?")) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
}

// Event Listeners
addBtn.addEventListener("click", addTask);

// Allow adding task by pressing Enter key
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});

clearAllBtn.addEventListener("click", clearAllTasks);

// Initial render when page loads
renderTasks();
