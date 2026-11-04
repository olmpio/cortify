/**
 * Link wa.me para abrir uma conversa no WhatsApp (Web/App) com o número já preenchido.
 * NÃO envia nada automaticamente: só abre a conversa para o lojista escrever.
 * Aceita "(11) 98765-4321", "11987654321", "+55 11 98765-4321"... Sem DDI, assume Brasil (55).
 */
export function whatsappLink(telefone?: string): string | null {
  if (!telefone) return null;
  let d = telefone.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 10 || d.length === 11) d = `55${d}`;
  if (d.length < 12 || d.length > 15) return null;
  return `https://wa.me/${d}`;
}
