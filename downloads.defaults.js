const SUPPORT_NUMBER = '5574988259925';

function buildSupportUrl(topic) {
  const message = `Ola! Gostaria de mais informacoes sobre ${topic} da Nexus IA.`;
  return `https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default [
  {
    id: 1,
    name: 'Guia de IA para Pequenos Negocios',
    description: 'Material introdutorio sobre como usar inteligencia artificial no dia a dia do seu negocio em Irecê e regiao.',
    type: 'pdf',
    url: buildSupportUrl('o Guia de IA para Pequenos Negocios'),
    size: '1.2 MB',
    downloads: 0,
    date: '2026-07-15',
  },
  {
    id: 2,
    name: 'Checklist de Automacao com IA',
    description: 'Lista pratica de processos que podem ser automatizados com ferramentas de inteligencia artificial.',
    type: 'pdf',
    url: buildSupportUrl('o Checklist de Automacao com IA'),
    size: '850 KB',
    downloads: 0,
    date: '2026-07-15',
  },
];
