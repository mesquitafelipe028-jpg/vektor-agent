import { useState } from "react";
import {
  AlignLeft, DollarSign, RefreshCw, Calendar, CheckCircle2,
  Building2, ChevronRight, ChevronDown, Users, Tag, X,
  CreditCard,
} from "lucide-react";
import { expenseCategories, revenueCategories, type CategoryMeta } from "@/lib/categories";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import type { TipoTransacao, Frequencia } from "@/types/transactions";
import { frequenciaLabels } from "@/types/transactions";

export type TransactionFormType = "receita" | "despesa";

export interface TransactionFormData {
  descricao: string;
  valor: string;
  data: string;
  tipo_transacao: TipoTransacao;
  frequencia: string;
  data_inicio: string;
  data_fim: string;
  tipo_conta: string;
  efetivada: boolean;
  // Receita-specific
  forma_pagamento?: string;
  cliente_id?: string;
  // Despesa-specific
  categoria?: string;
  numero_parcelas?: string;
}

interface TransactionFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: TransactionFormType;
  form: TransactionFormData;
  onFormChange: (form: TransactionFormData) => void;
  onSave: () => void;
  isSaving: boolean;
  isEditing: boolean;
  errors: Record<string, string>;
  // Receita-specific
  clientes?: { id: string; nome: string }[];
  // Despesa-specific
  categories?: string[];
  suggestedCategory?: string | null;
  onDescriptionChange?: (desc: string) => void;
  // Custom categories from DB
  customCategories?: CategoryMeta[];
}

