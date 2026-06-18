import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

livros = []
id_counter = 1

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/livros', methods=['GET'])
def listar_livros():
    termo = request.args.get('titulo', '').lower()
    if termo:
        filtrados = [l for l in livros if termo in l['titulo'].lower()]
        return jsonify(filtrados)
    return jsonify(livros)

@app.route('/api/livros', methods=['POST'])
def cadastrar_livro():
    global id_counter
    dados = request.get_json()
    if not dados or not dados.get('titulo') or not dados.get('autor'):
        return jsonify({'erro': 'Título e autor são obrigatórios'}), 400
    livro = {
        'id': id_counter,
        'titulo': dados['titulo'],
        'autor': dados['autor'],
        'imagem': dados.get('imagem', ''),
        'categoria': dados.get('categoria', ''),
        'descricao': dados.get('descricao', ''),
        'ano': dados.get('ano', ''),
        'avaliacao': dados.get('avaliacao', 0)
    }
    livros.append(livro)
    id_counter += 1
    return jsonify(livro), 201

@app.route('/api/livros/<int:livro_id>', methods=['PUT'])
def atualizar_livro(livro_id):
    dados = request.get_json()
    for livro in livros:
        if livro['id'] == livro_id:
            livro['titulo'] = dados.get('titulo', livro['titulo'])
            livro['autor'] = dados.get('autor', livro['autor'])
            livro['imagem'] = dados.get('imagem', livro['imagem'])
            livro['categoria'] = dados.get('categoria', livro['categoria'])
            livro['descricao'] = dados.get('descricao', livro['descricao'])
            livro['ano'] = dados.get('ano', livro['ano'])
            livro['avaliacao'] = dados.get('avaliacao', livro['avaliacao'])
            return jsonify(livro)
    return jsonify({'erro': 'Livro não encontrado'}), 404

@app.route('/api/livros/<int:livro_id>', methods=['DELETE'])
def remover_livro(livro_id):
    global livros
    livros = [l for l in livros if l['id'] != livro_id]
    return jsonify({'mensagem': 'Livro removido'}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)