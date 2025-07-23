// models/EngineStatus.js
const mongoose = require('mongoose');

const EngineStatusSchema = new mongoose.Schema({
  status: { type: Boolean, default: false }, // موتور روشن یا خاموش
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EngineStatus', EngineStatusSchema);
