const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {type:String},
    email: {type:String},
    website: {type:String},
    entryDate: {type:Date, default:Date.now}
})

const contactSchema = new Schema({
    email: {type:String,},
    website: {type:String,},
    message: {type:String,},
    entryDate: {type:Date, default:Date.now}
})

const Users = mongoose.model('Users', userSchema, 'users')
const Contact = mongoose.model('Contact', contactSchema, 'contact_form')

//exporting Schemas
const mySchemas = {'Users':Users, 'Contact':Contact}

module.exports = mySchemas