import React, { useState } from 'react';
import { X, Phone, HelpCircle, MessageSquare, Send, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: 'Namaste! I am YATRA AI Operations Support. How can I assist you with train forecasts or dispatcher tools today?' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputMsg('');

    setTimeout(() => {
      let botReply = "I have queried the YATRA-GB-v1.4 engine. Live network pressure is currently at 64.2 (HIGH). You can launch the What-If Simulator to test delay recovery options.";
      if (userText.toLowerCase().includes('12001') || userText.toLowerCase().includes('vande bharat')) {
        botReply = "Train 12001 (NDLS-HWH Vande Bharat Express) is currently running +7 min late. AI destination forecast interval is 18:45 – 18:52 (80% confidence).";
      } else if (userText.toLowerCase().includes('139') || userText.toLowerCase().includes('helpline')) {
        botReply = "Indian Railways RailMadad Toll-Free 139 is active 24x7 for all passenger queries, train status, and emergency assistance.";
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-blue-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border border-blue-400/30">
              MINISTRY OF RAILWAYS HELPDESK
            </span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-400" /> Help & Official Support Desk
          </h2>
          <p className="text-xs text-blue-200 mt-1">24x7 RailMadad Helpline 139 & AI Operations Assistant</p>
        </div>

        {/* Content Tabs / Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Quick Helpline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-blue-900">
                <Phone className="w-4 h-4 text-blue-700" /> Indian Railways RailMadad
              </div>
              <p className="text-slate-600">Single integrated toll-free helpline number for all passenger inquiries and complaints.</p>
              <span className="text-sm font-black text-blue-900 font-mono block pt-1">DIAL: 139 (Toll-Free)</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-blue-600" /> AI Forecast Engine
              </div>
              <p className="text-slate-600">Model ensemble trained on 20,000+ operational train journeys across 113 track corridors.</p>
              <span className="text-xs font-bold text-emerald-700 font-mono block pt-1">MODEL: YATRA-GB-v1.4 (Active)</span>
            </div>
          </div>

          {/* Interactive AI Assistant */}
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" /> Live YATRA AI Operations Assistant
            </h3>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-48 overflow-y-auto space-y-3">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl text-xs font-sans ${
                    m.sender === 'user'
                      ? 'bg-blue-900 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about Train 12001, delays, 139 helpline, or predictions..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-900/20"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
