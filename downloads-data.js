const DOWNLOADS_CACHE_KEY = 'downloads';
const DOWNLOADS_API_ENDPOINTS = ['/.netlify/functions/downloads', '/api/downloads'];
const DOWNLOADS_SUPPORT_NUMBER = '5574988259925';

function buildDownloadRequestUrl(downloadName = 'material tecnico') {
    const message = `Ola! Gostaria de receber o arquivo: ${downloadName}.`;
    return `https://wa.me/${DOWNLOADS_SUPPORT_NUMBER}?text=${encodeURIComponent(message)}`;
}

function sanitizeDownloadUrl(url) {
    const trimmedUrl = String(url || '').trim();
    if (!trimmedUrl) return '#';

    try {
        const parsedUrl = new URL(trimmedUrl, window.location.origin);
        const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
        return allowedProtocols.includes(parsedUrl.protocol) ? trimmedUrl : '#';
    } catch (error) {
        console.warn('URL de download invalida:', error);
        return '#';
    }
}

function isPlaceholderDownloadUrl(url) {
    const safeUrl = sanitizeDownloadUrl(url);
    if (safeUrl === '#') return true;

    try {
        const parsedUrl = new URL(safeUrl, window.location.origin);
        return ['exemplo.com', 'www.exemplo.com'].includes(parsedUrl.hostname);
    } catch {
        return true;
    }
}

function resolveDownloadAction(download) {
    const safeUrl = sanitizeDownloadUrl(download?.url || '');

    if (isPlaceholderDownloadUrl(safeUrl)) {
        return {
            href: buildDownloadRequestUrl(download?.name || 'material tecnico'),
            label: 'Solicitar arquivo',
            helperText: 'Arquivo enviado sob demanda no WhatsApp.',
            isDirectDownload: false,
        };
    }

    if (safeUrl.includes('wa.me/')) {
        return {
            href: safeUrl,
            label: 'Pedir no WhatsApp',
            helperText: 'Atendimento direto para liberar o material.',
            isDirectDownload: false,
        };
    }

    if (safeUrl.startsWith('mailto:') || safeUrl.startsWith('tel:')) {
        return {
            href: safeUrl,
            label: 'Entrar em contato',
            helperText: 'Canal direto para solicitar o material.',
            isDirectDownload: false,
        };
    }

    return {
        href: safeUrl,
        label: 'Fazer download',
        helperText: 'Link publico disponivel para abertura imediata.',
        isDirectDownload: true,
    };
}

const DOWNLOADS_DATABASE = [
    {
        id: 1,
        name: 'Catálogo de Serviços 2024',
        description: 'Catálogo completo com todos os serviços elétricos oferecidos. Instalações residenciais, industriais, projetos e laudos técnicos.',
        type: 'pdf',
        url: buildDownloadRequestUrl('Catalogo de Servicos 2024'),
        size: '2.5 MB',
        downloads: 0,
        date: '2024-01-15'
    },
    {
        id: 2,
        name: 'Manual de Segurança NR-10',
        description: 'Normas regulamentadoras de segurança em instalações e serviços em eletricidade. Procedimentos obrigatórios e boas práticas.',
        type: 'pdf',
        url: 'https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/seguranca-e-saude-no-trabalho/sst-normas-regulamentadoras/norma-regulamentadora-nr-10.pdf',
        size: '1.8 MB',
        downloads: 0,
        date: '2024-01-20'
    },
    {
        id: 3,
        name: 'Template de Orçamento',
        description: 'Planilha modelo para elaboração de orçamentos de serviços elétricos. Inclui todos os itens necessários e cálculos automáticos.',
        type: 'xls',
        url: buildDownloadRequestUrl('Template de Orcamento'),
        size: '850 KB',
        downloads: 0,
        date: '2024-02-01'
    },
    {
        id: 4,
        name: 'Checklist NBR 5410',
        description: 'Lista de verificação completa baseada na norma NBR 5410 para instalações elétricas de baixa tensão.',
        type: 'pdf',
        url: buildDownloadRequestUrl('Checklist NBR 5410'),
        size: '1.2 MB',
        downloads: 0,
        date: '2024-02-10'
    },
    {
        id: 5,
        name: 'Catálogo de Produtos',
        description: 'Catálogo com os principais produtos e equipamentos elétricos utilizados em nossos projetos. Marcas e especificações técnicas.',
        type: 'pdf',
        url: buildDownloadRequestUrl('Catalogo de Produtos'),
        size: '3.2 MB',
        downloads: 0,
        date: '2024-02-15'
    }
];

