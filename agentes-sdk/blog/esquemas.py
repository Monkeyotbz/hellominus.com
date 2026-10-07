"""Formas de los datos que se pasan entre los agentes. Todo lo que sale de un agente se valida aquí."""
from pydantic import BaseModel, Field


class Hecho(BaseModel):
    texto: str
    fuente_url: str = Field(description="Dirección de donde sale el hecho. Obligatoria.")
    sensible: bool = Field(default=False, description="Visas, precios, leyes, seguridad o salud.")


class Cifra(BaseModel):
    etiqueta: str
    valor: str
    cita: str = Field(description="Entidad y portal que publican la cifra.")
    licencia: str = ""


class Ficha(BaseModel):
    """Lo que entrega el Investigador."""
    tema_id: str
    tema_nombre: str
    enfoque: str = Field(description="Qué pregunta responde el artículo para un nómada digital.")
    hechos: list[Hecho]
    cifras: list[Cifra] = []


class Par(BaseModel):
    es: str
    en: str


class Borrador(BaseModel):
    """Lo que entrega el Redactor."""
    slug: str
    categoria: str
    titulo: Par
    extracto: Par
    cuerpo: Par = Field(description="Markdown: párrafos y encabezados con ##.")
    minutos: int = Field(ge=1, le=30)
    fuentes: list[str]


class Problema(BaseModel):
    tipo: str
    detalle: str


class Veredicto(BaseModel):
    """Lo que entrega el Revisor."""
    aprobado: bool
    problemas: list[Problema] = []
    requiere_revision_humana: bool
    motivos_revision: list[str] = []
