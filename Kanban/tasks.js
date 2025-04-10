function allowDrop(event) { //permite el arrastrar tareas
    event.preventDefault();
}

function drag(event) { //el inicio del arrastre
    event.dataTransfer.setData("taskId", event.target.getAttribute('data-id'));//el target se maneja mediante ids para identificar la tarea arrastrada
}

function drop(event) { //el drop de la tarea
    event.preventDefault(); //previene comportamiento por defecto
    const taskId = event.dataTransfer.getData("taskId"); //obtiene el id de la tarea
    const taskElement = document.querySelector(`[data-id="${taskId}"]`);  //identifica mediante id
    const column = event.target.closest('.column'); //identifica la columna destino :p
    if (!column) return; //validadores
    if (!taskElement) return;
    const targetContainer = column.querySelector('.task-container'); //busca el contenedor de tareas de la columna
    targetContainer.appendChild(taskElement); //mueve la tarea a la columna destino
    updateTaskStatus(taskId, column.id); //actualiza el estado de la tarea
}

function openTaskModal() { //abre el modal para agregar tarea
    document.getElementById('taskModal').style.display = 'block';
}

function closeTaskModal() { //cierra el modal de agregar tarea
    document.getElementById('taskModal').style.display = 'none';
}

function addTask() { //añade o actualiza una tarea desde el modal
    const name = document.getElementById('taskName').value;
    const description = document.getElementById('taskDescription').value;
    const startDate = document.getElementById('taskStartDate').value;
    const endDate = document.getElementById('taskEndDate').value;
    const responsible = document.getElementById('taskResponsible').value;

    const id = editingTaskId || Date.now().toString(); //usa el id actual si se edita

    const columnId = 'todo'; //por defecto

    if (editingTaskId) { //si estamos editando, primero eliminamos el DOM viejo
        const oldTask = document.querySelector(`[data-id="${editingTaskId}"]`);
        if (oldTask) oldTask.remove();
        editingTaskId = null; //resetea
    }

    createTask(columnId, name, description, startDate, endDate, responsible, id);
    closeTaskModal();
}


function createTask(columnId, name, description, startDate, endDate, responsible, id) { //crea una tarea
    const column = document.getElementById(columnId); // pone la tarea en base a su columnid
    const task = document.createElement('div'); //genera un div en el que se pondra la tarea
    task.className = 'task'; //asignar clase al div
    task.draggable = true; //para q se pueda arrastrar
    task.setAttribute('data-id', id); //asigna un data-id por id
    task.addEventListener('dragstart', drag); //para q se pueda arrastrar x2

    task.innerHTML = `
    <strong>${name}</strong>
    <p>${description}</p>
    <p>Inicio: ${startDate}</p>
    <p>Final: ${endDate}</p>
    <p>Responsable: ${responsible}</p>
    <button onclick="editTask('${id}')">✎</button>
    <button onclick="deleteTask('${id}')">✖</button>
`; //define lo q se podra ver en el html


    column.querySelector('.task-container').appendChild(task); //añade la tarea al contenedor
    saveTask({ columnId, name, description, startDate, endDate, responsible, id }); //guarda la tarea en local storage
}

function saveTask(task) { //guarda una tarea en local storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || []; //obtiene las tareas o inicia un array vacio
    const index = tasks.findIndex(t => t.id === task.id); //busca si ya existe la tarea
    if (index !== -1) { //si existe, la actualiza
        tasks[index] = task;
    } else { //si no existe, la agrega
        tasks.push(task);
    }
    localStorage.setItem('tasks', JSON.stringify(tasks)); //guarda el array en local storage
}

function loadTasks() { //carga las tareas al iniciar
    const tasks = JSON.parse(localStorage.getItem('tasks')) || []; //obtiene las tareas o inicia un array vacio
    tasks.forEach(task => { //recorre las tareas y las crea en el DOM
        createTask(task.columnId, task.name, task.description, task.startDate, task.endDate, task.responsible, task.id);
    });
}

function updateTaskStatus(id, columnId) { //actualiza el estado de la tarea al moverse
    let tasks = JSON.parse(localStorage.getItem('tasks')) || []; //obtiene las tareas o inicia un array vacio
    const task = tasks.find(t => t.id === id); //busca la tarea por id
    if (task) { //si la encuentra, actualiza la columna
        task.columnId = columnId;
        saveTask(task); //guarda los cambios en local storage
    }
}

let editingTaskId = null; //variable global para saber si se está editando

function editTask(id) { //abre el modal con los datos de la tarea
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    document.getElementById('taskName').value = task.name;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskStartDate').value = task.startDate;
    document.getElementById('taskEndDate').value = task.endDate;
    document.getElementById('taskResponsible').value = task.responsible;

    editingTaskId = id; //marcamos que estamos editando
    openTaskModal();
}

function deleteTask(id) { //elimina una tarea del DOM y del localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(t => t.id !== id); //quita la tarea con ese id
    localStorage.setItem('tasks', JSON.stringify(tasks)); //guarda cambios

    const taskElement = document.querySelector(`[data-id="${id}"]`); //busca el div de la tarea
    if (taskElement) taskElement.remove(); //la quita del DOM
}

loadTasks(); //carga las tareas al iniciar
