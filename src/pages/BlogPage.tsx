import React from "react";
import { useUser } from "../context/UserContext";
import { quickProperties } from "../data/showcases";
import { Link } from "react-router-dom";

const articles = [
	{
		id: 1,
		title: "Descubre las Islas del Rosario: Paraíso Caribeño",
		summary: "Un archipiélago de 27 islas ubicado a solo una hora de Cartagena. Explora playas cristalinas, arrecifes de coral y una biodiversidad única.",
		image: "/Isla Palmarito Beach.jpg",
		category: "Destinos",
	},
	{
		id: 2,
		title: "Cartagena de Indias: Historia y Encanto Colonial",
		summary: "La ciudad amurallada más hermosa de América. Descubre su arquitectura colonial, gastronomía caribeña y la magia de sus calles empedradas.",
		image: "/Cartagena.jpg",
		category: "Destinos",
	},
	{
		id: 3,
		title: "Medellín: La Ciudad de la Eterna Primavera",
		summary: "Conoce la transformación de Medellín, su clima perfecto, innovación urbana y cultura paisa que conquista a todo visitante.",
		image: "/Medellin1.jpg",
		category: "Destinos",
	},
	{
		id: 4,
		title: "Jericó: El Pueblo Más Lindo de Antioquia",
		summary: "Un destino de montaña con arquitectura tradicional, café de altura y paisajes que te dejarán sin aliento.",
		image: "/Jerico1.jpg",
		category: "Destinos",
	},
	{
		id: 5,
		title: "Cómo Reservar Directamente y Ahorrar",
		summary: "Tips y consejos para que tu reserva sea más económica. Reservar directo con nosotros te da tarifas exclusivas y atención personalizada.",
		image: "/IMG-20240220-WA0184.jpg",
		category: "Consejos",
	},
	{
		id: 6,
		title: "Experiencias Locales Auténticas en Colombia",
		summary: "Conecta con la cultura local: mercados tradicionales, fiestas populares y experiencias que solo los colombianos conocen.",
		image: "/IMG-20231225-WA0149.jpg",
		category: "Consejos",
	},
	{
		id: 7,
		title: "Gastronomía del Caribe Colombiano",
		summary: "Un recorrido por los sabores costeños: arepas de huevo, pescado frito, patacones y la deliciosa cocina fusión de Cartagena.",
		image: "/IMG-20231225-WA0186.jpg",
		category: "Gastronomía",
	},
	{
		id: 8,
		title: "Café Colombiano: De la Montaña a tu Taza",
		summary: "Descubre el proceso del café en el Eje Cafetero, desde la cosecha hasta la taza perfecta. Una experiencia sensorial única.",
		image: "/IMG-20240612-WA0042.jpg",
		category: "Gastronomía",
	},
];

const categories = ["Todos", "Destinos", "Consejos", "Gastronomía"];

