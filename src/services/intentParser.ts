export const intentParser = {
  parse(message: string) {
    const msg = message.toLowerCase();
    
    if (msg.includes("saldo")) return "get_balance";
    if (msg.includes("gasto") || msg.includes("despesa")) return "get_expenses";
    if (msg.includes("cartão") || msg.includes("fatura")) return "get_cards";
    
    return "none";
  }
};
