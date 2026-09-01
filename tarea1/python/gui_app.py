"""
gui_app.py
Interfaz gráfica (Tkinter) del clasificador Cloud.
Reimplementación en Python de MainFrame.java.
Usa exactamente la misma lógica que la CLI, importada desde
classifier_service.py (separación GUI / lógica).

Ejecutar:
    python gui_app.py
"""

import tkinter as tk
from tkinter import ttk, messagebox

from classifier_service import clasificar, validar_datos, ValidacionError


class MainFrame(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Cloud Models Classifier")
        self.geometry("560x520")
        self.resizable(False, False)
        self._construir_interfaz()

    # ---------- construcción de la interfaz ----------

    def _construir_interfaz(self):
        self._panel_usuario()
        self._panel_descripcion()
        self._panel_resultado()

    def _panel_usuario(self):
        frame = ttk.LabelFrame(self, text="Datos del usuario")
        frame.pack(fill="x", padx=10, pady=10)

        ttk.Label(frame, text="Nombre:").grid(row=0, column=0, sticky="w", padx=5, pady=5)
        self.campo_nombre = ttk.Entry(frame)
        self.campo_nombre.grid(row=0, column=1, sticky="ew", padx=5, pady=5)

        ttk.Label(frame, text="Apellido:").grid(row=1, column=0, sticky="w", padx=5, pady=5)
        self.campo_apellido = ttk.Entry(frame)
        self.campo_apellido.grid(row=1, column=1, sticky="ew", padx=5, pady=5)

        frame.columnconfigure(1, weight=1)

    def _panel_descripcion(self):
        frame = ttk.LabelFrame(
            self, text="Escribe palabras, frases o una descripción del servicio Cloud"
        )
        frame.pack(fill="both", expand=True, padx=10, pady=(0, 10))

        self.area_descripcion = tk.Text(frame, wrap="word", height=8)
        self.area_descripcion.pack(fill="both", expand=True, padx=5, pady=5)

        boton = ttk.Button(frame, text="Clasificar", command=self._ejecutar_clasificacion)
        boton.pack(pady=(0, 5))

    def _panel_resultado(self):
        frame = ttk.LabelFrame(self, text="Resultado de la clasificación")
        frame.pack(fill="x", padx=10, pady=(0, 10))

        self.etiqueta_resultado = tk.Label(
            frame,
            text='Escribe una descripción y presiona "Clasificar"',
            font=("Segoe UI", 12, "bold"),
            bg="#e6f0ff",
            wraplength=520,
            justify="center",
            padx=10, pady=10,
        )
        self.etiqueta_resultado.pack(fill="x", padx=5, pady=5)

        self.area_detalle = tk.Text(frame, height=5, font=("Consolas", 10), state="disabled")
        self.area_detalle.pack(fill="x", padx=5, pady=(0, 5))

    # ---------- lógica de interacción ----------

    def _ejecutar_clasificacion(self):
        nombre = self.campo_nombre.get().strip()
        apellido = self.campo_apellido.get().strip()
        descripcion = self.area_descripcion.get("1.0", "end").strip()

        try:
            validar_datos(nombre, apellido, descripcion)
        except ValidacionError as e:
            messagebox.showwarning("Datos incompletos", str(e))
            return

        resultado = clasificar(descripcion)

        self.etiqueta_resultado.config(
            text=f"{nombre} {apellido} -> Modelo detectado: {resultado.categoria_ganadora}"
        )

        self.area_detalle.config(state="normal")
        self.area_detalle.delete("1.0", "end")
        self.area_detalle.insert(
            "1.0", "Detalle de coincidencias por categoria:\n" + resultado.detalle()
        )
        self.area_detalle.config(state="disabled")


def main():
    app = MainFrame()
    app.mainloop()


if __name__ == "__main__":
    main()
