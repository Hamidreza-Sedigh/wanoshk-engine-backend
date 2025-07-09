const mongoose = require('mongoose');

const SourceSchema = new mongoose.Schema({
    sourceName : String,
    sourceNameEn : String,
    siteAddress : String,
    rssURL : { type: String, required: true, unique: true }, 
    tagClassName : String,
    secondTag : String,
    isLocalImg : Boolean,
    isCategorized : Boolean,
    category : String,
    categoryEn: String,
    isSubCategorized : Boolean,
    subCategory : String,
    subCategoryEn : String,
    lastTimeFetch: Date,
    status: String,
    enable: Boolean,
    removeTags: [String],
    cutAfter: String
})

module.exports = mongoose.model('Source', SourceSchema)