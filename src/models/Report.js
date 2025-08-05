const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  newsId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'News',
  },
  url: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  ip: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
});
//name with capital

module.exports = mongoose.model('Report', ReportSchema);
