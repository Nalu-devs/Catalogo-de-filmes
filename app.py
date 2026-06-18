import os
import json
import urllib.request
import urllib.parse
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

TVMAZE_URL = 'https://api.tvmaze.com'

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
        resultados = []
        for item in data:
            show = item['show']
            resultados.append({
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
            })
        return jsonify(resultados)
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
