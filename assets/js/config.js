/* ==========================================================================
   BASSETT TECNOLOGÍA — CONFIGURACIÓN DEL SITIO
   --------------------------------------------------------------------------
   Todo lo que cambia del negocio (teléfono, WhatsApp, correo, dirección,
   redes sociales, servicios, preguntas frecuentes) se edita AQUÍ.
   No hace falta tocar el HTML ni el resto del código.

   ⚠️  Los valores marcados con  «CAMBIAR»  son marcadores de posición
       (dirección y horario aún no confirmados): reemplácelos por los datos
       reales antes de publicar el sitio.
   ========================================================================== */
window.BASSETT_CONFIG = {
  nombre: 'Bassett Tecnología',
  sitioWeb: 'https://www.itbassettcr.com',

  /* ---------- Contacto ---------- */
  // Número de WhatsApp con código de país, solo dígitos (Costa Rica = 506).
  whatsapp: '50688663352',
  // Teléfono tal como se mostrará en el sitio.
  telefono: '+506 8866 3352',
  correo: 'ventas@itbassettcr.com',
  // CAMBIAR: dirección o referencia de ubicación (se muestra y se usa en el mapa).
  direccion: 'Costa Rica',
  direccionDetalle: 'Servicio en sitio y remoto. Escríbanos su zona para confirmar cobertura.',
  // Texto que se usa para buscar en Google Maps / Waze (dirección completa o nombre del local).
  mapaConsulta: 'Costa Rica',
  mapaZoom: 15,
  // CAMBIAR: horario de atención. Ej.: [['Lunes a viernes', '8:00 am – 5:00 pm'], ['Sábados', '8:00 am – 12:00 md']]
  // Si queda vacío ([]), se muestra «consulte disponibilidad por WhatsApp».
  horario: [],

  /* ---------- Redes sociales ----------
     Solo se muestran las que tengan una URL. Deje '' para ocultar una red. */
  redes: {
    facebook: 'https://www.facebook.com/BassettTecnologiaCR',
    instagram: '',
    tiktok: '',
    youtube: '',
    linkedin: ''
  },

  /* ---------- Formularios ----------
     Opcional: URL de un servicio de formularios (Formspree, Getform, Web3Forms, etc.)
     para recibir las solicitudes del cotizador y del contacto por correo sin abrir
     el programa de correo del cliente. Si queda vacío, el sitio usa WhatsApp y mailto. */
  formEndpoint: '',

  mensajeWhatsApp: 'Hola Bassett Tecnología, quisiera información sobre sus servicios.',
  moneda: '₡',

  /* ---------- Cotizador ---------- */
  tiposTrabajo: ['Venta', 'Instalación', 'Reparación', 'Mantenimiento'],

  /* ---------- Servicios ----------
     icono: nombre del ícono (monitor, shield, network, printer, files, video, headset, wifi)
     categoria: equipos | redes | seguridad | impresion | soporte
     unidad: texto que acompaña la cantidad en el cotizador
     desde: (opcional) precio base en colones por unidad. Si TODOS quedan en null el
            cotizador no muestra estimado de precio y solo prepara la solicitud. */
  categorias: [
    { id: 'todos', nombre: 'Todos' },
    { id: 'equipos', nombre: 'Equipos' },
    { id: 'redes', nombre: 'Redes' },
    { id: 'seguridad', nombre: 'Seguridad' },
    { id: 'impresion', nombre: 'Impresión' },
    { id: 'soporte', nombre: 'Soporte' }
  ],

  servicios: [
    {
      id: 'pc', icono: 'monitor', categoria: 'equipos',
      nombre: 'PC de escritorio / Laptops',
      descripcion: 'Equipos nuevos y soporte completo para los que ya tiene: rápidos, seguros y listos para trabajar.',
      puntos: ['Venta y armado a la medida', 'Diagnóstico y reparación', 'Mejoras de memoria RAM y discos SSD', 'Formateo, software y respaldo de información'],
      unidad: 'equipos', desde: null
    },
    {
      id: 'ciberseguridad', icono: 'shield', categoria: 'seguridad',
      nombre: 'Ciberseguridad',
      descripcion: 'Proteja la información de su negocio contra virus, ransomware y accesos no autorizados.',
      puntos: ['Antivirus y protección de equipos', 'Firewall y filtrado de contenido', 'Respaldos y recuperación de datos', 'Revisión y buenas prácticas de seguridad'],
      unidad: 'equipos o usuarios', desde: null
    },
    {
      id: 'cableado', icono: 'network', categoria: 'redes',
      nombre: 'Cableado estructurado',
      descripcion: 'Infraestructura de red ordenada, certificada y lista para crecer con su empresa.',
      puntos: ['Puntos de red de datos', 'Instalación de racks y patch panels', 'Organización y rotulado', 'Pruebas y certificación del cableado'],
      unidad: 'puntos de red', desde: null
    },
    {
      id: 'impresoras', icono: 'printer', categoria: 'impresion',
      nombre: 'Impresoras multifuncionales',
      descripcion: 'Imprima, copie y escanee sin dolores de cabeza, con equipos bien instalados y bien mantenidos.',
      puntos: ['Venta e instalación', 'Configuración en red y en sus equipos', 'Mantenimiento preventivo y correctivo', 'Asesoría en tóner y suministros'],
      unidad: 'equipos', desde: null
    },
    {
      id: 'fotocopiadoras', icono: 'files', categoria: 'impresion',
      nombre: 'Fotocopiadoras: todas las marcas',
      descripcion: 'Venta, instalación, reparación y mantenimiento de fotocopiadoras, sin importar la marca.',
      puntos: ['Atención a todas las marcas', 'Reparación en sitio', 'Mantenimiento preventivo', 'Instalación y configuración'],
      unidad: 'equipos', desde: null
    },
    {
      id: 'camaras', icono: 'video', categoria: 'seguridad',
      nombre: 'Cámaras de seguridad',
      descripcion: 'Vigile su casa o negocio las 24 horas, desde donde esté.',
      puntos: ['Diseño e instalación de CCTV', 'Cámaras IP y sistemas DVR / NVR', 'Acceso remoto desde el celular', 'Mantenimiento y ampliaciones'],
      unidad: 'cámaras', desde: null
    },
    {
      id: 'soporte', icono: 'headset', categoria: 'soporte',
      nombre: 'Soporte en sitio y remoto',
      descripcion: 'Asistencia técnica cuando la necesite: en su oficina o a distancia, según el caso.',
      puntos: ['Visitas técnicas en sitio', 'Asistencia remota inmediata', 'Atención de incidentes y consultas', 'Mantenimiento preventivo programado'],
      unidad: 'equipos o usuarios', desde: null
    },
    {
      id: 'redes', icono: 'wifi', categoria: 'redes',
      nombre: 'Redes alámbricas e inalámbricas',
      descripcion: 'Conexiones estables, seguras y con la cobertura que su espacio necesita.',
      puntos: ['Diseño e instalación de redes LAN y Wi-Fi', 'Configuración de routers, switches y access points', 'Mejora de cobertura y velocidad', 'Redes para invitados y acceso remoto (VPN)'],
      unidad: 'áreas a cubrir', desde: null
    }
  ],

  /* ---------- Cifras de la portada ----------
     valor numérico = se anima al hacer scroll (prefijo/sufijo opcionales);
     texto = se muestra tal cual. */
  estadisticas: [
    { valor: 25, prefijo: '+', etiqueta: 'años de experiencia' },
    { valor: 8, etiqueta: 'servicios especializados' },
    { texto: 'ISO 9001', etiqueta: 'empresa certificada' },
    { texto: 'Sitio + Remoto', etiqueta: 'soporte técnico' }
  ],

  /* ---------- Preguntas frecuentes ---------- */
  faq: [
    {
      p: '¿Atienden en sitio o solo de forma remota?',
      r: 'Ofrecemos ambas modalidades. Muchos casos se resuelven por asistencia remota; cuando hace falta presencia, coordinamos una visita técnica. Escríbanos su zona para confirmar cobertura.'
    },
    {
      p: '¿Con qué marcas de fotocopiadoras trabajan?',
      r: 'Atendemos fotocopiadoras de todas las marcas. Cuéntenos el modelo y el problema, y le indicamos cómo ayudarle.'
    },
    {
      p: '¿Cómo funciona la cotización?',
      r: 'Complete el cotizador en línea o escríbanos por WhatsApp. Con esos datos preparamos una propuesta; en algunos casos hacemos un diagnóstico o una visita para darle un precio exacto.'
    },
    {
      p: '¿Venden equipos o solo dan servicio técnico?',
      r: 'Hacemos ambas cosas: venta, instalación, reparación y mantenimiento de computadoras, impresoras, fotocopiadoras, cámaras de seguridad y equipos de red.'
    },
    {
      p: 'Mi caso es urgente, ¿qué hago?',
      r: 'Márquelo como «Urgente» en el cotizador o escríbanos directamente por WhatsApp para priorizar su solicitud.'
    },
    {
      p: '¿Atienden empresas y domicilios?',
      r: 'Sí. Brindamos soporte técnico informático tanto a empresas como a domicilios. Cuéntenos qué necesita y armamos la solución adecuada para su caso.'
    }
  ]
};
