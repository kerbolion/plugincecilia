# Cotizador de Eventos Gastronómicos WP

Plugin completo de WordPress para gestión de cotizaciones de eventos gastronómicos con funcionalidad pública y administrativa.

## Características

### 🔧 Panel Administrativo (/app)
- **Gestión de Productos**: Crear, editar y organizar productos por categorías
- **Cotizador Completo**: Sistema de cotización con precios y márgenes
- **Historial de Cotizaciones**: Gestión completa con sistema de versiones
- **Gestión de Datos**: Configuración de experiencias, motivos, campos personalizados
- **Exportación/Importación**: Backup completo de datos

### 🌐 Cotizador Público (Shortcode)
- **Sin Precios**: Los visitantes pueden solicitar cotizaciones sin ver precios
- **Formulario Completo**: Misma funcionalidad que el admin pero orientado al cliente
- **Envío de Solicitudes**: Las solicitudes se guardan para revisión del administrador
- **Responsive**: Totalmente adaptado a dispositivos móviles

## Instalación

1. Copia la carpeta "nuevo plugin" a `/wp-content/plugins/`
2. Renombra la carpeta a `cotizador-eventos-wp`
3. Activa el plugin desde el panel de WordPress
4. ¡Listo para usar!

## Uso

### Panel Administrativo
- Accede a `tu-sitio.com/app` (requiere estar logueado)
- Configura productos, categorías y experiencias
- Crea cotizaciones completas con precios

### Cotizador Público
Usa el shortcode en cualquier página o entrada:

```
[cotizador_publico]
```

#### Personalización del Shortcode
```
[cotizador_publico titulo="Tu Título Personalizado" subtitulo="Tu subtítulo personalizado"]
```

**Atributos disponibles:**
- `titulo`: Título principal (por defecto: "Solicita tu Cotización")
- `subtitulo`: Subtítulo explicativo (por defecto: "Completa el formulario y te contactaremos con tu cotización personalizada")

## Ejemplos de Uso del Shortcode

### Básico
```
[cotizador_publico]
```

### Personalizado
```
[cotizador_publico titulo="Cotiza tu Evento Especial" subtitulo="Déjanos ayudarte a crear una experiencia gastronómica única"]
```

### En una página dedicada
Crea una nueva página en WordPress y agrega:
```
[cotizador_publico titulo="Solicita tu Cotización Gastronómica" subtitulo="Completa el formulario y recibe tu propuesta personalizada en 24 horas"]
```

## Funcionalidades del Cotizador Público

### ✅ Datos del Cliente
- Nombre completo
- Email de contacto
- Teléfono
- Fecha y hora del evento
- Cantidad de personas
- Formato (sentado/parado)

### ✅ Selección de Servicios
- **Motivos del Evento**: Cumpleaños, bodas, corporativo, etc.
- **Experiencias**: Cenas maridadas, finger food, show cooking, etc.
- **Menú**: Selección de productos por categorías (sin precios)

### ✅ Campos Personalizados
- Los campos configurados en el admin aparecen automáticamente
- Validación de campos requeridos
- Diferentes tipos: texto, número, fecha, checkbox, desplegable

### ✅ Comentarios Adicionales
- Campo libre para solicitudes especiales
- Alergias y preferencias dietéticas
- Detalles específicos del evento

## Gestión de Solicitudes

Las solicitudes del cotizador público se guardan en la base de datos de WordPress en la tabla `wp_cotizador_eventos_data` y pueden ser gestionadas desde el panel administrativo.

### Base de Datos

El plugin crea automáticamente una tabla en WordPress:

**Tabla:** `wp_cotizador_eventos_data`
- `id`: ID único del registro
- `user_id`: ID del usuario (0 para solicitudes públicas)
- `data_type`: Tipo de datos (productos, categorias, experiencias, etc.)
- `data_content`: Contenido JSON de los datos
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

### API REST

El plugin proporciona endpoints REST para gestionar los datos:

- `GET /wp-json/cotizador-eventos/v1/data/{type}` - Obtener datos del usuario
- `POST /wp-json/cotizador-eventos/v1/data/{type}` - Guardar datos del usuario
- `DELETE /wp-json/cotizador-eventos/v1/data/{type}` - Eliminar datos del usuario
- `POST /wp-json/cotizador-eventos/v1/solicitud-publica` - Enviar solicitud pública (sin autenticación)

### Estructura de Datos de Solicitud
```javascript
{
  cliente: {
    nombre: "Nombre del cliente",
    email: "email@ejemplo.com",
    telefono: "123456789",
    fechaEvento: "2024-01-15 19:00",
    cantidadPersonas: 50,
    formatoEvento: "sentado"
  },
  motivos: ["Cumpleaños", "Celebración Especial"],
  experiencias: ["Cena Maridada", "Show Cooking"],
  productos: [
    {
      nombre: "Entrada de Salmón",
      descripcion: "Salmón ahumado con...",
      categoria: "entrada",
      cantidad: 50
    }
  ],
  camposPersonalizados: {
    "Dirección del evento": "Calle 123, Ciudad",
    "Hora preferida": "19:00"
  },
  comentarios: "Sin gluten para 3 personas",
  fechaSolicitud: "2024-01-10 14:30:00"
}
```

## Personalización de Estilos

El plugin usa los mismos estilos que el sistema administrativo. Para personalizar:

1. **CSS Personalizado**: Agrega CSS personalizado en tu tema
2. **Clases Disponibles**:
   - `.cotizador-publico-container`: Contenedor principal
   - `.categoria-section`: Secciones del formulario
   - `.checkbox-item`: Items seleccionables
   - `.menu-selector`: Selector de menú

## Compatibilidad

- ✅ WordPress 5.0+
- ✅ PHP 7.4+
- ✅ Responsive Design
- ✅ Compatible con la mayoría de temas
- ✅ Funciona con constructores de páginas (Elementor, Gutenberg, etc.)

## Soporte

Para soporte técnico o personalizaciones adicionales, contacta al desarrollador.

## Changelog

### v1.0.0
- Lanzamiento inicial
- Panel administrativo completo
- Shortcode público funcional
- Sistema de gestión de solicitudes
- Responsive design
