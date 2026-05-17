let todos = [];
let currentFilter = "all";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const prioritySelect = document.getElementById("priority-select");
const dueDateInput = document.getElementById("due-date-input");
const list = document.getElementById("todo-list");
const emptyMsg = document.getElementById("empty-msg");
const filterBtns = document.querySelectorAll(".filter-btn");

async function fetchTodos() {
  const res = await fetch("/api/todos");
  todos = await res.json();
  render();
}

async function addTodo(text, priority, due_date) {
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, priority, due_date }),
  });
  if (res.ok) {
    const todo = await res.json();
    todos.push(todo);
    render();
  }
}

async function toggleTodo(id) {
  const res = await fetch(`/api/todos/${id}`, { method: "PATCH" });
  if (res.ok) {
    const updated = await res.json();
    todos = todos.map((t) => (t.id === id ? updated : t));
    render();
  }
}

async function deleteTodo(id) {
  const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
  if (res.ok) {
    todos = todos.filter((t) => t.id !== id);
    render();
  }
}

function render() {
  const filtered = todos.filter((t) => {
    if (currentFilter === "active") return !t.done;
    if (currentFilter === "done") return t.done;
    return true;
  });

  list.innerHTML = "";
  emptyMsg.classList.toggle("hidden", filtered.length > 0);

  filtered.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item priority-${todo.priority}${todo.done ? " done" : ""}`;
    const dueDateHtml = todo.due_date
      ? `<span class="due-date">Due: ${todo.due_date}</span>`
      : "";
    li.innerHTML = `
      <input class="todo-checkbox" type="checkbox" ${todo.done ? "checked" : ""} aria-label="Toggle done" />
      <div class="todo-body">
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <div class="todo-meta">
          <span class="priority-badge priority-${todo.priority}">${todo.priority}</span>
          ${dueDateHtml}
        </div>
      </div>
      <button class="delete-btn" aria-label="Delete task">&#x2715;</button>
    `;
    li.querySelector(".todo-checkbox").addEventListener("change", () => toggleTodo(todo.id));
    li.querySelector(".delete-btn").addEventListener("click", () => deleteTodo(todo.id));
    list.appendChild(li);
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text) {
    addTodo(text, prioritySelect.value, dueDateInput.value || null);
    input.value = "";
    dueDateInput.value = "";
    prioritySelect.value = "medium";
  }
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

fetchTodos();
