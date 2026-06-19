// Banco de dados de downloads (simulado)
// Em produção, isso viria de uma API/Backend

const DOWNLOADS_DATABASE = [
    {
        id: 1,
        name: 'Catálogo de Serviços 2024',
        description: 'Catálogo completo com todos os serviços elétricos oferecidos. Instalações residenciais, industriais, projetos e laudos técnicos.',
        type: 'pdf',
        url: 'https://exemplo.com/catalogo-servicos-2024.pdf',
        size: '2.5 MB',
        downloads: 0,
        date: '2024-01-15'
    },
    {
        id: 2,
        name: 'Manual de Segurança NR-10',
        description: 'Normas regulamentadoras de segurança em instalações e serviços em eletricidade. Procedimentos obrigatórios e boas práticas.',
        type: 'pdf',
        url: 'https://exemplo.com/manual-nr10.pdf',
        size: '1.8 MB',
        downloads: 0,
        date: '2024-01-20'
    },
    {
        id: 3,
        name: 'Template de Orçamento',
        description: 'Planilha modelo para elaboração de orçamentos de serviços elétricos. Inclui todos os itens necessários e cálculos automáticos.',
        type: 'xls',
        url: 'https://exemplo.com/template-orcamento.xlsx',
        size: '850 KB',
        downloads: 0,
        date: '2024-02-01'
    },
    {
        id: 4,
        name: 'Checklist NBR 5410',
        description: 'Lista de verificação completa baseada na norma NBR 5410 para instalações elétricas de baixa tensão.',
        type: 'pdf',
        url: 'https://exemplo.com/checklist-nbr5410.pdf',
        size: '1.2 MB',
        downloads: 0,
        date: '2024-02-10'
    },
    {
        id: 5,
        name: 'Catálogo de Produtos',
        description: 'Catálogo com os principais produtos e equipamentos elétricos utilizados em nossos projetos. Marcas e especificações técnicas.',
        type: 'pdf',
        url: 'https://exemplo.com/catalogo-produtos.pdf',
        size: '3.2 MB',
        downloads: 0,
        date: '2024-02-15'
    }
];

// Função para obter todos os downloads
function getAllDownloads() {
    // Tenta carregar do localStorage primeiro (para dados do admin)
    const stored = localStorage.getItem('downloads');
    if (stored) {
        try {
            const parsedData = JSON.parse(stored);
            if (parsedData && parsedData.length > 0) {
                return parsedData;
            }
        } catch (e) {
            console.error('Erro ao carregar downloads do localStorage:', e);
        }
    }
    
    // Se não houver dados no localStorage, usa os dados padrão
    return DOWNLOADS_DATABASE;
}

// Função para salvar downloads
function saveDownloads(downloads) {
    localStorage.setItem('downloads', JSON.stringify(downloads));
}

// Função para obter um download por ID
function getDownloadById(id) {
    const downloads = getAllDownloads();
    return downloads.find(d => d.id === id);
}

// Função para adicionar download
function addDownload(download) {
    const downloads = getAllDownloads();
    download.id = Date.now();
    download.downloads = 0;
    download.date = new Date().toISOString().split('T')[0];
    downloads.unshift(download);
    saveDownloads(downloads);
    return download;
}

// Função para atualizar download
function updateDownload(id, updatedData) {
    const downloads = getAllDownloads();
    const index = downloads.findIndex(d => d.id === id);
    if (index !== -1) {
        downloads[index] = { ...downloads[index], ...updatedData };
        saveDownloads(downloads);
        return downloads[index];
    }
    return null;
}

// Função para deletar download
function deleteDownload(id) {
    let downloads = getAllDownloads();
    downloads = downloads.filter(d => d.id !== id);
    saveDownloads(downloads);
    return true;
}

// Função para incrementar contador de downloads
function incrementDownloadCount(id) {
    const downloads = getAllDownloads();
    const download = downloads.find(d => d.id === id);
    if (download) {
        download.downloads = (download.downloads || 0) + 1;
        saveDownloads(downloads);
    }
}
