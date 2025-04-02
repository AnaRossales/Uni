
function allowDrop(event) {
    event.preventDefault(); //permite el arrastrar tareas
}

function drag(event) { //el inicio del arrastre
    event.dataTransfer.setData("taskId", event.target.getAttribute('data-id'));//el target se maneja mediante ids para identificar la tarea arrastrada
}

function drop(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("taskId"); 
    const taskElement = document.querySelector(`[data-id="${taskId}"]`);  //identifica mediante id
    const column = event.target.closest('.column'); //identifica la columna destino :p
    if (!column) return; //validadores
    if (!taskElement) return;
    const targetContainer = column.querySelector('.task-container');
    targetContainer.appendChild(taskElement);
}

function createTask(columnId, name, description, startDate, endDate, responsible, id) {
    const column = document.getElementById(columnId); // pone la tarea en base a su columnid
    const task = document.createElement('div'); //geenera un div en el que se pondra la tarea
    task.className = 'task'; //asignar clase al div
    task.draggable = true; //para q se pueda arrastrar
    task.setAttribute('data-id', id); //asigan un data-id por id
    task.addEventListener('dragstart', drag); //para q se pueda arrastrar x2

    task.innerHTML = `
        <strong>${name}</strong>
        <p>${description}</p>
        <p>Inicio: ${startDate}</p>
        <p>Final: ${endDate}</p>
        <p>Responsable: ${responsible}</p>
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

loadTasks(); 

// Ejemplos de creación de tareas
// createTask('todo', 'Diseño de interfaz', 'Crear el diseño de la aplicación', '2025-03-27', '2025-03-30', 'Juan Pérez', '1');
// createTask('in-progress', 'Desarrollo backend', 'Implementar la API REST', '2025-03-25', '2025-03-28', 'Ana López', '2');
// createTask('done', 'Análisis de requerimientos', 'Recopilar necesidades del cliente', '2025-03-20', '2025-03-22', 'Carlos Martínez', '3');