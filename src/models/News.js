const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    shortId: { type: String, unique: true, required: true }, // nanoid کوتاه
    sourceName : String,
    siteAddress : String,
    title : String,
    description : String,
    // summary:  String,
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

NewsSchema.index({ title: 'text', description: 'text', passage: 'text' });

module.exports = mongoose.model('News', NewsSchema)