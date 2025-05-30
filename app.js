const API_URL = 'http://localhost:3000/tareas';

document.addEventListener('DOMContentLoaded', () => {
    // Carga las tareas existentes cuando la página se carga.
    cargarTareas();

    // Asignar evento al botón de nueva tarea
    document.getElementById('btnNuevaTarea').addEventListener('click', () => {
        mostrarFormularioNuevaTarea();
    });


    // Maneja el envío del formulario para crear una nueva tarea.
    document.getElementById('form-tarea-nueva').addEventListener('submit', async (e) => {
        e.preventDefault();
        const datos = Object.fromEntries(new FormData(e.target));

        // Valida que los datos sean correctos antes de enviarlos.
        if (!validarDatos(datos)) return;

        // Crea la nueva tarea y la añade al DOM.
        const nuevaTarea = await crearTarea(datos);
        document.getElementById(nuevaTarea.estado).appendChild(crearElementoTarea(nuevaTarea));

        // Resetea el formulario y lo oculta después de crear la tarea.
        e.target.reset();
        ocultarFormularios();
    });

    // Maneja el envío del formulario para editar una tarea existente.
    document.getElementById('form-tarea-editar').addEventListener('submit', async (e) => {
        e.preventDefault();
        const datos = Object.fromEntries(new FormData(e.target));

        // Valida que los datos sean correctos antes de enviarlos.
        if (!validarDatos(datos)) return;

        // Actualiza la tarea en la API y recarga la lista.
        await actualizarTarea(datos.id, datos);
        cargarTareas();

        // Resetea el formulario y lo oculta después de actualizar la tarea.
        e.target.reset();
        ocultarFormularios();
    });
});

// Obtiene todas las tareas desde la API y las muestra en el tablero.
async function cargarTareas() {
    try {
        const tareas = await getTareas();
        renderTareasPorEstado(tareas);
    } catch (error) {
        console.error("Error al cargar tareas:", error);
    }
}

// Renderiza las tareas agrupadas por estado (pendiente, en progreso, terminada).
function renderTareasPorEstado(tareas) {
    ['pendiente', 'progreso', 'terminada'].forEach(estado => {
        const contenedor = document.getElementById(estado);
        contenedor.innerHTML = ''; // Limpia las tareas antes de agregar nuevas.
        tareas.filter(t => t.estado === estado).forEach(t => {
            contenedor.appendChild(crearElementoTarea(t)); // Agrega cada tarea al contenedor correspondiente.
        });
    });
}

// Crea un elemento HTML para cada tarea y asigna los eventos de edición y eliminación.
function crearElementoTarea(tarea) {
    const div = document.createElement('div');
    div.className = 'card mb-2';
    div.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${tarea.titulo}</h5>
            <p class="card-text">${tarea.descripcion}</p>
            <p class="text-muted"><strong>Responsable:</strong> ${tarea.responsable}</p>
            <div class="d-flex justify-content-between">
                <button class="btn btn-sm btn-outline-primary btn-editar">Editar</button>
                <button class="btn btn-sm btn-outline-danger btn-eliminar">Eliminar</button>
            </div>
        </div>
    `;
    
    // Asigna eventos de edición y eliminación a cada tarea.
    div.querySelector(".btn-editar").addEventListener("click", () => editarTarea(tarea.id));
    div.querySelector(".btn-eliminar").addEventListener("click", () => eliminarTarea(tarea.id));

    return div;
}

// Obtiene los datos de una tarea específica y llena el formulario de edición con ellos.
async function editarTarea(id) {
    try {
        const tarea = await fetch(`${API_URL}/${id}`).then(res => res.json());
        const form = document.getElementById('form-tarea-editar');
        form.id.value = tarea.id;
        form.titulo.value = tarea.titulo;
        form.descripcion.value = tarea.descripcion;
        form.estado.value = tarea.estado;
        form.responsable.value = tarea.responsable;

        // Muestra el formulario de edición y oculta el de nueva tarea.
        document.getElementById('form-editar-tarea').classList.remove('d-none');
        document.getElementById('form-nueva-tarea').classList.add('d-none');
    } catch (error) {
        console.error("Error al obtener tarea:", error);
    }
}

// Elimina una tarea después de pedir confirmación al usuario.
async function eliminarTarea(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            cargarTareas(); // Recarga la lista de tareas después de eliminar una.
        } catch (error) {
            console.error("Error al eliminar tarea:", error);
        }
    }
}

// Obtiene todas las tareas desde la API simulada.
async function getTareas() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Error al obtener tareas.");
        return await res.json();
    } catch (error) {
        console.error("Hubo un problema:", error);
        alert("No se pudieron cargar las tareas.");
        return [];
    }
}

// Crea una nueva tarea en la API.
async function crearTarea(tarea) {
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tarea)
        });
        return await res.json();
    } catch (error) {
        console.error("Error al crear tarea:", error);
    }
}

// Actualiza una tarea existente en la API.
async function actualizarTarea(id, datos) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
    } catch (error) {
        console.error("Error al actualizar tarea:", error);
    }
}

// Muestra el formulario para agregar una nueva tarea.
function mostrarFormularioNuevaTarea() {
    document.getElementById('form-nueva-tarea').classList.remove('d-none');
    document.getElementById('form-editar-tarea').classList.add('d-none');
}

// Oculta ambos formularios (nuevo y editar).
function ocultarFormularios() {
    document.getElementById('form-nueva-tarea').classList.add('d-none');
    document.getElementById('form-editar-tarea').classList.add('d-none');
}

// Valida los datos de la tarea antes de enviarlos a la API.
function validarDatos(tarea) {
    if (!tarea.titulo || tarea.titulo.trim().length < 3) {
        alert("El título debe tener al menos 3 caracteres.");
        return false;
    }
    if (!tarea.descripcion || tarea.descripcion.trim().length < 5) {
        alert("La descripción debe tener al menos 5 caracteres.");
        return false;
    }
    if (!tarea.responsable || tarea.responsable.trim() === "") {
        alert("El responsable no puede estar vacío.");
        return false;
    }
    return true;
}
