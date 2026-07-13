import { useState } from "react";
import { ChevronDown, ArrowRight, ShieldAlert, GitBranch, Layers, Terminal } from "lucide-react";

const STACK = ["Python", "Tkinter", "XML (OOXML)", "python-docx templates", "PyInstaller", "Windows Registry API"];

const CODE_OOXML = `# generar_certificado.py — edición directa del XML del .docx
# En vez de un motor de mail-merge, se abre el .docx como ZIP,
# se edita document.xml con ElementTree y se reempaqueta. Esto
# preserva el formato exacto del Word original (negritas, tabs,
# indentado) que un motor de templates genérico solía romper.
def generar_certificado(datos, plantilla_path, salida_path):
    xml_root = _read_document_xml(plantilla_path)
    nodes = _text_nodes(xml_root)
    _replace_exact(nodes, "{{POLIZA}}", datos["poliza"])
    _replace_after_label(nodes, "Beneficiario:", datos["beneficiario"], stop_labels=["Tomador:"])
    if datos["plantilla"] == "no_repeticion":
        _insert_cnr_cliente_cuit(xml_root, datos["personas_cnr"], datos["tomador"])
    _write_document_xml(plantilla_path, xml_root, salida_path)
    convertir_a_pdf(salida_path)`;

const CODE_INSTALADOR = `# install.py — empaquetado con PyInstaller, sin instalador de terceros
def _get_desktop():
    """Lee la ruta real del Escritorio desde el registro de Windows,
    en vez de asumir '~/Desktop' — falla en máquinas con el
    Escritorio redirigido a OneDrive."""
    key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,
        r"Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Shell Folders")
    return Path(winreg.QueryValueEx(key, "Desktop")[0])

def install():
    install_dir = Path(os.environ["LOCALAPPDATA"]) / "Certificados"
    shutil.copy2(base() / "CertificadosApp.exe", install_dir)
    shutil.copy2(base() / "Desinstalador.exe", install_dir)
    # plantillas .docx, config.json e historial viajan junto al .exe`;

const CODE_BULK = `# Carga masiva de asegurados desde Excel pegado
# Formato: [NOMBRE DEL GRUPO] seguido de filas tabuladas.
# Un parser tolerante evita que un espaciado irregular
# (común al copiar de Excel) rompa la carga completa.
def _parse_asegurado_line(linea):
    partes = re.split(r"\\t|\\s{2,}", linea.strip())
    return dict(zip(CAMPOS_ASEGURADO, partes))`;

const FAQ = [
  {
    q: "¿Por qué manipular el XML del .docx en vez de usar un motor de templates?",
    a: "Los primeros intentos con motores de mail-merge genéricos (reemplazo de {{tags}} vía librerías de alto nivel) perdían formato: negritas que desaparecían, tabulaciones que se corrían, párrafos que se dividían mal. El documento final es un certificado legal que se entrega a clientes — tenía que verse idéntico al Word original. Editar directamente document.xml con ElementTree, conservando los nodos de formato (rPr, ppr) de cada corrida de texto, resolvió eso a costa de más código por plantilla.",
  },
  {
    q: "¿Qué es la cláusula de 'no repetición' (CNR) y por qué necesita su propia lógica?",
    a: "Es una cláusula que lista explícitamente cliente y CUIT de cada empresa a la que no se le repetirá contra la aseguradora. Esa lista es dinámica (varía por certificado) y se inserta en un lugar específico del documento, respetando el indentado y los tabs del párrafo de referencia — por eso existe _insert_cnr_cliente_cuit() en vez de un simple reemplazo de texto.",
  },
  {
    q: "¿Por qué un instalador casero en vez de un instalador de Windows estándar (MSI)?",
    a: "La app se distribuye a usuarios sin permisos de administrador ni conocimientos técnicos. install.py resuelve la carpeta real del Escritorio desde el registro (con fallback a OneDrive), copia el .exe y las plantillas a %LOCALAPPDATA%, y deja un desinstalador — todo empaquetado con PyInstaller como un segundo .exe, sin depender de un framework de instaladores externo.",
  },
  {
    q: "¿Cómo se evita perder trabajo si el usuario cierra la app a mitad de un certificado?",
    a: "Cada certificado generado se guarda como snapshot en un historial local (JSON), incluyendo grupos y asegurados. El combo 'Historial' de la barra de póliza permite recargar cualquier certificado previo con un click, sin tener que volver a tipear los datos del cliente.",
  },
];

