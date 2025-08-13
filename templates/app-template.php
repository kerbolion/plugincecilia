<?php
/**
 * Template para la aplicación del Cotizador de Eventos
 */

// Evitar acceso directo
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="container">
    <div class="header no-print">
        <h1>🍽️ Cotizador de Eventos</h1>
        <p>Gestión integral de productos y cotizaciones gastronómicas</p>
    </div>

    <div class="tabs no-print">
        <button class="tab active" onclick="showTab('productos')">📦 Productos</button>
        <button class="tab" onclick="showTab('cotizador')">💰 Cotizador</button>
        <button class="tab" onclick="showTab('historial')">📋 Historial</button>
        <button class="tab" onclick="showTab('gestiones')">⚙️ Gestiones</button>
    </div>

    <!-- TAB PRODUCTOS -->
    <div id="productos" class="tab-content active">
        <h2>Gestión de Productos</h2>
        
        <div class="form-row">
            <div class="form-group">
                <label for="nombreProducto">Nombre del Producto:</label>
                <input type="text" id="nombreProducto" placeholder="Ej: Entrada de salmón">
            </div>
            <div class="form-group">
                <label for="categoriaProducto">Categoría:</label>
                <select id="categoriaProducto">
                    <!-- Las categorías se cargarán dinámicamente -->
                </select>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="costoProducto">Costo ($):</label>
                <input type="number" id="costoProducto" step="0.01" placeholder="0.00">
            </div>
            <div class="form-group">
                <label for="precioProducto">Precio Final ($):</label>
                <input type="number" id="precioProducto" step="0.01" placeholder="0.00">
            </div>
        </div>

        <div class="form-group">
            <label for="descripcionProducto">Descripción:</label>
            <textarea id="descripcionProducto" rows="3" placeholder="Descripción del producto..."></textarea>
        </div>

        <button class="btn" onclick="agregarProducto()">➕ Agregar Producto</button>
        <button class="btn btn-danger" onclick="limpiarProductos()">🗑️ Limpiar Todo</button>

        <div id="alertProductos"></div>

        <!-- Gestión de Categorías -->
        <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-bottom: 20px;">📁 Gestión de Categorías</h3>
            
            <div class="form-row">
                <div class="form-group" style="flex: 1;">
                    <label for="nuevaCategoria">Nueva Categoría:</label>
                    <div style="display: flex; gap: 10px; align-items: end;">
                        <input type="text" id="nuevaCategoria" placeholder="Nombre de la categoría" style="flex: 1;">
                        <input type="text" id="iconoCategoria" placeholder="🍽️" style="width: 60px; text-align: center;" maxlength="2">
                        <button class="btn" onclick="agregarCategoria()" style="background: #28a745; color: white;">➕ Agregar</button>
                    </div>
                    <small style="color: #6c757d; margin-top: 5px; display: block;">Ingresa el nombre y opcionalmente un emoji para la categoría</small>
                </div>
            </div>

            <div id="alertCategorias" style="margin: 15px 0;"></div>

            <div id="listaCategorias" style="margin-top: 20px;">
                <!-- Las categorías se cargarán aquí -->
            </div>
        </div>

        <div id="listaProductos" class="productos-grid">
            <!-- Los productos se cargarán aquí -->
        </div>
    </div>

    <!-- TAB COTIZADOR -->
    <div id="cotizador" class="tab-content">
        <h2 id="tituloCotizador" class="no-print">Nueva Cotización</h2>
        
        <!-- Indicador de versión cuando se está editando -->
        <div id="indicadorVersion" class="no-print" style="display: none; margin: 20px 0; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; text-align: center;">
            <h3 style="margin: 0; color: white;">✏️ Editando Cotización</h3>
            <p style="margin: 5px 0 0 0; font-size: 1.1rem;" id="nombreVersionEditando"></p>
        </div>

        <!-- Datos del Cliente -->
        <div class="categoria-section no-print">
            <h3 class="categoria-title">📋 Datos del Cliente</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="nombreCliente">Nombre del Cliente:</label>
                    <input type="text" id="nombreCliente" placeholder="Nombre completo">
                </div>
                <div class="form-group">
                    <label for="emailCliente">Email de Contacto:</label>
                    <input type="email" id="emailCliente" placeholder="tu@email.com">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="telefonoCliente">Teléfono:</label>
                    <input type="tel" id="telefonoCliente" placeholder="Número de teléfono">
                </div>
                <div class="form-group">
                    <label for="fechaEvento">Fecha del Evento:</label>
                    <input type="datetime-local" id="fechaEvento">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="cantidadPersonas">Cantidad de Personas:</label>
                    <input type="number" id="cantidadPersonas" min="12" max="120" placeholder="12-55 sentados / 120 parados">
                </div>
                <div class="form-group">
                    <label for="formatoEvento">Formato:</label>
                    <select id="formatoEvento">
                        <option value="sentado">Sentado (máx. 55)</option>
                        <option value="parado">Parado (máx. 120)</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="estadoCotizacion">Estado de la Cotización:</label>
                    <select id="estadoCotizacion">
                        <!-- Los estados se cargarán dinámicamente -->
                    </select>
                </div>
            </div>
            
            <!-- Campos personalizados se insertarán aquí -->
            <div id="camposPersonalizados"></div>
        </div>

        <!-- Motivo del Evento -->
        <div class="categoria-section no-print">
            <h3 class="categoria-title">🎉 Motivo del Evento</h3>
            <div id="motivosCheckboxGroup" class="checkbox-group">
                <!-- Se cargarán dinámicamente desde la gestión -->
            </div>
        </div>

        <!-- Experiencias -->
        <div class="categoria-section no-print">
            <h3 class="categoria-title">🌟 Experiencias</h3>
            <div id="experienciasCheckboxGroup" class="checkbox-group">
                <!-- Se cargarán dinámicamente desde la gestión -->
            </div>
        </div>

        <!-- Selección de Menú -->
        <div class="categoria-section no-print">
            <h3 class="categoria-title">🍴 Selección de Menú</h3>
            <div id="menuSelector">
                <!-- Se cargará dinámicamente según los productos -->
            </div>
        </div>

        <!-- ELIMINAR BOTONES DE GENERAR Y LIMPIAR YA QUE SERÁ AUTOMÁTICO -->
        <div class="no-print" style="text-align: center; margin: 20px 0;">
            <button class="btn" onclick="limpiarCotizacion()">🔄 Limpiar Formulario</button>
            <div style="margin-top: 10px; padding: 15px; background: #e3f2fd; border-radius: 10px; color: #1976d2; font-size: 0.9rem;">
                <strong>✨ Actualización en Tiempo Real:</strong> El resumen se actualiza automáticamente mientras completas los datos
            </div>
        </div>

        <!-- Resumen de Cotización -->
        <div id="resumenCotizacion" style="display: none;">
            <!-- Se generará dinámicamente en tiempo real -->
        </div>

        <div id="alertCotizacion" class="no-print"></div>
    </div>

    <!-- TAB HISTORIAL -->
    <div id="historial" class="tab-content">
        <h2>Historial de Cotizaciones</h2>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="text" id="buscarCotizacion" placeholder="Buscar por cliente..." style="width: 250px;">
                <button class="btn" onclick="buscarCotizaciones()">🔍 Buscar</button>
                <button class="btn" onclick="mostrarTodasCotizaciones()">📋 Mostrar Todas</button>
            </div>
            <div>
                <button class="btn btn-success" onclick="exportarCotizaciones()">📤 Exportar Todo</button>
                <button class="btn" onclick="exportarBaseDatos()">💾 Exportar BD</button>
                <button class="btn" onclick="importarBaseDatos()">📥 Importar BD</button>
                <button class="btn btn-danger" onclick="limpiarHistorial()">🗑️ Limpiar Historial</button>
            </div>
        </div>

        <div id="alertHistorial"></div>

        <div id="tablaCotizaciones">
            <!-- Se cargará dinámicamente -->
        </div>

        <!-- Historial de Versiones -->
        <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-bottom: 20px;">🔄 Historial de Versiones</h3>
            
            <div style="margin-bottom: 20px; padding: 15px; background: #d1ecf1; border-radius: 8px; color: #0c5460;">
                <strong>💡 Sistema de Versiones:</strong> Cada cambio que realizas guarda automáticamente una nueva versión con fecha y hora. Puedes comparar, restaurar o crear ramas desde cualquier versión anterior.
            </div>

            <div id="alertVersiones" style="margin: 15px 0;"></div>

            <div id="historialVersiones" style="margin-top: 20px;">
                <!-- El historial de versiones se cargará aquí -->
            </div>
        </div>

        <!-- Gestión de Estados -->
        <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #007bff;">
            <h3 style="color: #007bff; margin-bottom: 20px;">📊 Gestión de Estados de Cotización</h3>
            
            <div class="form-row">
                <div class="form-group" style="flex: 1;">
                    <label for="nuevoEstado">Nuevo Estado:</label>
                    <div style="display: flex; gap: 10px; align-items: end;">
                        <input type="text" id="nuevoEstado" placeholder="Nombre del estado" style="flex: 1;">
                        <input type="text" id="iconoEstado" placeholder="📋" style="width: 60px; text-align: center;" maxlength="2">
                        <input type="color" id="colorEstado" value="#6c757d" style="width: 60px; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                        <button class="btn" onclick="agregarEstado()" style="background: #007bff; color: white;">➕ Agregar</button>
                    </div>
                    <small style="color: #6c757d; margin-top: 5px; display: block;">Ingresa el nombre, emoji y color para el estado</small>
                </div>
            </div>

            <div id="alertEstados" style="margin: 15px 0;"></div>

            <div id="listaEstados" style="margin-top: 20px;">
                <!-- Los estados se cargarán aquí -->
            </div>
        </div>
    </div>

    <!-- TAB GESTIONES -->
    <div id="gestiones" class="tab-content">
        <h2>Gestión de Datos del Sistema</h2>
        
        <!-- Gestión de Datos del Cliente -->
        <div style="margin-bottom: 40px; padding: 20px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #17a2b8;">
            <h3 style="color: #17a2b8; margin-bottom: 20px;">📋 Gestión de Datos del Cliente</h3>
            
            <div style="margin-bottom: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px; color: #1976d2;">
                <strong>💡 Campos Personalizados:</strong> Agrega campos adicionales que aparecerán en la sección "Datos del Cliente" del cotizador y estarán disponibles como variables en las plantillas de descarga.
            </div>
            
            <div class="form-row">
                <div class="form-group" style="flex: 2;">
                    <label for="nombreCampo">Nombre del Campo:</label>
                    <input type="text" id="nombreCampo" placeholder="Ej: Dirección del evento">
                </div>
                <div class="form-group">
                    <label for="tipoCampo">Tipo de Campo:</label>
                    <select id="tipoCampo">
                        <option value="texto">📝 Texto</option>
                        <option value="numero">🔢 Número</option>
                        <option value="fecha">📅 Fecha</option>
                        <option value="hora">🕐 Hora</option>
                        <option value="checkbox">☑️ Checkbox</option>
                        <option value="desplegable">📋 Desplegable</option>
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="placeholderCampo">Placeholder/Ayuda:</label>
                    <input type="text" id="placeholderCampo" placeholder="Texto de ayuda para el usuario">
                </div>
                <div class="form-group">
                    <label for="requeridoCampo">¿Campo Requerido?</label>
                    <select id="requeridoCampo">
                        <option value="false">No</option>
                        <option value="true">Sí</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group" id="opcionesDesplegableContainer" style="display: none;">
                <label for="opcionesDesplegable">Opciones del Desplegable:</label>
                <textarea id="opcionesDesplegable" rows="3" placeholder="Escribe cada opción en una línea separada&#10;Opción 1&#10;Opción 2&#10;Opción 3"></textarea>
                <small style="color: #6c757d; margin-top: 5px; display: block;">Una opción por línea</small>
            </div>

            <div style="margin-top: 15px;">
                <button class="btn" onclick="agregarCampoPersonalizado()" style="background: #17a2b8; color: white;">➕ Agregar Campo</button>
                <button class="btn" onclick="limpiarFormularioCampo()" style="background: #6c757d; color: white;">🔄 Limpiar</button>
            </div>

            <div id="alertCamposPersonalizados" style="margin: 15px 0;"></div>

            <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; color: #856404;">
                <strong>📝 Variables Disponibles:</strong><br>
                Los campos personalizados estarán disponibles en las plantillas como <code>[nombre_del_campo]</code><br>
                Ejemplo: Si creas un campo "Dirección del evento", la variable será <code>[direccion_del_evento]</code>
            </div>

            <div id="listaCamposPersonalizados" style="margin-top: 20px;">
                <!-- Los campos personalizados se cargarán aquí -->
            </div>
        </div>
        
        <!-- Gestión de Experiencias -->
        <div style="margin-bottom: 40px; padding: 20px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-bottom: 20px;">🌟 Gestión de Experiencias</h3>
            
            <div class="form-row">
                <div class="form-group" style="flex: 1;">
                    <label for="nuevaExperiencia">Nueva Experiencia:</label>
                    <div style="display: flex; gap: 10px; align-items: end; margin-bottom: 10px;">
                        <input type="text" id="nuevaExperiencia" placeholder="Nombre de la experiencia" style="flex: 1;">
                        <input type="text" id="iconoExperiencia" placeholder="🌟" style="width: 60px; text-align: center;" maxlength="2">
                        <button class="btn" onclick="agregarExperiencia()" style="background: #28a745; color: white;">➕ Agregar</button>
                    </div>
                    <textarea id="descripcionExperiencia" rows="2" placeholder="Descripción de la experiencia..." style="width: 100%;"></textarea>
                    <small style="color: #6c757d; margin-top: 5px; display: block;">Ingresa el nombre, emoji y descripción de la experiencia</small>
                </div>
            </div>

            <div id="alertExperiencias" style="margin: 15px 0;"></div>

            <div id="listaExperiencias" style="margin-top: 20px;">
                <!-- Las experiencias se cargarán aquí -->
            </div>
        </div>

        <!-- Gestión de Motivos del Evento -->
        <div style="margin-bottom: 40px; padding: 20px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #007bff;">
            <h3 style="color: #007bff; margin-bottom: 20px;">🎉 Gestión de Motivos del Evento</h3>
            
            <div class="form-row">
                <div class="form-group" style="flex: 1;">
                    <label for="nuevoMotivo">Nuevo Motivo:</label>
                    <div style="display: flex; gap: 10px; align-items: end; margin-bottom: 10px;">
                        <input type="text" id="nuevoMotivo" placeholder="Nombre del motivo" style="flex: 1;">
                        <input type="text" id="iconoMotivo" placeholder="🎉" style="width: 60px; text-align: center;" maxlength="2">
                        <button class="btn" onclick="agregarMotivo()" style="background: #007bff; color: white;">➕ Agregar</button>
                    </div>
                    <textarea id="descripcionMotivo" rows="2" placeholder="Descripción del motivo..." style="width: 100%;"></textarea>
                    <small style="color: #6c757d; margin-top: 5px; display: block;">Ingresa el nombre, emoji y descripción del motivo</small>
                </div>
            </div>

            <div id="alertMotivos" style="margin: 15px 0;"></div>

            <div id="listaMotivos" style="margin-top: 20px;">
                <!-- Los motivos se cargarán aquí -->
            </div>
        </div>

        <!-- Gestión de Políticas -->
        <div style="margin-bottom: 40px; padding: 20px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #dc3545;">
            <h3 style="color: #dc3545; margin-bottom: 20px;">📋 Gestión de Políticas</h3>
            
            <div class="form-group">
                <label for="politicas">Políticas de la Empresa:</label>
                <textarea id="politicas" rows="8" placeholder="Ingresa las políticas que aparecerán en las cotizaciones..." style="width: 100%;"></textarea>
                <small style="color: #6c757d; margin-top: 5px; display: block;">Este texto aparecerá al final de todas las cotizaciones descargadas y en el resumen para el cliente</small>
            </div>

            <div style="margin-top: 15px;">
                <button class="btn" onclick="guardarPoliticas()" style="background: #dc3545; color: white;">💾 Guardar Políticas</button>
            </div>

            <div id="alertPoliticas" style="margin: 15px 0;"></div>
        </div>

        <!-- Gestión de Plantilla de Descarga -->
        <div style="margin-bottom: 40px; padding: 20px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #6f42c1;">
            <h3 style="color: #6f42c1; margin-bottom: 20px;">📄 Gestión de Plantilla de Descarga</h3>
            
            <div style="margin-bottom: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px; color: #1976d2;">
                <strong>💡 Variables disponibles:</strong><br>
                <code>[cliente]</code> - Nombre del cliente<br>
                <code>[email]</code> - Email del cliente<br>
                <code>[telefono]</code> - Teléfono del cliente<br>
                <code>[fecha_evento]</code> - Fecha del evento<br>
                <code>[hora_evento]</code> - Hora del evento<br>
                <code>[personas]</code> - Cantidad de personas<br>
                <code>[formato]</code> - Formato del evento<br>
                <code>[estado]</code> - Estado de la cotización<br>
                <code>[motivos]</code> - Lista de motivos seleccionados<br>
                <code>[experiencias]</code> - Lista de experiencias seleccionadas<br>
                <code>[productos]</code> - Detalle de productos<br>
                <code>[total]</code> - Total de la cotización<br>
                <code>[costo_total]</code> - Costo total<br>
                <code>[margen]</code> - Margen de ganancia<br>
                <code>[porcentaje_margen]</code> - Porcentaje de margen<br>
                <code>[fecha_cotizacion]</code> - Fecha de creación<br>
                <code>[politicas]</code> - Políticas de la empresa<br>
                <span id="variablesCamposPersonalizados"></span>
            </div>
            
            <div class="form-group">
                <label for="plantillaDescarga">Plantilla de Descarga:</label>
                <textarea id="plantillaDescarga" rows="15" placeholder="Crea tu plantilla personalizada usando las variables..." style="width: 100%; font-family: 'Courier New', monospace;"></textarea>
                <small style="color: #6c757d; margin-top: 5px; display: block;">Usa las variables entre corchetes para personalizar la salida</small>
            </div>

            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button class="btn" onclick="guardarPlantilla()" style="background: #6f42c1; color: white;">💾 Guardar Plantilla</button>
                <button class="btn" onclick="restaurarPlantillaDefecto()" style="background: #6c757d; color: white;">🔄 Restaurar Defecto</button>
                <button class="btn" onclick="previsualizarPlantilla()" style="background: #17a2b8; color: white;">👁️ Vista Previa</button>
            </div>

            <div id="alertPlantilla" style="margin: 15px 0;"></div>
        </div>
    </div>
</div>