<?php
/**
 * Template para el cotizador público (sin precios)
 */

// Evitar acceso directo
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="cotizador-publico-container">
    <div class="cotizador-publico-header">
        <h2><?php echo esc_html($atts['titulo']); ?></h2>
        <p><?php echo esc_html($atts['subtitulo']); ?></p>
    </div>

    <div class="container" style="background: rgba(255, 255, 255, 0.95); border-radius: 20px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); overflow: hidden; max-width: 1000px; margin: 20px auto; padding: 0;">
        
        <!-- Datos del Cliente -->
        <div class="categoria-section">
            <h3 class="categoria-title">📋 Datos del Cliente</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="nombreClientePublico">Nombre del Cliente:</label>
                    <input type="text" id="nombreClientePublico" placeholder="Nombre completo" required>
                </div>
                <div class="form-group">
                    <label for="emailClientePublico">Email de Contacto:</label>
                    <input type="email" id="emailClientePublico" placeholder="tu@email.com" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="telefonoClientePublico">Teléfono:</label>
                    <input type="tel" id="telefonoClientePublico" placeholder="Número de teléfono" required>
                </div>
                <div class="form-group">
                    <label for="fechaEventoPublico">Fecha del Evento:</label>
                    <input type="datetime-local" id="fechaEventoPublico" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="cantidadPersonasPublico">Cantidad de Personas:</label>
                    <input type="number" id="cantidadPersonasPublico" min="12" max="120" placeholder="12-55 sentados / 120 parados" required>
                </div>
                <div class="form-group">
                    <label for="formatoEventoPublico">Formato:</label>
                    <select id="formatoEventoPublico" required>
                        <option value="">Seleccionar formato</option>
                        <option value="sentado">Sentado (máx. 55)</option>
                        <option value="parado">Parado (máx. 120)</option>
                    </select>
                </div>
            </div>
            
            <!-- Campos personalizados se insertarán aquí -->
            <div id="camposPersonalizadosPublico"></div>
        </div>

        <!-- Motivo del Evento -->
        <div class="categoria-section">
            <h3 class="categoria-title">🎉 Motivo del Evento</h3>
            <div id="motivosCheckboxGroupPublico" class="checkbox-group">
                <!-- Se cargarán dinámicamente desde la gestión -->
            </div>
        </div>

        <!-- Experiencias -->
        <div class="categoria-section">
            <h3 class="categoria-title">🌟 Experiencias</h3>
            <div id="experienciasCheckboxGroupPublico" class="checkbox-group">
                <!-- Se cargarán dinámicamente desde la gestión -->
            </div>
        </div>

        <!-- Selección de Menú -->
        <div class="categoria-section">
            <h3 class="categoria-title">🍴 Selección de Menú</h3>
            <div id="menuSelectorPublico">
                <!-- Se cargará dinámicamente según los productos -->
            </div>
        </div>

        <!-- Comentarios adicionales -->
        <div class="categoria-section">
            <h3 class="categoria-title">💬 Comentarios Adicionales</h3>
            <div class="form-group">
                <label for="comentariosPublico">Comentarios o solicitudes especiales:</label>
                <textarea id="comentariosPublico" rows="4" placeholder="Describe cualquier solicitud especial, alergias, preferencias dietéticas, o detalles adicionales sobre tu evento..."></textarea>
            </div>
        </div>

        <!-- Botón de envío -->
        <div style="text-align: center; margin: 30px 0; padding: 20px;">
            <button class="btn" onclick="enviarSolicitudCotizacion()" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); font-size: 1.2rem; padding: 15px 40px;">
                📧 Enviar Solicitud de Cotización
            </button>
            <div style="margin-top: 15px; padding: 15px; background: #e3f2fd; border-radius: 10px; color: #1976d2; font-size: 0.9rem;">
                <strong>✨ Proceso Simple:</strong> Completa el formulario y recibirás tu cotización personalizada por email en menos de 24 horas
            </div>
        </div>

        <!-- Resumen de la solicitud -->
        <div id="resumenSolicitudPublico" style="display: none;">
            <!-- Se generará dinámicamente -->
        </div>

        <div id="alertCotizacionPublico"></div>
    </div>
</div>

<!-- Modal de confirmación -->
<div id="modalConfirmacionPublico" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; align-items: center; justify-content: center;">
    <div style="background: white; border-radius: 15px; padding: 30px; max-width: 500px; margin: 20px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 20px;">✅</div>
        <h3 style="color: #28a745; margin-bottom: 15px;">¡Solicitud Enviada!</h3>
        <p style="margin-bottom: 20px; color: #6c757d;">
            Hemos recibido tu solicitud de cotización. Te contactaremos por email en las próximas 24 horas con tu cotización personalizada.
        </p>
        <button class="btn" onclick="cerrarModalConfirmacion()" style="background: #28a745; color: white;">
            Perfecto, Gracias
        </button>
    </div>
</div>
