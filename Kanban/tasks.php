<?php
function getTasks($column) {
    $tasks = [
        'todo' => [
            ['name' => 'Diseño de interfaz', 'description' => 'Crear el diseño', 'start' => '2025-03-27', 'end' => '2025-03-30', 'responsible' => 'Juan Pérez'],
        ],
        'in-progress' => [
            ['name' => 'Desarrollo backend', 'description' => 'Implementar API REST', 'start' => '2025-03-25', 'end' => '2025-03-28', 'responsible' => 'Ana López'],
        ],
        'done' => [
            ['name' => 'Análisis de requerimientos', 'description' => 'Recopilar necesidades', 'start' => '2025-03-20', 'end' => '2025-03-22', 'responsible' => 'Carlos Martínez'],
        ],
    ];

    $html = '';
    foreach ($tasks[$column] as $task) {
        $html .= '<div class="task">';
        $html .= '<strong>' . $task['name'] . '</strong>';
        $html .= '<p>' . $task['description'] . '</p>';
        $html .= '<p>Inicio: ' . $task['start'] . '</p>';
        $html .= '<p>Final: ' . $task['end'] . '</p>';
        $html .= '<p>Responsable: ' . $task['responsible'] . '</p>';
        $html .= '</div>';
    }
    return $html;
}
?>
