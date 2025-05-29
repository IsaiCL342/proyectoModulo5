const API_URL = 'http://localhost:3000/tareas';

document.addEventListener('DOMContentLoaded', () => {
    cargarTareas();

    document.getElementById('form-tarea-nueva').addEventListener('submit', async (e) => {
        e.preventDefault();
        const datos = Object.fromEntries(new FormData(e.target));

        if (!validarDatos(datos)) return;

        const nuevaTarea = await crearTarea(datos);
        document.getElementById(nuevaTarea.estado).appendChild(crearElementoTarea(nuevaTarea));

        e.target.reset();
        ocultarFormularios();
    });

    document.getElementById('form-tarea-editar').addEventListener('submit', async (e) => {
        e.preventDefault();
        const datos = Object.fromEntries(new FormData(e.target));

        if (!validarDatos(datos)) return;

        await actualizarTarea(datos.id, datos);
        cargarTareas();
        e.target.reset();
        ocultarFormularios();
    });
});

async function cargarTareas() {
    try {
        const tareas = await getTareas();
        renderTareasPorEstado(tareas);
    } catch (error) {
        console.error("Error al cargar tareas:", error);
    }
}

function renderTareasPorEstado(tareas) {
    ['pendiente', 'progreso', 'terminada'].forEach(estado => {
        const contenedor = document.getElementById(estado);
        contenedor.innerHTML = '';
        tareas.filter(t => t.estado === estado).forEach(t => {
            contenedor.appendChild(crearElementoTarea(t));
        });
    });
}

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
    
    div.querySelector(".btn-editar").addEventListener("click", () => editarTarea(tarea.id));
    div.querySelector(".btn-eliminar").addEventListener("click", () => eliminarTarea(tarea.id));

    return div;
}

async function editarTarea(id) {
    try {
        const tarea = await fetch(`${API_URL}/${id}`).then(res => res.json());
        const form = document.getElementById('form-tarea-editar');
        form.id.value = tarea.id;
        form.titulo.value = tarea.titulo;
        form.descripcion.value = tarea.descripcion;
        form.estado.value = tarea.estado;
        form.responsable.value = tarea.responsable;

        document.getElementById('form-editar-tarea').classList.remove('d-none');
        document.getElementById('form-nueva-tarea').classList.add('d-none');
    } catch (error) {
        console.error("Error al obtener tarea:", error);
    }
}

async function eliminarTarea(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            cargarTareas();
        } catch (error) {
            console.error("Error al eliminar tarea:", error);
        }
    }
}

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

function mostrarFormularioNuevaTarea() {
    document.getElementById('form-nueva-tarea').classList.remove('d-none');
    document.getElementById('form-editar-tarea').classList.add('d-none');
}

function ocultarFormularios() {
    document.getElementById('form-nueva-tarea').classList.add('d-none');
    document.getElementById('form-editar-tarea').classList.add('d-none');
}

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