const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    email : String,
    category : String,
    passage : String,
    date: () => Date.now(),
    read: Boolean
})

module.exports = mongoose.model('Contact', ContactSchema)