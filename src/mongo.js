const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('error: too few args')
    process.exit(1);
}
const password = process.argv[2]
const url =
    `mongodb+srv://mongoapp:${password}@cluster0.ahyualj.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})
const Person = mongoose.model('Person', personSchema)

function getAll() {
    Person.find({}).then(persons => {
        console.log('phonebook:')
        persons.forEach(person => {
            console.log(`${person.name} ${person.number}`);
        });
        mongoose.connection.close();
    });
}

function addPerson(name, number) {
    const newPerson = new Person({
        name,
        number
    })
    newPerson.save().then(result => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
}

if (process.argv.length === 3) {
    getAll();
} else if (process.argv.length === 5) {
    const name = process.argv[3];
    const number = process.argv[4];
    addPerson(name, number);
} else {
    console.log('Wrong arg count')
    mongoose.connection.close();
}