const BlogPage = () => {
	const {} = useUser();
	const [selectedCategory, setSelectedCategory] = React.useState("Todos");

	const filteredArticles =
		selectedCategory === "Todos"
			? articles
			: articles.filter((a) => a.category === selectedCategory);

	return (
		<div className="min-h-screen bg-white pt-[110px]">
			{/* Hero */}
			<section className="relative py-20 px-4 text-center mb-16 bg-gradient-to-b from-blue-50 to-white">
				<div className="relative z-10 max-w-4xl mx-auto">
					<h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
						Blog de Hellominus
					</h1>
					<p className="text-xl md:text-2xl mb-8 text-gray-600">
						Inspírate, aprende y descubre Colombia con historias, consejos y experiencias únicas.
					</p>
					<a
						href="#articulos"
						className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
					>
						Explorar artículos
					</a>
				</div>
			</section>

			{/* Categorías */}
			<div className="container mx-auto px-4">
				<div className="flex justify-center gap-3 mb-12 flex-wrap">
					{categories.map((cat) => (
						<button
							key={cat}
							onClick={() => setSelectedCategory(cat)}
							className={`px-6 py-2 rounded-lg font-semibold transition-all ${
								selectedCategory === cat
									? "bg-blue-600 text-white shadow-md"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							{cat}
						</button>
					))}
				</div>
			</div>

			{/* Artículos */}
			<section
				id="articulos"
				className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
			>
				{filteredArticles.map((article) => (
					<div
						key={article.id}
						className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group"
					>
						<div className="relative overflow-hidden h-56">
							<img
								src={article.image}
								alt={article.title}
								className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
							/>
						</div>
						<div className="p-6">
							<span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-blue-100">
								{article.category}
							</span>
							<h2 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2">{article.title}</h2>
							<p className="text-gray-600 mb-4 line-clamp-3">{article.summary}</p>
							<button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center gap-2">
								Leer más
								<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
									<path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
								</svg>
							</button>
						</div>
					</div>
				))}
			</section>

			{/* CTA Newsletter */}
			<div className="bg-gradient-to-b from-blue-50 to-white py-16">
				<div className="container mx-auto px-4 max-w-2xl text-center">
					<h3 className="text-3xl font-bold mb-4 text-gray-900">
						¿Quieres recibir lo mejor del blog en tu correo?
					</h3>
					<p className="text-gray-600 mb-6 text-lg">
						Suscríbete y recibe contenido exclusivo, tips de viaje y ofertas especiales.
					</p>
					<form className="flex flex-col sm:flex-row justify-center items-center gap-3 max-w-lg mx-auto">
						<input
							type="email"
							placeholder="Tu correo electrónico"
							className="px-5 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:flex-1"
						/>
						<button
							type="submit"
							className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md w-full sm:w-auto"
						>
							Suscribirme
						</button>
					</form>
				</div>
			</div>

			{/* Sección de Propiedades Destacadas */}
			<section className="py-16 px-4 bg-white">
				<div className="container mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Hospedajes Destacados
						</h2>
						<p className="text-gray-600 text-lg max-w-2xl mx-auto">
							Descubre nuestras propiedades más populares para tu próxima aventura en Colombia
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
						{quickProperties.slice(0, 4).map((property) => (
							<Link
								key={property.id}
								to={`/property/${property.id}`}
								className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
							>
							<div className="relative overflow-hidden h-48">
								<img
									src={property.image}
									alt={property.name}
									className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
									/>
									<div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
										{property.location}
									</div>
								</div>
							<div className="p-4">
								<h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
									{property.name}
								</h3>
									<p className="text-gray-600 text-sm mb-3 line-clamp-2">
										{property.description}
									</p>
								<div className="flex items-center justify-between">
									<span className="text-blue-600 font-bold text-lg">
										{property.priceLabel}
									</span>
										<span className="text-blue-600 text-sm font-semibold group-hover:gap-2 flex items-center gap-1 transition-all">
											Ver más
											<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
												<path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
											</svg>
										</span>
									</div>
								</div>
							</Link>
						))}
					</div>
					<div className="text-center">
						<Link
							to="/properties"
							className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
						>
							Ver todos los hospedajes
						</Link>
					</div>
				</div>
			</section>

			{/* Sección de Tours */}
			<section className="py-16 px-4 bg-gray-50">
				<div className="container mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Experiencias y Tours
						</h2>
						<p className="text-gray-600 text-lg max-w-2xl mx-auto">
							Vive aventuras inolvidables con nuestros tours seleccionados
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
						<div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
							<div className="relative overflow-hidden h-56">
								<img
									src="/Isla Palmarito Beach.jpg"
									alt="Tour Islas del Rosario"
									className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
								/>
							</div>
							<div className="p-6">
								<h3 className="font-bold text-xl text-gray-900 mb-3">
									Tour Islas del Rosario
								</h3>
								<p className="text-gray-600 mb-4">
									Explora el paraíso caribeño con playas cristalinas, snorkel y almuerzo incluido.
								</p>
								<div className="flex items-center justify-between">
									<span className="text-blue-600 font-bold text-lg">Desde $220.000</span>
									<Link
										to="/tours"
										className="text-blue-600 text-sm font-semibold hover:gap-2 flex items-center gap-1 transition-all"
									>
										Ver más
										<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
											<path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
										</svg>
									</Link>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
							<div className="relative overflow-hidden h-56">
								<img
									src="/Cartagena.jpg"
									alt="City Tour Cartagena"
									className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
								/>
							</div>
							<div className="p-6">
								<h3 className="font-bold text-xl text-gray-900 mb-3">
									City Tour Cartagena
								</h3>
								<p className="text-gray-600 mb-4">
									Descubre la ciudad amurallada, su historia colonial y sus rincones mágicos.
								</p>
								<div className="flex items-center justify-between">
									<span className="text-blue-600 font-bold text-lg">Desde $180.000</span>
									<Link
										to="/tours"
										className="text-blue-600 text-sm font-semibold hover:gap-2 flex items-center gap-1 transition-all"
									>
										Ver más
										<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
											<path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
										</svg>
									</Link>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
							<div className="relative overflow-hidden h-56">
								<img
									src="/Medellin1.jpg"
									alt="Tour Medellín"
									className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
								/>
							</div>
							<div className="p-6">
								<h3 className="font-bold text-xl text-gray-900 mb-3">
									Medellín Ciudad Innovadora
								</h3>
								<p className="text-gray-600 mb-4">
									Conoce la transformación de la ciudad de la eterna primavera y su cultura paisa.
								</p>
								<div className="flex items-center justify-between">
									<span className="text-blue-600 font-bold text-lg">Desde $250.000</span>
									<Link
										to="/tours"
										className="text-blue-600 text-sm font-semibold hover:gap-2 flex items-center gap-1 transition-all"
									>
										Ver más
										<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
											<path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
										</svg>
									</Link>
								</div>
							</div>
						</div>
					</div>
					<div className="text-center">
						<Link
							to="/tours"
							className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
						>
							Ver todos los tours
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
};

export default BlogPage;