const mongoose = require('mongoose');

const SourceSchema = new mongoose.Schema({
    sourceName : String,
    siteAddress : String,
    //rssURL : { type: String, required: true, unique: true }, 
    rssURL: String,
    tagClassName : String,
    secondTag : String,
    isLocalImg : Boolean,
    isCategorized : Boolean,
    category : String,
    lastTimeFetch: Date
})

module.exports = mongoose.model('Source', SourceSchema)