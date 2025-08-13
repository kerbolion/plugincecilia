// Variables globales
let productos = [];
let cotizacionActual = {};
let productoEnEdicion = null;

// Funciones de API REST - CORREGIDAS para usar WordPress API
async function cargarDatosDesdeAPI(tipo) {
    try {
        const response = await fetch(`${cotizadorEventosWP.restUrl}data/${tipo}`, {
            method: 'GET',
            headers: {
                'X-WP-Nonce': cotizadorEventosWP.nonce,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log(`Datos cargados para ${tipo}:`, data);
            return data;
        } else {
            console.warn(`Error cargando ${tipo}:`, response.status);
            return [];
        }
    } catch (error) {
        console.error(`Error cargando ${tipo}:`, error);
        return [];
    }
}

async function guardarDatosEnAPI(tipo, datos) {
    try {
        const response = await fetch(`${cotizadorEventosWP.restUrl}data/${tipo}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': cotizadorEventosWP.nonce
            },
            body: JSON.stringify({
                data: datos
            })
        });
        
        if (response.ok) {
            console.log(`Datos guardados para ${tipo}`);
            return true;
        } else {
            console.error(`Error guardando ${tipo}:`, response.status);
            return false;
        }
    } catch (error) {
        console.error(`Error guardando ${tipo}:`, error);
        return false;
    }
}

let categorias = [
    { id: 'recepcion', nombre: 'Recepción', icono: '🥂', orden: 1 },
    { id: 'entrada', nombre: 'Entrada', icono: '🥗', orden: 2 },
    { id: 'principal', nombre: 'Plato Principal', icono: '🍖', orden: 3 },
    { id: 'postre', nombre: 'Postre', icono: '🍰', orden: 4 },
    { id: 'bebida', nombre: 'Bebidas', icono: '🥤', orden: 5 },
    { id: 'otros', nombre: 'Otros', icono: '📦', orden: 6 }
];
let categoriaEnEdicion = null;
let estadosCotizacion = [
    { id: 'borrador', nombre: 'Borrador', icono: '📝', color: '#6c757d', orden: 1 },
    { id: 'solicitud_publica', nombre: 'Solicitud Pública', icono: '🌐', color: '#17a2b8', orden: 2 },
    { id: 'enviada', nombre: 'Enviada', icono: '📤', color: '#007bff', orden: 3 },
    { id: 'revisando', nombre: 'En Revisión', icono: '👀', color: '#ffc107', orden: 4 },
    { id: 'negociando', nombre: 'Negociando', icono: '💬', color: '#fd7e14', orden: 5 },
    { id: 'aprobada', nombre: 'Aprobada', icono: '✅', color: '#28a745', orden: 6 },
    { id: 'rechazada', nombre: 'Rechazada', icono: '❌', color: '#dc3545', orden: 7 },
    { id: 'cancelada', nombre: 'Cancelada', icono: '🚫', color: '#6c757d', orden: 8 }
];
let estadoEnEdicion = null;

// Nuevas variables para las gestiones
let experiencias = [
    { id: 'cena_almuerzo', nombre: 'Cenas/Almuerzo', icono: '🍽️', descripcion: 'Gastronomía de alta cocina con menús de pasos.', orden: 1 },
    { id: 'cena_maridada', nombre: 'Cenas Maridadas por Pasos', icono: '🍷', descripcion: 'Cada plato armonizado con vinos seleccionados.', orden: 2 },
    { id: 'cata_vinos', nombre: 'Cata de Vinos', icono: '🍾', descripcion: 'Degustación guiada de etiquetas seleccionadas.', orden: 3 },
    { id: 'finger_food', nombre: 'Finger Food & Lounge', icono: '🥂', descripcion: 'Formato relajado para socializar con bocados gourmet.', orden: 4 },
    { id: 'after_office', nombre: 'After Office', icono: '🌆', descripcion: 'Veladas con vinos boutique y DJ en vivo.', orden: 5 },
    { id: 'cocteles', nombre: 'Cócteles de Autor', icono: '🍸', descripcion: 'Barra abierta con cócteles preparados por bartenders.', orden: 6 },
    { id: 'show_cooking', nombre: 'Show Cooking', icono: '👨‍🍳', descripcion: 'Chef cocina en vivo frente a los invitados.', orden: 7 },
    { id: 'brunch', nombre: 'Brunch', icono: '🥞', descripcion: 'Fusión perfecta entre desayuno y almuerzo.', orden: 8 }
];
let experienciaEnEdicion = null;

let motivosEvento = [
    { id: 'cumpleanos', nombre: 'Cumpleaños', icono: '🎂', descripcion: 'Celebraciones personalizadas para homenajear a quien cumple años.', orden: 1 },
    { id: 'celebracion_especial', nombre: 'Celebración Especial', icono: '✨', descripcion: 'Desde encuentros íntimos hasta fiestas sofisticadas.', orden: 2 },
    { id: 'aniversarios', nombre: 'Aniversarios y Bodas', icono: '💕', descripcion: 'Momentos románticos para celebrar el amor.', orden: 3 },
    { id: 'reunion_familiar', nombre: 'Reuniones Familiares', icono: '👨‍👩‍👧‍👦', descripcion: 'Encuentros intergeneracionales en un entorno cuidado.', orden: 4 },
    { id: 'encuentro_amigos', nombre: 'Encuentro de Amigos', icono: '👥', descripcion: 'Reunión distendida con formato relajado.', orden: 5 },
    { id: 'corporativo', nombre: 'Evento Corporativo', icono: '🏢', descripcion: 'Para fomentar integración del equipo.', orden: 6 },
    { id: 'team_building', nombre: 'Team Building', icono: '🤝', descripcion: 'Espacios de planificación y capacitación.', orden: 7 },
    { id: 'comercial', nombre: 'Evento Comercial', icono: '💼', descripcion: 'Presentación de productos o servicios.', orden: 8 }
];
let motivoEnEdicion = null;

// Variables para campos personalizados del cliente
let camposPersonalizados = [];
let campoEnEdicion = null;

let cotizacionSeleccionada = null;
let editandoCotizacion = false;
let cotizacionOriginalEnEdicion = null;

// Variables para vista de presentación
let vistaPresentacion = false;
let ocultarPrecios = false;

// Función para crear una copia profunda de objetos
function copiarProfundo(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj);
    }
    
    if (obj instanceof Array) {
        return obj.map(item => copiarProfundo(item));
    }
    
    if (typeof obj === 'object') {
        const copy = {};
        Object.keys(obj).forEach(key => {
            copy[key] = copiarProfundo(obj[key]);
        });
        return copy;
    }
}

// Función para actualizar el resumen en tiempo real - CORREGIDA
function actualizarResumenTiempoReal() {
    const nombreCliente = document.getElementById('nombreCliente').value.trim();
    const emailCliente = document.getElementById('emailCliente').value.trim();
    const telefonoCliente = document.getElementById('telefonoCliente').value.trim();
    const fechaEvento = document.getElementById('fechaEvento').value;
    const cantidadPersonas = parseInt(document.getElementById('cantidadPersonas').value);
    const formatoEvento = document.getElementById('formatoEvento').value;
    const estadoSeleccionado = document.getElementById('estadoCotizacion').value;

    if (!nombreCliente || !fechaEvento || !cantidadPersonas) {
        document.getElementById('resumenCotizacion').style.display = 'none';
        return;
    }

    const motivosSeleccionados = Array.from(document.querySelectorAll('input[name="motivo"]:checked')).map(cb => cb.value);
    const experienciasSeleccionadas = Array.from(document.querySelectorAll('input[name="experiencia"]:checked')).map(cb => cb.value);
    const valoresCamposPersonalizados = obtenerValoresCamposPersonalizados();

    const productosSeleccionados = [];
    
    productos.forEach(producto => {
        const checkbox = document.getElementById(`producto_${producto.id}`);
        const cantidadInput = document.getElementById(`cantidad_${producto.id}`);
        
        if (checkbox && checkbox.checked && cantidadInput) {
            const cantidad = parseInt(cantidadInput.value) || 0;
            if (cantidad > 0) {
                productosSeleccionados.push({
                    ...producto,
                    cantidad: cantidad,
                    subtotal: producto.precio * cantidad
                });
            }
        }
    });

    if (productosSeleccionados.length === 0) {
        mostrarResumenVacio(nombreCliente, emailCliente, telefonoCliente, fechaEvento, cantidadPersonas, formatoEvento, estadoSeleccionado, motivosSeleccionados, experienciasSeleccionadas, valoresCamposPersonalizados);
        return;
    }

    const subtotalProductos = productosSeleccionados.reduce((sum, p) => sum + p.subtotal, 0);
    const costoTotal = productosSeleccionados.reduce((sum, p) => sum + (p.costo * p.cantidad), 0);
    const margenTotal = subtotalProductos - costoTotal;

    let cotizacionId;
    if (editandoCotizacion && cotizacionOriginalEnEdicion) {
        cotizacionId = cotizacionOriginalEnEdicion.id;
    } else {
        cotizacionId = Date.now();
    }

    cotizacionActual = {
        id: cotizacionId,
        fechaCotizacion: new Date().toLocaleDateString(),
        estado: estadoSeleccionado,
        cliente: {
            nombre: nombreCliente,
            email: emailCliente,
            telefono: telefonoCliente,
            fechaEvento: fechaEvento ? new Date(fechaEvento).toLocaleDateString() : '',
            horaEvento: fechaEvento ? new Date(fechaEvento).toLocaleTimeString() : '',
            fechaEventoOriginal: fechaEvento,
            cantidadPersonas,
            formatoEvento
        },
        motivos: motivosSeleccionados,
        experiencias: experienciasSeleccionadas,
        productos: productosSeleccionados,
        camposPersonalizados: valoresCamposPersonalizados,
        totales: {
            subtotal: subtotalProductos,
            costoTotal,
            margenTotal,
            porcentajeMargen: costoTotal > 0 ? ((margenTotal / costoTotal) * 100).toFixed(1) : 0
        }
    };

    mostrarResumenCotizacion();
}

// Función para mostrar resumen vacío - CORREGIDA
function mostrarResumenVacio(nombreCliente, emailCliente, telefonoCliente, fechaEvento, cantidadPersonas, formatoEvento, estadoSeleccionado, motivosSeleccionados, experienciasSeleccionadas, valoresCamposPersonalizados) {
    const container = document.getElementById('resumenCotizacion');
    const estadoCotizacion = estadosCotizacion.find(est => est.id === estadoSeleccionado) || estadosCotizacion[0];

    const motivosTexto = motivosSeleccionados.map(id => {
        const motivo = motivosEvento.find(m => m.id === id);
        return motivo ? `${motivo.icono} ${motivo.nombre}` : id;
    });

    const experienciasTexto = experienciasSeleccionadas.map(id => {
        const experiencia = experiencias.find(e => e.id === id);
        return experiencia ? `${experiencia.icono} ${experiencia.nombre}` : id;
    });

    let camposPersonalizadosHtml = '';
    if (camposPersonalizados.length > 0 && Object.keys(valoresCamposPersonalizados).some(key => valoresCamposPersonalizados[key])) {
        camposPersonalizadosHtml = `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #2c3e50; margin-bottom: 10px;">📋 Información Adicional:</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                    ${camposPersonalizados.map(campo => {
                        const valor = valoresCamposPersonalizados[campo.id];
                        if (valor) {
                            return `
                                <div style="background: white; padding: 10px; border-radius: 8px; border-left: 3px solid #17a2b8;">
                                    <div style="font-size: 0.9rem; color: #6c757d;">${campo.nombre}</div>
                                    <div style="font-weight: 600; color: #2c3e50;">${valor}</div>
                                </div>
                            `;
                        }
                        return '';
                    }).join('')}
                </div>
            </div>
        `;
    }

    const politicas = localStorage.getItem('politicas') || '';

    let html = `
        <div class="cotizacion-resumen">
            <h3 style="color: #667eea; margin-bottom: 20px; text-align: center;">📊 Vista Previa de Cotización</h3>
            
            <div class="cotizacion-header">
                <div class="info-box">
                    <div class="info-label">Cliente</div>
                    <div class="info-value">${nombreCliente}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Email</div>
                    <div class="info-value">${emailCliente}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Teléfono</div>
                    <div class="info-value">${telefonoCliente}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Estado</div>
                    <div class="info-value" style="color: ${estadoCotizacion.color}; display: flex; align-items: center; gap: 5px;">
                        <span>${estadoCotizacion.icono}</span>
                        <span>${estadoCotizacion.nombre}</span>
                    </div>
                </div>
                <div class="info-box">
                    <div class="info-label">Fecha del Evento</div>
                    <div class="info-value">${fechaEvento ? new Date(fechaEvento).toLocaleDateString() : 'No especificada'}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Hora</div>
                    <div class="info-value">${fechaEvento ? new Date(fechaEvento).toLocaleTimeString() : 'No especificada'}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Personas</div>
                    <div class="info-value">${cantidadPersonas} (${formatoEvento})</div>
                </div>
            </div>

            ${camposPersonalizadosHtml}

            ${motivosSeleccionados.length > 0 ? `
                <div style="margin-bottom: 20px;">
                    <h4 style="color: #2c3e50; margin-bottom: 10px;">Motivo del Evento:</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${motivosTexto.map(m => `<span style="background: #667eea; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.9rem;">${m}</span>`).join('')}
                    </div>
                </div>
            ` : ''}

            ${experienciasSeleccionadas.length > 0 ? `
                <div style="margin-bottom: 20px;">
                    <h4 style="color: #2c3e50; margin-bottom: 10px;">Experiencias Seleccionadas:</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${experienciasTexto.map(e => `<span style="background: #28a745; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.9rem;">${e}</span>`).join('')}
                    </div>
                </div>
            ` : ''}

            <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 15px; margin: 20px 0;">
                <div style="font-size: 3rem; margin-bottom: 15px;">🍽️</div>
                <h4 style="color: #6c757d; margin-bottom: 10px;">No hay productos seleccionados</h4>
                <p style="color: #6c757d;">Selecciona productos del menú para ver el detalle y total de la cotización</p>
            </div>

            ${politicas ? `
                <div class="politicas-section">
                    <h4 style="color: #2c3e50; margin-bottom: 15px;">📋 Políticas de la Empresa</h4>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545;">
                        ${politicas}
                    </div>
                </div>
            ` : ''}

            <div class="no-print" style="text-align: center; margin-top: 20px;">
                <button class="btn" onclick="descargarCotizacion()" disabled style="opacity: 0.5;">📄 Descargar TXT</button>
                <button class="btn" onclick="guardarCotizacion()" disabled style="opacity: 0.5;">💾 Guardar Cotización</button>
                <div style="margin-top: 10px; font-size: 0.9rem; color: #6c757d;">Agrega productos para habilitar las acciones</div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    container.style.display = 'block';
}

// Función para limpiar cotización - CORREGIDA
function limpiarCotizacion(sinConfirmacion = false) {
    if (!sinConfirmacion && !confirm('¿Estás seguro de limpiar el formulario? Se perderán todos los datos ingresados.')) {
        return;
    }
    
    document.getElementById('nombreCliente').value = '';
    document.getElementById('emailCliente').value = '';
    document.getElementById('telefonoCliente').value = '';
    document.getElementById('fechaEvento').value = '';
    document.getElementById('cantidadPersonas').value = '';
    document.getElementById('formatoEvento').value = 'sentado';
    
    const estadosOrdenados = estadosCotizacion.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
    if (estadosOrdenados.length > 0 && document.getElementById('estadoCotizacion')) {
        document.getElementById('estadoCotizacion').value = estadosOrdenados[0].id;
    }

    camposPersonalizados.forEach(campo => {
        const elemento = document.getElementById(`campo_${campo.id}`);
        if (elemento) {
            if (campo.tipo === 'checkbox') {
                elemento.checked = false;
            } else {
                elemento.value = '';
            }
        }
    });

    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        cb.closest('.checkbox-item')?.classList.remove('selected');
    });

    document.querySelectorAll('input[id^="producto_"]').forEach(checkbox => {
        checkbox.checked = false;
        const productoId = checkbox.value;
        const cantidadInput = document.getElementById(`cantidad_${productoId}`);
        const subtotalDiv = document.getElementById(`subtotal_${productoId}`);
        
        if (cantidadInput) {
            cantidadInput.disabled = true;
            cantidadInput.value = 1;
            cantidadInput.max = '';
        }
        if (subtotalDiv) {
            subtotalDiv.textContent = ocultarPrecios ? 'Oculto' : '$0.00';
        }
    });

    const resumenValidacion = document.getElementById('resumenValidacion');
    if (resumenValidacion) {
        resumenValidacion.remove();
    }

    document.getElementById('resumenCotizacion').style.display = 'none';
    
    if (editandoCotizacion) {
        salirModoEdicion();
    }
    
    vistaPresentacion = false;
    ocultarPrecios = false;
    
    if (!sinConfirmacion) {
        mostrarAlerta('alertCotizacion', 'Formulario limpiado.', 'success');
    }
}

