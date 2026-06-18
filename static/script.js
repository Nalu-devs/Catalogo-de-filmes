let todasSeries = [];
let filtrados = [];

const campoBusca = document.getElementById('campoBusca');
const btnBuscar = document.getElementById('btnBuscar');
const listaSeries = document.getElementById('listaSeries');
const mensagem = document.getElementById('mensagem');

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;
    setTimeout(() => {
        mensagem.className = 'mensagem';
    }, 3000);
}

function renderizarSeries(series) {
    if (series.length === 0) {
        listaSeries.innerHTML = '<div class="lista-vazia">Nenhuma série encontrada</div>';
        return;
    }
    listaSeries.innerHTML = series.map(serie => `
        <div class="serie-card">
            <div class="serie-imagem-container">
                ${serie.imagem
                    ? `<img src="${serie.imagem}" alt="${serie.titulo}" class="serie-imagem">`
                    : `<div class="serie-imagem-placeholder">?</div>`
                }
            </div>
            <div class="serie-info">
                <h3>${serie.titulo}</h3>
                ${serie.ano ? `<p class="serie-ano">${serie.ano}</p>` : ''}
                ${serie.generos.length ? `<div class="serie-generos">${serie.generos.map(g => `<span class="genero-tag">${g}</span>`).join('')}</div>` : ''}
                ${serie.sinopse ? `<p class="serie-sinopse">${serie.sinopse.replace(/<[^>]*>/g, '').slice(0, 200)}${serie.sinopse.replace(/<[^>]*>/g, '').length > 200 ? '...' : ''}</p>` : ''}
                <div class="serie-meta">
                    ${serie.avaliacao ? `<span class="serie-avaliacao">${'★'.repeat(Math.round(serie.avaliacao / 2))}${'☆'.repeat(5 - Math.round(serie.avaliacao / 2))} ${serie.avaliacao}/10</span>` : ''}
                    ${serie.status ? `<span class="serie-status">${serie.status}</span>` : ''}
                    ${serie.idioma ? `<span class="serie-idioma">${serie.idioma}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function filtrarSeries(termo) {
    if (!termo.trim()) {
        filtrados = [...todasSeries];
    } else {
        const t = termo.toLowerCase().trim();
        filtrados = todasSeries.filter(serie =>
            serie.titulo.toLowerCase().includes(t)
        );
    }
    renderizarSeries(filtrados);
    const total = todasSeries.length;
    const exibindo = filtrados.length;
    if (total > 0) {
        mostrarMensagem(`Exibindo ${exibindo} de ${total} séries`, 'sucesso');
    }
}

async function carregarTodas() {
    try {
        listaSeries.innerHTML = '<div class="lista-vazia">Carregando catálogo...</div>';
        const resposta = await fetch('/api/series/todas');
        if (!resposta.ok) throw new Error('Erro ao carregar');
        todasSeries = await resposta.json();
        filtrarSeries('');
    } catch (erro) {
        mostrarMensagem(`Erro ao carregar séries: ${erro.message}`, 'erro');
        listaSeries.innerHTML = '<div class="lista-vazia">Erro ao carregar catálogo. Tente recarregar a página.</div>';
    }
}

btnBuscar.addEventListener('click', () => filtrarSeries(campoBusca.value));

campoBusca.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') btnBuscar.click();
});

campoBusca.addEventListener('input', () => {
    if (campoBusca.value.trim() === '') {
        filtrarSeries('');
    }
});

carregarTodas();
