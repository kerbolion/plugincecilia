// Variables globales para cotizador público
let productosPublico = [];
let categoriasPublico = [
    { id: 'recepcion', nombre: 'Recepción', icono: '🥂', orden: 1 },
    { id: 'entrada', nombre: 'Entrada', icono: '🥗', orden: 2 },
    { id: 'principal', nombre: 'Plato Principal', icono: '🍖', orden: 3 },
    { id: 'postre', nombre: 'Postre', icono: '🍰', orden: 4 },
    { id: 'bebida', nombre: 'Bebidas', icono: '🥤', orden: 5 },
    { id: 'otros', nombre: 'Otros', icono: '📦', orden: 6 }
];

let experienciasPublico = [
    { id: 'cena_almuerzo', nombre: 'Cenas/Almuerzo', icono: '🍽️', descripcion: 'Gastronomía de alta cocina con menús de pasos.', orden: 1 },
    { id: 'cena_maridada', nombre: 'Cenas Maridadas por Pasos', icono: '🍷', descripcion: 'Cada plato armonizado con vinos seleccionados.', orden: 2 },
    { id: 'cata_vinos', nombre: 'Cata de Vinos', icono: '🍾', descripcion: 'Degustación guiada de etiquetas seleccionadas.', orden: 3 },
    { id: 'finger_food', nombre: 'Finger Food & Lounge', icono: '🥂', descripcion: 'Formato relajado para socializar con bocados gourmet.', orden: 4 },
    { id: 'after_office', nombre: 'After Office', icono: '🌆', descripcion: 'Veladas con vinos boutique y DJ en vivo.', orden: 5 },
    { id: 'cocteles', nombre: 'Cócteles de Autor', icono: '🍸', descripcion: 'Barra abierta con cócteles preparados por bartenders.', orden: 6 },
    { id: 'show_cooking', nombre: 'Show Cooking', icono: '👨‍🍳', descripcion: 'Chef cocina en vivo frente a los invitados.', orden: 7 },
    { id: 'brunch', nombre: 'Brunch', icono: '🥞', descripcion: 'Fusión perfecta entre desayuno y almuerzo.', orden: 8 }
];

let motivosEventoPublico = [
    { id: 'cumpleanos', nombre: 'Cumpleaños', icono: '🎂', descripcion: 'Celebraciones personalizadas para homenajear a quien cumple años.', orden: 1 },
    { id: 'celebracion_especial', nombre: 'Celebración Especial', icono: '✨', descripcion: 'Desde encuentros íntimos hasta fiestas sofisticadas.', orden: 2 },
    { id: 'aniversarios', nombre: 'Aniversarios y Bodas', icono: '💕', descripcion: 'Momentos románticos para celebrar el amor.', orden: 3 },
    { id: 'reunion_familiar', nombre: 'Reuniones Familiares', icono: '👨‍👩‍👧‍👦', descripcion: 'Encuentros intergeneracionales en un entorno cuidado.', orden: 4 },
    { id: 'encuentro_amigos', nombre: 'Encuentro de Amigos', icono: '👥', descripcion: 'Reunión distendida con formato relajado.', orden: 5 },
    { id: 'corporativo', nombre: 'Evento Corporativo', icono: '🏢', descripcion: 'Para fomentar integración del equipo.', orden: 6 },
    { id: 'team_building', nombre: 'Team Building', icono: '🤝', descripcion: 'Espacios de planificación y capacitación.', orden: 7 },
    { id: 'comercial', nombre: 'Evento Comercial', icono: '💼', descripcion: 'Presentación de productos o servicios.', orden: 8 }
];

let camposPersonalizadosPublico = [];

