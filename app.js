/* ==========================================================================
   Licores Medellín — lógica de la tienda
   Depende de CONFIG, CATEGORIES y PRODUCTS (data.js).
   Sin dependencias externas.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------------------- utilidades ---------------------------- */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var nf = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });
  function money(n) { return "$" + nf.format(Math.round(n || 0)); }

  function normalize(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  var STORE = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* modo privado */ }
    }
  };

  var K_CART = "lm.cart.v1";
  var K_DATA = "lm.cliente.v1";
  var K_AGE = "lm.edad.v1";

  /* ---------------------------- estado ---------------------------- */
  var catalog = {};
  var list = [];

  PRODUCTS.forEach(function (p) {
    if (p.hidden) return;
    catalog[p.id] = p;
    list.push(p);
  });

  var cart = new Map();
  var state = { cat: "todos", query: "", sort: "default" };

  // Recuperar carrito guardado (ignorando productos que ya no existen)
  (function restoreCart() {
    var saved = STORE.get(K_CART, {});
    Object.keys(saved).forEach(function (id) {
      var qty = parseInt(saved[id], 10);
      if (catalog[id] && qty > 0) cart.set(Number(id), qty);
    });
  })();

  function saveCart() {
    var obj = {};
    cart.forEach(function (q, id) { obj[id] = q; });
    STORE.set(K_CART, obj);
  }

  function itemCount() {
    var n = 0;
    cart.forEach(function (q) { n += q; });
    return n;
  }

  function subtotal() {
    var total = 0;
    cart.forEach(function (q, id) {
      var p = catalog[id];
      if (p && p.price != null) total += p.price * q;
    });
    return total;
  }

  function delivery() {
    if (!cart.size) return 0;
    if (CONFIG.freeDeliveryFrom > 0 && subtotal() >= CONFIG.freeDeliveryFrom) return 0;
    return CONFIG.deliveryFee;
  }

  function total() {
    return subtotal() + delivery();
  }

  function catName(id) {
    for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].id === id) return CATEGORIES[i].name;
    return id;
  }

  function initialOf(name) {
    var clean = String(name).replace(/^(Ron|Licor|Media|Garrafa)\s+/i, "");
    return clean.charAt(0).toUpperCase();
  }

  /* ---------------------------- toast ---------------------------- */
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------------------------- render catálogo ---------------------------- */
  var grid = $("#grid");
  var chipsEl = $("#chips");
  var emptyEl = $("#empty");
  var resultsEl = $("#results");

  function matchesSearch(p, q) {
    if (!q) return true;
    return normalize(p.name + " " + catName(p.cat) + " " + (p.desc || "") + " " + (p.size || "")).indexOf(q) !== -1;
  }

  function visibleProducts() {
    var q = normalize(state.query);
    var out = list.filter(function (p) {
      if (state.cat !== "todos" && p.cat !== state.cat) return false;
      return matchesSearch(p, q);
    });
    if (state.sort === "price-asc") {
      out.sort(function (a, b) { return (a.price == null ? Infinity : a.price) - (b.price == null ? Infinity : b.price); });
    } else if (state.sort === "price-desc") {
      out.sort(function (a, b) { return (b.price == null ? -1 : b.price) - (a.price == null ? -1 : a.price); });
    } else if (state.sort === "name") {
      out.sort(function (a, b) { return a.name.localeCompare(b.name, "es"); });
    }
    return out;
  }

  function mediaHTML(p) {
    if (p.img) {
      return '<img src="' + p.img + '" alt="' + p.name + '" width="810" height="891" loading="lazy" decoding="async">';
    }
    return '<div class="ph" aria-hidden="true"><span class="ph-initial">' + initialOf(p.name) + '</span><span class="ph-cat">' + catName(p.cat) + "</span></div>";
  }

  function controlHTML(p) {
    if (p.quote) return '<button class="add" data-quote="' + p.id + '" aria-label="Cotizar ' + p.name + '">?</button>';
    var qty = cart.get(p.id) || 0;
    if (!qty) {
      return '<button class="add" data-add="' + p.id + '" aria-label="Agregar ' + p.name + ' al pedido">+</button>';
    }
    return '<div class="stepper">' +
      '<button data-dec="' + p.id + '" aria-label="Quitar uno de ' + p.name + '">−</button>' +
      '<span class="qty" aria-live="polite">' + qty + "</span>" +
      '<button data-inc="' + p.id + '" aria-label="Agregar otro ' + p.name + '">+</button>' +
      "</div>";
  }

  function cardHTML(p) {
    var priceHTML = p.quote
      ? '<span class="ask">A cotizar</span>'
      : p.price == null
        ? '<span class="ask">Consultar</span>'
        : '<span class="price">' + money(p.price) + '<small> c/u</small></span>';

    return '<article class="card">' +
      '<div class="card-media">' +
        (p.tag ? '<span class="tag">' + p.tag + "</span>" : "") +
        mediaHTML(p) +
      "</div>" +
      '<div class="card-body">' +
        '<span class="card-cat">' + catName(p.cat) + "</span>" +
        '<h3 class="card-name">' + p.name + "</h3>" +
        '<span class="card-size">' + (p.size || "") + "</span>" +
        '<div class="card-foot">' + priceHTML + controlHTML(p) + "</div>" +
      "</div>" +
    "</article>";
  }

  function renderChips() {
    chipsEl.innerHTML = CATEGORIES.map(function (c) {
      return '<button class="chip" data-cat="' + c.id + '" aria-pressed="' + (state.cat === c.id) + '">' +
        '<span class="chip-ico" aria-hidden="true">' + c.ico + "</span>" + c.name + "</button>";
    }).join("");
  }

  function renderGrid() {
    var items = visibleProducts();
    grid.innerHTML = items.map(cardHTML).join("");
    emptyEl.hidden = items.length > 0;
    grid.hidden = items.length === 0;

    var label = state.cat === "todos" ? "Todo el catálogo" : catName(state.cat);
    resultsEl.textContent = items.length
      ? label + " · " + items.length + (items.length === 1 ? " producto" : " productos")
      : "Sin resultados para \u201c" + state.query + "\u201d";
    $("#shopTitle").textContent = state.cat === "todos" ? "Catálogo" : catName(state.cat);
  }

  /* ---------------------------- render carrito ---------------------------- */
  var cartItemsEl = $("#cartItems");

  function cartItemHTML(p, qty) {
    var line = p.price != null ? money(p.price * qty) : "por confirmar";
    return '<div class="ci">' +
      (p.img
        ? '<img class="ci-img" src="' + p.img + '" alt="" width="810" height="891" loading="lazy">'
        : '<div class="ci-ph" aria-hidden="true">' + initialOf(p.name) + "</div>") +
      '<div class="ci-body">' +
        "<h4>" + p.name + "</h4>" +
        "<p>" + (p.size || "") + " · " + (p.price != null ? money(p.price) + " c/u" : "precio por confirmar") + "</p>" +
        '<button class="ci-del" data-remove="' + p.id + '">Quitar</button>' +
      "</div>" +
      '<div class="ci-right">' +
        '<div class="stepper">' +
          '<button data-dec="' + p.id + '" aria-label="Quitar uno de ' + p.name + '">−</button>' +
          '<span class="qty">' + qty + "</span>" +
          '<button data-inc="' + p.id + '" aria-label="Agregar otro ' + p.name + '">+</button>' +
        "</div>" +
        '<span class="ci-price">' + line + "</span>" +
      "</div>" +
    "</div>";
  }

  function renderCart() {
    var count = itemCount();

    if (!cart.size) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Tu pedido está vacío.<br>Agrega algo del catálogo.</p>';
    } else {
      var html = "";
      cart.forEach(function (qty, id) {
        var p = catalog[id];
        if (p) html += cartItemHTML(p, qty);
      });
      cartItemsEl.innerHTML = html;
    }

    $("#tSubtotal").textContent = money(subtotal());
    $("#tDelivery").textContent = delivery() === 0 ? "Gratis" : money(delivery());
    $("#tTotal").textContent = money(total());

    $("#cartBarCount").textContent = count;
    $("#cartBarTotal").textContent = money(subtotal());
    var bar = $("#cartBar");
    bar.hidden = count === 0;
    document.body.classList.toggle("has-cart", count > 0);
    $("#sendOrder").disabled = count === 0;

    saveCart();
  }

  function renderAll() {
    renderGrid();
    renderCart();
  }

  /* ---------------------------- acciones carrito ---------------------------- */
  function addToCart(id) {
    var p = catalog[id];
    if (!p) return;
    cart.set(id, (cart.get(id) || 0) + 1);
    renderAll();
    toast(p.name + " agregado");
  }

  function changeQty(id, delta) {
    var next = (cart.get(id) || 0) + delta;
    if (next <= 0) cart.delete(id); else cart.set(id, next);
    renderAll();
  }

  function removeItem(id) {
    cart.delete(id);
    renderAll();
  }

  /* ---------------------------- panel ---------------------------- */
  var drawerBack = $("#drawerBack");

  function openCart() {
    drawerBack.hidden = false;
    $("#drawerTitle").textContent = "Tu pedido";
    document.body.style.overflow = "hidden";
    $("#viewCart").hidden = false;
    $("#viewDone").hidden = true;
    var close = $("#closeDrawer");
    if (close) close.focus();
  }

  function closeCart() {
    drawerBack.hidden = true;
    document.body.style.overflow = "";
    var bar = $("#cartBar");
    if (bar && !bar.hidden) $("#openCart").focus();
  }

  /* ---------------------------- whatsapp ---------------------------- */
  function waURL(text) {
    return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(text);
  }

  function openWhatsApp(text) {
    var url = waURL(text);
    var win = null;
    try { win = window.open(url, "_blank", "noopener"); } catch (e) { win = null; }
    if (!win) location.href = url;
    return url;
  }

  /* ---------------------------- pedido ---------------------------- */
  var lastOrderText = "";

  function orderId() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, "0"); };
    return "LM-" + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + "-" + p(d.getHours()) + p(d.getMinutes());
  }

  function buildOrder(id, data) {
    var lines = [];
    lines.push("🥃 *PEDIDO — " + CONFIG.shopName.toUpperCase() + "*");
    lines.push("Pedido: " + id);
    lines.push("");

    cart.forEach(function (qty, pid) {
      var p = catalog[pid];
      if (!p) return;
      var price = p.price != null ? money(p.price * qty) : "precio por confirmar";
      lines.push("• " + p.name + (p.size ? " " + p.size : "") + " × " + qty + " — " + price);
    });

    lines.push("");
    lines.push("Subtotal: " + money(subtotal()));
    lines.push("Domicilio: " + (delivery() === 0 ? "Gratis" : money(delivery())));
    lines.push("*TOTAL: " + money(total()) + "*");
    lines.push("");
    lines.push("👤 " + data.name);
    lines.push("📱 " + data.phone);
    lines.push("📍 " + data.zone);
    lines.push("🏠 " + data.address);
    lines.push("💳 " + data.payment);
    if (data.notes) lines.push("📝 " + data.notes);
    lines.push("");
    lines.push("Confirmo que tengo 18 años o más.");
    return lines.join("\n");
  }

  function fieldError(name, message) {
    var el = document.querySelector('[data-err="' + name + '"]');
    if (!el) return;
    if (message) { el.textContent = message; el.hidden = false; }
    else { el.textContent = ""; el.hidden = true; }
  }

  function markInvalid(input, invalid) {
    if (!input) return;
    input.classList.toggle("invalid", !!invalid);
    input.setAttribute("aria-invalid", invalid ? "true" : "false");
  }

  function validate(data, fields) {
    var ok = true;
    var firstBad = null;

    var checks = [
      ["name", "Escribe tu nombre.", data.name.trim().length >= 2, fields.name],
      ["phone", "Celular de 10 dígitos que empiece por 3.", /^3\d{9}$/.test(data.phone.replace(/\D/g, "")), fields.phone],
      ["zone", "Dinos el barrio para calcular la entrega.", data.zone.trim().length >= 3, fields.zone],
      ["address", "Escribe la dirección con número.", data.address.trim().length >= 5, fields.address]
    ];

    checks.forEach(function (c) {
      fieldError(c[0], c[2] ? "" : c[1]);
      markInvalid(c[3], !c[2]);
      if (!c[2]) { ok = false; if (!firstBad) firstBad = c[3]; }
    });

    var adult = !!(fields.adult && fields.adult.checked);
    fieldError("adult", adult ? "" : "Debes confirmar que eres mayor de 18 años.");
    markInvalid(fields.adult, !adult);
    if (!adult) { ok = false; if (!firstBad) firstBad = fields.adult; }

    if (firstBad && firstBad.focus) firstBad.focus();
    return ok;
  }

  /* ---------------------------- eventos ---------------------------- */
  function bindStatic() {
    // Carrito
    $("#openCart").addEventListener("click", openCart);
    $("#closeDrawer").addEventListener("click", closeCart);
    drawerBack.addEventListener("click", function (e) {
      if (e.target === drawerBack) closeCart();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !drawerBack.hidden) closeCart();
    });

    // Delegación en el catálogo
    grid.addEventListener("click", function (e) {
      var t = e.target.closest("[data-add],[data-inc],[data-dec],[data-quote]");
      if (!t) return;
      if (t.dataset.quote) {
        openWhatsApp("Hola, quiero cotizar un combo para mi reunión. ¿Qué me recomiendan?");
        return;
      }
      if (t.dataset.add) return addToCart(Number(t.dataset.add));
      if (t.dataset.inc) return changeQty(Number(t.dataset.inc), 1);
      if (t.dataset.dec) return changeQty(Number(t.dataset.dec), -1);
    });

    // Delegación en el carrito
    cartItemsEl.addEventListener("click", function (e) {
      var t = e.target.closest("[data-inc],[data-dec],[data-remove]");
      if (!t) return;
      if (t.dataset.remove) return removeItem(Number(t.dataset.remove));
      if (t.dataset.inc) return changeQty(Number(t.dataset.inc), 1);
      if (t.dataset.dec) return changeQty(Number(t.dataset.dec), -1);
    });

    // Categorías
    chipsEl.addEventListener("click", function (e) {
      var chip = e.target.closest("[data-cat]");
      if (!chip) return;
      state.cat = chip.dataset.cat;
      renderChips();
      renderGrid();
      $("#catalogo").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // Orden
    $("#sort").addEventListener("change", function (e) {
      state.sort = e.target.value;
      renderGrid();
    });

    // Buscador
    var searchToggle = $("#searchToggle");
    var searchBar = $("#searchBar");
    var searchInput = $("#search");
    var searchClear = $("#searchClear");

    searchToggle.addEventListener("click", function () {
      var open = searchBar.hidden;
      searchBar.hidden = !open;
      searchToggle.setAttribute("aria-expanded", String(open));
      if (open) {
        searchInput.focus();
      } else if (state.query) {
        state.query = "";
        searchInput.value = "";
        searchClear.hidden = true;
        renderGrid();
      }
    });

    var searchTimer;
    searchInput.addEventListener("input", function () {
      var value = searchInput.value;
      searchClear.hidden = !value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        state.query = value.trim();
        renderGrid();
      }, 140);
    });

    searchClear.addEventListener("click", function () {
      searchInput.value = "";
      searchClear.hidden = true;
      state.query = "";
      renderGrid();
      searchInput.focus();
    });

    // Enlaces de WhatsApp
    $$("[data-wa]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        openWhatsApp(a.dataset.waMsg || "Hola, quiero hacer un pedido de licores.");
      });
    });

    // Copiar / nuevo pedido
    $("#copyOrder").addEventListener("click", function () {
      var text = lastOrderText;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { toast("Pedido copiado"); },
          function () { toast("No se pudo copiar"); });
      } else {
        toast("Copia manual: mantén pulsado el resumen");
      }
    });

    $("#newOrder").addEventListener("click", function () {
      $("#viewDone").hidden = true;
      $("#viewCart").hidden = false;
      cart.clear();
      renderAll();
      var form = $("#checkout");
      if (form) form.reset();
      closeCart();
      toast("Pedido anterior enviado. Arma uno nuevo.");
    });

    // Formulario
    var form = $("#checkout");
    var fields = {
      name: $("#fName"),
      phone: $("#fPhone"),
      zone: $("#fZone"),
      address: $("#fAddress"),
      notes: $("#fNotes"),
      adult: $("#fAdult")
    };

    // Recordar datos del cliente
    var saved = STORE.get(K_DATA, null);
    if (saved) {
      ["name", "phone", "zone", "address"].forEach(function (k) {
        if (saved[k] && fields[k]) fields[k].value = saved[k];
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!cart.size) { toast("Agrega al menos un producto"); return; }

      var radio = form.querySelector('input[name="payment"]:checked');
      var data = {
        name: (fields.name.value || "").trim(),
        phone: (fields.phone.value || "").trim(),
        zone: (fields.zone.value || "").trim(),
        address: (fields.address.value || "").trim(),
        notes: (fields.notes.value || "").trim(),
        payment: (radio && radio.value) || "Efectivo contraentrega"
      };

      if (!validate(data, fields)) { toast("Revisa los datos marcados"); return; }

      STORE.set(K_DATA, { name: data.name, phone: data.phone, zone: data.zone, address: data.address });

      var id = orderId();
      lastOrderText = buildOrder(id, data);
      var url = openWhatsApp(lastOrderText);

      // El pedido ya salió: se vacía el carrito pero se conserva el resumen.
      cart.clear();
      saveCart();
      renderAll();

      $("#doneId").textContent = id;
      $("#doneWa").href = url;
      $("#viewCart").hidden = true;
      $("#viewDone").hidden = false;
      drawerBack.hidden = false;
      $("#drawerTitle").textContent = "Pedido enviado";

      toast("Pedido " + id + " listo");
    });

    // Año
    var yearEl = $("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ---------------------------- puerta de edad ---------------------------- */
  function setupAgeGate() {
    var gate = $("#ageGate");
    var ok = STORE.get(K_AGE, false);

    if (!ok) {
      gate.hidden = false;
      document.body.style.overflow = "hidden";
    }

    $("#gateYes").addEventListener("click", function () {
      STORE.set(K_AGE, true);
      gate.hidden = true;
      document.body.style.overflow = "";
    });

    $("#gateNo").addEventListener("click", function () {
      document.querySelector(".gate-card").innerHTML =
        '<h1 class="gate-title">Lo sentimos</h1>' +
        '<p class="gate-text">Solo vendemos bebidas alcohólicas a mayores de 18 años. Gracias por tu comprensión.</p>' +
        '<p class="gate-legal">Ley 124 de 1994 · Consume con responsabilidad.</p>';
    });
  }

  /* ---------------------------- arranque ---------------------------- */
  function init() {
    bindStatic();
    renderChips();
    renderAll();
    setupAgeGate();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
