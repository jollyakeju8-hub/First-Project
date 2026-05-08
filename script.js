document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const taskCount = document.getElementById('task-count');
    const clearAllBtn = document.getElementById('clear-all-btn');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateTaskCount();
    }

    function updateTaskCount() {
        const count = tasks.length;
        taskCount.textContent = `${count} task${count !== 1 ? 's' : ''}`;
    }

    function renderTasks() {
        todoList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;

            li.innerHTML = `
                <div class="checkbox-wrapper">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} class="task-checkbox">
                </div>
                <span class="task-text">${escapeHTML(task.text)}</span>
                <button type="button" class="delete-btn" title="Delete Task">✕</button>
            `;

            todoList.appendChild(li);
        });
        updateTaskCount();
    }

    function addTask(text) {
        const newTask = {
            id: Date.now().toString(),
            text: text,
            completed: false
        };
        tasks.push(newTask);
        saveTasks();
        renderTasks();
    }

    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }

    function deleteTask(id, listItemElement) {
        // Add deleting class for animation
        listItemElement.classList.add('deleting');
        
        // Wait for animation to finish before removing from state and DOM
        setTimeout(() => {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
        }, 300); // 300ms matches the slideOut animation duration
    }

    function clearAll() {
        if (tasks.length === 0) return;
        if (confirm('Are you sure you want to clear all tasks?')) {
            tasks = [];
            saveTasks();
            renderTasks();
        }
    }

    // Event Listeners
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (text) {
            addTask(text);
            todoInput.value = '';
        }
    });

    todoList.addEventListener('click', (e) => {
        const li = e.target.closest('.todo-item');
        if (!li) return;
        const id = li.dataset.id;

        if (e.target.classList.contains('delete-btn')) {
            deleteTask(id, li);
        } else if (e.target.classList.contains('task-checkbox')) {
            toggleTask(id);
        }
    });

    clearAllBtn.addEventListener('click', clearAll);

    // Initial render
    renderTasks();
});

// Helper to prevent XSS
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
