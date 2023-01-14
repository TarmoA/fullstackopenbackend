const express = require('express');
const morgan = require('morgan');
const persons = require('./persons.js');

const PORT = 3001
const app = express();

morgan.token('body', (req, res) => {
    if (req.body) {
        return JSON.stringify(req.body)
    }
    return '';
});

const tinyFormat = ':method :url :status :res[content-length] - :response-time ms';
app.use(morgan(`${tinyFormat} :body`));
app.use(express.json())



app.get('/info', (request, response) => {
    response.send(persons.getInfo(request));
})

app.get('/api/persons', (request, response) => {
    response.json(persons.getAll());
})
app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.getById(id);
    if (!person) {
        response.status(404).send('Not found');
        return;
    }
    response.json(person);
})
app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const result = persons.deleteById(id);
    if (!result) {
        response.status(404).send('Not found');
        return;
    }
    response.end();
})
app.post('/api/persons', (request, response) => {
    const person = request.body;
    if (!person.name) {
        response.status(400).json({ error: 'missing name' });
        return;
    }
    if (!person.number) {
        response.status(400).json({ error: 'missing number' });
        return;
    }
    if (persons.getByName(person.name)) {
        response.status(400).json({ error: 'name must be unique' });
        return;
    }
    const result = persons.create(person);
    if (!result) {
        response.status(500).send('Server error');
        return;
    }
    response.end();
})


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
