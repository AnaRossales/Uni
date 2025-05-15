//--------------------------------------------------------------
// PASO 1: FUNCIONES BÁSICAS PARA DRAG & DROP
//--------------------------------------------------------------

// Permite soltar elementos en columnas
function allowDrop(event) {
    event.preventDefault();
}

// Guarda el ID de la tarea arrastrada
function drag(event) {
    event.dataTransfer.setData("taskId", event.target.getAttribute('data-id'));
}

// Cuando se suelta la tarea en una columna
function drop(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("taskId");
    const taskElement = document.querySelector(`[data-id="${taskId}"]`);
    const column = event.target.closest('.column');
    if (!column || !taskElement) return;
    column.querySelector('.task-container').appendChild(taskElement);
    updateTaskStatus(taskId, column.id);
}

//--------------------------------------------------------------
// PASO 2: ABRIR Y CERRAR EL FORMULARIO (MODAL) DE TAREA
//--------------------------------------------------------------

function openTaskModal() {
    document.getElementById('taskModal').classList.add('active');
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.remove('active');
    // Limpiar campos del formulario
    document.getElementById('taskName').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskStartDate').value = '';
    document.getElementById('taskEndDate').value = '';
    document.getElementById('taskResponsible').value = '';
    editingTaskId = null;
}

//--------------------------------------------------------------
// PASO 3: AGREGAR O EDITAR UNA TAREA
//--------------------------------------------------------------

function addTask() {
    const name = document.getElementById('taskName').value;
    const description = document.getElementById('taskDescription').value;
    const startDate = document.getElementById('taskStartDate').value;
    const endDate = document.getElementById('taskEndDate').value;
    const responsible = document.getElementById('taskResponsible').value;
    const id = editingTaskId || Date.now().toString(); // Si se edita, se conserva el ID
    const columnId = 'todo'; // Nueva tarea siempre va a "Por hacer"

    if (editingTaskId) {
        const oldTask = document.querySelector(`[data-id="${editingTaskId}"]`);
        if (oldTask) oldTask.remove();
        editingTaskId = null;
    }

    createTask(columnId, name, description, startDate, endDate, responsible, id);
    closeTaskModal();
}

//--------------------------------------------------------------
// PASO 4: CREAR UNA TAREA EN EL DOM
//--------------------------------------------------------------

function createTask(columnId, name, description, startDate, endDate, responsible, id, subtasks = []) {
    const column = document.getElementById(columnId);
    const task = document.createElement('div');
    task.className = 'task';
    task.draggable = true;
    task.setAttribute('data-id', id);
    task.addEventListener('dragstart', drag);

    // Evaluar fechas
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaFin = new Date(endDate);
    fechaFin.setHours(0, 0, 0, 0);
    const diffDias = Math.floor((fechaFin - hoy) / (1000 * 60 * 60 * 24));
    const esHecho = columnId === 'done';

    // Estilos según vencimiento
    let nameColor = '';
    let textoClass = '';
    if (esHecho) {
        nameColor = 'gray';
        textoClass = 'texto-gris';
    } else if (diffDias < 0) {
        nameColor = 'red';
    } else if (diffDias <= 7) {
        nameColor = 'orange';
    } else {
        nameColor = 'green';
    }

    // HTML general
    let contenidoTarea = `
        <strong style="color: ${nameColor}">${name}</strong>
        <div class="${textoClass}">
            <p>${description}</p>
            <p>Inicio: ${startDate}</p>
            <p>Final: ${endDate}</p>
            <p>Responsable: ${responsible}</p>
        </div>
    `;

    // Si ya está terminada
    if (esHecho) {
        contenidoTarea += `<p class="tarea-terminada">✓ Terminada</p>`;
    } else {
        const subtasksHTML = subtasks.map(sub => `
            <li data-subtask-id="${sub.id}">
                <input type="checkbox" ${sub.completed ? 'checked' : ''} onclick="toggleSubtask('${id}', '${sub.id}')">
                <span contenteditable="true" onblur="editSubtask('${id}', '${sub.id}', this.innerText)">${sub.text}</span>
                <button onclick="deleteSubtask('${id}', '${sub.id}')">X</button>
            </li>
        `).join('');

        contenidoTarea += `
            <ul class="subtask-list">${subtasksHTML}</ul>
            <input type="text" placeholder="Nueva subtarea..." onkeydown="if(event.key === 'Enter') addSubtask('${id}', this)">
            <div class="task-actions">
                <button class="circle-btn edit" onclick="editTask('${id}')">Editar</button>
                <button class="circle-btn delete" onclick="deleteTask('${id}')">Eliminar</button>
            </div>
        `;
    }

    task.innerHTML = contenidoTarea;
    column.querySelector('.task-container').appendChild(task);

    // Guardar en localStorage
    saveTask({ columnId, name, description, startDate, endDate, responsible, id, subtasks });
}

//--------------------------------------------------------------
// PASO 5: GUARDAR UNA TAREA EN LOCALSTORAGE
//--------------------------------------------------------------

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

//--------------------------------------------------------------
// PASO 6: CARGAR TODAS LAS TAREAS EN PANTALLA
//--------------------------------------------------------------

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

// Limpiar y volver a cargar
function reloadTasks() {
    document.querySelectorAll('.task-container').forEach(c => c.innerHTML = '');
    loadTasks();
}

//--------------------------------------------------------------
// PASO 7: ACTUALIZAR ESTADO DE UNA TAREA AL MOVERLA
//--------------------------------------------------------------

function updateTaskStatus(id, columnId) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.columnId = columnId;
        saveTask(task);
    }
}

//--------------------------------------------------------------
// PASO 8: EDITAR Y ELIMINAR TAREAS
//--------------------------------------------------------------

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

//--------------------------------------------------------------
// PASO 9: FUNCIONES PARA MANEJAR SUBTAREAS
//--------------------------------------------------------------

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

//--------------------------------------------------------------
// PASO 10: ALERTA DE TAREAS VENCIDAS PENDIENTES
//--------------------------------------------------------------

function mostrarAlertasDeTareasVencidas() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const tareasAtrasadasPendientes = tasks.filter(task => {
        const fechaFin = new Date(task.endDate);
        fechaFin.setHours(0, 0, 0, 0);
        return fechaFin < hoy && task.columnId !== 'done';
    });

    if (tareasAtrasadasPendientes.length > 0) {
        const lista = tareasAtrasadasPendientes.map(t => `• ${t.name} (Fin: ${t.endDate})`).join('\n');
        alert(`⚠️ Tienes ${tareasAtrasadasPendientes.length} tarea(s) pendientes y vencidas:\n\n${lista}`);
    }
}

//--------------------------------------------------------------
// PASO FINAL: EJECUTAR AL CARGAR LA PÁGINA
//--------------------------------------------------------------

loadTasks();
mostrarAlertasDeTareasVencidas();
