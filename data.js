/* ==========================================================================
   LICORES MEDELLÍN — datos editables
   Todo lo que se cambia a diario (precios, teléfono, domicilio) vive aquí.
   Los precios están en pesos colombianos, sin puntos ni símbolos.
   ========================================================================== */

var CONFIG = {
  // 57 + número, sin +, sin espacios, sin guiones
  whatsapp: "573004515809",
  whatsappLabel: "300 451 5809",

  deliveryFee: 0,
  // Entrega gratis desde este subtotal. 0 = nunca.
  freeDeliveryFrom: 0,
  currency: "COP",

  // Zonas que cubrimos (texto informativo, no bloquea el pedido)
  zones: "Medellín y Bello",

  // Nombre que aparece en el mensaje de WhatsApp
  shopName: "Licores Medellín"
};

var CATEGORIES = [
  { id: "todos",      name: "Todo",        ico: "🔥" },
  { id: "aguardiente", name: "Aguardiente", ico: "🍯" },
  { id: "whisky",     name: "Whisky",      ico: "🥃" },
  { id: "ron",        name: "Ron",         ico: "🧴" },
  { id: "tequila",    name: "Tequila",     ico: "🍸" },
  { id: "vodka",      name: "Vodka",       ico: "🥂" },
  { id: "cerveza",    name: "Cervezas",    ico: "🍺" },
  { id: "hielo",      name: "Hielo",       ico: "🧊" },
  { id: "fiesta",     name: "Fiesta",      ico: "🎉" }
];

/* price: null = precio por cotizar
   hidden: true = no se muestra (falta confirmar precio o foto)
   img: "" = sin foto, se dibuja una ficha tipográfica                       */
