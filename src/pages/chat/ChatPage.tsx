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
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend 
} from "recharts";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  metadata?: any;
  image_url?: string;
  intent?: string;
}

const termMap: Record<string, string> = {
  pessoal: "Pessoal",
  mei: "MEI",
  income: "Receita",
  expense: "Despesa"
};

const MarkdownText = ({ content }: { content: string }) => {
  // Simple markdown to TSX parser for bold, headers and lists
  const lines = content.split('\n');
  
  return (
    <div className="prose prose-invert prose-xs max-w-none space-y-1">
      {lines.map((line, i) => {
        // Headers (###)
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-sm font-bold text-blue-400 mt-4 mb-2 uppercase tracking-tight">{line.replace('### ', '')}</h3>;
        }
        
        // Lists (* or -)
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          const text = line.trim().replace(/^[\*\-]\s/, '');
          return (
            <div key={i} className="flex gap-2 items-start ml-2 text-slate-300">
              <span className="text-blue-500 mt-1">•</span>
              <span dangerouslySetInnerHTML={{ 
                __html: text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>') 
              }} />
            </div>
          );
        }
        
        // Paragraphs with bold support
        if (line.trim() === '') return <div key={i} className="h-1" />;
        
        return (
          <p key={i} className="text-slate-200" dangerouslySetInnerHTML={{ 
            __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>') 
          }} />
        );
      })}
    </div>
  );
};

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#6366F1'];

const MessageChart = ({ data, type, title }: { data: any[], type: string, title?: string }) => {
  return (
    <Card className="p-4 bg-slate-900/40 border-slate-800 backdrop-blur-xl mt-2 w-full max-w-sm overflow-hidden border border-slate-700/50 shadow-2xl">
      {title && <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-tighter">{title}</h3>}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'pie' ? (
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                animationBegin={0}
                animationDuration={1500}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          ) : (
            <BarChart data={data}>
              <XAxis dataKey="label" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} hide />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar 
                dataKey="value" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]} 
                animationDuration={1500}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.slice(0, 4).map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-[10px] text-slate-400 truncate">{item.label}</span>
            <span className="text-[10px] text-slate-200 font-bold ml-auto">R$ {item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default function ChatPage() {
  useDynamicFavicon('agent');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const handleVoiceRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          handleSend(undefined, undefined, base64);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      toast.error("Não foi possível acessar o microfone");
    }
  };

  const handleSend = async (customInput?: string, customImage?: string, audio?: string) => {
    const textToSend = customInput ?? input;
    const imageToSend = customImage ?? selectedImage;
    
    if ((!textToSend.trim() && !imageToSend && !audio) || isTyping) return;

    const userMsgLocal: Message = {
      id: Date.now().toString(),
      role: "user",
      content: audio ? "🎙️ Mensagem de voz" : (textToSend || "📸 Imagem enviada"),
      image_url: imageToSend || undefined,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsgLocal]);
    setInput("");
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const response = await agentService.sendMessage(textToSend, imageToSend?.split(',')[1], audio);
      
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
                    <MarkdownText content={msg.content} />
                  </div>

                  {msg.metadata?.visual_data && (
                    <MessageChart 
                      type={msg.metadata.visual_data.type} 
                      data={msg.metadata.visual_data.data} 
                      title={msg.metadata.visual_data.title} 
                    />
                  )}
                  
                  {msg.intent === "add_transaction" && !msg.metadata?.confirmed && (
                    <Card className="p-4 bg-slate-800/60 border-slate-700/50 backdrop-blur-xl mt-2 overflow-hidden relative group">
                       <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
                       <div className="relative space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Preview do Registro</span>
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              (msg.metadata?.api_params?.type === 'income' || msg.metadata?.type === 'income')
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}>
                              {(msg.metadata?.api_params?.type === 'income' || msg.metadata?.type === 'income') ? 'Receita' : 'Despesa'}
                            </div>
                         </div>
                         
                         <div className="space-y-1">
                           <div className="text-2xl font-bold text-slate-100">
                             R$ {msg.metadata?.api_params?.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                           </div>
                           <div className="text-sm text-slate-400 font-medium">
                             {msg.metadata?.api_params?.descricao || "Sem descrição"}
                           </div>
                         </div>

                         <div className="flex items-center gap-4 text-[11px] text-slate-500 border-t border-slate-700/50 pt-3">
                           <div className="flex flex-col">
                             <span className="text-[9px] uppercase font-bold text-slate-600">Categoria</span>
                             <span className="text-slate-300">{msg.metadata?.api_params?.categoria || "Geral"}</span>
                           </div>
                           <div className="flex flex-col">
                             <span className="text-[9px] uppercase font-bold text-slate-600">Perfil</span>
                             <span className="text-slate-300 uppercase">{msg.metadata?.api_params?.tipo_conta || "Pessoal"}</span>
                           </div>
                           <div className="flex flex-col">
                             <span className="text-[9px] uppercase font-bold text-slate-600">Data</span>
                             <span className="text-slate-300">{msg.metadata?.api_params?.data}</span>
                           </div>
                         </div>

                         <Button 
                            onClick={() => handleConfirmAction(msg.id)}
                            size="sm" 
                            className={`w-full gap-2 font-bold shadow-lg transition-all active:scale-95 ${
                              msg.metadata?.api_params?.type === 'income'
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20"
                                : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20"
                            }`}
                          >
                            <Check size={16} /> Confirmar Registro
                          </Button>
                       </div>
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
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => fileInputRef.current?.click()} 
                className="text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 shrink-0"
              >
                <ImageIcon size={20} />
              </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleVoiceRecord}
              className={`transition-all shrink-0 ${isRecording ? "text-red-500 bg-red-500/10 animate-pulse" : "text-slate-400 hover:text-purple-400 hover:bg-purple-400/10"}`}
            >
              <Mic size={20} />
            </Button>

            <Input
              placeholder={isRecording ? "Gravando áudio..." : "Pergunte ou registre algo..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isRecording}
              className="border-none bg-transparent focus-visible:ring-0 text-slate-100 flex-1"
            />
            <Button 
              onClick={() => handleSend()} 
              disabled={(!input.trim() && !selectedImage) || isTyping || isRecording} 
              size="icon" 
              className="bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-900/20 shrink-0"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
