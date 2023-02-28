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
    // open db connection
    await persons.init();
    next();
})

// error handler for any thrown errors
const errorHandler = (error, req, res, next) => {
    console.log('error handler')
    console.log(error)
    try {
        // close db connection
        persons.close();
    } catch {
    }
    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    }
    if (error.message === 'NotFound') {
        return res.status(404).send({ error: 'not found' })
    }
    if (error.message) {
        return res.status(400).send({ error: error.message })
    }
    return res.status(500).send({ error: 'server error' });
}

app.get('/info', async (request, response, next) => {
    try {
        const info = await persons.getInfo(request)
        response.send(info);
        persons.close();
    } catch (error) {
        next(error)
    }
})

app.get('/api/persons', async (request, response, next) => {
    try {
        const all = await persons.getAll()
        response.json(all);
        persons.close();
    } catch (error) {
        next(error)
    }
})
app.get('/api/persons/:id', async (request, response, next) => {
    try {
        const id = request.params.id
        const person = await persons.getById(id);
        if (!person.length) {
            throw new Error('NotFound');
        }
        response.json(person);
        persons.close();
    } catch (error) {
        next(error)
    }

})
app.delete('/api/persons/:id', async (request, response, next) => {
    try {
        const id = request.params.id
        const result = await persons.deleteById(id);
        if (!result) {
            throw new Error('NotFound');
        }
        persons.close();
        response.end();
    } catch (error) {
        next(error)
    }
});
app.post('/api/persons', async (request, response, next) => {
    try {
        const person = request.body;
        if (!person.name) {
            throw new Error('missing name')
        }
        if (!person.number) {
            throw new Error('missing number')
        }
        const found = await persons.getByName(person.name);
        if (found.length) {
            throw new Error('name must be unique')
        }
        const result = await persons.create(person);
        if (!result) {
            throw new Error();
        }
        persons.close();
        response.end();
    } catch (error) {
        next(error)
    }
})
app.put('/api/persons/:id', async (request, response, next) => {
    try {
        const person = request.body;
        person.id = request.params.id;
        if (!person.name) {
            throw new Error('missing name')
        }
        if (!person.number) {
            throw new Error('missing number')
        }
        const found = await persons.getById(person.id);
        if (!found.length) {
            throw new Error('person must exist')
        }
        const result = await persons.update(person);
        if (!result) {
            throw new Error();
        }
        persons.close();
        response.end();
    } catch (error) {
        next(error)
    }
})

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
