const mongoose = require('mongoose');

const TimeinfoSchema = new mongoose.Schema({
    lastTimeFetch : Date
})

module.exports = mongoose.model('Timeinfo', TimeinfoSchema)