var PRODUCTS = [
  { id: 1,  name: "Aguardiente Antioqueño Real", cat: "aguardiente", size: "750 ml", price: 75400,  tag: "Popular",  img: "img/guardo-real.png",        desc: "El amarillo Real de siempre." },
  { id: 2,  name: "Aguardiente Amarillo",        cat: "aguardiente", size: "750 ml", price: 75400,  tag: "",         img: "img/guardo-amarillo-manzanares.png", desc: "Amarillo de Manzanares, 750 ml." },
  { id: 3,  name: "Media de Aguardiente",        cat: "aguardiente", size: "375 ml", price: 37500,  tag: "Media",    img: "img/guardo-media-rojo-2.png", desc: "Media botella, 375 ml.",
    /* Variantes: la foto cambia según la tapa que elija el cliente */
    variants: [
      { key: "rojo",  name: "Rojo",  color: "#C0392B", img: "img/guardo-media-rojo-2.png" },
      { key: "verde", name: "Verde", color: "#1F7A46", img: "img/guardo-media-verde.png" },
      { key: "azul",  name: "Azul",  color: "#1B4FA0", img: "img/guardo-media-azul.png" }
    ] },
  { id: 4,  name: "Aguardiente Litro",           cat: "aguardiente", size: "1000 ml", price: 87525, tag: "Litro",    img: "img/guardo-litro-rojo.png",  desc: "Botella de litro, 1000 ml.",
    variants: [
      { key: "rojo",  name: "Rojo",  color: "#C0392B", img: "img/guardo-litro-rojo.png" },
      { key: "verde", name: "Verde", color: "#1F7A46", img: "img/guardo-litro-verde.png" },
      { key: "azul",  name: "Azul",  color: "#1B4FA0", img: "img/guardo-litro-azul.png" }
    ] },

  { id: 6,  name: "Ron Medellín 5 Años",         cat: "ron",         size: "750 ml", price: 85440,  tag: "",         img: "img/ron-medellin-5.png",     desc: "Suave, para mezclar o solo." },
  { id: 5,  name: "Ron Medellín 8 Años",         cat: "ron",         size: "750 ml", price: 108603, tag: "Premium",  img: "img/ron-medellin-8.png",     desc: "El clásico añejo de la casa." },
  { id: 8,  name: "Ron Viejo de Caldas 5 Años",  cat: "ron",         size: "750 ml", price: 90695,  tag: "",         img: "img/ron-caldas-5-2.png",     desc: "Caldas cinco años." },
  { id: 10, name: "Ron Esencial Litro",          cat: "ron",         size: "1000 ml", price: 87165, tag: "",         img: "img/ron-esencial-litro.png", desc: "Licor de ron viejo de Caldas." },
  { id: 7,  name: "Ron Viejo de Caldas 15",      cat: "ron",         size: "750 ml", price: 171750, tag: "Reserva",  img: "img/ron-caldas-15.png",      desc: "Gran reserva, para ocasión especial." },
  { id: 9,  name: "Garrafa Caldas 1.75 L",       cat: "ron",         size: "1750 ml", price: 196875, tag: "Compartir", img: "img/garrafa-caldas.png",    desc: "Rinde para toda la reunión." },

  { id: 11, name: "Buchanan's 12 Años",          cat: "whisky",      size: "750 ml", price: 134558, tag: "Premium",  img: "img/buchanans.png",          desc: "Deluxe, 12 años." },
  { id: 14, name: "Black & White",               cat: "whisky",      size: "750 ml", price: 105000, tag: "Clásico",  img: "img/black-white.png",        desc: "El de siempre, buen precio." },
  { id: 15, name: "Black & White Media",         cat: "whisky",      size: "375 ml", price: 48000,  tag: "Media",    img: "img/black-white-media.png",  desc: "Media botella." },
  { id: 12, name: "Jack Daniel's Nº7",           cat: "whisky",      size: "750 ml", price: 162000, tag: "Destacado", img: "img/jack-daniels-7.png",     desc: "Tennessee whiskey." },
  { id: 13, name: "Jack Daniel's Honey",         cat: "whisky",      size: "750 ml", price: 162000, tag: "Miel",     img: "img/jack-daniels-honey.png", desc: "Whisky con miel." },
  { id: 16, name: "Bailey's",                    cat: "whisky",      size: "750 ml", price: 123000, tag: "Crema",    img: "img/baileys.png", desc: "Crema de whisky, para el postre." },

  { id: 17, name: "José Cuervo Especial",        cat: "tequila",     size: "750 ml", price: 135000, tag: "",         img: "img/jose-cuervo-especial.png",        desc: "Tequila dorado." },
  { id: 20, name: "Don Julio Blanco",            cat: "tequila",     size: "700 ml", price: 274300, tag: "",         img: "img/don-julio-blanco.png",   desc: "Tequila 100% agave." },
  { id: 19, name: "Don Julio Reposado",          cat: "tequila",     size: "700 ml", price: 364000, tag: "",         img: "img/don-julio-reposado.png", desc: "Reposado, ocho meses en barrica." },
  { id: 18, name: "Don Julio Añejo",             cat: "tequila",     size: "700 ml", price: 396500, tag: "Lujo",     img: "img/don-julio-anejo.png",    desc: "Añejo, para brindar." },

  { id: 21, name: "Absolut Vodka",               cat: "vodka",       size: "700 ml", price: 100500, tag: "",         img: "img/absolut.png",            desc: "Vodka sueco." },
  // Precio pendiente de confirmar con el dueño: en el catálogo anterior estaba a $11.250.
  { id: 22, name: "Smirnoff N°21",               cat: "vodka",       size: "700 ml", price: null,   tag: "Consultar", img: "img/smirnoff.png",           desc: "Vodka, precio por confirmar.", hidden: true },

  { id: 24, name: "Heineken Sixpack",            cat: "cerveza",     size: "6 × 250 ml", price: 42000, tag: "Premium", img: "img/heineken.png",          desc: "Seis latas bien frías." },
  { id: 23, name: "Cervezas Sixpack",            cat: "cerveza",     size: "6 unidades", price: 28750, tag: "Frío",    img: "",                          desc: "Poker, Águila, Pilsen o Corona." },

  { id: 25, name: "Hielo en bolsa",              cat: "hielo",       size: "5 kg",   price: 8000,   tag: "Esencial", img: "img/hielo.png", desc: "Listo para el plan." },

  { id: 26, name: "Vasos desechables",           cat: "fiesta",      size: "Paquete", price: 5000,  tag: "",         img: "",                           desc: "Para la reunión." },
  { id: 27, name: "Coca-Cola",                   cat: "fiesta",      size: "400 ml", price: 3750,   tag: "Mezclador", img: "img/coca-cola.png", desc: "El mezclador clásico." },
  { id: 28, name: "Gaseosas surtidas",           cat: "fiesta",      size: "400 ml", price: 3250,   tag: "",         img: "",                           desc: "Manzana, uva o colombiana." },
  { id: 29, name: "Agua",                        cat: "fiesta",      size: "600 ml", price: 2000,   tag: "",         img: "img/agua-cristal.png", desc: "Para hidratarse." },
  { id: 30, name: "Combo fiesta",                cat: "fiesta",      size: "A tu medida", price: null, tag: "Cotizar", img: "",                          desc: "Armamos el combo para tu reunión.", quote: true }
];
