// Menu global compartido por todo el sitio.
// Cada pagina solo necesita:
//   <div id="menu-global" data-base="../"></div>   (justo despues de <body>)
//   <script src="../js/include.js"></script>       (antes de </body>)
// data-base indica cuantos niveles hay que subir para llegar a index.html
// (las paginas de tareas/ejercicios estan un nivel bajo de html/, por eso "../";
// en el propio index.html data-base se deja vacio "").
(function () {
    function iniciar() {
        var contenedor = document.getElementById('menu-global');
        if (!contenedor) return;

        var base = contenedor.dataset.base || '';
        var esInicio = document.querySelectorAll('.seccion').length > 0;

        var navHtml;
        if (esInicio) {
            // En index.html el menu cambia de "pestana" dentro de la misma pagina.
            navHtml =
                '<li><a href="#" class="nav-link" data-seccion="inicio">Inicio</a></li>' +
                '<li><a href="#" class="nav-link" data-seccion="reportes">Ejercicios Guiados</a></li>' +
                '<li><a href="#" class="nav-link" data-seccion="tareas">Tareas En Casa</a></li>';
        } else {
            // En cualquier otra pagina, el menu regresa al index y abre la seccion correcta.
            navHtml =
                '<li><a href="' + base + 'index.html">Inicio</a></li>' +
                '<li><a href="' + base + 'index.html#reportes">Ejercicios Guiados</a></li>' +
                '<li><a href="' + base + 'index.html#tareas">Tareas En Casa</a></li>';
        }

        contenedor.innerHTML =
            '<header>' +
                '<h1>🖥️ Integración Aplicaciones Computacionales</h1>' +
                '<p>Portafolio Académico - Ana Paola Loredo Moreno</p>' +
            '</header>' +
            '<nav><ul>' + navHtml + '</ul></nav>';

        if (!esInicio) return;

        function mostrarSeccion(nombre) {
            document.querySelectorAll('.seccion').forEach(function (sec) {
                sec.classList.toggle('activa', sec.id === nombre);
            });
            document.querySelectorAll('.nav-link').forEach(function (link) {
                link.classList.toggle('activa', link.dataset.seccion === nombre);
            });
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
