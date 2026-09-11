// Menu global compartido por todo el sitio.
// Cada pagina solo necesita:
//   <div id="menu-global" data-base="../"></div>   (justo despues de <body>)
//   <script src="../js/include.js"></script>       (antes de </body>)
// data-base indica cuantos niveles hay que subir para llegar a index.html
// (las paginas de tareas/ejercicios estan un nivel bajo de html/, por eso "../";
// en el propio index.html data-base se deja vacio "").
//
// Accesibilidad implementada aqui:
//   - enlace "saltar al contenido" (primer tabulable de la pagina)
//   - landmarks reales: <header>, <nav aria-label>, y el <main> de cada pagina
//   - aria-current marca la ubicacion actual (lo anuncian los lectores de pantalla,
//     no solo el color, que por si solo no es informacion accesible)
//   - menu colapsable en movil con aria-expanded/aria-controls
(function () {
    function iniciar() {
        var contenedor = document.getElementById('menu-global');
        if (!contenedor) return;

        var base = contenedor.dataset.base || '';
        var esInicio = document.querySelectorAll('.seccion').length > 0;

        var enlaces = esInicio
            ? [
                { id: 'inicio', texto: 'Inicio', href: '#' },
                { id: 'reportes', texto: 'Ejercicios guiados', href: '#' },
                { id: 'tareas', texto: 'Tareas en casa', href: '#' }
              ]
            : [
                { texto: 'Inicio', href: base + 'index.html' },
                { texto: 'Ejercicios guiados', href: base + 'index.html#reportes' },
                { texto: 'Tareas en casa', href: base + 'index.html#tareas' }
              ];

        var lis = enlaces.map(function (e) {
            var attrs = e.id ? ' class="nav-link" data-seccion="' + e.id + '"' : '';
            return '<li><a href="' + e.href + '"' + attrs + '>' + e.texto + '</a></li>';
        }).join('');

        // Destino del "saltar al contenido": el <main> de la pagina si existe,
        // y si no, el primer bloque de contenido real.
        var destino = document.querySelector('main[id]');
        var idDestino = destino ? destino.id : 'contenido-principal';
        if (!destino) {
            var primero = document.querySelector('main, .report-card');
            if (primero && !primero.id) primero.id = idDestino;
            else if (primero) idDestino = primero.id;
        }

        contenedor.innerHTML =
            '<a class="skip-link" href="#' + idDestino + '">Saltar al contenido</a>' +
            '<header class="sitio-header">' +
                '<div class="contenedor">' +
                    '<a class="sitio-marca" href="' + base + 'index.html">' +
                        '<span class="emblema" aria-hidden="true">🖥️</span>' +
                        '<span>' +
                            '<h1>Integración de Aplicaciones Computacionales</h1>' +
                            '<p>Portafolio académico · Ana Paola Loredo Moreno</p>' +
                        '</span>' +
                    '</a>' +
                '</div>' +
            '</header>' +
            '<nav class="sitio-nav" aria-label="Navegación principal">' +
                '<div class="contenedor">' +
                    '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-lista">' +
                        '<span aria-hidden="true">☰</span> Menú' +
                    '</button>' +
                    '<ul id="nav-lista">' + lis + '</ul>' +
                '</div>' +
            '</nav>';

        // --- Menu movil ---
        var boton = contenedor.querySelector('.nav-toggle');
        var lista = contenedor.querySelector('#nav-lista');
        boton.addEventListener('click', function () {
            var abierto = lista.classList.toggle('abierto');
            boton.setAttribute('aria-expanded', String(abierto));
        });

        if (!esInicio) return;

        function mostrarSeccion(nombre) {
            document.querySelectorAll('.seccion').forEach(function (sec) {
                sec.classList.toggle('activa', sec.id === nombre);
            });
            contenedor.querySelectorAll('.nav-link').forEach(function (link) {
                if (link.dataset.seccion === nombre) {
                    link.setAttribute('aria-current', 'true');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
            lista.classList.remove('abierto');
            boton.setAttribute('aria-expanded', 'false');
        }
        window.mostrarSeccion = mostrarSeccion;

        contenedor.querySelectorAll('.nav-link').forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                history.replaceState(null, '', '#' + link.dataset.seccion);
                mostrarSeccion(link.dataset.seccion);
            });
        });

        // Si se llega con un hash (p.ej. ../index.html#tareas desde otra pagina),
        // abre esa seccion directamente en vez de siempre "inicio".
        var deseada = (location.hash || '#inicio').slice(1);
        if (!document.getElementById(deseada)) deseada = 'inicio';
        mostrarSeccion(deseada);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();
