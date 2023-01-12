const data = require('./data.js');

const getAll = () => {
    return data;
}

const getInfo = () => {
    const count = data.length;
    const time = (new Date()).toString();
    return `<p>Phonebook has info on ${count} people</p><p>${time}</p>`;
}

const getById = (id) => {
    const found = data.find(entry => Number(entry.id) === Number(id));
    return found;
}

const getByName = (name) => {
    const found = data.find(entry => entry.name === name);
    return found;
}

const deleteById = (id) => {
    const found = data.findIndex(entry => Number(entry.id) === Number(id))
    if (found === -1) {
        return false;
    }
    data.splice(found, 1);
    return true;
}


const create = (person) => {
    const id = Math.round(Math.random() * 1000000);
    data.push({ ...person, id });
    return true;
}

module.exports = { getAll, getInfo, getById, deleteById, create, getByName };
