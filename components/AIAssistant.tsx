
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, User, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { MOCK_PRODUCTS, PREMIUM_PRODUCTS } from '../constants';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Salam! Mən Ravio-nun ağıllı köməkçisiyəm. Sizə premium məhsullarımız, heyvanlara dəstək missiyamız və ya seçiminiz barədə necə kömək edə bilərəm?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const productContext = [...PREMIUM_PRODUCTS, ...MOCK_PRODUCTS].map(p => 
        `${p.name}: ${p.price} AZN, Kateqoriya: ${p.category}. Təsvir: ${p.description}`
      ).join('\n');

      const systemInstruction = `
        Sən Ravio.shop e-ticarət platformasının rəsmi ağıllı köməkçisisən.
        Brend Kimliyi: Minimalist, Premium, Dostcanlısı və Güvənilir.
        Rənglərimiz: Qara, Narıncı (#FF8C00) və Ağ.
        Xüsusi Missiyamız: Hər bir alış-verişin gəlirinin 5%-i sahibsiz küçə heyvanlarına bağışlanır.
        Məhsullarımız haqqında məlumat:
        ${productContext}
        
        Qaydalar:
        1. Həmişə azərbaycan dilində, nəzakətli və yardımsevər danış.
        2. Müştərini məhsul seçməyə həvəsləndir və ya "səbətə əlavə et" seçimi ilə davam edə biləcəyini xatırlat.
        3. Sahibsiz heyvanlara dəstək missiyamızı lazım gəldikdə vurğula.
        4. CİDDİ QAYDA: Birbaşa "WhatsApp üzərindən sifariş etmək istəyirsiniz?" sualını vermə. Bunun əvəzinə "Sizə bu məhsulu seçməkdə kömək edimmi?" və ya "Sifarişinizi səbətə əlavə edərək tamamlaya bilərsiniz" kimi alternativ ifadələr istifadə et.
        5. Cavabların qısa, konkret və minimalist olsun.
      `;

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage({ message: userMessage });
      const responseText = result.text || "Bağışlayın, hazırda cavab verə bilmirəm. Zəhmət olmasa bir az sonra yenidən yoxlayın.";
      
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Texniki bir xəta baş verdi. Zəhmət olmasa bir az sonra yenidən cəhd edin." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-[#1A1A1A] p-6 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-[#FF8C00] p-2 rounded-2xl">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight">RAVIO AI</h3>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Online</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-[#FF8C00] text-white rounded-tr-none shadow-lg shadow-orange-100' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-gray-100 shadow-sm flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#FF8C00]" />
                  <span className="text-xs font-bold text-gray-400">Ravio düşünür...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Sualınızı bura yazın..."
                className="w-full pl-6 pr-14 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl outline-none font-bold text-sm text-[#1A1A1A] transition-all"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-3 bg-black text-white rounded-xl hover:bg-[#FF8C00] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[9px] text-gray-400 text-center mt-3 font-bold uppercase tracking-widest flex items-center justify-center space-x-1">
              <Sparkles className="h-3 w-3 text-[#FF8C00]" />
              <span>AI tərəfindən dəstəklənir</span>
            </p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`group p-4 rounded-full shadow-2xl transition-all duration-500 flex items-center space-x-2 ${
          isOpen ? 'bg-black text-white rotate-90' : 'bg-[#FF8C00] text-white hover:scale-110 active:scale-95'
        }`}
      >
        {isOpen ? <X className="h-7 w-7" /> : (
          <>
            <MessageSquare className="h-7 w-7" />
            {!isOpen && <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-black text-sm whitespace-nowrap">Kömək lazımdır?</span>}
          </>
        )}
      </button>
    </div>
  );
};

export default AIAssistant;