function getCachedDownloads() {
    const stored = localStorage.getItem(DOWNLOADS_CACHE_KEY);
    if (stored) {
        try {
            const parsedData = JSON.parse(stored);
            if (Array.isArray(parsedData)) {
                return parsedData;
            }
        } catch (error) {
            console.error('Erro ao carregar downloads do cache local:', error);
        }
    }
    return DOWNLOADS_DATABASE;
}

function saveCachedDownloads(downloads) {
    localStorage.setItem(DOWNLOADS_CACHE_KEY, JSON.stringify(downloads));
}

function normalizeDownloadList(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.downloads)) return data.downloads;
    if (data && data.download) return [data.download];
    return [];
}

async function requestDownloads(method, payload = null) {
    const requestOptions = {
        method,
        headers: payload ? { 'Content-Type': 'application/json' } : undefined,
        body: payload ? JSON.stringify(payload) : undefined,
        keepalive: method !== 'GET',
    };

    for (const endpoint of DOWNLOADS_API_ENDPOINTS) {
        try {
            const response = await fetch(endpoint, requestOptions);
            if (!response.ok) continue;
            return await response.json();
        } catch (error) {
            console.warn(`Falha ao acessar ${endpoint}:`, error);
        }
    }

    throw new Error('Nenhum endpoint de downloads respondeu com sucesso.');
}

async function getAllDownloads() {
    try {
        const remoteData = await requestDownloads('GET');
        const normalizedDownloads = normalizeDownloadList(remoteData);
        const downloads = normalizedDownloads.length > 0 ? normalizedDownloads : DOWNLOADS_DATABASE;
        saveCachedDownloads(downloads);
        return downloads;
    } catch (error) {
        console.warn('Usando cache local de downloads:', error);
        return getCachedDownloads();
    }
}

async function getDownloadById(id) {
    const downloads = await getAllDownloads();
    return downloads.find((download) => String(download.id) === String(id));
}

async function addDownload(download) {
    const response = await requestDownloads('POST', { action: 'create', download });
    const updatedDownloads = normalizeDownloadList(response);
    const downloads = updatedDownloads.length > 0 ? updatedDownloads : getCachedDownloads();
    saveCachedDownloads(downloads);
    return response && response.download ? response.download : downloads[0] || null;
}

async function updateDownload(id, updatedData) {
    const response = await requestDownloads('PUT', { id, updatedData });
    const updatedDownloads = normalizeDownloadList(response);
    const downloads = updatedDownloads.length > 0 ? updatedDownloads : getCachedDownloads();
    saveCachedDownloads(downloads);
    return downloads.find((download) => String(download.id) === String(id)) || null;
}

async function deleteDownload(id) {
    const response = await requestDownloads('DELETE', { id });
    const updatedDownloads = normalizeDownloadList(response);
    const downloads = updatedDownloads.length > 0 ? updatedDownloads : getCachedDownloads();
    saveCachedDownloads(downloads);
    return true;
}

async function incrementDownloadCount(id) {
    try {
        const response = await requestDownloads('POST', { action: 'increment', id });
        const updatedDownloads = normalizeDownloadList(response);
        const downloads = updatedDownloads.length > 0 ? updatedDownloads : getCachedDownloads();
        saveCachedDownloads(downloads);
    } catch (error) {
        console.warn('Não foi possível incrementar o contador de download:', error);
    }
}

function saveDownloads(downloads) {
    saveCachedDownloads(downloads);
}

window.DOWNLOADS_DATABASE = DOWNLOADS_DATABASE;
window.getAllDownloads = getAllDownloads;
window.saveDownloads = saveDownloads;
window.getDownloadById = getDownloadById;
window.addDownload = addDownload;
window.updateDownload = updateDownload;
window.deleteDownload = deleteDownload;
window.incrementDownloadCount = incrementDownloadCount;
window.buildDownloadRequestUrl = buildDownloadRequestUrl;
window.sanitizeDownloadUrl = sanitizeDownloadUrl;
window.isPlaceholderDownloadUrl = isPlaceholderDownloadUrl;
window.resolveDownloadAction = resolveDownloadAction;
