import os
import json
import urllib.request
import urllib.parse
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

TVMAZE_URL = 'https://api.tvmaze.com'
PAGINAS_TOTAIS = 4
cache_todas = None

def formatar_show(show):
    return {
        'id': show['id'],
        'titulo': show.get('name', ''),
        'sinopse': show.get('summary', ''),
        'imagem': show.get('image', {}).get('medium') if show.get('image') else None,
        'generos': show.get('genres', []),
        'ano': show.get('premiered', '')[:4] if show.get('premiered') else '',
        'avaliacao': show.get('rating', {}).get('average'),
        'status': show.get('status', ''),
        'idioma': show.get('language', ''),
        'tipo': show.get('type', ''),
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/series', methods=['GET'])
def buscar_series():
    query = request.args.get('q', '')
    if not query:
        return jsonify([])
    try:
        url = f'{TVMAZE_URL}/search/shows?q={urllib.parse.quote(query)}'
        with urllib.request.urlopen(url) as resp:
            data = json.loads(resp.read().decode())
        return jsonify([formatar_show(item['show']) for item in data])
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/series/todas', methods=['GET'])
def todas_series():
    global cache_todas
    if cache_todas is not None:
        return jsonify(cache_todas)
    todas = []
    for pagina in range(PAGINAS_TOTAIS):
        try:
            url = f'{TVMAZE_URL}/shows?page={pagina}'
            with urllib.request.urlopen(url, timeout=10) as resp:
                dados = json.loads(resp.read().decode())
                todas.extend(formatar_show(s) for s in dados)
        except Exception:
            break
    cache_todas = todas
    return jsonify(todas)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
