require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const persons = require('./persons.js');

const PORT = process.env['PORT'] || 3001
const app = express();

morgan.token('body', (req, res) => {
    if (req.body) {
        return JSON.stringify(req.body)
    }
    return '';
});

const tinyFormat = ':method :url :status :res[content-length] - :response-time ms';
app.use(cors());
app.use(morgan(`${tinyFormat} :body`));
app.use(express.static('build'));
app.use(express.json())
app.use(async (req, res, next) => {
    await persons.init();
    next();
})

app.get('/info', async (request, response) => {
    const info = await persons.getInfo(request)
    response.send(info);
    persons.close();
})

app.get('/api/persons', async (request, response) => {
    const all = await persons.getAll()
    response.json(all);
    persons.close();
})
app.get('/api/persons/:id', async (request, response) => {
    const id = request.params.id
    const person = await persons.getById(id);
    if (!person) {
        response.status(404).send('Not found');
        return;
    }
    response.json(person);
    persons.close();

})
app.delete('/api/persons/:id', async (request, response) => {
    const id = request.params.id
    const result = await persons.deleteById(id);
    if (!result) {
        response.status(404).send('Not found');
        return;
    }
    persons.close();
    response.end();
});
app.post('/api/persons', async (request, response) => {
    const person = request.body;
    if (!person.name) {
        response.status(400).json({ error: 'missing name' });
        return;
    }
    if (!person.number) {
        response.status(400).json({ error: 'missing number' });
        return;
    }
    const found = await persons.getByName(person.name);
    if (found.length) {
        response.status(400).json({ error: 'name must be unique' });
        return;
    }
    const result = await persons.create(person);
    if (!result) {
        response.status(500).send('Server error');
        return;
    }
    persons.close();
    response.end();
})


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
