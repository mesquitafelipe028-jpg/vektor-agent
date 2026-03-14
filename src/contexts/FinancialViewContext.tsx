import React, { createContext, useContext, useState, useEffect } from "react";

export type FinancialView = "pessoal" | "mei" | "tudo";

interface FinancialViewContextType {
  view: FinancialView;
  setView: (view: FinancialView) => void;
}

const FinancialViewContext = createContext<FinancialViewContextType | undefined>(undefined);

export function FinancialViewProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage if available, otherwise default to "tudo"
  const [view, setViewInternal] = useState<FinancialView>(() => {
    const savedView = localStorage.getItem("vektor_financial_view");
    return (savedView as FinancialView) || "tudo";
  });

  const setView = (newView: FinancialView) => {
    setViewInternal(newView);
    localStorage.setItem("vektor_financial_view", newView);
  };

  return (
    <FinancialViewContext.Provider value={{ view, setView }}>
      {children}
    </FinancialViewContext.Provider>
  );
}

export function useFinancialView() {
  const context = useContext(FinancialViewContext);
  if (context === undefined) {
    throw new Error("useFinancialView must be used within a FinancialViewProvider");
  }
  return context;
}
