// ── Brazilian banks with brand colors ──
export interface BankInfo {
  id: string;
  name: string;
  color: string;        // primary brand color
  textColor: string;    // text on brand color
  initials: string;     // 2-letter abbreviation
}

export const banks: BankInfo[] = [
  { id: "nubank",       name: "Nubank",         color: "#8A05BE", textColor: "#FFFFFF", initials: "NU" },
  { id: "itau",         name: "Itaú",           color: "#EC7000", textColor: "#FFFFFF", initials: "IT" },
  { id: "bb",           name: "Banco do Brasil", color: "#FECE00", textColor: "#003882", initials: "BB" },
  { id: "bradesco",     name: "Bradesco",        color: "#CC092F", textColor: "#FFFFFF", initials: "BR" },
  { id: "santander",    name: "Santander",       color: "#EC0000", textColor: "#FFFFFF", initials: "SA" },
  { id: "caixa",        name: "Caixa",           color: "#005CA9", textColor: "#FFFFFF", initials: "CX" },
  { id: "inter",        name: "Inter",           color: "#FF7A00", textColor: "#FFFFFF", initials: "IN" },
  { id: "c6",           name: "C6 Bank",         color: "#242424", textColor: "#FFFFFF", initials: "C6" },
  { id: "mercadopago",  name: "Mercado Pago",    color: "#009EE3", textColor: "#FFFFFF", initials: "MP" },
  { id: "pagbank",      name: "PagBank",         color: "#00A859", textColor: "#FFFFFF", initials: "PB" },
  { id: "neon",         name: "Neon",            color: "#0099FF", textColor: "#FFFFFF", initials: "NE" },
  { id: "sicoob",       name: "Sicoob",          color: "#003641", textColor: "#FFFFFF", initials: "SC" },
  { id: "outro",        name: "Outro",           color: "#6B7280", textColor: "#FFFFFF", initials: "OT" },
];

export function getBankById(id: string | null): BankInfo | undefined {
  return banks.find((b) => b.id === id);
}

export function BankLogo({ bankId, size = 32 }: { bankId: string | null; size?: number }) {
  const bank = getBankById(bankId);
  if (!bank) return null;
  const fontSize = size * 0.38;
  return (
    <div
      className="rounded-lg flex items-center justify-center font-bold shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: bank.color,
        color: bank.textColor,
        fontSize,
        lineHeight: 1,
      }}
    >
      {bank.initials}
    </div>
  );
}
