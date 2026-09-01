"""
classifier_service.py
Lógica de negocio del clasificador Cloud (IaaS/PaaS/SaaS/FaaS).
Reimplementación en Python del ClassifierService.java original.

Separación de responsabilidades:
- Este módulo NO conoce nada de GUI ni de CLI.
- GUI (gui_app.py) y CLI (classifier.py) importan y usan las mismas
  funciones de aquí, evitando duplicar lógica.

NLP básico aplicado:
- Normalización (minúsculas, eliminación de tildes).
- Tokenización simple por palabras (regex \\w+).
- Comparación por conjunto de tokens (evita falsos positivos de
  subcadenas, ej. "función" no coincide con "funcional").
- Soporte de keywords multi-palabra (ej. "máquina virtual") mediante
  búsqueda de subsecuencia de tokens.
"""

import re
import unicodedata
from dataclasses import dataclass, field
from typing import Dict, List

# ---------- Bancos de palabras clave por categoría ----------

KEYWORDS_IAAS = [
    "servidor", "servidores", "maquina virtual", "vm",
    "almacenamiento", "storage", "red virtual", "infraestructura",
    "infrastructure", "ec2", "compute engine", "balanceador de carga",
    "load balancer", "disco duro virtual", "hardware", "cpu virtual",
    "capacidad de computo", "networking", "hipervisor",
    "centro de datos", "datacenter",
]

KEYWORDS_PAAS = [
    "plataforma", "platform", "entorno de desarrollo", "runtime",
    "despliegue", "deploy", "heroku", "app engine",
    "elastic beanstalk", "framework", "middleware",
    "base de datos administrada", "azure app service",
    "contenedores administrados", "ci/cd", "entorno de ejecucion",
    "sdk", "herramientas de desarrollo",
]

KEYWORDS_SAAS = [
    "software como servicio", "aplicacion web", "suscripcion",
    "correo electronico", "gmail", "office 365", "salesforce",
    "dropbox", "netflix", "cliente final", "navegador",
    "listo para usar", "sin instalacion", "usuario final",
    "acceso desde el navegador", "aplicacion terminada",
]

KEYWORDS_FAAS = [
    "funcion", "function", "serverless", "sin servidor", "lambda",
    "azure functions", "cloud functions", "evento", "trigger",
    "ejecucion bajo demanda", "event-driven", "eventos", "microtarea",
    "codigo por evento", "escalado automatico a cero",
]

CATEGORIAS: Dict[str, List[str]] = {
    "IaaS - Infraestructura como Servicio": KEYWORDS_IAAS,
    "PaaS - Plataforma como Servicio": KEYWORDS_PAAS,
    "SaaS - Software como Servicio": KEYWORDS_SAAS,
    "FaaS - Funcion como Servicio": KEYWORDS_FAAS,
}


# ---------- NLP básico ----------

def quitar_tildes(texto: str) -> str:
    """Elimina diacríticos (á->a, é->e, etc.) usando normalización unicode."""
    nfkd = unicodedata.normalize("NFD", texto)
    return "".join(c for c in nfkd if unicodedata.category(c) != "Mn")


def normalizar(texto: str) -> str:
    """minúsculas + sin tildes."""
    return quitar_tildes(texto.lower())


def tokenizar(texto: str) -> List[str]:
    """Tokenización simple por palabras (alfanuméricas)."""
    return re.findall(r"\w+", texto, flags=re.UNICODE)


def _contiene_frase(tokens: List[str], frase: str) -> bool:
    """
    True si la secuencia de tokens de `frase` aparece de forma contigua
    dentro de `tokens`. Sirve tanto para keywords de una palabra como
    de varias (ej. "maquina virtual").
    """
    frase_tokens = tokenizar(frase)
    n, m = len(tokens), len(frase_tokens)
    if m == 0 or m > n:
        return False
    for i in range(n - m + 1):
        if tokens[i:i + m] == frase_tokens:
            return True
    return False


def contar_coincidencias(texto_normalizado: str, palabras: List[str]) -> int:
    tokens = tokenizar(texto_normalizado)
    return sum(1 for palabra in palabras if _contiene_frase(tokens, palabra))


# ---------- Resultado ----------

@dataclass
class ResultadoClasificacion:
    categoria_ganadora: str
    puntajes: Dict[str, int] = field(default_factory=dict)

    def detalle(self) -> str:
        return "\n".join(f"  {cat.split(' - ')[0]}: {pts}"
                          for cat, pts in self.puntajes.items())


# ---------- Clasificación ----------

def clasificar(texto_original: str) -> ResultadoClasificacion:
    if not texto_original or not texto_original.strip():
        return ResultadoClasificacion(
            "Sin texto para analizar",
            {cat: 0 for cat in CATEGORIAS},
        )

    texto = normalizar(texto_original)
    puntajes = {cat: contar_coincidencias(texto, kws)
                for cat, kws in CATEGORIAS.items()}

    maximo = max(puntajes.values())
    if maximo == 0:
        categoria = "No concluyente (no se detectaron palabras clave)"
    else:
        # primer empate gana, en el mismo orden que el diccionario
        categoria = next(cat for cat, pts in puntajes.items() if pts == maximo)

    return ResultadoClasificacion(categoria, puntajes)


# ---------- Validación de datos de usuario ----------

class ValidacionError(Exception):
    pass


def validar_datos(nombre: str, apellido: str, descripcion: str) -> None:
    if not nombre or not nombre.strip():
        raise ValidacionError("El nombre no puede estar vacío.")
    if not apellido or not apellido.strip():
        raise ValidacionError("El apellido no puede estar vacío.")
    if not descripcion or not descripcion.strip():
        raise ValidacionError("La descripción no puede estar vacía.")
