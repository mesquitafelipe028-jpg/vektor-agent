import { useState, useRef, useEffect } from "react";
import { Send, Bot, User as UserIcon, X, Sparkles, ChevronLeft, ImageIcon, Mic, Check, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { agentService } from "@/services/agentService";
import { actionRouter } from "@/services/actionRouter";
import { useDynamicFavicon } from "@/hooks/useDynamicFavicon";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  metadata?: any;
  image_url?: string;
  intent?: string;
}

export default function ChatPage() {
  useDynamicFavicon('agent');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await agentService.getHistory();
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: "Olá! Eu sou o Vektor Agent. Como posso ajudar com suas finanças hoje?",
          created_at: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isTyping) return;

    const currentInput = input;
    const currentImage = selectedImage;

    const userMsgLocal: Message = {
      id: Date.now().toString(),
      role: "user",
      content: currentInput || "Enviou uma imagem",
      image_url: currentImage || undefined,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsgLocal]);
    setInput("");
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const response = await agentService.sendMessage(currentInput, currentImage?.split(',')[1]);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        intent: response.intent,
        metadata: response.data,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      toast.error("Erro ao processar mensagem");
    } finally {
      setIsTyping(false);
    }
  };

  const handleConfirmAction = async (msgId: string) => {
    const msg = messages.find(m => m.id === msgId);
    if (!msg || !msg.metadata) return;

    const success = await actionRouter.handleAction(msg.intent!, msg.metadata, user?.id!);
    if (success) {
      setMessages(prev => prev.map(m => 
        m.id === msgId ? { ...m, metadata: { ...m.metadata, confirmed: true } } : m
      ));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0F172A] text-slate-100 overflow-hidden">
      <header className="flex items-center justify-between p-4 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-slate-400">
            <ChevronLeft size={24} />
          </Button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Vektor Agent
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={signOut} 
            title="Sair"
            className="text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut size={20} />
          </Button>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-6 pb-24 max-w-2xl mx-auto">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`mt-1 shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                  msg.role === "assistant" ? "bg-slate-800 border border-slate-700" : "bg-blue-600"
                }`}>
                  {msg.role === "assistant" ? <Bot size={16} className="text-blue-400" /> : <UserIcon size={16} className="text-white" />}
                </div>
                
                <div className="space-y-2">
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-blue-600 text-white rounded-tr-none" 
                      : "bg-slate-800/80 backdrop-blur-md border border-slate-700 text-slate-200 rounded-tl-none"
                  }`}>
                    {msg.image_url && (
                      <img src={msg.image_url} alt="Uploaded" className="max-w-full rounded-lg mb-2" />
                    )}
                    {msg.content}
                  </div>
                  
                  {msg.intent === "add_transaction" && !msg.metadata?.confirmed && (
                    <Card className="p-4 bg-slate-900/50 border-slate-700 border-dashed backdrop-blur-lg mt-2">
                       <Button 
                          onClick={() => handleConfirmAction(msg.id)}
                          size="sm" 
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
                        >
                          <Check size={16} /> Confirmar Registro
                        </Button>
                    </Card>
                  )}

                  {msg.metadata?.confirmed && (
                    <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-wider pl-1">
                      <Check size={12} /> Transação Realizada
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-3 items-center">
              <Bot size={16} className="text-blue-400 animate-pulse" />
              <div className="text-slate-500 text-xs">Vektor está pensando...</div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          {selectedImage && (
            <div className="mb-2 relative inline-block">
              <img src={selectedImage} alt="Preview" className="h-20 rounded-lg border border-blue-500" />
              <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"><X size={12}/></button>
            </div>
          )}
          <div className="flex items-center gap-2 bg-slate-800/40 backdrop-blur-2xl border border-slate-700/50 p-2 rounded-2xl">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="text-slate-400"><ImageIcon size={20} /></Button>
            <Input
              placeholder="Pergunte ou registre algo..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="border-none bg-transparent focus-visible:ring-0 text-slate-100"
            />
            <Button onClick={handleSend} disabled={!input.trim() && !selectedImage} size="icon" className="bg-blue-600 rounded-xl"><Send size={18} /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
