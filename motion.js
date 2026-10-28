/* ==========================================================================
   Movimiento — capa separada del comportamiento de tienda.
   Todo degrada bien: si este archivo falla, la página sigue funcionando y
   visible; si el usuario pide menos movimiento, no se anima nada.
   ========================================================================== */
(function () {
  "use strict";

  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (reduce) return;

  document.body.classList.add("motion");

  /* ------------------------- 1. entrada de la portada -------------------- */
  requestAnimationFrame(function () {
    document.body.classList.add("ready");
  });

  /* --------------------------- 2. revelado al ver ------------------------ */
  var io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in", "in-view");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
  }

  function watch(el, inmediato) {
    if (!el) return;
    if (inmediato || !io) {
      el.classList.add("is-in", "in-view");
      return;
    }
    io.observe(el);
  }

  document.querySelectorAll("[data-reveal]").forEach(function (el) { watch(el); });

  /* Las fichas se re-pintan al buscar u ordenar: hay que volver a observarlas */
  var grid = document.getElementById("grid");
  if (grid) {
    var observer = new MutationObserver(function () {
      var cards = grid.querySelectorAll(".card");
      /* Si ya hubo un primer pintado, esto es una actualización por cantidad
         o por búsqueda: se muestra al instante para que no parpadee. */
      var yaPintado = grid.dataset.pintado === "1";
      Array.prototype.forEach.call(cards, function (card, i) {
        if (card.dataset.watched) return;
        card.dataset.watched = "1";
        card.style.setProperty("--i", i % 10);
        watch(card, yaPintado);
      });
      grid.dataset.pintado = "1";
    });
    observer.observe(grid, { childList: true });

    Array.prototype.forEach.call(grid.querySelectorAll(".card"), function (card, i) {
      var yaPintado = grid.dataset.pintado === "1";
      card.dataset.watched = "1";
      card.style.setProperty("--i", i % 10);
      watch(card, yaPintado);
    });
    if (grid.querySelector(".card")) grid.dataset.pintado = "1";
  }

  /* --------------------------- 3. cinta continua ------------------------- */
  var track = document.getElementById("tickerTrack");
  if (track) {
    var group = track.innerHTML;
    track.innerHTML = group + group;
  }

  /* --------------------------- 4. cabecera al bajar ---------------------- */
  var top = document.getElementById("top");
  if (top) {
    var pendiente = false;
    var alScroll = function () {
      pendiente = false;
      top.dataset.stuck = window.scrollY > 28 ? "true" : "false";
    };
    window.addEventListener("scroll", function () {
      if (!pendiente) {
        pendiente = true;
        requestAnimationFrame(alScroll);
      }
    }, { passive: true });
    alScroll();
  }

  /* ----------------------- 5. contador del carrito ----------------------- */
  var badge = document.getElementById("cartBarCount");
  if (badge) {
    var anterior = badge.textContent;
    new MutationObserver(function () {
      if (badge.textContent === anterior) return;
      anterior = badge.textContent;
      badge.classList.remove("pop");
      void badge.offsetWidth;
      badge.classList.add("pop");
    }).observe(badge, { childList: true, characterData: true, subtree: true });
  }

  /* --------------------------- 6. cifras que suben ----------------------- */
  function pesos(n) {
    return "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function contar(el) {
    if (!el || el.dataset.animando === "1") return;
    var destino = parseInt((el.textContent || "").replace(/\D/g, ""), 10);
    if (isNaN(destino)) return;

    var desde = parseInt(el.dataset.valor || "0", 10);
    el.dataset.valor = destino;

    if (desde === destino) return;
    el.dataset.animando = "1";

    var inicio = performance.now();
    var duracion = 340;

    function paso(t) {
      var k = Math.min(1, (t - inicio) / duracion);
      var suave = 1 - Math.pow(1 - k, 3);
      el.textContent = pesos(desde + (destino - desde) * suave);
      if (k < 1) requestAnimationFrame(paso);
      else {
        el.textContent = pesos(destino);
        el.dataset.animando = "0";
      }
    }
    requestAnimationFrame(paso);
  }

  ["tTotal", "cartBarTotal", "tSubtotal"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.dataset.valor = (el.textContent || "").replace(/\D/g, "") || "0";
    new MutationObserver(function () { contar(el); })
      .observe(el, { childList: true, characterData: true, subtree: true });
  });
})();
