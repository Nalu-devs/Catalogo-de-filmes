const url = '/api/livros';
const form = document.getElementById('livroForm');
const listaLivros = document.getElementById('listaLivros');
const mensagem = document.getElementById('mensagem');
const campoBusca = document.getElementById('campoBusca');
const btnBuscar = document.getElementById('btnBuscar');
const btnCancelar = document.getElementById('btnCancelar');
const formTitulo = document.getElementById('formTitulo');
const livroIdInput = document.getElementById('livroId');

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;
    setTimeout(() => {
        mensagem.className = 'mensagem';
    }, 3000);
}

async function listarLivros() {
    try {
        const resposta = await fetch(url);
        const livros = await resposta.json();
        renderizarLivros(livros);
    } catch (erro) {
        mostrarMensagem('Erro ao carregar livros', 'erro');
    }
}

function renderizarLivros(livros) {
    if (livros.length === 0) {
        listaLivros.innerHTML = '<div class="lista-vazia">Nenhum livro encontrado</div>';
        return;
    }
    listaLivros.innerHTML = livros.map(livro => `
        <div class="livro-card">
            ${livro.imagem
                ? `<img src="${livro.imagem}" alt="${livro.titulo}" class="livro-imagem" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
                : ''
            }
            <div class="livro-imagem-placeholder" style="${livro.imagem ? 'display:none' : 'display:flex'}">📖</div>
            <div class="livro-info">
                <h3>${livro.titulo}</h3>
                <p class="autor">${livro.autor}</p>
                ${livro.categoria ? `<span class="categoria">${livro.categoria}</span>` : ''}
                ${livro.descricao ? `<p class="descricao">${livro.descricao}</p>` : ''}
                ${livro.ano ? `<p class="ano">📅 ${livro.ano}</p>` : ''}
                ${livro.avaliacao ? `<p class="avaliacao">${'★'.repeat(livro.avaliacao)}${'☆'.repeat(5 - livro.avaliacao)}</p>` : ''}
                <div class="livro-actions">
                    <button class="btn-editar" onclick="editarLivro(${livro.id})">Editar</button>
                    <button class="btn-excluir" onclick="deletarLivro(${livro.id})">Excluir</button>
                </div>
            </div>
        </div>
    `).join('');
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const livroId = livroIdInput.value;
    const dados = {
        titulo: document.getElementById('titulo').value,
        autor: document.getElementById('autor').value,
        imagem: document.getElementById('imagem').value,
        categoria: document.getElementById('categoria').value,
        descricao: document.getElementById('descricao').value,
        ano: document.getElementById('ano').value,
        avaliacao: document.getElementById('avaliacao').value
    };

    try {
        if (livroId) {
            await fetch(`${url}/${livroId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            mostrarMensagem('Livro atualizado com sucesso!', 'sucesso');
        } else {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            mostrarMensagem('Livro cadastrado com sucesso!', 'sucesso');
        }
        form.reset();
        livroIdInput.value = '';
        formTitulo.textContent = 'Cadastrar Livro';
        btnCancelar.style.display = 'none';
        listarLivros();
    } catch (erro) {
        mostrarMensagem('Erro ao salvar livro', 'erro');
    }
});

async function editarLivro(id) {
    try {
        const resposta = await fetch(url);
        const livros = await resposta.json();
        const livro = livros.find(l => l.id === id);
        if (!livro) return;

        document.getElementById('titulo').value = livro.titulo;
        document.getElementById('autor').value = livro.autor;
        document.getElementById('imagem').value = livro.imagem || '';
        document.getElementById('categoria').value = livro.categoria || '';
        document.getElementById('descricao').value = livro.descricao || '';
        document.getElementById('ano').value = livro.ano || '';
        document.getElementById('avaliacao').value = livro.avaliacao || '';
        livroIdInput.value = livro.id;
        formTitulo.textContent = 'Editar Livro';
        btnCancelar.style.display = 'inline-block';
        document.getElementById('titulo').focus();
    } catch (erro) {
        mostrarMensagem('Erro ao carregar dados do livro', 'erro');
    }
}

async function deletarLivro(id) {
    if (!confirm('Tem certeza que deseja excluir este livro?')) return;
    try {
        await fetch(`${url}/${id}`, { method: 'DELETE' });
        mostrarMensagem('Livro removido com sucesso!', 'sucesso');
        listarLivros();
    } catch (erro) {
        mostrarMensagem('Erro ao remover livro', 'erro');
    }
}

btnCancelar.addEventListener('click', () => {
    form.reset();
    livroIdInput.value = '';
    formTitulo.textContent = 'Cadastrar Livro';
    btnCancelar.style.display = 'none';
});

btnBuscar.addEventListener('click', async () => {
    const busca = campoBusca.value.trim();
    try {
        const resposta = await fetch(`${url}${busca ? `?titulo=${encodeURIComponent(busca)}` : ''}`);
        const livros = await resposta.json();
        renderizarLivros(livros);
        if (busca) {
            mostrarMensagem(`Busca por "${busca}" realizada.`, 'sucesso');
        }
    } catch (erro) {
        mostrarMensagem('Erro ao buscar livros', 'erro');
    }
});

campoBusca.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') btnBuscar.click();
});

listarLivros();