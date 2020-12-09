const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    sourceName : String,
    siteAddress : String,
    title : String,
    description : String,
    link : String,
    passage : String,
    date : Date,
    category : String
    
})

module.exports = mongoose.model('News', NewsSchema)