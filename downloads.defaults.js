const SUPPORT_NUMBER = '5574988259925';

function buildSupportUrl(topic) {
  const message = `Ola! Gostaria de receber ${topic} da FluxoIA.`;
  return `https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default [
  {
    id: 1,
    name: 'Guia de Automação com IA para Pequenas Empresas',
    description:
      'E-book prático mostrando, passo a passo, como pequenas empresas de Irecê e região podem usar inteligência artificial para vender mais e economizar tempo.',
    type: 'pdf',
    url: buildSupportUrl('o Guia de Automação com IA para Pequenas Empresas'),
    size: '1.4 MB',
    downloads: 0,
    date: '2026-07-15',
  },
  {
    id: 2,
    name: 'Checklist: seu negócio está pronto para chatbots?',
    description:
      'Lista de verificação rápida para descobrir se a sua empresa já pode implantar um chatbot inteligente no WhatsApp e no site.',
    type: 'pdf',
    url: buildSupportUrl('o Checklist "seu negócio está pronto para chatbots?"'),
    size: '620 KB',
    downloads: 0,
    date: '2026-07-15',
  },
  {
    id: 3,
    name: 'Modelo de fluxo n8n para atendimento automático',
    description:
      'Template pronto de fluxo no n8n para automatizar o atendimento e a qualificação de leads. Importe e adapte ao seu negócio.',
    type: 'json',
    url: buildSupportUrl('o Modelo de fluxo n8n para atendimento automático'),
    size: '48 KB',
    downloads: 0,
    date: '2026-07-15',
  },
  {
    id: 4,
    name: 'E-book: IA aplicada a negócios em Irecê',
    description:
      'Casos reais e ideias de como comércios, clínicas e prestadores de serviço de Irecê-BA estão usando IA para crescer.',
    type: 'pdf',
    url: buildSupportUrl('o E-book "IA aplicada a negócios em Irecê"'),
    size: '2.1 MB',
    downloads: 0,
    date: '2026-07-15',
  },
  {
    id: 5,
    name: 'Planilha: calculadora de ROI de automação',
    description:
      'Planilha simples para estimar quanto tempo e dinheiro sua empresa pode economizar automatizando processos com IA.',
    type: 'xlsx',
    url: buildSupportUrl('a Planilha calculadora de ROI de automação'),
    size: '95 KB',
    downloads: 0,
    date: '2026-07-15',
  },
];
