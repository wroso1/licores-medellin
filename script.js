// ─── CONFIGURACIÓN ───
const WHATSAPP_NUMBER = "573004515809"; // 57 + número, sin + ni espacios
const DELIVERY_FEE = 5000;
const CURRENCY = "COP";

// ─── CATÁLOGO (precios con 30% de ganancia) ───
const products = [
  {id:1, name:"Aguardiente Antioqueño Real", cat:"aguardiente", ico:"🍯", desc:"Botella 750 ml del Amarillo Real.", price:75400, tag:"POPULAR", img:"img/guardo-real.jpg"},
  {id:2, name:"Aguardiente Amarillo", cat:"aguardiente", ico:"🍯", desc:"Botella 750 ml.", price:75400, tag:"", img:"img/guardo-amarillo.jpg"},
  {id:3, name:"Media Aguardiente Rojo", cat:"aguardiente", ico:"🍯", desc:"Media botella 375 ml tapa roja.", price:37500, tag:"MEDIDA", img:"img/guardo-media-rojo.jpg"},
  {id:4, name:"Litro Azul / Verde", cat:"aguardiente", ico:"🍯", desc:"Botella litro, referencia a elegir.", price:87525, tag:"LITRO", img:""},
  {id:5, name:"Ron Medellín 8 Años", cat:"ron", ico:"🧴", desc:"Botella 750 ml, el preferido.", price:108603, tag:"PREMIUM", img:""},
  {id:6, name:"Ron Medellín 5 Años", cat:"ron", ico:"🧴", desc:"Botella 750 ml, suave.", price:85440, tag:"", img:""},
  {id:7, name:"Ron Viejo de Caldas 15", cat:"ron", ico:"🧴", desc:"Botella 750 ml gran reserva.", price:171750, tag:"RESERVA", img:""},
  {id:8, name:"Ron Viejo Caldas 5 Años", cat:"ron", ico:"🧴", desc:"Botella 750 ml.", price:90695, tag:"", img:"img/ron-caldas-5.jpg"},
  {id:9, name:"Garrafa Caldas 1.75L", cat:"ron", ico:"🧴", desc:"Para compartir en el plan.", price:196875, tag:"COMPARTIR", img:"img/garrafa-caldas.jpg"},
  {id:10, name:"Ron Esencial Litro", cat:"ron", ico:"🧴", desc:"Litro del esencial de Caldas.", price:87165, tag:"", img:"img/ron-litro.jpg"},
  {id:11, name:"Buchanan's 12 Años", cat:"whisky", ico:"🥃", desc:"Botella 750 ml Deluxe.", price:134558, tag:"PREMIUM", img:"img/buchanans.jpg"},
  {id:12, name:"Jack Daniel's Nº7", cat:"whisky", ico:"🥃", desc:"750 ml clásico de Tennessee.", price:162000, tag:"DESTACADO", img:""},
  {id:13, name:"Jack Daniel's Honey", cat:"whisky", ico:"🥃", desc:"Whisky miel 750 ml.", price:162000, tag:"MIEL", img:""},
  {id:14, name:"Black & White", cat:"whisky", ico:"🥃", desc:"Botella 750 ml, el de siempre.", price:105000, tag:"CLÁSICO", img:""},
  {id:15, name:"B&W Media", cat:"whisky", ico:"🥃", desc:"Media botella 375 ml.", price:48000, tag:"MEDIDA", img:""},
  {id:16, name:"Bailey's", cat:"whisky", ico:"🥃", desc:"Crema de whisky 750 ml.", price:123000, tag:"CREMA", img:""},
  {id:17, name:"Jose Cuervo", cat:"tequila", ico:"🍸", desc:"Tequila botella 750 ml.", price:135000, tag:"", img:"img/jose-cuervo.jpg"},
  {id:18, name:"Don Julio Añejo", cat:"tequila", ico:"🍸", desc:"Tequila premium 700 ml.", price:396500, tag:"LUJO", img:"img/don-julio-anejo.jpg"},
  {id:19, name:"Don Julio Reposado", cat:"tequila", ico:"🍸", desc:"Tequila 700 ml.", price:364000, tag:"", img:"img/don-julio-reposado.jpg"},
  {id:20, name:"Don Julio Blanco", cat:"tequila", ico:"🍸", desc:"Tequila 700 ml.", price:274300, tag:"", img:"img/don-julio-blanco.jpg"},
  {id:21, name:"Absolut Vodka", cat:"vodka", ico:"🥂", desc:"Vodka 700 ml.", price:100500, tag:"", img:"img/absolut.jpg"},
  {id:22, name:"Smirnoff N°21", cat:"vodka", ico:"🥂", desc:"Vodka 700 ml.", price:11250, tag:"", img:"img/smirnoff.jpg"},
  {id:23, name:"Cervezas (sixpack)", cat:"cerveza", ico:"🍺", desc:"Poker, Águila, Pilsen, Corona.", price:28750, tag:"FRÍAS", img:""},
  {id:24, name:"Heineken Sixpack", cat:"cerveza", ico:"🍺", desc:"6 latas 250 ml.", price:42000, tag:"PREMIUM", img:"img/heineken.jpg"},
  {id:25, name:"Hielo en bolsa 5kg", cat:"hielo", ico:"🧊", desc:"Bolsa lista para el plan.", price:8000, tag:"ESENCIAL", img:""},
  {id:26, name:"Vasos desechables", cat:"fiesta", ico:"🥤", desc:"Paquete para reuniones.", price:5000, tag:"", img:""},
  {id:27, name:"Coca-Cola 400ml", cat:"fiesta", ico:"🥤", desc:"El mezclador clásico.", price:3750, tag:"MEZCLADOR", img:""},
  {id:28, name:"Gaseosas surtidas", cat:"fiesta", ico:"🥤", desc:"Manzana, uva, colombiana.", price:3250, tag:"", img:""},
  {id:29, name:"Agua 600ml", cat:"fiesta", ico:"💧", desc:"Para hidratarse.", price:2000, tag:"", img:""},
  {id:30, name:"Combo fiesta", cat:"fiesta", ico:"🎉", desc:"Arma tu combo a tu medida.", price:0, tag:"COTIZAR", img:""}
];

