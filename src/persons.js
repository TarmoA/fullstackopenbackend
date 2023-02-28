const mongoose = require('mongoose');

const password = process.env['MONGOPASSWORD']

const url = `mongodb+srv://mongoapp:${password}@cluster0.ahyualj.mongodb.net/phonebook?retryWrites=true&w=majority`;

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true,
    },
    number: {
        type: String,
        minLength: 8,
        required: true,
        validate: {
            validator: (value) => {
                return /^(\d{2,3}-)?\d+$/.test(value);
            },
            message: () => 'number must be a valid phone number'
        }
    },
});

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Person = mongoose.model('Person', personSchema)

const init = () => {
    return mongoose.connect(url).catch(error => console.log(error))
}

const close = async () => {
    return mongoose.connection.close();
}

const getAll = () => {
    return Person.find({});
}

const getInfo = async () => {
    const count = (await getAll()).length;
    const time = (new Date()).toString();
    return `<p>Phonebook has info on ${count} people</p><p>${time}</p>`;
}

const getById = (id) => {
    return Person.find({'_id': id})
}

const getByName = (name) => {
    return Person.find({name})
}

const deleteById = async (id) => {
    const result = await Person.deleteOne({'_id': id});
    return result.deletedCount === 1;
}

const create = (person) => {
    const newPerson = new Person(person);
    return newPerson.save();
}

const update = (person) => {
    return Person.updateOne({ '_id': person.id }, { number: person.number }, { runValidators: true })
}

module.exports = { init, getAll, getInfo, getById, deleteById, create, getByName, close, update };
