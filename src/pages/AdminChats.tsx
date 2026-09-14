import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, User, Search, CheckCircle, AlertCircle, Archive, Trash2 } from 'lucide-react';

interface Conversation {
  id: string;
  user_id: string;
  status: string;
  bot_stage: string;
  collected_data: any;
  created_at: string;
  updated_at: string;
  last_message?: string;
  unread_count?: number;
  user_email?: string;
  user_name?: string;
}

export default function AdminChats() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadConversations();
    subscribeToUpdates();
  }, []);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error);
        setLoading(false);
        return;
      }

      // Obtener información de usuarios por separado
      const conversationsWithUserInfo = await Promise.all(
        (data || []).map(async (conv: any) => {
          const { data: userData } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('id', conv.user_id)
            .single();

          return {
            ...conv,
            user_email: userData?.email || 'Sin email',
            user_name: userData?.full_name || 'Usuario'
          };
        })
      );

      setConversations(conversationsWithUserInfo);
      setLoading(false);
    } catch (err) {
      console.error('Error general:', err);
      setConversations([]);
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel('chat_conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations'
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleArchiveChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que navegue al chat
    
    if (!confirm('¿Estás seguro de archivar esta conversación?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ status: 'archived' })
        .eq('id', chatId);

      if (error) throw error;

      // Actualizar localmente
      setConversations(prev => prev.filter(c => c.id !== chatId));
      alert('✅ Conversación archivada exitosamente');
    } catch (error) {
      console.error('Error al archivar chat:', error);
      alert('❌ Error al archivar la conversación');
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que navegue al chat
    
    if (!confirm('⚠️ ¿Estás seguro de eliminar PERMANENTEMENTE esta conversación?\n\nEsta acción NO se puede deshacer y se eliminarán todos los mensajes asociados.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', chatId);

      if (error) throw error;

      // Actualizar localmente
      setConversations(prev => prev.filter(c => c.id !== chatId));
      alert('✅ Conversación eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar chat:', error);
      alert('❌ Error al eliminar la conversación');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      conv.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && conv.status === 'active') ||
      (filterStatus === 'escalated' && conv.status === 'escalated_to_admin');

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: conversations.length,
    active: conversations.filter(c => c.status === 'active').length,
    escalated: conversations.filter(c => c.status === 'escalated_to_admin').length,
    resolved: conversations.filter(c => c.status === 'resolved').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'escalated_to_admin':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'resolved':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'escalated_to_admin': return 'Escalada';
      case 'resolved': return 'Resuelta';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat de Clientes</h1>
          <p className="text-gray-600">Gestiona todas las conversaciones con los clientes</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activas</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Escaladas</p>
                <p className="text-3xl font-bold text-orange-600">{stats.escalated}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resueltas</p>
                <p className="text-3xl font-bold text-gray-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por email, nombre o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Activas
              </button>
              <button
                onClick={() => setFilterStatus('escalated')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'escalated'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Escaladas
              </button>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative group"
            >
              {/* Botones de acción flotantes */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={(e) => handleArchiveChat(conv.id, e)}
                  className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                  title="Archivar conversación"
                >
                  <Archive className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDeleteChat(conv.id, e)}
                  className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  title="Eliminar conversación permanentemente"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Contenido del chat (clickeable) */}
              <div 
                onClick={() => navigate(`/admin/chat/${conv.id}`)}
                className="cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{conv.user_name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(conv.status)}`}>
                          {getStatusText(conv.status)}
                        </span>
                        {(conv.unread_count || 0) > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{conv.user_email}</p>
                      {conv.last_message && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{conv.last_message}</p>
                      )}
                      
                      {/* Collected Data */}
                      {conv.collected_data && Object.keys(conv.collected_data).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {conv.collected_data.reservation_ref && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                              📋 {conv.collected_data.reservation_ref}
                            </span>
                          )}
                          {conv.collected_data.amount && (
                            <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                              💰 ${conv.collected_data.amount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {new Date(conv.updated_at).toLocaleString('es-CO', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredConversations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay conversaciones</p>
            <p className="text-gray-400 text-sm">Las conversaciones aparecerán aquí cuando los clientes usen el chat</p>
          </div>
        )}
      </div>
    </div>
  );
}
