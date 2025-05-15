function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("taskId", event.target.getAttribute('data-id'));
}

function drop(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("taskId");
    const taskElement = document.querySelector(`[data-id="${taskId}"]`);
    const column = event.target.closest('.column');
    if (!column || !taskElement) return;
    column.querySelector('.task-container').appendChild(taskElement);
    updateTaskStatus(taskId, column.id);
}

function openTaskModal() {
    document.getElementById('taskModal').classList.add('active');
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.remove('active');
    document.getElementById('taskName').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskStartDate').value = '';
    document.getElementById('taskEndDate').value = '';
    document.getElementById('taskResponsible').value = '';
    editingTaskId = null;
}

function addTask() {
    const name = document.getElementById('taskName').value;
    const description = document.getElementById('taskDescription').value;
    const startDate = document.getElementById('taskStartDate').value;
    const endDate = document.getElementById('taskEndDate').value;
    const responsible = document.getElementById('taskResponsible').value;
    const id = editingTaskId || Date.now().toString();
    const columnId = 'todo';

    if (editingTaskId) {
        const oldTask = document.querySelector(`[data-id="${editingTaskId}"]`);
        if (oldTask) oldTask.remove();
        editingTaskId = null;
    }

    createTask(columnId, name, description, startDate, endDate, responsible, id);
    closeTaskModal();
}

function createTask(columnId, name, description, startDate, endDate, responsible, id, subtasks = []) {
    const column = document.getElementById(columnId);
    const task = document.createElement('div');
    task.className = 'task';
    task.draggable = true;
    task.setAttribute('data-id', id);
    task.addEventListener('dragstart', drag);

    const today = new Date();
    const end = new Date(endDate);
    today.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    let nameColor = '';

    if (end < today) {
        nameColor = 'red';
    } else if (end.getTime() === today.getTime()) {
        nameColor = 'orange';
    }
    

    const esHecho = columnId === 'done';

    const subtasksHTML = subtasks.map(sub => `
        <li data-subtask-id="${sub.id}">
            <input type="checkbox" ${sub.completed || esHecho ? 'checked' : ''} ${esHecho ? 'disabled' : ''}>
            <span contenteditable="${!esHecho}" 
                  style="${esHecho ? 'text-decoration: line-through; color: gray;' : ''}"
                  onblur="editSubtask('${id}', '${sub.id}', this.innerText)">
                  ${sub.text}
            </span>
            ${!esHecho ? `<button onclick="deleteSubtask('${id}', '${sub.id}')">X</button>` : ''}
        </li>
    `).join('');

    task.innerHTML = `
        <strong style="color: ${nameColor}">${name}</strong>
        <p>${description}</p>
        <p>Inicio: ${startDate}</p>
        <p>Final: ${endDate}</p>
        <p>Responsable: ${responsible}</p>
        <ul class="subtask-list">${subtasksHTML}</ul>
        ${!esHecho ? `<input type="text" placeholder="Nueva subtarea..." onkeydown="if(event.key === 'Enter') addSubtask('${id}', this)">` : ''}
        <div class="task-actions">
            <button class="circle-btn edit" onclick="editTask('${id}')">Editar</button>
            <button class="circle-btn delete" onclick="deleteTask('${id}')">Eliminar</button>
        </div>
    `;

    column.querySelector('.task-container').appendChild(task);
    saveTask({ columnId, name, description, startDate, endDate, responsible, id, subtasks });
}

function saveTask(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const index = tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
        tasks[index] = task;
    } else {
        tasks.push(task);
    }
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        createTask(
            task.columnId,
            task.name,
            task.description,
            task.startDate,
            task.endDate,
            task.responsible,
            task.id,
            task.subtasks || []
        );
    });
}

function reloadTasks() {
    document.querySelectorAll('.task-container').forEach(c => c.innerHTML = '');
    loadTasks();
}

function updateTaskStatus(id, columnId) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.columnId = columnId;
        saveTask(task);
    }
}

let editingTaskId = null;

function editTask(id) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    document.getElementById('taskName').value = task.name;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskStartDate').value = task.startDate;
    document.getElementById('taskEndDate').value = task.endDate;
    document.getElementById('taskResponsible').value = task.responsible;

    editingTaskId = id;
    openTaskModal();
}

function deleteTask(id) {
    if (!confirm("¿Seguro que deseas eliminar esta tarea?")) return;
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    const taskElement = document.querySelector(`[data-id="${id}"]`);
    if (taskElement) taskElement.remove();
}

function addSubtask(taskId, inputElement) {
    const text = inputElement.value.trim();
    if (text === '') return;
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubtask = {
        id: `${taskId}-${Date.now()}`,
        text,
        completed: false
    };

    task.subtasks = task.subtasks || [];
    task.subtasks.push(newSubtask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    inputElement.value = '';
    reloadTasks();
}

function toggleSubtask(taskId, subtaskId) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;

    subtask.completed = !subtask.completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function editSubtask(taskId, subtaskId, newText) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;

    subtask.text = newText.trim();
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function deleteSubtask(taskId, subtaskId) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.subtasks = task.subtasks.filter(st => st.id !== subtaskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    reloadTasks();
}

function mostrarAlertasDeTareasVencidas() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const tareasAtrasadas = tasks.filter(task => {
        const fechaFin = new Date(task.endDate);
        fechaFin.setHours(0, 0, 0, 0);
        return fechaFin < hoy;
    });

    if (tareasAtrasadas.length > 0) {
        const lista = tareasAtrasadas.map(t => `• ${t.name} (Fin: ${t.endDate})`).join('\n');
        alert(`⚠️ Tienes ${tareasAtrasadas.length} tarea(s) atrasada(s):\n\n${lista}`);
    }
}

loadTasks();
mostrarAlertasDeTareasVencidas();
