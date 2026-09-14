import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Send, User, Bot as BotIcon, Phone, CheckCircle } from 'lucide-react';

interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'bot' | 'admin';
  sender_id: string | null;
  message: string;
  created_at: string;
}

interface ConversationData {
  id: string;
  user_id: string;
  status: string;
  collected_data: any;
  users: {
    email: string;
    full_name?: string;
    phone?: string;
  };
}

export default function AdminChatView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadConversation();
      loadMessages();
      subscribeToMessages();
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error loading conversation:', error);
        setLoading(false);
        return;
      }

      // Obtener información del usuario por separado
      const { data: userData } = await supabase
        .from('users')
        .select('email, full_name, phone')
        .eq('id', data.user_id)
        .single();

      setConversation({
        ...data,
        users: userData || { email: 'Sin email', full_name: 'Usuario', phone: null }
      });
      setLoading(false);
    } catch (err) {
      console.error('Error general:', err);
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel(`chat_${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${id}`
      }, (payload: any) => {
        setMessages(prev => [...prev, payload.new as Message]);
        scrollToBottom();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !id) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: id,
        sender_type: 'admin',
        message: inputMessage.trim()
      });

    if (error) {
      console.error('Error sending message:', error);
      return;
    }

    setInputMessage('');
  };

  const markAsResolved = async () => {
    const { error } = await supabase
      .from('chat_conversations')
      .update({ status: 'resolved' })
      .eq('id', id);

    if (error) {
      console.error('Error marking as resolved:', error);
      return;
    }

    loadConversation();
  };

  const contactWhatsApp = () => {
    if (!conversation?.users.phone) {
      alert('Este usuario no tiene teléfono registrado');
      return;
    }

    const phone = conversation.users.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Cargando conversación...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Conversación no encontrada</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/chats')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-bold text-lg text-gray-900">
                {conversation.users.full_name || 'Usuario'}
              </h2>
              <p className="text-sm text-gray-600">{conversation.users.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {conversation.users.phone && (
              <button
                onClick={contactWhatsApp}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                WhatsApp
              </button>
            )}
            {conversation.status !== 'resolved' && (
              <button
                onClick={markAsResolved}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Marcar Resuelto
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Collected Data Banner */}
      {conversation.collected_data && Object.keys(conversation.collected_data).length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm font-medium text-blue-900 mb-2">Datos Recopilados:</p>
            <div className="flex flex-wrap gap-3">
              {conversation.collected_data.reservation_ref && (
                <div className="bg-white px-3 py-1 rounded-lg border border-blue-200">
                  <span className="text-xs text-gray-600">Reserva:</span>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {conversation.collected_data.reservation_ref}
                  </span>
                </div>
              )}
              {conversation.collected_data.amount && (
                <div className="bg-white px-3 py-1 rounded-lg border border-blue-200">
                  <span className="text-xs text-gray-600">Monto:</span>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    ${conversation.collected_data.amount} COP
                  </span>
                </div>
              )}
              {conversation.collected_data.payment_done && (
                <div className="bg-white px-3 py-1 rounded-lg border border-blue-200">
                  <span className="text-xs text-gray-600">Estado:</span>
                  <span className="ml-2 text-sm font-medium text-green-600">
                    Pago realizado
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-end gap-2 max-w-[70%]">
                {msg.sender_type !== 'admin' && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.sender_type === 'bot'
                      ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                      : 'bg-gradient-to-br from-blue-500 to-blue-600'
                  }`}>
                    {msg.sender_type === 'bot' ? (
                      <BotIcon className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.sender_type === 'admin'
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm'
                      : msg.sender_type === 'bot'
                      ? 'bg-gradient-to-br from-purple-100 to-purple-200 text-gray-900 rounded-bl-sm'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.message}</p>
                  <span className={`text-xs mt-1 block ${
                    msg.sender_type === 'admin' ? 'opacity-80' : 'opacity-60'
                  }`}>
                    {new Date(msg.created_at).toLocaleTimeString('es-CO', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {msg.sender_type === 'admin' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Escribe tu mensaje..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
