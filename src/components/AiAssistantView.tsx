import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Loader2, 
  Lightbulb, 
  Trash2,
  HelpCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Product, Supplier, PurchaseOrder, ChatMessage } from '../types';
import { sendAiQuery } from '../services/aiService';

interface AiAssistantViewProps {
  products: Product[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  isAiActive: boolean;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  products,
  suppliers,
  purchaseOrders,
  isAiActive,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      content: `Hello! I am your **AI Inventory & Sourcing Specialist**.\n\nI continuously evaluate your **${products.length} products** and **${suppliers.length} suppliers**. How can I assist you today? You can select a quick prompt below or type your custom query.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Which products need immediate reordering?',
    'Which products are fast moving?',
    'Which products are at risk of stock-out?',
    'Which supplier should I choose for Wireless Ergonomic Mouse Pro?',
    'Show me slow-moving products.',
    'Which products have excess inventory?',
    'How can I reduce inventory holding cost?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendAiQuery(query, products, suppliers, purchaseOrders);
      const assistantMessage: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          content: 'An error occurred while analyzing the inventory. Fallback engine returned safety metrics.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'msg-init-reset',
        sender: 'assistant',
        content: `Chat history cleared. Inventory database remains linked (${products.length} catalog items). How can I assist your supply chain decisions?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Simple Markdown renderer for bold, lists, and headers
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-white mt-2 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('• ') || line.startsWith('- ')) {
        const itemContent = line.replace(/^[•-]\s+/, '');
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 my-0.5 leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: formatInline(itemContent) }} />
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-slate-300 leading-relaxed text-xs">
          <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        </p>
      );
    });
  };

  const formatInline = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-200">$1</em>');
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            AI Inventory &amp; Sourcing Assistant
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Natural language query engine grounded in real-time inventory and supplier datasets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{isAiActive ? 'Gemini 3.8 Flash' : 'Rule Engine Fallback'}</span>
          </span>
          <button
            onClick={clearChat}
            title="Clear Chat History"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Prompt Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none text-xs">
        <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />
        <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">Ask:</span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-200 border border-slate-700 hover:border-indigo-600 transition text-[11px] cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-500/10'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 rounded-tl-none border border-slate-700/60'
                }`}
              >
                {isUser ? (
                  <p className="leading-relaxed font-medium">{msg.content}</p>
                ) : (
                  <div>{renderFormattedText(msg.content)}</div>
                )}
                <div
                  className={`text-[9px] mt-1.5 text-right ${
                    isUser ? 'text-indigo-200' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-600/30 text-cyan-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-300 border border-slate-700/60 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Analyzing catalog velocity, lead times, and supplier performance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about inventory, fast movers, supplier choices, or reorder points..."
          className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-600/25"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
