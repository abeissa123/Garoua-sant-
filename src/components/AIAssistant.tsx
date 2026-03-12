import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Send, Bot, User, Loader2, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant santé virtuel pour la ville de Garoua. Comment puis-je vous aider aujourd\'hui ? (Ex: "Où trouver une pharmacie de garde ?", "J\'ai des maux de tête...")'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: "Tu es un assistant de santé virtuel intégré dans une application mobile pour la ville de Garoua au Cameroun. Ton rôle est d'aider les utilisateurs à trouver des pharmacies, cliniques ou hôpitaux, de donner des conseils de premiers secours, et d'expliquer des symptômes légers. IMPORTANT : Tu dois toujours rappeler que tu es une IA et conseiller de consulter un médecin ou de se rendre à l'Hôpital Régional de Garoua pour toute urgence ou symptôme grave. Sois concis, empathique et utilise un ton professionnel. Parle en français.",
        }
      });

      // Send previous context (simplified for this demo, usually we'd pass history to chat)
      const response = await chat.sendMessage({ message: userMsg.content });
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || "Désolé, je n'ai pas pu générer une réponse."
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Error calling Gemini:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Une erreur de connexion est survenue. Veuillez réessayer."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-emerald-600 text-white p-4 shadow-md z-10 flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-full">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="font-bold text-lg leading-tight">Assistant Santé IA</h2>
          <p className="text-emerald-100 text-xs">Propulsé par Google Gemini</p>
        </div>
      </div>

      <div className="bg-amber-50 border-b border-amber-200 p-3 flex gap-2 items-start">
        <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-tight">
          Cet assistant fournit des informations générales et ne remplace pas un avis médical professionnel. En cas d'urgence, rendez-vous à l'hôpital le plus proche.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-br-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-4 shadow-sm">
              <Loader2 className="animate-spin text-emerald-600" size={20} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Posez votre question médicale..."
            className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-full px-4 py-3 text-sm transition-all outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full p-3 transition-colors flex items-center justify-center shrink-0"
          >
            <Send size={20} className={input.trim() ? "ml-1" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}
