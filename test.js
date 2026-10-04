const fs = require("fs");
const assert = require("assert");

const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("style.css", "utf8");
const js = fs.readFileSync("script.js", "utf8");
const docker = fs.readFileSync("Dockerfile", "utf8");

assert(html.includes('id="taskForm"'));
assert(html.includes('id="modalOverlay"'));
assert(html.includes('id="openAddBtn"'));
assert(html.includes('class="overlay hidden"'));
assert(css.includes("--blue: #3b82f6"));
assert(js.includes('const STORAGE_KEY = "todoProTasks-v3"'));
assert(js.includes("function openAddModal"));
assert(js.includes("function openEditModal"));
assert(js.includes("function handleSubmit"));
assert(js.includes("localStorage.setItem(STORAGE_KEY"));
assert(docker.includes("EXPOSE 80"));
assert(docker.includes("COPY index.html"));
assert(docker.includes("COPY assets/"));

console.log("All TodoPro structural tests passed.");
