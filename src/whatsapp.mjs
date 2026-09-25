export const WHATSAPP_NUMBER = '5583999318581';
export function createWhatsAppUrl(message) {
  if (typeof message !== 'string' || !message.trim() || /[{}]/.test(message)) throw new Error('Mensagem de WhatsApp incompleta.');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
export function itemMessage(type, item) {
  if (type === 'properties') return `Olá, Camilla! Vi o imóvel ${item.name}, código ${item.code}, no seu site. Gostaria de confirmar a disponibilidade e receber mais informações.`;
  if (type === 'projects') return `Olá, Camilla! Conheci o projeto ${item.name} no seu site e gostei da proposta. Gostaria de conversar sobre as necessidades do meu espaço.`;
  return `Olá, Camilla! Li o conteúdo ${item.title} no seu site e gostaria de conversar sobre como considerar essas orientações na minha busca por um imóvel.`;
}
