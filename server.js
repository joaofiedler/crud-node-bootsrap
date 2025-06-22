const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let trabalhos = [];
let contador = 1;

app.get('/', (req, res) => {
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Agenda Escolar</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="container mt-4">
        <h1 class="mb-4">Agenda Escolar</h1>

        <h2>Adicionar Trabalho</h2>
        <form action="/adicionar" method="POST" class="mb-4">
            <div class="mb-3">
                <label class="form-label">Título:</label>
                <input type="text" name="titulo" class="form-control" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Descrição:</label>
                <textarea name="descricao" class="form-control" required></textarea>
            </div>
            <div class="mb-3">
                <label class="form-label">Disciplina:</label>
                <input type="text" name="disciplina" class="form-control" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Data de Entrega:</label>
                <input type="date" name="dataEntrega" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary">Adicionar</button>
        </form>

        <h2>Filtrar por Disciplina</h2>
        <form action="/filtrar" method="GET" class="mb-4">
            <div class="mb-3">
                <select name="disciplina" class="form-select">
                    <option value="">Todas</option>`;
    const disciplinas = [...new Set(trabalhos.map(t => t.disciplina))];
    disciplinas.forEach(d => html += `<option value="${d}">${d}</option>`);
    html += `</select>
            </div>
            <button type="submit" class="btn btn-secondary">Filtrar</button>
        </form>`;

    if (trabalhos.length === 0) {
        html += '<div class="alert alert-info">Nenhum trabalho cadastrado.</div>';
    } else {
        html += `<table class="table table-striped">
            <thead><tr>
                <th>ID</th><th>Título</th><th>Descrição</th><th>Disciplina</th><th>Data</th><th>Ações</th>
            </tr></thead><tbody>`;
        trabalhos.forEach(t => {
            html += `<tr>
                <td>${t.id}</td>
                <td>${t.titulo}</td>
                <td>${t.descricao}</td>
                <td>${t.disciplina}</td>
                <td>${t.dataEntrega}</td>
                <td>
                    <a href="/editar/${t.id}" class="btn btn-sm btn-warning">Editar</a>
                    <a href="/excluir/${t.id}" onclick="return confirm('Tem certeza?')" class="btn btn-sm btn-danger">Excluir</a>
                </td>
            </tr>`;
        });
        html += `</tbody></table>`;
    }

    html += `</body></html>`;
    res.send(html);
});

app.post('/adicionar', (req, res) => {
    const { titulo, descricao, disciplina, dataEntrega } = req.body;
    trabalhos.push({ id: contador++, titulo, descricao, disciplina, dataEntrega });
    fs.writeFileSync('trabalhos.json', JSON.stringify(trabalhos, null, 2));
    res.redirect('/');
});

app.get('/filtrar', (req, res) => {
    const filtro = req.query.disciplina;
    const lista = filtro ? trabalhos.filter(t => t.disciplina === filtro) : trabalhos;
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Filtrar</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="container mt-4">
        <h1>Trabalhos ${filtro ? 'de ' + filtro : ''}</h1>
        <a href="/" class="btn btn-secondary mb-3">Voltar</a>
        <table class="table table-bordered">
            <thead><tr><th>ID</th><th>Título</th><th>Descrição</th><th>Data</th></tr></thead>
            <tbody>`;
    lista.forEach(t => {
        html += `<tr>
            <td>${t.id}</td>
            <td>${t.titulo}</td>
            <td>${t.descricao}</td>
            <td>${t.dataEntrega}</td>
        </tr>`;
    });
    html += `</tbody></table></body></html>`;
    res.send(html);
});

app.get('/editar/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const t = trabalhos.find(t => t.id === id);
    if (!t) return res.send('<div class="container mt-4"><div class="alert alert-danger">Trabalho não encontrado</div><a href="/" class="btn btn-secondary">Voltar</a></div>');

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Editar</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="container mt-4">
        <h1>Editar Trabalho</h1>
        <form action="/atualizar/${t.id}" method="POST" class="mb-4">
            <div class="mb-3">
                <label class="form-label">Título:</label>
                <input type="text" name="titulo" class="form-control" value="${t.titulo}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Descrição:</label>
                <textarea name="descricao" class="form-control" required>${t.descricao}</textarea>
            </div>
            <div class="mb-3">
                <label class="form-label">Disciplina:</label>
                <input type="text" name="disciplina" class="form-control" value="${t.disciplina}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Data:</label>
                <input type="date" name="dataEntrega" class="form-control" value="${t.dataEntrega}" required>
            </div>
            <button type="submit" class="btn btn-success">Salvar</button>
            <a href="/" class="btn btn-secondary">Cancelar</a>
        </form>
    </body>
    </html>`);
});

app.post('/atualizar/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { titulo, descricao, disciplina, dataEntrega } = req.body;
    const i = trabalhos.findIndex(t => t.id === id);
    if (i !== -1) {
        trabalhos[i] = { id, titulo, descricao, disciplina, dataEntrega };
        fs.writeFileSync('trabalhos.json', JSON.stringify(trabalhos, null, 2));
    }
    res.redirect('/');
});

app.get('/excluir/:id', (req, res) => {
    const id = parseInt(req.params.id);
    trabalhos = trabalhos.filter(t => t.id !== id);
    fs.writeFileSync('trabalhos.json', JSON.stringify(trabalhos, null, 2));
    res.redirect('/');
});

function carregar() {
    try {
        const data = fs.readFileSync('trabalhos.json', 'utf8');
        trabalhos = JSON.parse(data);
        contador = trabalhos.length > 0 ? Math.max(...trabalhos.map(t => t.id)) + 1 : 1;
    } catch {}
}

carregar();
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
    console.log('Para parar: Ctrl+C');
});