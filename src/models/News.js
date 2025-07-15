const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    sourceName : String,
    siteAddress : String,
    title : String,
    description : String,
    summary:  String,
    link : String,
    passage : String,
    date : Date,
    fetchDate : Date,
    category : String,
    categoryEn: String,
    subCategory : String,
    subCategoryEn : String,
    views: Number,
    imageUrl: {
        type: String,
        default: null, // اگر enclosure نبود، مقدار null ذخیره میشه
      },
})

module.exports = mongoose.model('News', NewsSchema)