// Función para editar cotización - CORREGIDA
function editarCotizacion(index) {
    cargarDatosDesdeAPI('cotizaciones').then(cotizaciones => {
        const cot = cotizaciones[index];
        
        if (!cot) return;

        showTab('cotizador');
        
        limpiarCotizacion(true);
        
        setTimeout(() => {
            document.getElementById('nombreCliente').value = cot.cliente.nombre;
            
            // Cargar email y teléfono si existen
            if (cot.cliente.email) {
                document.getElementById('emailCliente').value = cot.cliente.email;
            }
            if (cot.cliente.telefono) {
                document.getElementById('telefonoCliente').value = cot.cliente.telefono;
            }
            
            document.getElementById('cantidadPersonas').value = cot.cliente.cantidadPersonas;
            document.getElementById('formatoEvento').value = cot.cliente.formatoEvento;
            
            // Cargar estado - CORREGIDO
            if (cot.estado && document.getElementById('estadoCotizacion')) {
                // Verificar que el estado existe en la lista
                const estadoExiste = estadosCotizacion.some(estado => estado.id === cot.estado);
                if (estadoExiste) {
                    document.getElementById('estadoCotizacion').value = cot.estado;
                } else {
                    // Si el estado no existe, usar el primero por defecto
                    const estadosOrdenados = estadosCotizacion.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
                    if (estadosOrdenados.length > 0) {
                        document.getElementById('estadoCotizacion').value = estadosOrdenados[0].id;
                    }
                }
            }
            
            if (cot.cliente.fechaEventoOriginal) {
                document.getElementById('fechaEvento').value = cot.cliente.fechaEventoOriginal;
            } else {
                try {
                    const fechaParts = cot.cliente.fechaEvento.split('/');
                    const horaParts = cot.cliente.horaEvento.split(':');
                    
                    if (fechaParts.length === 3 && horaParts.length >= 2) {
                        const dia = fechaParts[0].padStart(2, '0');
                        const mes = fechaParts[1].padStart(2, '0');
                        const año = fechaParts[2];
                        const hora = horaParts[0].padStart(2, '0');
                        const minuto = horaParts[1].padStart(2, '0');
                        
                        const fechaISO = `${año}-${mes}-${dia}T${hora}:${minuto}`;
                        document.getElementById('fechaEvento').value = fechaISO;
                    }
                } catch (error) {
                    console.warn('Error al convertir fecha:', error);
                }
            }

            if (cot.camposPersonalizados) {
                cargarValoresCamposPersonalizados(cot.camposPersonalizados);
            }

            document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
                cb.closest('.checkbox-item')?.classList.remove('selected');
            });

            if (cot.motivos && cot.motivos.length > 0) {
                cot.motivos.forEach(motivo => {
                    const checkbox = document.querySelector(`input[name="motivo"][value="${motivo}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        checkbox.closest('.checkbox-item')?.classList.add('selected');
                    }
                });
            }

            if (cot.experiencias && cot.experiencias.length > 0) {
                cot.experiencias.forEach(experiencia => {
                    const checkbox = document.querySelector(`input[name="experiencia"][value="${experiencia}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        checkbox.closest('.checkbox-item')?.classList.add('selected');
                    }
                });
            }

            setTimeout(() => {
                if (cot.productos && cot.productos.length > 0) {
                    cot.productos.forEach(prod => {
                        const checkbox = document.getElementById(`producto_${prod.id}`);
                        const cantidadInput = document.getElementById(`cantidad_${prod.id}`);
                        
                        if (checkbox && cantidadInput) {
                            checkbox.checked = true;
                            cantidadInput.disabled = false;
                            cantidadInput.value = prod.cantidad;
                            calcularTotalProducto(prod.id);
                        } else {
                            console.warn(`Producto con ID ${prod.id} no encontrado - posiblemente fue eliminado`);
                        }
                    });
                }

                validarTotalesProductos();
                actualizarResumenTiempoReal();
            }, 200);
        }, 200);

        entrarModoEdicion(cot);
        
        mostrarAlerta('alertCotizacion', 'Cotización cargada para edición. Al guardar se creará una nueva versión.', 'success');
    });
}

// Función para agregar eventos de actualización - CORREGIDA
function agregarEventosActualizacion() {
    const campos = ['nombreCliente', 'emailCliente', 'telefonoCliente', 'fechaEvento', 'cantidadPersonas', 'formatoEvento', 'estadoCotizacion'];
    campos.forEach(campoId => {
        const elemento = document.getElementById(campoId);
        if (elemento) {
            elemento.addEventListener('input', actualizarResumenTiempoReal);
            elemento.addEventListener('change', actualizarResumenTiempoReal);
        }
    });
    
    document.getElementById('tipoCampo').addEventListener('change', toggleOpcionesDesplegable);
}

// Función para procesar plantilla - CORREGIDA
function procesarPlantilla(plantilla, cotizacion) {
    const politicas = localStorage.getItem('politicas') || '';
    
    const motivosTexto = cotizacion.motivos && cotizacion.motivos.length > 0 
        ? 'Motivo del Evento:\n' + cotizacion.motivos.map(id => {
            const motivo = motivosEvento.find(m => m.id === id);
            return motivo ? `- ${motivo.icono} ${motivo.nombre}` : `- ${id}`;
        }).join('\n')
        : '';
    
    const experienciasTexto = cotizacion.experiencias && cotizacion.experiencias.length > 0 
        ? 'Experiencias Seleccionadas:\n' + cotizacion.experiencias.map(id => {
            const experiencia = experiencias.find(e => e.id === id);
            return experiencia ? `- ${experiencia.icono} ${experiencia.nombre}` : `- ${id}`;
        }).join('\n')
        : '';
    
    const productosTexto = cotizacion.productos && cotizacion.productos.length > 0
        ? cotizacion.productos.map(p => 
            `${p.nombre}\n  Precio unitario: $${p.precio.toFixed(2)}\n  Cantidad: ${p.cantidad}\n  Subtotal: $${p.subtotal.toFixed(2)}`
        ).join('\n\n')
        : 'No hay productos seleccionados';
    
    const estadoCotizacion = estadosCotizacion.find(est => est.id === cotizacion.estado) || { nombre: 'Sin estado', icono: '❓' };
    const estadoTexto = `${estadoCotizacion.icono} ${estadoCotizacion.nombre}`;
    
    let contenido = plantilla;
    
    // Reemplazar variables básicas
    contenido = contenido.replace(/\[cliente\]/g, cotizacion.cliente?.nombre || '');
    contenido = contenido.replace(/\[email\]/g, cotizacion.cliente?.email || '');
    contenido = contenido.replace(/\[telefono\]/g, cotizacion.cliente?.telefono || '');
    contenido = contenido.replace(/\[fecha_evento\]/g, cotizacion.cliente?.fechaEvento || '');
    contenido = contenido.replace(/\[hora_evento\]/g, cotizacion.cliente?.horaEvento || '');
    contenido = contenido.replace(/\[personas\]/g, cotizacion.cliente?.cantidadPersonas || '');
    contenido = contenido.replace(/\[formato\]/g, cotizacion.cliente?.formatoEvento || '');
    contenido = contenido.replace(/\[estado\]/g, estadoTexto);
    contenido = contenido.replace(/\[motivos\]/g, motivosTexto);
    contenido = contenido.replace(/\[experiencias\]/g, experienciasTexto);
    contenido = contenido.replace(/\[productos\]/g, productosTexto);
    contenido = contenido.replace(/\[total\]/g, cotizacion.totales?.subtotal?.toFixed(2) || '0.00');
    contenido = contenido.replace(/\[costo_total\]/g, cotizacion.totales?.costoTotal?.toFixed(2) || '0.00');
    contenido = contenido.replace(/\[margen\]/g, cotizacion.totales?.margenTotal?.toFixed(2) || '0.00');
    contenido = contenido.replace(/\[porcentaje_margen\]/g, cotizacion.totales?.porcentajeMargen || '0');
    contenido = contenido.replace(/\[fecha_cotizacion\]/g, cotizacion.fechaCotizacion || '');
    contenido = contenido.replace(/\[politicas\]/g, politicas);
    
    // Reemplazar variables de campos personalizados
    if (cotizacion.camposPersonalizados) {
        camposPersonalizados.forEach(campo => {
            const valor = cotizacion.camposPersonalizados[campo.id] || '';
            const regex = new RegExp(`\\[${campo.id}\\]`, 'g');
            contenido = contenido.replace(regex, valor);
        });
    }
    
    return contenido;
}

