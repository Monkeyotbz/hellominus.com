import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Send, Bot, User as UserIcon, X, Paperclip, Check } from 'lucide-react';

interface Message {
  id: string;
  sender_type: 'user' | 'bot' | 'admin';
  message: string;
  created_at: string;
  metadata?: any;
}

interface ChatBotProps {
  onClose: () => void;
  reservationId?: string;
}

export default function ChatBot({ onClose, reservationId }: ChatBotProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [botStage, setBotStage] = useState('greeting');
  const [collectedData, setCollectedData] = useState<any>({});
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
    subscribeToMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    if (!user) return;

    // Buscar conversación activa o crear una nueva
    const { data: existingConv } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingConv) {
      setConversationId(existingConv.id);
      setBotStage(existingConv.bot_stage);
      setCollectedData(existingConv.collected_data || {});
      loadMessages(existingConv.id);
    } else {
      await createNewConversation();
    }
  };

  const createNewConversation = async () => {
    if (!user) return;

    const { data: newConv, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: user.id,
        status: 'active',
        bot_stage: 'greeting',
        collected_data: reservationId ? { reservation_id: reservationId } : {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return;
    }

    setConversationId(newConv.id);
    setCollectedData(newConv.collected_data);
    
    // Mensaje de bienvenida del bot
    await sendBotMessage(
      newConv.id,
      '¡Hola! 👋 Soy el asistente virtual de Hellominus. Estoy aquí para ayudarte con tu reserva.\n\n¿En qué puedo ayudarte hoy?\n\n1️⃣ Confirmar un pago\n2️⃣ Consultar mi reserva\n3️⃣ Modificar fechas\n4️⃣ Hablar con un asesor'
    );
  };

  const loadMessages = async (convId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const subscribeToMessages = () => {
    if (!conversationId) return;

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !conversationId) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Guardar mensaje del usuario
    await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      sender_type: 'user',
      sender_id: user?.id,
      message: userMessage
    });

    // Procesar respuesta del bot
    setIsTyping(true);
    await processBotResponse(userMessage);
    setIsTyping(false);
  };

  const processBotResponse = async (userMessage: string) => {
    if (!conversationId) return;

    const lowerMessage = userMessage.toLowerCase();

    // Etapa: Saludo inicial
    if (botStage === 'greeting') {
      if (lowerMessage.includes('1') || lowerMessage.includes('pago')) {
        await sendBotMessage(
          conversationId,
          'Perfecto, te ayudaré a confirmar tu pago. 💳\n\n¿Ya realizaste la transferencia bancaria?'
        );
        await updateBotStage('confirming_payment');
      } else if (lowerMessage.includes('2') || lowerMessage.includes('consultar')) {
        await sendBotMessage(
          conversationId,
          'Claro, déjame revisar tu reserva. 🔍\n\nPor favor, dime el nombre con el que hiciste la reserva.'
        );
        await updateBotStage('checking_reservation');
      } else if (lowerMessage.includes('3') || lowerMessage.includes('modificar')) {
        await sendBotMessage(
          conversationId,
          'Entendido, quieres modificar fechas. 📅\n\n¿Cuál es el ID de tu reserva? Lo encontrarás en tu email de confirmación.'
        );
        await updateBotStage('modifying_dates');
      } else if (lowerMessage.includes('4') || lowerMessage.includes('asesor')) {
        await escalateToAdmin();
      } else {
        await sendBotMessage(
          conversationId,
          'Por favor, elige una opción del 1 al 4, o escribe tu consulta de manera más específica. 😊'
        );
      }
    }

    // Etapa: Confirmando pago
    else if (botStage === 'confirming_payment') {
      if (lowerMessage.includes('sí') || lowerMessage.includes('si') || lowerMessage.includes('ya')) {
        setCollectedData((prev: any) => ({ ...prev, payment_done: true }));
        await sendBotMessage(
          conversationId,
          '¡Excelente! 🎉\n\nPara confirmar tu pago, necesito que me envíes:\n\n1. Captura del comprobante de pago\n2. Número de reserva\n3. Monto transferido\n\nPuedes enviarlo todo junto o paso a paso.'
        );
        await updateBotStage('collecting_payment_info');
      } else {
        await sendBotMessage(
          conversationId,
          'Entiendo. Aquí están nuestros datos bancarios:\n\n🏦 Banco: Bancolombia\n💰 Cuenta de Ahorros\n🔢 Número: 1234567890\n👤 Titular: Hellominus\n\nUna vez realices la transferencia, vuelve por aquí para confirmarla. ¿Necesitas algo más?'
        );
        await updateBotStage('waiting_payment');
      }
    }

    // Etapa: Recopilando info de pago
    else if (botStage === 'collecting_payment_info') {
      // Detectar si menciona número de reserva
      if (userMessage.match(/[A-Z0-9]{8,}/)) {
        setCollectedData((prev: any) => ({ ...prev, reservation_ref: userMessage }));
        await sendBotMessage(
          conversationId,
          '✅ Reserva registrada.\n\n¿Cuál fue el monto que transferiste?'
        );
      }
      // Detectar montos
      else if (userMessage.match(/\d{3,}/)) {
        const amount = userMessage.match(/\d{3,}/)?.[0];
        setCollectedData((prev: any) => ({ ...prev, amount }));
        await sendBotMessage(
          conversationId,
          `✅ Monto: $${amount} COP registrado.\n\n¿Ya tienes el comprobante listo? Puedes adjuntarlo o conectarte con un asesor para enviarlo por WhatsApp.`
        );
        await updateBotStage('ready_to_escalate');
      } else {
        await sendBotMessage(
          conversationId,
          'Por favor, indícame tu número de reserva o el monto transferido.'
        );
      }
    }

    // Etapa: Listo para escalar
    else if (botStage === 'ready_to_escalate') {
      if (lowerMessage.includes('asesor') || lowerMessage.includes('whatsapp')) {
        await escalateToAdmin();
      } else {
        await sendBotMessage(
          conversationId,
          'Si ya tienes toda la información lista, escribe "asesor" para que te conecte con un miembro de nuestro equipo por WhatsApp. 📱'
        );
      }
    }
  };

  const sendBotMessage = async (convId: string, message: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simular typing

    await supabase.from('chat_messages').insert({
      conversation_id: convId,
      sender_type: 'bot',
      message
    });
  };

  const updateBotStage = async (newStage: string) => {
    if (!conversationId) return;

    setBotStage(newStage);
    await supabase
      .from('chat_conversations')
      .update({ 
        bot_stage: newStage,
        collected_data: collectedData
      })
      .eq('id', conversationId);
  };

  const escalateToAdmin = async () => {
    if (!conversationId) return;

    // Actualizar conversación
    await supabase
      .from('chat_conversations')
      .update({ 
        status: 'escalated_to_admin',
        bot_stage: 'completed',
        collected_data: collectedData
      })
      .eq('id', conversationId);

    // Preparar resumen para WhatsApp
    const summary = generateSummary();
    const adminPhone = ''; // Tu número
    
    // Abrir WhatsApp con el resumen
    const message = encodeURIComponent(summary);
    window.open(`https://wa.me/${adminPhone}?text=${message}`, '_blank');

    await sendBotMessage(
      conversationId,
      '✅ ¡Perfecto! Te he conectado con nuestro equipo.\n\nAcaban de recibir toda tu información por WhatsApp. Un asesor se comunicará contigo en breve. 😊\n\n¿Hay algo más en lo que pueda ayudarte?'
    );
  };

  const generateSummary = () => {
    const data = collectedData;
    const userName = user?.email || 'Usuario';
    
    return `🤖 NUEVO CONTACTO VÍA CHAT BOT

👤 Usuario: ${userName}
📧 Email: ${user?.email}

📝 INFORMACIÓN RECOPILADA:
${data.reservation_ref ? `📋 Reserva: ${data.reservation_ref}` : ''}
${data.amount ? `💰 Monto: $${data.amount} COP` : ''}
${data.payment_done ? '✅ Pago realizado (esperando comprobante)' : ''}

🕐 Fecha/Hora: ${new Date().toLocaleString('es-CO')}

Por favor, contactar al usuario para completar el proceso.`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col border border-gray-200 z-50 overflow-hidden animate-slideIn">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 p-5 flex items-center justify-between relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full blur-2xl"></div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg ring-4 ring-white/30 animate-pulse">
            <Bot className="w-7 h-7 text-blue-600" />
          </div>
          <div className="text-white">
            <h3 className="font-bold text-lg">Asistente Virtual</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-xs text-blue-100 font-medium">En línea ahora</p>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:rotate-90 relative z-10"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Messages Area with gradient background */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-end gap-2 max-w-[85%]">
              {msg.sender_type !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div
                className={`rounded-2xl px-4 py-3 shadow-sm transition-all hover:shadow-md ${
                  msg.sender_type === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm'
                    : msg.sender_type === 'admin'
                    ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-bl-sm'
                    : 'bg-white text-gray-900 border-2 border-gray-100 rounded-bl-sm'
                }`}
              >
                {msg.sender_type === 'admin' && (
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="w-4 h-4" />
                    <span className="text-xs font-bold">Asesor</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-line leading-relaxed">{msg.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-70">
                    {new Date(msg.created_at).toLocaleTimeString('es-CO', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {msg.sender_type === 'user' && (
                    <Check className="w-3 h-3 opacity-70" />
                  )}
                </div>
              </div>

              {msg.sender_type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-fadeIn">
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border-2 border-gray-100 rounded-2xl rounded-bl-sm px-5 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area with modern design */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <Paperclip className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim()}
            className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {/* Quick actions */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          <button
            onClick={() => setInputMessage('Quiero confirmar mi pago')}
            className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap border border-blue-200"
          >
            💳 Confirmar pago
          </button>
          <button
            onClick={() => setInputMessage('Consultar mi reserva')}
            className="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors whitespace-nowrap border border-purple-200"
          >
            📋 Mi reserva
          </button>
          <button
            onClick={() => setInputMessage('Hablar con un asesor')}
            className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors whitespace-nowrap border border-green-200"
          >
            👤 Asesor
          </button>
        </div>
      </div>
    </div>
  );
}
