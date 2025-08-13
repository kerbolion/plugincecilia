<?php
/**
 * Plugin Name: Cotizador de Eventos Gastronómicos WP
 * Description: Sistema completo de cotización de eventos gastronómicos integrado para WordPress
 * Version: 1.0.0
 * Author: Tu Nombre
 * Text Domain: cotizador-eventos-wp
 * Domain Path: /languages
 */

// Evitar acceso directo
if (!defined('ABSPATH')) {
    exit;
}

// Definir constantes del plugin
define('COTIZADOR_EVENTOS_VERSION', '1.0.0');
define('COTIZADOR_EVENTOS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('COTIZADOR_EVENTOS_PLUGIN_URL', plugin_dir_url(__FILE__));

class CotizadorEventosWP {
    
    public function __construct() {
        register_activation_hook(__FILE__, array($this, 'activate_plugin'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate_plugin'));
        
        add_action('init', array($this, 'init_plugin'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('template_redirect', array($this, 'handle_app_route'));
        add_shortcode('cotizador_publico', array($this, 'shortcode_cotizador_publico'));
    }
    
    /**
     * Activación del plugin - crear tabla
     */
    public function activate_plugin() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'cotizador_eventos_data';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            data_type varchar(50) NOT NULL,
            data_content longtext NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX user_type_idx (user_id, data_type)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        // Agregar reglas de reescritura
        add_rewrite_rule('^app/?$', 'index.php?cotizador_eventos_app=1', 'top');
        flush_rewrite_rules();
        
        // Crear datos iniciales si el usuario admin no tiene
        if (is_user_logged_in()) {
            $this->create_initial_user_data();
        }
    }
    
    /**
     * Desactivación del plugin
     */
    public function deactivate_plugin() {
        flush_rewrite_rules();
    }
    
    /**
     * Inicializar plugin
     */
    public function init_plugin() {
        // Agregar query var
        add_filter('query_vars', array($this, 'add_query_vars'));
        
        // Agregar reglas de reescritura
        add_rewrite_rule('^app/?$', 'index.php?cotizador_eventos_app=1', 'top');
    }
    
    /**
     * Agregar variables de consulta
     */
    public function add_query_vars($vars) {
        $vars[] = 'cotizador_eventos_app';
        return $vars;
    }
    
    /**
     * Manejar ruta /app
     */
    public function handle_app_route() {
        if (get_query_var('cotizador_eventos_app')) {
            // Verificar que el usuario esté logueado
            if (!is_user_logged_in()) {
                wp_redirect(wp_login_url(home_url('/app')));
                exit;
            }
            
            // Cargar la plantilla de la app
            $this->load_app_template();
            exit;
        }
    }
    
    /**
     * Cargar plantilla de la aplicación
     */
    private function load_app_template() {
        ?>
        <!DOCTYPE html>
        <html <?php language_attributes(); ?>>
        <head>
            <meta charset="<?php bloginfo('charset'); ?>">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cotizador de Eventos - <?php bloginfo('name'); ?></title>
            <?php wp_head(); ?>
        </head>
        <body class="cotizador-eventos-app">
            <?php include COTIZADOR_EVENTOS_PLUGIN_DIR . 'templates/app-template.php'; ?>
            <?php wp_footer(); ?>
        </body>
        </html>
        <?php
    }
    
    /**
     * Encolar assets
     */
    public function enqueue_assets() {
        global $post;
        
        // Cargar assets para la ruta /app
        if (get_query_var('cotizador_eventos_app')) {
            // CSS - usando exactamente los mismos estilos del original
            wp_enqueue_style(
                'cotizador-eventos-styles', 
                COTIZADOR_EVENTOS_PLUGIN_URL . 'assets/css/styles.css', 
                array(), 
                COTIZADOR_EVENTOS_VERSION
            );
            
            // JavaScript - usando exactamente la misma funcionalidad del original
            wp_enqueue_script(
                'cotizador-eventos-script', 
                COTIZADOR_EVENTOS_PLUGIN_URL . 'assets/js/script.js', 
                array(), 
                COTIZADOR_EVENTOS_VERSION, 
                true
            );
            
            // Pasar datos de WordPress a JavaScript para el admin
            wp_localize_script('cotizador-eventos-script', 'cotizadorEventosWP', array(
                'restUrl' => rest_url('cotizador-eventos/v1/'),
                'nonce' => wp_create_nonce('wp_rest'),
                'currentUserId' => get_current_user_id(),
                'pluginUrl' => COTIZADOR_EVENTOS_PLUGIN_URL,
            ));
        }
        
        // Cargar assets para páginas que contengan el shortcode
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'cotizador_publico')) {
            // CSS
            wp_enqueue_style(
                'cotizador-eventos-publico-styles', 
                COTIZADOR_EVENTOS_PLUGIN_URL . 'assets/css/styles.css', 
                array(), 
                COTIZADOR_EVENTOS_VERSION
            );
            
            // JavaScript específico para cotizador público (sin precios)
            wp_enqueue_script(
                'cotizador-eventos-publico-script', 
                COTIZADOR_EVENTOS_PLUGIN_URL . 'assets/js/cotizador-publico.js', 
                array(), 
                COTIZADOR_EVENTOS_VERSION, 
                true
            );
            
            // Pasar datos de WordPress a JavaScript para el cotizador público
            wp_localize_script('cotizador-eventos-publico-script', 'cotizadorEventosWP', array(
                'restUrl' => rest_url('cotizador-eventos/v1/'),
                'nonce' => wp_create_nonce('wp_rest'),
                'pluginUrl' => COTIZADOR_EVENTOS_PLUGIN_URL,
            ));
        }
    }
    
    /**
     * Registrar rutas REST API
     */
    public function register_rest_routes() {
        // Obtener datos del usuario
        register_rest_route('cotizador-eventos/v1', '/data/(?P<type>[a-zA-Z0-9_-]+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_user_data'),
            'permission_callback' => array($this, 'check_user_permission'),
            'args' => array(
                'type' => array(
                    'required' => true,
                    'type' => 'string',
                ),
            ),
        ));
        
        // Guardar datos del usuario
        register_rest_route('cotizador-eventos/v1', '/data/(?P<type>[a-zA-Z0-9_-]+)', array(
            'methods' => 'POST',
            'callback' => array($this, 'save_user_data'),
            'permission_callback' => array($this, 'check_user_permission'),
            'args' => array(
                'type' => array(
                    'required' => true,
                    'type' => 'string',
                ),
                'data' => array(
                    'required' => true,
                ),
            ),
        ));
        
        // Ruta especial para solicitudes públicas (sin autenticación)
        register_rest_route('cotizador-eventos/v1', '/solicitud-publica', array(
            'methods' => 'POST',
            'callback' => array($this, 'save_public_request'),
            'permission_callback' => '__return_true', // Permitir acceso público
            'args' => array(
                'data' => array(
                    'required' => true,
                ),
            ),
        ));
        
        // Eliminar datos del usuario
        register_rest_route('cotizador-eventos/v1', '/data/(?P<type>[a-zA-Z0-9_-]+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_user_data'),
            'permission_callback' => array($this, 'check_user_permission'),
            'args' => array(
                'type' => array(
                    'required' => true,
                    'type' => 'string',
                ),
            ),
        ));
    }
    
    /**
     * Verificar permisos del usuario
     */
    public function check_user_permission() {
        return is_user_logged_in();
    }
    
    /**
     * Obtener datos del usuario
     */
    public function get_user_data($request) {
        
        r_id = get_current_user_id();
        a_type = $request['type'];
        
        le_name = $wpdb->prefix . 'cotizador_eventos_data';
        ult = $wpdb->get_var($wpdb->prepare(
         = %s",
        asult) {
            rn rest_ensure_response(json_decode($result, true));
        }
        
        etornar datos por defecto si no existen
        rn rest_ensure_response($this->get_default_data($data_type));
    }reul
    tursenur_esponse(jsonecoe($reul, tue)
        }
     /**
//Roardatosp efct sinxitn
       rturnres_ensure_respne(thisget_defaudt$da_ype
    }
 * G
uard/**r datos del usuario
  */*Guardardatosdelusuario
 publ*/
ic fpubluc nunctioncsave_user_datatioequn ve_user_data($request) {
global $gl;bl$wpb
       
$u_idget_currentuserid(;
        $data_type$=u$request['type'];
ser_id =$data =g$etqcnt_['']
    $date = $request['type'];
        $table_name$=d$wpdb->prefixa.t'cotizador_eventos_data'; = $request['data'];
        
        le_Va ific $w>zayar_events_data';
        $xi = wpdbvrwpb->rpare(
        // V"SELECT id FROM $table_name WHERE user_id = %d ANDedati_syppe=a%s",($wpdb->prepare(
          ln$WHEREi ,
         _d= daDa_typt
        pe = %s",
        
      i$datacntn =js_cd$d
           $data_type
        if ($exists) {    
          //Actlzar
            $res/lAa= $wpdb->p(
                $table_name,
     a          array('data_content' => $data_content),    array('data_content' => $data_content),
                array('   arra'y(>'$iuser_i, ';'>$da
      } el)
        } else {// Insertar
            $reInsuwer
             resul name,er(
             ,
              rry(
                    'user_id' => $user_id,
                    'data_type' => $data_type,
                    'data_content' => $data_content
                )
            );
        }
        
        if ($result !== false) {
            return rest_ensure_response(array('success' => true));
        }
        
        return new WP_Error('save_failed', 'Error al guardar datos', array('status' => 500));
    }
    
    /**
     * Guardar solicitud pública (sin autenticación)
     */
    public function save_public_request($request) {
        global $wpdb;
        
        $data = $request['data'];
        $table_name = $wpdb->prefix . 'cotizador_eventos_data';
        
        // Usar user_id = 0 para solicitudes públicas
        $user_id = 0;
        $data_type = 'solicitud_publica_' . time(); // Tipo único con timestamp
        
        $data_content = json_encode($data);
        
        $result = $wpdb->insert(
            $table_name,
            array(
                'user_id' => $user_id,
                'data_type' => $data_type,
                'data_content' => $data_content
            )
        );
        
        if ($result !== false) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'Solicitud enviada correctamente'
            ));
        }
        
        return new WP_Error('save_failed', 'Error al enviar solicitud', array('status' => 500));
    }
    
    /**
     * Eliminar datos del usuario
     */
    public function delete_user_data($request) {
        global $wpdb;
        
        $user_id = get_current_user_id();
        $data_type = $request['type'];
        
        $table_name = $wpdb->prefix . 'cotizador_eventos_data';
        
        $result = $wpdb->delete(
            $table_name,
            array('user_id' => $user_id, 'data_type' => $data_type)
        );
        
        if ($result !== false) {
            return rest_ensure_response(array('success' => true));
        }
        
        return new WP_Error('delete_failed', 'Error al eliminar datos', array('status' => 500));
    }
    
    /**
     * Obtener datos por defecto según el tipo
     */
    private function get_default_data($type) {
        switch ($type) {
            case 'productos':
                return array();
                
            case 'categorias':
                return array(
                    array('id' => 'recepcion', 'nombre' => 'Recepción', 'icono' => '🥂', 'orden' => 1),
                    array('id' => 'entrada', 'nombre' => 'Entrada', 'icono' => '🥗', 'orden' => 2),
                    array('id' => 'principal', 'nombre' => 'Plato Principal', 'icono' => '🍖', 'orden' => 3),
                    array('id' => 'postre', 'nombre' => 'Postre', 'icono' => '🍰', 'orden' => 4),
                    array('id' => 'bebida', 'nombre' => 'Bebidas', 'icono' => '🥤', 'orden' => 5),
                    array('id' => 'otros', 'nombre' => 'Otros', 'icono' => '📦', 'orden' => 6)
                );
                
            case 'experiencias':
                return array(
                    array('id' => 'cena_almuerzo', 'nombre' => 'Cenas/Almuerzo', 'icono' => '🍽️', 'descripcion' => 'Gastronomía de alta cocina con menús de pasos.', 'orden' => 1),
                    array('id' => 'cena_maridada', 'nombre' => 'Cenas Maridadas por Pasos', 'icono' => '🍷', 'descripcion' => 'Cada plato armonizado con vinos seleccionados.', 'orden' => 2),
                    array('id' => 'cata_vinos', 'nombre' => 'Cata de Vinos', 'icono' => '🍾', 'descripcion' => 'Degustación guiada de etiquetas seleccionadas.', 'orden' => 3),
                    array('id' => 'finger_food', 'nombre' => 'Finger Food & Lounge', 'icono' => '🥂', 'descripcion' => 'Formato relajado para socializar con bocados gourmet.', 'orden' => 4),
                    array('id' => 'after_office', 'nombre' => 'After Office', 'icono' => '🌆', 'descripcion' => 'Veladas con vinos boutique y DJ en vivo.', 'orden' => 5),
                    array('id' => 'cocteles', 'nombre' => 'Cócteles de Autor', 'icono' => '🍸', 'descripcion' => 'Barra abierta con cócteles preparados por bartenders.', 'orden' => 6),
                    array('id' => 'show_cooking', 'nombre' => 'Show Cooking', 'icono' => '👨‍🍳', 'descripcion' => 'Chef cocina en vivo frente a los invitados.', 'orden' => 7),
                    array('id' => 'brunch', 'nombre' => 'Brunch', 'icono' => '🥞', 'descripcion' => 'Fusión perfecta entre desayuno y almuerzo.', 'orden' => 8)
                );
                
            case 'motivosEvento':
                return array(
                    array('id' => 'cumpleanos', 'nombre' => 'Cumpleaños', 'icono' => '🎂', 'descripcion' => 'Celebraciones personalizadas para homenajear a quien cumple años.', 'orden' => 1),
                    array('id' => 'celebracion_especial', 'nombre' => 'Celebración Especial', 'icono' => '✨', 'descripcion' => 'Desde encuentros íntimos hasta fiestas sofisticadas.', 'orden' => 2),
                    array('id' => 'aniversarios', 'nombre' => 'Aniversarios y Bodas', 'icono' => '💕', 'descripcion' => 'Momentos románticos para celebrar el amor.', 'orden' => 3),
                    array('id' => 'reunion_familiar', 'nombre' => 'Reuniones Familiares', 'icono' => '👨‍👩‍👧‍👦', 'descripcion' => 'Encuentros intergeneracionales en un entorno cuidado.', 'orden' => 4),
                    array('id' => 'encuentro_amigos', 'nombre' => 'Encuentro de Amigos', 'icono' => '👥', 'descripcion' => 'Reunión distendida con formato relajado.', 'orden' => 5),
                    array('id' => 'corporativo', 'nombre' => 'Evento Corporativo', 'icono' => '🏢', 'descripcion' => 'Para fomentar integración del equipo.', 'orden' => 6),
                    array('id' => 'team_building', 'nombre' => 'Team Building', 'icono' => '🤝', 'descripcion' => 'Espacios de planificación y capacitación.', 'orden' => 7),
                    array('id' => 'comercial', 'nombre' => 'Evento Comercial', 'icono' => '💼', 'descripcion' => 'Presentación de productos o servicios.', 'orden' => 8)
                );
                
            case 'camposPersonalizados':
                return array();
                
            case 'estadosCotizacion':
                return array(
                    array('id' => 'borrador', 'nombre' => 'Borrador', 'icono' => '📝', 'color' => '#6c757d', 'orden' => 1),
                    array('id' => 'enviada', 'nombre' => 'Enviada', 'icono' => '📤', 'color' => '#007bff', 'orden' => 2),
                    array('id' => 'revisando', 'nombre' => 'En Revisión', 'icono' => '👀', 'color' => '#ffc107', 'orden' => 3),
                    array('id' => 'negociando', 'nombre' => 'Negociando', 'icono' => '💬', 'color' => '#fd7e14', 'orden' => 4),
                    array('id' => 'aprobada', 'nombre' => 'Aprobada', 'icono' => '✅', 'color' => '#28a745', 'orden' => 5),
                    array('id' => 'rechazada', 'nombre' => 'Rechazada', 'icono' => '❌', 'color' => '#dc3545', 'orden' => 6),
                    array('id' => 'cancelada', 'nombre' => 'Cancelada', 'icono' => '🚫', 'color' => '#6c757d', 'orden' => 7)
                );
                
            case 'cotizaciones':
                return array();
                
            case 'politicas':
                return '';
                
            case 'plantillaDescarga':
                return "COTIZACIÓN DE EVENTO GASTRONÓMICO\n\n" .
                       "Cliente: [cliente]\n" .
                       "Fecha del Evento: [fecha_evento]\n" .
                       "Cantidad de Personas: [personas]\n" .
                       "Formato: [formato]\n\n" .
                       "MOTIVOS DEL EVENTO:\n[motivos]\n\n" .
                       "EXPERIENCIAS SELECCIONADAS:\n[experiencias]\n\n" .
                       "DETALLE DE PRODUCTOS:\n[productos]\n\n" .
                       "TOTAL: [total]\n\n" .
                       "POLÍTICAS:\n[politicas]";
                
            default:
                return array();
        }
    }
    
    /**
     * Crear datos iniciales para el usuario
     */
    private function create_initial_user_data() {
        if (!is_user_logged_in()) {
            return;
        }
        
        global $wpdb;
        $user_id = get_current_user_id();
        $table_name = $wpdb->prefix . 'cotizador_eventos_data';
        
        // Verificar si el usuario ya tiene datos
        $existing_data = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $table_name WHERE user_id = %d",
            $user_id
        ));
        
        if ($existing_data == 0) {
            // Crear datos iniciales
            $initial_data = array(
                'productos' => $this->get_default_data('productos'),
                'categorias' => $this->get_default_data('categorias'),
                'experiencias' => $this->get_default_data('experiencias'),
                'motivosEvento' => $this->get_default_data('motivosEvento'),
                'camposPersonalizados' => $this->get_default_data('camposPersonalizados'),
                'estadosCotizacion' => $this->get_default_data('estadosCotizacion'),
                'cotizaciones' => $this->get_default_data('cotizaciones'),
                'politicas' => $this->get_default_data('politicas'),
                'plantillaDescarga' => $this->get_default_data('plantillaDescarga')
            );
            
            foreach ($initial_data as $type => $data) {
                $wpdb->insert(
                    $table_name,
                    array(
                        'user_id' => $user_id,
                        'data_type' => $type,
                        'data_content' => json_encode($data)
                    )
                );
            }
        }
    }
    
    /**
     * Shortcode para cotizador público
     */
    public function shortcode_cotizador_publico($atts) {
        // Atributos por defecto
        $atts = shortcode_atts(array(
            'titulo' => 'Solicita tu Cotización',
            'subtitulo' => 'Completa el formulario y te contactaremos con tu cotización personalizada'
        ), $atts);
        
        ob_start();
        include COTIZADOR_EVENTOS_PLUGIN_DIR . 'templates/cotizador-publico-template.php';
        return ob_get_clean();
    }
}

// Inicializar el plugin
new CotizadorEventosWP();
