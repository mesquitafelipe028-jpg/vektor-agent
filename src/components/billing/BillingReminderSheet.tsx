import { useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Copy, Mail } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";

interface BillingReminderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  clientPhone?: string | null;
  clientEmail?: string | null;
  description: string;
  amount: number;
  dueDate: string;
}

function buildDefaultMessage(name: string, amount: number, _description: string, _dueDate: string) {
  return `Olá ${name}, estou passando para lembrar do pagamento de ${formatCurrency(amount)} referente ao serviço realizado.`;
}

export function BillingReminderSheet({
  open, onOpenChange, clientName, clientPhone, clientEmail, description, amount, dueDate,
}: BillingReminderSheetProps) {
  const [message, setMessage] = useState("");

  const currentMessage = message || buildDefaultMessage(clientName, amount, description, dueDate);

  const handleWhatsApp = () => {
    const phone = (clientPhone || "").replace(/\D/g, "");
    if (!phone) {
      toast.error("Cliente não possui telefone cadastrado.");
      return;
    }
    const fullPhone = phone.length <= 11 ? `55${phone}` : phone;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(currentMessage)}`, "_blank");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentMessage);
    toast.success("Mensagem copiada!");
  };

  const handleEmail = () => {
    if (!clientEmail) {
      toast.error("Cliente não possui e-mail cadastrado.");
      return;
    }
    const subject = encodeURIComponent(`Lembrete de cobrança — ${description}`);
    const body = encodeURIComponent(currentMessage);
    window.open(`mailto:${clientEmail}?subject=${subject}&body=${body}`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh]">
        <SheetHeader>
          <SheetTitle className="font-heading">Enviar Cobrança</SheetTitle>
        </SheetHeader>

        <div className="py-4 space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm space-y-1">
            <p className="font-medium">{clientName}</p>
            <p className="text-muted-foreground">
              {description} • {formatCurrency(amount)} • Vence {formatDate(dueDate)}
            </p>
          </div>

          <Textarea
            value={currentMessage}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="text-sm"
            placeholder="Mensagem de cobrança..."
          />
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleWhatsApp} className="w-full gap-2 bg-[hsl(142,70%,40%)] hover:bg-[hsl(142,70%,35%)] text-white">
            <MessageSquare className="h-4 w-4" /> WhatsApp
          </Button>
          <Button onClick={handleCopy} variant="outline" className="w-full gap-2">
            <Copy className="h-4 w-4" /> Copiar Mensagem
          </Button>
          <Button onClick={handleEmail} variant="outline" className="w-full gap-2">
            <Mail className="h-4 w-4" /> E-mail
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
