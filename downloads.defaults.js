const SUPPORT_NUMBER = '5574988259925';

function buildSupportUrl(downloadName) {
  const message = `Ola! Gostaria de receber o arquivo: ${downloadName}.`;
  return `https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default [
  {
    id: 1,
    name: 'Manual de Instalações Individuais (COELBA)',
    description: 'Normas e padrões de entrada de energia individual vigentes exigidos pela concessionária da Bahia.',
    type: 'pdf',
    url: 'https://www.neoenergiacoelba.com.br/normas-tecnicas',
    size: '4.2 MB',
    downloads: 142,
    date: '2024-01-10',
  },
  {
    id: 2,
    name: 'Cartilha de Segurança NR-10 Resumida',
    description: 'Guia ilustrado condensando regras vitais de segurança laboral em ambientes de eletricidade e instalações.',
    type: 'pdf',
    url: 'https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/seguranca-e-saude-no-trabalho/sst-normas-regulamentadoras/norma-regulamentadora-nr-10.pdf',
    size: '1.8 MB',
    downloads: 98,
    date: '2024-01-20',
  },
  {
    id: 3,
    name: 'Checklist de Conformidade NBR 5410',
    description: 'Lista de verificação completa baseada na norma NBR 5410 para instalações elétricas de baixa tensão.',
    type: 'pdf',
    url: buildSupportUrl('Checklist de Conformidade NBR 5410'),
    size: '1.2 MB',
    downloads: 75,
    date: '2024-02-10',
  },
  {
    id: 4,
    name: 'Template de Elaboração de Orçamento',
    description: 'Planilha modelo para elaboração de orçamentos de serviços elétricos com cálculos de materiais automáticos.',
    type: 'xls',
    url: buildSupportUrl('Template de Elaboracao de Orcamento'),
    size: '850 KB',
    downloads: 50,
    date: '2024-02-01',
  },
  {
    id: 5,
    name: 'Portfólio de Projetos | Ivonei Ferreira',
    description: 'Apresentação técnica unificada compilando projetos comerciais, subestações e laudos já entregues com ART/CRT.',
    type: 'pdf',
    url: buildSupportUrl('Portfolio de Projetos | Ivonei Ferreira'),
    size: '3.5 MB',
    downloads: 215,
    date: '2024-03-05',
  },
];
