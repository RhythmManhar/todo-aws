// ========================================================
// Basic Automated Test Suite for To-Do List Web Application
// Tests:
//   1. Verify that the task input element exists
//   2. Verify that the Add Task button exists
//   3. Verify that a task can be added
//   4. Verify that a task can be completed or deleted
// ========================================================

const fs = require('fs');
const assert = require('assert');

console.log("--------------------------------------------------");
console.log("Running Automated Tests for To-Do Application");
console.log("--------------------------------------------------");

// 1. Read the frontend HTML file
const html = fs.readFileSync('index.html', 'utf8');

// --------------------------------------------------------
// Test 1: Verify that the task input element exists
// --------------------------------------------------------
console.log("\n[Test 1] Verifying task input element exists in index.html...");
assert(
  html.includes('id="task-input"'),
  "FAILED: Element with id='task-input' was not found in index.html!"
);
console.log("  PASS: Task input element (#task-input) exists.");

// --------------------------------------------------------
// Test 2: Verify that the Add Task button exists
// --------------------------------------------------------
console.log("\n[Test 2] Verifying Add Task button exists in index.html...");
assert(
  html.includes('id="add-btn"'),
  "FAILED: Element with id='add-btn' was not found in index.html!"
);
console.log("  PASS: Add Task button (#add-btn) exists.");

// --------------------------------------------------------
// Set up minimal browser environment mock for script.js
// --------------------------------------------------------
const store = {};
const mockLocalStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); },
  clear: () => { for (let k in store) delete store[k]; }
};

// Mock elements needed by script.js
const elements = {
  'task-input': { value: '', focus: () => {}, addEventListener: () => {} },
  'add-btn': { addEventListener: (event, handler) => { elements['add-btn'].click = handler; } },
  'task-list': { innerHTML: '', appendChild: (child) => { elements['task-list'].children.push(child); }, children: [] },
  'task-count': { textContent: '' },
  'clear-all-btn': { addEventListener: () => {} }
};

const mockDocument = {
  getElementById: (id) => elements[id],
  createElement: (tag) => ({
    className: '',
    textContent: '',
    appendChild: () => {},
    addEventListener: () => {}
  })
};

// Expose globals for script.js
global.document = mockDocument;
global.localStorage = mockLocalStorage;
global.alert = () => {};
global.confirm = () => true;

// Load and evaluate script.js
const scriptCode = fs.readFileSync('script.js', 'utf8');
eval(scriptCode);

// --------------------------------------------------------
// Test 3: Verify that a task can be added
// --------------------------------------------------------
console.log("\n[Test 3] Verifying that a task can be added...");
elements['task-input'].value = 'Submit Cloud Assessment';
elements['add-btn'].click();

const savedTasksAfterAdd = JSON.parse(mockLocalStorage.getItem('todos') || '[]');
assert(
  savedTasksAfterAdd.length === 1,
  `FAILED: Expected 1 task in localStorage, found ${savedTasksAfterAdd.length}`
);
assert(
  savedTasksAfterAdd[0].text === 'Submit Cloud Assessment',
  `FAILED: Expected task text 'Submit Cloud Assessment', got '${savedTasksAfterAdd[0].text}'`
);
assert(
  savedTasksAfterAdd[0].completed === false,
  "FAILED: Newly added task should have completed: false"
);
console.log("  PASS: Task successfully added and stored in localStorage.");

// --------------------------------------------------------
// Test 4: Verify that a task can be completed or deleted
// --------------------------------------------------------
console.log("\n[Test 4] Verifying that a task can be completed and deleted...");

// 4a. Verify task completion (toggle)
toggleTask(0);
const savedTasksAfterToggle = JSON.parse(mockLocalStorage.getItem('todos') || '[]');
assert(
  savedTasksAfterToggle[0].completed === true,
  "FAILED: Task completed state should be true after toggling!"
);
console.log("  PASS (4a): Task completion toggled successfully.");

// 4b. Verify task deletion
deleteTask(0);
const savedTasksAfterDelete = JSON.parse(mockLocalStorage.getItem('todos') || '[]');
assert(
  savedTasksAfterDelete.length === 0,
  `FAILED: Expected 0 tasks after deletion, found ${savedTasksAfterDelete.length}`
);
console.log("  PASS (4b): Task deleted successfully from localStorage.");

console.log("\n--------------------------------------------------");
console.log("SUCCESS: All 4 basic tests passed successfully!");
console.log("--------------------------------------------------");