// Función para cargar datos desde la API REST pública
async function cargarDatosPublicos() {
    try {
        console.log('Cargando datos públicos...');
        
        // Cargar productos (sin precios)
        const productosResponse = await fetch(`${cotizadorEventosWP.restUrl}public-data/productos`, {
            headers: {
                'X-WP-Nonce': cotizadorEventosWP.nonce
            }
        });
        if (productosResponse.ok) {
            productosPublico = await productosResponse.json();
            console.log('Productos cargados:', productosPublico.length);
        }
        
        // Cargar categorías
        const categoriasResponse = await fetch(`${cotizadorEventosWP.restUrl}public-data/categorias`, {
            headers: {
                'X-WP-Nonce': cotizadorEventosWP.nonce
            }
        });
        if (categoriasResponse.ok) {
            const categoriasData = await categoriasResponse.json();
            if (categoriasData.length > 0) {
                categoriasPublico = categoriasData;
                console.log('Categorías cargadas:', categoriasPublico.length);
            }
        }
        
        // Cargar experiencias
        const experienciasResponse = await fetch(`${cotizadorEventosWP.restUrl}public-data/experiencias`, {
            headers: {
                'X-WP-Nonce': cotizadorEventosWP.nonce
            }
        });
        if (experienciasResponse.ok) {
            const experienciasData = await experienciasResponse.json();
            if (experienciasData.length > 0) {
                experienciasPublico = experienciasData;
                console.log('Experiencias cargadas:', experienciasPublico.length);
            }
        }
        
        // Cargar motivos
        const motivosResponse = await fetch(`${cotizadorEventosWP.restUrl}public-data/motivosEvento`, {
            headers: {
                'X-WP-Nonce': cotizadorEventosWP.nonce
            }
        });
        if (motivosResponse.ok) {
            const motivosData = await motivosResponse.json();
            if (motivosData.length > 0) {
                motivosEventoPublico = motivosData;
                console.log('Motivos cargados:', motivosEventoPublico.length);
            }
        }
        
        // Cargar campos personalizados
        const camposResponse = await fetch(`${cotizadorEventosWP.restUrl}public-data/camposPersonalizados`, {
            headers: {
                'X-WP-Nonce': cotizadorEventosWP.nonce
            }
        });
        if (camposResponse.ok) {
            camposPersonalizadosPublico = await camposResponse.json();
            console.log('Campos personalizados cargados:', camposPersonalizadosPublico.length);
        }
        
    } catch (error) {
        console.error('Error cargando datos públicos:', error);
    }
}

// Función para inicializar el cotizador público
function inicializarCotizadorPublico() {
    console.log('Inicializando cotizador público...');
    
    cargarDatosPublicos().then(() => {
        actualizarExperienciasCheckboxesPublico();
        actualizarMotivosCheckboxesPublico();
        actualizarMenuSelectorPublico();
        generarCamposPersonalizadosPublico();
        
        // Agregar eventos para actualización en tiempo real
        agregarEventosActualizacionPublico();
        
        console.log('Cotizador público inicializado');
    });
}

