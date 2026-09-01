"""
classifier.py
Interfaz de línea de comandos (CLI) del clasificador Cloud.
Usa exactamente la misma lógica que la GUI (gui_app.py), importada
desde classifier_service.py.

Uso:
    python classifier.py --text "ejecutar una funcion cuando se suba una imagen"
    python classifier.py --text "..." --detalle
    python classifier.py --text "..." --nombre Ana --apellido Loredo
"""

import argparse
import sys

from classifier_service import clasificar, validar_datos, ValidacionError


def construir_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="classifier.py",
        description="Clasifica una descripción de servicio Cloud en "
                     "IaaS, PaaS, SaaS o FaaS.",
    )
    parser.add_argument(
        "--text", "-t", required=True,
        help="Texto/descripción del servicio Cloud a clasificar.",
    )
    parser.add_argument(
        "--nombre", default="",
        help="Nombre del usuario (opcional).",
    )
    parser.add_argument(
        "--apellido", default="",
        help="Apellido del usuario (opcional).",
    )
    parser.add_argument(
        "--detalle", action="store_true",
        help="Muestra el puntaje por cada categoría.",
    )
    return parser


def main(argv=None) -> int:
    parser = construir_parser()
    args = parser.parse_args(argv)

    try:
        if args.nombre or args.apellido:
            validar_datos(args.nombre, args.apellido, args.text)
    except ValidacionError as e:
        print(f"Error de validación: {e}", file=sys.stderr)
        return 1

    resultado = clasificar(args.text)

    if args.nombre or args.apellido:
        print(f"{args.nombre} {args.apellido}".strip() + " ->", end=" ")
    print(f"Modelo identificado: {resultado.categoria_ganadora}")

    if args.detalle:
        print("Detalle de coincidencias por categoria:")
        print(resultado.detalle())

    return 0


if __name__ == "__main__":
    sys.exit(main())
