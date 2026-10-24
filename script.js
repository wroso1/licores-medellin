// CONFIGURACIÓN: cambia estos valores antes de publicar.
const WHATSAPP_NUMBER = "573004515809"; // Colombia: 57 + número, sin +, espacios ni guiones.
const DELIVERY_FEE = 5000; // Tarifa fija de domicilio en pesos colombianos (ejemplo).
const CURRENCY = "COP";

// Catálogo real — precios con 30% de ganancia sobre costo.
const products = [
  // AGUARDIENTES
  {id:1,name:"Aguardiente Antioqueño Botella",category:"licores",description:"750 ml. Referencias azul, roja y verde.",price:75000,tag:"POPULAR",visual:"",unit:"botella"},
  {id:2,name:"Media Aguardiente Amarillo",category:"licores",description:"Media botella 375 ml del Real.",price:46350,tag:"MEDIDAS",visual:"",unit:"media"},
  {id:3,name:"Media Aguardiente Rojo",category:"licores",description:"Media botella 375 ml tapa roja.",price:37500,tag:"MEDIDAS",visual:"",unit:"media"},
  {id:4,name:"Litro Azul / Verde",category:"licores",description:"Botella litro. Consulta referencia.",price:87525,tag:"LITRO",visual:"",unit:"litro"},
  // RONES
  {id:5,name:"Ron Medellín 8 Años",category:"licores",description:"Botella 750 ml, el preferido de la casa.",price:108603,tag:"PREMIUM",visual:"",unit:"botella"},
  {id:6,name:"Ron Medellín 5 Años",category:"licores",description:"Botella 750 ml, suave y balanceado.",price:85440,tag:"CLÁSICO",visual:"",unit:"botella"},
  {id:7,name:"Ron Viejo de Caldas 15 Años",category:"licores",description:"Botella 750 ml, gran reserva.",price:171750,tag:"RESERVA",visual:"",unit:"botella"},
  {id:8,name:"Ron Viejo de Caldas 5 Años",category:"licores",description:"Botella 750 ml.",price:90695,tag:"CLÁSICO",visual:"",unit:"botella"},
  {id:9,name:"Garrafa Caldas",category:"licores",description:"Garrafa 1.75 litros para compartir.",price:196875,tag:"PARA COMPARTIR",visual:"",unit:"garrafa"},
  // WHISKY Y MÁS
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
  {id:22,name:"Combo para la fiesta",category:"fiesta",description:"Cotiza un combo personalizado por WhatsApp.",price:0,tag:"PERSONALIZADO",visual:"party-visual",unit:"combo"}
];
const cart = new Map();
const money = n => new Intl.NumberFormat("es-CO",{style:"currency",currency:CURRENCY,maximumFractionDigits:0}).format(n);
const byId = id => products.find(p=>p.id===id);
let toastTimer;
function toast(message){const el=document.getElementById("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2500)}
function itemCount(){return [...cart.values()].reduce((sum,q)=>sum+q,0)}
function subtotal(){return [...cart.entries()].reduce((sum,[id,q])=>sum+(byId(id).price*q),0)}
function renderProducts(){
 const grid=document.getElementById("productGrid");
 const category=document.querySelector(".filter.active")?.dataset.category||"todos";
 grid.innerHTML=products.filter(p=>category==="todos"||p.category===category).map(p=>`
 <article class="product-card"><div class="product-visual ${p.visual}"><span class="product-tag">${p.tag}</span><div class="bottle-mini"></div></div>
 <div class="product-info"><span class="product-category">${p.category==="licores"?"Licores":p.category==="hielo"?"Hielo":"Para la fiesta"}</span><h3>${p.name}</h3><p>${p.description}</p>
 <div class="product-bottom"><span class="price">${p.price?money(p.price):"Cotizar"}</span><button class="add-btn" data-add="${p.id}" aria-label="Agregar ${p.name}">+</button></div></div></article>`).join("");
 grid.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click",()=>{const id=Number(b.dataset.add);cart.set(id,(cart.get(id)||0)+1);renderCart();toast(`${byId(id).name} agregado al pedido`)}));
}
function renderCart(){
 const items=document.getElementById("cartItems");
 const entries=[...cart.entries()];
 if(!entries.length){items.innerHTML='<div class="empty-cart">Tu carrito está vacío.<br>Agrega productos del catálogo para empezar.</div>'}
 else{items.innerHTML=entries.map(([id,q])=>{const p=byId(id);return `<article class="cart-item"><div><h4>${p.name}</h4><small>${p.price?money(p.price)+" c/u":"Precio por confirmar"} · ${p.price?money(p.price*q):"Cotizar"}</small><br><button class="remove-btn" data-remove="${id}">Quitar</button></div><div class="item-controls"><button class="qty-btn" data-minus="${id}" aria-label="Quitar una unidad">−</button><span class="qty-num">${q}</span><button class="qty-btn" data-plus="${id}" aria-label="Agregar una unidad">+</button></div></article>`}).join("");
 items.querySelectorAll("[data-minus]").forEach(b=>b.addEventListener("click",()=>changeQty(Number(b.dataset.minus),-1)));
 items.querySelectorAll("[data-plus]").forEach(b=>b.addEventListener("click",()=>changeQty(Number(b.dataset.plus),1)));
 items.querySelectorAll("[data-remove]").forEach(b=>b.addEventListener("click",()=>{cart.delete(Number(b.dataset.remove));renderCart()}));}
 const count=itemCount(), sub=subtotal(), total=sub+DELIVERY_FEE;
 document.getElementById("cartCount").textContent=count;
 document.getElementById("cartSummary").textContent=`${count} producto${count===1?"":"s"} · ${money(sub)}`;
 document.getElementById("cartButtonTotal").textContent=money(sub);
 document.getElementById("subtotal").textContent=money(sub);
 document.getElementById("deliveryCost").textContent=money(DELIVERY_FEE);
 document.getElementById("grandTotal").textContent=money(total);
}
function changeQty(id,delta){const q=(cart.get(id)||0)+delta;if(q<=0)cart.delete(id);else cart.set(id,q);renderCart()}
function openCart(){document.getElementById("cartBackdrop").classList.add("open");document.getElementById("cartBackdrop").setAttribute("aria-hidden","false");document.body.classList.add("modal-open")}
function closeCart(){document.getElementById("cartBackdrop").classList.remove("open");document.getElementById("cartBackdrop").setAttribute("aria-hidden","true");document.body.classList.remove("modal-open")}
function sendWhatsApp(message){
 if(WHATSAPP_NUMBER==="573000000000"){toast("Configura tu número real de WhatsApp en script.js antes de publicar.");return false}
 const url=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
 window.open(url,"_blank","noopener,noreferrer");return true;
}
document.getElementById("filters").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderProducts()});
document.getElementById("viewCart").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
document.getElementById("cartBackdrop").addEventListener("click",e=>{if(e.target.id==="cartBackdrop")closeCart()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeCart()});
document.getElementById("menuToggle").addEventListener("click",()=>document.getElementById("nav").classList.toggle("open"));
document.getElementById("comboBtn").addEventListener("click",()=>sendWhatsApp("Hola, quiero cotizar un combo para una fiesta. Mi presupuesto es: ____. Somos: ____ personas."));
document.getElementById("footerWhatsApp").addEventListener("click",e=>{e.preventDefault();sendWhatsApp("Hola, quiero información del catálogo de Licores Medellín.")});
document.getElementById("checkoutForm").addEventListener("submit",e=>{
 e.preventDefault();
 if(!cart.size){toast("Agrega al menos un producto antes de continuar.");return}
 const data=new FormData(e.currentTarget);
 const lines=[...cart.entries()].map(([id,q])=>{const p=byId(id);return `• ${p.name} x${q} — ${p.price?money(p.price*q):"precio por confirmar"}`});
 const name=(data.get("name")||"").trim(),phone=(data.get("phone")||"").trim(),neighborhood=(data.get("neighborhood")||"").trim(),address=(data.get("address")||"").trim(),payment=data.get("payment"),notes=(data.get("notes")||"").trim();
 const sub=subtotal(),total=sub+DELIVERY_FEE;
 const message=[
  "Hola, quiero hacer un pedido en Licores Medellín.",
  "", "PEDIDO:",...lines,
  "",`Subtotal: ${money(sub)}`,`Domicilio (tarifa fija): ${money(DELIVERY_FEE)}`,`TOTAL ESTIMADO: ${money(total)}`,
  "",`Nombre: ${name}`,`Celular: ${phone}`,`Barrio: ${neighborhood}`,`Dirección: ${address}`,`Forma de pago: ${payment}`,
  notes?`Notas: ${notes}`:"",
  "", "Confirmo que tengo 18 años o más. Por favor, confirmen disponibilidad, costo final y tiempo estimado de entrega."
 ].filter(Boolean).join("\n");
 sendWhatsApp(message);
});
document.getElementById("year").textContent=new Date().getFullYear();
renderProducts();renderCart();
