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
  var K_AGE = "lm.edad.v1";

  /* ---------------------------- estado ---------------------------- */
  var catalog = {};
  var list = [];

  PRODUCTS.forEach(function (p) {
    if (p.hidden) return;
    p.key = String(p.id);
    catalog[p.key] = p;
    list.push(p);

    // Un producto con variantes (tapas de color) se vende por separado:
    // cada color es su propia línea del pedido, con su foto.
    if (p.variants) {
      p.variants.forEach(function (v) {
        var sk = p.key + "|" + v.key;
        v.sku = sk;
        catalog[sk] = {
          id: p.id, key: sk, short: v.name, color: v.color || "",
          name: p.name + " · " + v.name,
          cat: p.cat, size: v.size || p.size,
          price: v.price != null ? v.price : p.price,
          desc: p.desc, img: v.img || ""
        };
      });
    }
  });

  function sellable(key) {
    var p = catalog[key];
    if (!p) return null;
    if (!p.variants) return p;
    return catalog[p.key + "|" + p.variants[0].key] || null;
  }

  var cart = new Map();
  var state = { query: "", sort: "default" };

  // Recuperar carrito guardado (ignorando productos que ya no existen)
  (function restoreCart() {
    var saved = STORE.get(K_CART, {});
    Object.keys(saved).forEach(function (key) {
      var qty = parseInt(saved[key], 10);
      if (!(qty > 0)) return;
      var p = catalog[key];
      if (!p) return;
      // carritos viejos guardados por id numérico
      var target = p.variants ? sellable(key) : p;
      if (target) cart.set(target.key, qty);
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
  var emptyEl = $("#empty");
  var resultsEl = $("#results");

  function matchesSearch(p, q) {
    if (!q) return true;
    return normalize(p.name + " " + catName(p.cat) + " " + (p.desc || "") + " " + (p.size || "")).indexOf(q) !== -1;
  }

  function visibleProducts() {
    var q = normalize(state.query);
    var out = list.filter(function (p) { return matchesSearch(p, q); });
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
    return '<div class="ph" aria-hidden="true"><span class="ph-initial">' + initialOf(p.name) + "</span></div>";
  }

  function controlHTML(p) {
    if (p.variants) {
      return '<button class="add add-pick" data-quick="' + p.key + '" ' +
        'aria-label="Elegir el color de ' + p.name + '">+</button>';
    }
    var qty = cart.get(p.key) || 0;
    if (!qty) {
      return '<button class="add" data-add="' + p.key + '" aria-label="Agregar ' + p.name + ' al pedido">+</button>';
    }
    return '<div class="stepper">' +
      '<button data-dec="' + p.key + '" aria-label="Quitar uno de ' + p.name + '">−</button>' +
      '<span class="qty" aria-live="polite">' + qty + "</span>" +
      '<button data-inc="' + p.key + '" aria-label="Agregar otro ' + p.name + '">+</button>' +
      "</div>";
  }

  function cardHTML(p) {
    var desde = null;
    if (p.variants) {
      var precios = p.variants.map(function (v) { return v.price != null ? v.price : p.price; });
      if (Math.max.apply(null, precios) !== Math.min.apply(null, precios)) {
        desde = Math.min.apply(null, precios);
      }
    }
    var priceHTML = desde != null
      ? '<span class="price">desde ' + money(desde) + '</span>'
      : p.price == null
        ? '<span class="ask">Consultar</span>'
        : '<span class="price">' + money(p.price) + '<small> c/u</small></span>';

    return '<article class="card">' +
      '<div class="card-media" data-quick="' + p.key + '" role="button" tabindex="0" ' +
        (p.variants ? 'data-rotate="' + p.key + '" data-n="0" ' : "") +
        'aria-label="Ver ' + p.name + ' de cerca">' +
        (p.tag ? '<span class="tag">' + p.tag + "</span>" : "") +
        mediaHTML(p) +
      "</div>" +
      '<div class="card-body">' +
        '<h3 class="card-name">' + p.name + "</h3>" +
        '<span class="card-size">' + (p.size || "") + "</span>" +
        '<div class="card-foot">' + priceHTML + controlHTML(p) + "</div>" +
      "</div>" +
    "</article>";
  }

  function renderGrid() {
    var items = visibleProducts();
    grid.innerHTML = items.map(cardHTML).join("");
    emptyEl.hidden = items.length > 0;
    grid.hidden = items.length === 0;

    resultsEl.textContent = items.length
      ? items.length + (items.length === 1 ? " producto" : " productos")
      : "Sin resultados para \u201c" + state.query + "\u201d";
  }

  /* ------------------- rotación de fotos en el catálogo -------------------- */
  var gridRot = null;

  function tickGrid() {
    if (document.hidden) return;
    $$('#grid .card-media[data-rotate]').forEach(function (el) {
      var p = catalog[el.dataset.rotate];
      if (!p || !p.variants) return;
      var n = (parseInt(el.dataset.n, 10) + 1) % p.variants.length;
      el.dataset.n = n;
      var v = p.variants[n];
      var img = el.querySelector("img");
      if (img && v.img && img.getAttribute("src") !== v.img) {
        img.src = v.img;
        img.classList.remove("swap");
        void img.offsetWidth;
        img.classList.add("swap");
      }
    });
  }

  function startGridRotate() {
    if (gridRot) clearInterval(gridRot);
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!list.some(function (p) { return p.variants; })) return;
    gridRot = setInterval(tickGrid, 1000);
  }

  /* ---------------------------- vista rápida ------------------------------ */
  var quickBack = $("#quickBack");
  var quickPanel = quickBack ? quickBack.querySelector(".quick") : null;
  var quickId = "";   // producto que se está mirando
  var quickPick = ""; // presentación elegida (color)

  function specsOf(p) {
    var out = [];
    if (p.short) out.push("Opción: " + p.short);
    if (p.size) out.push("Contenido: " + p.size);
    var cat = (CATEGORIES.filter(function (c) { return c.id === p.cat; })[0] || {}).name;
    if (cat) out.push("Categoría: " + cat);
    if (p.desc) out.push(p.desc);
    return out.slice(0, 3);
  }

  function syncQuick() {
    var p = catalog[quickId];
    var sel = catalog[quickPick];
    if (!p || !sel) return;

    $("#quickMedia").innerHTML = sel.img
      ? '<img src="' + sel.img + '" alt="' + sel.name + '" width="810" height="891">'
      : sel.short
        ? '<div class="ph-color" aria-hidden="true"><i style="background:' + (sel.color || "#C9BFA8") +
          '"></i><b>' + sel.short + "</b></div>"
        : '<div class="ph-lg" aria-hidden="true">' + initialOf(sel.name) + "</div>";

    $("#quickName").textContent = p.short ? p.name.split(" · ")[0] + " · " + p.short : p.name;
    $("#quickPrice").textContent = sel.price != null ? money(sel.price) : "Consultar precio";

    $$("#quickVariants .swatch").forEach(function (b) {
      var on = b.dataset.variant === quickPick;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", String(on));
    });

    var n = cart.get(quickPick) || 0;
    var qty = $("#quickQty");
    qty.hidden = n === 0;
    if (n > 0) qty.textContent = "Ya llevas " + n + " en el pedido.";

    $("#quickAdd").textContent = n > 0 ? "Agregar otro" : "Agregar al pedido";
  }

  function openQuick(key) {
    var p = catalog[key];
    if (!p) return;
    quickId = p.key;
    quickPick = p.variants ? p.key + "|" + p.variants[0].key : p.key;

    $("#quickName").textContent = p.name;

    var box = $("#quickVariants");
    if (p.variants) {
      box.hidden = false;
      box.innerHTML = p.variants.map(function (v) {
        return '<button class="swatch" type="button" data-variant="' + v.sku + '" aria-pressed="false">' +
          '<i style="background:' + v.color + '"></i>' + v.name + "</button>";
      }).join("");
    } else {
      box.hidden = true;
      box.innerHTML = "";
    }

    $("#quickSpecs").innerHTML = specsOf(p).map(function (x) {
      return "<li>" + x + "</li>";
    }).join("");

    syncQuick();
    quickBack.classList.remove("is-out");
    quickBack.hidden = false;
    startRotate();
    document.body.style.overflow = "hidden";
    $("#quickClose").focus();
  }

  var rotTimer = null;

  function puedeRotar() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    var p = catalog[quickId];
    return !!(p && p.variants && p.variants.length > 1);
  }

  function rotar() {
    var p = catalog[quickId];
    if (!p || !p.variants) return;
    var i = -1;
    p.variants.forEach(function (v, n) { if (v.sku === quickPick) i = n; });
    var sig = p.variants[(i + 1) % p.variants.length];
    quickPick = sig.sku;
    syncQuick();
  }

  function stopRotate() {
    if (rotTimer) clearInterval(rotTimer);
    rotTimer = null;
  }

  function startRotate() {
    stopRotate();
    if (!puedeRotar()) return;
    rotTimer = setInterval(rotar, 1000);
  }

  function closeQuick() {
    if (quickBack.hidden) return;
    stopRotate();
    quickBack.classList.add("is-out");
    setTimeout(function () {
      quickBack.hidden = true;
      quickBack.classList.remove("is-out");
      if (quickPanel) {
        quickPanel.style.transform = "";
        quickPanel.style.transition = "";
      }
      document.body.style.overflow = "";
    }, 250);
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
        '<button class="ci-del" data-remove="' + p.key + '">Quitar</button>' +
      "</div>" +
      '<div class="ci-right">' +
        '<div class="stepper">' +
          '<button data-dec="' + p.key + '" aria-label="Quitar uno de ' + p.name + '">−</button>' +
          '<span class="qty">' + qty + "</span>" +
          '<button data-inc="' + p.key + '" aria-label="Agregar otro ' + p.name + '">+</button>' +
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

  function buildOrder(id) {
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
    lines.push("*TOTAL: " + money(total()) + "*");
    lines.push("");
    lines.push("Te paso los datos de entrega por aquí: nombre, celular, barrio y dirección.");
    lines.push("");
    lines.push("Confirmo que tengo 18 años o más.");
    return lines.join("\n");
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
      if (e.key !== "Escape") return;
      if (!quickBack.hidden) return closeQuick();
      if (!drawerBack.hidden) closeCart();
    });

    // Delegación en el catálogo
    grid.addEventListener("click", function (e) {
      var abre = e.target.closest("[data-quick]");
      if (abre && !e.target.closest("[data-add],[data-inc],[data-dec]")) {
        return openQuick(abre.dataset.quick);
      }
      var t = e.target.closest("[data-add],[data-inc],[data-dec]");
      if (!t) return;
      if (t.dataset.add) return addToCart(t.dataset.add);
      if (t.dataset.inc) return changeQty(t.dataset.inc, 1);
      if (t.dataset.dec) return changeQty(t.dataset.dec, -1);
    });

    grid.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var abre = e.target.closest("[data-quick]");
      if (!abre) return;
      e.preventDefault();
      openQuick(abre.dataset.quick);
    });

    // Vista rápida
    $("#quickClose").addEventListener("click", closeQuick);
    quickBack.addEventListener("click", function (e) {
      if (e.target === quickBack) closeQuick();
    });
    $("#quickVariants").addEventListener("click", function (e) {
      var b = e.target.closest("[data-variant]");
      if (!b) return;
      quickPick = b.dataset.variant;
      stopRotate();
      syncQuick();
    });
    $("#quickAdd").addEventListener("click", function () {
      var p = catalog[quickPick];
      if (!p) return;
      addToCart(quickPick);
      closeQuick();
    });

    /* Deslizar la ficha hacia abajo para cerrarla.
       Solo engancha cuando el contenido está arriba del todo, para no
       quitarle el scroll normal a las fichas con descripción larga. */
    if (quickPanel) {
      var qy0 = 0, qT0 = 0, qDy = 0, activo = false, moviendo = false;

      function empezar(y) {
        if (quickBack.hidden) return;
        qy0 = y;
        qT0 = Date.now();
        qDy = 0;
        activo = true;
        moviendo = false;
      }

      function mover(y, ev) {
        if (!activo) return;
        var d = y - qy0;
        if (!moviendo) {
          if (Math.abs(d) < 10) return;
          // hacia arriba, o el contenido está desplazado: que scrollee
          if (d < 0 || quickPanel.scrollTop > 0) { activo = false; return; }
          moviendo = true;
          stopRotate();
          quickPanel.style.transition = "none";
        }
        if (ev && ev.cancelable) ev.preventDefault();
        qDy = d < 0 ? 0 : d;
        // resistencia: los primeros 70px acompañan 1:1, luego pesa más
        var t = qDy < 70 ? qDy : 70 + (qDy - 70) * 0.55;
        quickPanel.style.transform = "translateY(" + t + "px)";
      }

      function soltar() {
        if (!activo) return;
        activo = false;
        if (!moviendo) return;
        moviendo = false;
        var ms = Math.max(1, Date.now() - qT0);
        // cierra si arrastró lo suficiente o si fue un gesto rápido
        var cerrar = qDy > 110 || (qDy / ms > 0.5 && qDy > 40);
        quickPanel.style.transition = "";
        if (cerrar) {
          closeQuick();
        } else {
          quickPanel.style.transition = "transform .22s cubic-bezier(.2, .7, .3, 1)";
          quickPanel.style.transform = "";
          setTimeout(function () { quickPanel.style.transition = ""; }, 240);
        }
        qDy = 0;
      }

      // Dedo: touch, así podemos frenar el scroll del navegador mientras arrastramos
      quickPanel.addEventListener("touchstart", function (e) {
        if (e.touches.length !== 1) return;
        empezar(e.touches[0].clientY);
      }, { passive: true });

      quickPanel.addEventListener("touchmove", function (e) {
        mover(e.touches[0].clientY, e);
      }, { passive: false });

      quickPanel.addEventListener("touchend", soltar);
      quickPanel.addEventListener("touchcancel", soltar);

      // Ratón (escritorio): el mismo gesto
      quickPanel.addEventListener("pointerdown", function (e) {
        if (e.pointerType === "touch" || e.button !== 0) return;
        empezar(e.clientY);
      });
      quickPanel.addEventListener("pointermove", function (e) {
        if (e.pointerType === "touch") return;
        mover(e.clientY, e);
      });
      quickPanel.addEventListener("pointerup", function (e) {
        if (e.pointerType === "touch") return;
        soltar();
      });
    }

    // Delegación en el carrito
    cartItemsEl.addEventListener("click", function (e) {
      var t = e.target.closest("[data-inc],[data-dec],[data-remove]");
      if (!t) return;
      if (t.dataset.remove) return removeItem(t.dataset.remove);
      if (t.dataset.inc) return changeQty(t.dataset.inc, 1);
      if (t.dataset.dec) return changeQty(t.dataset.dec, -1);
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

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!cart.size) { toast("Agrega al menos un producto"); return; }

      var id = orderId();
      lastOrderText = buildOrder(id);
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

  /* ------------------------ instalar como app ------------------------ */
  function esStandalone() {
    var pantalla = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
    return !!pantalla || window.navigator.standalone === true;
  }

  function setupServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    if (location.protocol === "file:") return;
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  function setupInstall() {
    var bar = $("#installBar");
    if (!bar) return;

    if (esStandalone() || STORE.get("lm.instalada", false)) return;

    var yes = $("#installYes");
    var no = $("#installNo");
    var nota = $("#installNote");
    var prompt = null;
    var abierta = false;
    var ios = /iPad|iPhone|iPod/.test(navigator.userAgent);

    function mostrar(texto, boton) {
      if (abierta) return;
      abierta = true;
      if (texto) nota.textContent = texto;
      if (boton) yes.textContent = boton;
      bar.hidden = false;
      document.body.classList.add("install-on");
      setTimeout(function () { bar.classList.add("is-in"); }, 20);
    }

    function ocultar(recordar) {
      bar.classList.remove("is-in");
      document.body.classList.remove("install-on");
      if (recordar) STORE.set("lm.instalada", true);
      setTimeout(function () { bar.hidden = true; }, 360);
    }

    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      prompt = e;
      mostrar();
    });

    window.addEventListener("appinstalled", function () {
      STORE.set("lm.instalada", true);
      ocultar(false);
      toast("Listo: ya la tienes instalada");
    });

    if (ios) {
      setTimeout(function () {
        mostrar("Toca Compartir y elige «Añadir a pantalla de inicio».");
        yes.textContent = "Ver cómo";
      }, 7000);
    }

    yes.addEventListener("click", function () {
      if (prompt) {
        prompt.prompt();
        prompt.userChoice.then(function () { prompt = null; ocultar(false); });
      } else if (ios) {
        nota.textContent = "En Safari: Compartir (el cuadro con la flecha) y luego «Añadir a pantalla de inicio».";
      }
    });

    no.addEventListener("click", function () { ocultar(true); });
  }

  /* ---------------------------- arranque ---------------------------- */
  function init() {
    bindStatic();
    renderAll();
    setupAgeGate();
    setupServiceWorker();
    setupInstall();
    startGridRotate();
    setupSello();
  }

  function setupSello() {
    var sello = document.querySelector(".sello");
    if (!sello) return;
    setTimeout(function () { sello.classList.add("is-in"); }, 2000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
