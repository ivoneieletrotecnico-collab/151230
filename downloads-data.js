const DOWNLOADS_CACHE_KEY = 'downloads';
const DOWNLOADS_API_ENDPOINTS = ['/api/downloads'];
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
        name: 'Catalogo de Servicos 2024',
        description: 'Catalogo completo com todos os servicos eletricos oferecidos. Instalacoes residenciais, industriais, projetos e laudos tecnicos.',
        type: 'pdf',
        url: buildDownloadRequestUrl('Catalogo de Servicos 2024'),
        size: '2.5 MB',
        downloads: 0,
        date: '2024-01-15'
    },
    {
        id: 2,
        name: 'Manual de Seguranca NR-10',
        description: 'Normas regulamentadoras de seguranca em instalacoes e servicos em eletricidade. Procedimentos obrigatorios e boas praticas.',
        type: 'pdf',
        url: 'https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/seguranca-e-saude-no-trabalho/sst-normas-regulamentadoras/norma-regulamentadora-nr-10.pdf',
        size: '1.8 MB',
        downloads: 0,
        date: '2024-01-20'
    },
    {
        id: 3,
        name: 'Template de Orcamento',
        description: 'Planilha modelo para elaboracao de orcamentos de servicos eletricos. Inclui todos os itens necessarios e calculos automaticos.',
        type: 'xls',
        url: buildDownloadRequestUrl('Template de Orcamento'),
        size: '850 KB',
        downloads: 0,
        date: '2024-02-01'
    },
    {
        id: 4,
        name: 'Checklist NBR 5410',
        description: 'Lista de verificacao completa baseada na norma NBR 5410 para instalacoes eletricas de baixa tensao.',
        type: 'pdf',
        url: buildDownloadRequestUrl('Checklist NBR 5410'),
        size: '1.2 MB',
        downloads: 0,
        date: '2024-02-10'
    },
    {
        id: 5,
        name: 'Catalogo de Produtos',
        description: 'Catalogo com os principais produtos e equipamentos eletricos utilizados em nossos projetos. Marcas e especificacoes tecnicas.',
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
    return JSON.parse(JSON.stringify(DOWNLOADS_DATABASE));
}

function saveCachedDownloads(downloads) {
    localStorage.setItem(DOWNLOADS_CACHE_KEY, JSON.stringify(downloads));
}

function getNextDownloadId(downloads) {
    return downloads.reduce((maxId, item) => Math.max(maxId, Number(item?.id) || 0), 0) + 1;
}

function normalizeDownload(download, currentId = null, currentDownloads = 0, currentDate = null) {
    return {
        id: currentId ?? Date.now(),
        name: String(download?.name || '').trim(),
        description: String(download?.description || download?.desc || '').trim(),
        type: String(download?.type || 'pdf').trim().toLowerCase(),
        url: sanitizeDownloadUrl(download?.url || ''),
        size: String(download?.size || 'Varia').trim(),
        downloads: Number(currentDownloads || 0),
        date: currentDate || new Date().toISOString().split('T')[0],
    };
}

function createLocalDownload(download) {
    const downloads = getCachedDownloads();
    const createdDownload = normalizeDownload(download, getNextDownloadId(downloads));
    const updatedDownloads = [createdDownload, ...downloads];
    saveCachedDownloads(updatedDownloads);
    return createdDownload;
}

function updateLocalDownload(id, updatedData) {
    const downloads = getCachedDownloads();
    const targetId = String(id);
    const index = downloads.findIndex((download) => String(download.id) === targetId);

    if (index === -1) {
        throw new Error('Download nao encontrado no armazenamento local.');
    }

    const currentDownload = downloads[index];
    downloads[index] = normalizeDownload(
        { ...currentDownload, ...updatedData },
        currentDownload.id,
        currentDownload.downloads || 0,
        currentDownload.date
    );
    saveCachedDownloads(downloads);
    return downloads[index];
}

