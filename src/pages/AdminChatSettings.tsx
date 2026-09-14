import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Edit2, Trash2, Save, X, MessageSquare } from 'lucide-react';

interface BotResponse {
  id: string;
  keyword: string;
  trigger_words: string[];
  response_text: string;
  category: string;
  priority: number;
  active: boolean;
}

export default function AdminChatSettings() {
  const [responses, setResponses] = useState<BotResponse[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    keyword: '',
    trigger_words: '',
    response_text: '',
    category: 'general',
    priority: 5
  });

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    const { data, error } = await supabase
      .from('bot_responses')
      .select('*')
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error loading responses:', error);
      return;
    }

    setResponses(data || []);
  };

  const handleSave = async () => {
    const trigger_words_array = formData.trigger_words
      .split(',')
      .map(w => w.trim())
      .filter(w => w);

    if (editing) {
      const { error } = await supabase
        .from('bot_responses')
        .update({
          keyword: formData.keyword,
          trigger_words: trigger_words_array,
          response_text: formData.response_text,
          category: formData.category,
          priority: formData.priority
        })
        .eq('id', editing);

      if (error) {
        alert('Error al actualizar');
        return;
      }
    } else {
      const { error } = await supabase
        .from('bot_responses')
        .insert({
          keyword: formData.keyword,
          trigger_words: trigger_words_array,
          response_text: formData.response_text,
          category: formData.category,
          priority: formData.priority,
          active: true
        });

      if (error) {
        alert('Error al crear');
        return;
      }
    }

    setEditing(null);
    setAdding(false);
    setFormData({ keyword: '', trigger_words: '', response_text: '', category: 'general', priority: 5 });
    loadResponses();
  };

  const handleEdit = (response: BotResponse) => {
    setEditing(response.id);
    setFormData({
      keyword: response.keyword,
      trigger_words: response.trigger_words.join(', '),
      response_text: response.response_text,
      category: response.category,
      priority: response.priority
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta respuesta?')) return;

    const { error } = await supabase
      .from('bot_responses')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error al eliminar');
      return;
    }

    loadResponses();
  };

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase
      .from('bot_responses')
      .update({ active: !active })
      .eq('id', id);

    if (error) {
      alert('Error al actualizar');
      return;
    }

    loadResponses();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuración del Chat Bot</h1>
            <p className="text-gray-600 mt-1">Gestiona las respuestas automáticas del asistente virtual</p>
          </div>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Respuesta
          </button>
        </div>

        {/* Form Modal */}
        {(adding || editing) && (
          <div className="bg-white rounded-lg border-2 border-blue-500 p-6 mb-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900">
              {editing ? 'Editar Respuesta' : 'Nueva Respuesta'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Palabra Clave
                </label>
                <input
                  type="text"
                  value={formData.keyword}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: saludo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="payment">Pagos</option>
                  <option value="reservation">Reservas</option>
                  <option value="support">Soporte</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Palabras Disparadoras (separadas por comas)
                </label>
                <input
                  type="text"
                  value={formData.trigger_words}
                  onChange={(e) => setFormData({ ...formData, trigger_words: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="hola, buenos días, hey"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Respuesta del Bot
                </label>
                <textarea
                  value={formData.response_text}
                  onChange={(e) => setFormData({ ...formData, response_text: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="¡Hola! 👋 ¿En qué puedo ayudarte?"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setEditing(null);
                  setAdding(false);
                  setFormData({ keyword: '', trigger_words: '', response_text: '', category: 'general', priority: 5 });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <X className="w-4 h-4 inline mr-2" />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4 inline mr-2" />
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* Responses List */}
        <div className="grid grid-cols-1 gap-4">
          {responses.map((response) => (
            <div
              key={response.id}
              className={`bg-white rounded-lg border-2 p-4 transition-all ${
                response.active ? 'border-gray-200 hover:border-blue-300' : 'border-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{response.keyword}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {response.category}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                      Prioridad: {response.priority}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3 whitespace-pre-wrap">{response.response_text}</p>
                  <div className="flex flex-wrap gap-2">
                    {response.trigger_words.map((word, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleActive(response.id, response.active)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      response.active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {response.active ? 'Activa' : 'Inactiva'}
                  </button>
                  <button
                    onClick={() => handleEdit(response)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(response.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {responses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay respuestas configuradas</p>
            <p className="text-sm text-gray-400">Crea la primera respuesta automática</p>
          </div>
        )}
      </div>
    </div>
  );
}
