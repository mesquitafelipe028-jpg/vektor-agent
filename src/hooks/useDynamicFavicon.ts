import { useEffect } from 'react';

export function useDynamicFavicon(type: 'system' | 'agent') {
  useEffect(() => {
    const favicon = document.getElementById('favicon') as HTMLLinkElement;
    const appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    
    if (type === 'agent') {
      document.title = "Vektor Agente | Assistente Financeiro";
      if (favicon) favicon.href = "/agent-icon.svg";
      if (appleIcon) appleIcon.href = "/agent-icon.svg";
    } else {
      document.title = "Vektor | Clareza Financeira";
      if (favicon) favicon.href = "/favicon.ico";
      if (appleIcon) appleIcon.href = "/favicon.ico";
    }
  }, [type]);
}