function deleteLocalDownload(id) {
    const downloads = getCachedDownloads();
    const targetId = String(id);
    const filteredDownloads = downloads.filter((download) => String(download.id) !== targetId);
    saveCachedDownloads(filteredDownloads);
    return filteredDownloads.length !== downloads.length;
}

function incrementLocalDownloadCount(id) {
    const downloads = getCachedDownloads();
    const targetId = String(id);
    const index = downloads.findIndex((download) => String(download.id) === targetId);

    if (index === -1) {
        return false;
    }

    downloads[index].downloads = Number(downloads[index].downloads || 0) + 1;
    saveCachedDownloads(downloads);
    return true;
}

function normalizeDownloadList(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.downloads)) return data.downloads;
    if (data && data.download) return [data.download];
    return [];
}

async function parseApiResponse(response, fallbackMessage) {
    let payload = null;

    try {
        payload = await response.json();
    } catch {
        payload = null;
    }

    if (response.ok) {
        return payload;
    }

    const error = new Error(
        payload?.message || payload?.error || fallbackMessage || 'A API retornou um erro.'
    );
    error.status = response.status;
    error.payload = payload;
    throw error;
}

async function requestDownloads(method, payload = null) {
    const requestOptions = {
        method,
        credentials: 'include',
        headers: payload ? { 'Content-Type': 'application/json' } : undefined,
        body: payload ? JSON.stringify(payload) : undefined,
        keepalive: method !== 'GET',
    };

    let lastError = null;

    for (const endpoint of DOWNLOADS_API_ENDPOINTS) {
        try {
            const response = await fetch(endpoint, requestOptions);
            return await parseApiResponse(response, 'Falha ao processar downloads.');
        } catch (error) {
            lastError = error;
            console.warn(`Falha ao acessar ${endpoint}:`, error);
        }
    }

    throw lastError || new Error('Nenhum endpoint de downloads respondeu com sucesso.');
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
    try {
        const response = await requestDownloads('POST', { action: 'create', download });
        const updatedDownloads = normalizeDownloadList(response);
        const downloads = updatedDownloads.length > 0 ? updatedDownloads : getCachedDownloads();
        saveCachedDownloads(downloads);
        return response && response.download ? response.download : downloads[0] || null;
    } catch (error) {
        console.warn('API de downloads indisponivel para cadastro. Usando armazenamento local.', error);
        return createLocalDownload(download);
    }
}

async function updateDownload(id, updatedData) {
    try {
        const response = await requestDownloads('PUT', { id, updatedData });
        const updatedDownloads = normalizeDownloadList(response);
        const downloads = updatedDownloads.length > 0 ? updatedDownloads : getCachedDownloads();
        saveCachedDownloads(downloads);
        return downloads.find((download) => String(download.id) === String(id)) || null;
    } catch (error) {
        console.warn('API de downloads indisponivel para edicao. Usando armazenamento local.', error);
        return updateLocalDownload(id, updatedData);
    }
}

async function deleteDownload(id) {
    try {
        const response = await requestDownloads('DELETE', { id });
        const updatedDownloads = normalizeDownloadList(response);
        const downloads = updatedDownloads.length > 0 ? updatedDownloads : getCachedDownloads();
        saveCachedDownloads(downloads);
        return true;
    } catch (error) {
        console.warn('API de downloads indisponivel para exclusao. Usando armazenamento local.', error);
        return deleteLocalDownload(id);
    }
}

async function incrementDownloadCount(id) {
    try {
        const response = await requestDownloads('POST', { action: 'increment', id });
        const updatedDownloads = normalizeDownloadList(response);
        const downloads = updatedDownloads.length > 0 ? updatedDownloads : getCachedDownloads();
        saveCachedDownloads(downloads);
    } catch (error) {
        console.warn('Nao foi possivel incrementar o contador via API. Usando armazenamento local.', error);
        incrementLocalDownloadCount(id);
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
