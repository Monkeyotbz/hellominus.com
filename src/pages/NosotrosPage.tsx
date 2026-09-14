

// Galería de imágenes
const galeria = [
  "/Cartagena.jpg",
  "/Medellin1.jpg",
  "/JardinA.jpg",
  "/Isla Palmarito Beach.jpg",
  "/Jerico1.jpg",
];

const NosotrosPage = () => (
  <div className="min-h-screen bg-gradient-to-b to-white pt-[110px]">
    {/* Logo y descripción */}
    <section className="container mx-auto px-6 py-10 flex flex-col items-center text-center">
      <img
        src="/brand/logo.svg"
        alt="Logo de Hellominus"
        className="h-28 w-auto mb-6"
      />
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">¿Qué es hellominus.com?</h1>
      <p className="text-lg text-gray-700 max-w-2xl mb-6">
        hellominus.com es una plataforma digital dedicada a inspirar, conectar y facilitar experiencias auténticas de turismo en Colombia. Nuestro objetivo es mostrar la riqueza natural, cultural y humana de nuestro país, ayudando a viajeros y locales a descubrir destinos únicos, consejos útiles y la verdadera magia de Colombia.
      </p>
    </section>

    {/* Misión y Visión */}
    <section className="container mx-auto px-6 py-6 grid md:grid-cols-2 gap-10">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-red-700 mb-2">Misión</h2>
        <p className="text-gray-700">
          Inspirar y acompañar a viajeros a descubrir Colombia de una manera auténtica, sostenible y segura, promoviendo el turismo responsable y el amor por nuestra tierra a través de experiencias únicas y contenido de calidad.
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-red-700 mb-2">Visión</h2>
        <p className="text-gray-700">
          Ser la plataforma líder en turismo digital en Colombia, reconocida por su innovación, impacto positivo en las comunidades y por conectar a las personas con la verdadera esencia de nuestro país.
        </p>
      </div>
    </section>


    {/* Galería de fotos */}
    <section className="bg-gradient-to-b from-blue-50 to-white py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-red-700 mb-12">Nuestra esencia en imágenes</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {galeria.map((foto, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <img
                src={foto}
                alt={`Galería ${idx + 1}`}
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Aquí puedes agregar nuevas secciones en el futuro */}

  </div>
);

export default NosotrosPage;