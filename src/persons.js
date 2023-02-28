const mongoose = require('mongoose');

const password = process.env.MONGOPASSWORD;

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
      validator: (value) => /^(\d{2,3}-)?\d+$/.test(value),
      message: () => 'number must be a valid phone number',
    },
  },
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    /* eslint-disable no-param-reassign, no-underscore-dangle */
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    /* eslint-enable no-param-reassign, no-underscore-dangle */
  },
});

const Person = mongoose.model('Person', personSchema);

const init = () => mongoose.connect(url);

const close = async () => mongoose.connection.close();

const getAll = () => Person.find({});

const getInfo = async () => {
  const count = (await getAll()).length;
  const time = (new Date()).toString();
  return `<p>Phonebook has info on ${count} people</p><p>${time}</p>`;
};

const getById = (id) => Person.find({ _id: id });

const getByName = (name) => Person.find({ name });

const deleteById = async (id) => {
  const result = await Person.deleteOne({ _id: id });
  return result.deletedCount === 1;
};

const create = (person) => {
  const newPerson = new Person(person);
  return newPerson.save();
};

const update = (person) => Person.updateOne(
  { _id: person.id },
  { number: person.number },
  { runValidators: true },
);

module.exports = {
  init, getAll, getInfo, getById, deleteById, create, getByName, close, update,
};
