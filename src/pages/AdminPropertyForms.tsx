import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useUser } from "../context/UserContext";
import Background from "../components/Background"; // Importa el componente Background

const AdminPropertyForm = () => {
  useUser();
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    price: "",
    amenities: "",
    images: [] as File[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm({ ...form, images: Array.from(e.target.files) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const uploadedImages: string[] = [];
      for (const image of form.images) {
        const { data, error } = await supabase.storage
          .from("property-images")
          .upload(`properties/${Date.now()}-${image.name}`, image);

        if (error) {
          throw new Error(`Error al subir la imagen: ${image.name}`);
        }

        if (data) {
          const publicUrl = supabase.storage
            .from("property-images")
            .getPublicUrl(data.path).data.publicUrl;
          uploadedImages.push(publicUrl);
        }
      }

      const { error: insertError } = await supabase.from("properties").insert([
        {
          name: form.name,
          description: form.description,
          location: form.location,
          price: parseFloat(form.price),
          amenities: form.amenities.split(",").map((amenity) => amenity.trim()),
          images: uploadedImages,
        },
      ]);

      if (insertError) {
        throw new Error("Error al guardar la propiedad en la base de datos.");
      }

      alert("¡Propiedad creada exitosamente!");
      setForm({
        name: "",
        description: "",
        location: "",
        price: "",
        amenities: "",
        images: [],
      });
    } catch (err: any) {
      alert(err.message || "Error inesperado al crear la propiedad.");
    }
  };

  return (
    <Background>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto bg-white p-6 rounded shadow">
        <input
          name="name"
          placeholder="Nombre"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
        <textarea
          name="description"
          placeholder="Descripción"
          value={form.description}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
        <input
          name="location"
          placeholder="Ubicación"
          value={form.location}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
        <input
          name="price"
          type="number"
          placeholder="Precio por noche"
          value={form.price}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
        <input
          name="amenities"
          placeholder="Amenities (separados por coma)"
          value={form.amenities}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          name="images"
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Guardar propiedad
        </button>
      </form>
    </Background>
  );
};

export default AdminPropertyForm;