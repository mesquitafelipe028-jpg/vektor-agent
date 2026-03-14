import { useEffect } from 'react';

export function useDynamicFavicon(type: 'system' | 'agent') {
  useEffect(() => {
    const favicon = document.getElementById('favicon') as HTMLLinkElement;
    const appleIcon = document.getElementById('apple-icon') as HTMLLinkElement;
    
    if (type === 'agent') {
      document.title = "Vektor Agente | Assistente Financeiro";
      if (favicon) favicon.href = "/favicon-agent.png";
      if (appleIcon) appleIcon.href = "/favicon-agent.png";
    } else {
      document.title = "Vektor | Clareza Financeira";
      if (favicon) favicon.href = "/favicon.ico";
      if (appleIcon) appleIcon.href = "/favicon.ico";
    }
  }, [type]);
}