// Función para mostrar resumen de cotización - CORREGIDA
function mostrarResumenCotizacion() {
    const container = document.getElementById('resumenCotizacion');
    const cot = cotizacionActual;

    const motivosTexto = cot.motivos.map(id => {
        const motivo = motivosEvento.find(m => m.id === id);
        return motivo ? `${motivo.icono} ${motivo.nombre}` : id;
    });

    const experienciasTexto = cot.experiencias.map(id => {
        const experiencia = experiencias.find(e => e.id === id);
        return experiencia ? `${experiencia.icono} ${experiencia.nombre}` : id;
    });

    const estadoCotizacion = estadosCotizacion.find(est => est.id === cot.estado) || estadosCotizacion[0];

    let camposPersonalizadosHtml = '';
    if (camposPersonalizados.length > 0 && cot.camposPersonalizados && Object.keys(cot.camposPersonalizados).some(key => cot.camposPersonalizados[key])) {
        camposPersonalizadosHtml = `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #2c3e50; margin-bottom: 10px;">📋 Información Adicional:</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                    ${camposPersonalizados.map(campo => {
                        const valor = cot.camposPersonalizados[campo.id];
                        if (valor) {
                            return `
                                <div style="background: white; padding: 10px; border-radius: 8px; border-left: 3px solid #17a2b8;">
                                    <div style="font-size: 0.9rem; color: #6c757d;">${campo.nombre}</div>
                                    <div style="font-weight: 600; color: #2c3e50;">${valor}</div>
                                </div>
                            `;
                        }
                        return '';
                    }).join('')}
                </div>
            </div>
        `;
    }

    const politicas = localStorage.getItem('politicas') || '';

    let html = `
        <div class="cotizacion-resumen">
            <h3 style="color: #667eea; margin-bottom: 20px; text-align: center;">📊 Resumen de Cotización</h3>
            
            <div class="cotizacion-header">
                <div class="info-box">
                    <div class="info-label">Cliente</div>
                    <div class="info-value">${cot.cliente.nombre}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Email</div>
                    <div class="info-value">${cot.cliente.email}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Teléfono</div>
                    <div class="info-value">${cot.cliente.telefono}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Estado</div>
                    <div class="info-value" style="color: ${estadoCotizacion.color}; display: flex; align-items: center; gap: 5px;">
                        <span>${estadoCotizacion.icono}</span>
                        <span>${estadoCotizacion.nombre}</span>
                    </div>
                </div>
                <div class="info-box">
                    <div class="info-label">Fecha del Evento</div>
                    <div class="info-value">${cot.cliente.fechaEvento}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Hora</div>
                    <div class="info-value">${cot.cliente.horaEvento}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Personas</div>
                    <div class="info-value">${cot.cliente.cantidadPersonas} (${cot.cliente.formatoEvento})</div>
                </div>
            </div>

            ${camposPersonalizadosHtml}

            ${cot.motivos.length > 0 ? `
                <div style="margin-bottom: 20px;">
                    <h4 style="color: #2c3e50; margin-bottom: 10px;">Motivo del Evento:</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${motivosTexto.map(m => `<span style="background: #667eea; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.9rem;">${m}</span>`).join('')}
                    </div>
                </div>
            ` : ''}

            ${cot.experiencias.length > 0 ? `
                <div style="margin-bottom: 20px;">
                    <h4 style="color: #2c3e50; margin-bottom: 10px;">Experiencias Seleccionadas:</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${experienciasTexto.map(e => `<span style="background: #28a745; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.9rem;">${e}</span>`).join('')}
                    </div>
                </div>
            ` : ''}

            <h4 style="color: #2c3e50; margin-bottom: 15px;">Detalle del Menú:</h4>
            <div style="overflow-x: auto;">
                ${(() => {
                    const categoriasResumen = categorias.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
                    
                    let tablaHtml = '';
                    
                    categoriasResumen.forEach(categoria => {
                        const productosCategoria = cot.productos.filter(p => p.categoria === categoria.id);
                        
                        if (productosCategoria.length > 0) {
                            const subtotalCategoria = productosCategoria.reduce((sum, p) => sum + p.subtotal, 0);
                            
                            tablaHtml += `
                                <div style="margin-bottom: 25px;">
                                    <h5 style="color: #667eea; margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
                                        ${categoria.icono} ${categoria.nombre} ${ocultarPrecios ? '' : `- Subtotal: $${subtotalCategoria.toFixed(2)}`}
                                    </h5>
                                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden;">
                                        <thead>
                                            <tr style="background: #f8f9fa;">
                                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Producto</th>
                                                ${ocultarPrecios ? '' : '<th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Precio Unit.</th>'}
                                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Cantidad</th>
                                                ${ocultarPrecios ? '' : '<th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Subtotal</th>'}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${productosCategoria.map(p => `
                                                <tr>
                                                    <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">
                                                        <strong>${p.nombre}</strong>
                                                        ${p.descripcion ? `<br><small style="color: #6c757d;">${p.descripcion}</small>` : ''}
                                                    </td>
                                                    ${ocultarPrecios ? '' : `<td style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">$${p.precio.toFixed(2)}</td>`}
                                                    <td style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">${p.cantidad}</td>
                                                    ${ocultarPrecios ? '' : `<td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6; font-weight: 600;">$${p.subtotal.toFixed(2)}</td>`}
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            `;
                        }
                    });
                    
                    return tablaHtml;
                })()}
            </div>

            ${!ocultarPrecios ? `
                <div class="total-section">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px;">
                        <div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Costo Total</div>
                            <div style="font-size: 1.5rem; font-weight: 600;">$${cot.totales.costoTotal.toFixed(2)}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Margen</div>
                            <div style="font-size: 1.5rem; font-weight: 600;">$${cot.totales.margenTotal.toFixed(2)} (${cot.totales.porcentajeMargen}%)</div>
                        </div>
                    </div>
                    <div class="total-amount">$${cot.totales.subtotal.toFixed(2)}</div>
                    <div style="font-size: 1.1rem;">Total de la Cotización</div>
                </div>
            ` : ''}

            ${politicas ? `
                <div class="politicas-section">
                    <h4 style="color: #2c3e50; margin-bottom: 15px;">📋 Políticas de la Empresa</h4>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545;">
                        ${politicas}
                    </div>
                </div>
            ` : ''}

            <div class="no-print" style="text-align: center; margin-top: 20px; display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
                <button class="btn" onclick="descargarCotizacion()">📄 Descargar TXT</button>
                <button class="btn" onclick="guardarCotizacion()">💾 Guardar Cotización</button>
                <button class="btn" onclick="toggleVistaPresentacion()" style="background: #17a2b8; color: white;">📋 Vista Presentación</button>
                <button class="btn" onclick="toggleOcultarPrecios()" style="background: #6c757d; color: white;">🙈 Ocultar Precios</button>
                <button class="btn" onclick="imprimirResumen()" style="background: #28a745; color: white;">🖨️ Imprimir</button>
            </div>
        </div>
    `;

    container.innerHTML = html;
    container.style.display = 'block';
}

// GESTIÓN DE CAMPOS PERSONALIZADOS DEL CLIENTE
async function cargarCamposPersonalizados() {
    camposPersonalizados = await cargarDatosDesdeAPI('camposPersonalizados');
}

async function guardarCamposPersonalizados() {
    await guardarDatosEnAPI('camposPersonalizados', camposPersonalizados);
}

function agregarCampoPersonalizado() {
    if (campoEnEdicion) {
        actualizarCampoPersonalizado();
        return;
    }

    const nombre = document.getElementById('nombreCampo').value.trim();
    const tipo = document.getElementById('tipoCampo').value;
    const placeholder = document.getElementById('placeholderCampo').value.trim();
    const requerido = document.getElementById('requeridoCampo').value === 'true';
    const opciones = document.getElementById('opcionesDesplegable').value.trim();

    if (!nombre) {
        mostrarAlerta('alertCamposPersonalizados', 'Por favor ingresa el nombre del campo.', 'error');
        return;
    }

    if (camposPersonalizados.some(campo => campo.nombre.toLowerCase() === nombre.toLowerCase())) {
        mostrarAlerta('alertCamposPersonalizados', 'Ya existe un campo con ese nombre.', 'error');
        return;
    }

    if (tipo === 'desplegable' && !opciones) {
        mostrarAlerta('alertCamposPersonalizados', 'Para campos desplegables debes agregar al menos una opción.', 'error');
        return;
    }

    const siguienteOrden = Math.max(...camposPersonalizados.map(c => c.orden || 0)) + 1;
    
    const campo = {
        id: nombre.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
        nombre,
        tipo,
        placeholder,
        requerido,
        opciones: tipo === 'desplegable' ? opciones.split('\n').filter(o => o.trim()) : [],
        orden: siguienteOrden
    };

    camposPersonalizados.push(campo);
    guardarCamposPersonalizados();
    actualizarListaCamposPersonalizados();
    generarCamposPersonalizadosEnCotizador();
    actualizarVariablesCamposPersonalizados();
    limpiarFormularioCampo();
    mostrarAlerta('alertCamposPersonalizados', 'Campo personalizado agregado exitosamente.', 'success');
}

function actualizarCampoPersonalizado() {
    const nombre = document.getElementById('nombreCampo').value.trim();
    const tipo = document.getElementById('tipoCampo').value;
    const placeholder = document.getElementById('placeholderCampo').value.trim();
    const requerido = document.getElementById('requeridoCampo').value === 'true';
    const opciones = document.getElementById('opcionesDesplegable').value.trim();

    if (!nombre) {
        mostrarAlerta('alertCamposPersonalizados', 'Por favor ingresa el nombre del campo.', 'error');
        return;
    }

    if (camposPersonalizados.some(campo => campo.id !== campoEnEdicion.id && campo.nombre.toLowerCase() === nombre.toLowerCase())) {
        mostrarAlerta('alertCamposPersonalizados', 'Ya existe un campo con ese nombre.', 'error');
        return;
    }

    if (tipo === 'desplegable' && !opciones) {
        mostrarAlerta('alertCamposPersonalizados', 'Para campos desplegables debes agregar al menos una opción.', 'error');
        return;
    }

    const index = camposPersonalizados.findIndex(campo => campo.id === campoEnEdicion.id);
    if (index !== -1) {
        camposPersonalizados[index] = {
            ...campoEnEdicion,
            nombre,
            tipo,
            placeholder,
            requerido,
            opciones: tipo === 'desplegable' ? opciones.split('\n').filter(o => o.trim()) : []
        };
        
        guardarCamposPersonalizados();
        actualizarListaCamposPersonalizados();
        generarCamposPersonalizadosEnCotizador();
        actualizarVariablesCamposPersonalizados();
        limpiarFormularioCampo();
        campoEnEdicion = null;
        actualizarBotonCampo();
        mostrarAlerta('alertCamposPersonalizados', 'Campo personalizado actualizado exitosamente.', 'success');
    }
}

function editarCampoPersonalizado(id) {
    const campo = camposPersonalizados.find(c => c.id === id);
    if (campo) {
        campoEnEdicion = { ...campo };
        
        document.getElementById('nombreCampo').value = campo.nombre;
        document.getElementById('tipoCampo').value = campo.tipo;
        document.getElementById('placeholderCampo').value = campo.placeholder;
        document.getElementById('requeridoCampo').value = campo.requerido.toString();
        
        toggleOpcionesDesplegable();
        
        if (campo.tipo === 'desplegable') {
            document.getElementById('opcionesDesplegable').value = campo.opciones.join('\n');
        }
        
        actualizarBotonCampo();
        document.getElementById('nombreCampo').focus();
        mostrarAlerta('alertCamposPersonalizados', 'Campo cargado para edición.', 'success');
    }
}

function eliminarCampoPersonalizado(id) {
    if (confirm('¿Estás seguro de eliminar este campo personalizado?')) {
        camposPersonalizados = camposPersonalizados.filter(campo => campo.id !== id);
        guardarCamposPersonalizados();
        actualizarListaCamposPersonalizados();
        generarCamposPersonalizadosEnCotizador();
        actualizarVariablesCamposPersonalizados();
        mostrarAlerta('alertCamposPersonalizados', 'Campo personalizado eliminado exitosamente.', 'success');
    }
}

function limpiarFormularioCampo() {
    document.getElementById('nombreCampo').value = '';
    document.getElementById('tipoCampo').value = 'texto';
    document.getElementById('placeholderCampo').value = '';
    document.getElementById('requeridoCampo').value = 'false';
    document.getElementById('opcionesDesplegable').value = '';
    toggleOpcionesDesplegable();
    campoEnEdicion = null;
    actualizarBotonCampo();
}

function cancelarEdicionCampo() {
    limpiarFormularioCampo();
    mostrarAlerta('alertCamposPersonalizados', 'Edición de campo cancelada.', 'success');
}

function actualizarBotonCampo() {
    const boton = document.querySelector('button[onclick="agregarCampoPersonalizado()"]');
    if (boton) {
        if (campoEnEdicion) {
            boton.innerHTML = '✏️ Actualizar';
            boton.style.background = '#f39c12';
            
            if (!document.getElementById('cancelarEdicionCampoBtn')) {
                const cancelarBtn = document.createElement('button');
                cancelarBtn.id = 'cancelarEdicionCampoBtn';
                cancelarBtn.className = 'btn';
                cancelarBtn.innerHTML = '❌ Cancelar';
                cancelarBtn.onclick = cancelarEdicionCampo;
                cancelarBtn.style.background = '#95a5a6';
                boton.parentNode.insertBefore(cancelarBtn, boton.nextSibling);
            }
        } else {
            boton.innerHTML = '➕ Agregar Campo';
            boton.style.background = '#17a2b8';
            
            const cancelarBtn = document.getElementById('cancelarEdicionCampoBtn');
            if (cancelarBtn) {
                cancelarBtn.remove();
            }
        }
    }
}

function toggleOpcionesDesplegable() {
    const tipo = document.getElementById('tipoCampo').value;
    const container = document.getElementById('opcionesDesplegableContainer');
    
    if (tipo === 'desplegable') {
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

function actualizarListaCamposPersonalizados() {
    const container = document.getElementById('listaCamposPersonalizados');
    
    if (camposPersonalizados.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">No hay campos personalizados configurados.</p>';
        return;
    }

    const camposOrdenados = camposPersonalizados.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));

    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">';
    
    camposOrdenados.forEach(campo => {
        const tipoIcono = {
            'texto': '📝',
            'numero': '🔢',
            'fecha': '📅',
            'hora': '🕐',
            'checkbox': '☑️',
            'desplegable': '📋'
        };
        
        let detallesCampo = '';
        if (campo.tipo === 'desplegable' && campo.opciones && campo.opciones.length > 0) {
            detallesCampo = `<br><small style="color: #6c757d;">Opciones: ${campo.opciones.join(', ')}</small>`;
        }
        
        html += `
            <div style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #dee2e6; border-left: 4px solid #17a2b8;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.2rem;">${tipoIcono[campo.tipo] || '📝'}</span>
                        <strong style="color: #17a2b8;">${campo.nombre}</strong>
                        ${campo.requerido ? '<span style="color: #dc3545; font-size: 0.8rem;">*</span>' : ''}
                    </div>
                </div>
                <p style="color: #6c757d; margin-bottom: 15px; font-size: 0.9rem;">
                    <strong>Tipo:</strong> ${campo.tipo}
                    ${campo.placeholder ? `<br><strong>Placeholder:</strong> ${campo.placeholder}` : ''}
                    ${detallesCampo}
                    <br><strong>Variable:</strong> <code>[${campo.id}]</code>
                </p>
                <div style="display: flex; gap: 8px;">
                    <button class="btn" onclick="editarCampoPersonalizado('${campo.id}')" style="font-size: 0.8rem; padding: 6px 10px; background: #f39c12; color: white; flex: 1;">✏️ Editar</button>
                    <button class="btn btn-danger" onclick="eliminarCampoPersonalizado('${campo.id}')" style="font-size: 0.8rem; padding: 6px 10px; flex: 1;">🗑️</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function generarCamposPersonalizadosEnCotizador() {
    const container = document.getElementById('camposPersonalizados');
    
    if (camposPersonalizados.length === 0) {
        container.innerHTML = '';
        return;
    }

    const camposOrdenados = camposPersonalizados.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    let html = '<div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;"><h5 style="color: #1976d2; margin-bottom: 15px;">📋 Campos Adicionales</h5>';
    
    for (let i = 0; i < camposOrdenados.length; i += 2) {
        html += '<div class="form-row">';
        
        for (let j = i; j < Math.min(i + 2, camposOrdenados.length); j++) {
            const campo = camposOrdenados[j];
            html += '<div class="form-group">';
            html += `<label for="campo_${campo.id}">${campo.nombre}${campo.requerido ? ' *' : ''}:</label>`;
            
            switch (campo.tipo) {
                case 'texto':
                    html += `<input type="text" id="campo_${campo.id}" placeholder="${campo.placeholder}" ${campo.requerido ? 'required' : ''} oninput="actualizarResumenTiempoReal()">`;
                    break;
                case 'numero':
                    html += `<input type="number" id="campo_${campo.id}" placeholder="${campo.placeholder}" ${campo.requerido ? 'required' : ''} oninput="actualizarResumenTiempoReal()">`;
                    break;
                case 'fecha':
                    html += `<input type="date" id="campo_${campo.id}" ${campo.requerido ? 'required' : ''} onchange="actualizarResumenTiempoReal()">`;
                    break;
                case 'hora':
                    html += `<input type="time" id="campo_${campo.id}" ${campo.requerido ? 'required' : ''} onchange="actualizarResumenTiempoReal()">`;
                    break;
                case 'checkbox':
                    html += `<div style="display: flex; align-items: center; gap: 10px; margin-top: 8px;"><input type="checkbox" id="campo_${campo.id}" onchange="actualizarResumenTiempoReal()"><label for="campo_${campo.id}">${campo.placeholder || 'Activar'}</label></div>`;
                    break;
                case 'desplegable':
                    html += `<select id="campo_${campo.id}" ${campo.requerido ? 'required' : ''} onchange="actualizarResumenTiempoReal()">`;
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

function actualizarVariablesCamposPersonalizados() {
    const container = document.getElementById('variablesCamposPersonalizados');
    
    if (camposPersonalizados.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<strong>Variables de campos personalizados:</strong><br>';
    camposPersonalizados.forEach(campo => {
        html += `<code>[${campo.id}]</code> - ${campo.nombre}<br>`;
    });
    
    container.innerHTML = html;
}

function obtenerValoresCamposPersonalizados() {
    const valores = {};
    
    camposPersonalizados.forEach(campo => {
        const elemento = document.getElementById(`campo_${campo.id}`);
        if (elemento) {
            if (campo.tipo === 'checkbox') {
                valores[campo.id] = elemento.checked ? 'Sí' : 'No';
            } else {
                valores[campo.id] = elemento.value || '';
            }
        }
    });
    
    return valores;
}

function cargarValoresCamposPersonalizados(valores) {
    camposPersonalizados.forEach(campo => {
        const elemento = document.getElementById(`campo_${campo.id}`);
        if (elemento && valores && valores[campo.id] !== undefined) {
            if (campo.tipo === 'checkbox') {
                elemento.checked = valores[campo.id] === 'Sí' || valores[campo.id] === true;
            } else {
                elemento.value = valores[campo.id];
            }
        }
    });
}

// GESTIÓN DE EXPERIENCIAS
async function cargarExperiencias() {
    const experienciasGuardadas = await cargarDatosDesdeAPI('experiencias');
    if (experienciasGuardadas.length > 0) {
        experiencias = experienciasGuardadas;
    }
}

async function guardarExperiencias() {
    await guardarDatosEnAPI('experiencias', experiencias);
}

function agregarExperiencia() {
    if (experienciaEnEdicion) {
        actualizarExperiencia();
        return;
    }

    const nombre = document.getElementById('nuevaExperiencia').value.trim();
    const icono = document.getElementById('iconoExperiencia').value.trim() || '🌟';
    const descripcion = document.getElementById('descripcionExperiencia').value.trim();

    if (!nombre) {
        mostrarAlerta('alertExperiencias', 'Por favor ingresa el nombre de la experiencia.', 'error');
        return;
    }

    if (experiencias.some(exp => exp.nombre.toLowerCase() === nombre.toLowerCase())) {
        mostrarAlerta('alertExperiencias', 'Ya existe una experiencia con ese nombre.', 'error');
        return;
    }

    const siguienteOrden = Math.max(...experiencias.map(e => e.orden || 0)) + 1;
    
    const experiencia = {
        id: nombre.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
        nombre,
        icono,
        descripcion,
        orden: siguienteOrden
    };

    experiencias.push(experiencia);
    guardarExperiencias();
    actualizarListaExperiencias();
    actualizarExperienciasCheckboxes();
    limpiarFormularioExperiencia();
    mostrarAlerta('alertExperiencias', 'Experiencia agregada exitosamente.', 'success');
}

function actualizarExperiencia() {
    const nombre = document.getElementById('nuevaExperiencia').value.trim();
    const icono = document.getElementById('iconoExperiencia').value.trim() || '🌟';
    const descripcion = document.getElementById('descripcionExperiencia').value.trim();

    if (!nombre) {
        mostrarAlerta('alertExperiencias', 'Por favor ingresa el nombre de la experiencia.', 'error');
        return;
    }

    if (experiencias.some(exp => exp.id !== experienciaEnEdicion.id && exp.nombre.toLowerCase() === nombre.toLowerCase())) {
        mostrarAlerta('alertExperiencias', 'Ya existe una experiencia con ese nombre.', 'error');
        return;
    }

    const index = experiencias.findIndex(exp => exp.id === experienciaEnEdicion.id);
    if (index !== -1) {
        experiencias[index] = {
            ...experienciaEnEdicion,
            nombre,
            icono,
            descripcion
        };
        
        guardarExperiencias();
        actualizarListaExperiencias();
        actualizarExperienciasCheckboxes();
        limpiarFormularioExperiencia();
        experienciaEnEdicion = null;
        actualizarBotonExperiencia();
        mostrarAlerta('alertExperiencias', 'Experiencia actualizada exitosamente.', 'success');
    }
}

function editarExperiencia(id) {
    const experiencia = experiencias.find(exp => exp.id === id);
    if (experiencia) {
        experienciaEnEdicion = { ...experiencia };
        
        document.getElementById('nuevaExperiencia').value = experiencia.nombre;
        document.getElementById('iconoExperiencia').value = experiencia.icono;
        document.getElementById('descripcionExperiencia').value = experiencia.descripcion;
        
        actualizarBotonExperiencia();
        document.getElementById('nuevaExperiencia').focus();
        mostrarAlerta('alertExperiencias', 'Experiencia cargada para edición.', 'success');
    }
}

function eliminarExperiencia(id) {
    if (confirm('¿Estás seguro de eliminar esta experiencia?')) {
        experiencias = experiencias.filter(exp => exp.id !== id);
        guardarExperiencias();
        actualizarListaExperiencias();
        actualizarExperienciasCheckboxes();
        mostrarAlerta('alertExperiencias', 'Experiencia eliminada exitosamente.', 'success');
    }
}

function limpiarFormularioExperiencia() {
    document.getElementById('nuevaExperiencia').value = '';
    document.getElementById('iconoExperiencia').value = '';
    document.getElementById('descripcionExperiencia').value = '';
    experienciaEnEdicion = null;
    actualizarBotonExperiencia();
}

function cancelarEdicionExperiencia() {
    limpiarFormularioExperiencia();
    mostrarAlerta('alertExperiencias', 'Edición de experiencia cancelada.', 'success');
}

function actualizarBotonExperiencia() {
    const boton = document.querySelector('button[onclick="agregarExperiencia()"]');
    if (boton) {
        if (experienciaEnEdicion) {
            boton.innerHTML = '✏️ Actualizar';
            boton.style.background = '#f39c12';
            
            if (!document.getElementById('cancelarEdicionExperienciaBtn')) {
                const cancelarBtn = document.createElement('button');
                cancelarBtn.id = 'cancelarEdicionExperienciaBtn';
                cancelarBtn.className = 'btn';
                cancelarBtn.innerHTML = '❌ Cancelar';
                cancelarBtn.onclick = cancelarEdicionExperiencia;
                cancelarBtn.style.background = '#95a5a6';
                boton.parentNode.insertBefore(cancelarBtn, boton.nextSibling);
            }
        } else {
            boton.innerHTML = '➕ Agregar';
            boton.style.background = '#28a745';
            
            const cancelarBtn = document.getElementById('cancelarEdicionExperienciaBtn');
            if (cancelarBtn) {
                cancelarBtn.remove();
            }
        }
    }
}

function actualizarListaExperiencias() {
    const container = document.getElementById('listaExperiencias');
    
    if (experiencias.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">No hay experiencias personalizadas.</p>';
        return;
    }

    const experienciasOrdenadas = experiencias.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));

    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">';
    
    experienciasOrdenadas.forEach(experiencia => {
        html += `
            <div style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #dee2e6; border-left: 4px solid #28a745;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.2rem;">${experiencia.icono}</span>
                        <strong style="color: #28a745;">${experiencia.nombre}</strong>
                    </div>
                </div>
                <p style="color: #6c757d; margin-bottom: 15px; font-size: 0.9rem;">${experiencia.descripcion || 'Sin descripción'}</p>
                <div style="display: flex; gap: 8px;">
                    <button class="btn" onclick="editarExperiencia('${experiencia.id}')" style="font-size: 0.8rem; padding: 6px 10px; background: #f39c12; color: white; flex: 1;">✏️ Editar</button>
                    <button class="btn btn-danger" onclick="eliminarExperiencia('${experiencia.id}')" style="font-size: 0.8rem; padding: 6px 10px; flex: 1;">🗑️</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function actualizarExperienciasCheckboxes() {
    const container = document.getElementById('experienciasCheckboxGroup');
    if (!container) return;
    
    const experienciasOrdenadas = experiencias.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    let html = '';
    experienciasOrdenadas.forEach(experiencia => {
        html += `
            <div class="checkbox-item" onclick="toggleCheckbox(this)">
                <input type="checkbox" name="experiencia" value="${experiencia.id}">
                <label>${experiencia.icono} ${experiencia.nombre}</label>
                <p style="font-size: 0.9rem; color: #6c757d; margin-top: 5px;">${experiencia.descripcion}</p>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// GESTIÓN DE MOTIVOS DEL EVENTO
async function cargarMotivos() {
    const motivosGuardados = await cargarDatosDesdeAPI('motivosEvento');
    if (motivosGuardados.length > 0) {
        motivosEvento = motivosGuardados;
    }
}

async function guardarMotivos() {
    await guardarDatosEnAPI('motivosEvento', motivosEvento);
}

function agregarMotivo() {
    if (motivoEnEdicion) {
        actualizarMotivo();
        return;
    }

    const nombre = document.getElementById('nuevoMotivo').value.trim();
    const icono = document.getElementById('iconoMotivo').value.trim() || '🎉';
    const descripcion = document.getElementById('descripcionMotivo').value.trim();

    if (!nombre) {
        mostrarAlerta('alertMotivos', 'Por favor ingresa el nombre del motivo.', 'error');
        return;
    }

    if (motivosEvento.some(motivo => motivo.nombre.toLowerCase() === nombre.toLowerCase())) {
        mostrarAlerta('alertMotivos', 'Ya existe un motivo con ese nombre.', 'error');
        return;
    }

    const siguienteOrden = Math.max(...motivosEvento.map(m => m.orden || 0)) + 1;
    
    const motivo = {
        id: nombre.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
        nombre,
        icono,
        descripcion,
        orden: siguienteOrden
    };

    motivosEvento.push(motivo);
    guardarMotivos();
    actualizarListaMotivos();
    actualizarMotivosCheckboxes();
    limpiarFormularioMotivo();
    mostrarAlerta('alertMotivos', 'Motivo agregado exitosamente.', 'success');
}

function actualizarMotivo() {
    const nombre = document.getElementById('nuevoMotivo').value.trim();
    const icono = document.getElementById('iconoMotivo').value.trim() || '🎉';
    const descripcion = document.getElementById('descripcionMotivo').value.trim();

    if (!nombre) {
        mostrarAlerta('alertMotivos', 'Por favor ingresa el nombre del motivo.', 'error');
        return;
    }

    if (motivosEvento.some(motivo => motivo.id !== motivoEnEdicion.id && motivo.nombre.toLowerCase() === nombre.toLowerCase())) {
        mostrarAlerta('alertMotivos', 'Ya existe un motivo con ese nombre.', 'error');
        return;
    }

    const index = motivosEvento.findIndex(motivo => motivo.id === motivoEnEdicion.id);
    if (index !== -1) {
        motivosEvento[index] = {
            ...motivoEnEdicion,
            nombre,
            icono,
            descripcion
        };
        
        guardarMotivos();
        actualizarListaMotivos();
        actualizarMotivosCheckboxes();
        limpiarFormularioMotivo();
        motivoEnEdicion = null;
        actualizarBotonMotivo();
        mostrarAlerta('alertMotivos', 'Motivo actualizado exitosamente.', 'success');
    }
}

function editarMotivo(id) {
    const motivo = motivosEvento.find(m => m.id === id);
    if (motivo) {
        motivoEnEdicion = { ...motivo };
        
        document.getElementById('nuevoMotivo').value = motivo.nombre;
        document.getElementById('iconoMotivo').value = motivo.icono;
        document.getElementById('descripcionMotivo').value = motivo.descripcion;
        
        actualizarBotonMotivo();
        document.getElementById('nuevoMotivo').focus();
        mostrarAlerta('alertMotivos', 'Motivo cargado para edición.', 'success');
    }
}

function eliminarMotivo(id) {
    if (confirm('¿Estás seguro de eliminar este motivo?')) {
        motivosEvento = motivosEvento.filter(motivo => motivo.id !== id);
        guardarMotivos();
        actualizarListaMotivos();
        actualizarMotivosCheckboxes();
        mostrarAlerta('alertMotivos', 'Motivo eliminado exitosamente.', 'success');
    }
}

function limpiarFormularioMotivo() {
    document.getElementById('nuevoMotivo').value = '';
    document.getElementById('iconoMotivo').value = '';
    document.getElementById('descripcionMotivo').value = '';
    motivoEnEdicion = null;
    actualizarBotonMotivo();
}

function cancelarEdicionMotivo() {
    limpiarFormularioMotivo();
    mostrarAlerta('alertMotivos', 'Edición de motivo cancelada.', 'success');
}

function actualizarBotonMotivo() {
    const boton = document.querySelector('button[onclick="agregarMotivo()"]');
    if (boton) {
        if (motivoEnEdicion) {
            boton.innerHTML = '✏️ Actualizar';
            boton.style.background = '#f39c12';
            
            if (!document.getElementById('cancelarEdicionMotivoBtn')) {
                const cancelarBtn = document.createElement('button');
                cancelarBtn.id = 'cancelarEdicionMotivoBtn';
                cancelarBtn.className = 'btn';
                cancelarBtn.innerHTML = '❌ Cancelar';
                cancelarBtn.onclick = cancelarEdicionMotivo;
                cancelarBtn.style.background = '#95a5a6';
                boton.parentNode.insertBefore(cancelarBtn, boton.nextSibling);
            }
        } else {
            boton.innerHTML = '➕ Agregar';
            boton.style.background = '#007bff';
            
            const cancelarBtn = document.getElementById('cancelarEdicionMotivoBtn');
            if (cancelarBtn) {
                cancelarBtn.remove();
            }
        }
    }
}

function actualizarListaMotivos() {
    const container = document.getElementById('listaMotivos');
    
    if (motivosEvento.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">No hay motivos personalizados.</p>';
        return;
    }

    const motivosOrdenados = motivosEvento.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));

    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">';
    
    motivosOrdenados.forEach(motivo => {
        html += `
            <div style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #dee2e6; border-left: 4px solid #007bff;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.2rem;">${motivo.icono}</span>
                        <strong style="color: #007bff;">${motivo.nombre}</strong>
                    </div>
                </div>
                <p style="color: #6c757d; margin-bottom: 15px; font-size: 0.9rem;">${motivo.descripcion || 'Sin descripción'}</p>
                <div style="display: flex; gap: 8px;">
                    <button class="btn" onclick="editarMotivo('${motivo.id}')" style="font-size: 0.8rem; padding: 6px 10px; background: #f39c12; color: white; flex: 1;">✏️ Editar</button>
                    <button class="btn btn-danger" onclick="eliminarMotivo('${motivo.id}')" style="font-size: 0.8rem; padding: 6px 10px; flex: 1;">🗑️</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function actualizarMotivosCheckboxes() {
    const container = document.getElementById('motivosCheckboxGroup');
    if (!container) return;
    
    const motivosOrdenados = motivosEvento.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    let html = '';
    motivosOrdenados.forEach(motivo => {
        html += `
            <div class="checkbox-item" onclick="toggleCheckbox(this)">
                <input type="checkbox" name="motivo" value="${motivo.id}">
                <label>${motivo.icono} ${motivo.nombre}</label>
                <p style="font-size: 0.9rem; color: #6c757d; margin-top: 5px;">${motivo.descripcion}</p>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// GESTIÓN DE POLÍTICAS
async function cargarPoliticas() {
    const politicas = await cargarDatosDesdeAPI('politicas');
    document.getElementById('politicas').value = politicas || '';
}

async function guardarPoliticas() {
    const politicas = document.getElementById('politicas').value.trim();
    await guardarDatosEnAPI('politicas', politicas);
    mostrarAlerta('alertPoliticas', 'Políticas guardadas exitosamente.', 'success');
}

// GESTIÓN DE PLANTILLA DE DESCARGA
async function cargarPlantilla() {
    const plantilla = await cargarDatosDesdeAPI('plantillaDescarga') || obtenerPlantillaDefecto();
    document.getElementById('plantillaDescarga').value = plantilla;
}

async function guardarPlantilla() {
    const plantilla = document.getElementById('plantillaDescarga').value;
    await guardarDatosEnAPI('plantillaDescarga', plantilla);
    mostrarAlerta('alertPlantilla', 'Plantilla guardada exitosamente.', 'success');
}

function restaurarPlantillaDefecto() {
    if (confirm('¿Estás seguro de restaurar la plantilla por defecto? Se perderán todos los cambios personalizados.')) {
        const plantillaDefecto = obtenerPlantillaDefecto();
        document.getElementById('plantillaDescarga').value = plantillaDefecto;
        mostrarAlerta('alertPlantilla', 'Plantilla restaurada al formato por defecto.', 'success');
    }
}

function obtenerPlantillaDefecto() {
    let plantilla = `COTIZACIÓN DE EVENTO GASTRONÓMICO
===============================

Cliente: [cliente]
Email: [email]
Teléfono: [telefono]
Fecha del Evento: [fecha_evento]
Hora: [hora_evento]
Cantidad de Personas: [personas] ([formato])
Estado: [estado]`;

    if (camposPersonalizados.length > 0) {
        plantilla += '\n\nDATOS ADICIONALES:\n';
        camposPersonalizados.forEach(campo => {
            plantilla += `${campo.nombre}: [${campo.id}]\n`;
        });
    }

    plantilla += `

[motivos]

[experiencias]

DETALLE DEL MENÚ:
=================
[productos]

RESUMEN FINANCIERO:
===================
Costo Total: $[costo_total]
Margen: $[margen] ([porcentaje_margen]%)
TOTAL: $[total]

Cotización generada el: [fecha_cotizacion]

POLÍTICAS:
==========
[politicas]`;

    return plantilla;
}

function previsualizarPlantilla() {
    if (!cotizacionActual.id) {
        mostrarAlerta('alertPlantilla', 'No hay una cotización actual para previsualizar. Ve al Cotizador y completa una cotización primero.', 'error');
        return;
    }
    
    const plantilla = document.getElementById('plantillaDescarga').value;
    const contenidoGenerado = procesarPlantilla(plantilla, cotizacionActual);
    
    const modalHtml = `
        <div id="modalPrevia" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; display: flex; align-items: center; justify-content: center;" onclick="cerrarModalPrevia()">
            <div style="background: white; border-radius: 15px; padding: 30px; max-width: 800px; max-height: 90vh; overflow-y: auto; margin: 20px;" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #6f42c1; padding-bottom: 15px;">
                    <h3 style="color: #6f42c1; margin: 0;">👁️ Vista Previa de Plantilla</h3>
                    <button onclick="cerrarModalPrevia()" style="background: #dc3545; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">×</button>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; font-family: 'Courier New', monospace; white-space: pre-wrap; font-size: 0.9rem; max-height: 600px; overflow-y: auto;">
${contenidoGenerado}
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn" onclick="descargarPrevisualizacion()" style="background: #28a745; color: white;">📄 Descargar Esta Vista Previa</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function cerrarModalPrevia() {
    const modal = document.getElementById('modalPrevia');
    if (modal) {
        modal.remove();
    }
}

function descargarPrevisualizacion() {
    const plantilla = document.getElementById('plantillaDescarga').value;
    const contenidoGenerado = procesarPlantilla(plantilla, cotizacionActual);
    
    const blob = new Blob([contenidoGenerado], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preview_cotizacion_${cotizacionActual.cliente.nombre.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    cerrarModalPrevia();
}

// FUNCIONES DE VISTA DE PRESENTACIÓN
function toggleVistaPresentacion() {
    vistaPresentacion = !vistaPresentacion;
    const resumen = document.getElementById('resumenCotizacion');
    
    if (vistaPresentacion) {
        resumen.classList.add('vista-presentacion');
        document.querySelector('button[onclick="toggleVistaPresentacion()"]').innerHTML = '📋 Vista Normal';
    } else {
        resumen.classList.remove('vista-presentacion');
        document.querySelector('button[onclick="toggleVistaPresentacion()"]').innerHTML = '📋 Vista Presentación';
    }
}

function toggleOcultarPrecios() {
    ocultarPrecios = !ocultarPrecios;
    const boton = document.querySelector('button[onclick="toggleOcultarPrecios()"]');
    
    if (ocultarPrecios) {
        boton.innerHTML = '💰 Mostrar Precios';
        boton.style.background = '#28a745';
    } else {
        boton.innerHTML = '🙈 Ocultar Precios';
        boton.style.background = '#6c757d';
    }
    
    actualizarResumenTiempoReal();
}

function imprimirResumen() {
    document.querySelectorAll('.no-print').forEach(el => {
        el.style.display = 'none';
    });
    
    const resumen = document.getElementById('resumenCotizacion');
    if (resumen) {
        resumen.style.display = 'block';
        
        if (!vistaPresentacion) {
            resumen.classList.add('vista-presentacion');
        }
        
        window.print();
        
        setTimeout(() => {
            document.querySelectorAll('.no-print').forEach(el => {
                el.style.display = '';
            });
            
            if (!vistaPresentacion) {
                resumen.classList.remove('vista-presentacion');
            }
        }, 1000);
    }
}

// Gestión de tabs
function showTab(tabName, event) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // Buscar el tab correspondiente y activarlo
        const tabButton = document.querySelector(`button[onclick*="showTab('${tabName}')"]`);
        if (tabButton) {
            tabButton.classList.add('active');
        }
    }
    
    if (tabName === 'cotizador') {
        setTimeout(actualizarResumenTiempoReal, 100);
    }
}

// GESTIÓN DE PRODUCTOS
async function cargarProductos() {
    const productosGuardados = await cargarDatosDesdeAPI('productos');
    productos = productosGuardados;
}

async function guardarProductos() {
    await guardarDatosEnAPI('productos', productos);
}

// GESTIÓN DE CATEGORÍAS
async function cargarCategorias() {
    const categoriasGuardadas = await cargarDatosDesdeAPI('categorias');
    if (categoriasGuardadas.length > 0) {
        categorias = categoriasGuardadas;
    }
}

async function guardarCategorias() {
    await guardarDatosEnAPI('categorias', categorias);
}

// GESTIÓN DE ESTADOS DE COTIZACIÓN
async function cargarEstados() {
    const estadosGuardados = await cargarDatosDesdeAPI('estadosCotizacion');
    if (estadosGuardados.length > 0) {
        estadosCotizacion = estadosGuardados;
    }
}

async function guardarEstados() {
    await guardarDatosEnAPI('estadosCotizacion', estadosCotizacion);
}

function agregarEstado() {
    if (estadoEnEdicion) {
        actualizarEstado();
        return;
    }

    const nombre = document.getElementById('nuevoEstado').value.trim();
    const icono = document.getElementById('iconoEstado').value.trim() || '📋';
    const color = document.getElementById('colorEstado').value;

    if (!nombre) {
        mostrarAlerta('alertEstados', 'Por favor ingresa el nombre del estado.', 'error');
        return;
    }

    if (estadosCotizacion.some(est => est.nombre.toLowerCase() === nombre.toLowerCase())) {
        mostrarAlerta('alertEstados', 'Ya existe un estado con ese nombre.', 'error');
        return;
    }

    const siguienteOrden = Math.max(...estadosCotizacion.map(e => e.orden || 0)) + 1;
    
    const estado = {
        id: nombre.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
        nombre,
        icono,
        color,
        orden: siguienteOrden
    };

    estadosCotizacion.push(estado);
    guardarEstados();
    actualizarListaEstados();
    actualizarSelectEstados();
    limpiarFormularioEstado();
    mostrarAlerta('alertEstados', 'Estado agregado exitosamente.', 'success');
}

function actualizarEstado() {
    const nombre = document.getElementById('nuevoEstado').value.trim();
    const icono = document.getElementById('iconoEstado').value.trim() || '📋';
    const color = document.getElementById('colorEstado').value;

    if (!nombre) {
        mostrarAlerta('alertEstados', 'Por favor ingresa el nombre del estado.', 'error');
        return;
    }

    if (estadosCotizacion.some(est => est.id !== estadoEnEdicion.id && est.nombre.toLowerCase() === nombre.toLowerCase())) {
        mostrarAlerta('alertEstados', 'Ya existe un estado con ese nombre.', 'error');
        return;
    }

    const index = estadosCotizacion.findIndex(est => est.id === estadoEnEdicion.id);
    if (index !== -1) {
        estadosCotizacion[index] = {
            ...estadoEnEdicion,
            nombre,
            icono,
            color
        };
        
        guardarEstados();
        actualizarListaEstados();
        actualizarSelectEstados();
        limpiarFormularioEstado();
        estadoEnEdicion = null;
        actualizarBotonEstado();
        mostrarAlerta('alertEstados', 'Estado actualizado exitosamente.', 'success');
    }
}

function editarEstado(id) {
    const estado = estadosCotizacion.find(est => est.id === id);
    if (estado) {
        estadoEnEdicion = { ...estado };
        
        document.getElementById('nuevoEstado').value = estado.nombre;
        document.getElementById('iconoEstado').value = estado.icono;
        document.getElementById('colorEstado').value = estado.color;
        
        actualizarBotonEstado();
        document.getElementById('nuevoEstado').focus();
        mostrarAlerta('alertEstados', 'Estado cargado para edición.', 'success');
    }
}

function eliminarEstado(id) {
    if (confirm('¿Estás seguro de eliminar este estado?')) {
        estadosCotizacion = estadosCotizacion.filter(est => est.id !== id);
        guardarEstados();
        actualizarListaEstados();
        actualizarSelectEstados();
        mostrarAlerta('alertEstados', 'Estado eliminado exitosamente.', 'success');
    }
}

function limpiarFormularioEstado() {
    document.getElementById('nuevoEstado').value = '';
    document.getElementById('iconoEstado').value = '';
    document.getElementById('colorEstado').value = '#6c757d';
    estadoEnEdicion = null;
    actualizarBotonEstado();
}

function cancelarEdicionEstado() {
    limpiarFormularioEstado();
    mostrarAlerta('alertEstados', 'Edición de estado cancelada.', 'success');
}

function actualizarBotonEstado() {
    const boton = document.querySelector('button[onclick="agregarEstado()"]');
    if (boton) {
        if (estadoEnEdicion) {
            boton.innerHTML = '✏️ Actualizar';
            boton.style.background = '#f39c12';
            
            if (!document.getElementById('cancelarEdicionEstadoBtn')) {
                const cancelarBtn = document.createElement('button');
                cancelarBtn.id = 'cancelarEdicionEstadoBtn';
                cancelarBtn.className = 'btn';
                cancelarBtn.innerHTML = '❌ Cancelar';
                cancelarBtn.onclick = cancelarEdicionEstado;
                cancelarBtn.style.background = '#95a5a6';
                boton.parentNode.insertBefore(cancelarBtn, boton.nextSibling);
            }
        } else {
            boton.innerHTML = '➕ Agregar';
            boton.style.background = '#007bff';
            
            const cancelarBtn = document.getElementById('cancelarEdicionEstadoBtn');
            if (cancelarBtn) {
                cancelarBtn.remove();
            }
        }
    }
}

function actualizarListaEstados() {
    const container = document.getElementById('listaEstados');
    
    if (estadosCotizacion.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">No hay estados personalizados.</p>';
        return;
    }

    const estadosOrdenados = estadosCotizacion.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));

    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">';
    
    estadosOrdenados.forEach(estado => {
        html += `
            <div style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #dee2e6; border-left: 4px solid ${estado.color};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.2rem;">${estado.icono}</span>
                        <strong style="color: ${estado.color};">${estado.nombre}</strong>
                    </div>
                    <div style="width: 20px; height: 20px; background: ${estado.color}; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 1px #ddd;"></div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn" onclick="editarEstado('${estado.id}')" style="font-size: 0.8rem; padding: 6px 10px; background: #f39c12; color: white; flex: 1;">✏️ Editar</button>
                    <button class="btn btn-danger" onclick="eliminarEstado('${estado.id}')" style="font-size: 0.8rem; padding: 6px 10px; flex: 1;">🗑️</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function actualizarSelectEstados() {
    const select = document.getElementById('estadoCotizacion');
    if (!select) return;
    
    const valorActual = select.value;
    
    select.innerHTML = '';
    
    const estadosOrdenados = estadosCotizacion.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
    estadosOrdenados.forEach(estado => {
        const option = document.createElement('option');
        option.value = estado.id;
        option.textContent = `${estado.icono} ${estado.nombre}`;
        option.style.color = estado.color;
        select.appendChild(option);
    });
    
    if (valorActual && estadosCotizacion.some(est => est.id === valorActual)) {
        select.value = valorActual;
    } else if (estadosOrdenados.length > 0) {
        select.value = estadosOrdenados[0].id;
    }
    
    actualizarResumenTiempoReal();
}

function agregarProducto() {
    if (productoEnEdicion) {
        actualizarProducto();
        return;
    }

    const nombre = document.getElementById('nombreProducto').value.trim();
    const categoria = document.getElementById('categoriaProducto').value;
    const costo = parseFloat(document.getElementById('costoProducto').value) || 0;
    const precio = parseFloat(document.getElementById('precioProducto').value) || 0;
    const descripcion = document.getElementById('descripcionProducto').value.trim();

    if (!nombre) {
        mostrarAlerta('alertProductos', 'Por favor ingresa el nombre del producto.', 'error');
        return;
    }

    if (precio < 0) {
        mostrarAlerta('alertProductos', 'El precio no puede ser negativo.', 'error');
        return;
    }

    const producto = {
        id: Date.now(),
        nombre,
        categoria,
        costo,
        precio,
        descripcion
    };

    productos.push(producto);
    guardarProductos();
    actualizarListaProductos();
    actualizarMenuSelector();
    limpiarFormularioProducto();
    mostrarAlerta('alertProductos', 'Producto agregado exitosamente.', 'success');
}

function actualizarProducto() {
    const nombre = document.getElementById('nombreProducto').value.trim();
    const categoria = document.getElementById('categoriaProducto').value;
    const costo = parseFloat(document.getElementById('costoProducto').value) || 0;
    const precio = parseFloat(document.getElementById('precioProducto').value) || 0;
    const descripcion = document.getElementById('descripcionProducto').value.trim();

    if (!nombre) {
        mostrarAlerta('alertProductos', 'Por favor ingresa el nombre del producto.', 'error');
        return;
    }

    if (precio < 0) {
        mostrarAlerta('alertProductos', 'El precio no puede ser negativo.', 'error');
        return;
    }

    const index = productos.findIndex(p => p.id === productoEnEdicion.id);
    if (index !== -1) {
        productos[index] = {
            id: productoEnEdicion.id,
            nombre,
            categoria,
            costo,
            precio,
            descripcion
        };
        
        guardarProductos();
        actualizarListaProductos();
        actualizarMenuSelector();
        limpiarFormularioProducto();
        productoEnEdicion = null;
        actualizarBotonAgregar();
        mostrarAlerta('alertProductos', 'Producto actualizado exitosamente.', 'success');
    }
}

function duplicarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (producto) {
        const nuevoProducto = {
            ...producto,
            id: Date.now(),
            nombre: producto.nombre + ' (Copia)'
        };
        productos.push(nuevoProducto);
        guardarProductos();
        actualizarListaProductos();
        actualizarMenuSelector();
        mostrarAlerta('alertProductos', 'Producto duplicado exitosamente.', 'success');
    }
}

function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (producto) {
        productoEnEdicion = { ...producto };
        
        document.getElementById('nombreProducto').value = producto.nombre;
        document.getElementById('categoriaProducto').value = producto.categoria;
        document.getElementById('costoProducto').value = producto.costo;
        document.getElementById('precioProducto').value = producto.precio;
        document.getElementById('descripcionProducto').value = producto.descripcion;
        
        actualizarBotonAgregar();
        
        document.getElementById('nombreProducto').focus();
        mostrarAlerta('alertProductos', 'Producto cargado para edición. Modifica los datos y presiona "Actualizar Producto".', 'success');
    }
}

function eliminarProducto(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        productos = productos.filter(p => p.id !== id);
        guardarProductos();
        actualizarListaProductos();
        actualizarMenuSelector();
        mostrarAlerta('alertProductos', 'Producto eliminado.', 'success');
    }
}

function limpiarFormularioProducto() {
    document.getElementById('nombreProducto').value = '';
    document.getElementById('costoProducto').value = '';
    document.getElementById('precioProducto').value = '';
    document.getElementById('descripcionProducto').value = '';
    productoEnEdicion = null;
    actualizarBotonAgregar();
}

function cancelarEdicion() {
    limpiarFormularioProducto();
    mostrarAlerta('alertProductos', 'Edición cancelada.', 'success');
}

function actualizarBotonAgregar() {
    const boton = document.querySelector('button[onclick="agregarProducto()"]');
    if (boton) {
        if (productoEnEdicion) {
            boton.innerHTML = '✏️ Actualizar Producto';
            boton.style.background = 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)';
            
            if (!document.getElementById('cancelarEdicionBtn')) {
                const cancelarBtn = document.createElement('button');
                cancelarBtn.id = 'cancelarEdicionBtn';
                cancelarBtn.className = 'btn';
                cancelarBtn.innerHTML = '❌ Cancelar Edición';
                cancelarBtn.onclick = cancelarEdicion;
                cancelarBtn.style.background = 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)';
                boton.parentNode.insertBefore(cancelarBtn, boton.nextSibling);
            }
        } else {
            boton.innerHTML = '➕ Agregar Producto';
            boton.style.background = '';
            
            const cancelarBtn = document.getElementById('cancelarEdicionBtn');
            if (cancelarBtn) {
                cancelarBtn.remove();
            }
        }
    }
}

function limpiarProductos() {
    if (confirm('¿Estás seguro de eliminar todos los productos? Esta acción no se puede deshacer.')) {
        productos = [];
        guardarProductos();
        actualizarListaProductos();
        actualizarMenuSelector();
        mostrarAlerta('alertProductos', 'Todos los productos han sido eliminados.', 'success');
    }
}

function agregarCategoria() {
    if (categoriaEnEdicion) {
        actualizarCategoria();
        return;
    }

    const nombre = document.getElementById('nuevaCategoria').value.trim();
    const icono = document.getElementById('iconoCategoria').value.trim() || '📦';

    if (!nombre) {
        mostrarAlerta('alertCategorias', 'Por favor ingresa el nombre de la categoría.', 'error');
        return;
    }

    if (categorias.some(cat => cat.nombre.toLowerCase() === nombre.toLowerCase())) {
        mostrarAlerta('alertCategorias', 'Ya existe una categoría con ese nombre.', 'error');
        return;
    }

    const siguienteOrden = Math.max(...categorias.map(c => c.orden || 0)) + 1;
    
    const categoria = {
        id: nombre.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
        nombre,
        icono,
        orden: siguienteOrden
    };

    categorias.push(categoria);
    guardarCategorias();
    actualizarListaCategorias();
    actualizarSelectCategorias();
    limpiarFormularioCategoria();
    mostrarAlerta('alertCategorias', 'Categoría agregada exitosamente.', 'success');
}

function actualizarCategoria() {
    const nombre = document.getElementById('nuevaCategoria').value.trim();
    const icono = document.getElementById('iconoCategoria').value.trim() || '📦';

    if (!nombre) {
        mostrarAlerta('alertCategorias', 'Por favor ingresa el nombre de la categoría.', 'error');
        return;
    }

    if (categorias.some(cat => cat.id !== categoriaEnEdicion.id && cat.nombre.toLowerCase() === nombre.toLowerCase())) {
        mostrarAlerta('alertCategorias', 'Ya existe una categoría con ese nombre.', 'error');
        return;
    }

    const index = categorias.findIndex(cat => cat.id === categoriaEnEdicion.id);
    if (index !== -1) {
        categorias[index] = {
            ...categoriaEnEdicion,
            nombre,
            icono
        };
        
        guardarCategorias();
        actualizarListaCategorias();
        actualizarSelectCategorias();
        actualizarListaProductos();
        actualizarMenuSelector();
        limpiarFormularioCategoria();
        categoriaEnEdicion = null;
        actualizarBotonCategoria();
        mostrarAlerta('alertCategorias', 'Categoría actualizada exitosamente.', 'success');
    }
}

function editarCategoria(id) {
    const categoria = categorias.find(cat => cat.id === id);
    if (categoria) {
        categoriaEnEdicion = { ...categoria };
        
        document.getElementById('nuevaCategoria').value = categoria.nombre;
        document.getElementById('iconoCategoria').value = categoria.icono;
        
        actualizarBotonCategoria();
        document.getElementById('nuevaCategoria').focus();
        mostrarAlerta('alertCategorias', 'Categoría cargada para edición.', 'success');
    }
}

function eliminarCategoria(id) {
    const productosEnCategoria = productos.filter(p => p.categoria === id);
    
    if (productosEnCategoria.length > 0) {
        mostrarAlerta('alertCategorias', `No se puede eliminar la categoría porque tiene ${productosEnCategoria.length} productos asociados.`, 'error');
        return;
    }

    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
        categorias = categorias.filter(cat => cat.id !== id);
        guardarCategorias();
        actualizarListaCategorias();
        actualizarSelectCategorias();
        mostrarAlerta('alertCategorias', 'Categoría eliminada exitosamente.', 'success');
    }
}

function limpiarFormularioCategoria() {
    document.getElementById('nuevaCategoria').value = '';
    document.getElementById('iconoCategoria').value = '';
    categoriaEnEdicion = null;
    actualizarBotonCategoria();
}

function cancelarEdicionCategoria() {
    limpiarFormularioCategoria();
    mostrarAlerta('alertCategorias', 'Edición de categoría cancelada.', 'success');
}

function actualizarBotonCategoria() {
    const boton = document.querySelector('button[onclick="agregarCategoria()"]');
    if (boton) {
        if (categoriaEnEdicion) {
            boton.innerHTML = '✏️ Actualizar';
            boton.style.background = '#f39c12';
            
            if (!document.getElementById('cancelarEdicionCategoriaBtn')) {
                const cancelarBtn = document.createElement('button');
                cancelarBtn.id = 'cancelarEdicionCategoriaBtn';
                cancelarBtn.className = 'btn';
                cancelarBtn.innerHTML = '❌ Cancelar';
                cancelarBtn.onclick = cancelarEdicionCategoria;
                cancelarBtn.style.background = '#95a5a6';
                boton.parentNode.insertBefore(cancelarBtn, boton.nextSibling);
            }
        } else {
            boton.innerHTML = '➕ Agregar';
            boton.style.background = '#28a745';
            
            const cancelarBtn = document.getElementById('cancelarEdicionCategoriaBtn');
            if (cancelarBtn) {
                cancelarBtn.remove();
            }
        }
    }
}

function moverCategoria(categoriaId, direccion) {
    const categoriasOrdenadas = categorias.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
    const index = categoriasOrdenadas.findIndex(cat => cat.id === categoriaId);
    
    if (index === -1) return;
    
    let nuevoIndex;
    if (direccion === 'arriba' && index > 0) {
        nuevoIndex = index - 1;
    } else if (direccion === 'abajo' && index < categoriasOrdenadas.length - 1) {
        nuevoIndex = index + 1;
    } else {
        return;
    }
    
    const categoriaActual = categoriasOrdenadas[index];
    const categoriaDestino = categoriasOrdenadas[nuevoIndex];
    
    const ordenTemporal = categoriaActual.orden;
    categoriaActual.orden = categoriaDestino.orden;
    categoriaDestino.orden = ordenTemporal;
    
    const indexActual = categorias.findIndex(cat => cat.id === categoriaActual.id);
    const indexDestino = categorias.findIndex(cat => cat.id === categoriaDestino.id);
    
    if (indexActual !== -1) categorias[indexActual].orden = categoriaActual.orden;
    if (indexDestino !== -1) categorias[indexDestino].orden = categoriaDestino.orden;
    
    guardarCategorias();
    actualizarListaCategorias();
    actualizarSelectCategorias();
    actualizarListaProductos();
    actualizarMenuSelector();
    
    mostrarAlerta('alertCategorias', 'Orden de categorías actualizado.', 'success');
}

function inicializarDragAndDrop() {
    const items = document.querySelectorAll('.categoria-item');
    let draggedElement = null;
    
    items.forEach(item => {
        item.addEventListener('dragstart', function(e) {
            draggedElement = this;
            this.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.outerHTML);
        });
        
        item.addEventListener('dragend', function(e) {
            this.style.opacity = '1';
            draggedElement = null;
        });
        
        item.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            this.style.borderTop = '3px solid #667eea';
        });
        
        item.addEventListener('dragleave', function(e) {
            this.style.borderTop = '1px solid #dee2e6';
        });
        
        item.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderTop = '1px solid #dee2e6';
            
            if (draggedElement !== this) {
                const draggedId = draggedElement.getAttribute('data-categoria-id');
                const targetId = this.getAttribute('data-categoria-id');
                
                reordenarCategorias(draggedId, targetId);
            }
        });
    });
}

function reordenarCategorias(draggedId, targetId) {
    const draggedIndex = categorias.findIndex(cat => cat.id === draggedId);
    const targetIndex = categorias.findIndex(cat => cat.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const draggedCategory = categorias[draggedIndex];
    const targetCategory = categorias[targetIndex];
    
    const ordenTemporal = draggedCategory.orden;
    draggedCategory.orden = targetCategory.orden;
    targetCategory.orden = ordenTemporal;
    
    guardarCategorias();
    actualizarListaCategorias();
    actualizarSelectCategorias();
    actualizarListaProductos();
    actualizarMenuSelector();
    
    mostrarAlerta('alertCategorias', 'Categorías reordenadas exitosamente.', 'success');
}

function actualizarListaCategorias() {
    const container = document.getElementById('listaCategorias');
    
    if (categorias.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">No hay categorías personalizadas.</p>';
        return;
    }

    const categoriasOrdenadas = categorias.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));

    let html = `
        <div style="margin-bottom: 15px; padding: 10px; background: #e3f2fd; border-radius: 8px; font-size: 0.9rem; color: #1976d2;">
            💡 <strong>Reordenar categorías:</strong> Arrastra las categorías para cambiar el orden en que aparecen en las cotizaciones
        </div>
        <div id="categorias-sortable" style="display: flex; flex-direction: column; gap: 10px;">
    `;
    
    categoriasOrdenadas.forEach((categoria, index) => {
        const productosEnCategoria = productos.filter(p => p.categoria === categoria.id).length;
        
        html += `
            <div class="categoria-item" draggable="true" data-categoria-id="${categoria.id}" 
                 style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #dee2e6; 
                        display: flex; justify-content: space-between; align-items: center; cursor: grab;
                        transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
                 onmouseenter="this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)'"
                 onmouseleave="this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)'">
                
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="cursor: grab; color: #6c757d; font-size: 1.2rem;" title="Arrastra para reordenar">⋮⋮</div>
                    <div style="background: #f8f9fa; padding: 5px; border-radius: 50%; min-width: 40px; text-align: center;">
                        <span style="font-size: 1.2rem;">${categoria.icono}</span>
                    </div>
                    <div>
                        <strong style="color: #2c3e50;">${categoria.nombre}</strong>
                        <br><small style="color: #6c757d;">Orden: ${categoria.orden} • ${productosEnCategoria} producto${productosEnCategoria !== 1 ? 's' : ''}</small>
                    </div>
                </div>
                
                <div style="display: flex; gap: 8px; align-items: center;">
                    <div style="display: flex; gap: 5px;">
                        <button onclick="moverCategoria('${categoria.id}', 'arriba')" style="background: #6c757d; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 0.8rem;" ${index === 0 ? 'disabled' : ''}>↑</button>
                        <button onclick="moverCategoria('${categoria.id}', 'abajo')" style="background: #6c757d; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 0.8rem;" ${index === categoriasOrdenadas.length - 1 ? 'disabled' : ''}>↓</button>
                    </div>
                    <button class="btn" onclick="editarCategoria('${categoria.id}')" style="font-size: 0.8rem; padding: 6px 10px; background: #f39c12; color: white;">✏️ Editar</button>
                    <button class="btn btn-danger" onclick="eliminarCategoria('${categoria.id}')" style="font-size: 0.8rem; padding: 6px 10px;" ${productosEnCategoria > 0 ? 'disabled title="No se puede eliminar: tiene productos asociados"' : ''}>🗑️</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Inicializar drag and drop
    setTimeout(() => {
        inicializarDragAndDrop();
    }, 100);
}

function actualizarSelectCategorias() {
    const select = document.getElementById('categoriaProducto');
    if (!select) return;
    
    const valorActual = select.value;
    
    select.innerHTML = '';
    
    const categoriasOrdenadas = categorias.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
    categoriasOrdenadas.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = `${categoria.icono} ${categoria.nombre}`;
        select.appendChild(option);
    });
    
    if (valorActual && categorias.some(cat => cat.id === valorActual)) {
        select.value = valorActual;
    }
}

function actualizarListaProductos() {
    const container = document.getElementById('listaProductos');
    
    if (productos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">No hay productos agregados. Agrega el primer producto para comenzar.</p>';
        return;
    }

    const categoriasOrdenadas = categorias.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));

    let html = '';
    
    categoriasOrdenadas.forEach(categoria => {
        const productosCategoria = productos.filter(p => p.categoria === categoria.id);
        
        if (productosCategoria.length > 0) {
            html += `<div style="grid-column: 1 / -1;"><h3 style="color: #667eea; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">${categoria.icono} ${categoria.nombre}</h3></div>`;
            
            productosCategoria.forEach(producto => {
                const margen = producto.precio - producto.costo;
                const porcentajeMargen = producto.costo > 0 ? ((margen / producto.costo) * 100).toFixed(1) : 0;
                
                html += `
                    <div class="producto-card">
                        <h4 style="color: #2c3e50; margin-bottom: 10px;">${producto.nombre}</h4>
                        <p style="color: #6c757d; margin-bottom: 15px; min-height: 40px;">${producto.descripcion || 'Sin descripción'}</p>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                            <div>
                                <span style="font-size: 0.9rem; color: #6c757d;">Costo:</span>
                                <p style="font-weight: 600; color: #dc3545;">$${producto.costo.toFixed(2)}</p>
                            </div>
                            <div>
                                <span style="font-size: 0.9rem; color: #6c757d;">Precio:</span>
                                <p style="font-weight: 600; color: #28a745;">$${producto.precio.toFixed(2)}</p>
                            </div>
                        </div>
                        <div style="background: #f8f9fa; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                            <small>Margen: $${margen.toFixed(2)} (${porcentajeMargen}%)</small>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                            <button class="btn" onclick="duplicarProducto(${producto.id})" style="font-size: 0.85rem; padding: 8px 10px;">📋 Duplicar</button>
                            <button class="btn btn-warning" onclick="editarProducto(${producto.id})" style="font-size: 0.85rem; padding: 8px 10px;">✏️ Editar</button>
                            <button class="btn btn-danger" onclick="eliminarProducto(${producto.id})" style="font-size: 0.85rem; padding: 8px 10px;">🗑️ Eliminar</button>
                        </div>
                    </div>
                `;
            });
        }
    });

    container.innerHTML = html;
}

// GESTIÓN DEL COTIZADOR
function toggleCheckbox(element) {
    const checkbox = element.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
    element.classList.toggle('selected', checkbox.checked);
    
    actualizarResumenTiempoReal();
}

function actualizarMenuSelector() {
    const container = document.getElementById('menuSelector');
    
    if (productos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">Primero agrega productos en la sección "Productos" para poder seleccionar el menú.</p>';
        return;
    }

    const categoriasDisponibles = categorias.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));

    let html = '';
    
    categoriasDisponibles.forEach(categoria => {
        const productosCategoria = productos.filter(p => p.categoria === categoria.id);
        
        if (productosCategoria.length > 0) {
            html += `
                <div class="menu-selector">
                    <h4 style="color: #667eea; margin-bottom: 15px;">${categoria.icono} ${categoria.nombre}</h4>
                    <div style="display: grid; gap: 15px;">
                        ${productosCategoria.map(p => `
                            <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 15px; align-items: center; padding: 15px; background: #f8f9fa; border-radius: 10px; border: 2px solid #e1e8ed;">
                                <div style="display: flex; align-items: center;">
                                    <input type="checkbox" id="producto_${p.id}" value="${p.id}" style="margin-right: 10px; transform: scale(1.2);" onchange="toggleProducto(${p.id})">
                                    <label for="producto_${p.id}" style="cursor: pointer; margin: 0;">
                                        <strong>${p.nombre}</strong> ${ocultarPrecios ? '' : `- $${p.precio.toFixed(2)}`}
                                        ${p.descripcion ? `<br><small style="color: #6c757d;">${p.descripcion}</small>` : ''}
                                    </label>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <label style="font-size: 0.9rem; margin: 0; color: #495057;">Cantidad:</label>
                                    <input type="number" id="cantidad_${p.id}" min="1" value="1" disabled 
                                           style="width: 80px; padding: 5px; font-size: 0.9rem; text-align: center;"
                                           oninput="validarCantidad(${p.id})" onchange="calcularTotalProducto(${p.id})">
                                </div>
                                <div style="text-align: right; min-width: 100px;">
                                    <div style="font-size: 0.9rem; color: #6c757d;">Subtotal:</div>
                                    <div id="subtotal_${p.id}" style="font-weight: 600; color: #28a745;">${ocultarPrecios ? 'Oculto' : '$0.00'}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top: 10px; padding: 10px; background: #e3f2fd; border-radius: 8px; font-size: 0.9rem; color: #1976d2;">
                        💡 Selecciona los productos que quieres incluir y ajusta las cantidades. No puede exceder el número de invitados por categoría.
                    </div>
                </div>
            `;
        }
    });

    if (html === '') {
        html = '<p style="text-align: center; color: #6c757d; font-style: italic;">No hay productos disponibles para crear un menú.</p>';
    }

    container.innerHTML = html;
}

function validarCantidad(productoId) {
    const cantidadInput = document.getElementById(`cantidad_${productoId}`);
    const cantidadPersonas = parseInt(document.getElementById('cantidadPersonas').value) || 0;
    
    if (cantidadPersonas === 0) {
        mostrarAlerta('alertCotizacion', 'Primero ingresa la cantidad de personas para el evento.', 'error');
        cantidadInput.value = 1;
        return;
    }
    
    let cantidad = parseInt(cantidadInput.value) || 1;
    
    if (cantidad < 1) {
        cantidad = 1;
    }
    
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    
    const productosCategoria = productos.filter(p => p.categoria === producto.categoria);
    let totalCategoriaActual = 0;
    
    productosCategoria.forEach(p => {
        if (p.id !== productoId) {
            const checkbox = document.getElementById(`producto_${p.id}`);
            const input = document.getElementById(`cantidad_${p.id}`);
            
            if (checkbox && checkbox.checked && input) {
                totalCategoriaActual += parseInt(input.value) || 0;
            }
        }
    });
    
    const maximoDisponible = cantidadPersonas - totalCategoriaActual;
    
    if (cantidad > maximoDisponible) {
        cantidad = maximoDisponible;
        if (maximoDisponible === 0) {
            mostrarAlerta('alertCotizacion', `No puedes agregar más productos a esta categoría. Ya tienes ${totalCategoriaActual} de ${cantidadPersonas} invitados cubiertos.`, 'error');
        } else {
            mostrarAlerta('alertCotizacion', `Solo puedes agregar ${maximoDisponible} más en esta categoría (tienes ${totalCategoriaActual}/${cantidadPersonas}).`, 'error');
        }
    }
    
    cantidadInput.value = cantidad;
    cantidadInput.max = maximoDisponible;
    
    actualizarMaximosCategoria(producto.categoria);
}

function actualizarMaximosCategoria(categoria) {
    const cantidadPersonas = parseInt(document.getElementById('cantidadPersonas').value) || 0;
    const productosCategoria = productos.filter(p => p.categoria === categoria);
    
    let totalCategoriaActual = 0;
    productosCategoria.forEach(p => {
        const checkbox = document.getElementById(`producto_${p.id}`);
        const input = document.getElementById(`cantidad_${p.id}`);
        
        if (checkbox && checkbox.checked && input) {
            totalCategoriaActual += parseInt(input.value) || 0;
        }
    });
    
    productosCategoria.forEach(p => {
        const checkbox = document.getElementById(`producto_${p.id}`);
        const input = document.getElementById(`cantidad_${p.id}`);
        
        if (checkbox && input && checkbox.checked) {
            const cantidadActual = parseInt(input.value) || 0;
            const otrosTotalCategoria = totalCategoriaActual - cantidadActual;
            const maximoDisponible = cantidadPersonas - otrosTotalCategoria;
            
            input.max = maximoDisponible;
            
            if (cantidadActual > maximoDisponible) {
                input.value = maximoDisponible;
                calcularTotalProducto(p.id);
            }
        }
    });
}

function toggleProducto(productoId) {
    const checkbox = document.getElementById(`producto_${productoId}`);
    const cantidadInput = document.getElementById(`cantidad_${productoId}`);
    const subtotalDiv = document.getElementById(`subtotal_${productoId}`);
    const cantidadPersonas = parseInt(document.getElementById('cantidadPersonas').value) || 0;
    
    if (checkbox.checked) {
        if (cantidadPersonas === 0) {
            checkbox.checked = false;
            mostrarAlerta('alertCotizacion', 'Primero ingresa la cantidad de personas para el evento.', 'error');
            return;
        }
        
        cantidadInput.disabled = false;
        
        const producto = productos.find(p => p.id === productoId);
        if (producto) {
            const productosCategoria = productos.filter(p => p.categoria === producto.categoria);
            let totalCategoriaActual = 0;
            
            productosCategoria.forEach(p => {
                if (p.id !== productoId) {
                    const cb = document.getElementById(`producto_${p.id}`);
                    const inp = document.getElementById(`cantidad_${p.id}`);
                    
                    if (cb && cb.checked && inp) {
                        totalCategoriaActual += parseInt(inp.value) || 0;
                    }
                }
            });
            
            const maximoDisponible = cantidadPersonas - totalCategoriaActual;
            
            if (maximoDisponible <= 0) {
                checkbox.checked = false;
                cantidadInput.disabled = true;
                mostrarAlerta('alertCotizacion', `No puedes seleccionar más productos en esta categoría. Ya tienes ${totalCategoriaActual} de ${cantidadPersonas} invitados cubiertos.`, 'error');
                return;
            }
            
            cantidadInput.max = maximoDisponible;
            cantidadInput.value = Math.min(1, maximoDisponible);
        }
        
        cantidadInput.focus();
        calcularTotalProducto(productoId);
        actualizarMaximosCategoria(producto.categoria);
    } else {
        cantidadInput.disabled = true;
        cantidadInput.value = 1;
        subtotalDiv.textContent = ocultarPrecios ? 'Oculto' : '$0.00';
        
        const producto = productos.find(p => p.id === productoId);
        if (producto) {
            actualizarMaximosCategoria(producto.categoria);
        }
        
        validarTotalesProductos();
    }
    
    actualizarResumenTiempoReal();
}

function calcularTotalProducto(productoId) {
    const checkbox = document.getElementById(`producto_${productoId}`);
    const cantidadInput = document.getElementById(`cantidad_${productoId}`);
    const subtotalDiv = document.getElementById(`subtotal_${productoId}`);
    
    if (checkbox.checked) {
        const producto = productos.find(p => p.id === productoId);
        const cantidad = parseInt(cantidadInput.value) || 1;
        
        const subtotal = producto.precio * cantidad;
        subtotalDiv.textContent = ocultarPrecios ? 'Oculto' : `$${subtotal.toFixed(2)}`;
        
        actualizarMaximosCategoria(producto.categoria);
        validarTotalesProductos();
        actualizarResumenTiempoReal();
    }
}

function validarTotalesProductos() {
    const cantidadPersonas = parseInt(document.getElementById('cantidadPersonas').value) || 0;
    if (cantidadPersonas === 0) return true;
    
    const categoriasValidacion = categorias.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
    let resumenContainer = document.getElementById('resumenValidacion');
    
    if (!resumenContainer) {
        const menuSelector = document.getElementById('menuSelector');
        menuSelector.insertAdjacentHTML('beforeend', `
            <div id="resumenValidacion" style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #667eea;">
                <h5 style="color: #667eea; margin-bottom: 15px;">📊 Resumen de Cantidades</h5>
                <div id="resumenContenido"></div>
            </div>
        `);
        resumenContainer = document.getElementById('resumenValidacion');
    }
    
    let resumenHtml = '';
    let hayErrores = false;
    
    categoriasValidacion.forEach(categoria => {
        const productosCategoria = productos.filter(p => p.categoria === categoria.id);
        let totalCategoria = 0;
        let productosSeleccionados = [];
        
        productosCategoria.forEach(producto => {
            const checkbox = document.getElementById(`producto_${producto.id}`);
            const cantidadInput = document.getElementById(`cantidad_${producto.id}`);
            
            if (checkbox && checkbox.checked && cantidadInput) {
                const cantidad = parseInt(cantidadInput.value) || 0;
                if (cantidad > 0) {
                    totalCategoria += cantidad;
                    productosSeleccionados.push({
                        nombre: producto.nombre,
                        cantidad: cantidad
                    });
                }
            }
        });
        
        if (productosSeleccionados.length > 0) {
            const esValido = totalCategoria <= cantidadPersonas;
            const colorEstado = esValido ? '#28a745' : '#dc3545';
            const iconoEstado = esValido ? '✅' : '❌';
            
            if (!esValido) hayErrores = true;
            
            resumenHtml += `
                <div style="margin-bottom: 15px; padding: 10px; background: white; border-radius: 8px; border-left: 3px solid ${colorEstado};">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <strong style="color: ${colorEstado};">${iconoEstado} ${categoria.icono} ${categoria.nombre}</strong>
                        <span style="font-weight: 600; color: ${colorEstado};">
                            ${totalCategoria}/${cantidadPersonas} personas
                        </span>
                    </div>
                    <div style="font-size: 0.9rem; color: #6c757d;">
                        ${productosSeleccionados.map(p => `${p.nombre}: ${p.cantidad}`).join(' • ')}
                    </div>
                    ${!esValido ? `<div style="font-size: 0.8rem; color: #dc3545; margin-top: 5px;">⚠️ Excede por ${totalCategoria - cantidadPersonas} personas</div>` : ''}
                </div>
            `;
        }
    });
    
    if (resumenHtml === '') {
        resumenHtml = '<p style="color: #6c757d; font-style: italic;">No hay productos seleccionados.</p>';
    }
    
    document.getElementById('resumenContenido').innerHTML = resumenHtml;
    
    const mensajeError = document.getElementById('mensajeErrorValidacion');
    if (hayErrores) {
        if (!mensajeError) {
            document.getElementById('resumenValidacion').insertAdjacentHTML('beforeend', `
                <div id="mensajeErrorValidacion" style="margin-top: 15px; padding: 12px; background: #f8d7da; color: #721c24; border-radius: 8px; border: 1px solid #f5c6cb;">
                    <strong>⚠️ Error de validación:</strong> Hay categorías que exceden el número de invitados. Ajusta las cantidades antes de guardar la cotización.
                </div>
            `);
        }
    } else {
        if (mensajeError) {
            mensajeError.remove();
        }
    }
    
    return !hayErrores;
}

function guardarCotizacion() {
    if (!cotizacionActual.id) {
        mostrarAlerta('alertCotizacion', 'No hay cotización para guardar. Completa los datos básicos del cliente.', 'error');
        return;
    }

    if (!cotizacionActual.productos || cotizacionActual.productos.length === 0) {
        mostrarAlerta('alertCotizacion', 'No hay productos seleccionados. Agrega al menos un producto antes de guardar.', 'error');
        return;
    }

    if (!cotizacionActual.cliente.nombre || !cotizacionActual.cliente.fechaEvento || !cotizacionActual.cliente.cantidadPersonas) {
        mostrarAlerta('alertCotizacion', 'Faltan datos básicos del cliente. Completa nombre, fecha y cantidad de personas.', 'error');
        return;
    }

    // Guardar en API usando cotizaciones como tipo
    const guardarEnAPI = async () => {
        try {
            // Primero obtener las cotizaciones existentes
            const cotizacionesExistentes = await cargarDatosDesdeAPI('cotizaciones');
            
            // Buscar si ya existe esta cotización (por ID)
            const index = cotizacionesExistentes.findIndex(cot => cot.id === cotizacionActual.id);

            if (index !== -1) {
                // Si existe, crear una nueva versión
                const cotizacionExistente = cotizacionesExistentes[index];
                crearNuevaVersion(cotizacionExistente, cotizacionActual);
                cotizacionesExistentes[index] = cotizacionExistente;
            } else {
                // Si no existe, crear nueva cotización con versión inicial
                const ahora = new Date();
                const fechaHora = `${ahora.toLocaleDateString()} ${ahora.toLocaleTimeString()}`;
                
                const datosParaVersion = copiarProfundo(cotizacionActual);
                delete datosParaVersion.versiones;
                delete datosParaVersion.versionActual;
                
                cotizacionActual.versiones = [{
                    version: 1,
                    fecha: ahora.toISOString(),
                    datos: datosParaVersion,
                    descripcion: `v1 - ${fechaHora}`
                }];
                cotizacionActual.versionActual = 1;
                cotizacionesExistentes.push(cotizacionActual);
            }
            
            // Guardar todas las cotizaciones
            const exito = await guardarDatosEnAPI('cotizaciones', cotizacionesExistentes);
            
            if (exito) {
                cargarHistorialCotizaciones();
                mostrarAlerta('alertCotizacion', 'Cotización guardada exitosamente.', 'success');
                
                if (editandoCotizacion) {
                    salirModoEdicion();
                }
            } else {
                mostrarAlerta('alertCotizacion', 'Error al guardar la cotización.', 'error');
            }
        } catch (error) {
            console.error('Error guardando cotización:', error);
            mostrarAlerta('alertCotizacion', 'Error al guardar la cotización.', 'error');
        }
    };
    
    guardarEnAPI();
}

function entrarModoEdicion(cotizacionOriginal) {
    editandoCotizacion = true;
    cotizacionOriginalEnEdicion = cotizacionOriginal;
    
    const proximaVersion = Math.max(...cotizacionOriginal.versiones.map(v => v.version)) + 1;
    const ahora = new Date();
    const fechaHora = `${ahora.toLocaleDateString()} ${ahora.toLocaleTimeString()}`;
    
    const indicador = document.getElementById('indicadorVersion');
    const nombreVersion = document.getElementById('nombreVersionEditando');
    const titulo = document.getElementById('tituloCotizador');
    
    if (indicador) indicador.style.display = 'block';
    if (nombreVersion) nombreVersion.textContent = `v${proximaVersion} - ${fechaHora}`;
    if (titulo) titulo.textContent = 'Editando Cotización';
}

function salirModoEdicion() {
    editandoCotizacion = false;
    cotizacionOriginalEnEdicion = null;
    
    const indicador = document.getElementById('indicadorVersion');
    const titulo = document.getElementById('tituloCotizador');
    
    if (indicador) indicador.style.display = 'none';
    if (titulo) titulo.textContent = 'Nueva Cotización';
}

function crearNuevaVersion(cotizacionExistente, nuevosDatos) {
    if (!cotizacionExistente.versiones) {
        const fechaOriginal = new Date(cotizacionExistente.fechaCotizacion + 'T00:00:00');
        const fechaHoraMigrada = `${fechaOriginal.toLocaleDateString()} ${fechaOriginal.toLocaleTimeString()}`;
        
        const datosOriginales = copiarProfundo(cotizacionExistente);
        delete datosOriginales.versiones;
        delete datosOriginales.versionActual;
        
        cotizacionExistente.versiones = [{
            version: 1,
            fecha: fechaOriginal.toISOString(),
            datos: datosOriginales,
            descripcion: `v1 - ${fechaHoraMigrada} (migrada)`
        }];
        cotizacionExistente.versionActual = 1;
    }

    const siguienteVersion = Math.max(...cotizacionExistente.versiones.map(v => v.version)) + 1;
    const ahora = new Date();
    const fechaHora = `${ahora.toLocaleDateString()} ${ahora.toLocaleTimeString()}`;
    
    const datosNuevos = copiarProfundo(nuevosDatos);
    delete datosNuevos.versiones;
    delete datosNuevos.versionActual;
    
    cotizacionExistente.versiones.push({
        version: siguienteVersion,
        fecha: ahora.toISOString(),
        datos: datosNuevos,
        descripcion: `v${siguienteVersion} - ${fechaHora}`
    });

    Object.assign(cotizacionExistente, copiarProfundo(nuevosDatos));
    cotizacionExistente.versionActual = siguienteVersion;
}

function descargarCotizacion() {
    if (!cotizacionActual.id) {
        mostrarAlerta('alertCotizacion', 'No hay cotización para descargar.', 'error');
        return;
    }

    const plantilla = localStorage.getItem('plantillaDescarga') || obtenerPlantillaDefecto();
    const contenido = procesarPlantilla(plantilla, cotizacionActual);

    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cotizacion_${cotizacionActual.cliente.nombre.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    mostrarAlerta('alertCotizacion', 'Cotización descargada exitosamente.', 'success');
}

function mostrarAlerta(containerId, mensaje, tipo) {
    const container = document.getElementById(containerId);
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

// GESTIÓN DEL HISTORIAL DE COTIZACIONES - CON SOPORTE PARA API
function cargarHistorialCotizaciones() {
    mostrarTodasCotizaciones();
}

async function mostrarTodasCotizaciones() {
    const cotizaciones = await cargarDatosDesdeAPI('cotizaciones');
    mostrarCotizacionesEnTabla(cotizaciones);
}

function buscarCotizaciones() {
    const termino = document.getElementById('buscarCotizacion').value.toLowerCase();
    
    cargarDatosDesdeAPI('cotizaciones').then(cotizaciones => {
        const cotizacionesFiltradas = cotizaciones.filter(cot => 
            cot.cliente.nombre.toLowerCase().includes(termino) ||
            cot.cliente.fechaEvento.includes(termino) ||
            cot.fechaCotizacion.includes(termino)
        );
        
        mostrarCotizacionesEnTabla(cotizacionesFiltradas);
    });
}

function mostrarCotizacionesEnTabla(cotizaciones) {
    const container = document.getElementById('tablaCotizaciones');
    
    if (cotizaciones.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #6c757d;">
                <h3>📋 No hay cotizaciones guardadas</h3>
                <p>Las cotizaciones que generes y guardes aparecerán aquí.</p>
            </div>
        `;
        return;
    }

    let html = `
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <thead>
                    <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                        <th style="padding: 15px; text-align: left;">Cliente</th>
                        <th style="padding: 15px; text-align: center;">Estado</th>
                        <th style="padding: 15px; text-align: center;">Fecha Evento</th>
                        <th style="padding: 15px; text-align: center;">Personas</th>
                        <th style="padding: 15px; text-align: center;">Total</th>
                        <th style="padding: 15px; text-align: center;">Productos</th>
                        <th style="padding: 15px; text-align: center;">Fecha Cotización</th>
                        <th style="padding: 15px; text-align: center;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;

    cotizaciones.forEach((cot, index) => {
        const totalProductos = cot.productos.length;
        const fechaClass = new Date(cot.cliente.fechaEvento) < new Date() ? 'color: #dc3545;' : 'color: #28a745;';
        
        const estadoCotizacion = estadosCotizacion.find(est => est.id === cot.estado) || 
            (cot.estado === 'solicitud_publica' ? { nombre: 'Solicitud Pública', icono: '🌐', color: '#17a2b8' } : { nombre: 'Sin estado', icono: '❓', color: '#6c757d' });
        
        html += `
            <tr style="border-bottom: 1px solid #dee2e6; transition: background-color 0.3s ease;" 
                onmouseover="this.style.backgroundColor='#f8f9fa'" 
                onmouseout="this.style.backgroundColor='white'">
                <td style="padding: 15px;">
                    <strong style="${fechaClass}">${cot.cliente.nombre}</strong>
                    <br><small style="color: #6c757d;">${cot.cliente.formatoEvento}</small>
                </td>
                <td style="padding: 15px; text-align: center;">
                    <div style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 8px; background: ${estadoCotizacion.color}15; color: ${estadoCotizacion.color}; border-radius: 12px; font-size: 0.85rem; font-weight: 500;">
                        <span>${estadoCotizacion.icono}</span>
                        <span>${estadoCotizacion.nombre}</span>
                    </div>
                </td>
                <td style="padding: 15px; text-align: center;">
                    <div>${cot.cliente.fechaEvento || 'No especificada'}</div>
                    <small style="color: #6c757d;">${cot.cliente.horaEvento || 'No especificada'}</small>
                </td>
                <td style="padding: 15px; text-align: center; font-weight: 600;">${cot.cliente.cantidadPersonas}</td>
                <td style="padding: 15px; text-align: center;">
                    <div style="font-weight: 700; font-size: 1.1rem; color: #28a745;">$${cot.totales.subtotal.toFixed(2)}</div>
                    <small style="color: #6c757d;">Margen: ${cot.totales.porcentajeMargen}%</small>
                </td>
                <td style="padding: 15px; text-align: center;">
                    <span style="background: #667eea; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.85rem;">
                        ${totalProductos} items
                    </span>
                </td>
                <td style="padding: 15px; text-align: center; color: #6c757d; font-size: 0.9rem;">
                    ${cot.fechaCotizacion}
                </td>
                <td style="padding: 15px; text-align: center;">
                    <div style="display: flex; gap: 5px; justify-content: center; flex-wrap: wrap;">
                        <button class="btn" onclick="verDetalleCotizacion(${index})" style="font-size: 0.8rem; padding: 6px 10px;">👁️ Ver</button>
                        <button class="btn btn-warning" onclick="editarCotizacion(${index})" style="font-size: 0.8rem; padding: 6px 10px;">✏️ Editar</button>
                        <button class="btn" onclick="mostrarHistorialVersiones(${cot.id})" style="font-size: 0.8rem; padding: 6px 10px; background: #28a745; color: white;">🔄 Versiones</button>
                        <button class="btn" onclick="duplicarCotizacion(${index})" style="font-size: 0.8rem; padding: 6px 10px;">📋 Duplicar</button>
                        <button class="btn" onclick="descargarCotizacionIndividual(${index})" style="font-size: 0.8rem; padding: 6px 10px;">💾 Descargar</button>
                        <button class="btn btn-danger" onclick="eliminarCotizacion(${index})" style="font-size: 0.8rem; padding: 6px 10px;">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 10px; text-align: center;">
            <strong>📊 Resumen:</strong> 
            ${cotizaciones.length} cotizaciones | 
            Total facturado: $${cotizaciones.reduce((sum, cot) => sum + cot.totales.subtotal, 0).toFixed(2)} |
            Promedio por cotización: $${cotizaciones.length > 0 ? (cotizaciones.reduce((sum, cot) => sum + cot.totales.subtotal, 0) / cotizaciones.length).toFixed(2) : '0.00'}
        </div>
    `;

    container.innerHTML = html;
}

function verDetalleCotizacion(index) {
    cargarDatosDesdeAPI('cotizaciones').then(cotizaciones => {
        const cot = cotizaciones[index];
        
        if (!cot) return;

        const modalHtml = `
            <div id="modalDetalle" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; display: flex; align-items: center; justify-content: center;" onclick="cerrarModal()">
                <div style="background: white; border-radius: 15px; padding: 30px; max-width: 800px; max-height: 90vh; overflow-y: auto; margin: 20px;" onclick="event.stopPropagation()">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #667eea; padding-bottom: 15px;">
                        <h3 style="color: #667eea; margin: 0;">📋 Detalle de Cotización</h3>
                        <button onclick="cerrarModal()" style="background: #dc3545; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">×</button>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                            <strong>Cliente:</strong><br>${cot.cliente.nombre}
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                            <strong>Email:</strong><br>${cot.cliente.email || 'No especificado'}
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                            <strong>Teléfono:</strong><br>${cot.cliente.telefono || 'No especificado'}
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                            <strong>Fecha:</strong><br>${cot.cliente.fechaEvento} ${cot.cliente.horaEvento}
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                            <strong>Personas:</strong><br>${cot.cliente.cantidadPersonas} (${cot.cliente.formatoEvento})
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                            <strong>Total:</strong><br><span style="color: #28a745; font-weight: 700; font-size: 1.2rem;">$${cot.totales.subtotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <h4 style="color: #2c3e50; margin-bottom: 15px;">Productos:</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Producto</th>
                                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Precio</th>
                                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Cantidad</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cot.productos.map(p => `
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">${p.nombre}</td>
                                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #dee2e6;">$${p.precio.toFixed(2)}</td>
                                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #dee2e6;">${p.cantidad}</td>
                                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #dee2e6; font-weight: 600;">$${p.subtotal.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px;">
                        <div style="text-align: center; padding: 15px; background: #fff3cd; border-radius: 10px;">
                            <div style="font-size: 0.9rem; color: #856404;">Costo Total</div>
                            <div style="font-size: 1.3rem; font-weight: 600; color: #856404;">$${cot.totales.costoTotal.toFixed(2)}</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #d1ecf1; border-radius: 10px;">
                            <div style="font-size: 0.9rem; color: #0c5460;">Margen</div>
                            <div style="font-size: 1.3rem; font-weight: 600; color: #0c5460;">$${cot.totales.margenTotal.toFixed(2)} (${cot.totales.porcentajeMargen}%)</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #d4edda; border-radius: 10px;">
                            <div style="font-size: 0.9rem; color: #155724;">Total</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: #155724;">$${cot.totales.subtotal.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    });
}

function cerrarModal() {
    const modal = document.getElementById('modalDetalle');
    if (modal) {
        modal.remove();
    }
}

function duplicarCotizacion(index) {
    cargarDatosDesdeAPI('cotizaciones').then(cotizaciones => {
        const cot = cotizaciones[index];
        
        if (!cot) return;

        const nuevaCotizacion = copiarProfundo(cot);
        nuevaCotizacion.id = Date.now();
        nuevaCotizacion.fechaCotizacion = new Date().toLocaleDateString();
        nuevaCotizacion.cliente = {
            ...nuevaCotizacion.cliente,
            nombre: nuevaCotizacion.cliente.nombre + ' (Copia)'
        };

        cotizaciones.push(nuevaCotizacion);
        guardarDatosEnAPI('cotizaciones', cotizaciones).then(() => {
            cargarHistorialCotizaciones();
            mostrarAlerta('alertHistorial', 'Cotización duplicada exitosamente.', 'success');
        });
    });
}

function descargarCotizacionIndividual(index) {
    cargarDatosDesdeAPI('cotizaciones').then(cotizaciones => {
        const cot = cotizaciones[index];
        
        if (!cot) return;

        cotizacionActual = cot;
        descargarCotizacion();
    });
}

function eliminarCotizacion(index) {
    if (confirm('¿Estás seguro de eliminar esta cotización? Esta acción no se puede deshacer.')) {
        cargarDatosDesdeAPI('cotizaciones').then(cotizaciones => {
            cotizaciones.splice(index, 1);
            guardarDatosEnAPI('cotizaciones', cotizaciones).then(() => {
                cargarHistorialCotizaciones();
                mostrarAlerta('alertHistorial', 'Cotización eliminada.', 'success');
            });
        });
    }
}

function exportarCotizaciones() {
    cargarDatosDesdeAPI('cotizaciones').then(cotizaciones => {
        if (cotizaciones.length === 0) {
            mostrarAlerta('alertHistorial', 'No hay cotizaciones para exportar.', 'error');
            return;
        }

        let contenido = `REPORTE COMPLETO DE COTIZACIONES\n`;
        contenido += `================================\n\n`;
        contenido += `Fecha de exportación: ${new Date().toLocaleDateString()}\n`;
        contenido += `Total de cotizaciones: ${cotizaciones.length}\n\n`;

        cotizaciones.forEach((cot, index) => {
            contenido += `COTIZACIÓN #${index + 1}\n`;
            contenido += `================\n`;
            contenido += `Cliente: ${cot.cliente.nombre}\n`;
            contenido += `Email: ${cot.cliente.email || 'No especificado'}\n`;
            contenido += `Teléfono: ${cot.cliente.telefono || 'No especificado'}\n`;
            contenido += `Fecha del Evento: ${cot.cliente.fechaEvento} ${cot.cliente.horaEvento}\n`;
            contenido += `Personas: ${cot.cliente.cantidadPersonas} (${cot.cliente.formatoEvento})\n`;
            contenido += `Total: $${cot.totales.subtotal.toFixed(2)}\n`;
            contenido += `Margen: $${cot.totales.margenTotal.toFixed(2)} (${cot.totales.porcentajeMargen}%)\n`;
            contenido += `Productos:\n`;
            cot.productos.forEach(p => {
                contenido += `  - ${p.nombre}: ${p.cantidad} x $${p.precio.toFixed(2)} = $${p.subtotal.toFixed(2)}\n`;
            });
            contenido += `Fecha de cotización: ${cot.fechaCotizacion}\n\n`;
        });

        const totalFacturado = cotizaciones.reduce((sum, cot) => sum + cot.totales.subtotal, 0);
        const promedioFacturado = totalFacturado / cotizaciones.length;

        contenido += `RESUMEN GENERAL:\n`;
        contenido += `================\n`;
        contenido += `Total facturado: $${totalFacturado.toFixed(2)}\n`;
        contenido += `Promedio por cotización: $${promedioFacturado.toFixed(2)}\n`;

        const blob = new Blob([contenido], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_cotizaciones_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        mostrarAlerta('alertHistorial', 'Reporte exportado exitosamente.', 'success');
    });
}

function limpiarHistorial() {
    if (confirm('¿Estás seguro de eliminar TODAS las cotizaciones? Esta acción no se puede deshacer.')) {
        guardarDatosEnAPI('cotizaciones', []).then(() => {
            cargarHistorialCotizaciones();
            mostrarAlerta('alertHistorial', 'Historial limpiado completamente.', 'success');
        });
    }
}

function exportarBaseDatos() {
    Promise.all([
        cargarDatosDesdeAPI('productos'),
        cargarDatosDesdeAPI('cotizaciones'),
        cargarDatosDesdeAPI('categorias'),
        cargarDatosDesdeAPI('estadosCotizacion'),
        cargarDatosDesdeAPI('experiencias'),
        cargarDatosDesdeAPI('motivosEvento'),
        cargarDatosDesdeAPI('camposPersonalizados'),
        cargarDatosDesdeAPI('politicas'),
        cargarDatosDesdeAPI('plantillaDescarga')
    ]).then(([productos, cotizaciones, categorias, estadosCotizacion, experiencias, motivosEvento, camposPersonalizados, politicas, plantillaDescarga]) => {
        
        const baseDatos = {
            productos: productos,
            cotizaciones: cotizaciones,
            categorias: categorias,
            estadosCotizacion: estadosCotizacion,
            experiencias: experiencias,
            motivosEvento: motivosEvento,
            camposPersonalizados: camposPersonalizados,
            politicas: politicas,
            plantillaDescarga: plantillaDescarga,
            fechaExportacion: new Date().toISOString(),
            version: '4.0'
        };
        
        const contenidoJSON = JSON.stringify(baseDatos, null, 2);
        
        const blob = new Blob([contenidoJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `base_datos_cotizador_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        mostrarAlerta('alertHistorial', `Base de datos exportada: ${productos.length} productos, ${cotizaciones.length} cotizaciones, ${categorias.length} categorías, ${estadosCotizacion.length} estados, ${experiencias.length} experiencias, ${motivosEvento.length} motivos y ${camposPersonalizados.length} campos personalizados.`, 'success');
    });
}

function importarBaseDatos() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const baseDatos = JSON.parse(e.target.result);
                
                if (!baseDatos.productos || !baseDatos.cotizaciones) {
                    throw new Error('Formato de archivo inválido');
                }
                
                if (confirm(`¿Estás seguro de importar esta base de datos?\nProductos: ${baseDatos.productos.length}\nCotizaciones: ${baseDatos.cotizaciones.length}\nCategorías: ${baseDatos.categorias?.length || 0}\nEstados: ${baseDatos.estadosCotizacion?.length || 0}\nExperiencias: ${baseDatos.experiencias?.length || 0}\nMotivos: ${baseDatos.motivosEvento?.length || 0}\nCampos Personalizados: ${baseDatos.camposPersonalizados?.length || 0}\n\nEsto REEMPLAZARÁ todos los datos actuales.`)) {
                    
                    // Importar todos los datos a la API
                    const promesasImportacion = [
                        guardarDatosEnAPI('productos', baseDatos.productos),
                        guardarDatosEnAPI('cotizaciones', baseDatos.cotizaciones)
                    ];
                    
                    if (baseDatos.categorias) {
                        promesasImportacion.push(guardarDatosEnAPI('categorias', baseDatos.categorias));
                    }
                    if (baseDatos.estadosCotizacion) {
                        promesasImportacion.push(guardarDatosEnAPI('estadosCotizacion', baseDatos.estadosCotizacion));
                    }
                    if (baseDatos.experiencias) {
                        promesasImportacion.push(guardarDatosEnAPI('experiencias', baseDatos.experiencias));
                    }
                    if (baseDatos.motivosEvento) {
                        promesasImportacion.push(guardarDatosEnAPI('motivosEvento', baseDatos.motivosEvento));
                    }
                    if (baseDatos.camposPersonalizados) {
                        promesasImportacion.push(guardarDatosEnAPI('camposPersonalizados', baseDatos.camposPersonalizados));
                    }
                    if (baseDatos.politicas) {
                        promesasImportacion.push(guardarDatosEnAPI('politicas', baseDatos.politicas));
                    }
                    if (baseDatos.plantillaDescarga) {
                        promesasImportacion.push(guardarDatosEnAPI('plantillaDescarga', baseDatos.plantillaDescarga));
                    }
                    
                    Promise.all(promesasImportacion).then(() => {
                        // Actualizar las variables globales
                        productos = baseDatos.productos;
                        if (baseDatos.categorias) {
                            categorias = baseDatos.categorias;
                        }
                        if (baseDatos.estadosCotizacion) {
                            estadosCotizacion = baseDatos.estadosCotizacion;
                        }
                        if (baseDatos.experiencias) {
                            experiencias = baseDatos.experiencias;
                        }
                        if (baseDatos.motivosEvento) {
                            motivosEvento = baseDatos.motivosEvento;
                        }
                        if (baseDatos.camposPersonalizados) {
                            camposPersonalizados = baseDatos.camposPersonalizados;
                        }
                        
                        // Actualizar todas las vistas
                        actualizarSelectCategorias();
                        actualizarSelectEstados();
                        actualizarListaCategorias();
                        actualizarListaEstados();
                        actualizarListaExperiencias();
                        actualizarListaMotivos();
                        actualizarListaCamposPersonalizados();
                        actualizarListaProductos();
                        actualizarMenuSelector();
                        actualizarExperienciasCheckboxes();
                        actualizarMotivosCheckboxes();
                        generarCamposPersonalizadosEnCotizador();
                        actualizarVariablesCamposPersonalizados();
                        cargarHistorialCotizaciones();
                        cargarPoliticas();
                        cargarPlantilla();
                        
                        mostrarAlerta('alertHistorial', `Base de datos importada exitosamente: ${baseDatos.productos.length} productos, ${baseDatos.cotizaciones.length} cotizaciones, ${baseDatos.categorias?.length || 0} categorías, ${baseDatos.estadosCotizacion?.length || 0} estados, ${baseDatos.experiencias?.length || 0} experiencias, ${baseDatos.motivosEvento?.length || 0} motivos y ${baseDatos.camposPersonalizados?.length || 0} campos personalizados.`, 'success');
                    });
                }
            } catch (error) {
                mostrarAlerta('alertHistorial', 'Error al importar: archivo inválido o corrupto.', 'error');
                console.error('Error de importación:', error);
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// Función para convertir solicitud pública a cotización normal
function convertirASolicitudNormal(index) {
    cargarDatosDesdeAPI('cotizaciones').then(cotizaciones => {
        const cot = cotizaciones[index];
        
        if (!cot || !cot.esSolicitudPublica) return;
        
        if (confirm('¿Convertir esta solicitud pública a cotización normal? Esto cambiará el estado a "En Revisión" y quitará la marca de solicitud pública.')) {
            // Cambiar estado y quitar marca de solicitud pública
            cot.estado = 'revisando';
            cot.esSolicitudPublica = false;
            
            // Limpiar el nombre del cliente (quitar "(Solicitud Web)")
            cot.cliente.nombre = cot.cliente.nombre.replace(' (Solicitud Web)', '');
            
            // Crear nueva versión para el cambio de estado
            if (!cot.versiones) cot.versiones = [];
            
            const ahora = new Date();
            const fechaHora = `${ahora.toLocaleDateString()} ${ahora.toLocaleTimeString()}`;
            const siguienteVersion = Math.max(...cot.versiones.map(v => v.version)) + 1;
            
            const datosParaVersion = copiarProfundo(cot);
            delete datosParaVersion.versiones;
            delete datosParaVersion.versionActual;
            
            cot.versiones.push({
                version: siguienteVersion,
                fecha: ahora.toISOString(),
                datos: datosParaVersion,
                descripcion: `v${siguienteVersion} - ${fechaHora} (procesada de solicitud pública)`
            });
            cot.versionActual = siguienteVersion;
            
            // Guardar cambios
            guardarDatosEnAPI('cotizaciones', cotizaciones).then(() => {
                cargarHistorialCotizaciones();
                mostrarAlerta('alertHistorial', 'Solicitud convertida a cotización normal exitosamente.', 'success');
            });
        }
    });
}

// Función para resaltar solicitudes públicas pendientes
function contarSolicitudesPendientes() {
    cargarDatosDesdeAPI('cotizaciones').then(cotizaciones => {
        const solicitudesPendientes = cotizaciones.filter(cot => 
            cot.esSolicitudPublica || cot.estado === 'solicitud_publica'
        ).length;
        
        if (solicitudesPendientes > 0) {
            // Agregar badge al tab de historial
            const tabHistorial = document.querySelector('.tab[onclick="showTab(\'historial\')"]');
            if (tabHistorial && !tabHistorial.querySelector('.badge-solicitudes')) {
                const badge = document.createElement('span');
                badge.className = 'badge-solicitudes';
                badge.innerHTML = solicitudesPendientes;
                badge.style.cssText = `
                    background: #dc3545; 
                    color: white; 
                    border-radius: 50%; 
                    padding: 2px 6px; 
                    font-size: 0.7rem; 
                    margin-left: 5px;
                    animation: pulse 2s infinite;
                `;
                tabHistorial.appendChild(badge);
                
                // Agregar animación CSS si no existe
                if (!document.getElementById('pulseAnimation')) {
                    const style = document.createElement('style');
                    style.id = 'pulseAnimation';
                    style.textContent = `
                        @keyframes pulse {
                            0% { transform: scale(1); }
                            50% { transform: scale(1.1); }
                            100% { transform: scale(1); }
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
        }
    });
}

// FUNCIONES DEL SISTEMA DE VERSIONES
function mostrarHistorialVersiones(cotizacionId) {
    cargarDatosDesdeAPI('cotizaciones').then(cotizaciones => {
        const cotizacion = cotizaciones.find(cot => cot.id === cotizacionId);
        
        if (!cotizacion) {
            mostrarAlerta('alertVersiones', 'Cotización no encontrada.', 'error');
            return;
        }

        cotizacionSeleccionada = cotizacion;
        
        const container = document.getElementById('historialVersiones');
        
        if (!cotizacion.versiones || cotizacion.versiones.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #6c757d;">
                    <p>Esta cotización no tiene historial de versiones.</p>
                    <button class="btn" onclick="migrarCotizacionAVersiones(${cotizacionId})" style="background: #28a745; color: white;">
                        📝 Crear Sistema de Versiones
                    </button>
                </div>
            `;
            return;
        }

        let html = `
            <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <h4 style="color: #28a745; margin: 0;">📋 ${cotizacion.cliente.nombre} - ${cotizacion.cliente.fechaEvento}</h4>
                <div style="display: flex; gap: 10px;">
                    <button class="btn" onclick="editarCotizacionParaNuevaVersion(${cotizacionId})" style="background: #007bff; color: white;">
                        ✏️ Editar (Nueva Versión)
                    </button>
                    <button class="btn" onclick="cerrarHistorialVersiones()" style="background: #6c757d; color: white;">
                        ❌ Cerrar
                    </button>
                </div>
            </div>
            
            <div style="display: grid; gap: 15px;">
        `;

        const versionesOrdenadas = cotizacion.versiones.slice().sort((a, b) => b.version - a.version);
        
        versionesOrdenadas.forEach(version => {
            const fechaFormateada = new Date(version.fecha).toLocaleString();
            const esVersionActual = version.version === cotizacion.versionActual;
            
            html += `
                <div style="background: white; border-radius: 10px; border: 2px solid ${esVersionActual ? '#28a745' : '#dee2e6'}; padding: 20px; position: relative;">
                    ${esVersionActual ? `
                        <div style="position: absolute; top: -10px; right: 15px; background: #28a745; color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.8rem; font-weight: 600;">
                            ACTUAL
                        </div>
                    ` : ''}
                    
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <div>
                            <h5 style="color: #2c3e50; margin: 0 0 5px 0;">
                                🔄 Versión ${version.version}
                                ${esVersionActual ? ' (Actual)' : ''}
                            </h5>
                            <p style="margin: 0; color: #6c757d; font-size: 0.9rem;">
                                ${version.descripcion}
                            </p>
                            <small style="color: #6c757d;">
                                📅 ${fechaFormateada}
                            </small>
                        </div>
                        
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button class="btn" onclick="verDetalleVersion(${cotizacionId}, ${version.version})" style="font-size: 0.8rem; padding: 6px 10px; background: #17a2b8; color: white;">
                                👁️ Ver
                            </button>
                            <button class="btn" onclick="compararVersion(${cotizacionId}, ${version.version})" style="font-size: 0.8rem; padding: 6px 10px; background: #ffc107; color: black;">
                                ⚖️ Comparar
                            </button>
                            ${!esVersionActual ? `
                                <button class="btn" onclick="restaurarVersion(${cotizacionId}, ${version.version})" style="font-size: 0.8rem; padding: 6px 10px; background: #28a745; color: white;">
                                    🔄 Restaurar
                                </button>
                                <button class="btn" onclick="crearRamaDesdeVersion(${cotizacionId}, ${version.version})" style="font-size: 0.8rem; padding: 6px 10px; background: #6f42c1; color: white;">
                                    🌿 Crear Rama
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; font-size: 0.9rem;">
                        <div style="background: #f8f9fa; padding: 10px; border-radius: 8px;">
                            <strong>Total:</strong> $${version.datos.totales?.subtotal?.toFixed(2) || '0.00'}
                        </div>
                        <div style="background: #f8f9fa; padding: 10px; border-radius: 8px;">
                            <strong>Productos:</strong> ${version.datos.productos?.length || 0}
                        </div>
                        <div style="background: #f8f9fa; padding: 10px; border-radius: 8px;">
                            <strong>Estado:</strong> ${getEstadoNombre(version.datos.estado)}
                        </div>
                        <div style="background: #f8f9fa; padding: 10px; border-radius: 8px;">
                            <strong>Personas:</strong> ${version.datos.cliente?.cantidadPersonas || 0}
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    });
}

function getEstadoNombre(estadoId) {
    const estado = estadosCotizacion.find(est => est.id === estadoId);
    return estado ? `${estado.icono} ${estado.nombre}` : '❓ Sin estado';
}

function cerrarHistorialVersiones() {
    const container = document.getElementById('historialVersiones');
    container.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">Selecciona una cotización de la tabla para ver su historial de versiones.</p>';
    cotizacionSeleccionada = null;
}

function migrarCotizacionAVersiones(cotizacionId) {
    cargarDatosDesdeAPI('cotizaciones').then(cotizaciones => {
        const index = cotizaciones.findIndex(cot => cot.id === cotizacionId);
        
        if (index === -1) return;
        
        const cotizacion = cotizaciones[index];
        
        const fechaOriginal = new Date(cotizacion.fechaCotizacion + 'T00:00:00');
        const fechaHora = `${fechaOriginal.toLocaleDateString()} ${fechaOriginal.toLocaleTimeString()}`;
        
        const datosOriginales = copiarProfundo(cotizacion);
        delete datosOriginales.versiones;
        delete datosOriginales.versionActual;
        
        cotizacion.versiones = [{
            version: 1,
            fecha: fechaOriginal.toISOString(),
            datos: datosOriginales,
            descripcion: `v1 - ${fechaHora} (migrada)`
        }];
        cotizacion.versionActual = 1;
        
        guardarDatosEnAPI('cotizaciones', cotizaciones);
        
        mostrarHistorialVersiones(cotizacionId);
        mostrarAlerta('alertVersiones', 'Sistema de versiones creado exitosamente.', 'success');
    });
}

function editarCotizacionParaNuevaVersion(cotizacionId) {
    cargarDatosDesdeAPI('cotizaciones').then(cotizaciones => {
        const cotizacion = cotizaciones.find(cot => cot.id === cotizacionId);
        
        if (!cotizacion) {
            mostrarAlerta('alertVersiones', 'Cotización no encontrada.', 'error');
            return;
        }
        
        cotizacionEditando = cotizacion;
        cargarDatosCotizacion(cotizacion);
        showTab('cotizador');
        
        const proximaVersion = Math.max(...cotizacion.versiones.map(v => v.version)) + 1;
        const fechaHora = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
        
        const indicador = document.getElementById('indicadorVersion');
        const nombreVersion = document.getElementById('nombreVersionEditando');
        
        if (indicador) indicador.style.display = 'block';
        if (nombreVersion) nombreVersion.textContent = `v${proximaVersion} - ${fechaHora}`;
        
        document.getElementById('tituloCotizador').textContent = 'Editando Cotización (Nueva Versión)';
    });
}

function verDetalleVersion(cotizacionId, numeroVersion) {
    cargarDatosDesdeAPI('cotizaciones').then(cotizaciones => {
        const cotizacion = cotizaciones.find(cot => cot.id === cotizacionId);
        
        if (!cotizacion) return;
        
        const version = cotizacion.versiones.find(v => v.version === numeroVersion);
        if (!version) return;
        
        const modalHtml = `
            <div id="modalVersionDetalle" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; display: flex; align-items: center; justify-content: center;" onclick="cerrarModalVersion()">
                <div style="background: white; border-radius: 15px; padding: 30px; max-width: 800px; max-height: 90vh; overflow-y: auto; margin: 20px;" onclick="event.stopPropagation()">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #28a745; padding-bottom: 15px;">
                        <h3 style="color: #28a745; margin: 0;">🔄 Versión ${version.version} - ${version.descripcion}</h3>
                        <button onclick="cerrarModalVersion()" style="background: #dc3545; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">×</button>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <strong>📅 Fecha de creación:</strong> ${new Date(version.fecha).toLocaleString()}
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                            <strong>Cliente:</strong><br>${version.datos.cliente?.nombre || 'N/A'}
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                            <strong>Estado:</strong><br>${getEstadoNombre(version.datos.estado)}
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                            <strong>Personas:</strong><br>${version.datos.cliente?.cantidadPersonas || 0}
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                            <strong>Total:</strong><br><span style="color: #28a745; font-weight: 700; font-size: 1.2rem;">$${version.datos.totales?.subtotal?.toFixed(2) || '0.00'}</span>
                        </div>
                    </div>

                    <h4 style="color: #2c3e50; margin-bottom: 15px;">Productos en esta versión:</h4>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${version.datos.productos?.map(p => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; margin-bottom: 10px; border-radius: 8px;">
                                <div>
                                    <strong>${p.nombre}</strong>
                                    <br><small style="color: #6c757d;">Cantidad: ${p.cantidad}</small>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-weight: 600; color: #28a745;">$${p.subtotal?.toFixed(2) || '0.00'}</div>
                                    <small style="color: #6c757d;">$${p.precio?.toFixed(2) || '0.00'} c/u</small>
                                </div>
                            </div>
                        `).join('') || '<p style="text-align: center; color: #6c757d;">No hay productos en esta versión</p>'}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    });
}

function cerrarModalVersion() {
    const modal = document.getElementById('modalVersionDetalle');
    if (modal) {
        modal.remove();
    }
}

function compararVersion(cotizacionId, numeroVersion) {
    cargarDatosDesdeAPI('cotizaciones').then(cotizaciones => {
        const cotizacion = cotizaciones.find(cot => cot.id === cotizacionId);
        
        if (!cotizacion) return;
        
        const versionAnterior = cotizacion.versiones.find(v => v.version === numeroVersion);
        const versionActual = cotizacion.versiones.find(v => v.version === cotizacion.versionActual);
        
        if (!versionAnterior || !versionActual) return;
        
        function generarResumenProductos(productos) {
            if (!productos || productos.length === 0) {
                return '<p style="color: #6c757d; font-style: italic;">Sin productos</p>';
            }
            
            return productos.map(p => `
                <div style="display: flex; justify-content: space-between; padding: 8px; background: #f8f9fa; margin-bottom: 5px; border-radius: 5px; font-size: 0.9rem;">
                    <span><strong>${p.nombre}</strong> (x${p.cantidad})</span>
                    <span style="color: #28a745; font-weight: 600;">$${p.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
            `).join('');
        }
        
        const modalHtml = `
            <div id="modalComparacion" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; display: flex; align-items: center; justify-content: center;" onclick="cerrarModalComparacion()">
                <div style="background: white; border-radius: 15px; padding: 30px; max-width: 1200px; max-height: 90vh; overflow-y: auto; margin: 20px; width: 95%;" onclick="event.stopPropagation()">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #ffc107; padding-bottom: 15px;">
                        <h3 style="color: #ffc107; margin: 0;">⚖️ Comparación Detallada de Versiones</h3>
                        <button onclick="cerrarModalComparacion()" style="background: #dc3545; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">×</button>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div style="border: 2px solid #dc3545; border-radius: 10px; padding: 15px;">
                            <h4 style="color: #dc3545; margin-top: 0;">📋 Versión ${versionAnterior.version} - ${versionAnterior.descripcion}</h4>
                            
                            <div style="background: #fff5f5; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                                <p><strong>📅 Fecha:</strong> ${new Date(versionAnterior.fecha).toLocaleString()}</p>
                                <p><strong>👤 Cliente:</strong> ${versionAnterior.datos.cliente?.nombre || 'N/A'}</p>
                                <p><strong>📊 Estado:</strong> ${getEstadoNombre(versionAnterior.datos.estado)}</p>
                                <p><strong>👥 Personas:</strong> ${versionAnterior.datos.cliente?.cantidadPersonas || 0}</p>
                            </div>
                            
                            <div style="background: #fff5f5; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                                <h5 style="color: #dc3545; margin-top: 0;">💰 Totales:</h5>
                                <p><strong>Subtotal:</strong> $${versionAnterior.datos.totales?.subtotal?.toFixed(2) || '0.00'}</p>
                                <p><strong>Costo:</strong> $${versionAnterior.datos.totales?.costoTotal?.toFixed(2) || '0.00'}</p>
                                <p><strong>Margen:</strong> $${versionAnterior.datos.totales?.margenTotal?.toFixed(2) || '0.00'}</p>
                            </div>
                            
                            <div style="margin-bottom: 15px;">
                                <h5 style="color: #dc3545; margin-bottom: 10px;">🍽️ Productos (${versionAnterior.datos.productos?.length || 0}):</h5>
                                <div style="max-height: 200px; overflow-y: auto;">
                                    ${generarResumenProductos(versionAnterior.datos.productos)}
                                </div>
                            </div>
                        </div>
                        
                        <div style="border: 2px solid #28a745; border-radius: 10px; padding: 15px;">
                            <h4 style="color: #28a745; margin-top: 0;">📋 Versión ${versionActual.version} - ${versionActual.descripcion} (Actual)</h4>
                            
                            <div style="background: #f0fff4; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                                <p><strong>📅 Fecha:</strong> ${new Date(versionActual.fecha).toLocaleString()}</p>
                                <p><strong>👤 Cliente:</strong> ${versionActual.datos.cliente?.nombre || 'N/A'}</p>
                                <p><strong>📊 Estado:</strong> ${getEstadoNombre(versionActual.datos.estado)}</p>
                                <p><strong>👥 Personas:</strong> ${versionActual.datos.cliente?.cantidadPersonas || 0}</p>
                            </div>
                            
                            <div style="background: #f0fff4; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                                <h5 style="color: #28a745; margin-top: 0;">💰 Totales:</h5>
                                <p><strong>Subtotal:</strong> $${versionActual.datos.totales?.subtotal?.toFixed(2) || '0.00'}</p>
                                <p><strong>Costo:</strong> $${versionActual.datos.totales?.costoTotal?.toFixed(2) || '0.00'}</p>
                                <p><strong>Margen:</strong> $${versionActual.datos.totales?.margenTotal?.toFixed(2) || '0.00'}</p>
                            </div>
                            
                            <div style="margin-bottom: 15px;">
                                <h5 style="color: #28a745; margin-bottom: 10px;">🍽️ Productos (${versionActual.datos.productos?.length || 0}):</h5>
                                <div style="max-height: 200px; overflow-y: auto;">
                                    ${generarResumenProductos(versionActual.datos.productos)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    });
}

function cerrarModalComparacion() {
    const modal = document.getElementById('modalComparacion');
    if (modal) {
        modal.remove();
    }
}

function restaurarVersion(cotizacionId, numeroVersion) {
    if (!confirm(`¿Estás seguro de restaurar la versión ${numeroVersion}? Esto creará una nueva versión con los datos de la versión seleccionada.`)) {
        return;
    }
    
    cargarDatosDesdeAPI('cotizaciones').then(cotizaciones => {
        const index = cotizaciones.findIndex(cot => cot.id === cotizacionId);
        
        if (index === -1) return;
        
        const cotizacion = cotizaciones[index];
        const versionARestaurar = cotizacion.versiones.find(v => v.version === numeroVersion);
        
        if (!versionARestaurar) return;
        
        const fechaHora = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
        const siguienteVersion = Math.max(...cotizacion.versiones.map(v => v.version)) + 1;
        
        const datosRestaurados = copiarProfundo(versionARestaurar.datos);
        delete datosRestaurados.versiones;
        delete datosRestaurados.versionActual;
        
        cotizacion.versiones.push({
            version: siguienteVersion,
            fecha: new Date().toISOString(),
            datos: datosRestaurados,
            descripcion: `v${siguienteVersion} - ${fechaHora} (restaurada desde v${numeroVersion})`
        });
        cotizacion.versionActual = siguienteVersion;
        
        Object.assign(cotizacion, datosRestaurados);
        cotizacion.versiones = cotizacion.versiones;
        cotizacion.versionActual = siguienteVersion;
        
        guardarDatosEnAPI('cotizaciones', cotizaciones);
        
        mostrarHistorialVersiones(cotizacionId);
        mostrarAlerta('alertVersiones', `Versión ${numeroVersion} restaurada como versión ${siguienteVersion}.`, 'success');
    });
}

function crearRamaDesdeVersion(cotizacionId, numeroVersion) {
    const descripcion = prompt(`Ingresa una descripción para la nueva rama basada en la versión ${numeroVersion}:`);
    if (!descripcion) return;
    
    cargarDatosDesdeAPI('cotizaciones').then(cotizaciones => {
        const cotizacion = cotizaciones.find(cot => cot.id === cotizacionId);
        
        if (!cotizacion) return;
        
        const versionBase = cotizacion.versiones.find(v => v.version === numeroVersion);
        if (!versionBase) return;
        
        const nuevaCotizacion = copiarProfundo(versionBase.datos);
        nuevaCotizacion.id = Date.now();
        nuevaCotizacion.fechaCotizacion = new Date().toLocaleDateString();
        nuevaCotizacion.cliente = {
            ...nuevaCotizacion.cliente,
            nombre: nuevaCotizacion.cliente.nombre + ` (Rama v${numeroVersion})`
        };
        
        cotizacionActual = nuevaCotizacion;
        
        showTab('cotizador');
        
        mostrarResumenCotizacion();
        
        mostrarAlerta('alertCotizacion', `Rama creada desde versión ${numeroVersion}. Puedes modificar y guardar como nueva cotización.`, 'success');
    });
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando aplicación del cotizador...');
    
    // Función asíncrona para inicializar datos
    const inicializarDatos = async () => {
        try {
            await cargarCategorias();
            await cargarEstados();
            await cargarExperiencias();
            await cargarMotivos();
            await cargarCamposPersonalizados();
            await cargarPoliticas();
            await cargarPlantilla();
            await cargarProductos();
            
            // Actualizar interfaces después de cargar datos
            actualizarSelectCategorias();
            actualizarSelectEstados();
            actualizarListaCategorias();
            actualizarListaEstados();
            actualizarListaExperiencias();
            actualizarListaMotivos();
            actualizarListaCamposPersonalizados();
            actualizarListaProductos();
            actualizarMenuSelector();
            actualizarExperienciasCheckboxes();
            actualizarMotivosCheckboxes();
            generarCamposPersonalizadosEnCotizador();
            actualizarVariablesCamposPersonalizados();
            cargarHistorialCotizaciones();
            
            // Agregar eventos para actualización en tiempo real
            agregarEventosActualizacion();
            
            // Contar solicitudes pendientes
            setTimeout(contarSolicitudesPendientes, 1000);
            
            console.log('Aplicación inicializada correctamente');
        } catch (error) {
            console.error('Error inicializando aplicación:', error);
        }
    };
    
    // Ejecutar inicialización
    inicializarDatos();
});