function FormRow({
  icon: Icon,
  label,
  children,
  sublabel,
  onClick,
  expandable,
  expanded,
}: {
  icon: React.ElementType;
  label: string;
  children?: React.ReactNode;
  sublabel?: string;
  onClick?: () => void;
  expandable?: boolean;
  expanded?: boolean;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 w-full ${onClick ? "cursor-pointer hover:bg-muted/50 active:bg-muted transition-colors" : ""}`}
    >
      <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
      {expandable && (
        expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
    </Wrapper>
  );
}

function CategoryGrid({
  categories,
  selected,
  onSelect,
}: {
  categories: CategoryMeta[];
  selected: string;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
      {categories.map((cat) => {
        const isSelected = selected === cat.name;
        const Icon = cat.icon;
        return (
          <button
            key={cat.name}
            type="button"
            onClick={() => onSelect(cat.name)}
            className={`flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all ${
              isSelected
                ? `ring-2 ring-primary ${cat.bg} scale-[1.02]`
                : "hover:bg-muted/60"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${cat.bg}`}
            >
              <Icon className={`h-5 w-5 ${cat.color}`} />
            </div>
            <span className={`text-[10px] leading-tight text-center font-medium ${
              isSelected ? "text-foreground" : "text-muted-foreground"
            }`}>
              {cat.name.length > 10 ? cat.name.split("/")[0].split(" ")[0] : cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
function RecurrenceLabel(tipo: TipoTransacao, frequencia: string, numero_parcelas?: string): string {
  if (tipo === "recorrente" && frequencia) {
    return frequenciaLabels[frequencia as Frequencia] || "Recorrente";
  }
  if (tipo === "parcelada" && numero_parcelas) {
    return `Parcelada (${numero_parcelas}x)`;
  }
  if (tipo === "recorrente") return "Recorrente";
  if (tipo === "parcelada") return "Parcelada";
  return "Não recorrente";
}

export function TransactionFormSheet({
  open,
  onOpenChange,
  type,
  form,
  onFormChange,
  onSave,
  isSaving,
  isEditing,
  errors,
  clientes,
  categories,
  suggestedCategory,
  onDescriptionChange,
  customCategories,
}: TransactionFormSheetProps) {
  const isMobile = useIsMobile();
  const [recurrenceOpen, setRecurrenceOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const update = (partial: Partial<TransactionFormData>) => {
    onFormChange({ ...form, ...partial });
  };

  const accentColor = type === "receita"
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-red-600 dark:text-red-400";

  const accentBg = type === "receita"
    ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
    : "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600";

  const title = isEditing
    ? type === "receita" ? "Editar Receita" : "Editar Despesa"
    : type === "receita" ? "Nova Receita" : "Nova Despesa";

  const formContent = (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button type="button" onClick={() => onOpenChange(false)} className="p-1">
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
        <h2 className="font-heading text-base font-semibold">{title}</h2>
        <Button
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className={`${accentBg} text-white px-5 rounded-full text-sm`}
        >
          {isSaving ? "..." : "Salvar"}
        </Button>
      </div>

      {/* Form Fields */}
      <div 
        className="flex-1 overflow-y-auto min-h-0 overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      >
        {/* Descrição */}
        <div className="px-4 py-3.5 flex items-center gap-3">
          <AlignLeft className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <Input
              value={form.descricao}
              onChange={(e) => {
                if (onDescriptionChange) {
                  onDescriptionChange(e.target.value);
                } else {
                  update({ descricao: e.target.value });
                }
              }}
              placeholder={type === "receita" ? "Descrição da receita" : "Ex: Uber, Netflix, iFood..."}
              className="border-0 p-0 h-auto text-sm font-medium shadow-none focus-visible:ring-0 bg-transparent"
              maxLength={200}
            />
            {errors.descricao && <p className="text-xs text-destructive mt-1">{errors.descricao}</p>}
          </div>
        </div>
        <Separator />

        {/* Valor */}
        <div className="px-4 py-3.5 flex items-center gap-3">
          <DollarSign className={`h-5 w-5 shrink-0 ${accentColor}`} />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">
              {form.tipo_transacao === "parcelada" ? "Valor Total (R$)" : "Valor (R$)"}
            </p>
            <Input
              type="number"
              step="0.01"
              value={form.valor}
              onChange={(e) => update({ valor: e.target.value })}
              placeholder="0,00"
              className="border-0 p-0 h-auto text-lg font-bold shadow-none focus-visible:ring-0 bg-transparent"
            />
            {errors.valor && <p className="text-xs text-destructive mt-1">{errors.valor}</p>}
          </div>
        </div>
        <Separator />

        {/* Recorrência */}
        {!isEditing && (
          <>
            <FormRow
              icon={RefreshCw}
              label={RecurrenceLabel(form.tipo_transacao, form.frequencia, form.numero_parcelas)}
              sublabel={form.tipo_transacao === "unica" ? "Transação avulsa" : undefined}
              onClick={() => setRecurrenceOpen(!recurrenceOpen)}
              expandable
              expanded={recurrenceOpen}
            />
            <AnimatePresence>
              {recurrenceOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3 space-y-3 bg-muted/30">
                    {/* Type selector */}
                    <div className={`grid ${type === "despesa" ? "grid-cols-3" : "grid-cols-2"} gap-2 pt-2`}>
                      {([
                        { value: "unica" as const, label: "Única" },
                        { value: "recorrente" as const, label: "Recorrente" },
                        ...(type === "despesa" ? [{ value: "parcelada" as const, label: "Parcelada" }] : []),
                      ]).map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => update({ tipo_transacao: opt.value as TipoTransacao })}
                          className={`rounded-lg border-2 py-2 px-3 text-xs font-medium text-center transition-all ${
                            form.tipo_transacao === opt.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-muted-foreground/30"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Recorrente config */}
                    {form.tipo_transacao === "recorrente" && (
                      <div className="space-y-2">
                        <Select value={form.frequencia} onValueChange={(v) => update({ frequencia: v })}>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Frequência" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="semanal">Semanal</SelectItem>
                            <SelectItem value="quinzenal">Quinzenal</SelectItem>
                            <SelectItem value="mensal">Mensal</SelectItem>
                            <SelectItem value="anual">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-1">Início</p>
                            <Input
                              type="date"
                              value={form.data_inicio}
                              onChange={(e) => update({ data_inicio: e.target.value })}
                              className="h-9 text-xs"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-1">Fim (opcional)</p>
                            <Input
                              type="date"
                              value={form.data_fim}
                              onChange={(e) => update({ data_fim: e.target.value })}
                              className="h-9 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Parcelada config */}
                    {form.tipo_transacao === "parcelada" && type === "despesa" && (
                      <div className="space-y-2">
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1">Número de Parcelas</p>
                          <Input
                            type="number"
                            min="2"
                            max="72"
                            value={form.numero_parcelas || ""}
                            onChange={(e) => update({ numero_parcelas: e.target.value })}
                            placeholder="Ex: 12"
                            className="h-9 text-xs"
                          />
                        </div>
                        {form.valor && form.numero_parcelas && parseInt(form.numero_parcelas) > 1 && (
                          <p className="text-xs text-muted-foreground">
                            → {form.numero_parcelas}x de R$ {(parseFloat(form.valor) / parseInt(form.numero_parcelas)).toFixed(2)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <Separator />
          </>
        )}

        {/* Data */}
        <div className="px-4 py-3.5 flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">
              {form.tipo_transacao === "parcelada" ? "Data da 1ª Parcela" : "Data de Vencimento"}
            </p>
            <Input
              type="date"
              value={form.data}
              onChange={(e) => update({ data: e.target.value })}
              className="border-0 p-0 h-auto text-sm font-medium shadow-none focus-visible:ring-0 bg-transparent"
            />
            {errors.data && <p className="text-xs text-destructive mt-1">{errors.data}</p>}
          </div>
        </div>
        <Separator />

        {/* Efetivada Toggle */}
        <div className="px-4 py-3.5 flex items-center gap-3">
          <CheckCircle2 className={`h-5 w-5 shrink-0 ${form.efetivada ? accentColor : "text-muted-foreground"}`} />
          <div className="flex-1">
            <p className="text-sm font-medium">Efetivada</p>
            <p className="text-xs text-muted-foreground">
              {type === "receita"
                ? form.efetivada ? "Recebido" : "Pendente"
                : form.efetivada ? "Pago" : "Pendente"
              }
            </p>
          </div>
          <Switch
            checked={form.efetivada}
            onCheckedChange={(v) => update({ efetivada: v })}
          />
        </div>
        <Separator />

        {/* Cliente (receita only) */}
        {type === "receita" && clientes && (
          <>
            <div className="px-4 py-3.5 flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Cliente</p>
                <Select value={form.cliente_id || ""} onValueChange={(v) => update({ cliente_id: v === "none" ? "" : v })}>
                  <SelectTrigger className="border-0 p-0 h-auto shadow-none focus:ring-0 text-sm font-medium bg-transparent">
                    <SelectValue placeholder="Selecionar cliente (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Forma de Pagamento (receita only) */}
        {type === "receita" && (
          <>
            <div className="px-4 py-3.5 flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Forma de Pagamento</p>
                <Select value={form.forma_pagamento || ""} onValueChange={(v) => update({ forma_pagamento: v })}>
                  <SelectTrigger className="border-0 p-0 h-auto shadow-none focus:ring-0 text-sm font-medium bg-transparent">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pix">Pix</SelectItem>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                    <SelectItem value="Cartão">Cartão</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Categoria (grid visual) */}
        {(type === "despesa" || type === "receita") && (
          <>
            <FormRow
              icon={Tag}
              label="Categoria"
              sublabel={form.categoria || "Selecionar categoria"}
              onClick={() => setCategoryOpen(!categoryOpen)}
              expandable
              expanded={categoryOpen}
            >
              {suggestedCategory && form.categoria === suggestedCategory && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">Sugerida</Badge>
              )}
            </FormRow>
            <AnimatePresence>
              {categoryOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3 pt-2 bg-muted/30">
                    <CategoryGrid
                      categories={customCategories && customCategories.length > 0 ? customCategories : (type === "despesa" ? (categories ? expenseCategories.filter(c => categories.includes(c.name)) : expenseCategories) : revenueCategories)}
                      selected={form.categoria || ""}
                      onSelect={(name) => update({ categoria: name })}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <Separator />
          </>
        )}

        {/* Tipo de Conta */}
        <div className="px-4 py-3.5 flex items-center gap-3">
          <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">Tipo de Conta</p>
            <Select value={form.tipo_conta} onValueChange={(v) => update({ tipo_conta: v })}>
              <SelectTrigger className="border-0 p-0 h-auto shadow-none focus:ring-0 text-sm font-medium bg-transparent">
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mei">MEI</SelectItem>
                <SelectItem value="pessoal">Pessoal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }} className="min-h-4" />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[92vh] p-0 rounded-t-2xl overflow-hidden flex flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          {formContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90dvh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
