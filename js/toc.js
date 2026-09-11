// Indice lateral (tabla de contenidos) para las paginas de reporte.
//
// Uso: la pagina debe tener
//   <div class="layout-reporte">
//     <aside class="toc" id="toc"></aside>
//     <main id="contenido"> ...las .report-card... </main>
//   </div>
// y cargar este script. El indice se construye leyendo los <h1>/<h2> que ya
// existen en el documento, asi que no hay que mantener dos listas en paralelo.
//
// Accesibilidad:
//   - <nav aria-label> con lista real de enlaces (navegable por teclado)
//   - aria-current="location" en la seccion visible: el estado no se comunica
//     solo con color
//   - en movil colapsa en un <details>, que ya es accesible de fabrica
//   - el resaltado por scroll usa IntersectionObserver; si no existe, el
//     indice sigue funcionando como lista de enlaces normal
(function () {
    function iniciar() {
        var caja = document.getElementById('toc');
        var contenido = document.getElementById('contenido');
        if (!caja || !contenido) return;

        // 1. Recolectar destinos: secciones con id + tarjetas de tarea.
        var destinos = [];
        contenido.querySelectorAll('section[id], .report-card[id]').forEach(function (el) {
            var titulo = el.querySelector('h1, h2');
            if (!titulo) return;
            var texto = titulo.textContent.trim().replace(/\s+/g, ' ');
            destinos.push({ id: el.id, texto: texto, esTarea: /^tarea/i.test(el.id) });
        });
        if (!destinos.length) return;

        function grupo(lista, titulo) {
            if (!lista.length) return '';
            return '<p class="toc-grupo">' + titulo + '</p><ul>' + lista.map(function (d) {
                return '<li><a href="#' + d.id + '">' + d.texto + '</a></li>';
            }).join('') + '</ul>';
        }

        var guiado = destinos.filter(function (d) { return !d.esTarea; });
        var tareas = destinos.filter(function (d) { return d.esTarea; });

        var interior =
            '<nav aria-label="Índice del reporte">' +
                grupo(guiado, 'Ejercicio guiado') +
                grupo(tareas, 'Trabajo en casa') +
            '</nav>';

        caja.innerHTML =
            '<div class="toc-fijo">' +
                '<details class="toc-plegable" open>' +
                    '<summary>Índice</summary>' +
                    interior +
                '</details>' +
            '</div>';

        // 2. Resaltar la seccion visible.
        var enlaces = {};
        caja.querySelectorAll('a[href^="#"]').forEach(function (a) {
            enlaces[a.getAttribute('href').slice(1)] = a;
        });

        var actual = null;
        function marcar(id) {
            if (id === actual) return;
            if (actual && enlaces[actual]) enlaces[actual].removeAttribute('aria-current');
            actual = id;
            if (enlaces[id]) {
                enlaces[id].setAttribute('aria-current', 'location');
                // Mantener visible el enlace activo dentro del indice con scroll propio.
                var nav = caja.querySelector('nav');
                if (nav && nav.scrollHeight > nav.clientHeight) {
                    var a = enlaces[id];
                    var arriba = a.offsetTop - nav.offsetTop;
                    if (arriba < nav.scrollTop || arriba > nav.scrollTop + nav.clientHeight - 40) {
                        nav.scrollTop = arriba - nav.clientHeight / 2;
                    }
                }
            }
        }

        // Resaltado por posicion: la seccion activa es la ultima cuyo inicio ya
        // paso la linea de lectura (un poco debajo del nav sticky). Es
        // deterministico y no depende de cuanto ocupe cada seccion, a
        // diferencia de observar intersecciones de bloques que se anidan.
        var LINEA = 120;

        function recalcular() {
            var elegido = destinos[0].id;
            for (var i = 0; i < destinos.length; i++) {
                var el = document.getElementById(destinos[i].id);
                if (el && el.getBoundingClientRect().top <= LINEA) elegido = destinos[i].id;
                else break;
            }
            // Al final del documento, marcar siempre la ultima seccion aunque
            // su inicio no haya cruzado la linea (no alcanza a hacerlo).
            if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
                elegido = destinos[destinos.length - 1].id;
            }
            marcar(elegido);
        }

        // Se calcula directamente en el evento (son ~20 mediciones, barato) en
        // vez de diferirlo a requestAnimationFrame: los rAF se estrangulan
        // cuando la pestaña no está visible y el resaltado se quedaba pegado.
        window.addEventListener('scroll', recalcular, { passive: true });
        window.addEventListener('resize', recalcular);

        // Al navegar por enlace (del propio indice o de "volver arriba") el
        // salto puede no generar eventos de scroll; se marca el destino de
        // inmediato y se reajusta cuando el desplazamiento suave termina.
        caja.addEventListener('click', function (e) {
            var a = e.target.closest('a[href^="#"]');
            if (!a) return;
            marcar(a.getAttribute('href').slice(1));
            setTimeout(recalcular, 600);
        });
        window.addEventListener('hashchange', function () {
            if (location.hash.length > 1) marcar(location.hash.slice(1));
            setTimeout(recalcular, 600);
        });

        recalcular();

        // En pantallas chicas el indice arranca plegado.
        var plegable = caja.querySelector('.toc-plegable');
        function ajustarPliegue() {
            if (window.matchMedia('(max-width: 1020px)').matches) plegable.removeAttribute('open');
            else plegable.setAttribute('open', '');
        }
        ajustarPliegue();
        window.addEventListener('resize', ajustarPliegue);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();
