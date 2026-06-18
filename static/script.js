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
                ${serie.sinopse ? `<p class="serie-sinopse">${serie.sinopse.replace(/<[^>]*>/g, '')}</p>` : ''}
                <div class="serie-meta">
                    ${serie.avaliacao ? `<span class="serie-avaliacao">${'★'.repeat(Math.round(serie.avaliacao / 2))}${'☆'.repeat(5 - Math.round(serie.avaliacao / 2))} ${serie.avaliacao}/10</span>` : ''}
                    ${serie.status ? `<span class="serie-status">${serie.status}</span>` : ''}
                    ${serie.idioma ? `<span class="serie-idioma">${serie.idioma}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

async function buscarSeries(query) {
    if (!query.trim()) {
        mostrarMensagem('Digite um nome para buscar', 'erro');
        return;
    }
    try {
        const url = `/api/series?q=${encodeURIComponent(query.trim())}`;
        const resposta = await fetch(url);
        if (!resposta.ok) {
            const err = await resposta.json();
            throw new Error(err.erro || 'Erro na busca');
        }
        const series = await resposta.json();
        renderizarSeries(series);
        if (series.length > 0) {
            mostrarMensagem(`${series.length} série(s) encontrada(s) para "${query}"`, 'sucesso');
        } else {
            mostrarMensagem(`Nenhuma série encontrada para "${query}"`, 'erro');
        }
    } catch (erro) {
        mostrarMensagem(`Erro ao buscar séries: ${erro.message}`, 'erro');
    }
}

btnBuscar.addEventListener('click', () => buscarSeries(campoBusca.value));

campoBusca.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') btnBuscar.click();
});

campoBusca.focus();
