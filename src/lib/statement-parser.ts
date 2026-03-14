import * as XLSX from "xlsx";
import * as pdfjs from "pdfjs-dist";

// PDF.js worker configuration
// @ts-ignore
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface ImportedTransaction {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: "receita" | "despesa";
  categoria: string;
  selected: boolean;
  confidence: "high" | "medium" | "low";
}

const WORDS_RECEITA = ["pix recebido", "ted recebido", "ted", "crédito", "pagamento recebido", "remuneração", "salário", "transferência recebida", "boleto recebido"];
const WORDS_DESPESA = ["pix enviado", "transferência enviada", "pagamento", "compra", "débito", "tarifa", "mensalidade", "fatura", "saque"];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Alimentação": ["supermercado", "mercado", "restaurante", "lanchonete", "delivery", "ifood", "uber eats", "rappi"],
  "Transporte": ["uber", "99", "taxi", "estacionamento", "gasolina", "combustível", "pedágio", "ônibus"],
  "Streaming": ["netflix", "spotify", "amazon prime", "disney", "youtube", "hbo"],
  "Moradia": ["aluguel", "condomínio", "iptu", "luz", "energia", "celular", "internet"],
  "Saúde": ["farmácia", "médico", "plano de saúde", "academia", "gym"],
  "Educação": ["curso", "escola", "faculdade", "livro", "udemy", "alura"],
  "Serviços Bancários": ["tarifa", "iof", "anuidade"],
};

export function guessType(descricao: string, valor: number, typeOverride?: "receita" | "despesa"): "receita" | "despesa" {
  if (typeOverride) return typeOverride;
  if (valor < 0) return "despesa";
  const lower = descricao.toLowerCase();
  if (WORDS_RECEITA.some((w) => lower.includes(w))) return "receita";
  if (WORDS_DESPESA.some((w) => lower.includes(w))) return "despesa";
  return "despesa";
}

export function parseAmount(str: string): number | null {
  if (!str) return null;
  const noCurrency = str.replace(/R\$|USD|EUR/gi, "").trim();
  if (!/^[-+(]?\s*\d+([.,]\d+)*\s*[)]?\s*[a-zA-Z]?$/i.test(noCurrency)) return null;
  if (/[abefghijklmnopqrstuvwxyz]/i.test(noCurrency)) return null;

  let sign = 1;
  if (noCurrency.includes("-") || noCurrency.includes("(") || /D$/i.test(noCurrency)) sign = -1;
  
  const cleaned = noCurrency.replace(/[^0-9.,]/g, "");
  if (!cleaned) return null;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let finalVal: number;
  
  if (lastComma > lastDot && lastComma !== -1) {
    finalVal = parseFloat(cleaned.replace(/\./g, "").replace(",", "."));
  } else if (lastDot > lastComma && lastDot !== -1) {
    finalVal = parseFloat(cleaned.replace(/,/g, ""));
  } else {
    finalVal = parseFloat(cleaned.replace(",", "."));
  }

  if (isNaN(finalVal)) return null;
  if (finalVal >= 1900 && finalVal <= 2100 && !str.includes(",") && !str.includes(".")) return null;

  return finalVal * sign;
}

export function guessCategory(descricao: string): string {
  const lower = descricao.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return cat;
  }
  return "Outros";
}

export function confidenceLevel(descricao: string): "high" | "medium" | "low" {
  const lower = descricao.toLowerCase();
  const allKeywords = Object.values(CATEGORY_KEYWORDS).flat();
  if (allKeywords.some((kw) => lower.includes(kw))) return "high";
  if (WORDS_RECEITA.some((w) => lower.includes(w)) || WORDS_DESPESA.some((w) => lower.includes(w))) return "medium";
  return "low";
}