function actualizarExperienciasCheckboxesPublico() {
    const container = document.getElementById('experienciasCheckboxGroupPublico');
    if (!container) return;
    
    const experienciasOrdenadas = experienciasPublico.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    let html = '';
    experienciasOrdenadas.forEach(experiencia => {
        html += `
            <div class="checkbox-item" onclick="toggleCheckboxPublico(this)">
                <input type="checkbox" name="experienciaPublico" value="${experiencia.id}">
                <label>${experiencia.icono} ${experiencia.nombre}</label>
                <p style="font-size: 0.9rem; color: #6c757d; margin-top: 5px;">${experiencia.descripcion}</p>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function actualizarMotivosCheckboxesPublico() {
    const container = document.getElementById('motivosCheckboxGroupPublico');
    if (!container) return;
    
    const motivosOrdenados = motivosEventoPublico.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    let html = '';
    motivosOrdenados.forEach(motivo => {
        html += `
            <div class="checkbox-item" onclick="toggleCheckboxPublico(this)">
                <input type="checkbox" name="motivoPublico" value="${motivo.id}">
                <label>${motivo.icono} ${motivo.nombre}</label>
                <p style="font-size: 0.9rem; color: #6c757d; margin-top: 5px;">${motivo.descripcion}</p>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function actualizarMenuSelectorPublico() {
    const container = document.getElementById('menuSelectorPublico');
    
    if (productosPublico.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">Cargando opciones de menú...</p>';
        return;
    }

    // Filtrar categorías no ocultas en público
    const categoriasDisponibles = categoriasPublico
        .filter(c => !c.ocultarEnPublico)
        .slice()
        .sort((a, b) => (a.orden || 0) - (b.orden || 0));

    let html = '';
    
    categoriasDisponibles.forEach(categoria => {
        // Filtrar productos no ocultos en público
        const productosCategoria = productosPublico.filter(p => 
            p.categoria === categoria.id && !p.ocultarEnPublico
        );
        
        if (productosCategoria.length > 0) {
            html += `
                <div class="menu-selector">
                    <h4 style="color: #667eea; margin-bottom: 15px;">${categoria.icono} ${categoria.nombre}</h4>
                    <div style="display: grid; gap: 15px;">
                        ${productosCategoria.map(p => `
                            <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 15px; align-items: center; padding: 15px; background: #f8f9fa; border-radius: 10px; border: 2px solid #e1e8ed;">
                                <div style="display: flex; align-items: center;">
                                    <input type="checkbox" id="productoPublico_${p.id}" value="${p.id}" style="margin-right: 10px; transform: scale(1.2);" onchange="toggleProductoPublico(${p.id})">
                                    <label for="productoPublico_${p.id}" style="cursor: pointer; margin: 0;">
                                        <strong>${p.nombre}</strong>
                                        ${p.descripcion ? `<br><small style="color: #6c757d;">${p.descripcion}</small>` : ''}
                                    </label>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <label style="font-size: 0.9rem; margin: 0; color: #495057;">Cantidad:</label>
                                    <input type="number" id="cantidadPublico_${p.id}" min="1" value="1" disabled 
                                           style="width: 80px; padding: 5px; font-size: 0.9rem; text-align: center;"
                                           oninput="validarCantidadPublico(${p.id})" onchange="actualizarResumenPublico()">
                                </div>
                                <div style="text-align: right; min-width: 100px;">
                                    <div style="font-size: 0.9rem; color: #28a745; font-weight: 600;">Seleccionado</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top: 10px; padding: 10px; background: #e3f2fd; border-radius: 8px; font-size: 0.9rem; color: #1976d2;">
                        💡 Selecciona los productos que te interesan y ajusta las cantidades aproximadas
                    </div>
                </div>
            `;
        }
    });

    if (html === '') {
        html = '<p style="text-align: center; color: #6c757d; font-style: italic;">No hay opciones de menú disponibles en este momento.</p>';
    }

    container.innerHTML = html;
}

function generarCamposPersonalizadosPublico() {
    const container = document.getElementById('camposPersonalizadosPublico');
    
    if (camposPersonalizadosPublico.length === 0) {
        container.innerHTML = '';
        return;
    }

    const camposOrdenados = camposPersonalizadosPublico.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    let html = '<div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;"><h5 style="color: #1976d2; margin-bottom: 15px;">📋 Información Adicional</h5>';
    
    // Generar campos en filas de 2
    for (let i = 0; i < camposOrdenados.length; i += 2) {
        html += '<div class="form-row">';
        
        for (let j = i; j < Math.min(i + 2, camposOrdenados.length); j++) {
            const campo = camposOrdenados[j];
            html += '<div class="form-group">';
            html += `<label for="campoPublico_${campo.id}">${campo.nombre}${campo.requerido ? ' *' : ''}:</label>`;
            
            switch (campo.tipo) {
                case 'texto':
                    html += `<input type="text" id="campoPublico_${campo.id}" placeholder="${campo.placeholder}" ${campo.requerido ? 'required' : ''} oninput="actualizarResumenPublico()">`;
                    break;
                case 'numero':
                    html += `<input type="number" id="campoPublico_${campo.id}" placeholder="${campo.placeholder}" ${campo.requerido ? 'required' : ''} oninput="actualizarResumenPublico()">`;
                    break;
                case 'fecha':
                    html += `<input type="date" id="campoPublico_${campo.id}" ${campo.requerido ? 'required' : ''} onchange="actualizarResumenPublico()">`;
                    break;
                case 'hora':
                    html += `<input type="time" id="campoPublico_${campo.id}" ${campo.requerido ? 'required' : ''} onchange="actualizarResumenPublico()">`;
                    break;
                case 'checkbox':
                    html += `<div style="display: flex; align-items: center; gap: 10px; margin-top: 8px;"><input type="checkbox" id="campoPublico_${campo.id}" onchange="actualizarResumenPublico()"><label for="campoPublico_${campo.id}">${campo.placeholder || 'Activar'}</label></div>`;
                    break;
                case 'desplegable':
                    html += `<select id="campoPublico_${campo.id}" ${campo.requerido ? 'required' : ''} onchange="actualizarResumenPublico()">`;
                    html += `<option value="">${campo.placeholder || 'Seleccionar...'}</option>`;
                    campo.opciones.forEach(opcion => {
                        html += `<option value="${opcion}">${opcion}</option>`;
                    });
                    html += '</select>';
                    break;
            }
            
            html += '</div>';
        }
        
        html += '</div>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function toggleCheckboxPublico(element) {
    const checkbox = element.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
    element.classList.toggle('selected', checkbox.checked);
    actualizarResumenPublico();
}

function toggleProductoPublico(productoId) {
    const checkbox = document.getElementById(`productoPublico_${productoId}`);
    const cantidadInput = document.getElementById(`cantidadPublico_${productoId}`);
    const cantidadPersonas = parseInt(document.getElementById('cantidadPersonasPublico').value) || 0;
    
    if (checkbox.checked) {
        if (cantidadPersonas === 0) {
            checkbox.checked = false;
            mostrarAlertaPublico('Por favor ingresa primero la cantidad de personas para el evento.', 'error');
            return;
        }
        
        cantidadInput.disabled = false;
        cantidadInput.focus();
    } else {
        cantidadInput.disabled = true;
        cantidadInput.value = 1;
    }
    
    actualizarResumenPublico();
}

function validarCantidadPublico(productoId) {
    const cantidadInput = document.getElementById(`cantidadPublico_${productoId}`);
    const cantidadPersonas = parseInt(document.getElementById('cantidadPersonasPublico').value) || 0;
    
    if (cantidadPersonas === 0) {
        mostrarAlertaPublico('Primero ingresa la cantidad de personas para el evento.', 'error');
        cantidadInput.value = 1;
        return;
    }
    
    let cantidad = parseInt(cantidadInput.value) || 1;
    
    if (cantidad < 1) {
        cantidad = 1;
    }
    
    if (cantidad > cantidadPersonas) {
        cantidad = cantidadPersonas;
        mostrarAlertaPublico(`La cantidad no puede exceder el número de invitados (${cantidadPersonas}).`, 'error');
    }
    
    cantidadInput.value = cantidad;
    actualizarResumenPublico();
}

function actualizarResumenPublico() {
    // Esta función actualiza el resumen en tiempo real
    // Por ahora solo validamos que los campos requeridos estén completos
    const nombreCliente = document.getElementById('nombreClientePublico').value.trim();
    const emailCliente = document.getElementById('emailClientePublico').value.trim();
    const telefonoCliente = document.getElementById('telefonoClientePublico').value.trim();
    const fechaEvento = document.getElementById('fechaEventoPublico').value;
    const cantidadPersonas = parseInt(document.getElementById('cantidadPersonasPublico').value);
    const formatoEvento = document.getElementById('formatoEventoPublico').value;

    // Habilitar/deshabilitar botón de envío basado en campos requeridos
    const botonEnviar = document.querySelector('button[onclick="enviarSolicitudCotizacion()"]');
    if (botonEnviar) {
        const camposCompletos = nombreCliente && emailCliente && telefonoCliente && fechaEvento && cantidadPersonas && formatoEvento;
        botonEnviar.disabled = !camposCompletos;
        botonEnviar.style.opacity = camposCompletos ? '1' : '0.5';
    }
}

function enviarSolicitudCotizacion() {
    // Validar campos requeridos
    const nombreCliente = document.getElementById('nombreClientePublico').value.trim();
    const emailCliente = document.getElementById('emailClientePublico').value.trim();
    const telefonoCliente = document.getElementById('telefonoClientePublico').value.trim();
    const fechaEvento = document.getElementById('fechaEventoPublico').value;
    const cantidadPersonas = parseInt(document.getElementById('cantidadPersonasPublico').value);
    const formatoEvento = document.getElementById('formatoEventoPublico').value;

    if (!nombreCliente || !emailCliente || !telefonoCliente || !fechaEvento || !cantidadPersonas || !formatoEvento) {
        mostrarAlertaPublico('Por favor completa todos los campos requeridos.', 'error');
        return;
    }

    // Recopilar datos de la solicitud
    const motivosSeleccionados = Array.from(document.querySelectorAll('input[name="motivoPublico"]:checked')).map(cb => cb.value);
    const experienciasSeleccionadas = Array.from(document.querySelectorAll('input[name="experienciaPublico"]:checked')).map(cb => cb.value);
    
    // Recopilar productos seleccionados
    const productosSeleccionados = [];
    productosPublico.forEach(producto => {
        const checkbox = document.getElementById(`productoPublico_${producto.id}`);
        const cantidadInput = document.getElementById(`cantidadPublico_${producto.id}`);
        
        if (checkbox && checkbox.checked && cantidadInput) {
            const cantidad = parseInt(cantidadInput.value) || 0;
            if (cantidad > 0) {
                productosSeleccionados.push({
                    nombre: producto.nombre,
                    descripcion: producto.descripcion,
                    categoria: producto.categoria,
                    cantidad: cantidad
                });
            }
        }
    });

    // Recopilar campos personalizados
    const camposPersonalizadosValores = {};
    camposPersonalizadosPublico.forEach(campo => {
        const elemento = document.getElementById(`campoPublico_${campo.id}`);
        if (elemento) {
            if (campo.tipo === 'checkbox') {
                camposPersonalizadosValores[campo.nombre] = elemento.checked ? 'Sí' : 'No';
            } else {
                camposPersonalizadosValores[campo.nombre] = elemento.value || '';
            }
        }
    });

    const comentarios = document.getElementById('comentariosPublico').value.trim();

    // Crear objeto con todos los datos
    const solicitudCotizacion = {
        cliente: {
            nombre: nombreCliente,
            email: emailCliente,
            telefono: telefonoCliente,
            fechaEvento: fechaEvento,
            cantidadPersonas: cantidadPersonas,
            formatoEvento: formatoEvento
        },
        motivos: motivosSeleccionados.map(id => {
            const motivo = motivosEventoPublico.find(m => m.id === id);
            return motivo ? motivo.nombre : id;
        }),
        experiencias: experienciasSeleccionadas.map(id => {
            const experiencia = experienciasPublico.find(e => e.id === id);
            return experiencia ? experiencia.nombre : id;
        }),
        productos: productosSeleccionados,
        camposPersonalizados: camposPersonalizadosValores,
        comentarios: comentarios,
        fechaSolicitud: new Date().toLocaleString()
    };

    // Enviar solicitud a la API REST
    enviarSolicitudAPI(solicitudCotizacion);
}

async function enviarSolicitudAPI(solicitudCotizacion) {
    try {
        const response = await fetch(`${cotizadorEventosWP.restUrl}solicitud-publica`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': cotizadorEventosWP.nonce
            },
            body: JSON.stringify({
                data: solicitudCotizacion
            })
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                // Mostrar modal de confirmación
                mostrarModalConfirmacion();
                
                // Limpiar formulario
                setTimeout(() => {
                    limpiarFormularioPublico();
                }, 2000);
            } else {
                mostrarAlertaPublico('Error al enviar la solicitud. Por favor intenta nuevamente.', 'error');
            }
        } else {
            mostrarAlertaPublico('Error de conexión. Por favor intenta nuevamente.', 'error');
        }
    } catch (error) {
        console.error('Error enviando solicitud:', error);
        mostrarAlertaPublico('Error al enviar la solicitud. Por favor intenta nuevamente.', 'error');
    }
}

function mostrarModalConfirmacion() {
    const modal = document.getElementById('modalConfirmacionPublico');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function cerrarModalConfirmacion() {
    const modal = document.getElementById('modalConfirmacionPublico');
    if (modal) {
        modal.style.display = 'none';
    }
}

function limpiarFormularioPublico() {
    // Limpiar campos básicos
    document.getElementById('nombreClientePublico').value = '';
    document.getElementById('emailClientePublico').value = '';
    document.getElementById('telefonoClientePublico').value = '';
    document.getElementById('fechaEventoPublico').value = '';
    document.getElementById('cantidadPersonasPublico').value = '';
    document.getElementById('formatoEventoPublico').value = '';
    document.getElementById('comentariosPublico').value = '';

    // Limpiar checkboxes
    document.querySelectorAll('input[name="motivoPublico"], input[name="experienciaPublico"]').forEach(cb => {
        cb.checked = false;
        cb.closest('.checkbox-item')?.classList.remove('selected');
    });

    // Limpiar productos
    document.querySelectorAll('input[id^="productoPublico_"]').forEach(checkbox => {
        checkbox.checked = false;
        const productoId = checkbox.value;
        const cantidadInput = document.getElementById(`cantidadPublico_${productoId}`);
        if (cantidadInput) {
            cantidadInput.disabled = true;
            cantidadInput.value = 1;
        }
    });

    // Limpiar campos personalizados
    camposPersonalizadosPublico.forEach(campo => {
        const elemento = document.getElementById(`campoPublico_${campo.id}`);
        if (elemento) {
            if (campo.tipo === 'checkbox') {
                elemento.checked = false;
            } else {
                elemento.value = '';
            }
        }
    });
}

function agregarEventosActualizacionPublico() {
    // Eventos para campos del cliente
    const campos = ['nombreClientePublico', 'emailClientePublico', 'telefonoClientePublico', 'fechaEventoPublico', 'cantidadPersonasPublico', 'formatoEventoPublico'];
    campos.forEach(campoId => {
        const elemento = document.getElementById(campoId);
        if (elemento) {
            elemento.addEventListener('input', actualizarResumenPublico);
            elemento.addEventListener('change', actualizarResumenPublico);
        }
    });
}

function mostrarAlertaPublico(mensaje, tipo) {
    const container = document.getElementById('alertCotizacionPublico');
    const alertClass = tipo === 'success' ? 'alert-success' : 'alert-error';
    
    container.innerHTML = `
        <div class="alert ${alertClass}">
            ${mensaje}
        </div>
    `;

    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar que estamos en el cotizador público
    if (typeof cotizadorEventosWP !== 'undefined' && !cotizadorEventosWP.isAdmin) {
        console.log('Inicializando cotizador público...');
        // Esperar un poco para asegurar que todo esté disponible
        setTimeout(inicializarCotizadorPublico, 100);
    }
});