export default function CaseStudy({ onOpenDemo }) {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <div className="mb-14">
        <span className="inline-block rounded-full border border-neon-cyan/30 bg-neon-cyan/5 px-3 py-1 text-[11px] text-neon-cyan mb-4">
          Caso de estudio · Automatización documental
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white leading-tight mb-4">
          Generación de certificados de seguro sin romper el formato del Word original
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
          Cada certificado de cobertura se armaba a mano en Word: copiar la plantilla, completar datos de la póliza,
          pegar la lista de asegurados y exportar a PDF — repetido decenas de veces por semana, con alto riesgo de
          error humano en pólizas y fechas. Hoy es una app de escritorio instalable que genera el certificado
          completo (con grupos de asegurados, carga masiva desde Excel y cláusula de no repetición) en segundos,
          preservando el formato exacto del documento legal.
        </p>
        <button
          onClick={onOpenDemo}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-neon-cyan text-night-950 px-5 py-2.5 text-sm font-medium hover:brightness-110 transition"
        >
          Ver demo interactiva <ArrowRight size={15} />
        </button>
      </div>

      <Section icon={Layers} title="Qué resuelve">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-400 leading-relaxed">
          <li>Arma el certificado final a partir de una plantilla Word, sin perder negritas, tabs ni indentado.</li>
          <li>Administra grupos de asegurados (empleados, directivos, contratistas...) con carga manual o masiva desde Excel.</li>
          <li>Soporta la cláusula de "no repetición" con su propia lista de clientes y CUIT.</li>
          <li>Guarda un historial local de certificados generados, recargable con un click.</li>
          <li>Se distribuye como instalador propio (.exe) para usuarios sin permisos de administrador.</li>
        </ul>
      </Section>

      <Section icon={Terminal} title="Stack técnico">
        <div className="flex flex-wrap gap-2">
          {STACK.map((s) => (
            <span key={s} className="rounded-full border border-night-600 bg-night-900/60 px-3 py-1 text-xs text-slate-400">
              {s}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4 leading-relaxed">
          La versión de escritorio (Tkinter) prioriza que funcione sin instalar Python ni depender de internet —
          esta demo web rediseña esa misma lógica con una interfaz moderna, manteniendo el mismo flujo de datos.
        </p>
      </Section>

      <Section icon={GitBranch} title="Tres piezas de código (sanitizadas / genéricas)">
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          El código real trabaja sobre plantillas y datos específicos de la operación; acá va el patrón general de cada capa.
        </p>
        <CodeBlock label="Edición directa del XML del .docx" code={CODE_OOXML} />
        <CodeBlock label="Instalador propio (sin MSI)" code={CODE_INSTALADOR} />
        <CodeBlock label="Parser tolerante de carga masiva" code={CODE_BULK} />
      </Section>

      <Section icon={ShieldAlert} title="Manual — preguntas frecuentes">
        <div className="space-y-2">
          {FAQ.map((f, i) => (
            <FaqItem key={i} q={f.q} a={f.a} />
          ))}
        </div>
      </Section>

      <div className="mt-14 rounded-2xl border border-neon-cyan/20 bg-neon-cyan/5 p-6 text-center">
        <p className="text-sm text-slate-300 mb-4">
          Esta demo rediseña la interfaz de escritorio original con un look moderno — el flujo (póliza, grupos,
          vista previa, historial) es el mismo. Todos los datos son ficticios.
        </p>
        <button
          onClick={onOpenDemo}
          className="inline-flex items-center gap-2 rounded-full bg-neon-cyan text-night-950 px-5 py-2.5 text-sm font-medium hover:brightness-110 transition"
        >
          Abrir demo interactiva <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="mb-14">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className="text-neon-cyan" />
        <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function CodeBlock({ label, code }) {
  return (
    <div className="mb-4 rounded-xl border border-night-700 overflow-hidden">
      <div className="bg-night-800 px-4 py-2 text-[11px] text-slate-400 border-b border-night-700">{label}</div>
      <pre className="bg-night-950 p-4 text-[11px] leading-relaxed text-slate-400 overflow-x-auto font-mono-num">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-night-700 bg-night-900/50 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-sm text-slate-200 font-medium">{q}</span>
        <ChevronDown size={15} className={`shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="px-4 pb-4 text-xs text-slate-500 leading-relaxed">{a}</p>}
    </div>
  );
}