export function parseRows(rows: any[][]): ImportedTransaction[] {
  const transactions: ImportedTransaction[] = [];
  let mapping: any = null;
  
  for (const row of rows) {
    const cells = row.map((c) => (c !== undefined && c !== null ? String(c).trim() : ""));
    const rowText = cells.join(" ").toLowerCase();
    
    if (!mapping && (rowText.includes("data") || rowText.includes("date")) && (rowText.includes("valor") || rowText.includes("saldo") || rowText.includes("débito"))) {
      mapping = { date: -1, desc: -1, val: -1, credit: -1, debit: -1, balance: -1 };
      cells.forEach((c, i) => {
        const cell = c.toLowerCase();
        if (cell.includes("data") || cell.includes("date")) mapping.date = i;
        if (cell.includes("descri") || cell.includes("histór") || cell.includes("lança")) mapping.desc = i;
        if (cell.includes("valor") || (cell.includes("quantia") && !cell.includes("bloqu"))) mapping.val = i;
        if (cell.includes("crédit") || (cell.includes("entrada") && !cell.includes("saída"))) mapping.credit = i;
        if (cell.includes("débit") || cell.includes("saída")) mapping.debit = i;
        if (cell.includes("saldo") || cell.includes("balance")) mapping.balance = i;
      });
      continue;
    }

    let data = "";
    let descricao = "";
    let valor = 0;

    if (mapping && mapping.date !== -1) {
      data = cells[mapping.date] || "";
      const dateMatch = data.match(/(\d{2}\/\d{2}\/\d{4})|(\d{4}-\d{2}-\d{2})/);
      if (!dateMatch) continue;
      
      data = dateMatch[1] ? dateMatch[1].split("/").reverse().join("-") : dateMatch[2];
      descricao = mapping.desc !== -1 ? cells[mapping.desc] : "";
      
      let foundVal = false;
      let typeOverride: "receita" | "despesa" | undefined = undefined;

      if (mapping.debit !== -1) {
        const v = parseAmount(cells[mapping.debit]);
        if (v !== null && Math.abs(v) > 0.01) { valor = v; foundVal = true; typeOverride = "despesa"; }
      }
      if (!foundVal && mapping.credit !== -1) {
        const v = parseAmount(cells[mapping.credit]);
        if (v !== null && Math.abs(v) > 0.01) { valor = v; foundVal = true; typeOverride = "receita"; }
      }
      if (!foundVal && mapping.val !== -1) {
        const v = parseAmount(cells[mapping.val]);
        if (v !== null && Math.abs(v) > 0.01) { 
          valor = v; foundVal = true;
          if (v < 0) typeOverride = "despesa";
          else if (cells[mapping.val].includes("+")) typeOverride = "receita";
        }
      }
      
      if (!data || !descricao || !foundVal) continue;
      
      transactions.push({
        id: crypto.randomUUID(),
        data,
        descricao: descricao.replace(/\+/g, " ").replace(/\s+/g, " ").trim(),
        valor: Math.abs(valor),
        tipo: guessType(descricao, valor, typeOverride),
        categoria: guessCategory(descricao),
        selected: true,
        confidence: confidenceLevel(descricao),
      });
      continue;
    } else {
      const amountsFound: {val: number, index: number}[] = [];
      cells.forEach((cell, i) => {
        if (!cell) return;
        const dateMatch = cell.match(/(\d{2}\/\d{2}\/\d{4})|(\d{4}-\d{2}-\d{2})/);
        if (dateMatch && !data) data = dateMatch[1] ? dateMatch[1].split("/").reverse().join("-") : dateMatch[2];

        const amount = parseAmount(cell);
        if (amount !== null && Math.abs(amount) > 0.01) amountsFound.push({ val: amount, index: i });

        if (cell.length > 3 && isNaN(Number(cell.replace(",", "."))) && !dateMatch) {
          if (cell.length > descricao.length) descricao = cell;
        }
      });

      if (amountsFound.length > 0) {
        const sorted = amountsFound.sort((a, b) => a.index - b.index);
        valor = sorted[0].val;
      }
    }

    if (!data || !descricao || valor === 0) continue;
    
    transactions.push({
      id: crypto.randomUUID(),
      data,
      descricao: descricao.replace(/\+/g, " ").replace(/\s+/g, " ").trim(),
      valor: Math.abs(valor),
      tipo: guessType(descricao, valor),
      categoria: guessCategory(descricao),
      selected: true,
      confidence: confidenceLevel(descricao),
    });
  }
  return transactions;
}

export async function parseSpreadsheet(file: File): Promise<ImportedTransaction[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        resolve(parseRows(rows));
      } catch (err) { reject(err); }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

export async function parsePDF(file: File): Promise<ImportedTransaction[]> {
  const arrayBuffer = await file.arrayBuffer();
  // @ts-ignore
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
  }

  const lines = fullText.split(/\r?\n/).filter(line => line.trim().length > 0);
  const transactions: ImportedTransaction[] = [];
  
  for (const line of lines) {
    const dateMatch = line.match(/(\d{2}\/\d{2}\/\d{4})|(\d{4}-\d{2}-\d{2})/);
    if (!dateMatch) continue;
    
    const valueMatch = line.match(/(R\$?\s?)?(-?\d{1,3}(\.\d{3})*,\d{2})|(-?\d+\.?\d*)|(\d{1,3}(,\d{3})*\.\d{2})/g);
    if (!valueMatch) continue;
    
    const validAmounts = valueMatch
      .map(v => ({ v, amount: parseAmount(v) }))
      .filter(x => x.amount !== null && Math.abs(x.amount) > 0.01);

    if (validAmounts.length === 0) continue;
    const val = validAmounts[0].amount!;
    
    let descricao = line.replace(dateMatch[0], "").trim();
    valueMatch.forEach(v => { descricao = descricao.replace(v, ""); });
    descricao = descricao.replace(/\s+/g, " ").trim();
    
    if (descricao.length < 2) descricao = "Transação Importada";
    const formattedDate = dateMatch[1] ? dateMatch[1].split("/").reverse().join("-") : dateMatch[2];

    transactions.push({
      id: crypto.randomUUID(),
      data: formattedDate,
      descricao,
      valor: Math.abs(val),
      tipo: guessType(descricao, val),
      categoria: guessCategory(descricao),
      selected: true,
      confidence: confidenceLevel(descricao),
    });
  }
  return transactions;
}
