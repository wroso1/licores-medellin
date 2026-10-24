// IMPORTANTE: reemplaza el número de ejemplo por el WhatsApp del negocio.
const WHATSAPP_NUMBER = "573004515809"; // Colombia: 57 + número, sin + ni espacios.

const products = [
  // AGUARDIENTES (licores)
  {id:1,name:"Aguardiente Antioqueño Botella",category:"licores",description:"Aguardiente 750 ml. Referencias azul, roja y verde.",price:75000,tag:"POPULAR",visual:"",unit:"botella"},
  {id:2,name:"Media Aguardiente Amarillo",category:"licores",description:"Media botella 375 ml del aguardiente Real.",price:46350,tag:"MEDIDAS",visual:"",unit:"media"},
  {id:3,name:"Media Aguardiente Rojo",category:"licores",description:"Media botella 375 ml tapa roja.",price:37500,tag:"MEDIDAS",visual:"",unit:"media"},
  {id:4,name:"Litro Azul / Verde",category:"licores",description:"Botella litro. Consulta referencia disponible.",price:87525,tag:"LITRO",visual:"",unit:"litro"},
  // RONES
  {id:5,name:"Ron Medellín 8 Años",category:"licores",description:"Botella 750 ml, el preferido de la casa.",price:108603,tag:"PREMIUM",visual:"",unit:"botella"},
  {id:6,name:"Ron Medellín 5 Años",category:"licores",description:"Botella 750 ml, suave y balanceado.",price:85440,tag:"CLÁSICO",visual:"",unit:"botella"},
  {id:7,name:"Ron Viejo de Caldas 15 Años",category:"licores",description:"Botella 750 ml, gran reserva.",price:171750,tag:"RESERVA",visual:"",unit:"botella"},
  {id:8,name:"Ron Viejo de Caldas 5 Años",category:"licores",description:"Botella 750 ml.",price:90695,tag:"CLÁSICO",visual:"",unit:"botella"},
  {id:9,name:"Garrafa Caldas",category:"licores",description:"Garrafa 1.75 litros para compartir.",price:196875,tag:"PARA COMPARTIR",visual:"",unit:"garrafa"},
  // WHISKY
  {id:10,name:"Black & White Botella",category:"licores",description:"Whisky botella 750 ml, el de siempre.",price:105000,tag:"CLÁSICO",visual:"",unit:"botella"},
  {id:11,name:"Black & White Media",category:"licores",description:"Media botella 375 ml.",price:48000,tag:"MEDIDAS",visual:"",unit:"media"},
  {id:12,name:"Jack Daniel's Nº7",category:"licores",description:"Botella 750 ml del clásico de Tennessee.",price:162000,tag:"DESTACADO",visual:"",unit:"botella"},
  {id:13,name:"Buchanan's",category:"licores",description:"Botella 750 ml, whisky escocés Deluxe.",price:134558,tag:"PREMIUM",visual:"",unit:"botella"},
  {id:14,name:"Botella Jose Cuervo",category:"licores",description:"Tequila botella 750 ml.",price:135000,tag:"TEQUILA",visual:"",unit:"botella"},
  {id:15,name:"Botella Bailey's",category:"licores",description:"Crema de whisky 750 ml.",price:123000,tag:"CREMA",visual:"",unit:"botella"},
  {id:16,name:"Absolut Vodka",category:"licores",description:"Vodka botella 700 ml.",price:100500,tag:"VODKA",visual:"",unit:"botella"},
  {id:17,name:"Botella Honey (JD Honey)",category:"licores",description:"Whisky miel 750 ml.",price:162000,tag:"MIEL",visual:"",unit:"botella"},
  // HIELO
  {id:18,name:"Hielo en bolsa",category:"hielo",description:"Bolsa de hielo lista para el plan.",price:8000,tag:"ESENCIAL",visual:"ice-visual",unit:"bolsa"},
  // FIESTA
  {id:19,name:"Vasos desechables",category:"fiesta",description:"Paquete de vasos para reuniones.",price:5000,tag:"PARA COMPARTIR",visual:"glass-visual",unit:"paquete"},
  {id:20,name:"Coca-Cola",category:"fiesta",description:"Botella 400 ml, el mezclador clásico.",price:3750,tag:"MEZCLADOR",visual:"party-visual",unit:"unidad"},
  {id:21,name:"Agua",category:"fiesta",description:"Botella 600 ml para hidratarse.",price:2000,tag:"HIDRATACIÓN",visual:"glass-visual",unit:"unidad"},
  {id:22,name:"Combo para la fiesta",category:"fiesta",description:"Arma tu combo con productos y presupuesto.",price:0,tag:"PERSONALIZADO",visual:"party-visual",unit:"combo"}
];
let currentCategory = "todos";
const selected = new Map();
const money = value => value === 0 ? "Cotizar" : new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(value);

function renderProducts(){
  const grid = document.getElementById("productGrid");
  const visible = products.filter(p => currentCategory === "todos" || p.category === currentCategory);
  grid.innerHTML = visible.map(p => `
    <article class="product-card">
      <div class="product-visual ${p.visual}"><span class="product-tag">${p.tag}</span><div class="bottle-mini"></div></div>
      <div class="product-info">
        <span class="product-category">${p.category === "licores" ? "Licores" : p.category === "hielo" ? "Hielo" : "Para la fiesta"}</span>
        <h3>${p.name}</h3><p>${p.description}</p>
        <div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-btn" data-add="${p.id}" aria-label="Agregar ${p.name}">+</button></div>
      </div>
    </article>`).join("");
  grid.querySelectorAll("[data-add]").forEach(btn => btn.addEventListener("click",()=>addProduct(Number(btn.dataset.add))));
}
function addProduct(id){
  const p = products.find(x=>x.id===id);
  selected.set(id,(selected.get(id)||0)+1);
  const count = selected.get(id);
  const message = p.price === 0
    ? `Hola, quiero cotizar: ${p.name}. ¿Me ayudan a armar un combo?`
    : `Hola, quiero pedir ${count} ${p.unit}(s) de ${p.name}. Precio publicado de referencia: ${money(p.price)}. ¿Hay disponibilidad?`;
  openWhatsApp(message);
}
function openWhatsApp(message){
  if(WHATSAPP_NUMBER === "573000000000"){
    alert("Antes de recibir pedidos, abre script.js y cambia WHATSAPP_NUMBER por el número real de WhatsApp del negocio (57 + número, sin espacios).");
    return;
  }
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,"_blank","noopener");
}
document.getElementById("filters").addEventListener("click",e=>{
  const btn=e.target.closest("[data-category]"); if(!btn)return;
  currentCategory=btn.dataset.category;
  document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===btn));
  renderProducts();
});
document.getElementById("comboBtn").addEventListener("click",e=>{e.preventDefault();openWhatsApp("Hola, quiero cotizar un combo para una fiesta. Mi presupuesto es: ____. Somos: ____ personas.");});
document.getElementById("zoneBtn").addEventListener("click",e=>{e.preventDefault();openWhatsApp("Hola, ¿me confirman si tienen domicilio hasta mi zona? Mi barrio es: ____.");});
document.getElementById("footerWhatsApp").addEventListener("click",e=>{e.preventDefault();openWhatsApp("Hola, quiero información del catálogo.");});
document.getElementById("floatingWA").addEventListener("click",e=>{e.preventDefault();openWhatsApp("Hola, quiero hacer un pedido. ¿Me comparten el catálogo actualizado?");});
document.getElementById("menuToggle").addEventListener("click",()=>document.getElementById("nav").classList.toggle("open"));
document.getElementById("year").textContent=new Date().getFullYear();
renderProducts();