const categories = [
  {id:"todos", name:"Todo", ico:"🔥"},
  {id:"aguardiente", name:"Aguardiente", ico:"🍯"},
  {id:"whisky", name:"Whisky", ico:"🥃"},
  {id:"ron", name:"Ron", ico:"🧴"},
  {id:"tequila", name:"Tequila", ico:"🍸"},
  {id:"vodka", name:"Vodka", ico:"🥂"},
  {id:"cerveza", name:"Cervezas", ico:"🍺"},
  {id:"hielo", name:"Hielo", ico:"🧊"},
  {id:"fiesta", name:"Fiesta", ico:"🎉"}
];

// ─── LÓGICA ───
const cart = new Map();
const money = n => "$" + n.toLocaleString("es-CO");
const byId = id => products.find(p=>p.id===id);
let currentCat = "todos";
let toastTimer;

function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2200)}
function itemCount(){return [...cart.values()].reduce((s,q)=>s+q,0)}
function subtotal(){return [...cart.entries()].reduce((s,[id,q])=>s+byId(id).price*q,0)}

function catName(id){const c=categories.find(c=>c.id===id);return c?c.name:id}

function renderCats(){
  document.getElementById("catGrid").innerHTML = categories.map(c=>
    `<button class="cat-card ${c.id===currentCat?"active":""}" data-cat="${c.id}"><span class="cat-ico">${c.ico}</span><b>${c.name}</b></button>`
  ).join("");
  document.querySelectorAll("[data-cat]").forEach(b=>b.addEventListener("click",()=>{
    currentCat=b.dataset.cat;
    document.getElementById("catalogo").scrollIntoView({behavior:"smooth"});
    renderCats();renderProducts();
  }));
}

function renderProducts(){
  const visible = products.filter(p=>currentCat==="todos"||p.cat===currentCat);
  document.getElementById("secTitle").textContent = currentCat==="todos"?"Catálogo":catName(currentCat);
  document.getElementById("prodCount").textContent = visible.length+" productos";
  document.getElementById("prodGrid").innerHTML = visible.map(p=>`
    <article class="p-card">
      <div class="p-img">
        ${p.tag?`<span class="p-tag">${p.tag}</span>`:""}
        ${p.img?`<img src="${p.img}" alt="${p.name}" loading="lazy">`:`<div class="noimg">${p.ico}</div>`}
      </div>
      <div class="p-info">
        <span class="p-cat">${catName(p.cat)}</span>
        <div class="p-name">${p.name}</div>
        <div class="p-desc">${p.desc}</div>
        <div class="p-bottom"><span class="p-price">${p.price?money(p.price):"Cotizar"}</span><button class="add-btn" data-add="${p.id}" aria-label="Agregar ${p.name}">+</button></div>
      </div>
    </article>`).join("");
  document.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click",()=>{
    const id=Number(b.dataset.add);
    cart.set(id,(cart.get(id)||0)+1);
    renderCart();
    toast(byId(id).name+" agregado ✓");
  }));
}

