# Changelog de cambios asistidos por IA

Formato: fecha — resumen — archivos — referencia al detalle completo.

## 2026-08-31

- **BASE_PATH configurable para reverse proxy `/library`.** La app estaba montada en `"/"`; se
  agregó `BASE_PATH` (con fallback) para montar rutas/estáticos, inyectar `res.locals.basePath` y
  prefijar cada `res.redirect()`, más el ajuste de las 26 vistas EJS con rutas absolutas. Archivos:
  `app.js`, `routes/index.js`, `middlewares/auth.js`, 4 controladores, 26 vistas. Detalle: sección
  10 de `html/ejercicio02/index.html`.
- **Corrección de manejo de error en subida de imágenes (TC-12b) e implementación de búsqueda por
  ISBN/título (RF-05).** `middlewares/upload.js`, `routes/libros.js`, `models/libroModel.js`,
  `controllers/libroController.js`, `views/libros/catalogo.ejs`, `views/libros/detalle.ejs`.
  Detalle: `docs/TEST_PLAN.md`.
- **Triggers y vistas de PostgreSQL agregados** (`trg_una_portada_por_libro`,
  `trg_libros_fecha_actualizacion`, `trg_usuarios_auditoria_rol`, `vista_catalogo_libros`,
  `vista_administradores`, `vista_libros_stock_bajo`). Archivos: `data/library_schema.sql`,
  `data/library_triggers.sql` (nuevo), `data/library_views.sql` (nuevo),
  `models/libroModel.js`. Detalle: `docs/ENGINEERING_DECISIONS.md` (D-13, D-14, D-15).
- **Mostrar `mensajeError` en vistas donde se guardaba pero nunca se leía** (`usuarios/listar.ejs`
  y las 4 vistas `listar.ejs` de catálogos genéricos). Archivos:
  `controllers/usuarioController.js`, `controllers/catalogoController.js`,
  `views/usuarios/listar.ejs`, `views/formatos/listar.ejs`, `views/generos/listar.ejs`,
  `views/autores/listar.ejs`, `views/conceptos/listar.ejs`. Detalle:
  `docs/AI_PROMPT_HISTORY.md`, Entrada 1 — cambio pequeño y verificable ejecutado siguiendo
  `docs/PROMPT_MAESTRO_IA.md` para la Tarea 2e.
- **Bug reportado por la estudiante (probando la app real): columna ID vacía en el listado de
  Autores**, con los links de "Editar"/"Eliminar" apuntando a `/autores/undefined/...`. Causa:
  `catalogoController.js` calcula el nombre de columna de id como
  `` `id_${vista.slice(0, -1)}` `` (quita una sola letra final), lo cual funciona para
  `formatos→formato`, `generos→genero`, `conceptos→concepto`, pero **no** para `autores→autor`
  (plural irregular en español: "autor" + "es", no "autor" + "s" — el resultado era `id_autore`,
  no `id_autor`). Fix: pasar el `idCampo` explícito (`'id_autor'`) al registrar el catálogo de
  autores en `routes/index.js`, en vez de depender del cálculo automático. Archivo modificado:
  `routes/index.js`. Verificado con `curl` contra la app real: la columna ID ya muestra los
  valores reales y los links de editar apuntan a un id numérico, no a `undefined`.
- **Documentación ampliada de `docs/GCP_COMMANDS.md`**: se agregó la sección "7.1" con los 3
  problemas reales resueltos durante el primer despliegue (conflicto de `git pull` con
  `node_modules`, permisos `EACCES` por dueño incorrecto, y `bcrypt` con binario incompatible),
  con los comandos exactos usados en cada caso — reconstruidos revisando la propia conversación
  de depuración, no inventados.