function renderCart(){
  const items=document.getElementById("cartItems");
  const entries=[...cart.entries()];
  document.getElementById("mCount").textContent=itemCount();
  if(!entries.length){
    items.innerHTML='<p style="text-align:center;color:#737373;font-size:13px;padding:24px 0">Tu carrito está vacío.<br>Agrega productos del catálogo.</p>';
  }else{
    items.innerHTML=entries.map(([id,q])=>{const p=byId(id);return `
      <div class="cart-item">
        ${p.img?`<img class="ci-img" src="${p.img}" alt="">`:`<span class="ci-img" style="display:grid;place-items:center;font-size:22px;background:#262626">${p.ico}</span>`}
        <div class="ci-body"><h4>${p.name}</h4><small>${p.price?money(p.price)+" c/u":"Precio por confirmar"}</small><br><button class="del-btn" data-remove="${id}">Quitar</button></div>
        <div class="ci-qty"><button class="qbtn" data-minus="${id}">−</button><span class="qnum">${q}</span><button class="qbtn" data-plus="${id}">+</button></div>
      </div>`}).join("");
    items.querySelectorAll("[data-minus]").forEach(b=>b.addEventListener("click",()=>changeQty(Number(b.dataset.minus),-1)));
    items.querySelectorAll("[data-plus]").forEach(b=>b.addEventListener("click",()=>changeQty(Number(b.dataset.plus),1)));
    items.querySelectorAll("[data-remove]").forEach(b=>b.addEventListener("click",()=>{cart.delete(Number(b.dataset.remove));renderCart()}));
  }
  const count=itemCount(), sub=subtotal(), total=sub+DELIVERY_FEE;
  document.getElementById("cartCount").textContent=count;
  document.getElementById("cartSummary").textContent=count+" producto"+(count===1?"":"s");
  document.getElementById("cartTotal").textContent=money(sub);
  document.getElementById("subtotal").textContent=money(sub);
  document.getElementById("deliveryCost").textContent=money(DELIVERY_FEE);
  document.getElementById("grandTotal").textContent=money(total);
  document.getElementById("viewCart").classList.toggle("show",count>0);
}

function changeQty(id,delta){const q=(cart.get(id)||0)+delta;if(q<=0)cart.delete(id);else cart.set(id,q);renderCart()}

function openCart(){document.getElementById("cartBackdrop").classList.add("open");document.body.style.overflow="hidden"}
function closeCart(){document.getElementById("cartBackdrop").classList.remove("open");document.body.style.overflow=""}

function sendWhatsApp(message){
  const url=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url,"_blank","noopener,noreferrer");
  return true;
}

// ─── EVENTOS ───
document.getElementById("viewCart").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
document.getElementById("cartBackdrop").addEventListener("click",e=>{if(e.target.id==="cartBackdrop")closeCart()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeCart()});

document.getElementById("waDirect").addEventListener("click",e=>{e.preventDefault();sendWhatsApp("Hola, quiero hacer un pedido de licores 🥃")});

// Selección forma de pago
document.querySelectorAll(".pay-opt").forEach(o=>o.addEventListener("click",()=>{
  document.querySelectorAll(".pay-opt").forEach(x=>x.classList.remove("sel"));
  o.classList.add("sel");
  document.getElementById("payValue").value=o.dataset.pay;
}));

// Envío del pedido
document.getElementById("checkoutForm").addEventListener("submit",e=>{
  e.preventDefault();
  if(!cart.size){toast("Agrega al menos un producto");return}
  const d=new FormData(e.currentTarget);
  const lines=[...cart.entries()].map(([id,q])=>{const p=byId(id);return `• ${p.name} x${q} — ${p.price?money(p.price*q):"precio por confirmar"}`});
  const sub=subtotal(),total=sub+DELIVERY_FEE;
  const message=[
    "🥃 *PEDIDO — LICORES MEDELLÍN*","",
    ...lines,"",
    `Subtotal: ${money(sub)}`,
    `Domicilio: ${money(DELIVERY_FEE)}`,
    `*TOTAL ESTIMADO: ${money(total)}*`,"",
    `👤 Nombre: ${d.get("name")}`,
    `📱 Celular: ${d.get("phone")}`,
    `📍 Barrio: ${d.get("neighborhood")}`,
    `🏠 Dirección: ${d.get("address")}`,
    `💳 Pago: ${d.get("payment")}`,
    d.get("notes")?`📝 Notas: ${d.get("notes")}`:"",
    "","Confirmo que tengo 18 años o más. Por favor confirmen disponibilidad y tiempo de entrega."
  ].filter(Boolean).join("\n");
  sendWhatsApp(message);
  toast("¡Pedido enviado! ✓");
  cart.clear();
  renderCart();
  setTimeout(closeCart,900);
});

document.getElementById("year").textContent=new Date().getFullYear();
renderCats();renderProducts();renderCart();
